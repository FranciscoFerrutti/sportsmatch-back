import { MercadoPagoConfig, MerchantOrder, PaymentRefund, Preference } from 'mercadopago';
import PaymentPersistence from '../database/persistence/payment.persistence';
import ReservationsService from './reservations.service';
import { PaymentStatus } from '../constants/payment.constants';
import GenericException from '../exceptions/generic.exception';
import NotFoundException from '../exceptions/notFound.exception';
import { HTTP_STATUS } from '../constants/http.constants';
import { OrganizerType } from "../constants/event.constants";
import axios from 'axios';
import RefundPersistence from '../database/persistence/refund.persistence';
import {MailService} from "./mail.service";

export class PaymentService {
    private static instance: PaymentService;
    private readonly client: MercadoPagoConfig;
    private preference: Preference;
    private merchantOrder: MerchantOrder;
    private refund: PaymentRefund;
    private paymentPersistence: PaymentPersistence;
    private reservationService: ReservationsService;
    private refundPersistence: RefundPersistence;

    constructor(reservationService: ReservationsService) {
        const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
        if (!token) throw new GenericException({status: HTTP_STATUS.SERVER_ERROR, message: "mercado pago token not defined", internalStatus: "BAD_CONFIGURATION"});
        
        this.client = new MercadoPagoConfig({
            accessToken: token,
            options: { timeout: 5000 }
        });
        this.preference = new Preference(this.client);
        this.merchantOrder = new MerchantOrder(this.client);
        this.refund = new PaymentRefund(this.client);
        this.paymentPersistence = new PaymentPersistence();
        this.reservationService = reservationService;
        this.refundPersistence = new RefundPersistence();
    }

    public static getInstance(reservationService: ReservationsService): PaymentService {
        if (!this.instance) {
            this.instance = new PaymentService(reservationService);
        }
        return this.instance;
    }

    async createPreference(userId: number, reservationId: number): Promise<{init_point: string}> {
        const reservation = await this.reservationService.findReservationWithOwnerDetails(reservationId);

        if (reservation.event.userOwner?.id !== userId) {
            throw new GenericException({
                status: HTTP_STATUS.FORBIDDEN,
                message: "Only the event owner can make the payment",
                internalStatus: "NOT_EVENT_OWNER"
            });
        }

        const existingPayment = await this.paymentPersistence.findApprovedPaymentByReservationId(reservationId);
        if (existingPayment) {
            throw new GenericException({
                status: HTTP_STATUS.CONFLICT,
                message: "Reservation already has an approved payment",
                internalStatus: "PAYMENT_ALREADY_APPROVED"
            });
        }

        if(!reservation.isConfirmed()){
            throw new GenericException({
                status: HTTP_STATUS.BAD_REQUEST,
                message: "Reservation is not confirmed",
                internalStatus: "RESERVATION_NOT_CONFIRMED"
            });
        }

        const paymentRecord = await this.paymentPersistence.createPayment({
            transactionStatus: PaymentStatus.PENDING,
            transactionDate: new Date(),
            transactionAmount: reservation.cost,
            reservationId
        });

        const preference = await this.preference.create({
            body: {
                items: [{
                    id: reservation.id.toString(),
                    title: `Reserva #${reservation.id}`,
                    quantity: 1,
                    currency_id: 'ARS',
                    unit_price: parseFloat(reservation.cost.toString()),
                }],
                external_reference: paymentRecord.id.toString(),
                payment_methods: {
                    installments: 1,
                }
            }
        })

        if (!preference.init_point) {
            await this.paymentPersistence.rejectPayment(paymentRecord.id);

            throw new GenericException({
                status: HTTP_STATUS.SERVICE_UNAVAILABLE,
                message: "Invalid payment response from MercadoPago",
                internalStatus: "INVALID_MP_RESPONSE"
            });
        }

        return {init_point: preference.init_point};
    }

    async processWebhook(notification: any) {
        if (notification.type !== 'topic_merchant_order_wh' || notification.status !== 'closed') {
            return;
        }

        const order = await this.merchantOrder.get({merchantOrderId: notification.id});

        if (order.status !== 'closed') {
            return;
        }

        const paymentId = parseInt(order.external_reference!, 10);
        const payment = await this.paymentPersistence.findPaymentById(paymentId);

        if (payment === null) {
            throw new GenericException({
                status: HTTP_STATUS.NOT_FOUND,
                message: 'External reference not found',
                internalStatus: 'PAYMENT_NOT_FOUND',
            });
        }

        await this.paymentPersistence.approvePayment(paymentId, order.id!);

        const reservationId = payment.reservationId;
        const reservation = await this.reservationService.findReservation(reservationId)


        await this.reservationService.completeReservation(reservationId);
        await MailService.sendReservationCompleted(reservation.event.userOwner.email, reservationId, reservation.field.club.name, reservation.event.schedule.getDate().toString(), (reservation.event.schedule.getMonth()+1).toString(),reservation.event.schedule.getHours().toString());
        await MailService.sendClubReservationCompleted(reservation.field.club.email, reservationId, reservation.field.name, reservation.event.schedule.getDate().toString(), (reservation.event.schedule.getMonth()+1).toString(),reservation.event.schedule.getHours().toString(), reservation.cost / 2);
    }

    async getPaymentsByReservationId(reservationId: number, userId: number) {
        const reservation = await this.reservationService.findReservationWithOwner(reservationId);
        
        if (reservation.event.organizerType !== OrganizerType.USER || 
            reservation.event.ownerId !== userId) {
            throw new GenericException({
                status: HTTP_STATUS.FORBIDDEN,
                message: "User is not authorized to view these payments",
                internalStatus: "UNAUTHORIZED_ACCESS"
            });
        }
        
        return await this.paymentPersistence.findByReservationId(reservationId);
    }

    async getPaymentStatusForClub(reservationId: number, clubId: number) {
        const reservation = await this.reservationService.findReservationWithOwnerDetails(reservationId);
        
        if (!reservation) {
            throw new NotFoundException("Reservation");
        }
        
        if (reservation.field?.club?.id !== clubId) {
            throw new GenericException({
                status: HTTP_STATUS.FORBIDDEN,
                message: "Club is not authorized to view this payment status",
                internalStatus: "UNAUTHORIZED_ACCESS"
            });
        }

        const payment = await this.paymentPersistence.findApprovedPaymentByReservationId(reservationId);

        if (!reservation.event.userOwner) {
            throw new GenericException({
                status: HTTP_STATUS.NOT_FOUND,
                message: "User owner information not found",
                internalStatus: "USER_OWNER_NOT_FOUND"
            });
        }

        return {
            reservationId: reservation.id,
            isPaid: !!payment,
            paymentDate: payment?.transactionDate || null,
            amount: payment?.transactionAmount || reservation.getCost(),
            owner: {
                name: `${reservation.event.userOwner.firstname} ${reservation.event.userOwner.lastname}`,
                phoneNumber: reservation.event.userOwner.phone_number
            }
        };
    }

    async refundPayment(reservationId: number) {
        try {
            const payment = await this.paymentPersistence.findApprovedPaymentByReservationId(reservationId);

            if (!payment) {
                throw new NotFoundException("Payment");
            }

            console.log("Refunding payment of reservation: ", reservationId);

            const order = await this.merchantOrder.get({merchantOrderId: payment.mpId!});
            for (const orderPayment of order.payments!) {
                const response = await this.refund.create({payment_id: orderPayment.id!});
                console.log("Response from MP: ", response);
            }

            const refundData = {
                refundId: order.id!,
                paymentId: payment.id!,
                dateCreated: new Date(),
                amountRefunded: order.total_amount!,
            };

            return await this.refundPersistence.createRefund(refundData);
        } catch (error) {
            console.error('Error Details:', error.response ? error.response.data : error.message);
            throw new GenericException({
                status: HTTP_STATUS.SERVICE_UNAVAILABLE,
                message: "Error processing refund",
                internalStatus: "REFUND_PROCESSING_ERROR"
            });
        }
    }

    async getPaymentAndRefundInfoByReservationId(reservationId: number): Promise<{
        isPaid: boolean;
        paymentDate: Date | null;
        paymentAmount: number | null;
        isRefunded: boolean;
        refundDate: Date | null;
        refundAmount: number | null;
    }> {
        const payment = await this.paymentPersistence.findApprovedPaymentByReservationId(reservationId);
        
        if (!payment) {
            return {
                isPaid: false,
                paymentDate: null,
                paymentAmount: null,
                isRefunded: false,
                refundDate: null,
                refundAmount: null
            };
        }
        
        // Check for refund
        const refund = payment ? await this.refundPersistence.findRefundByPaymentId(payment.id) : null;
        
        return {
            isPaid: true,
            paymentDate: payment.transactionDate,
            paymentAmount: payment.transactionAmount,
            isRefunded: !!refund,
            refundDate: refund?.dateCreated || null,
            refundAmount: refund?.amountRefunded || null
        };
    }
} 
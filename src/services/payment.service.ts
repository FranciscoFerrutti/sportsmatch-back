import { MercadoPagoConfig, Payment as MPPayment } from 'mercadopago';
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
    private payment: MPPayment;
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
        this.payment = new MPPayment(this.client);
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

    async processPayment(userId: number, reservationId: number, paymentData: any) {
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

        if(reservation.getCost() !== paymentData.transaction_amount){
            throw new GenericException({
                status: HTTP_STATUS.BAD_REQUEST,
                message: "Transaction amount does not match reservation cost",
                internalStatus: "TRANSACTION_AMOUNT_MISMATCH"
            });
        }

        try {
            const mpResponse = await this.payment.create({ body: paymentData });

            if (!mpResponse.id || !mpResponse.status || !mpResponse.date_created || !mpResponse.transaction_amount) {
                throw new GenericException({
                    status: HTTP_STATUS.SERVICE_UNAVAILABLE,
                    message: "Invalid payment response from MercadoPago",
                    internalStatus: "INVALID_MP_RESPONSE"
                });
            }

            const paymentRecord = await this.paymentPersistence.createPayment({
                mpId: mpResponse.id,
                transactionStatus: this.mapMPStatus(mpResponse.status),
                transactionDate: new Date(mpResponse.date_created),
                transactionAmount: mpResponse.transaction_amount,
                reservationId
            });

            if (paymentRecord.transactionStatus === PaymentStatus.APPROVED) {
                await this.reservationService.completeReservation(reservationId);
                await MailService.sendReservationCompleted(reservation.event.userOwner.email, reservationId, reservation.field.club.name, reservation.event.schedule.toString());
                await MailService.sendClubReservationCompleted(reservation.field.club.email, reservationId, reservation.field.name, reservation.event.schedule.toString(), paymentRecord.transactionAmount);
            }

            return paymentRecord;

        } catch (error) {
            throw new GenericException({
                status: HTTP_STATUS.SERVICE_UNAVAILABLE,
                message: "Error processing payment",
                internalStatus: "PAYMENT_PROCESSING_ERROR"
            });
        }
    }

    private mapMPStatus(mpStatus: string): PaymentStatus {
        switch (mpStatus) {
            case 'approved':
                return PaymentStatus.APPROVED;
            case 'rejected':
                return PaymentStatus.REJECTED;
            default:
                return PaymentStatus.PENDING;
        }
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
            console.log(payment.mpId)

            const response = await axios.post(`https://api.mercadopago.com/v1/payments/${payment.mpId}/refunds`, {}, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${process.env.MERCADO_PAGO_ACCESS_TOKEN}`,
                    'X-Idempotency-Key': `${payment.id}-${Date.now()}`
                }
            });
            console.log("es problema de mercado pago")
            console.log(response)
            console.log(response.status)
            console.log(response.headers)
            console.log(response.data)

            if (!response || response.status !== 201) {
                throw new GenericException({
                    status: HTTP_STATUS.SERVICE_UNAVAILABLE,
                    message: "Failed to process refund",
                    internalStatus: "REFUND_PROCESSING_ERROR"
                });
            }


            const refundData = {
                refundId: response.data.id,
                paymentId: payment.id,
                dateCreated: new Date(response.data.date_created),
                amountRefunded: response.data.amount_refunded_to_payer
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
} 
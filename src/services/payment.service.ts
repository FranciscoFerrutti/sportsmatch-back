import { MercadoPagoConfig, Payment as MPPayment } from 'mercadopago';
import PaymentPersistence from '../database/persistence/payment.persistence';
import ReservationsService from './reservations.service';
import { PaymentStatus } from '../constants/payment.constants';
import GenericException from '../exceptions/generic.exception';
import NotFoundException from '../exceptions/notFound.exception';
import { HTTP_STATUS } from '../constants/http.constants';
import { OrganizerType } from "../constants/event.constants";

export class PaymentService {
    private static instance: PaymentService;
    private client: MercadoPagoConfig;
    private payment: MPPayment;
    private paymentPersistence: PaymentPersistence;
    private reservationService: ReservationsService;

    constructor() {
        const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
        if (!token) throw new GenericException({status: HTTP_STATUS.SERVER_ERROR, message: "mercado pago token not defined", internalStatus: "BAD_CONFIGURATION"});
        
        this.client = new MercadoPagoConfig({
            accessToken: token,
            options: { timeout: 5000 }
        });
        this.payment = new MPPayment(this.client);
        this.paymentPersistence = new PaymentPersistence();
        this.reservationService = ReservationsService.getInstance();
    }

    public static getInstance(): PaymentService {
        if (!this.instance) {
            this.instance = new PaymentService();
        }
        return this.instance;
    }

    async processPayment(reservationId: number, paymentData: any) {
        const reservation = await this.reservationService.findReservation(reservationId);

        //TODO: CHECK USER OWNER

        //TODO: CHANGE TRANSACTION AMOUNT

        // Check if there's already an approved payment
        // const existingPayment = await this.paymentPersistence.findApprovedPaymentByReservationId(reservationId);
        // if (existingPayment) {
        //     throw new GenericException({
        //         status: HTTP_STATUS.CONFLICT,
        //         message: "Reservation already has an approved payment",
        //         internalStatus: "PAYMENT_ALREADY_APPROVED"
        //     });
        // }

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
} 
import { MercadoPagoConfig, Payment as MPPayment } from 'mercadopago';
import PaymentPersistence from '../database/persistence/payment.persistence';
import ReservationsService from './reservations.service';
import { PaymentStatus } from '../database/models/Payment.model';
import GenericException from '../exceptions/generic.exception';
import { HTTP_STATUS } from '../constants/http.constants';

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
} 
import { PaymentStatus } from '../../constants/payment.constants';
import Payment from "../models/Payment.model";
import { Transaction } from "sequelize";

export default class PaymentPersistence {
    async findApprovedPaymentByReservationId(reservationId: number): Promise<Payment | null> {
        return Payment.findOne({
            where: {
                reservationId,
                transactionStatus: PaymentStatus.APPROVED
            }
        });
    }

    async createPayment(paymentData: {
        mpId: number;
        transactionStatus: PaymentStatus;
        transactionDate: Date;
        transactionAmount: number;
        reservationId: number;
    }): Promise<Payment> {
        return Payment.create(paymentData);
    }

    async findByReservationId(reservationId: number): Promise<Payment[]> {
        return Payment.findAll({
            where: { reservationId },
            order: [['created_at', 'DESC']]
        });
    }
} 
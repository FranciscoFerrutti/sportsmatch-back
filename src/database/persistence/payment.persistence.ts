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
        transactionStatus: PaymentStatus;
        transactionDate: Date;
        transactionAmount: number;
        reservationId: number;
    }): Promise<Payment> {
        return await Payment.create(paymentData);
    }

    async approvePayment(paymentId: number, mpId: number) {
        await Payment.update({ transactionStatus: PaymentStatus.APPROVED, mpId }, { where: { id: paymentId } });
    }

    async rejectPayment(paymentId: number) {
        await Payment.update({ transactionStatus: PaymentStatus.REJECTED }, { where: { id: paymentId } });
    }

    async findByReservationId(reservationId: number): Promise<Payment[]> {
        return Payment.findAll({
            where: { reservationId },
            order: [['created_at', 'DESC']]
        });
    }

    async findPaymentById(paymentId: number): Promise<Payment | null> {
        return Payment.findOne({
            where: { id: paymentId }
        });
    }
} 
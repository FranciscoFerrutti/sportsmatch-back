import Refund from '../models/Refund.model';

export default class RefundPersistence {
    async createRefund(refundData: {
        refundId: number;
        paymentId: number;
        dateCreated: Date;
        amountRefunded: number;
    }): Promise<Refund> {
        return Refund.create(refundData);
    }

    async findRefundById(refundId: number): Promise<Refund | null> {
        return Refund.findOne({
            where: { refundId }
        });
    }
} 
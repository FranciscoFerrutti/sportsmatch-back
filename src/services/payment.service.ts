import { MercadoPagoConfig, Payment } from 'mercadopago';
import GenericException from '../exceptions/generic.exception';
import { HTTP_STATUS } from '../constants/http.constants';

export class PaymentService {
    private static instance: PaymentService;
    private client: MercadoPagoConfig;
    private payment: Payment;

    constructor() {
        const token = process.env.MERCADO_PAGO_ACCESS_TOKEN;
        if (!token) throw new GenericException({status: HTTP_STATUS.SERVER_ERROR, message: "mercado pago token not defined", internalStatus: "BAD_CONFIGURATION"});
        
        this.client = new MercadoPagoConfig({
            accessToken: token,
            options: { timeout: 5000 }
        });
        this.payment = new Payment(this.client);
    }

    public static getInstance(): PaymentService {
        if (!this.instance) {
            this.instance = new PaymentService();
        }
        return this.instance;
    }

    async processPayment(paymentData: any) {
        try {
            const result = await this.payment.create({ body: paymentData });
            return result;
        } catch (error) {
            throw new GenericException({status: HTTP_STATUS.SERVICE_UNAVAILABLE, message: "error from mercado pago server", internalStatus: "PAYMENT_ERROR"});
        }
    }
} 
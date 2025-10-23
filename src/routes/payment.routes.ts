import { Router } from 'express';
import { urlencoded } from 'body-parser';
import userAuthMiddleware from "../middlewares/jwt.middleware";
import clubAuthMiddleware from "../middlewares/clubauth.middleware";
import PaymentController from "../controllers/payment.controller";
import MpWebhookMiddleware from '../middlewares/mpWebhook.middleware';

export default class PaymentRoutes{
    public router: Router = Router({ mergeParams: true });
    private readonly controller: PaymentController = new PaymentController();

    constructor() {
        this.init();
    }

    public init(): void {
        this.router.use(urlencoded({ extended: true }));
        // this.router.use(cors());

        this.router.post('/mp-webhook', MpWebhookMiddleware, this.controller.processWebhook);
        this.router.post('/', userAuthMiddleware, this.controller.createPreference);
        this.router.get('/:reservationId', userAuthMiddleware, this.controller.getPaymentsByReservationId);
        this.router.get('/club/:reservationId/status', clubAuthMiddleware, this.controller.getPaymentStatusForClub);
        this.router.post('/:paymentId/refund', userAuthMiddleware, this.controller.refundPayment);
    }
}
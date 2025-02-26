import { Router } from 'express';
import { urlencoded } from 'body-parser';
import userAuthMiddleware from "../middlewares/jwt.middleware";
import clubAuthMiddleware from "../middlewares/clubauth.middleware";
import PaymentController from "../controllers/payment.controller";

export default class PaymentRoutes{
    public router: Router = Router({ mergeParams: true });
    private readonly controller: PaymentController = new PaymentController();

    constructor() {
        this.init();
    }

    public init(): void {
        this.router.use(urlencoded({ extended: true }));
        // this.router.use(cors());

        // TODO: ADD AUTH TO POST
        this.router.post('/:reservationId/process_payment', this.controller.addPayment);
        this.router.get('/:reservationId', userAuthMiddleware, this.controller.getPaymentsByReservationId);
        this.router.get('/club/:reservationId/status', clubAuthMiddleware, this.controller.getPaymentStatusForClub);
    }
}
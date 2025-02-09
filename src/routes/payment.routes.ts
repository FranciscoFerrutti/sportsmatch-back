import { Router } from 'express';
import { urlencoded } from 'body-parser';
import userBasicAuthMiddleware from "../middlewares/basic.middleware";
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

        this.router.post('/process_payment', this.controller.addPayment);
    }
}
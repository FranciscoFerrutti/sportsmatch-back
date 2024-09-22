import { Router } from 'express';
import { urlencoded } from 'body-parser';
import cors from 'cors';
import HealthController from '../controllers/health.controller';

// Health routes is just for checking service is responsive
export default class HealthRoutes {
    public router: Router = Router({ mergeParams: true });
    private readonly controller: HealthController = new HealthController();

    constructor() {
        this.init();
    }

    public init(): void {
        this.router.use(urlencoded({ extended: true }));
        this.router.use(cors());

        this.router.post('/', this.controller.healthCheck);
        this.router.get('/', this.controller.healthCheck);
    }
}

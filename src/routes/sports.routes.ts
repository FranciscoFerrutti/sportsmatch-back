import { Router } from 'express';
import { urlencoded } from 'body-parser';
import cors from 'cors';
import SportsController from '../controllers/sports.controller';

export default class SportsRoutes {
    public router: Router = Router({ mergeParams: true });
    private readonly controller: SportsController = new SportsController();

    constructor() {
        this.init();
    }

    public init(): void {
        this.router.use(urlencoded({ extended: true }));
        this.router.use(cors());

        this.router.get('/', this.controller.getSports);
    }
}

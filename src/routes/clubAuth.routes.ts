import { Router } from 'express';
import { urlencoded } from 'body-parser';
import cors from 'cors';
import ClubAuthController from '../controllers/clubAuth.controller';
import userBasicAuthMiddleware from '../middlewares/basic.middleware';


export default class ClubAuthRoutes {
    public router: Router = Router({ mergeParams: true });
    private readonly controller: ClubAuthController = new ClubAuthController();

    constructor() {
        this.init();
    }

    public init(): void {
        this.router.use(urlencoded({ extended: true }));
        this.router.use(cors());

        this.router.post('/', this.controller.createAuth);
        this.router.post('/verify', this.controller.verifyEmail);
        this.router.get('/', userBasicAuthMiddleware, this.controller.login);
    }
}
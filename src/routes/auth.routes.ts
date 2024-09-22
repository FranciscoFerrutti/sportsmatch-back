
import { Router } from 'express';
import { urlencoded } from 'body-parser';
import cors from 'cors';
import AuthController from '../controllers/auth.controller';
import userBasicAuthMiddleware from '../middlewares/basic.middleware';

export default class AuthRoutes {
    public router: Router = Router({ mergeParams: true });
    private readonly controller: AuthController = new AuthController();

    constructor() {
        this.init();
    }

    public init(): void {
        this.router.use(urlencoded({ extended: true }));
        this.router.use(cors());

        this.router.post('/', this.controller.createAuth);
        this.router.get('/', userBasicAuthMiddleware, this.controller.login);
    }
}

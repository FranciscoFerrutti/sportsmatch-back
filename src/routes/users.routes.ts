
import { Router } from 'express';
import { urlencoded } from 'body-parser';
import cors from 'cors';
import UsersController from '../controllers/users.controller';
import userAuthMiddleware from '../middlewares/jwt.middleware';

export default class UsersRoutes {
    public router: Router = Router({ mergeParams: true });
    private readonly controller: UsersController = new UsersController();

    constructor() {
        this.init();
    }

    public init(): void {
        this.router.use(urlencoded({ extended: true }));
        // this.router.use(cors());

        this.router.get('/', this.controller.getUsers);
        this.router.get('/:userId', this.controller.getUser);
        this.router.post('/:userId/rating', userAuthMiddleware, this.controller.rateUser);
        this.router.put('/:userId', userAuthMiddleware, this.controller.updateUser);
        //this.router.get('/:userId/image', userAuthMiddleware, this.controller.getUserImage);
        //this.router.put('/:userId/image', userAuthMiddleware, this.controller.updateUserImage);
    }
}

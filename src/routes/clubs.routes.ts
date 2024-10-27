import {Router} from "express";
import UsersController from "../controllers/users.controller";
import {urlencoded} from "body-parser";
import clubAuthMiddleware from "../middlewares/clubauth.middleware";
import ClubsController from '../controllers/clubs.controller';

export default class ClubsRoutes{
    public router: Router = Router({ mergeParams: true });
    private readonly controller: ClubsController = new ClubsController();

    constructor() {
        this.init();
    }

    private init() {
        this.router.use(urlencoded({ extended: true }));

        this.router.get('/:location', this.controller.getNearClubs);
        this.router.get('/', this.controller.getClubs);
        this.router.get('/:clubId', this.controller.getClub);
        this.router.put('/:clubId', clubAuthMiddleware, this.controller.updateClub);
        this.router.put('/:clubId/location', clubAuthMiddleware, this.controller.updateLocation);
    }
}
import { Router } from "express";
import { urlencoded } from "body-parser";
import ReservationsController from "../controllers/reservations.controller";
import userAuthMiddleware from "../middlewares/jwt.middleware";
import authMiddleware from "../middlewares/auth.middleware";
import clubAuthMiddleware from "../middlewares/clubauth.middleware";

export default class ReservationsRoutes {
    public router: Router = Router({ mergeParams: true });
    private readonly controller: ReservationsController = new ReservationsController();

    constructor() {
        this.init();
    }

    private init() {
        this.router.use(urlencoded({ extended: true }));

        this.router.get('/event/:eventId/available', userAuthMiddleware, this.controller.findAvailableSlots);

        this.router.post('/event/:eventId', userAuthMiddleware, this.controller.createReservation);

        this.router.get('/event/:eventId', userAuthMiddleware, this.controller.getReservationsByEvent);

        this.router.patch('/:reservationId/status', clubAuthMiddleware, this.controller.updateReservationStatus);

        this.router.get('/', clubAuthMiddleware, this.controller.getReservationsByClub)

        this.router.delete('/:reservationId', authMiddleware, this.controller.cancelReservation);

        this.router.get('/:reservationId', clubAuthMiddleware, this.controller.getReservationWithOwner);
    }

    //TODO: ONCE COMPLETED THE RESERVATION UPDATE EVENTS DETAILS
} 
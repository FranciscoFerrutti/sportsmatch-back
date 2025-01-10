import { Router } from "express";
import { urlencoded } from "body-parser";
import ReservationsController from "../controllers/reservations.controller";
import userAuthMiddleware from "../middlewares/jwt.middleware";
import authMiddleware from "../middlewares/auth.middleware";

export default class ReservationsRoutes {
    public router: Router = Router({ mergeParams: true });
    private readonly controller: ReservationsController = new ReservationsController();

    constructor() {
        this.init();
    }

    private init() {
        this.router.use(urlencoded({ extended: true }));
        // Search available time slots for an event (only event creator)
        this.router.get('/available', userAuthMiddleware, this.controller.findAvailableSlots);

        // Create a reservation (only event creator)
        this.router.post('/', userAuthMiddleware, this.controller.createReservation);

        this.router.get('/', authMiddleware, this.controller.getReservationByEvent);

        //TODO: Update reservation status CLUB, fijar dependiendo el estado que altere liberar o no los time_slots
        // en caso de confirmed hay que pagar
        this.router.patch('/:reservationId/status', authMiddleware, this.controller.updateReservationStatus);

        // TODO Cancel reservation (both club and users) LIBERAR ESPACIOS
        this.router.delete('/:reservationId', authMiddleware, this.controller.cancelReservation);
    }
} 
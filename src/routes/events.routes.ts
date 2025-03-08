import { Router } from 'express';
import { urlencoded } from 'body-parser';
import cors from 'cors';
import EventsController from '../controllers/events.controller';
import userAuthMiddleware from '../middlewares/jwt.middleware';
import ParticipantsRoutes from './participants.routes';
import authMiddleware from '../middlewares/auth.middleware';
import ReservationsRoutes from "./reservations.routes";

export default class EventsRoutes {
    public router: Router = Router({ mergeParams: true });
    private readonly controller: EventsController = new EventsController();

    constructor() {
        this.init();
    }

    public init(): void {
        this.router.use(urlencoded({ extended: true }));
        // this.router.use(cors());

        this.router.get('/', this.controller.getEvents);
        this.router.post('/', authMiddleware, this.controller.createEvent);
        this.router.use('/:eventId/participants', new ParticipantsRoutes().router);
        this.router.get('/:eventId', this.controller.getEventById);
        this.router.delete('/:eventId', authMiddleware, this.controller.deleteEvent);
    }
}

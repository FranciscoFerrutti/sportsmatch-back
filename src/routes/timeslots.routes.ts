import { Router } from "express";
import { urlencoded } from "body-parser";
import clubAuthMiddleware from "../middlewares/clubauth.middleware";
import TimeSlotsController from '../controllers/timeslots.controller';

export default class TimeSlotsRoutes {
    public router: Router = Router({ mergeParams: true });
    private readonly controller: TimeSlotsController = new TimeSlotsController();

    constructor() {
        this.init()
    }

    private init() {
        this.router.use(urlencoded({ extended: true }));

        this.router.post('/', clubAuthMiddleware, this.controller.createTimeSlots);
        this.router.delete('/:slotId', clubAuthMiddleware, this.controller.deleteTimeSlot);
        this.router.patch('/:slotId/status', clubAuthMiddleware, this.controller.updateSlotStatus);

        this.router.get('/', this.controller.getFieldTimeSlots);
        this.router.get('/available', this.controller.getAvailableTimeSlots);
    }
} 
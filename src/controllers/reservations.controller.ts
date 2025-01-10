import { Request, Response, NextFunction } from "express";
import { autobind } from "core-decorators";
import { document } from "../utils/swaggerDocumentation/annotations";
import { SwaggerEndpointBuilder } from "../utils/swaggerDocumentation/SwaggerEndpointBuilder";
import { HttpRequestInfo, validateBody, validateParams, validateQuery } from "../middlewares/validation.middleware";
import { HTTP_METHODS, HTTP_STATUS } from "../constants/http.constants";
import Joi from "joi";
import ReservationsService from "../services/reservations.service";
import { ReservationStatus } from "../constants/reservation.constants";

@autobind
class ReservationsController {
    private readonly service: ReservationsService;

    constructor() {
        this.service = ReservationsService.getInstance();
    }

    @document(SwaggerEndpointBuilder.create()
        .responses({
            "200": {
                description: "OK",
                schema: {
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            fieldId: { type: "number" },
                            clubId: { type: "number" },
                            clubName: { type: "string" },
                            location: { type: "string" },
                            availableSlots: { 
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        slotIds: { 
                                            type: "array",
                                            items: { type: "number" }
                                        },
                                        startTime: { type: "string" },
                                        endTime: { type: "string" },
                                        totalCost: { type: "number" }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        })
        .build())
    @validateParams(Joi.object({
        eventId: Joi.number().required()
    }))
    @validateQuery(Joi.object({
        radius: Joi.number().min(0).optional(),
        maxResults: Joi.number().min(1).optional()
    }))
    @HttpRequestInfo("events/:eventId/reservations/available", HTTP_METHODS.GET)
    public async findAvailableSlots(req: Request, res: Response, next: NextFunction) {
        try {
            const eventId = parseInt(req.params.eventId);
            const userId = req.user.id;
            const radius = req.query.radius ? parseFloat(req.query.radius as string) : undefined;
            const maxResults = req.query.maxResults ? parseInt(req.query.maxResults as string) : undefined;

            const availableSlots = await this.service.findAvailableSlots(eventId, userId, radius, maxResults);
            res.status(HTTP_STATUS.OK).json(availableSlots);
        } catch (error) {
            next(error);
        }
    }

    @document(SwaggerEndpointBuilder.create()
        .responses({
            "201": {
                description: "Created",
                schema: {
                    type: "object",
                    properties: {
                        id: { type: "number" },
                        status: { type: "string" },
                        cost: { type: "number" }
                    }
                }
            }
        })
        .build())
    @validateParams(Joi.object({
        eventId: Joi.number().required()
    }))
    @validateBody(Joi.object({
        fieldId: Joi.number().required(),
        slotIds: Joi.array().items(Joi.number()).required()
    }))
    @HttpRequestInfo("events/:eventId/reservations", HTTP_METHODS.POST)
    public async createReservation(req: Request, res: Response, next: NextFunction) {
        try {
            const eventId = parseInt(req.params.eventId);
            const { fieldId, slotIds } = req.body;
            const userId = req.user.id;
            const reservation = await this.service.createReservation(eventId, fieldId, slotIds, userId);
            res.status(HTTP_STATUS.CREATED).json(reservation);
        } catch (error) {
            next(error);
        }
    }

    @document(SwaggerEndpointBuilder.create()
        .responses({
            "200": {
                description: "OK",
                schema: {
                    type: "object"
                }
            }
        })
        .build())
    @validateParams(Joi.object({
        eventId: Joi.number().required()
    }))
    @HttpRequestInfo("events/:eventId/reservations", HTTP_METHODS.GET)
    public async getReservationByEvent(req: Request, res: Response, next: NextFunction) {
        try {
            const eventId = parseInt(req.params.eventId);

            const reservation = await this.service.getReservationByEvent(eventId);
            res.status(HTTP_STATUS.OK).json(reservation);
        } catch (error) {
            next(error);
        }
    }

    @document(SwaggerEndpointBuilder.create()
        .responses({
            "200": {
                description: "OK",
                schema: {
                    type: "object"
                }
            }
        })
        .build())
    @validateParams(Joi.object({
        reservationId: Joi.number().required()
    }))
    @validateBody(Joi.object({
        status: Joi.string().valid(...Object.values(ReservationStatus)).required()
    }))
    @HttpRequestInfo("events/:eventId/reservations/:reservationId/status", HTTP_METHODS.PATCH)
    public async updateReservationStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const reservationId = parseInt(req.params.reservationId);
            const { status } = req.body;

            const reservation = await this.service.updateReservationStatus(
                reservationId, 
                status
            );
            res.status(HTTP_STATUS.OK).json(reservation);
        } catch (error) {
            next(error);
        }
    }

    @document(SwaggerEndpointBuilder.create()
        .responses({
            "204": {
                description: "No Content"
            }
        })
        .build())
    @validateParams(Joi.object({
        reservationId: Joi.number().required()
    }))
    @HttpRequestInfo("events/:eventId/reservations/:reservationId", HTTP_METHODS.DELETE)
    public async cancelReservation(req: Request, res: Response, next: NextFunction) {
        try {
            const reservationId = parseInt(req.params.reservationId);

            await this.service.cancelReservation(reservationId);
            res.status(HTTP_STATUS.NO_CONTENT).send();
        } catch (error) {
            next(error);
        }
    }
}

export default ReservationsController; 
import { Request, Response, NextFunction } from "express";
import { autobind } from "core-decorators";
import { document } from "../utils/swaggerDocumentation/annotations";
import { SwaggerEndpointBuilder } from "../utils/swaggerDocumentation/SwaggerEndpointBuilder";
import { HttpRequestInfo, validateBody, validateParams, validateQuery } from "../middlewares/validation.middleware";
import { HTTP_METHODS, HTTP_STATUS } from "../constants/http.constants";
import Joi from "joi";
import ReservationsService from "../services/reservations.service";
import {ReservationClubUpdateStatus, ReservationStatus} from "../constants/reservation.constants";
import {OrganizerType} from "../constants/event.constants";

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
    @HttpRequestInfo("reservations/event/:eventId/available", HTTP_METHODS.GET)
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
    @HttpRequestInfo("reservations/event/:eventId", HTTP_METHODS.POST)
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
                    type: "array",
                    items: {
                        type: "object",
                        properties: {
                            id: { type: "number" },
                            eventId: { type: "number" },
                            fieldId: { type: "number" },
                            status: { type: "string" },
                            cost: { type: "number" },
                            timeSlots: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        id: { type: "number" },
                                        startTime: { type: "string" },
                                        endTime: { type: "string" },
                                        date: { type: "string" }
                                    }
                                }
                            },
                            field: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    clubId: { type: "number" },
                                    clubName: { type: "string" }
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
    @HttpRequestInfo("reservations/event/:eventId", HTTP_METHODS.GET)
    public async getReservationsByEvent(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = parseInt(req.user.id);

            const eventId = parseInt(req.params.eventId);

            const reservations = await this.service.getReservationsByEvent(eventId, userId);
            res.status(HTTP_STATUS.OK).json(reservations);
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
        status: Joi.string().valid(...Object.values(ReservationClubUpdateStatus)).required()
    }))
    @HttpRequestInfo("reservations/:reservationId/status", HTTP_METHODS.PATCH)
    public async updateReservationStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = parseInt(req.user.id);
            const reservationId = parseInt(req.params.reservationId);
            const { status } = req.body;

            const reservation = await this.service.confirmReservation(
                reservationId,
                status,
                userId
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
        }) .build())
    @validateParams(Joi.object({
        reservationId: Joi.number().required()
    }))
    @HttpRequestInfo("reservations/:reservationId", HTTP_METHODS.DELETE)
    public async cancelReservation(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = parseInt(req.user.id);

            const organizerType = req.header('x-auth-type') === 'club' ? OrganizerType.CLUB : OrganizerType.USER;

            const reservationId = parseInt(req.params.reservationId);

            await this.service.cancelReservation(reservationId, organizerType, userId);
            res.status(HTTP_STATUS.NO_CONTENT).send();
        } catch (error) {
            next(error);
        }
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
                            id: { type: "number" },
                            eventId: { type: "number" },
                            fieldId: { type: "number" },
                            status: { type: "string" },
                            cost: { type: "number" },
                            timeSlots: {
                                type: "array",
                                items: {
                                    type: "object",
                                    properties: {
                                        id: { type: "number" },
                                        startTime: { type: "string" },
                                        endTime: { type: "string" },
                                        date: { type: "string" }
                                    }
                                }
                            },
                            field: {
                                type: "object",
                                properties: {
                                    name: { type: "string" },
                                    clubId: { type: "number" },
                                    clubName: { type: "string" }
                                }
                            }
                        }
                    }
                }
            }
        })
    .build())
    @validateQuery(Joi.object({
        status: Joi.string().valid(...Object.values(ReservationStatus)).optional()
    }))
    @HttpRequestInfo("reservations", HTTP_METHODS.GET)
    public async getReservationsByClub(req: Request, res: Response, next: NextFunction) {
        try {
            const clubId = parseInt(req.user.id);
            const status = req.query.status as ReservationStatus | undefined;

            const reservations = await this.service.getReservationsByClub(clubId, status);
            res.status(HTTP_STATUS.OK).json(reservations);
        } catch (error) {
            next(error);
        }
    }
}

export default ReservationsController; 
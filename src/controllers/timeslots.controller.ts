import { Request, Response, NextFunction } from 'express';
import TimeSlotsService from '../services/timeslots.service';
import { document } from "../utils/swaggerDocumentation/annotations";
import { SwaggerEndpointBuilder } from "../utils/swaggerDocumentation/SwaggerEndpointBuilder";
import { HttpRequestInfo, validateBody, validateParams, validateQuery } from "../middlewares/validation.middleware";
import { HTTP_METHODS, HTTP_STATUS } from "../constants/http.constants";
import Joi from "joi";
import { autobind } from "core-decorators";

@autobind
class TimeSlotsController {
    private readonly service: TimeSlotsService;

    constructor() {
        this.service = TimeSlotsService.getInstance();
    }

    @document(SwaggerEndpointBuilder.create()
        .responses({
            "201": {
                description: "Created",
                schema: {
                    type: "object",
                    properties: {
                        id: { type: "number" },
                        fieldId: { type: "number" },
                        availabilityDate: { type: "string", format: "date" },
                        startTime: { type: "string", format: "time" },
                        endTime: { type: "string", format: "time" },
                        slotStatus: { 
                            type: "string", 
                            enum: ["available", "booked", "maintenance"],
                            description: "Current status of the time slot"
                        }
                    }
                }
            }
        })
        .build())
    @validateBody(Joi.object({
        availabilityDate: Joi.string().isoDate().required(),
        startTime: Joi.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required(),
        endTime: Joi.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).required()
    }))
    @HttpRequestInfo("/fields/:fieldId/availability", HTTP_METHODS.POST)
    public async createTimeSlots(req: Request, res: Response, next: NextFunction) {
        try {
            const fieldId = parseInt(req.params.fieldId);
            const clubId = req.user.id;
            const { availabilityDate, startTime, endTime } = req.body;

            const slots = await this.service.createTimeSlotsForField({
                fieldId,
                availabilityDate,
                startTime,
                endTime
            }, clubId);

            res.status(HTTP_STATUS.CREATED).json(slots);
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
                            fieldId: { type: "number" },
                            availabilityDate: { type: "string", format: "date" },
                            startTime: { type: "string", format: "time" },
                            endTime: { type: "string", format: "time" },
                            slotStatus: { type: "string", enum: ["available", "booked", "maintenance"] }
                        }
                    }
                }
            }
        })
        .build())
    @validateParams(Joi.object({
        fieldId: Joi.number().min(1).required()
    }))
    @validateQuery(Joi.object({
        availabilityDate: Joi.string().isoDate().optional()
    }))
    @HttpRequestInfo("/fields/:fieldId/availability", HTTP_METHODS.GET)
    public async getFieldTimeSlots(req: Request, res: Response, next: NextFunction) {
        try {
            const fieldId = parseInt(req.params.fieldId);
            const { availabilityDate } = req.query;

            const slots = await this.service.getFieldTimeSlots(fieldId, availabilityDate as string);
            res.status(HTTP_STATUS.OK).json(slots);
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
                            fieldId: { type: "number" },
                            availabilityDate: { type: "string", format: "date" },
                            startTime: { type: "string", format: "time" },
                            endTime: { type: "string", format: "time" }
                        }
                    }
                }
            }
        })
        .build())
    @validateParams(Joi.object({
        fieldId: Joi.number().min(1).required()
    }))
    @validateQuery(Joi.object({
        startDate: Joi.string().isoDate().required(),
        endDate: Joi.string().isoDate().required()
    }))
    @HttpRequestInfo("/fields/:fieldId/availability/available", HTTP_METHODS.GET)
    public async getAvailableTimeSlots(req: Request, res: Response, next: NextFunction) {
        try {
            const fieldId = parseInt(req.params.fieldId);
            const { startDate, endDate } = req.query;

            const slots = await this.service.getAvailableTimeSlots(
                fieldId,
                startDate as string,
                endDate as string
            );
            res.status(HTTP_STATUS.OK).json(slots);
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
        fieldId: Joi.number().min(1).required(),
        slotId: Joi.number().min(1).required()
    }))
    @HttpRequestInfo("/fields/:fieldId/availability/:slotId", HTTP_METHODS.DELETE)
    public async deleteTimeSlot(req: Request, res: Response, next: NextFunction) {
        try {
            const { fieldId, slotId } = req.params;
            const clubId = req.user.id;
            
            await this.service.deleteTimeSlot(fieldId, slotId, clubId);
            res.status(HTTP_STATUS.NO_CONTENT).send();
        } catch (error) {
            next(error);
        }
    }
}

export default TimeSlotsController;
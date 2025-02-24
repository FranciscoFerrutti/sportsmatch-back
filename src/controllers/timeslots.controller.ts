import { Request, Response, NextFunction } from 'express';
import TimeSlotsService from '../services/timeslots.service';
import { document } from "../utils/swaggerDocumentation/annotations";
import { SwaggerEndpointBuilder } from "../utils/swaggerDocumentation/SwaggerEndpointBuilder";
import { HttpRequestInfo, validateBody, validateParams, validateQuery } from "../middlewares/validation.middleware";
import { HTTP_METHODS, HTTP_STATUS } from "../constants/http.constants";
import Joi from "joi";
import { autobind } from "core-decorators";
import { SlotStatus } from '../constants/slots.constants';
import { TIME_REGEX } from '../constants/regex.constants';

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
        @validateParams(Joi.object({
            fieldId: Joi.number().min(1).required()
        }))
        @validateBody(Joi.object({
            availabilityDate: Joi.string().isoDate().required(),
            startTime: Joi.string().regex(TIME_REGEX).required(),
            endTime: Joi.string().regex(TIME_REGEX).required(),
            slotStatus: Joi.string().valid(...Object.values(SlotStatus)).optional()
        }))
        @HttpRequestInfo("/fields/:fieldId/availability", HTTP_METHODS.POST)
        public async createTimeSlots(req: Request, res: Response, next: NextFunction) {
            try {
                const fieldId = parseInt(req.params.fieldId);
                const clubId = req.user.id;
                const { availabilityDate, startTime, endTime, slotStatus } = req.body;

                const slots = await this.service.createTimeSlotsForField({
                    fieldId,
                    availabilityDate,
                    startTime,
                    endTime,
                    slotStatus
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
        availabilityDate: Joi.string().isoDate().optional(),
        slotStatus: Joi.string().valid('available', 'booked', 'maintenance').optional(),
        startTime: Joi.string().regex(TIME_REGEX).optional(),
        endTime: Joi.string().regex(TIME_REGEX).optional()
    }))
    @HttpRequestInfo("/fields/:fieldId/availability", HTTP_METHODS.GET)
    public async getFieldTimeSlots(req: Request, res: Response, next: NextFunction) {
        try {
            const fieldId = parseInt(req.params.fieldId);
            const { availabilityDate, slotStatus, startTime, endTime } = req.query;

            const slots = await this.service.getFieldTimeSlots(
                fieldId, 
                availabilityDate as string,
                slotStatus as SlotStatus,
                startTime as string,
                endTime as string
            );
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

    @document(SwaggerEndpointBuilder.create()
        .responses({
            "200": {
                description: "OK",
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
    @validateParams(Joi.object({
        fieldId: Joi.number().min(1).required(),
        slotId: Joi.number().min(1).required()
    }))
    @validateBody(Joi.object({
        slotStatus: Joi.string().valid(...Object.values(SlotStatus)).required()
    }))
    @HttpRequestInfo("/fields/:fieldId/availability/:slotId/status", HTTP_METHODS.PATCH)
    public async updateSlotStatus(req: Request, res: Response, next: NextFunction) {
        try {
            const { fieldId, slotId } = req.params;
            const clubId = req.user.id;
            const { slotStatus } = req.body;
            
            const updatedSlot = await this.service.updateSlotStatus(
                fieldId,
                slotId,
                clubId,
                slotStatus
            );
            res.status(HTTP_STATUS.OK).json(updatedSlot);
        } catch (error) {
            next(error);
        }
    }
}

export default TimeSlotsController;
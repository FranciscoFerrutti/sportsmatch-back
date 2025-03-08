import { Request, Response, NextFunction } from "express";
import EventsService from "../services/events.service";
import { HTTP_METHODS, HTTP_STATUS } from "../constants/http.constants";
import { HttpRequestInfo, JoiEnum, validateBody, validateParams, validateQuery } from "../middlewares/validation.middleware";
import { autobind } from "core-decorators";
import Joi from "joi";
import { document } from "../utils/swaggerDocumentation/annotations";
import { SwaggerEndpointBuilder } from "../utils/swaggerDocumentation/SwaggerEndpointBuilder";
import { ParticipantStatus } from "../database/models/Participant.model";
import { OrganizerType } from "../constants/event.constants";
import { HTTP_PARAMETERS } from "../constants/http.constants";

@autobind
class EventsController {
    private readonly eventsService: EventsService;
    
    constructor() {
        this.eventsService = EventsService.getInstance();
    }

    
    @document(SwaggerEndpointBuilder.create()
        .responses({
            "200": {
                description: "OK",
                schema: {
                    type: "object",
                    properties: {
                        page: {
                            type: "number"
                        },
                        pageSize: {
                            type: "number"
                        },
                        items: {
                            type: "array",
                        }
                    }
                }
            }
        })
        .parameters([
            {
                name: "participantId",
                in: HTTP_PARAMETERS.QUERY,
                description: "Filter by participant ID",
                required: false,
                type: "number"
            },
            {
                name: "sportId",
                in: HTTP_PARAMETERS.QUERY,
                description: "Filter by sport ID",
                required: false,
                type: "number"
            },
            {
                name: "userId",
                in: HTTP_PARAMETERS.QUERY,
                description: "Filter by user ID",
                required: false,
                type: "number"
            },
            {
                name: "organizerType",
                in: HTTP_PARAMETERS.QUERY,
                description: "Filter by organizer type (user or club)",
                required: false,
                type: "string"
            },
            {
                name: "filterOut",
                in: HTTP_PARAMETERS.QUERY,
                description: "Filter out results",
                required: false,
                type: "boolean"
            },
            {
                name: "location",
                in: HTTP_PARAMETERS.QUERY,
                description: "Filter by location",
                required: false,
                type: "string"
            },
            {
                name: "expertise",
                in: HTTP_PARAMETERS.QUERY,
                description: "Filter by expertise level",
                required: false,
                type: "string"
            },
            {
                name: "schedule",
                in: HTTP_PARAMETERS.QUERY,
                description: "Filter by schedule",
                required: false,
                type: "string"
            },
            {
                name: "date",
                in: HTTP_PARAMETERS.QUERY,
                description: "Filter by date (YYYY-MM-DD)",
                required: false,
                type: "string"
            },
            {
                name: "page",
                in: HTTP_PARAMETERS.QUERY,
                description: "Page number",
                required: false,
                type: "number"
            },
            {
                name: "limit",
                in: HTTP_PARAMETERS.QUERY,
                description: "Results per page",
                required: false,
                type: "number"
            }
        ])
    .build())
    @validateQuery(Joi.object({
        participantId: Joi.number().min(1).optional(),
        sportId: Joi.alternatives([Joi.number().min(1).optional(), Joi.array().items(Joi.number().min(1).optional())]),
        userId: Joi.number().min(1).optional(),
        filterOut: Joi.boolean().optional(),
        location: Joi.alternatives([Joi.string().optional(), Joi.array().items(Joi.string().optional())]),
        expertise: Joi.string().optional(),
        schedule: Joi.string().optional(),
        date: Joi.string().optional(),
        organizerType: JoiEnum(OrganizerType).optional(),
        page: Joi.number().min(0).optional(),
        limit: Joi.number().min(1).optional()
    }))
    @HttpRequestInfo("/events", HTTP_METHODS.GET)
    public async getEvents(req: Request, res: Response, next: NextFunction) {
        const queryFilters = req.query as Record<string, string>;
        const page = parseInt(queryFilters.page || "0");
        const limit = parseInt(queryFilters.limit || "20");
        
        try {
            const events = await this.eventsService.getEvents(queryFilters, page, limit);
            res.status(HTTP_STATUS.OK).send(events);
        } catch (err) {
            next(err);
        }
    }

    @document(SwaggerEndpointBuilder.create()
        .responses({
            "200": {
                description: "OK",
                schema: {
                    type: "object",
                }
            }
        })
    .build())
    @validateParams(Joi.object({
        eventId: Joi.number().min(1).required()
    }))
    @HttpRequestInfo("/events/{eventId}", HTTP_METHODS.GET)
    public async getEventById(req: Request, res: Response, next: NextFunction) {
        const eventId = req.params.eventId;

        try {
            const event = await this.eventsService.getEventById(eventId);
            res.status(HTTP_STATUS.OK).send(event);
        } catch (err) {
            next(err);
        }
    }

    // TODO: get owner id from validator
    @document(SwaggerEndpointBuilder.create()
        .responses({
            "201": {
                description: "Created",
                schema: {
                    type: "object",
                }
            }
        })
    .build())
    @validateBody(Joi.object({
        sportId: Joi.number().min(1).required(),
        expertise: Joi.number().required(),
        schedule: Joi.date().required(),
        location: Joi.string().required(),
        remaining: Joi.number().required(),
        duration: Joi.number().required(),
        description: Joi.string().max(100).required()
    }))
    @HttpRequestInfo("/events", HTTP_METHODS.POST)
    public async createEvent(req: Request, res: Response, next: NextFunction) {
        const { sportId, expertise, description, schedule, duration, location, remaining } = req.body;
        const ownerId = req.user.id;
        const organizerType = req.header('x-auth-type') === 'club' ? OrganizerType.CLUB : OrganizerType.USER;
        try {
            const createdEvent = await this.eventsService.createEvent({
                ownerId, 
                organizerType,
                sportId, 
                expertise, 
                location, 
                schedule, 
                description, 
                duration, 
                remaining
            });

            res.status(HTTP_STATUS.CREATED).json({ eventId: createdEvent.id });
        } catch (err) {
            next(err);
        }
    }
}

export default EventsController;
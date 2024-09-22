import { autobind } from "core-decorators";
import ParticipantService from "../services/participant.service";
import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { HTTP_METHODS, HTTP_STATUS } from "../constants/http.constants";
import { ParticipantStatus } from "../database/models/Participant.model";
import { validateParams, HttpRequestInfo, validateBody, validateQuery, JoiEnum } from "../middlewares/validation.middleware";
import { SwaggerEndpointBuilder } from "../utils/swaggerDocumentation/SwaggerEndpointBuilder";
import { document } from "../utils/swaggerDocumentation/annotations";
import GenericException from "../exceptions/generic.exception";


@autobind
export default class ParticipantController {
    private readonly participantService: ParticipantService;

    constructor() {
        this.participantService = ParticipantService.getInstance();
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
    @validateBody(Joi.object({
        userId: Joi.number().min(1).required()
    }))
    @HttpRequestInfo("/events/:eventId/participants", HTTP_METHODS.POST)
    public async addParticipant(req: Request, res: Response, next: NextFunction) {
        const participantId = req.user.id;
        const eventId = req.params.eventId;
        try {
            if (participantId !== req.body.userId) 
                throw new GenericException({ message: "User id is invalid", status: HTTP_STATUS.BAD_REQUEST, internalStatus: "INVALID_USER_ID" })
            await this.participantService.addParticipant(eventId, participantId);
            res.status(HTTP_STATUS.OK).send();
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
        eventId: Joi.number().min(1).required(),
        participantId: Joi.number().min(1).required(),
    }))
    @HttpRequestInfo("/events/:eventId/participants/:participantId", HTTP_METHODS.DELETE)
    public async removeParticipant(req: Request, res: Response, next: NextFunction) {
        const participantId = req.params.participantId;
        const eventId = req.params.eventId;
        const userId = req.user.id;

        try {
            if (participantId !== userId) { // deny by owner
                await this.participantService.removeParticipant(eventId, participantId, userId);
            } else { // cancel by participant
                await this.participantService.removeParticipant(eventId, participantId);
            }
            res.status(HTTP_STATUS.OK).send();
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
        eventId: Joi.number().min(1).required(),
        participantId: Joi.number().min(1).required(),
    }))
    @validateBody(Joi.object({
        status: Joi.boolean().required()
    }))
    @HttpRequestInfo("/events/:eventId/participants/:participantId", HTTP_METHODS.PUT)
    public async updateParticipant(req: Request, res: Response, next: NextFunction) {
        const participantId = req.params.participantId;
        const ownerId = req.user.id;
        const eventId = parseInt(req.params.eventId);
        const status = req.body.status;

        try {
            if (!status) throw new GenericException({ message: "Status is invalid for this event", status: HTTP_STATUS.BAD_REQUEST, internalStatus: "INVALID_STATUS" })
            await this.participantService.acceptParticipant(eventId, participantId, ownerId);
            res.status(HTTP_STATUS.OK).send();
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
    @validateQuery(Joi.object({
        status: JoiEnum(ParticipantStatus).optional()
    }))
    @HttpRequestInfo("/events/:eventId/participants", HTTP_METHODS.GET)
    public async getParticipants(req: Request, res: Response, next: NextFunction) {
        const eventId = parseInt(req.params.eventId);
        const status = req.query.status ? req.query.status === ParticipantStatus.ACCEPTED : undefined;

        try {
            const participants = await this.participantService.getParticipants(eventId, status);
            res.status(HTTP_STATUS.OK).send(participants);
        } catch (err) {
            next(err);
        }
    }
}
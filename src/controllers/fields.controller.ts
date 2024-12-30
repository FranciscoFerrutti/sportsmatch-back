import {document} from "../utils/swaggerDocumentation/annotations";
import {SwaggerEndpointBuilder} from "../utils/swaggerDocumentation/SwaggerEndpointBuilder";
import {HttpRequestInfo, validateBody, validateParams} from "../middlewares/validation.middleware";
import {HTTP_METHODS, HTTP_STATUS} from "../constants/http.constants";
import {NextFunction, Request, Response} from "express";
import Joi from "joi";
import FieldService from "../services/field.service";

class FieldsController{
    private readonly fieldService: FieldService;

    constructor() {
        this.fieldService = FieldService.getInstance()
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
        clubId: Joi.number().min(1).required()
    }))
    @HttpRequestInfo("/fields/:clubId", HTTP_METHODS.GET)
    public async getFields(req: Request, res: Response, next: NextFunction) {
        const clubId = req.params.clubId
        try {
            const fields = await this.fieldService.getFields(clubId);
            res.status(HTTP_STATUS.OK).send(fields);
        } catch (err) {
            next(err);
        }
    }

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
        name: Joi.string().required(),
        cost: Joi.number().required().min(0),
        description: Joi.string().min(5).max(250).required(),
        capacity: Joi.number().required(),
    }))
    @HttpRequestInfo("/fields", HTTP_METHODS.POST)
    public async postField(req: Request, res: Response, next: NextFunction) {
        const { name, cost, description, capacity } = req.body;
        const ownerId = req.user.id;

        try {
            await this.fieldService.createField({
                ownerId, name, cost, description, capacity
            });
            res.status(HTTP_STATUS.CREATED).send();
        } catch (err) {
            next(err);
        }
    }

    @document(SwaggerEndpointBuilder.create()
        .responses({
            "200": {
                description: "OK",
            }
        })
        .build()
    )
    @validateParams(Joi.object({
        fieldId: Joi.number().min(1).required()
    }))
    @validateBody(Joi.object({
        name: Joi.string().optional(),
        cost: Joi.number().optional(),
        description: Joi.string().min(5).max(250).optional(),
        capacity: Joi.number().optional(),
    }))
    @HttpRequestInfo("/fields/:fieldId", HTTP_METHODS.PUT)
    public async updateField(req: Request, res: Response, next: NextFunction) {
        const { name, cost, description, capacity } = req.body;
        const ownerId = req.user.id;
        const fieldId = req.params.fieldId;

        try {
            await this.fieldService.updateField(fieldId, ownerId,{ name, cost, description, capacity });
            res.status(HTTP_STATUS.OK).send();
        } catch (err) {
            next(err);
        }
    }

    @document(SwaggerEndpointBuilder.create()
        .responses({
            "200": {
                description: "OK",
            }
        })
        .build()
    )
    @validateParams(Joi.object({
        fieldId: Joi.number().min(1).required()
    }))
    @HttpRequestInfo("/fields/:fieldId", HTTP_METHODS.DELETE)
    public async deleteField(req: Request, res: Response, next: NextFunction) {
        const ownerId = req.user.id;
        const fieldId = req.params.fieldId

        try {
            await this.fieldService.removeField(ownerId, fieldId);
            res.status(HTTP_STATUS.OK).send();
        } catch (err) {
            next(err);
        }
    }
}

export default FieldsController;
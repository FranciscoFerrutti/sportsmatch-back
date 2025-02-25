import {document} from "../utils/swaggerDocumentation/annotations";
import {SwaggerEndpointBuilder} from "../utils/swaggerDocumentation/SwaggerEndpointBuilder";
import {HttpRequestInfo, validateBody, validateParams} from "../middlewares/validation.middleware";
import {HTTP_METHODS, HTTP_STATUS} from "../constants/http.constants";
import {NextFunction, Request, Response} from "express";
import Joi from "joi";
import FieldService from "../services/field.service";
import {autobind} from "core-decorators";

@autobind
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
        @HttpRequestInfo("/fields", HTTP_METHODS.GET)
        public async getFields(req: Request, res: Response, next: NextFunction) {
            try {
                const clubId: string | undefined = req.query.clubId as string | undefined;

                const fields = clubId
                    ? await this.fieldService.getFields(clubId)
                    : await this.fieldService.getAllFields();
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
        slot_duration: Joi.number().required(),
        sportIds: Joi.array().items(Joi.number().min(1)).min(1).required()
    }))
    @HttpRequestInfo("/fields", HTTP_METHODS.POST)
    public async postField(req: Request, res: Response, next: NextFunction) {
        const { name, cost, description, capacity, slot_duration, sportIds } = req.body;
        const ownerId = req.user.id;

        try {
            const newField = await this.fieldService.createField({
                ownerId, name, cost, description, capacity, slot_duration, sportIds
            });
            res.status(HTTP_STATUS.CREATED).send({ id: newField.id });
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
        slot_duration: Joi.number().optional(),
        sports: Joi.array().items(Joi.number().min(1)).optional()
    }))
    @HttpRequestInfo("/fields/:fieldId", HTTP_METHODS.PUT)
    public async updateField(req: Request, res: Response, next: NextFunction) {
        const { name, cost, description, capacity, slot_duration, sports } = req.body;
        const {  fieldId } = req.params;
        const {  clubId } = req.query;

        try {
            await this.fieldService.updateField(fieldId, clubId as string, {
                name,
                cost,
                description,
                capacity,
                slot_duration,
                sportIds: sports
            });

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
        const {  fieldId } = req.params;
        const {  clubId } = req.query;

        try {
            await this.fieldService.removeField(fieldId, clubId as string);
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
    @HttpRequestInfo("/fields/:fieldId", HTTP_METHODS.GET)
    public async getFieldById(req: Request, res: Response, next: NextFunction) {
        const { fieldId } = req.params;

        try {
            const field = await this.fieldService.getFieldById(fieldId);
            res.status(HTTP_STATUS.OK).send(field);
        } catch (err) {
            next(err);
        }
    }
}

export default FieldsController;
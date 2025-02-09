import { autobind } from "core-decorators";
import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { HTTP_METHODS, HTTP_STATUS } from "../constants/http.constants";
import { validateParams, HttpRequestInfo, validateBody, validateQuery, JoiEnum } from "../middlewares/validation.middleware";
import { SwaggerEndpointBuilder } from "../utils/swaggerDocumentation/SwaggerEndpointBuilder";
import { document } from "../utils/swaggerDocumentation/annotations";
import GenericException from "../exceptions/generic.exception";
import { PaymentService } from '../services/payment.service';

@autobind
export default class PaymentController{
    private readonly paymentService: PaymentService;

    constructor() {
        this.paymentService = PaymentService.getInstance();
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
    @HttpRequestInfo("/payments/process_payment", HTTP_METHODS.POST)
    public async addPayment(req: Request, res: Response, next: NextFunction){
        try {
            const result = await this.paymentService.processPayment(req.body);
            return res.json(result);
        } catch (error) {
            next(error);
        }
    }
}


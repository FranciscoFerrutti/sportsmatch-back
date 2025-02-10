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
    @validateParams(Joi.object({
        reservationId: Joi.number().required()
    }))
    @HttpRequestInfo("/payments/:reservationId/process_payment", HTTP_METHODS.POST)
    public async addPayment(req: Request, res: Response, next: NextFunction){
        try {
            const reservationId = parseInt(req.params.reservationId);
            
            const result = await this.paymentService.processPayment(reservationId, req.body);
            return res.json(result);
        } catch (error) {
            next(error);
        }
    }

    @document(SwaggerEndpointBuilder.create()
        .description('Get payments by reservation ID')
        .responses({
            "200": { description: 'List of payments' },
            "404": { description: 'Reservation not found' }
        })
        .build()
    )
    @validateParams(Joi.object({
        reservationId: Joi.number().required()
    }))
    @HttpRequestInfo("/payments/:reservationId", HTTP_METHODS.GET)
    public async getPaymentsByReservationId(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = parseInt(req.user.id);
            const reservationId = parseInt(req.params.reservationId);
            const payments = await this.paymentService.getPaymentsByReservationId(reservationId, userId);
            return res.json(payments);
        } catch (error) {
            next(error);
        }
    }
}


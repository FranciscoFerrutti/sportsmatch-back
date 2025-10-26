import { autobind } from "core-decorators";
import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { HTTP_METHODS, HTTP_STATUS } from "../constants/http.constants";
import { validateParams, HttpRequestInfo, validateBody, validateQuery, JoiEnum } from "../middlewares/validation.middleware";
import { SwaggerEndpointBuilder } from "../utils/swaggerDocumentation/SwaggerEndpointBuilder";
import { document } from "../utils/swaggerDocumentation/annotations";
import GenericException from "../exceptions/generic.exception";
import { PaymentService } from '../services/payment.service';
import ReservationsService from "../services/reservations.service";

@autobind
export default class PaymentController{
    private readonly paymentService: PaymentService;

    constructor() {
        this.paymentService = PaymentService.getInstance(ReservationsService.getInstance());
    }

    @document(
        SwaggerEndpointBuilder.create()
        .description("Process MP webhook")
        .responses({
            "200": {
            description: "OK",
            schema: { type: "object" },
            },
        })
        .build()
    )
    @HttpRequestInfo(
        '/payments/mp-webhook',
        HTTP_METHODS.POST
    )
    public async processWebhook(req: Request, res: Response, next: NextFunction) {
        try {
            console.log(req.body);
            await this.paymentService.processWebhook(req.body);
            return res.sendStatus(HTTP_STATUS.OK);
        } catch (error) {
            next(error);
        }
    }

    @document(
        SwaggerEndpointBuilder.create()
        .description("Create payment preference")
        .responses({
            "200": {
            description: "OK",
            schema: { type: "object" },
            },
        })
        .build()
    )
    @validateBody(
        Joi.object({
        reservationId: Joi.number().required(),
        })
    )
    @HttpRequestInfo(
        '/payments',
        HTTP_METHODS.POST
    )
    public async createPreference(req: Request, res: Response, next: NextFunction) {
        const userId = parseInt(req.user.id);
        const reservationId = parseInt(req.body.reservationId);

        try {
            const result = await this.paymentService.createPreference(userId, reservationId);
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

    @document(SwaggerEndpointBuilder.create()
        .description('Get payment status and owner info for clubs')
        .responses({
            "200": { description: 'Payment status with owner info' },
            "403": { description: 'Unauthorized access' },
            "404": { description: 'Reservation not found' }
        })
        .build()
    )
    @validateParams(Joi.object({
        reservationId: Joi.number().required()
    }))
    @HttpRequestInfo("/payments/club/:reservationId/status", HTTP_METHODS.GET)
    public async getPaymentStatusForClub(req: Request, res: Response, next: NextFunction) {
        try {
            const clubId = parseInt(req.user.id);
            const reservationId = parseInt(req.params.reservationId);
            const paymentStatus = await this.paymentService.getPaymentStatusForClub(reservationId, clubId);
            return res.json(paymentStatus);
        } catch (error) {
            next(error);
        }
    }

    @document(SwaggerEndpointBuilder.create()
        .description('Refund a payment by payment ID')
        .responses({
            "200": { description: 'Refund processed successfully' },
            "404": { description: 'Payment not found' },
            "500": { description: 'Error processing refund' }
        })
        .build()
    )
    @validateParams(Joi.object({
        paymentId: Joi.number().required()
    }))
    @HttpRequestInfo("/payments/:paymentId/refund", HTTP_METHODS.POST)
    public async refundPayment(req: Request, res: Response, next: NextFunction) {
        try {
            const paymentId = parseInt(req.params.paymentId);

            const result = await this.paymentService.refundPayment(paymentId);
            return res.json(result);
        } catch (error) {
            next(error);
        }
    }
}


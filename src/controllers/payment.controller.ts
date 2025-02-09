import { autobind } from "core-decorators";
import { Request, Response, NextFunction } from "express";
import Joi from "joi";
import { HTTP_METHODS, HTTP_STATUS } from "../constants/http.constants";
import { validateParams, HttpRequestInfo, validateBody, validateQuery, JoiEnum } from "../middlewares/validation.middleware";
import { SwaggerEndpointBuilder } from "../utils/swaggerDocumentation/SwaggerEndpointBuilder";
import { document } from "../utils/swaggerDocumentation/annotations";
import GenericException from "../exceptions/generic.exception";
import { MercadoPagoConfig, Payment } from 'mercadopago';

@autobind
export default class PaymentController{
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
        const client = new MercadoPagoConfig({
            accessToken: 'TEST-7292404225301445-020515-fdcc4e758f206ac7b4779c131ad17e0d-818545244', options: { timeout: 5000} });

        console.log(req.body)
        const payment = new Payment(client);
        payment.create({ body: req.body })
            .then(console.log)
            .catch(console.log);
    }
}


import { NextFunction, Request, Response } from 'express';
import HttpException from '../exceptions/http.exception';

const ErrorHandlerMiddleware = (error: HttpException, request: Request, response: Response, next: NextFunction): void => {
    
    
    let status = error.status || 500;
    let internalStatus = error.internalStatus;
    let message = error.internalStatus ? error.message : 'Internal server error.';
    let requestId;
        
    if (error.response) {
        status = error.response.status;
        internalStatus = error.response.data?.internalStatus;
        message = error.response.data?.message;
        requestId = error.response.headers['x-requestid'];
    }

    if (request.body?.password) request.body.password = '';
    if (request.body?.rndCode) request.body.rndCode = '';
    if (request.body?.deviceToken) request.body.deviceToken = '';
    if (request.body?.token) request.body.token = '';
    if (request.body?.img) request.body.img = '';
    if (request.body?.document) request.body.document = '';
    if (request.body?.logo) request.body.logo = '';

    console.log({ error: error.message, metadata: { status, internalStatus, url: request.url, body: request.body, requestId } });

    response.status(status).send({
        internalStatus,
        message
    });
};

export default ErrorHandlerMiddleware;

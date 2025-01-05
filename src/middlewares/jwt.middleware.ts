import { NextFunction, Request, Response } from 'express'
import GenericException from '../exceptions/generic.exception'
import AuthService from '../services/auth.service';
import NotFoundException from '../exceptions/notFound.exception';

const userAuthMiddleware = async (request: Request, response: Response, next: NextFunction) : Promise<void> => {
    const token = request.header('c-api-key') as string;

    if (!token) {
        throw new NotFoundException('Token');
    }
    
    try {
        const decodedToken = await AuthService.getInstance().verifyToken(token);
        request.user = decodedToken;
        next();
    } catch (err) {
        const error = err as GenericException;
        response.status(error.status).send({error: error.message});
        return;
    }
};

export default userAuthMiddleware;

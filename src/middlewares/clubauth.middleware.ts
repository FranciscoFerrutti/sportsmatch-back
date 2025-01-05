import {NextFunction, Request, Response} from "express";
import NotFoundException from "../exceptions/notFound.exception";
import ClubAuthService from "../services/clubAuth.service";
import GenericException from "../exceptions/generic.exception";

const clubAuthMiddleware = async (request: Request, response: Response, next: NextFunction) : Promise<void> => {
    const token = request.header('c-api-key') as string;

    if (!token) {
        throw new NotFoundException('Token');
    }
    
    try {
        const decodedToken = await ClubAuthService.getInstance().verifyToken(token);
        request.user = decodedToken;
        next();
    } catch (err) {
        const error = err as GenericException;
        response.status(error.status).send({error: error.message});
        return;
    }
};

export default clubAuthMiddleware;
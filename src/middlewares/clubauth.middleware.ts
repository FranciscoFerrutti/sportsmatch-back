import {NextFunction, Request, Response} from "express";
import NotFoundException from "../exceptions/notFound.exception";
import ClubAuthService from "../services/clubAuth.service";
import GenericException from "../exceptions/generic.exception";

const clubAuthMiddleware = (request: Request, response: Response, next: NextFunction) : void => {
    const token = request.header('c-api-key') as string;

    if (!token) {
        throw new NotFoundException('Token');
    }
    let decodedToken;
    try {
        decodedToken = ClubAuthService.getInstance().verifyToken(token);
    } catch (err) {
        const error = err as GenericException;
        response.status(error.status).send({error: error.message});
        return;
    }
    request.user = decodedToken as {email: string, id: string};
    next();
};

export default clubAuthMiddleware;
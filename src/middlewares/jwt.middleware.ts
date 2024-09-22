import { NextFunction, Request, Response } from 'express'
import GenericException from '../exceptions/generic.exception'
import AuthService from '../services/auth.service';
import NotFoundException from '../exceptions/notFound.exception';


const userAuthMiddleware = (request: Request, response: Response, next: NextFunction) : void => {
    const token = request.header('c-api-key') as string;

	if (!token) {
		throw new NotFoundException('Token');
	}
	let decodedToken;
	try {
		decodedToken = AuthService.getInstance().verifyToken(token);
	} catch (err) {
        const error = err as GenericException;
		response.status(error.status).send({error: error.message});
		return;
	}
	request.user = decodedToken as {email: string, id: string};
	next();
};

export default userAuthMiddleware;

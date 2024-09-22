import { Request, Response, NextFunction } from "express";
import GenericException from "../exceptions/generic.exception";
import NotFoundException from "../exceptions/notFound.exception";

const userBasicAuthMiddleware = (request: Request, response: Response, next: NextFunction) : void => {
    const authHeader = request.header('c-basic-auth') as string;

	if (!authHeader) {
		throw new NotFoundException('c-basic-auth header');
	}
	let decodedToken;
	try {
		decodedToken = getEmailAndpasswordFromHeader(authHeader);
	} catch (err) {
        const error = err as GenericException;
		response.status(error.status).send({error: error.message});
		return;
	}
	request.userBasic = decodedToken as {email: string, password: string};
	next();
};

const getEmailAndpasswordFromHeader = (authHeader: string) => {
    const strauth = Buffer.from(authHeader, 'base64').toString();
    const splitIndex = strauth.indexOf(':');
    const login = strauth.substring(0, splitIndex);
    const password = strauth.substring(splitIndex + 1);
    return {email: login, password}
}

export default userBasicAuthMiddleware;
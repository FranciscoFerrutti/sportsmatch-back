import { Request, Response, NextFunction } from 'express';
import userAuthMiddleware from './jwt.middleware';
import clubAuthMiddleware from './clubauth.middleware';

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const authType = req.header('x-auth-type');
    if (authType === 'club') {
        return clubAuthMiddleware(req, res, next);
    }
    return userAuthMiddleware(req, res, next);
};

export default authMiddleware; 
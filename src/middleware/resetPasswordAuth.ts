import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';

export const password_reset_token = 'password_reset_token';

export const verifyResetPasswordToken = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token = req.cookies[password_reset_token];

    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string);
        // adds the userId to the request object, even tho it's not in the body of the request
        req.userId = (decoded as JwtPayload).userId;
        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

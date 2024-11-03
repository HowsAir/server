/**
 * @file auth.ts
 * @brief Middleware for JWT token verification and user authentication
 * @author Juan Diaz
 */

import { NextFunction, Request, Response } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { config } from 'dotenv';

config();

declare global {
    namespace Express {
        interface Request {
            userId: number; // Extending Request interface to include userId
            roleId: number; // Extending Request interface to include role
        }
    }
}

/**
 * Middleware to verify the JWT token from cookies.
 *
 * This middleware checks if the token exists in the cookies sent by the client and verifies its validity.
 * If the token is valid, it extracts the `userId` from the token payload and attaches it to the request object.
 * If the token is missing or invalid, it sends a 401 Unauthorized response.
 *
 * @param req - The HTTP Request object. Expects a JWT token in the cookies.
 * @param res - The HTTP Response object used to return error messages in case of unauthorized access.
 * @param next - The NextFunction to pass control to the next middleware/controller if the token is valid.
 *
 * @returns Sends a 401 status code with an error message if the token is invalid or missing. Otherwise, it passes the control to the next handler.
 */
export const verifyToken = (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const token = req.cookies[process.env.AUTH_TOKEN as string];

    // If no token is provided in the cookies, return an unauthorized error
    if (!token) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {
        // Verifies the token using the secret key
        // If the token is invalid, throws an error
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string);

        // Attach the userId from the decoded token payload to the request object
        req.userId = (decoded as JwtPayload).userId;
        req.roleId = (decoded as JwtPayload).roleId;

        next();
    } catch (error) {
        console.error(error);
        return res.status(401).json({ message: 'Unauthorized' });
    }
};

/**
 * Middleware to authorize access based on user roles.
 *
 * This function restricts access to specific routes by checking if the user's role is allowed.
 * If the user's role is not in the list of allowed roles, the request will be denied with a 403 (Forbidden) status.
 * Otherwise, it will pass control to the next middleware or route handler.
 *
 * @param {string[]} allowedRoles - An array of roles that are permitted to access the route.
 *
 * @returns {Function} Returns an Express middleware function that checks the user's role against the allowed roles.
 */
export const authorizeRoles = (...allowedRoles: number[]) => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!allowedRoles.includes(req.roleId)) {
            return res.status(403).json({ message: 'Forbidden' });
        }
        next();
    };
};

/**
 * @file errorHandler.ts
 * @brief Middleware for centralized error handling in the application.
 * @author Juan Diaz
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Centralized error handling middleware.
 *
 * @param err - The error object representing the error that occurred.
 * @param req - The Express request object.
 * @param res - The Express response object.
 * @param next - The next middleware function in the Express chain.
 *
 * @returns {void} - Sends an HTTP 500 response with a standardized error message.
 * Logs the error to the console for debugging.
 */
const errorHandler = (
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
): void => {
    console.error(err); // Log the error for debugging
    res.status(500).json({ message: 'Internal Server Error' });
};

export default errorHandler;

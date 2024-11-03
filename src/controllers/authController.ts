/**
 * @file authController.ts
 * @brief Controller for handling authentication-related operations.
 * @author Manuel Borregales & Juan Diaz
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { auth_token } from '../middleware/auth';
import { putJwtInResponse } from '../utils/auth';
import { authService } from '../services/authService';
import { config } from 'dotenv';

config();

/**
 * Login controller method.
 *
 * This function handles user login by validating credentials and returning a JWT if successful.
 *
 * @param req - The HTTP request containing email and password in the body.
 * @param res - The HTTP response object to send the JWT token in a cookie if successful.
 * @returns {Promise<Response>} - Returns a JSON response with the user details and token if successful, or an error message if not.
 */
const login = async (req: Request, res: Response): Promise<Response> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array() });
    }

    const { email, password } = req.body;

    // Authenticate user using authService
    const user = await authService.login(email, password);

    if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Add JWT to response for authentication cookie for 15 days
    putJwtInResponse(
        res,
        user,
        parseInt(process.env.AUTH_TOKEN_DAYS_EXP || '0'),
        process.env.AUTH_TOKEN
    );

    return res.status(200).json({ message: 'Login successful', user });
};

/**
 * This method removes the JWT token by setting an empty cookie with an immediate expiration date, effectively logging out the user.
 *
 * @param req - The HTTP Request object, although it is not used in this method as no data is required from the client.
 * @param res - The HTTP Response object used to clear the JWT token and send a response back to the client.
 *
 * @returns Returns a JSON object confirming the logout with status 200. The JWT token is removed from the cookie.
 */
const logout = async (req: Request, res: Response): Promise<Response> => {
    return res
        .cookie(auth_token, '', {
            httpOnly: true,
            expires: new Date(0), // Set the cookie expiration to the past to remove it
        })
        .status(200)
        .json({ message: 'Logout successful' });
};

/**
 * Handles initiating the password reset process.
 *
 * This controller method receives the user's email, validates it, and calls the password reset service.
 * A generic success message is returned regardless of whether the email exists in the database to prevent
 * revealing user information.
 *
 * @param req - The HTTP request object containing the user's email in the request body.
 * @param res - The HTTP response object used to send a generic confirmation message back to the client.
 * @returns {Promise<Response>} - Returns a JSON response indicating that, if the email exists, instructions will be sent.
 */
const forgotPassword = async (
    req: Request,
    res: Response
): Promise<Response> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array() });
    }

    const { email } = req.body;

    await authService.initiatePasswordReset(email);

    // Sends a generic response to prevent information disclosure about user existence
    return res.status(200).json({
        message:
            'If your email is registered, you will receive password reset instructions.',
    });
};

const verifyResetCode = async (
    req: Request,
    res: Response
): Promise<Response> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ message: errors.array() });
    }

    const { email, code } = req.body;

    const user = await authService.verifyResetCode(email, code);

    if (!user) {
        return res
            .status(400)
            .json({ message: 'Invalid or expired reset code' });
    }

    // Use the utility function with 15 minutes expiration
    putJwtInResponse(
        res,
        user,
        parseInt(process.env.RESET_PASSWORD_TOKEN_MINUTES_EXP || '0'),
        process.env.RESET_PASSWORD_TOKEN
    );

    return res
        .status(200)
        .json({ message: 'Reset code verified successfully' });
};

export const authController = {
    login,
    logout,
    forgotPassword,
    verifyResetCode,
};

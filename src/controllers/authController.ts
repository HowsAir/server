/**
 * @file authController.ts
 * @brief Controller for handling authentication-related operations.
 * @author Juan Diaz & Manuel Borregales
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { auth_token } from '../middleware/auth';
import { putJwtInResponse } from '../utils/auth';
import { authService } from '../services/authService';

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
    try {
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

        // Add JWT to response for authentication cookie for 2 days
        putJwtInResponse(res, user);

        return res.status(200).json({ message: 'Login successful', user });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
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

export const authController = {
    login,
    logout,
};

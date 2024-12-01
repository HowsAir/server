/**
 * @file authController.ts
 * @brief Controller for handling authentication-related operations.
 * @author Manuel Borregales & Juan Diaz
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import {
    putJwtInResponse,
    putJwtWithEmailInResponse,
    getEmailFromToken,
} from '../utils/auth';
import { authService } from '../services/authService';
import {
    auth_token,
    password_reset_token,
    email_verified_token,
} from '../middleware/auth';
import { ApplicationForm } from '../types/forms/ApplicationForm';

/**
 * Login controller method.
 *
 * This function handles user login by validating credentials and returning a JWT if successful.
 *
 * @param req - The HTTP request containing email and password in the body.
 * @param res - The HTTP response object to send the JWT token in a cookie if successful.
 * @returns {Promise<Response|void>} - Returns a JSON response with the user details and token if successful, or an error message if not.
 */
const login = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
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

        // Add JWT to response for authentication cookie for 15 days
        putJwtInResponse(res, user, auth_token);

        return res.status(200).json({ message: 'Login successful', user });
    } catch (error) {
        next(error);
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
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
    try {
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
    } catch (error) {
        next(error);
    }
};

/**
 * Verifies the reset code for a user.
 *
 * This function checks the provided reset code against the stored code for the given email.
 * If the code is valid and not expired, it issues a password reset token by setting a cookie.
 *
 * @param req - The HTTP request containing the user's email and reset code in the body.
 * @param res - The HTTP response to send a success message and set a reset token if verification is successful.
 * @returns {Promise<Response>} - Returns a JSON response indicating whether the reset code was verified.
 */
const verifyResetCode = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array() });
        }

        const { email, code } = req.query;

        const user = await authService.verifyResetCode(
            email as string,
            code as string
        );

        if (!user) {
            return res
                .status(400)
                .json({ message: 'Invalid or expired reset code' });
        }

        putJwtInResponse(res, user, password_reset_token);

        return res
            .status(200)
            .json({ message: 'Reset code verified successfully' });
    } catch (error) {
        next(error);
    }
};

/**
 * Sends a confirmation email with a verification link to the user's email.
 *
 * This controller method generates a verification link and sends it to the user's email
 * if the email is not already associated with an account.
 *
 * @param req - The HTTP request containing the user's email in the body.
 * @param res - The HTTP response to send a success or error message.
 * @returns {Promise<Response>} - Returns a JSON response indicating if the email was sent or if the email is already registered.
 */
const sendConfirmationEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array() });
        }

        const { email } = req.body;

        const existingUser = await authService.sendVerificationEmail(email);

        if (existingUser != null) {
            return res.status(400).json({ message: 'Email is not valid' });
        }

        return res.status(200).json({
            message: 'Verification email sent successfully',
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Creates an email verification token and sets it as a cookie.
 *
 * This function is called when the user clicks on the verification link. It decodes the
 * email from the token in the query, sets a cookie with the email for verification, and
 * confirms the email if everything is valid.
 *
 * @param req - The HTTP request containing the token in the query.
 * @param res - The HTTP response to set the verification cookie and return a success message.
 * @returns {Promise<Response>} - Returns a JSON response indicating the email was verified.
 */
const createEmailVerificationToken = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array() });
        }

        const { token } = req.query;

        const decodedEmail = getEmailFromToken(token as string);

        if (!decodedEmail) {
            return res.status(400).json({ message: 'Invalid token' });
        }

        putJwtWithEmailInResponse(res, decodedEmail);

        return res.status(200).json({ message: 'Email verified successfully' });
    } catch (error) {
        next(error);
    }
};

/**
 * Confirms that the user's email matches the verified email.
 *
 * This function checks if the email submitted in the request matches the decoded email in the cookie.
 * If they match, the function clears the email verification cookie and confirms the email.
 *
 * @param req - The HTTP request containing the email from the client and the decoded email from the cookie.
 * @param res - The HTTP response to clear the email verification cookie and confirm the email.
 * @returns {Promise<Response>} - Returns a JSON response indicating the email was confirmed or not.
 */
const confirmEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array() });
        }

        const { email, decodedEmail } = req.query;

        const emailConfirmed = (email as string) === (decodedEmail as string);

        if (!emailConfirmed) {
            return res.status(400).json({ message: 'Emails do not match' });
        }

        return res
            .cookie(email_verified_token, '', {
                httpOnly: true,
                expires: new Date(0), // Set the cookie expiration to the past to remove it
            })
            .status(200)
            .json({ message: 'Email confirmed successfully' });
    } catch (error) {
        next(error);
    }
};

/**
 * Controller that handles the process of receiving an application form,
 * validating the input, and sending a confirmation email.
 * If validation fails or an error occurs during the email sending process,
 * an appropriate response is returned to the client.
 *
 * @param req - The request object
 * @param res - The response object used to send a response back to the client.
 * @param next - The next middleware function in the Express chain
 *
 * @returns A response with status code 200 if the application is successfully received
 *          and the email is sent, or an error response with a corresponding status code
 *          if there is a failure during validation or email sending.
 *
 * @throws {Error} If an error occurs while sending the application email or processing the request.
 */
const sendApplicationEmail = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
    try {
        // Validate the request body using express-validator
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const formData: ApplicationForm = req.body;

        // Call the service to send the application email
        await authService.sendApplicationEmail(formData);

        // Return success response
        return res.status(200).json({
            message:
                'Application received successfully. You will be contacted soon.',
        });
    } catch (error) {
        next(error);
    }
};

export const authController = {
    login,
    logout,
    forgotPassword,
    verifyResetCode,
    sendConfirmationEmail,
    createEmailVerificationToken,
    confirmEmail,
    sendApplicationEmail,
};

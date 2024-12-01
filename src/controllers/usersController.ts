/**
 * @file usersController.ts
 * @brief Controller for managing user-related operations
 * @author Juan Diaz & Manuel Borregales
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { usersService } from '../services/usersService';
import { putJwtInResponse } from '../utils/auth';
import { measurementsService } from '../services/measurementsService';
import { auth_token, password_reset_token } from '../middleware/auth';
import { PasswordResetStatus } from '../types/auth/PasswordResetStatus';
import { DashboardData } from '../types/measurements/DashboardData';
import { nodesService } from '../services/nodesService';
import { RegisterAdminAuthorizationCode } from '../types/users/RegisterAdminAuthorizationCode';
import { dailyStatsService } from '../services/dailyStatsService';

/**
 * Controller method for user registration.
 *
 * @param req - The HTTP Request object containing user details in the body.
 * @param res - The HTTP Response object used to return the result to the client.
 *
 * @returns Returns a JSON object with the registered user and status 201 on success, or an error message with status 400 or 500.
 */
const register = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array() });
        }

        const {
            email,
            password,
            name,
            surnames,
            phone,
            country,
            city,
            address,
            zipCode,
        } = req.body;

        const userData = {
            email,
            password,
            name,
            surnames,
            phone,
            country,
            city,
            zipCode,
            address,
        };
        // Use service to handle registration logic
        const existingUser = await usersService.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const createdUser = await usersService.register(userData);

        // Add JWT to response for later token validation
        putJwtInResponse(res, createdUser, auth_token);

        return res.status(201).json({
            message: 'User registered successfully',
            user: createdUser,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Controller method for admin registration.
 *
 * @param req - The HTTP Request object containing admin details in the body.
 * @param res - The HTTP Response object used to return the result to the client.
 *
 * @returns Returns a JSON object with the registered admin and status 201 on success, or an error message with status 400 or 500.
 */
const registerAdmin = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array() });
        }

        const { email, password, name, surnames, authorizationCode } = req.body;

        if (
            parseInt(authorizationCode, 10) !== RegisterAdminAuthorizationCode
        ) {
            return res
                .status(403)
                .json({ message: 'Invalid authorization code' });
        }

        const userData = {
            email,
            password,
            name,
            surnames,
        };

        const existingUser = await usersService.getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const createdAdmin = await usersService.registerAdmin(userData);

        putJwtInResponse(res, createdAdmin, auth_token);

        return res.status(201).json({
            message: 'Admin registered successfully',
            user: createdAdmin,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Controller method for retrieving user profile information.
 *
 * @param req - The HTTP Request object, which should contain the user's ID in `req.userId`.
 * @param res - The HTTP Response object used to send the user data back to the client.
 * @param next - The NextFunction to handle errors and pass them to the error handler middleware.
 *
 * @returns Returns a JSON object with the user's profile information and status 200 on success,
 * or an error message with status 404 if the user is not found, or status 500 if there is a server error.
 */
const getProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
    try {
        const userId = req.userId;

        const user = await usersService.getUserById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({
            message: 'Profile retrieved successfully',
            user: user,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Controller method for updating user profile information.
 *
 * @param req - The HTTP Request object containing the fields to update in the body (e.g., name, surnames, photo).
 * @param res - The HTTP Response object used to send the updated user data back to the client.
 *
 * @returns Returns a JSON object with the updated user information and status 200 on success,
 * or an error message with status 400 or 500 if there was a validation error or server error.
 */
const updateProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array() });
        }

        const { name, surnames } = req.body;
        const userId = req.userId;
        const photo = req.file as Express.Multer.File;

        const updatedUser = await usersService.updateProfile(userId, {
            name,
            surnames,
            photo,
        });

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({
            message: 'Profile updated successfully',
            user: updatedUser,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Controller method for changing an user's password.
 *
 * @param req - Express request object containing currentPassword and newPassword in body.
 * @param res - Express response object.
 * @returns {Promise<Response>} - A promise that resolves with the HTTP response.
 */
const changePassword = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { currentPassword, newPassword } = req.body;
        const userId = req.userId;

        const passwordChanged = await usersService.changePassword(
            userId,
            currentPassword,
            newPassword
        );

        if (!passwordChanged) {
            return res
                .status(400)
                .json({ message: 'Incorrect current password' });
        }

        return res
            .cookie(auth_token, '', {
                httpOnly: true,
                expires: new Date(0), // Set the cookie expiration to the past to remove it
            })
            .status(200)
            .json({ message: 'Password updated successfully' });
    } catch (error) {
        next(error);
    }
};

/**
 * Controller method for resetting a user's password.
 *
 * @param req - Express request object containing newPassword in body.
 * @param res - Express response object.
 * @returns {Promise<Response>} - A promise that resolves with the HTTP response.
 */
const resetPassword = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array() });
        }

        const { newPassword } = req.body;
        const userId = req.userId;

        const { status } = await usersService.resetPassword(
            userId,
            newPassword
        );

        switch (status) {
            case PasswordResetStatus.FAIL:
                return res.status(400);

            case PasswordResetStatus.MATCH:
                return res.status(400).json({
                    message:
                        'New password cannot be the same as the current password',
                });

            case PasswordResetStatus.SUCCESS:
                return res
                    .cookie(password_reset_token, '', {
                        httpOnly: true,
                        expires: new Date(0),
                    })
                    .cookie(auth_token, '', {
                        httpOnly: true,
                        expires: new Date(0),
                    })
                    .status(200)
                    .json({ message: 'Password reset successfully' });

            default:
                return res.status(500).json({ message: 'Unknown error' });
        }
    } catch (error) {
        next(error);
    }
};

/**
 * Controller method for getting the user's dashboard data.
 *
 * @param req - The HTTP Request object containing user information, with userId extracted from the token.
 * @param res - The HTTP Response object used to return the dashboard data to the client.
 * @param next - Express next function for error handling.
 *
 * @returns {Promise<Response | void>} - A promise that resolves with the HTTP response.
 */
const getDashboard = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
    try {
        const userId = req.userId;

        const dashboardData =
            await measurementsService.getDashboardData(userId);

        if (!dashboardData) {
            return res.status(404).json({
                message: 'No dashboard data found for this user',
            });
        }

        return res.status(200).json({
            message: 'Dashboard data retrieved successfully',
            data: dashboardData,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Controller method for getting the total distance covered by the user in the last month
 *
 * @param req - The HTTP Request object containing user information, with userId extracted from the token.
 * @param res - The HTTP Response object used to return the total monthly distance to the client.
 *
 * @returns {Promise<Response>} - A promise that resolves with the HTTP response.
 */
const getCurrentMonthDistance = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
    try {
        const userId = req.userId;

        const currentMonthDistance =
            await dailyStatsService.getCurrentMonthDistance(userId);
        return res.status(200).json({
            message: 'Total distance for the last month retrieved successfully',
            currentMonthDistance,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Controller method for getting the users statistics information (name, phone, nodeId, activeHours, distance)
 *
 * @param req - The HTTP Request object containing the userId and the roleId
 * @param res - The HTTP Response object used to return the usersStatistics to the client.
 *
 * @returns {Promise<Response>} - A promise that resolves with the HTTP response.
 */
const getStatistics = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
    try {
        const usersStatistics = await usersService.getStatistics();
        return res.status(200).json({
            message: 'Users statistics retrieved successfully',
            usersStatistics,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Controller method to get the node information for an authenticated user.
 *
 * @param req - The HTTP Request object containing the authenticated userId.
 * @param res - The HTTP Response object used to return the node information to the client.
 * @param next - The next middleware function in the Express chain.
 *
 * @returns {Promise<Response>} - A promise that resolves with the HTTP response.
 */
const getNode = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
    try {
        const userId = req.userId;

        const node = await nodesService.getNodeByUserId(userId);

        if (!node) {
            return res.status(404).json({ message: 'Node not found' });
        }

        return res.status(200).json({
            message: 'Node retrieved successfully',
            node,
        });
    } catch (error) {
        next(error);
    }
};

export const usersController = {
    register,
    registerAdmin,
    getProfile,
    updateProfile,
    changePassword,
    resetPassword,
    getDashboard,
    getCurrentMonthDistance,
    getStatistics,
    getNode,
};

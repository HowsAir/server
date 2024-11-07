/**
 * @file usersController.ts
 * @brief Controller for managing user-related operations
 * @author Juan Diaz & Manuel Borregales
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { usersService, PasswordResetStatus } from '../services/usersService';
import { putJwtInResponse } from '../utils/auth';
import { measurementsService } from '../services/measurementsService';
import { auth_token, password_reset_token } from '../middleware/auth';

/**
 * Controller method for user registration.
 *
 * @param req - The HTTP Request object containing user details in the body.
 * @param res - The HTTP Response object used to return the result to the client.
 *
 * @returns Returns a JSON object with the registered user and status 201 on success, or an error message with status 400 or 500.
 */
const register = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
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
        const existingUser = await usersService.findUserByEmail(email);
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
 * Controller method for updating user profile information.
 *
 * @param req - The HTTP Request object containing the fields to update in the body (e.g., name, surnames).
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
    
        const updatedUser = await usersService.updateProfile(userId, {
            name,
            surnames,
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
            return res.status(400).json({ message: 'Incorrect current password' });
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
    
        const { status } = await usersService.resetPassword(userId, newPassword);
    
        switch (status) {
            case PasswordResetStatus.FAIL:
                return res
                    .status(400)
    
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
 * Controller method for updating an user's profile photo.
 *
 * @param req - Express request object containing photo in the body.
 * @param res - Express response object.
 * @returns {Promise<Response>} - A promise that resolves with the HTTP response.
 */
const updateProfilePhoto = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<Response | void> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        const userId = req.userId;
        const photo = req.file as Express.Multer.File;
    
        const updatedUser = await usersService.updateProfilePhoto(userId, photo);
    
        return res.status(200).json({
            message: 'Profile photo updated successfully',
            user: updatedUser,
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Controller method for getting the total distance covered by the user today.
 *
 * @param req - The HTTP Request object containing user information, with userId extracted from the token.
 * @param res - The HTTP Response object used to return the total distance to the client.
 *
 * @returns Returns a JSON object with the total distance and status 200 on success,
 * or an error message with status 500 if there was an issue retrieving the distance.
 */
const getTodayTotalDistance = async (req: Request, res: Response, next: NextFunction): Promise<Response | void> => {
    try {
        const userId = req.userId;
    
        const totalDistance = await measurementsService.getTodayTotalDistance(userId);
        return res.status(200).json({
            message: 'Total distance for today retrieved successfully',
            totalDistance,
        });
    } catch (error) {
        next(error);
    }
};

export const usersController = {
    register,
    updateProfile,
    changePassword,
    resetPassword,
    updateProfilePhoto,
    getTodayTotalDistance,
};

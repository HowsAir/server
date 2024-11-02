/**
 * @file usersController.ts
 * @brief Controller for managing user-related operations
 * @author Juan Diaz
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { usersService } from '../services/usersService';
import { putJwtInResponse } from '../utils/auth';
import { auth_token } from '../middleware/auth';

/**
 * Controller method for user registration.
 *
 * @param req - The HTTP Request object containing user details in the body.
 * @param res - The HTTP Response object used to return the result to the client.
 *
 * @returns Returns a JSON object with the registered user and status 201 on success, or an error message with status 400 or 500.
 */
const register = async (req: Request, res: Response): Promise<Response> => {
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
        putJwtInResponse(res, createdUser);

        return res.status(201).json({
            message: 'User registered successfully',
            user: createdUser,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
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
const updateProfile = async (req: Request, res: Response): Promise<Response> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array() });
        }

        const { name, surnames } = req.body;
        const userId = req.userId;

        const updatedUser = await usersService.updateProfile(userId, { name, surnames });

        if (!updatedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        return res.status(200).json({
            message: 'Profile updated successfully',
            user: updatedUser,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

/**
 * Controller method for changing an user's password.
 *
 * @param req - Express request object containing currentPassword and newPassword in body.
 * @param res - Express response object.
 * @returns {Promise<Response>} - A promise that resolves with the HTTP response.
 */
const changePassword = async (req: Request, res: Response): Promise<Response> => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
    
        const { currentPassword, newPassword } = req.body;
        const userId = req.userId;
    
        const passwordChanged = await usersService.changePassword(userId, currentPassword, newPassword);
    
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
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Internal server error' });
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
    res: Response
): Promise<Response> => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const userId = req.userId;
    const photo = req.file as Express.Multer.File;

    const updatedUser = await usersService.updateProfilePhoto(
        userId,
        photo
    );

    return res.status(200).json({
        message: 'Profile photo updated successfully',
        user: updatedUser,
    });
};

export const usersController = {
    register,
    updateProfile,
    changePassword,
    updateProfilePhoto,
};

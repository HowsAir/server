/**
 * @file usersController.ts
 * @brief Controller for managing user-related operations
 * @author Juan Diaz
 */

import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import { usersService } from '../services/usersService';
import { User } from '@prisma/client';
import { putJwtInResponse } from '../utils/auth';

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

        const { email, password, name } = req.body;

        // Use service to handle registration logic
        const existingUser = await usersService.findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const newUser: Omit<User, 'id' | 'role'> = {
            email,
            password,
            name,
        };

        const createdUser = await usersService.register(newUser);

        // Add JWT to response for later token validation
        putJwtInResponse(res, createdUser);

        return res
            .status(201)
            .json({
                message: 'User registered successfully',
                user: createdUser,
            });
    } catch (error) {
        return res.status(500).json({ message: 'Internal server error' });
    }
};

export const usersController = {
    register,
};

/**
 * @file auth.ts
 * @brief Utility functions for Authentication in the API
 *
 * @author Juan Diaz
 */

import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { auth_token } from '../middleware/auth';
import { User } from '@prisma/client';

// Number of days the JWT token will be valid
const daysExpiration = 2;

/**
 * Function to generate a JWT token and attach it to the response as a cookie.
 *
 * @param res - The HTTP response object where the JWT token will be stored as a cookie.
 * @param userId - The user ID to be embedded inside the JWT token.
 *
 * The token is signed with the user's ID for security reasons and set to expire in a configurable number of days.
 * It is stored in the cookies with the 'httpOnly' and 'secure' flags for security, ensuring it's only accessible via HTTP requests.
 */
export const putJwtInResponse = (res: Response, user: User): void => {
    // Hide the userId inside the token for security and future use
    const token = jwt.sign(
        {
            userId: user.id,
            role: user.roleId,
        },
        process.env.JWT_SECRET_KEY as string,
        { expiresIn: `${daysExpiration}d` } // Token valid for 2 days
    );

    // Convert 2 days to milliseconds for maxAge
    const maxAge = daysExpiration * 24 * 60 * 60 * 1000; // 2 days in milliseconds

    // Add the token as a cookie in the response, with security configurations
    res.cookie(auth_token, token, {
        httpOnly: true, // Cookie is only accessible via HTTP
        secure: process.env.NODE_ENV === 'production', // Secure flag only in production
        maxAge: maxAge, // Cookie expires in 2 days
    });
};

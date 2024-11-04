/**
 * @file auth.ts
 * @brief Utility functions for Authentication in the API
 * @author Juan Diaz & Manuel Borregales
 */

import jwt from 'jsonwebtoken';
import { Response } from 'express';
import { User } from '@prisma/client';

export const jwtConfig = {
    auth_token: {
        name: 'auth_token',
        expirationMinutes: 21600,
    },
    password_reset_token: {
        name: 'password_reset_token',
        expirationMinutes: 15,
    },
} as const;

type JwtConfigKey = keyof typeof jwtConfig;

/**
 * Function to generate a JWT token and attach it to the response as a cookie.
 *
 * @param res - The HTTP response object where the JWT token will be stored as a cookie.
 * @param userId - The user ID to be embedded inside the JWT token.
 *
 * The token is signed with the user's ID for security reasons and set to expire in a configurable number of days.
 * It is stored in the cookies with the 'httpOnly' and 'secure' flags for security, ensuring it's only accessible via HTTP requests.
 */
export const putJwtInResponse = (
    res: Response,
    user: User,
    configKey: JwtConfigKey
): void => {
    const { name, expirationMinutes } = jwtConfig[configKey];

    const token = jwt.sign(
        { userId: user.id, role: user.roleId },
        process.env.JWT_SECRET_KEY as string,
        { expiresIn: `${expirationMinutes}m` }
    );

    res.cookie(name, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: expirationMinutes * 60 * 1000, // Convert minutes to ms
    });
};

/**
 * Generates a 6-digit numeric reset code.
 *
 * This code is used for password reset purposes. It generates a random number
 * between 100000 and 999999, ensuring it is always a 6-digit code.
 *
 * @returns {string} - A string representation of a 6-digit code.
 */
export const generateResetCode = (): string => {
    return Math.floor(100000 + Math.random() * 900000)
        .toString()
        .padStart(6, '0');
};

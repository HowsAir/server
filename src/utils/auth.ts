/**
 * @file auth.ts
 * @brief Utility functions for Authentication in the API
 * @author Juan Diaz & Manuel Borregales
 */

import jwt, { JwtPayload } from 'jsonwebtoken';
import { Response } from 'express';
import { User } from '@prisma/client';
import { email_verified_token } from '../middleware/auth';

export const jwtConfig = {
    auth_token: {
        name: 'auth_token',
        expirationMinutes: 21600,
    },
    password_reset_token: {
        name: 'password_reset_token',
        expirationMinutes: 15,
    },
    email_verified_token: {
        name: email_verified_token,
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
 * Function to generate a JWT token with the user's email and attach it to the response as a cookie.
 *
 * @param res - The HTTP response object where the JWT token will be stored as a cookie.
 * @param email - The email to be embedded inside the JWT token.
 *
 * This function creates a JWT token containing the user's email, signed with a secret key,
 * and sets it to expire based on configuration. The token is stored in a cookie with
 * 'httpOnly' and 'secure' flags for security, ensuring access only via HTTP requests.
 */
export const putJwtWithEmailInResponse = (
    res: Response,
    email: string
): void => {
    const { name, expirationMinutes } = jwtConfig.email_verified_token;

    const token = jwt.sign(
        { email: email },
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
 * Function to retrieve the email embedded within a JWT token.
 *
 * @param token - The JWT token containing the encoded email.
 * @returns {string} - Returns the email address decoded from the JWT token payload.
 *
 * This function verifies the JWT token using a secret key and extracts the email field
 * from the payload. The returned email can then be used for further validation or processing.
 */
export const getEmailFromToken = (token: string): string => {
    const decoded = jwt.verify(
        token as string,
        process.env.JWT_SECRET_KEY as string
    ) as JwtPayload;
    return decoded.email as string;
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

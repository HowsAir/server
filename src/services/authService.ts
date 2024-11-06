/**
 * @file authService.ts
 * @brief Service to handle auth-related operations
 * @author Manuel Borregales
 */

import { User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import prisma from '../libs/prisma';
import {
    sendPasswordResetEmail,
    sendEmailVerification,
} from '../utils/emailSender';
import jwt from 'jsonwebtoken';
import { generateResetCode, jwtConfig } from '../utils/auth';
import { findUserByEmail } from './usersService';
import {} from 'dotenv';

/**
 * Validates the login credentials and returns the user if successful.
 *
 *      Text:email   ---> login() --->  User || null
 *      Text:password
 *
 * @param email - The email of the user attempting to login.
 * @param password - The password provided for login.
 * @returns {Promise<User | null>} - The authenticated user if credentials are valid, otherwise null.
 */
const login = async (email: string, password: string): Promise<User | null> => {
    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        return null;
    }

    // Compare provided password with hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
        return null;
    }

    return user;
};

/**
 * Sends and email to the user with a password reset code.
 *
 *      Text:email   ---> initiatePasswordReset() --->  void || error
 *
 * @param email - The email of the user attempting to login.
 * @param password - The password provided for login.
 * @returns {Promise<void | error>} - an error if the email failed.
 */
const initiatePasswordReset = async (email: string): Promise<void> => {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
        return;
    }

    const resetCode = generateResetCode();
    await prisma.passwordResetToken.create({
        data: {
            userId: user.id,
            code: resetCode,
            timestamp: new Date(),
        },
    });

    await sendPasswordResetEmail(email, resetCode);
};

/**
 * Verifies the password reset code for a given email.
 *
 * This function retrieves the user associated with the provided email and checks the most recent
 * password reset token. It determines if the token is still valid (i.e., within 15 minutes)
 * and matches the provided code.
 *
 * @param email - The user's email address to verify the reset code against.
 * @param code - The 6-digit reset code provided by the user.
 * @returns {Promise<User | null>} - Returns the user object if the reset code is valid; otherwise, returns null.
 */
const verifyResetCode = async (
    email: string,
    code: string
): Promise<User | null> => {
    const user = await prisma.user.findUnique({
        where: { email },
        include: {
            passwordResetTokens: {
                // Order the tokens by timestamp and take the most recent one
                orderBy: { timestamp: 'desc' },
                take: 1,
            },
        },
    });

    if (!user || user.passwordResetTokens.length === 0) {
        return null;
    }

    const latestToken = user.passwordResetTokens[0];
    const tokenAge = Date.now() - latestToken.timestamp.getTime();

    const isTokenValid =
        tokenAge <=
        jwtConfig.password_reset_token.expirationMinutes * 60 * 1000; // 15 minutes in milliseconds

    if (!isTokenValid || latestToken.code !== code) {
        return null;
    }

    // If the token is valid and matches the code, return the user object
    return user;
};

const sendVerificationEmail = async (email: string): Promise<User | void> => {
    const existingUser = await findUserByEmail(email);

    if (existingUser !== null) {
        return existingUser;
    }

    // Generate a JWT token with the user's email
    const token = jwt.sign({ email }, process.env.JWT_SECRET_KEY as string, {
        expiresIn: '15m',
    });

    const verificationUrl = `${process.env.BACKEND_URL}/api/v1/auth/create-email-verification-token?token=${token}`;

    // Send the verification email
    await sendEmailVerification(email, verificationUrl);
};

export const authService = {
    login,
    initiatePasswordReset,
    verifyResetCode,
    sendVerificationEmail,
    // confirmEmail,
};

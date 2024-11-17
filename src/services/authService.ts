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
    sendEmailApplication,
} from '../utils/emailSender';
import jwt from 'jsonwebtoken';
import { generateResetCode, jwtConfig } from '../utils/auth';
import { getUserByEmail } from './usersService';
import 'dotenv/config';
import { ApplicationForm } from '../types/ApplicationForm';

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

/**
 * Function to send a verification email to the user.
 *
 * @param email - The email address to which the verification link will be sent.
 * @returns {Promise<User | void>} - Returns the existing user if found, or void if the email is new and an email is sent.
 *
 * This function first checks if the email already belongs to an existing user in the database.
 * If it does, it returns the user and skips sending the verification email.
 * Otherwise, it encrypts the user's email, with an expiration time and adds it to a verification
 * URL as a query parameter, which is then included in the email sent to the user.
 * The user can click the link to verify their email address.
 */
const sendVerificationEmail = async (email: string): Promise<User | void> => {
    const existingUser = await getUserByEmail(email);

    if (existingUser !== null) {
        return existingUser;
    }

    // Generate a JWT token with the user's email
    const token = jwt.sign({ email }, process.env.JWT_SECRET_KEY as string, {
        expiresIn: '15m',
    });

    const verificationUrl = `${process.env.BACKEND_URL}/api/v1/auth/email-confirmation-token?token=${token}`;

    // Send the verification email
    await sendEmailVerification(email, verificationUrl);
};

/**
 * Processes an application form submission and sends an email if eligible.
 *
 * @async
 * @function sendApplicationEmail
 * @param {ApplicationForm} formData - The form data submitted by the user, including details like name, email, and address.
 * @returns {Promise<User | void>} - Returns an existing user if found; otherwise, sends an application email and returns void.
 *
 * @description
 * This function handles the process of checking whether an application can proceed based on user data.
 * It performs the following steps:
 * 1. Check for Existing User.
 * 2. Geographic Validation.
 * 3. Send Application Email.
 *
 * @throws Will throw an error if the applicant is not located in Spain and Valencia.
 *
 * @note This function does not save the form data to the database; it only checks for existing users and sends an email.
 */
const sendApplicationEmail = async (
    formData: ApplicationForm
): Promise<User | void> => {
    const existingUser = await getUserByEmail(formData.email);

    if (existingUser !== null) {
        return existingUser;
    }

    if (formData.country !== 'España' || formData.city !== 'Valencia') {
        throw new Error('Only available for Spain and Valencia');
    }

    await sendEmailApplication(formData);
};

export const authService = {
    login,
    initiatePasswordReset,
    verifyResetCode,
    sendVerificationEmail,
    sendApplicationEmail,
};

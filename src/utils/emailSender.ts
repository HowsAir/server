/**
 * @file emailSender.ts
 * @brief Service to handle sending emails from HowsAir requests.
 * @author Manuel Borregales
 */

import nodemailer from 'nodemailer';
import { config } from 'dotenv';

config();

// Initialize NodeMailer transporter with the environment variables
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD, // This is the App Password, not your regular Gmail password
    },
});

/**
 * Sends a password reset email to the specified user email address.
 *
 * @async
 * @function sendPasswordResetEmail
 * @param {string} email - The recipient's email address.
 * @param {string} resetCode - The 6-digit password reset code to include in the email.
 * @returns {Promise<void>} - Resolves when the email has been successfully sent.
 * @throws Will throw an error if the email could not be sent.
 *
 * @description
 * This function composes an HTML email with the reset code and sends it to the specified email address.
 * It uses Resend’s email sending service to dispatch the email. The function does not disclose if the
 * email was sent successfully, enhancing security by avoiding exposure of user existence.
 */
export const sendPasswordResetEmail = async (
    email: string,
    resetCode: string
): Promise<void> => {
    const html = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Password Reset Code</h2>
            <p>You have requested to reset your password. Here is your reset code:</p>
            <div style="background-color: #f4f4f4; padding: 15px; border-radius: 5px; text-align: center; font-size: 24px; letter-spacing: 5px;">
                <strong>${resetCode}</strong>
            </div>
            <p>This code will expire in 15 minutes.</p>
            <p style="color: #666; font-size: 14px;">If you did not request this reset, please ignore this email.</p>
        </div>
    `;

    try {
        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset Code',
            html: html,
        });
    } catch (error) {
        console.error('Error sending email:', error);
        throw new Error('Failed to send email');
    }
};

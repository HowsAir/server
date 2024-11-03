/**
 * @file usersService.ts
 * @brief Service to handle user-related operations
 * @author Juan Diaz
 */

import { User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import prisma from '../libs/prisma';
import cloudinaryService, { CloudinaryFolders } from './cloudinaryService';

/**
 * Registers a new user in the database
 *
 * @param userData - An object containing user details.
 * @returns {Promise<User>} - A promise that resolves with the newly created user.
 * @throws {Error} - Throws an error if the user cannot be created.
 */
const register = async (userData: {
    email: string;
    password: string;
    name: string;
    surnames: string;
    phone: string;
    country: string;
    city: string;
    zipCode: string;
    address: string;
}): Promise<User> => {
    // Hash the password before saving the user
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Create the new user data object
    const newUserData: Omit<User, 'id'> = {
        ...userData,
        password: hashedPassword,
        roleId: 1, // Assuming roleId 1 is for basic users
        photoUrl: null,
    };

    // Create the user entry in the database
    return await prisma.user.create({
        data: newUserData,
    });
};

/**
 * Finds a user by email in the database
 *
 * Text: email -> findUserByEmail() -> Promise<User | null>
 *
 * @param email - The email of the user to search for.
 * @returns {Promise<User | null>} - A promise that resolves with the found user or null if not found.
 */
const findUserByEmail = async (email: string): Promise<User | null> => {
    return await prisma.user.findUnique({
        where: { email },
    });
};

/**
 * Updates the user's profile with optional name and surnames
 *
 * Number: userId, { name?: string, surnames?: string } -> updateProfile() -> Promise<User>
 *
 * @param userId - The unique identifier of the user to update.
 * @param data - An object containing the optional name and/or surnames to update.
 * @returns {Promise<User>} - A promise that resolves with the updated user object.
 * @throws {Error} - Throws an error if the user cannot be updated.
 */
const updateProfile = async (
    userId: number,
    data: { name?: string; surnames?: string }
): Promise<User> => {
    return await prisma.user.update({
        where: { id: userId },
        data: {
            name: data.name ?? undefined,
            surnames: data.surnames ?? undefined,
        },
    });
};

/**
 * Changes the password for a user if the current password matches
 *
 * Number: userId, Text: currentPassword, newPassword -> changePassword() -> Promise<boolean>
 *
 * @param userId - The unique identifier of the user.
 * @param currentPassword - The user's current password.
 * @param newPassword - The new password to set.
 * @returns {Promise<boolean>} - A promise that resolves to `true` if the password was changed, `false` otherwise.
 * @throws {Error} - Throws an error if there is an issue updating the password.
 */
const changePassword = async (
    userId: number,
    currentPassword: string,
    newPassword: string
): Promise<boolean> => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return false;

    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return false;

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
    });

    return true;
};

/**
 * Resets the password for a user that forgot their password
 *
 * Number: userId, Text: newPassword -> ResetPassword() -> Promise<boolean>
 *
 * @param userId - The unique identifier of the user.
 * @param newPassword - The new password to set.
 * @returns {Promise<boolean>} - A promise that resolves to `true` if the password was changed, `false` otherwise.
 * @throws {Error} - Throws an error if there is an issue updating the password.
 */
const resetPassword = async (
    userId: number,
    newPassword: string
): Promise<boolean> => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return false;

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
    });

    return true;
};

/**
 * Updates the user's profile photo using Cloudinary
 *
 * Number: userId, File: photo -> updateProfilePhoto() -> Promise<User>
 *
 * @param userId - The ID of the user whose profile photo is being updated.
 * @param photo - The uploaded image file as an Express.Multer.File.
 * @returns {Promise<User>} - A promise that resolves with the updated user object or null if
 * @throws {Error} - Throws an error if the upload fails or the user is not found.
 */
const updateProfilePhoto = async (
    userId: number,
    photo: Express.Multer.File
): Promise<User | null> => {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return null;

    // Upload the new profile photo to Cloudinary
    let newPhotoUrl: string;
    newPhotoUrl = await cloudinaryService.uploadImageToCloudinary(
        photo,
        CloudinaryFolders.PROFILE_PHOTOS
    );

    const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { photoUrl: newPhotoUrl },
    });

    if (user.photoUrl) {
        try {
            await cloudinaryService.deleteImageFromCloudinary(
                user.photoUrl,
                CloudinaryFolders.PROFILE_PHOTOS
            );
        } catch (error) {
            console.error(
                'Failed to delete previous user profile photo from Cloudinary: ',
                error
            );
            // Log the error but don’t throw it, as the main operation has succeeded
        }
    }

    return updatedUser;
};

export const usersService = {
    register,
    findUserByEmail,
    updateProfile,
    changePassword,
    resetPassword,
    updateProfilePhoto,
};

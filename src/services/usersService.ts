/**
 * @file usersService.ts
 * @brief Service to handle user-related operations
 * @author Juan Diaz & Manuel Borregales
 */

import { User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import prisma from '../libs/prisma';
import { UserStatistics } from '../types/UserStatistics';
import cloudinaryService from './cloudinaryService';
import { UserRoleId } from '../types/UserRoleId';
import { PasswordResetStatus } from '../types/PasswordResetStatus';
import { CloudinaryFolders } from '../types/CloudinaryFolders';

const saltQuantity = 10;

/**
 * Registers a new user in the database
 *
 * Text: email, password, name, surnames, phone, country, city, zipCode, address -> register() -> Promise<User>
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
    const hashedPassword = await bcrypt.hash(userData.password, saltQuantity);

    // Create the new user data object
    const newUserData: Omit<User, 'id'> = {
        ...userData,
        password: hashedPassword,
        roleId: UserRoleId.User,
        photoUrl: null,
    };

    // Create the user entry in the database
    return await prisma.user.create({
        data: newUserData,
    });
};

/**
 * Registers a new admin in the database
 *
 * Text: email, password, name, surnames -> registerAdmin() -> Promise<User>
 * 
 * @param userData - An object containing admin details.
 * @returns {Promise<User>} - A promise that resolves with the newly created admin user.
 * @throws {Error} - Throws an error if the user cannot be created.
 */
const registerAdmin = async (userData: {
    email: string;
    password: string;
    name: string;
    surnames: string;
}): Promise<User> => {
    const hashedPassword = await bcrypt.hash(userData.password, saltQuantity);

    const newAdminData = {
        ...userData,
        password: hashedPassword,
        roleId: UserRoleId.Admin,
        photoUrl: null,
    };

    // Guarda el usuario en la base de datos
    return await prisma.user.create({
        data: newAdminData,
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
export const findUserByEmail = async (email: string): Promise<User | null> => {
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

    const hashedNewPassword = await bcrypt.hash(newPassword, saltQuantity);

    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
    });

    return true;
};

/**
 * Resets the password for a user that forgot their password.
 *
 * @param userId - The unique identifier of the user.
 * @param newPassword - The new password to set.
 * @returns {Promise<{ status: string }>} - A promise that resolves with `{ status: "success" }` if password was changed,
 * `{ status: "match" }` if the new password matches the current password, or `{ status: "fail" }` if unsuccessful.
 */
const resetPassword = async (
    userId: number,
    newPassword: string
): Promise<{ status: PasswordResetStatus }> => {
    const user = await prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
        return { status: PasswordResetStatus.FAIL };
    }

    const isMatch = await bcrypt.compare(newPassword, user.password);

    if (isMatch) {
        return { status: PasswordResetStatus.MATCH }; // New password matches the current password
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, saltQuantity);

    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedNewPassword },
    });

    return { status: PasswordResetStatus.SUCCESS }; // Password reset successfully
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

/**
 * Retrieves a list of all users with their associated statistics information
 * 
 * getStatistics() -> Promise<UserStatistics[]>
 * 
 * @returns {Promise<UserStatistics[]>} A promise that resolves to an array of user statistics objects.
 * @throws {Error} Throws an error if there is an issue retrieving user statistics from the database
 */
export async function getStatistics(): Promise<UserStatistics[]> {
    const users = await prisma.user.findMany({
        where: {
            roleId: UserRoleId.User,
        },
        select: {
            id: true,
            name: true,
            surnames: true,
            phone: true,
            node: {
                select: {
                    id: true,
                },
            },
            stats: {
                select: {
                    activeHours: true,
                    distance: true,
                },
            },
        },
    });

    // Map data and calculate averages in a single reduce
    const usersStats: UserStatistics[] = users.map(user => {
        const totalStats = user.stats.length;
        const { totalActiveHours, totalDistance } = user.stats.reduce(
        (totals, stat) => {
            totals.totalActiveHours += stat.activeHours;
            totals.totalDistance += stat.distance;
            return totals;
        },
        { totalActiveHours: 0, totalDistance: 0 }
        );

        return {
        id: user.id,
        name: user.name,
        surnames: user.surnames,
        phone: user.phone as string,
        nodeId: user.node?.id || null,
        averageDailyActiveHours: totalStats > 0 ? Number((totalActiveHours / totalStats).toFixed(2)) : 0,
        averageDailyDistance: totalStats > 0 ? Number((totalDistance / totalStats).toFixed(2)) : 0,
        };
    });

    return usersStats;
}

export const usersService = {
    register,
    registerAdmin,
    findUserByEmail,
    updateProfile,
    changePassword,
    resetPassword,
    updateProfilePhoto,
    getStatistics,
};

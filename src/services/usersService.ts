/**
 * @file usersService.ts
 * @brief Service to handle user-related operations
 * @author Juan Diaz
 */

import { User } from '@prisma/client';
import bcrypt from 'bcryptjs';
import prisma from '../libs/prisma';

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
const changePassword = async (userId: number, currentPassword: string, newPassword: string): Promise<boolean> => {
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

export const usersService = {
    register,
    findUserByEmail,
    updateProfile,
    changePassword,
};

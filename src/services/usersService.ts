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
 * email, password, name, surnames -> register() -> Promise<User>
 *
 * @param email - The user's email.
 * @param password - The user's password.
 * @param name - The user's name.
 * @param surnames - The user's surnames.
 * @returns {Promise<User>} - A promise that resolves with the newly created user.
 * @throws {Error} - Throws an error if the user cannot be created.
 */
const register = async (
    email: string,
    password: string,
    name: string,
    surnames: string
): Promise<User> => {
    // Hash the password before saving the user
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create the new user data object
    const newUserData: Omit<User, 'id'> = {
        email,
        password: hashedPassword,
        name,
        surnames,
        roleId: 1, // Assuming roleId 1 is for basic users
        photoUrl: null,
        phone: null,
        country: null,
        city: null,
        zipCode: null,
        address: null,
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

export const usersService = {
    register,
    findUserByEmail,
};

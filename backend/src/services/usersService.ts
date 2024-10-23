/**
 * @file usersService.ts
 * @brief Service to handle user-related operations
 * @author Juan Diaz
 */

import { User } from "@prisma/client";
import bcrypt from "bcryptjs";
import prisma from "../libs/prisma";

/**
 * Registers a new user in the database
 *
 * Omit<User, "id" | "role">: userData -> register() -> Promise<User>
 * 
 * @param userData - An object containing the user's data (email, password, name, etc.).
 * @returns {Promise<User>} - A promise that resolves with the newly created user.
 * @throws {Error} - Throws an error if the user cannot be created.
 */
const register = async (userData: Omit<User, "id" | "role">): Promise<User> => {
  // Hash the password before saving the user
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  
  userData.password = hashedPassword;
  
  return await prisma.user.create({
      data: userData,
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

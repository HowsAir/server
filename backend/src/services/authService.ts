/**
 * @file authService.ts
 * @brief Service to handle auth-related operations
 * @author Manuel Borregales
 */

import { PrismaClient, User } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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
  try {
    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });

    // If user doesn't exist, return null
    if (!user) {
      return null;
    }

    // Compare provided password with hashed password in the database
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      return null;
    }

    // Return the user if credentials are valid
    return user;
  } catch (error) {
    throw error;
  }
};

export const authService = {
  login,
};

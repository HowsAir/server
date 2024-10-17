/**
 * @file authController.ts
 * @brief Controller for handling authentication-related operations.
 * @author Juan Diaz
 */

import { Request, Response } from "express";
import { auth_token } from "../middleware/auth";

/**
 * This method removes the JWT token by setting an empty cookie with an immediate expiration date, effectively logging out the user.
 * 
 * @param req - The HTTP Request object, although it is not used in this method as no data is required from the client.
 * @param res - The HTTP Response object used to clear the JWT token and send a response back to the client.
 *
 * @returns Returns a JSON object confirming the logout with status 200. The JWT token is removed from the cookie.
 */
const logout = async (req: Request, res: Response): Promise<Response> => {
  return res.cookie(auth_token, "", { 
      httpOnly: true, 
      expires: new Date(0) // Set the cookie expiration to the past to remove it
  }).status(200).json({ message: "Logout successful" });
};


/*
*
*FOR LOGIN KEEP IN MIND THAT YOU NEED TO DO VALIDATION
*CREATE METHOD IN authService TO CHECK IF PASSWORD IS CORRECT
*THEN USE PUTJWTINRESPONSE TO PUT JWT IN RESPONSE
*SEE HOW IT IS DONE IN USERS CONTROLLER FOR REGISTER
*USE BCRYPT TO COMPARE PASSWORDS
*/
export const authController = {
  logout,
};

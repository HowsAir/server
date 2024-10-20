/**
 * @file authRoutes.ts
 * @brief Definition of the routes for authentication in the API
 * @author Juan Diaz
 */

import { Router, Request, Response } from "express";
import { authController } from "../controllers/authController";
import {verifyToken} from "../middleware/auth";

const router = Router();


router.post("/login", authController.login);

// Route for validating JWT, passing through verifyToken middleware
router.get("/validate", verifyToken, async (req: Request, res: Response) => {
    return res.status(200).json({ message: "Token is valid" });
});

router.post("/logout", authController.logout);

export default router;

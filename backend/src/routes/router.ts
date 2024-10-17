/**
 * @file router.ts
 * @brief Configuración de las rutas principales de la API
 * @author Juan Diaz
 */

import { Router } from "express";
//import medicionRoutes from "./medicionesRoutes"
import usersRoutes from "./usersRoutes"
import authRoutes from "./authRoutes"

const router = Router();

//router.use("/measurements", medicionRoutes);
router.use("/users", usersRoutes)
router.use("/auth", authRoutes)

export default router;

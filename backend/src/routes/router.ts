/**
 * @file router.ts
 * @brief Configuración de las rutas principales de la API
 * @author Juan Diaz
 */

import { Router } from "express";
import medicionRoutes from "./medicionesRoutes";

const router = Router();

router.use("/mediciones", medicionRoutes);

export default router;

/**
 * @file medicionesRoutes.ts
 * @brief Definición de las rutas para las mediciones en la API, incluyendo validación de datos
 * @author Juan Diaz
 * @date 22/09/2024
 */

import { Router } from "express";
import { medicionesController } from "../controllers/medicionesController";
import { check } from "express-validator";

const router = Router();

router.post(
  "/",
  [
    check("ppm", "El PPM debe ser un número positivo").isInt(),
    check("temperatura", "La temperatura debe ser un número").isInt(),
    check("latitud", "La latitud debe ser un número").isFloat(),
    check("longitud", "La longitud debe ser un número").isFloat(),
  ],
  medicionesController.guardarMedicion,
);

router.get("/", medicionesController.obtenerMediciones);

export default router;

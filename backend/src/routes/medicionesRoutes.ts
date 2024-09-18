import { Router } from "express";
import {
  guardarMedicion,
  obtenerMediciones,
} from "../controllers/medicionesController";
import { check } from "express-validator";

const router = Router();

router.post(
  "/",
  [
    check("ppm", "El PPM debe ser un número positivo").isFloat({ min: 0 }),
    check("temperatura", "La temperatura debe ser un número").isFloat(),
    check("latitud", "La latitud debe ser un número").isFloat(),
    check("longitud", "La longitud debe ser un número").isFloat(),
    check(
      "fecha",
      "La fecha debe ser una fecha válida en formato ISO 8601",
    ).isISO8601(),
  ],
  guardarMedicion,
);

router.get("/", obtenerMediciones);

export default router;

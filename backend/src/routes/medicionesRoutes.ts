import { Router } from "express";
import { medicionesController } from "../controllers/medicionesController";
import { check } from "express-validator";

const router = Router();

router.post(
  "/",
  [
    check("ppm", "El PPM debe ser un número positivo").isFloat(),
    check("temperatura", "La temperatura debe ser un número").isFloat(),
    check("latitud", "La latitud debe ser un número").isFloat(),
    check("longitud", "La longitud debe ser un número").isFloat(),
  ],
  medicionesController.guardarMedicion,
);

router.get("/", medicionesController.obtenerMediciones);

export default router;

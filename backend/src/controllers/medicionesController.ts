import { Request, Response } from "express";
import { MedicionType } from "../models/Medicion";
import { validationResult } from "express-validator";
import {
  guardarMedicionService,
  obtenerMedicionesService,
} from "../services/medicionesService";

export const guardarMedicion = async (req: Request, res: Response) => {
  try {
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
      return res.status(400).json({ message: errores.array() });
    }

    const medicion: MedicionType = req.body;

    await guardarMedicionService(medicion);

    return res.status(201).json(medicion);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error guardando la medición", error });
  }
};

export const obtenerMediciones = async (req: Request, res: Response) => {
  try {
    const mediciones: MedicionType[] = await obtenerMedicionesService();
    return res.status(200).json(mediciones);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error obteniendo las mediciones", error });
  }
};

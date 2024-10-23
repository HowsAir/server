/**
 * @file medicionesController.ts
 * @brief Controller to handle measurement-related operations.
 * @author Juan Diaz
 */
/*
import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { medicionesService } from "../services/medicionesService";
import { Measurement } from "@prisma/client";

/**
 * Método de medicionesController.ts para guardar una nueva medición en la base de datos.
 *
 * @param req - Objeto de la solicitud HTTP de tipo `Request`. Contiene los datos de la medición en el cuerpo.
 * @param res - Objeto de respuesta HTTP de tipo `Response`. Usado para devolver las respuestas al cliente.
 *
 * @returns Retorna un objeto JSON con la medición guardada y estado HTTP 201 si es exitoso, o un error en formato JSON con estado HTTP 400 o 500.
 */
/*
const guardarMedicion = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const errores = validationResult(req);

    if (!errores.isEmpty()) {
      return res.status(400).json({ message: errores.array() });
    }

    const medicionData: Omit<Measurement, "id"> = req.body;

    const medicionCreada = await medicionesService.guardarMedicion(medicionData);

    return res.status(201).json(medicionCreada);
  } catch (error) {
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};
*/
/**
 * Método de medicionesController.ts para obtener todas las mediciones desde la base de datos.
 *
 * @param req - Objeto de la solicitud HTTP de tipo `Request`. No se esperan parámetros en el cuerpo o en la query.
 * @param res - Objeto de respuesta HTTP de tipo `Response`. Usado para devolver las mediciones al cliente.
 *
 * @returns Retorna un array de objetos JSON que representan las mediciones y un estado HTTP 200, o un error en formato JSON con estado HTTP 500.
 */
/*
const obtenerMediciones = async (
  req: Request,
  res: Response,
): Promise<Response> => {
  try {
    const mediciones: MedicionType[] =
      await medicionesService.obtenerMediciones();
    return res.status(200).json(mediciones);
  } catch (error) {
    return res.status(500).json({ message: "Error interno del servidor" });
  }
};
*/
/*
export const medicionesController = {
  guardarMedicion,
  //obtenerMediciones,
};
*/
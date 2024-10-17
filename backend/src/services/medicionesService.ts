/**
 * @file medicionesService.ts
 * @brief Servicio para manejar las operaciones relacionadas con las mediciones
 * @author Juan Diaz
 */

//import Medicion, { MedicionType } from "../models/Medicion";

/**
 * Guarda una nueva medición en la base de datos
 *
 * medicionData: Medicion -> guardarMedicion() -> Promise<Medicion>
 *
 * @param medicionData Un objeto que contiene los datos de la medición. Debe cumplir con la interfaz `Medicion`.
 * @returns {Promise<MedicionType>} Una promesa que se resuelve con el objeto Medicion guardado en la base de datos.
 * @throws {Error} Si ocurre algún problema durante el guardado de la medición.
 */
/*
const guardarMedicion = async (
  medicionData: MedicionType,
): Promise<MedicionType> => {
  try {
    const medicion = new Medicion(medicionData);
    return await medicion.save();
  } catch (error) {
    throw error;
  }
};
*/
/**
 * Obtiene todas las mediciones almacenadas en la base de datos
 *
 * obtenerMediciones() -> Promise<Medicion[]>
 *
 * @returns {Promise<MedicionType[]>} Una promesa que se resuelve con un array de objetos Medicion que contiene todas las mediciones almacenadas.
 * @throws {Error} Si ocurre algún problema durante la obtención de las mediciones.
 */
/*
const obtenerMediciones = async (): Promise<MedicionType[]> => {
  try {
    return await Medicion.find();
  } catch (error) {
    throw error;
  }
};

export const medicionesService = {
  guardarMedicion,
  obtenerMediciones,
};*/

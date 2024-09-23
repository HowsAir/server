import MedicionModel, { Medicion } from "../models/Medicion";

/**
 * @brief Guarda una nueva medición en la base de datos
 * @author Juan Diaz
 *
 * medicionData: Medicion -> guardarMedicion -> Promise<Medicion>
 *
 * @param medicionData Un objeto que contiene los datos de la medición. Debe cumplir con la interfaz `Medicion`.
 * @returns {Promise<Medicion>} Una promesa que se resuelve con el objeto Medicion guardado en la base de datos.
 * @throws {Error} Si ocurre algún problema durante el guardado de la medición.
 */
const guardarMedicion = async (medicionData: Medicion): Promise<Medicion> => {
  try {
    const medicion = new MedicionModel(medicionData);
    return await medicion.save();
  } catch (error) {
    throw error;
  }
};

/**
 * @brief Obtiene todas las mediciones almacenadas en la base de datos
 * @author Juan Diaz
 *
 * obtenerMediciones -> Promise<Medicion[]>
 *
 * @returns {Promise<Medicion[]>} Una promesa que se resuelve con un array de objetos Medicion que contiene todas las mediciones almacenadas.
 * @throws {Error} Si ocurre algún problema durante la obtención de las mediciones.
 */
const obtenerMediciones = async (): Promise<Medicion[]> => {
  try {
    return await MedicionModel.find();
  } catch (error) {
    throw error;
  }
};

export const medicionesService = {
  guardarMedicion,
  obtenerMediciones,
};

import Medicion, {MedicionType} from "../models/Medicion";

export const guardarMedicionService = async (medicionData: MedicionType) => {
  try {
    const medicion = new Medicion(medicionData);
    return await medicion.save();
  } catch (error) {
    throw (error);
  }
};

export const obtenerMedicionesService = async () => {
  try {
    return await Medicion.find();
  } catch (error) {
    throw (error);
  }
};

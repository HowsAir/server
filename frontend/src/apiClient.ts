import { MedicionData } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

export const API_ERRORS = {
    OBTENER_MEDICIONES: "No se pudieron obtener las mediciones",
    // Aquí puedes agregar más errores específicos para otras funciones
    // por ejemplo:
    // CREAR_MEDICION: "No se pudo crear la medición",
    // ACTUALIZAR_MEDICION: "No se pudo actualizar la medición",
} as const;
  
/**
 * @brief Obtiene todas las mediciones almacenadas desde la API
 * @author Juan Diaz Gutierrez
 * 
 * obtenerMediciones -> Promise<MedicionData[]>
 * 
 * Esta función realiza una solicitud GET al endpoint de la API para obtener
 * todas las mediciones almacenadas. Utiliza fetch para realizar la solicitud
 * HTTP y maneja tanto el éxito como los errores de la respuesta.
 * 
 * @throws Error - Si la solicitud falla o la respuesta no es válida
 * @returns Una promesa que se resuelve con un array de objetos MedicionData
 */
export const obtenerMediciones = async (): Promise<MedicionData[]> => {
    try {
        const response = await fetch(`${API_BASE_URL}/api/v1/mediciones`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const { message }: { message: string } = await response.json();
            throw new Error(message || "Error al obtener mediciones");
        }

        return response.json();
    } catch (error) {
        console.error("Error:", error);
        throw new Error(API_ERRORS.OBTENER_MEDICIONES);
    }
};

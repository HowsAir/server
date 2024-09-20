import { MedicionType } from './types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Realiza una solicitud GET al endpoint de la API para obtener todas las mediciones almacenadas.
 *
 * @returns {Promise<Object[]>} - Retorna una promesa que se resuelve con un array de objetos que representan las mediciones.
 * @throws {Error} - Lanza un error si la solicitud falla o la respuesta no es válida.
 */
export const obtenerMediciones = async (): Promise<MedicionType[]> => {
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
        console.error("Error fetching mediciones:", error);
        throw new Error("No se pudieron obtener las mediciones");
    }
};

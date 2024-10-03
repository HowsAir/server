/**
 * @file apiClient.test.ts
 * @brief Pruebas unitarias para las funciones del cliente API
 * @description Las pruebas verifican la correcta obtención de datos desde la API, el manejo de respuestas no exitosas, y la gestión de errores en la llamada de red (fetch).
 * @author Juan Diaz
 * @date 03/10/2024
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import * as apiClient from "../src/api/apiClient";
import { MedicionData } from "../src/types";

describe("obtenerMediciones", () => {
  beforeEach(() => {
    vi.resetAllMocks();
    vi.stubGlobal("console", { error: vi.fn() });
  });

  it("debería obtener mediciones correctamente", async () => {
    const mockMediciones: MedicionData[] = [
      {
        _id: "1",
        fecha: new Date(),
        ppm: 400,
        temperatura: 25,
        latitud: 100.8,
        longitud: 45.1,
      },
      {
        _id: "2",
        fecha: new Date(),
        ppm: 410,
        temperatura: 26,
        latitud: 10.5,
        longitud: 10.7,
      },
    ];

    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockMediciones),
    });

    const result = await apiClient.obtenerMediciones();

    expect(fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/v1/mediciones"),
      expect.any(Object)
    );
    expect(result).toEqual(mockMediciones);
  });

  it("debería manejar respuesta no exitosa", async () => {
    const errorMessage = "Error del servidor";
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ message: errorMessage }),
    });

    await expect(apiClient.obtenerMediciones()).rejects.toThrow(
      apiClient.API_ERRORS.OBTENER_MEDICIONES
    );
    expect(console.error).toHaveBeenCalled();
  });

  it("debería manejar errores del fetch", async () => {
    global.fetch = vi.fn().mockRejectedValue(new Error("Error de red"));

    await expect(apiClient.obtenerMediciones()).rejects.toThrow(
      apiClient.API_ERRORS.OBTENER_MEDICIONES
    );
    expect(console.error).toHaveBeenCalled();
  });
});

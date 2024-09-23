import { describe, it, expect, vi, beforeEach } from "vitest";
import { medicionesService } from "../../src/services/medicionesService";
import Medicion, { MedicionType } from "../../src/models/Medicion";

// Mock Mongoose Model
vi.mock("../models/Medicion", () => ({
  default: {
    find: vi.fn(),
    save: vi.fn(),
  },
}));

describe("Mediciones Service", () => {
  beforeEach(() => {
    vi.clearAllMocks(); // Reset all mocks before each test
  });

  describe("guardarMedicionService", () => {
    it("debería guardar una nueva medición correctamente", async () => {
      const medicionData: MedicionType = {
        _id: "1",
        ppm: 450,
        fecha: new Date(),
        temperatura: 22,
        latitud: 10,
        longitud: 20,
      };

      // Mock save function to resolve successfully
      Medicion.prototype.save = vi.fn().mockResolvedValue(medicionData);

      const result = await medicionesService.guardarMedicion(medicionData);

      expect(Medicion.prototype.save).toHaveBeenCalled();
      expect(result).toEqual(medicionData);
    });

    it("debería lanzar un error si ocurre un fallo al guardar", async () => {
      const medicionData: MedicionType = {
        _id: "1",
        ppm: 450,
        fecha: new Date(),
        temperatura: 22,
        latitud: 10,
        longitud: 20,
      };

      // Mock save function to reject with an error
      Medicion.prototype.save = vi
        .fn()
        .mockRejectedValue(new Error("Error al guardar"));

      try {
        await medicionesService.guardarMedicion(medicionData);
      } catch (error: any) {
        expect(Medicion.prototype.save).toHaveBeenCalled();
        expect(error.message).toBe("Error al guardar");
      }
    });

    it("debería lanzar un error si los datos de la medición son inválidos", async () => {
      // Simulate invalid data
      const medicionData: Partial<MedicionType> = {
        ppm: NaN, // Invalid ppm
        temperatura: 22,
        latitud: 10,
        longitud: 20,
      };

      Medicion.prototype.save = vi.fn().mockImplementation(() => {
        throw new Error("validation failed");
      });

      try {
        await medicionesService.guardarMedicion(medicionData as MedicionType);
      } catch (error: any) {
        expect(error.message).toContain("validation failed");
      }
    });
  });

  describe("obtenerMedicionesService", () => {
    it("debería obtener todas las mediciones correctamente", async () => {
      const mockMediciones: MedicionType[] = [
        {
          _id: "1",
          ppm: 450,
          fecha: new Date(),
          temperatura: 22,
          latitud: 10,
          longitud: 20,
        },
        {
          _id: "2",
          ppm: 460,
          fecha: new Date(),
          temperatura: 23,
          latitud: 15,
          longitud: 25,
        },
      ];

      Medicion.find = vi.fn().mockResolvedValue(mockMediciones);

      const result = await medicionesService.obtenerMediciones();

      expect(Medicion.find).toHaveBeenCalled();
      expect(result).toEqual(mockMediciones);
    });

    it("debería lanzar un error si ocurre un fallo al obtener mediciones", async () => {
      Medicion.find = vi
        .fn()
        .mockRejectedValue(new Error("Error al obtener mediciones"));

      try {
        await medicionesService.obtenerMediciones();
      } catch (error: any) {
        expect(Medicion.find).toHaveBeenCalled();
        expect(error.message).toBe("Error al obtener mediciones");
      }
    });

    it("debería devolver una lista vacía si no hay mediciones", async () => {
      Medicion.find = vi.fn().mockResolvedValue([]);

      const result = await medicionesService.obtenerMediciones();

      expect(Medicion.find).toHaveBeenCalled();
      expect(result).toEqual([]);
    });
  });
});

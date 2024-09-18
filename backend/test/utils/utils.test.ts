import { describe, it, expect } from "vitest";
import { validarMedicion } from "../../src/utils/utils";

describe("Utils - validarMedicion", () => {
  it("debería validar correctamente una medición válida", () => {
    const medicionValida = {
      ppm: 500,
      temperatura: 22,
      latitud: 10.1234,
      longitud: -70.1234,
    };

    expect(() => validarMedicion(medicionValida)).not.toThrow();
  });

  it("debería lanzar un error si ppm no es un número", () => {
    const medicionInvalida = {
      ppm: "500", // ppm como string
      temperatura: 22,
      latitud: 10.1234,
      longitud: -70.1234,
    };

    expect(() => validarMedicion(medicionInvalida)).toThrow(
      "Datos de medición no válidos",
    );
  });

  it("debería lanzar un error si temperatura no es un número", () => {
    const medicionInvalida = {
      ppm: 500,
      temperatura: "22", // temperatura como string
      latitud: 10.1234,
      longitud: -70.1234,
    };

    expect(() => validarMedicion(medicionInvalida)).toThrow(
      "Datos de medición no válidos",
    );
  });

  it("debería lanzar un error si latitud no es un número", () => {
    const medicionInvalida = {
      ppm: 500,
      temperatura: 22,
      latitud: "10.1234", // latitud como string
      longitud: -70.1234,
    };

    expect(() => validarMedicion(medicionInvalida)).toThrow(
      "Datos de medición no válidos",
    );
  });

  it("debería lanzar un error si longitud no es un número", () => {
    const medicionInvalida = {
      ppm: 500,
      temperatura: 22,
      latitud: 10.1234,
      longitud: "-70.1234", // longitud como string
    };

    expect(() => validarMedicion(medicionInvalida)).toThrow(
      "Datos de medición no válidos",
    );
  });

  it("debería lanzar un error si faltan propiedades", () => {
    const medicionIncompleta = {
      ppm: 500,
      temperatura: 22,
      // Falta latitud y longitud
    };

    expect(() => validarMedicion(medicionIncompleta)).toThrow(
      "Datos de medición no válidos",
    );
  });
});

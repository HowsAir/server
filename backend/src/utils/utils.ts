export const validarMedicion = (data: any) => {
  const { ppm, temperatura, latitud, longitud } = data;
  if (
    typeof ppm !== "number" ||
    typeof temperatura !== "number" ||
    typeof latitud !== "number" ||
    typeof longitud !== "number"
  ) {
    throw new Error("Datos de medición no válidos");
  }
};

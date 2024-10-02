/**
 * @file Medicion.ts
 * @brief Definición del esquema de Mongoose y la interfaz para Medicion
 * @author Juan Diaz
 * @date 22/09/2024
 */

import mongoose from "mongoose";

export interface MedicionType {
  _id?: string;
  fecha: Date;
  ppm: number;
  temperatura: number;
  latitud: number;
  longitud: number;
}

const MedicionSchema = new mongoose.Schema<MedicionType>(
  {
    fecha: { type: Date, required: true, default: Date.now },
    ppm: {
      type: Number,
      required: true,
      validate: {
        validator: Number.isInteger,
        message: "{VALUE} no es un entero",
      },
    },
    temperatura: {
      type: Number,
      required: true,
      validate: {
        validator: Number.isInteger,
        message: "{VALUE} no es un entero",
      },
    },
    latitud: { type: Number, required: true },
    longitud: { type: Number, required: true },
  },
  { versionKey: false }
);

// Middleware para asegurarse de que la fecha siempre sea la actual
MedicionSchema.pre("save", function (next) {
  // Asignar la fecha actual antes de guardar
  this.fecha = new Date();
  next();
});

export default mongoose.model<MedicionType>(
  "Medicion",
  MedicionSchema,
  "mediciones"
);

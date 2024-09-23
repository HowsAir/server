import mongoose from "mongoose";

export interface Medicion {
  _id: string;
  fecha: Date;
  ppm: number;
  temperatura: number;
  latitud: number;
  longitud: number;
}

const MedicionSchema = new mongoose.Schema<Medicion>(
  {
    fecha: { type: Date, required: true, default: Date.now },
    ppm: { type: Number, required: true },
    temperatura: { type: Number, required: true },
    latitud: { type: Number, required: true },
    longitud: { type: Number, required: true },
  },
  { versionKey: false },
);

// Middleware para asegurarse de que la fecha siempre sea la actual
MedicionSchema.pre("save", function (next) {
  // Asignar la fecha actual antes de guardar
  this.fecha = new Date();
  next();
});

export default mongoose.model<Medicion>(
  "Medicion",
  MedicionSchema,
  "mediciones",
);

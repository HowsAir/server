import mongoose from "mongoose";

export type MedicionType = {
  _id: string;
  fecha: Date;
  ppm: number;
  temperatura: number;
  latitud: number;
  longitud: number;
};

const MedicionSchema = new mongoose.Schema<MedicionType>({
  fecha: { type: Date, required: true },
  ppm: { type: Number, required: true },
  temperatura: { type: Number, required: true },
  latitud: { type: Number, required: true },
  longitud: { type: Number, required: true },
}, { versionKey: false });

export default mongoose.model<MedicionType>("Medicion", MedicionSchema, "mediciones");

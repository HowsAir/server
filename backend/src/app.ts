/**
 * @file app.ts
 * @brief Configura el servidor, las rutas y la conexión a MongoDB para la aplicación
 * @author Juan Diaz
 */

import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import path from "path";
import cors from "cors";
import router from "./routes/router";

const app = express();

let mongodbUri = process.env.MONGODB_URI as string;

app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.use(
    cors({
      origin: process.env.FRONTEND_URL,
      credentials: true,
    }),
  );
} else {
  // Reemplaza localhost por mongodb en la URI de MongoDB
  // para que la conexión se pueda realizar desde un contenedor
  mongodbUri = mongodbUri.replace("localhost", "mongodb");

  // Sirve los archivos estáticos de la carpeta dist (Frontend)
  app.use(express.static(path.join(__dirname, "../../frontend/dist")));
}

app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(mongodbUri)
  .then(() => console.log("Conectado a MongoDB"))
  .catch((error) => console.error("Error conectando a MongoDB:", error));

app.use("/api/v1", router);

//Respuesta para cualquier endpoint de la api no definido
app.use("/api/*", (req, res) => {
  res.status(404).json({ message: "Endpoint no encontrado" });
});

//Redirige todas las rutas no definidas a la página de inicio
app.get("/*", function (req, res) {
  res.sendFile(path.join(__dirname, "../../frontend/dist", "index.html"));
});

export default app;

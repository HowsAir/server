import express from "express";
import mongoose from "mongoose";
import "dotenv/config";
import path from "path";
import cors from "cors";
import v1Router from "./routes/v1Router";

const app = express();

app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.use(
    cors(/*{
      origin: process.env.FRONTEND_URL,
      credentials: true,
    }*/),
  );
}
else {
  app.use(express.static(path.join(__dirname, "../../frontend/dist")));
}

app.use(express.urlencoded({ extended: true }));

mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/")
  .then(() => console.log("Conectado a MongoDB"))
  .catch((error) => console.error("Error conectando a MongoDB:", error));

app.use("/api/v1", v1Router);

app.use((req, res) => {
  res.status(404).json({ message: "Endpoint no encontrado" });
});

export default app;

/**
 * @file app.ts
 * @brief Application configuration for the API
 * @author Juan Diaz
 */

import express from "express";
import "dotenv/config";
import path from "path";
import cors from "cors";
import router from "./routes/router";
import cookieParser from "cookie-parser";

const app = express();

app.use(express.json());

if (process.env.NODE_ENV === "development") {
  app.use(
    cors({
      origin: process.env.FRONTEND_URL,
      credentials: true,
    }),
  );
} else {
  app.use(express.static(path.join(__dirname, "../../frontend/dist"))); // Serve frontend
}

app.use(cookieParser());

app.use(express.urlencoded({ extended: true }));

app.use("/api/v1", router);

//Response for non-existent endpoints
app.use("/api/*", (req, res) => {
  res.status(404).json({ message: "Endpoint no encontrado" });
});

//Redirect all other routes to the frontend
app.get("/*", function (req, res) {
  res.sendFile(path.join(__dirname, "../../frontend/dist", "index.html"));
});

export default app;

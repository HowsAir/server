import { Router } from "express";
import medicionRoutes from "./medicionesRoutes";

const v1Router = Router();

v1Router.use("/mediciones", medicionRoutes);

export default v1Router;

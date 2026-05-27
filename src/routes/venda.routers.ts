import { Router } from "express";
import { VendaController } from "../controllers/venda.controller";

export const vendaRoutes = Router();
export const vendaController = new VendaController();

vendaRoutes.post("/sales", (req, res) => vendaController.create(req, res));

vendaRoutes.get("/sales", (req, res) => vendaController.list(req, res));
import { Router } from "express";
import { VendaController } from "../controllers/venda.controller";

export const vendasRoutes = Router();

const vendaController = new VendaController();

vendasRoutes.post("/vendas", (req, res) =>
  vendaController.create(req, res)
);

vendasRoutes.get("/vendas", (req, res) =>
  vendaController.list(req, res)
);
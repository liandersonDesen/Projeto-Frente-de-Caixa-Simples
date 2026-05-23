import { Router } from "express";
import { ProdutoController } from "../controllers/produto.controller";

export const produtosRoutes = Router();
export const produtoController = new ProdutoController();

produtosRoutes.get("/produtos", (req, res) => produtoController.list(req, res));
produtosRoutes.post("/produtos", (req, res) => produtoController.create(req, res));
produtosRoutes.put("/produtos/:id", (req, res) => produtoController.update(req, res));
produtosRoutes.delete("/produtos/:id", (req, res) => produtoController.delete(req, res));
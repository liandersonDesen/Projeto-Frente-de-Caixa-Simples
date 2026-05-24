import { Request, Response } from "express";
import { Database } from "../database/database";
import crypto from "node:crypto";

interface Venda {
  id: string;
  produtoId: string;
  produto: string;
  quantidade: number;
  total: number;
  data: string;
}

export class VendaController {
  datadb = new Database();

  async create(req: Request, res: Response) {
    const { produtoId, quantidade } = req.body;

    const produtos = this.datadb.select("produtos");

    const produto = produtos.find((item) => item.id === produtoId);

    if (!produto) {
      return res.status(404).json({
        message: "Produto não encontrado"
      });
    }

    if (!quantidade || quantidade <= 0) {
      return res.status(400).json({
        message: "Quantidade inválida"
      });
    }

    const novaVenda: Venda = {
      id: crypto.randomUUID(),
      produtoId: produto.id,
      produto: produto.name,
      quantidade,
      total: produto.price * quantidade,
      data: new Date().toISOString()
    };

    this.datadb.insert("vendas", novaVenda);

    return res.status(201).json(novaVenda);
  }

  async list(req: Request, res: Response) {
    const vendas = this.datadb.select("vendas");

    return res.status(200).json(vendas);
  }
}
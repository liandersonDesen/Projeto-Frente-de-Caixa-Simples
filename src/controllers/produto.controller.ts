import { Request, Response } from "express";
import { Database } from "../database/database";
import crypto from "node:crypto";

export interface Items {
  id: string;
  name: string;
  price: number;
}

export class ProdutoController {
  datadb = new Database();

  async list(req: Request, res: Response) {
    const produtos = this.datadb.select("produtos");
    return res.status(200).json(produtos);
  }

  async create(req: Request, res: Response) {
    const { name, price } = req.body;

    const newItems: Items = {
      id: crypto.randomUUID(),
      name: name,
      price: price,
    };

    this.datadb.insert("produtos", newItems);
    return res.status(201).json(newItems);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { name, price } = req.body;

    const produtos = this.datadb.select("produtos");
    const produto = produtos.find((item) => item.id === id);

    if (!produto) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    produto.name = name;
    produto.price = price;

    // Atualiza o arquivo json com a lista modificada
    this.datadb.updateTable("produtos", produtos);

    return res.status(200).json(produto);
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;

    const produtos = this.datadb.select("produtos");
    const existeProduto = produtos.some((item) => item.id === id);

    if (!existeProduto) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    // Filtra removendo o produto com o ID enviado
    const listaFiltrada = produtos.filter((item) => item.id !== id);
    
    // Grava a nova lista sem o produto apagado no arquivo json
    this.datadb.updateTable("produtos", listaFiltrada);

    return res.status(200).json({ message: "Deletado com sucesso" });
  }
}
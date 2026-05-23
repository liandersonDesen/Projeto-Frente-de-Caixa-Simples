import { Request, Response } from "express";
import { Database } from "../database/database";
import crypto from "node:crypto";

export interface Items {
  id: string;
  name: string;
  price: number;
  stock: number;
}

export class ProdutoController {
  datadb = new Database();

  async list(req: Request, res: Response) {
    const produtos = this.datadb.select("produtos");
    return res.status(200).json(produtos);
  }

  async create(req: Request, res: Response) {
    const { name, price, stock } = req.body;

    if (!name || price == null || stock == null) {
      return res.status(400).json({
        message: "Campos obrigatórios"
      });
    }
    
    if (stock < 0) {
      return res.status(400).json({
        message: "Estoque inválido"
      });
    }
    if (price < 0) {
      return res.status(400).json({
        message: "Preço inválido"
      });
    }
    
    const newItems: Items = {
      id: crypto.randomUUID(),
      name: name,
      price: Number(price),
      stock: Number(stock),
    };

    this.datadb.insert("produtos", newItems);
    return res.status(201).json(newItems);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { name, price, stock } = req.body;

    const produtos = this.datadb.select("produtos");
    const produto = produtos.find((item) => item.id === id);

    if (!produto) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    produto.name = name ?? produto.name;
    produto.price = price ?? produto.price;
    produto.stock = stock ?? produto.stock;
    
    // Atualiza o arquivo json com a lista modificada
    this.datadb.updateTable("produtos", produtos);

    return res.status(200).json(produto);
  }

  async updateStock(req: Request, res: Response) {
    const { id } = req.params;
    const { quantity } = req.body;

    const produtos = this.datadb.select("produtos");

    const produto = produtos.find((item) => item.id === id);

    if (!produto) {
      return res.status(404).json({
        message: "Produto não encontrado"
      });
    }

    const novoEstoque = produto.stock + quantity;

    if (novoEstoque < 0) {
      return res.status(400).json({
        message: "Estoque insuficiente"
      });
    }

    produto.stock = novoEstoque;

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
import { Request, Response } from "express";
import { Database } from "../database/database";
import crypto from "node:crypto";

export interface Items {
  id_produto?: number; 
  codigo_barras: string;
  nome: string;
  preco_venda: number;
  estoque: number;
}

export class ProdutoController {
  datadb = new Database();

  async list(req: Request, res: Response) {
    const produtos = await this.datadb.queryAll("SELECT * FROM produtos");
    return res.status(200).json(produtos);
  }

  async create(req: Request, res: Response) {
    const { name, price, stock } = req.body;

    if (!name || price == null || stock == null) {
      return res.status(400).json({ message: "Campos obrigatórios" });
    }
    
    if (stock < 0) {
      return res.status(400).json({ message: "Estoque inválido" });
    }
    if (price < 0) {
      return res.status(400).json({ message: "Preço inválido" });
    }
    
    // Gerando um código de barras de 8 dígitos para não ir vazio
    const codigoAleatorio = crypto.randomUUID().slice(0, 8);

    const newItems: Items = {
      codigo_barras: codigoAleatorio,
      nome: name,
      preco_venda: Number(price),
      estoque: Number(stock),
    };

    await this.datadb.execute(
      "INSERT INTO produtos (codigo_barras, nome, preco_venda, estoque) VALUES (?, ?, ?, ?)",
      [newItems.codigo_barras, newItems.nome, newItems.preco_venda, newItems.estoque]
    );

    return res.status(201).json(newItems);
  }

  async update(req: Request, res: Response) {
    const { id } = req.params;
    const { name, price, stock } = req.body;

    const produtos = await this.datadb.queryAll("SELECT * FROM produtos");
    const produto = produtos.find((item) => String(item.id_produto) === String(id));

    if (!produto) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    const novoNome = name ?? produto.nome;
    const novoPreco = price ?? produto.preco_venda;
    const novoEstoque = stock ?? produto.estoque;
    
    // Atualiza usando as colunas corretas e o id_produto no WHERE
    await this.datadb.execute(
      "UPDATE produtos SET nome = ?, preco_venda = ?, estoque = ? WHERE id_produto = ?",
      [novoNome, Number(novoPreco), Number(novoEstoque), id]
    );

    return res.status(200).json({ id_produto: id, nome: novoNome, preco_venda: novoPreco, estoque: novoEstoque });
  }

  async updateStock(req: Request, res: Response) {
    const { id } = req.params;
    const { quantity } = req.body;

    const produtos = await this.datadb.queryAll("SELECT * FROM produtos");
    const produto = produtos.find((item) => String(item.id_produto) === String(id));

    if (!produto) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    const novoEstoque = produto.estoque + quantity;

    if (novoEstoque < 0) {
      return res.status(400).json({ message: "Estoque insuficiente" });
    }

    await this.datadb.execute(
      "UPDATE produtos SET estoque = ? WHERE id_produto = ?",
      [novoEstoque, id]
    );

    return res.status(200).json({ id_produto: id, estoque: novoEstoque });
  }

  async delete(req: Request, res: Response) {
    const { id } = req.params;

    const produtos = await this.datadb.queryAll("SELECT * FROM produtos");
    const existeProduto = produtos.some((item) => String(item.id_produto) === String(id));

    if (!existeProduto) {
      return res.status(404).json({ message: "Produto não encontrado" });
    }

    await this.datadb.execute("DELETE FROM produtos WHERE id_produto = ?", [id]);

    return res.status(200).json({ message: "Deletado com sucesso" });
  }
}
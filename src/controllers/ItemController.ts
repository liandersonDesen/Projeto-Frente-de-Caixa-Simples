import { Request, Response } from "express";
import { Database } from "../database/conection";
import crypto from "node:crypto";

export class ProdutoController {
  datadb = new Database();

  // LISTAR PRODUTOS
  async list(req: Request, res: Response) {
    try {
      const produtos = await this.datadb.queryAll("SELECT * FROM produtos");
      return res.status(200).json(produtos);
    } catch (error) {
      return res.status(500).json({ error: "Erro ao buscar produtos" });
    }
  }

  // CRIAR PRODUTO
  async create(req: Request, res: Response) {
    try {
      const { name, price } = req.body;
      const codigoBarrasAleatorio = crypto.randomUUID().slice(0, 8); 

      await this.datadb.execute(
        "INSERT INTO produtos (codigo_barras, nome, preco_venda, estoque) VALUES (?, ?, ?, ?)",
        [codigoBarrasAleatorio, name, price, 10] 
      );

      return res.status(201).json({ message: "Produto criado com sucesso!", name, price });
    } catch (error) {
      return res.status(500).json({ error: "Erro ao criar produto" });
    }
  }

  // ATUALIZAR PRODUTO
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params; 
      const { name, price } = req.body;

      // AJUSTE: Mudado para 'id_produto' para bater com a linha 3 do seu print
      const produto = await this.datadb.queryOne("SELECT * FROM produtos WHERE id_produto = ?", [id]);

      if (!produto) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }

      await this.datadb.execute(
        "UPDATE produtos SET nome = ?, preco_venda = ? WHERE id_produto = ?",
        [name, price, id]
      );

      return res.status(200).json({ message: "Produto atualizado", id, name, price });
    } catch (error) {
      return res.status(500).json({ error: "Erro ao atualizar produto" });
    }
  }

  // DELETAR PRODUTO
  async delete(req: Request, res: Response) {
    try {
      const { id } = req.params;

      // AJUSTE: Mudado para 'id_produto'
      const produto = await this.datadb.queryOne("SELECT * FROM produtos WHERE id_produto = ?", [id]);

      if (!produto) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }

      await this.datadb.execute("DELETE FROM produtos WHERE id_produto = ?", [id]);

      return res.status(200).json({ message: "Deletado com sucesso" });
    } catch (error) {
      return res.status(500).json({ error: "Erro ao deletar produto" });
    }
  }
}
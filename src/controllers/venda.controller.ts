import { Request, Response } from "express";
import { Database } from "../database/database";
import crypto from "node:crypto";
import { Items } from "./produto.controller"; 

export interface Venda {
  id: string;
  total: number;
  payment_method: string;
  created_at: string;
}

export interface ItemVenda {
  id: string;
  venda_id: string;
  produto_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export class VendaController {
  datadb = new Database();

  async list(req: Request, res: Response) {
    const vendas = this.datadb.select("vendas");
    return res.status(200).json(vendas);
  }

  async create(req: Request, res: Response) {
    const { payment_method, items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        message: "Campos obrigatórios"
      });
    }

    const produtosDb: Items[] = this.datadb.select("produtos");
    
    let totalVenda = 0;
    const itensVendaParaSalvar: ItemVenda[] = [];
    const idVenda = crypto.randomUUID();

    for (const item of items) {
      if (item.quantity == null || item.quantity <= 0) {
        return res.status(400).json({
          message: "Estoque inválido"
        });
      }

      const produtoDb = produtosDb.find((p) => p.id === item.produto_id);

      if (!produtoDb) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }

      if (produtoDb.stock < item.quantity) {
        return res.status(400).json({
          message: "Estoque insuficiente"
        });
      }

      const valorTotalItem = produtoDb.price * item.quantity;
      totalVenda += valorTotalItem;

      const novoItemVenda: ItemVenda = {
        id: crypto.randomUUID(),
        venda_id: idVenda,
        produto_id: produtoDb.id,
        quantity: item.quantity,
        unit_price: produtoDb.price,
        total_price: valorTotalItem
      };

      itensVendaParaSalvar.push(novoItemVenda);
      produtoDb.stock -= item.quantity;
    }

    const novaVenda: Venda = {
      id: idVenda,
      total: totalVenda,
      payment_method: payment_method ?? "Dinheiro",
      created_at: new Date().toISOString()
    };

    this.datadb.insert("vendas", novaVenda);
    
    for (const itemVenda of itensVendaParaSalvar) {
      this.datadb.insert("produtos_venda", itemVenda);
    }

    this.datadb.updateTable("produtos", produtosDb);

    return res.status(201).json(novaVenda);
  }
}
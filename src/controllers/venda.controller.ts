import { Request, Response } from "express";
import { Database } from "../database/database";
import { Items } from "./produto.controller"; 

export interface Venda {
  id_venda?: number;
  total: number;
  payment_method: string;
  created_at: string;
}

export interface ItemVenda {
  id?: number;
  venda_id: number;
  produto_id: number;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export class VendaController {
  datadb = new Database();

  async list(req: Request, res: Response) {
    const vendas = await this.datadb.queryAll(`
        SELECT 
        v.id_venda AS "Código da Venda",
        v.data_hora AS "Data/Hora",
        v.forma_pagamento AS "Forma de Pagamento",
        v.total AS "Valor Total da Venda",
        pv.quantidade AS "Quantidade Vendida",
        pv.preco_unitario AS "Preço Unitário no Ato",
        pv.valor_total AS "Subtotal do Item",
        p.id_produto AS "ID do Produto",
        p.nome AS "Nome do Produto",
        p.codigo_barras AS "Código de Barras"
      FROM vendas v
      LEFT JOIN produtos_venda pv ON v.id_venda = pv.venda_id
      LEFT JOIN produtos p ON pv.produto_id = p.id_produto
      ORDER BY v.data_hora DESC
      `);
    return res.status(200).json(vendas);
  }

  async create(req: Request, res: Response) {
    const { payment_method, items } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Campos obrigatórios" });
    }

    const produtosDb = await this.datadb.queryAll(
      "SELECT id_produto, nome, preco_venda, estoque FROM produtos"
    ) as Items[];
    console.log(produtosDb);
    
    let totalVenda = 0;
    const itensVendaParaSalvar: any[] = [];

    for (const item of items) {
      if (item.quantity == null || item.quantity <= 0) {
        return res.status(400).json({
          message: "Estoque inválido"
        });
      }

      const produtoDb = produtosDb.find((p) => p.id_produto === item.produto_id);

      if (!produtoDb) {
        return res.status(404).json({ message: "Produto não encontrado" });
      }

      if (produtoDb.estoque < item.quantity) {
        return res.status(400).json({
          message: "Estoque insuficiente"
        });
      }

      const valorTotalItem = produtoDb.preco_venda * item.quantity;
      totalVenda += valorTotalItem;

      itensVendaParaSalvar.push({
        produto_id: produtoDb.id_produto,
        quantity: item.quantity,
        unit_price: produtoDb.preco_venda,
        total_price: valorTotalItem
      });

      produtoDb.estoque -= item.quantity;
    }

    const resultadoVenda = await this.datadb.execute(
      "INSERT INTO vendas (total, forma_pagamento) VALUES (?, ?)", 
      [totalVenda, payment_method ?? "Dinheiro"]
    );

    const idVendaGerado = resultadoVenda.lastID; 

    for (const itemVenda of itensVendaParaSalvar) {
      await this.datadb.execute(
        "INSERT INTO produtos_venda (venda_id, produto_id, quantidade, preco_unitario, valor_total) VALUES (?, ?, ?, ?, ?)",
        [idVendaGerado, itemVenda.produto_id, itemVenda.quantity, itemVenda.unit_price, itemVenda.total_price]
      );
    }

    for (const produtoDb of produtosDb) {
      await this.datadb.execute(
        "UPDATE produtos SET estoque = ? WHERE id_produto = ?",
        [produtoDb.estoque, produtoDb.id_produto]
      );
    }

    return res.status(201).json({
      id_venda: idVendaGerado,
      total: totalVenda,
      forma_pagamento: payment_method ?? "Dinheiro"
    });
  }
}
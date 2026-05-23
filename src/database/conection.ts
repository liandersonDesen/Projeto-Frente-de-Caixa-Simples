import { open, Database as SQLiteDB } from 'sqlite';
import sqlite3 from 'sqlite3';
import path from 'node:path';

export class Database {
  private db: SQLiteDB | null = null;

  // Abre a conexão com o arquivo SQLite
  async connect() {
    if (!this.db) {
      this.db = await open({
        filename: path.resolve(__dirname, '..', '..', 'database.db'), 
        driver: sqlite3.Database
      });

      //Ativa o suporte a chaves estrangeiras no SQLite
      await this.db.get("PRAGMA foreign_keys = ON");
    }
    return this.db;
  }

  // Método auxiliar para facilitar as consultas (Select)
  async queryAll(sql: string, params: any[] = []) {
    const connection = await this.connect();
    return connection.all(sql, params);
  }

  async queryOne(sql: string, params: any[] = []) {
    const connection = await this.connect();
    return connection.get(sql, params);
  }

  // Método auxiliar para inserir, atualizar e deletar (Run)
  async execute(sql: string, params: any[] = []) {
    const connection = await this.connect();
    return connection.run(sql, params);
  }
}
import fs from "node:fs";
import path from "node:path";

const DATABASE_PATH = path.resolve(process.cwd(), "src", "database", "db.json");

export class Database {
  #database: Record<string, any[]> = {};

  constructor() {
    try {
      const data = fs.readFileSync(DATABASE_PATH, "utf8");
      this.#database = JSON.parse(data);
    } catch {
      this.#persist();
    }
  }

  #persist(): void {
    fs.writeFileSync(DATABASE_PATH, JSON.stringify(this.#database, null, 2));
  }

  insert(table: string, data: any): void {
    if (Array.isArray(this.#database[table])) {
      this.#database[table].push(data);
    } else {
      this.#database[table] = [data];
    }
    this.#persist();
  }

  select(table: string): any[] {
    return this.#database[table] ?? [];
  }

  updateTable(table: string, data: any[]): void {
    this.#database[table] = data;
    this.#persist();
  }
}
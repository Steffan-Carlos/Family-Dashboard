import "reflect-metadata";
import { DataSource } from "typeorm";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const AppDataSource = new DataSource({
  type: "better-sqlite3",
  database: path.join(__dirname, "../../family-dashboard.db"),
  synchronize: true,
  logging: false,
  entities: [path.join(__dirname, "entities/**/*.{ts,js}")],
  migrations: [path.join(__dirname, "migrations/**/*.{ts,js}")],
});

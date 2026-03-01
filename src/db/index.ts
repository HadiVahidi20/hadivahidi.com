import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import * as schema from "./schema";

const pool = mysql.createPool({
  host: process.env.DATABASE_HOST!,
  port: Number(process.env.DATABASE_PORT) || 3306,
  database: process.env.DATABASE_NAME!,
  user: process.env.DATABASE_USER!,
  password: process.env.DATABASE_PASSWORD!,
  waitForConnections: true,
  connectionLimit: 10,
  charset: "utf8mb4",
});

export const db = drizzle(pool, { schema, mode: "default" });
export type Database = typeof db;

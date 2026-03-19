import "dotenv/config";
import { Client } from "pg";

export function getDbConfig() {
  if (process.env.DATABASE_URL) {
    return { connectionString: process.env.DATABASE_URL };
  }

  if (!process.env.PGPASSWORD) {
    throw new Error(
      "Missing DB credentials: set PGPASSWORD in .env (or provide DATABASE_URL)."
    );
  }

  return {
    user: process.env.PGUSER || "postgres",
    host: process.env.PGHOST || "localhost",
    database: process.env.PGDATABASE || "auth",
    password: process.env.PGPASSWORD,
    port: Number(process.env.PGPORT || 5432),
  };
}

export function createDbClient() {
  return new Client(getDbConfig());
}


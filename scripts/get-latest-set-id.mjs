import { Client } from "pg";

const db = new Client({
  user: "postgres",
  host: "localhost",
  database: "auth",
  password: "$chOOl22",
  port: 5432,
});

await db.connect();
const res = await db.query("SELECT id FROM public.sets ORDER BY id DESC LIMIT 1");
console.log(res.rows[0]?.id ?? "");
await db.end();


import { Client } from "pg";

const id = Number(process.argv[2]);

const db = new Client({
  user: "postgres",
  host: "localhost",
  database: "auth",
  password: "$chOOl22",
  port: 5432,
});

await db.connect();
const res = await db.query("SELECT id, topic, title, color FROM public.sets WHERE id = $1", [id]);
console.log(res.rows[0] || null);
await db.end();


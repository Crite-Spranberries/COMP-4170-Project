import { Client } from "pg";

const db = new Client({
  user: "postgres",
  host: "localhost",
  database: "auth",
  password: "$chOOl22",
  port: 5432,
});

await db.connect();

const email = `cursor_test_${Date.now()}@example.com`;
const password = "testpw";

const inserted = await db.query(
  "INSERT INTO public.users (email, password) VALUES ($1, $2) RETURNING id, email",
  [email, password]
);

console.log("Inserted:", inserted.rows[0]);

await db.query("DELETE FROM public.users WHERE id = $1", [inserted.rows[0].id]);

await db.end();


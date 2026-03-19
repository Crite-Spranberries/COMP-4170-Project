import { Client } from "pg";

const db = new Client({
  user: "postgres",
  host: "localhost",
  database: "auth",
  password: "$chOOl22",
  port: 5432,
});

await db.connect();
const result = await db.query(
  "UPDATE public.sets SET topic = 'Custom Deck' WHERE topic = 'Custom Set'"
);
console.log("updated_rows:", result.rowCount);
await db.end();


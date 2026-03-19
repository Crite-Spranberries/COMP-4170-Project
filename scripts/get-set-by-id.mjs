import { createDbClient } from "../db/client.js";

const id = Number(process.argv[2]);

const db = createDbClient();

await db.connect();
const res = await db.query("SELECT id, topic, title, color FROM public.sets WHERE id = $1", [id]);
console.log(res.rows[0] || null);
await db.end();


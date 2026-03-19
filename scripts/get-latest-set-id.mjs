import { createDbClient } from "../db/client.js";

const db = createDbClient();

await db.connect();
const res = await db.query("SELECT id FROM public.sets ORDER BY id DESC LIMIT 1");
console.log(res.rows[0]?.id ?? "");
await db.end();


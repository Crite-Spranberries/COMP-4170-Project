import { createDbClient } from "../db/client.js";

const db = createDbClient();

await db.connect();
const result = await db.query(
  "UPDATE public.sets SET topic = 'Custom Deck' WHERE topic = 'Custom Set'"
);
console.log("updated_rows:", result.rowCount);
await db.end();


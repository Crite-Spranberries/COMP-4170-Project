import { createDbClient } from "../db/client.js";

const db = createDbClient();

await db.connect();

const res = await db.query(
  `
  select
    column_name,
    data_type,
    is_nullable,
    column_default,
    is_identity,
    identity_generation
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'users'
  order by ordinal_position
  `.trim()
);

console.table(res.rows);

await db.end();


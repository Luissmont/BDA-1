import { Pool } from 'pg';

let pool: Pool;

if (!global.dbPool) {
  global.dbPool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });
}
pool = global.dbPool;

declare global {
  var dbPool: Pool | undefined;
}

export default pool;
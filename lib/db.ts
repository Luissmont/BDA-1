import { Pool } from 'pg';

const DB_USER = process.env.DB_USER || 'app_reader';
const DB_PASSWORD = process.env.DB_PASSWORD || 'app_secure_pass_2024';
const DB_HOST = process.env.DB_HOST || 'postgres';
const DB_PORT = process.env.DB_PORT || '5432';
const POSTGRES_DB = process.env.POSTGRES_DB || 'actividad_db';

const connectionString = `postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${POSTGRES_DB}`;

let pool: Pool;

if (!global.dbPool) {
  global.dbPool = new Pool({
    connectionString,
  });
}
pool = global.dbPool;

declare global {
  var dbPool: Pool | undefined;
}

export default pool;
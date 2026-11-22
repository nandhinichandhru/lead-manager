import mysql from 'mysql2/promise';
import { env } from '../config/env.js';

const connectionOptions = {
  host: env.db.host,
  port: env.db.port,
  user: env.db.user,
  password: env.db.password,
  charset: 'utf8mb4',
};

/** Connection pool used by every query in the API. */
export const pool = mysql.createPool({
  ...connectionOptions,
  database: env.db.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: 'Z',
});

/** Opens a connection without selecting a database (used by db:init). */
export function createServerConnection() {
  return mysql.createConnection(connectionOptions);
}

export async function assertDatabaseConnection() {
  const connection = await pool.getConnection();
  try {
    await connection.query('SELECT 1');
  } finally {
    connection.release();
  }
}

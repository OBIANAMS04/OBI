import { readFileSync } from 'fs';
import { resolve } from 'path';
import pool from './connection';

async function runMigrations() {
  const client = await pool.connect();

  try {
    console.log('Running migrations...');

    const sql = readFileSync(resolve(__dirname, 'migrations/001_init_users.sql'), 'utf-8');
    await client.query(sql);

    console.log('✅ Migrations completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigrations().catch((err) => {
  console.error(err);
  process.exit(1);
});

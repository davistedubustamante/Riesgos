import 'dotenv/config';
import mysql from 'mysql2/promise';

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
  });

  const [c] = await conn.query('SHOW COLUMNS FROM contexts');
  console.log('=== CONTEXTS ===');
  c.forEach(r => console.log(r.Field, r.Type, r.Null, r.Key, r.Default || ''));

  const [r] = await conn.query('SHOW COLUMNS FROM risk_responses');
  console.log('=== RISK_RESPONSES ===');
  r.forEach(r => console.log(r.Field, r.Type, r.Null, r.Key, r.Default || ''));

  const [rr] = await conn.query('SHOW COLUMNS FROM risks');
  console.log('=== RISKS ===');
  rr.forEach(r => console.log(r.Field, r.Type, r.Null, r.Key, r.Default || ''));

  await conn.end();
}

main().catch(e => { console.error(e.message); process.exit(1); });

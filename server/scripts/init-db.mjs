// Idempotente: crea BD y aplica el schema completo desde schema.sql.
// Uso: cd server && node scripts/init-db.mjs

import 'dotenv/config';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');
// Carga explícita del .env desde server/.env (no depende del CWD).
import dotenvCfg from 'dotenv';
dotenvCfg.config({ path: path.resolve(__dirname, '..', '.env') });

const DB_NAME = process.env.DB_NAME || 'riesgos_db';

async function main() {
  console.log('→ Conectando a MySQL (sin elegir BD)...');
  const admin = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    connectTimeout: 10000,
    multipleStatements: true,
  });

  console.log(`→ Creando BD \`${DB_NAME}\` si no existe...`);
  await admin.query(
    `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  );
  await admin.changeUser({ database: DB_NAME });

  // Si ya existían tablas de una versión anterior, las dropeamos para empezar limpio.
  // (El schema.sql es la fuente de verdad; cualquier cambio rompe versiones viejas.)
  console.log('→ Dropeando tablas previas (si existen) para empezar limpio...');
  await admin.query('SET FOREIGN_KEY_CHECKS = 0');
  const dropOrder = ['audit_log', 'activity_resources', 'risk_responses', 'activities', 'resources', 'stakeholders', 'risks', 'sprints', 'contexts', 'projects', 'sessions', 'users'];
  for (const t of dropOrder) {
    await admin.query(`DROP TABLE IF EXISTS \`${t}\``);
  }
  await admin.query('SET FOREIGN_KEY_CHECKS = 1');

  console.log('→ Aplicando schema.sql completo (multipleStatements)...');
  await admin.query(fs.readFileSync(SCHEMA_PATH, 'utf-8'));
  await admin.end();

  // Verificación post-aplicación.
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: DB_NAME,
  });
  const [tables] = await conn.query('SHOW TABLES');
  console.log(`→ Esquema aplicado en \`${DB_NAME}\`. Tablas (${tables.length}):`);
  for (const r of tables) {
    const tn = Object.values(r)[0];
    const [c] = await conn.query(`SELECT COUNT(*) AS n FROM \`${tn}\``);
    console.log(`   · ${tn.padEnd(22)} (${c[0].n} filas)`);
  }
  await conn.end();
  console.log('✔ Schema aplicado correctamente.');
}

main().catch((e) => {
  console.error('✘ Error:', e.code || e.message);
  process.exit(1);
});

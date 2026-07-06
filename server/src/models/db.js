// Capa de BD: pool MySQL vía mysql2/promise. Centraliza toda la I/O.
// Uso básico en controllers:
//   const rows = await q('SELECT ... WHERE id=?', [id]);
//   const result = await q('INSERT ... VALUES (?)', [val]);   // result.insertId
//
// Manejo del JSON para text[] semántico (stakeholders, technologies, assets, etc.):
//   import { arrToJson, jsonToArr } from '../models/db.js';
//   - arrToJson(['a','b']) → '["a","b"]'    (stringify estable)
//   - jsonToArr(jsonString | array | null)  → array JS
//
// Conexión: lee DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME del .env (dotenv ya cargado arriba).

import 'dotenv/config';
import mysql from 'mysql2/promise';

let _pool = null;

function cfg() {
  const host = process.env.DB_HOST;
  const port = Number(process.env.DB_PORT);
  const user = process.env.DB_USER;
  const password = process.env.DB_PASSWORD;
  const database = process.env.DB_NAME || 'riesgos_db';
  if (!host || !user || !password) {
    throw new Error('DB_HOST/DB_USER/DB_PASSWORD no están definidos en .env');
  }
  return { host, port, user, password, database };
}

export function pool() {
  if (!_pool) {
    _pool = mysql.createPool({
      ...cfg(),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      connectTimeout: 10000,
      dateStrings: true, // conservar DATE/DATETIME como string estable
    });
  }
  return _pool;
}

// query(sql, params) -> [rows, fields]
export async function q(sql, params = []) {
  const [rows] = await pool().query(sql, params);
  return rows;
}

export async function one(sql, params = []) {
  const rows = await q(sql, params);
  return rows[0] || null;
}

// INSERT helper que devuelve el objeto recién insertado si pasas keys[],
// o el insertId si no.
export async function ins(table, row) {
  const cols = Object.keys(row);
  const placeholders = cols.map(() => '?').join(', ');
  const values = cols.map((k) => row[k]);
  const sql = `INSERT INTO \`${table}\` (${cols.map((c) => `\`${c}\``).join(', ')}) VALUES (${placeholders})`;
  const [r] = await pool().query(sql, values);
  return r.insertId;
}

export async function upd(table, id, patch) {
  const cols = Object.keys(patch);
  if (cols.length === 0) return 0;
  const setSql = cols.map((c) => `\`${c}\` = ?`).join(', ');
  const [r] = await pool().query(
    `UPDATE \`${table}\` SET ${setSql} WHERE id = ?`,
    [...cols.map((c) => patch[c]), id],
  );
  return r.affectedRows;
}

export async function del(table, id) {
  const [r] = await pool().query(`DELETE FROM \`${table}\` WHERE id = ?`, [id]);
  return r.affectedRows;
}

// Helpers para serializar arrays semánticos como JSON TEXT.
// En la BD guardamos arrays como JSON strings; al servir, los re-hidratamos a arrays.
export function arrToJson(arr) {
  if (arr == null) return null;
  if (typeof arr === 'string') return arr;
  if (!Array.isArray(arr)) return JSON.stringify([String(arr)]);
  return JSON.stringify(arr);
}

export function jsonToArr(val) {
  if (val == null || val === '') return [];
  if (Array.isArray(val)) return val;
  try {
    const parsed = JSON.parse(val);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    // Si por alguna razón era un CSV legacy, lo respetamos como un único string.
    return val.split(',').map((s) => s.trim()).filter(Boolean);
  }
}

// Aplana un row de la BD: convierte campos *_JSON (stakeholders, technologies, ...)
// configurados explícitamente a array JS. Para mantener el contrato antiguo con el frontend,
// pasamos la lista en columnasJs por query.
const SEMANTIC_JSON_COLS = ['stakeholders', 'technologies', 'assets', 'affectedProcesses'];
export function hydrate(row, columnsJs = SEMANTIC_JSON_COLS) {
  if (!row) return row;
  const out = { ...row };
  for (const c of columnsJs) {
    if (c in out) out[c] = jsonToArr(out[c]);
  }
  return out;
}

export function hydrateMany(rows, columnsJs = SEMANTIC_JSON_COLS) {
  return rows.map((r) => hydrate(r, columnsJs));
}

// Para aplicar el lado del INSERT/UPDATE: arrays → JSON string.
export function dehydrate(row, columnsJs = SEMANTIC_JSON_COLS) {
  if (!row) return row;
  const out = { ...row };
  for (const c of columnsJs) {
    if (c in out) out[c] = arrToJson(out[c]);
  }
  return out;
}

// Para verificación y tests: expone `qraw(sql, params)` que devuelve rows + fields
// sin pasar por hydrate (úsalo en scripts).
export async function qraw(sql, params = []) {
  const [rows] = await pool().query(sql, params);
  return rows;
}

export async function close() {
  if (_pool) {
    await _pool.end();
    _pool = null;
  }
}

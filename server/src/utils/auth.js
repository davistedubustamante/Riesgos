// Helpers de auth: hashing, JWT firmado, manejo de cookie httpOnly.

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { one, q } from '../models/db.js';

const SALT_ROUNDS = 12;

export async function hashPassword(plain) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain, hash) {
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}

export function signJwt(payload) {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('JWT_SECRET no definido o demasiado corto (>= 32 chars requeridos).');
  }
  return jwt.sign(payload, secret, { expiresIn: process.env.JWT_TTL || '7d' });
}

export function verifyJwt(token) {
  const secret = process.env.JWT_SECRET;
  if (!secret) return null;
  try {
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
}

// Genera un session ID opaco (no JWT) para guardar como cookie httpOnly.
// El JWT es opcional aparte, pero para control de revocación usamos este ID y guardamos su fila en `sessions`.
export function newSessionId() {
  // 32 bytes hex ≈ 64 caracteres
  return (
    Date.now().toString(36) +
    Math.random().toString(36).slice(2, 10) +
    Math.random().toString(36).slice(2, 18) +
    Math.random().toString(36).slice(2, 18)
  ).slice(0, 64);
}

// Crea una fila en `sessions` y devuelve el id. Sujeto a rotación manual más adelante.
export async function createSession(userId, meta = {}) {
  const id = newSessionId();
  const ttlDays = 7;
  const expiresAt = new Date(Date.now() + ttlDays * 86400_000)
    .toISOString()
    .slice(0, 19)
    .replace('T', ' ');
  await q(
    'INSERT INTO sessions (id, userId, ip, userAgent, expiresAt) VALUES (?, ?, ?, ?, ?)',
    [id, userId, meta.ip || null, (meta.userAgent || '').slice(0, 255), expiresAt],
  );
  return { sessionId: id, expiresAt: new Date(expiresAt + 'Z') };
}

// Carga la sesión desde BD si existe y no está revocada/expirada.
export async function loadSession(sessionId) {
  if (!sessionId) return null;
  const row = await one(
    `SELECT s.id AS sid, s.userId, s.revokedAt, s.expiresAt,
            u.id, u.email, u.name, u.role, u.active
       FROM sessions s
       JOIN users u ON u.id = s.userId
      WHERE s.id = ?
        AND s.revokedAt IS NULL
        AND s.expiresAt > NOW()
      LIMIT 1`,
    [sessionId],
  );
  if (!row || !row.active) return null;
  return {
    sessionId: row.sid,
    user: {
      id: row.userId,
      email: row.email,
      name: row.name,
      role: row.role,
    },
  };
}

export async function revokeSession(sessionId) {
  if (!sessionId) return 0;
  const r = await q(
    'UPDATE sessions SET revokedAt = NOW() WHERE id = ? AND revokedAt IS NULL',
    [sessionId],
  );
  return r.affectedRows ?? 0;
}

export const ROLES = ['admin', 'risk_manager', 'auditor', 'viewer'];

// Permisos derivados de la metodología ISO 31000.
// Admin = todo; risk_manager = gestiona riesgos y proyectos;
// auditor = solo lectura + audit_log; viewer = solo lectura.
export function can(role, action) {
  const perms = {
    admin: new Set(['*']),
    risk_manager: new Set([
      'projects.read', 'projects.write',
      'contexts.read', 'contexts.write',
      'sprints.read', 'sprints.write',
      'risks.read', 'risks.write',
      'dashboard.read', 'heatmap.read',
      'treatment.write',
      'audit.read',
    ]),
    auditor: new Set([
      'projects.read', 'contexts.read', 'sprints.read', 'risks.read',
      'dashboard.read', 'heatmap.read',
      'audit.read',
    ]),
    viewer: new Set([
      'projects.read', 'contexts.read', 'sprints.read', 'risks.read',
      'dashboard.read', 'heatmap.read',
    ]),
  };
  const set = perms[role];
  if (!set) return false;
  if (set.has('*')) return true;
  return set.has(action);
}

export const COOKIE_NAME = process.env.AUTH_COOKIE_NAME || 'rf_session';

// Configura los flags de la cookie. En producción con HTTPS usar `secure: true`.
export function buildCookieOptions({ expires }) {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    sameSite: 'strict',
    secure: isProd,        // en local http, en producción https
    path: '/',
    expires: expires || undefined,
    maxAge: expires ? expires.getTime() - Date.now() : 7 * 86400_000,
  };
}

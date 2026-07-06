// Auth controller: register, login, logout, me.

import { z } from 'zod';
import { one, q } from '../models/db.js';
import {
  hashPassword, verifyPassword,
  createSession, revokeSession,
  buildCookieOptions, COOKIE_NAME,
} from '../utils/auth.js';
import { logAudit } from '../utils/audit.js';

const email = z.string().email().max(160);
const password = z.string().min(8).max(120);
const name = z.string().min(2).max(160);

const registerSchema = z.object({ email, password, name, role: z.enum(['admin','risk_manager','auditor','viewer']).optional() });
const loginSchema = z.object({ email, password });

// Quién puede registrarse:
//  - Si no hay usuarios todavía, el primer registro es admin (bootstrap).
//  - En cualquier otro caso, solo admin puede crear usuarios.
async function isBootstrap() {
  const r = await one('SELECT COUNT(*) AS n FROM users');
  return !r || r.n === 0;
}

export async function register(req, res) {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.issues.map((i) => i.message) });
  }
  const { email: e, password: p, name: n } = parsed.data;

  // Bootstrap: primer usuario del sistema es admin automáticamente. Si no, solo admin puede crear.
  const boot = await isBootstrap();
  const role = boot ? 'admin' : (req.user?.role === 'admin' && parsed.data.role ? parsed.data.role : 'risk_manager');

  if (!boot && (!req.user || req.user.role !== 'admin')) {
    return res.status(403).json({ error: 'Solo un admin puede crear usuarios' });
  }

  const existing = await one('SELECT id FROM users WHERE email = ?', [e.toLowerCase()]);
  if (existing) return res.status(409).json({ error: 'Email ya registrado' });

  const id = 'u_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const hash = await hashPassword(p);
  await q(
    `INSERT INTO users (id, email, name, password_hash, role, active) VALUES (?, ?, ?, ?, ?, 1)`,
    [id, e.toLowerCase(), n, hash, role],
  );

  await logAudit(id, 'register', 'user', id, { role }, req.ip);

  // Auto-login tras registro si es bootstrap.
  if (boot) {
    const { sessionId, expiresAt } = await createSession(id, { ip: req.ip, userAgent: req.headers['user-agent'] });
    res.cookie(COOKIE_NAME, sessionId, buildCookieOptions({ expires: expiresAt }));
    return res.status(201).json({ user: { id, email: e.toLowerCase(), name: n, role }, sessionId });
  }
  res.status(201).json({ user: { id, email: e.toLowerCase(), name: n, role } });
}

export async function login(req, res) {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.issues.map((i) => i.message) });
  }
  const { email: e, password: p } = parsed.data;
  const user = await one('SELECT id, email, name, role, active, password_hash FROM users WHERE email = ? LIMIT 1', [e.toLowerCase()]);
  if (!user || !user.active) return res.status(401).json({ error: 'Credenciales inválidas' });

  const ok = await verifyPassword(p, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Credenciales inválidas' });

  const { sessionId, expiresAt } = await createSession(user.id, { ip: req.ip, userAgent: req.headers['user-agent'] });
  res.cookie(COOKIE_NAME, sessionId, buildCookieOptions({ expires: expiresAt }));

  await logAudit(user.id, 'login', 'user', user.id, {}, req.ip);

  res.json({
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    sessionId,
  });
}

export async function logout(req, res) {
  if (req.sessionId) {
    await revokeSession(req.sessionId);
    await logAudit(req.user?.id, 'logout', null, null, {}, req.ip);
  }
  res.clearCookie(COOKIE_NAME, { path: '/' });
  res.json({ ok: true });
}

export async function me(req, res) {
  if (!req.user) return res.status(401).json({ error: 'No autenticado' });
  res.json({ user: req.user });
}

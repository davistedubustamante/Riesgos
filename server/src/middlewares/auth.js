// Middlewares de autenticación y autorización.

import { COOKIE_NAME, loadSession, can } from '../utils/auth.js';

export async function attachUser(req, _res, next) {
  try {
    // Acepta la cookie o un header Authorization: Bearer <sessionId>
    const cookieToken = req.cookies?.[COOKIE_NAME];
    const header = req.headers.authorization;
    const headerToken = header && header.startsWith('Bearer ') ? header.slice(7) : null;
    const sessionId = cookieToken || headerToken;
    if (!sessionId) return next();
    const session = await loadSession(sessionId);
    if (session) {
      req.sessionId = sessionId;
      req.user = session.user;
    }
    next();
  } catch (e) {
    // Si la base de datos falla (ej. conexiones agotadas), no invalidamos la sesión.
    // Propagamos el error para que la API retorne un 500 y conserve el estado de login.
    const isDbErr = e.code === 'ER_CON_COUNT_ERROR' || e.message.includes('conn') || e.message.includes('connection');
    if (isDbErr) {
      return next(e);
    }
    req.user = null;
    next();
  }
}

export function requireAuth(req, res, next) {
  if (req.user) return next();
  res.status(401).json({ error: 'Autenticación requerida' });
}

export function requireRole(action) {
  return (req, res, next) => {
    if (!req.user) return res.status(401).json({ error: 'Autenticación requerida' });
    if (!can(req.user.role, action)) {
      return res.status(403).json({ error: `Permiso denegado: ${action}` });
    }
    next();
  };
}

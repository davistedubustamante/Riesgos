import { HttpError } from '../utils/errors.js';

// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ error: err.message, ...(err.details ? { details: err.details } : {}) });
  }
  console.error('[riskflow-web] Error inesperado:', err);
  res.status(500).json({ error: 'Error interno del servidor' });
}

export function notFound(req, res) {
  res.status(404).json({ error: `Ruta no encontrada: ${req.method} ${req.path}` });
}

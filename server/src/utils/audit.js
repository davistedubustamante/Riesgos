import { q } from '../models/db.js';

export async function logAudit(userId, action, entityType = null, entityId = null, meta = {}, ip = null) {
  try {
    const metaStr = typeof meta === 'string' ? meta : JSON.stringify(meta);
    await q(
      `INSERT INTO audit_log (userId, action, entityType, entityId, meta, ip)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId || null, action, entityType || null, entityId || null, metaStr, ip || null]
    );
  } catch (err) {
    console.error('[audit] Error al insertar en audit_log:', err);
  }
}

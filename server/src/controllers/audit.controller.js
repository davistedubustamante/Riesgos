import { q, one } from '../models/db.js';

export async function listAuditLogs(req, res) {
  const { userId, action, entityType, limit = 50, offset = 0 } = req.query;

  const where = [];
  const params = [];

  if (userId) {
    where.push('a.userId = ?');
    params.push(userId);
  }
  if (action) {
    where.push('a.action = ?');
    params.push(action);
  }
  if (entityType) {
    where.push('a.entityType = ?');
    params.push(entityType);
  }

  const whereSql = where.length ? ' WHERE ' + where.join(' AND ') : '';

  const countRow = await one(`SELECT COUNT(*) AS total FROM audit_log a${whereSql}`, params);
  const total = countRow?.total || 0;

  const limitVal = Number(limit);
  const offsetVal = Number(offset);

  const sql = `
    SELECT a.*, u.email as userEmail, u.name as userName
      FROM audit_log a
      LEFT JOIN users u ON u.id = a.userId
      ${whereSql}
     ORDER BY a.createdAt DESC
     LIMIT ? OFFSET ?
  `;

  const logs = await q(sql, [...params, limitVal, offsetVal]);

  res.json({
    logs: logs.map(l => {
      if (l.createdAt && l.createdAt.includes(' ')) {
        l.createdAt = l.createdAt.replace(' ', 'T') + 'Z';
      }
      return l;
    }),
    total,
    limit: limitVal,
    offset: offsetVal
  });
}

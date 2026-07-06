import { q, one } from '../models/db.js';
import { logAudit } from '../utils/audit.js';

export async function listUsers(req, res) {
  const users = await q('SELECT id, email, name, role, active, createdAt, updatedAt FROM users ORDER BY createdAt DESC');
  res.json(users.map(u => {
    if (u.createdAt && u.createdAt.includes(' ')) u.createdAt = u.createdAt.replace(' ', 'T') + 'Z';
    if (u.updatedAt && u.updatedAt.includes(' ')) u.updatedAt = u.updatedAt.replace(' ', 'T') + 'Z';
    return u;
  }));
}

export async function updateUserStatus(req, res) {
  const { id } = req.params;
  const { active } = req.body;

  if (active === undefined) {
    return res.status(400).json({ error: 'El campo active es obligatorio' });
  }

  const existing = await one('SELECT id, email, active FROM users WHERE id = ?', [id]);
  if (!existing) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  const activeVal = active ? 1 : 0;
  await q('UPDATE users SET active = ?, updatedAt = NOW() WHERE id = ?', [activeVal, id]);

  await logAudit(req.user.id, activeVal ? 'activate_user' : 'deactivate_user', 'user', id, { email: existing.email }, req.ip);

  res.json({ ok: true, active: !!activeVal });
}

export async function updateUserRole(req, res) {
  const { id } = req.params;
  const { role } = req.body;

  const ROLES = ['admin', 'risk_manager', 'auditor', 'viewer'];
  if (!role || !ROLES.includes(role)) {
    return res.status(400).json({ error: 'Rol inválido o no especificado' });
  }

  const existing = await one('SELECT id, email, role FROM users WHERE id = ?', [id]);
  if (!existing) {
    return res.status(404).json({ error: 'Usuario no encontrado' });
  }

  await q('UPDATE users SET role = ?, updatedAt = NOW() WHERE id = ?', [role, id]);

  await logAudit(req.user.id, 'change_user_role', 'user', id, { email: existing.email, oldRole: existing.role, newRole: role }, req.ip);

  res.json({ ok: true, role });
}

import { z } from 'zod';
import { q, one, del } from '../models/db.js';

const baseSchema = z.object({
  code: z.string().optional(),
  category: z.enum(['RRHH','FisicoTecnologico','FisicoMaterial','Virtual']),
  name: z.string().min(2),
  description: z.string().optional(),
});

function flattenZod(err) {
  return err.issues.map((i) => `${i.path.join('.') || 'body'}: ${i.message}`);
}

function rowToApi(r) {
  if (!r) return r;
  if (r.createdAt && r.createdAt.includes(' ')) r.createdAt = r.createdAt.replace(' ', 'T') + 'Z';
  if (r.updatedAt && r.updatedAt.includes(' ')) r.updatedAt = r.updatedAt.replace(' ', 'T') + 'Z';
  return r;
}

export async function listResources(req, res) {
  const { projectId, category } = req.query;
  const where = [];
  const params = [];
  if (projectId) { where.push('projectId = ?'); params.push(projectId); }
  if (category) { where.push('category = ?'); params.push(category); }
  const sql = 'SELECT * FROM `resources`' + (where.length ? ' WHERE ' + where.join(' AND ') : '') + ' ORDER BY category, code';
  const rows = await q(sql, params);
  res.json(rows.map(rowToApi));
}

export async function getResource(req, res) {
  const r = await one('SELECT * FROM `resources` WHERE id = ?', [req.params.id]);
  if (!r) return res.status(404).json({ error: 'Recurso no encontrado' });
  res.json(rowToApi(r));
}

export async function createResource(req, res) {
  const parsed = baseSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: flattenZod(parsed.error) });
  const projectId = req.body.projectId;
  if (!projectId) return res.status(400).json({ errors: ['projectId es obligatorio'] });

  const id = 'res_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  const code = req.body.code || id.slice(0, 8);
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  await q(
    `INSERT INTO resources (id, projectId, code, category, name, description, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, projectId, code, parsed.data.category, parsed.data.name, parsed.data.description ?? null, now, now],
  );

  const out = await one('SELECT * FROM `resources` WHERE id = ?', [id]);
  res.status(201).json(rowToApi(out));
}

export async function deleteResource(req, res) {
  const r = await del('resources', req.params.id);
  if (!r) return res.status(404).json({ error: 'Recurso no encontrado' });
  res.status(204).end();
}

export async function getResourceByActivity(req, res) {
  const { activityId } = req.query;
  if (!activityId) return res.status(400).json({ errors: ['activityId es obligatorio'] });

  const rows = await q(
    `SELECT r.*, ar.resource_type
     FROM activity_resources ar
     JOIN resources r ON ar.resourceId = r.id
     WHERE ar.activityId = ?`,
    [activityId],
  );
  res.json(rows.map(rowToApi));
}

export async function linkResourceToActivity(req, res) {
  const { activityId, resourceId, resource_type } = req.body;
  if (!activityId || !resourceId || !resource_type) {
    return res.status(400).json({ errors: ['activityId, resourceId y resource_type son obligatorios'] });
  }
  const id = 'arr_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  await q(
    `INSERT IGNORE INTO activity_resources (id, activityId, resourceId, resource_type, createdAt) VALUES (?, ?, ?, ?, ?)`,
    [id, activityId, resourceId, resource_type, now],
  );
  res.status(201).json({ id, activityId, resourceId, resource_type });
}

export async function unlinkResourceFromActivity(req, res) {
  const { activityId, resourceId } = req.body;
  if (!activityId || !resourceId) return res.status(400).json({ errors: ['activityId y resourceId son obligatorios'] });
  await q('DELETE FROM activity_resources WHERE activityId=? AND resourceId=?', [activityId, resourceId]);
  res.status(204).end();
}

export async function getProjectActivityResources(req, res) {
  const { projectId } = req.query;
  if (!projectId) return res.status(400).json({ errors: ['projectId es obligatorio'] });

  const rows = await q(
    `SELECT ar.activityId, ar.resource_type, r.*
     FROM activity_resources ar
     JOIN resources r ON ar.resourceId = r.id
     WHERE r.projectId = ?`,
    [projectId],
  );

  const mappings = {};
  for (const r of rows) {
    const formatted = rowToApi(r);
    const actId = r.activityId;
    if (!mappings[actId]) {
      mappings[actId] = [];
    }
    mappings[actId].push(formatted);
  }

  res.json(mappings);
}

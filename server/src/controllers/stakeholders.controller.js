import { z } from 'zod';
import { q, one, del } from '../models/db.js';

const Numeric = z.coerce.number().int().min(1).max(5);

const baseSchema = z.object({
  name: z.string().min(2),
  type: z.string(),
  ring: z.string(),
  power: Numeric.optional(),
  influence: Numeric.optional(),
  interest: Numeric.optional(),
  commitment_actual: Numeric.optional(),
  commitment_desired: Numeric.optional(),
  strategy_mendelow: z.string().optional(),
  quadrant_inf_pow: z.string().optional(),
  action: z.string().optional(),
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

function nextCode(projectId) {
  return q('SELECT code FROM stakeholders WHERE projectId = ?', [projectId])
    .then((rows) => {
      const nums = rows.map((r) => parseInt(String(r.code).replace(/\D/g, ''), 10) || 0);
      return 'S' + String((Math.max(0, ...nums) || 0) + 1).padStart(2, '0');
    });
}

export async function listStakeholders(req, res) {
  const { projectId, ring, type } = req.query;
  const where = [];
  const params = [];
  if (projectId) { where.push('projectId = ?'); params.push(projectId); }
  if (ring)     { where.push('ring = ?');      params.push(ring); }
  if (type)     { where.push('type = ?');      params.push(type); }
  const sql = 'SELECT * FROM `stakeholders`' + (where.length ? ' WHERE ' + where.join(' AND ') : '') + ' ORDER BY code';
  const rows = await q(sql, params);
  res.json(rows.map(rowToApi));
}

export async function getStakeholder(req, res) {
  const r = await one('SELECT * FROM `stakeholders` WHERE id = ?', [req.params.id]);
  if (!r) return res.status(404).json({ error: 'Stakeholder no encontrado' });
  res.json(rowToApi(r));
}

export async function createStakeholder(req, res) {
  const parsed = baseSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: flattenZod(parsed.error) });
  const projectId = req.body.projectId;
  if (!projectId) return res.status(400).json({ errors: ['projectId es obligatorio'] });
  const project = await one('SELECT id FROM `projects` WHERE id = ?', [projectId]);
  if (!project) return res.status(400).json({ errors: ['projectId: proyecto no existe'] });

  const code = req.body.code || (await nextCode(projectId));
  const id = 'stkh_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  await q(
    `INSERT INTO stakeholders (id, projectId, code, name, type, ring, power, influence, interest, commitment_actual, commitment_desired, strategy_mendelow, quadrant_inf_pow, action, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, projectId, code,
      parsed.data.name,
      parsed.data.type,
      parsed.data.ring,
      parsed.data.power ?? 1,
      parsed.data.influence ?? 1,
      parsed.data.interest ?? 1,
      parsed.data.commitment_actual ?? 1,
      parsed.data.commitment_desired ?? 1,
      parsed.data.strategy_mendelow ?? null,
      parsed.data.quadrant_inf_pow ?? null,
      parsed.data.action ?? null,
      now, now],
  );

  const out = await one('SELECT * FROM `stakeholders` WHERE id = ?', [id]);
  res.status(201).json(rowToApi(out));
}

export async function updateStakeholder(req, res) {
  const existing = await one('SELECT * FROM `stakeholders` WHERE id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ error: 'Stakeholder no encontrado' });

  const partial = baseSchema.partial().safeParse(req.body);
  if (!partial.success) return res.status(400).json({ errors: flattenZod(partial.error) });

  const ALLOWED = ['name','type','ring','power','influence','interest','commitment_actual','commitment_desired','strategy_mendelow','quadrant_inf_pow','action'];
  const patch = {};
  for (const k of ALLOWED) if (k in partial.data) patch[k] = partial.data[k];
  patch.updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

  const setSql = Object.keys(patch).map((c) => `\`${c}\` = ?`).join(', ');
  await q(`UPDATE \`stakeholders\` SET ${setSql} WHERE id = ?`, [...Object.values(patch), req.params.id]);

  const out = await one('SELECT * FROM `stakeholders` WHERE id = ?', [req.params.id]);
  res.json(rowToApi(out));
}

export async function deleteStakeholder(req, res) {
  const r = await del('stakeholders', req.params.id);
  if (!r) return res.status(404).json({ error: 'Stakeholder no encontrado' });
  res.status(204).end();
}

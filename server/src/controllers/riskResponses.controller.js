import { z } from 'zod';
import { q, one, del } from '../models/db.js';

const baseSchema = z.object({
  riskId: z.string().min(1),
  action: z.string().min(2),
  deadline_days: z.coerce.number().int().min(1).optional().default(30),
  status: z.enum(['Abierto','En proceso','Cerrado']).optional().default('Abierto'),
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

export async function listRiskResponses(req, res) {
  const { projectId, riskId, status } = req.query;
  const where = [];
  const params = [];
  if (projectId) { where.push('rr.projectId = ?'); params.push(projectId); }
  if (riskId)    { where.push('rr.riskId = ?');    params.push(riskId); }
  if (status)    { where.push('rr.status = ?');    params.push(status); }
  const sql =
    'SELECT rr.*, r.code as risk_code, r.title as risk_title ' +
    'FROM `risk_responses` rr ' +
    'JOIN risks r ON rr.riskId = r.id ' +
    (where.length ? ' WHERE ' + where.join(' AND ') : '') +
    ' ORDER BY rr.status, rr.createdAt DESC';
  const rows = await q(sql, params);
  res.json(rows.map(rowToApi));
}

export async function getRiskResponse(req, res) {
  const r = await one('SELECT * FROM `risk_responses` WHERE id = ?', [req.params.id]);
  if (!r) return res.status(404).json({ error: 'Respuesta no encontrada' });
  res.json(rowToApi(r));
}

export async function createRiskResponse(req, res) {
  const parsed = baseSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: flattenZod(parsed.error) });

  const risk = await one('SELECT id, projectId FROM `risks` WHERE id = ?', [parsed.data.riskId]);
  if (!risk) return res.status(400).json({ errors: ['riskId: riesgo no existe'] });

  const id = 'rr_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  await q(
    `INSERT INTO risk_responses (id, riskId, projectId, action, deadline_days, status, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, parsed.data.riskId, risk.projectId, parsed.data.action, parsed.data.deadline_days, parsed.data.status, now, now],
  );

  const out = await one('SELECT * FROM `risk_responses` WHERE id = ?', [id]);
  res.status(201).json(rowToApi(out));
}

export async function updateRiskResponse(req, res) {
  const existing = await one('SELECT * FROM `risk_responses` WHERE id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ error: 'Respuesta no encontrada' });

  const partial = baseSchema.partial().safeParse(req.body);
  if (!partial.success) return res.status(400).json({ errors: flattenZod(partial.error) });

  const patch = {};
  for (const k of ['action','deadline_days','status']) if (k in partial.data) patch[k] = partial.data[k];
  patch.updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

  const setSql = Object.keys(patch).map((c) => `\`${c}\` = ?`).join(', ');
  await q(`UPDATE \`risk_responses\` SET ${setSql} WHERE id = ?`, [...Object.values(patch), req.params.id]);

  const out = await one('SELECT * FROM `risk_responses` WHERE id = ?', [req.params.id]);
  res.json(rowToApi(out));
}

export async function deleteRiskResponse(req, res) {
  const r = await del('risk_responses', req.params.id);
  if (!r) return res.status(404).json({ error: 'Respuesta no encontrada' });
  res.status(204).end();
}

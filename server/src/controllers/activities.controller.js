import { z } from 'zod';
import { q, one, del } from '../models/db.js';
import { computeRisk, classificationFromLevel } from '../utils/riskLevel.js';

const Numeric = z.coerce.number().int().min(1).max(5);

const baseSchema = z.object({
  code: z.string().optional(),
  sub_code: z.string().optional(),
  deliverable: z.string(),
  month: z.string(),
  objective: z.string().optional(),
  name: z.string().min(2),
  role_main: z.string().optional(),
  domain_pmbok: z.string().optional(),
  uncertainty_type: z.string().optional(),
  risk_type: z.string().optional(),
  probability: Numeric.optional(),
  impact: Numeric.optional(),
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

export async function listActivities(req, res) {
  const { projectId, deliverable, month, classification, domain_pmbok } = req.query;
  const where = [];
  const params = [];
  if (projectId)     { where.push('projectId = ?');      params.push(projectId); }
  if (deliverable)   { where.push('deliverable = ?');   params.push(deliverable); }
  if (month)         { where.push('month = ?');         params.push(month); }
  if (classification){ where.push('classification = ?'); params.push(classification); }
  if (domain_pmbok)  { where.push('domain_pmbok = ?');  params.push(domain_pmbok); }
  const sql = 'SELECT * FROM `activities`' + (where.length ? ' WHERE ' + where.join(' AND ') : '') + ' ORDER BY code';
  const rows = await q(sql, params);
  res.json(rows.map(rowToApi));
}

export async function getActivity(req, res) {
  const r = await one('SELECT * FROM `activities` WHERE id = ?', [req.params.id]);
  if (!r) return res.status(404).json({ error: 'Actividad no encontrada' });
  res.json(rowToApi(r));
}

export async function createActivity(req, res) {
  const parsed = baseSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: flattenZod(parsed.error) });
  const projectId = req.body.projectId;
  if (!projectId) return res.status(400).json({ errors: ['projectId es obligatorio'] });

  const id = 'act_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5);
  const code = req.body.code || id.slice(0, 12);
  const prob = parsed.data.probability ?? 3;
  const imp  = parsed.data.impact ?? 3;
  const { level, classification } = computeRisk({ probability: prob, impact: imp });
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');

  await q(
    `INSERT INTO activities (id, projectId, code, sub_code, deliverable, month, objective, name, role_main, domain_pmbok, uncertainty_type, risk_type, probability, impact, level, classification, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, projectId, code, parsed.data.sub_code ?? null, parsed.data.deliverable, parsed.data.month,
      parsed.data.objective ?? null, parsed.data.name, parsed.data.role_main ?? null,
      parsed.data.domain_pmbok ?? null, parsed.data.uncertainty_type ?? null,
      parsed.data.risk_type ?? null, prob, imp, level, classification, now, now],
  );

  const out = await one('SELECT * FROM `activities` WHERE id = ?', [id]);
  res.status(201).json(rowToApi(out));
}

export async function updateActivity(req, res) {
  const existing = await one('SELECT * FROM `activities` WHERE id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ error: 'Actividad no encontrada' });

  const partial = baseSchema.partial().safeParse(req.body);
  if (!partial.success) return res.status(400).json({ errors: flattenZod(partial.error) });

  const merged = { ...existing, ...partial.data };
  let prob = merged.probability;
  let imp  = merged.impact;
  if (partial.data.probability !== undefined || partial.data.impact !== undefined) {
    const r = computeRisk({ probability: prob, impact: imp });
    merged.level = r.level;
    merged.classification = r.classification;
  }

  const ALLOWED = ['code','sub_code','deliverable','month','objective','name','role_main','domain_pmbok','uncertainty_type','risk_type','probability','impact','level','classification'];
  const patch = {};
  for (const k of ALLOWED) if (k in merged) patch[k] = merged[k];
  patch.updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

  const setSql = Object.keys(patch).map((c) => `\`${c}\` = ?`).join(', ');
  await q(`UPDATE \`activities\` SET ${setSql} WHERE id = ?`, [...Object.values(patch), req.params.id]);

  const out = await one('SELECT * FROM `activities` WHERE id = ?', [req.params.id]);
  res.json(rowToApi(out));
}

export async function deleteActivity(req, res) {
  const r = await del('activities', req.params.id);
  if (!r) return res.status(404).json({ error: 'Actividad no encontrada' });
  res.status(204).end();
}

export async function getActivitiesSummary(req, res) {
  const { projectId } = req.query;
  if (!projectId) return res.status(400).json({ errors: ['projectId es obligatorio'] });

  const [byDeliverable, byMonth, byDomain, byLevel] = await Promise.all([
    q('SELECT deliverable, COUNT(*) as total, SUM(probability*impact) as total_risk FROM `activities` WHERE projectId=? GROUP BY deliverable ORDER BY deliverable', [projectId]),
    q('SELECT month, COUNT(*) as total, SUM(probability*impact) as total_risk FROM `activities` WHERE projectId=? GROUP BY month ORDER BY month', [projectId]),
    q('SELECT domain_pmbok, COUNT(*) as total, AVG(level) as avg_level FROM `activities` WHERE projectId=? GROUP BY domain_pmbok', [projectId]),
    q("SELECT classification, COUNT(*) as total FROM `activities` WHERE projectId=? GROUP BY classification ORDER BY FIELD(classification,'Bajo','Medio','Alto','Crítico')", [projectId]),
  ]);

  res.json({ byDeliverable, byMonth, byDomain, byLevel });
}

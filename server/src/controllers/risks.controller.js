import { z } from 'zod';
import { q, one, del } from '../models/db.js';
import { computeRisk, validateCriticalRisk, RISK_CATEGORIES, RISK_STATUSES, RESPONSE_STRATEGIES } from '../utils/riskLevel.js';
import { logAudit } from '../utils/audit.js';

const Numeric = z.coerce.number().int().min(1).max(5);
const optionalString = z.preprocess((v) => (v === '' ? undefined : v), z.string().optional());
const optionalDate = z.preprocess((v) => (v === '' ? undefined : v), z.string().optional());

const baseSchema = z.object({
  title: z.string().min(2),
  description: optionalString,
  category: z.enum(RISK_CATEGORIES).optional(),
  cause: optionalString,
  consequence: optionalString,
  probability: Numeric,
  impact: Numeric,
  owner: optionalString,
  sprintId: optionalString,
  status: z.enum(RISK_STATUSES).optional(),
  identifiedAt: optionalDate,
  alertIndicator: optionalString,
  responseStrategy: z.enum(RESPONSE_STRATEGIES).optional(),
  treatmentAction: optionalString,
  reviewDate: optionalDate,
  evidence: optionalString,
  expectedResult: optionalString,
  observations: optionalString,
});

function flattenZod(err) {
  return err.issues.map((i) => `${i.path.join('.') || 'body'}: ${i.message}`);
}

function rowToApi(r) {
  if (!r) return r;
  // dateStrings:true -> ya son string "YYYY-MM-DD HH:mm:ss"; trimming si viene con hora en DATETIME.
  if (r.createdAt && r.createdAt.includes(' ')) r.createdAt = r.createdAt.replace(' ', 'T') + 'Z';
  if (r.updatedAt && r.updatedAt.includes(' ')) r.updatedAt = r.updatedAt.replace(' ', 'T') + 'Z';
  return r;
}

function flatten(s) {
  return Object.fromEntries(Object.entries(s).filter(([, v]) => v !== undefined));
}

async function nextRiskCode(projectId) {
  const rows = await q('SELECT code FROM risks WHERE projectId = ?', [projectId]);
  const codes = rows.map((r) => parseInt(String(r.code).replace(/\D/g, ''), 10) || 0);
  const next = (Math.max(0, ...codes) || 0) + 1;
  return 'R' + String(next).padStart(2, '0');
}

function nextRiskId(rows) {
  const ids = rows.map((r) => Number(String(r.id).replace(/\D/g, '')) || 0);
  return 'r' + ((Math.max(0, ...ids) || 0) + 1);
}

export async function listRisks(req, res) {
  const { projectId, category, status, classification, sprintId, owner } = req.query;
  const where = [];
  const params = [];
  if (projectId) { where.push('projectId = ?'); params.push(projectId); }
  if (category)  { where.push('category = ?');  params.push(category); }
  if (status)    { where.push('status = ?');    params.push(status); }
  if (classification) { where.push('classification = ?'); params.push(classification); }
  if (sprintId)  { where.push('sprintId = ?');  params.push(sprintId); }
  if (owner)     { where.push('owner = ?');     params.push(owner); }
  const sql = `SELECT * FROM \`risks\`` + (where.length ? ' WHERE ' + where.join(' AND ') : '') + ' ORDER BY createdAt DESC';
  const rows = await q(sql, params);
  res.json(rows.map(rowToApi));
}

export async function getRisk(req, res) {
  const r = await one('SELECT * FROM `risks` WHERE id = ? LIMIT 1', [req.params.id]);
  if (!r) return res.status(404).json({ error: 'Riesgo no encontrado' });
  res.json(rowToApi(r));
}

export async function createRisk(req, res) {
  const parsed = baseSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ errors: flattenZod(parsed.error) });
  const projectId = req.body.projectId;
  if (!projectId) return res.status(400).json({ errors: ['projectId es obligatorio'] });
  const project = await one('SELECT id FROM `projects` WHERE id = ?', [projectId]);
  if (!project) return res.status(400).json({ errors: ['projectId: proyecto destino no existe'] });

  const ids = await q('SELECT id FROM risks');
  const id = nextRiskId(ids);
  const code = req.body.code || (await nextRiskCode(projectId));
  const { level, classification } = computeRisk(parsed.data);
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const identifiedAt = parsed.data.identifiedAt || now.slice(0, 10);

  const risk = {
    id, code, projectId,
    title: parsed.data.title,
    description: parsed.data.description ?? null,
    category: parsed.data.category ?? null,
    cause: parsed.data.cause ?? null,
    consequence: parsed.data.consequence ?? null,
    probability: parsed.data.probability,
    impact: parsed.data.impact,
    level, classification,
    owner: parsed.data.owner ?? null,
    sprintId: parsed.data.sprintId || null,
    status: parsed.data.status || 'Identificado',
    identifiedAt,
    alertIndicator: parsed.data.alertIndicator ?? null,
    responseStrategy: parsed.data.responseStrategy ?? null,
    treatmentAction: parsed.data.treatmentAction ?? null,
    reviewDate: parsed.data.reviewDate || null,
    evidence: parsed.data.evidence ?? null,
    expectedResult: parsed.data.expectedResult ?? null,
    observations: parsed.data.observations ?? null,
    createdBy: req.user.id,
    createdAt: now, updatedAt: now,
  };

  const ruleCheck = validateCriticalRisk(risk);
  if (!ruleCheck.ok) return res.status(400).json({ errors: ruleCheck.errors });

  await q(
    `INSERT INTO risks
       (id, code, projectId, title, description, category, cause, consequence,
        probability, impact, level, classification, owner, sprintId, status,
        identifiedAt, alertIndicator, responseStrategy, treatmentAction, reviewDate,
        evidence, expectedResult, observations, createdBy, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    Object.values(risk),
  );

  const out = await one('SELECT * FROM `risks` WHERE id = ?', [id]);
  await logAudit(req.user.id, 'create_risk', 'risk', id, { title: risk.title, code: risk.code }, req.ip);
  res.status(201).json(rowToApi(out));
}

export async function updateRisk(req, res) {
  const existing = await one('SELECT * FROM `risks` WHERE id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ error: 'Riesgo no encontrado' });

  const partial = baseSchema.partial().safeParse(req.body);
  if (!partial.success) return res.status(400).json({ errors: flattenZod(partial.error) });

  const merged = { ...rowToApi(existing), ...flatten(partial.data) };
  if (partial.data.probability !== undefined || partial.data.impact !== undefined) {
    const r = computeRisk(merged);
    merged.level = r.level;
    merged.classification = r.classification;
  }
  const ruleCheck = validateCriticalRisk(merged);
  if (!ruleCheck.ok) return res.status(400).json({ errors: ruleCheck.errors });

  // Patch whitelist (no permitimos sobreescribir id/createdBy/createdAt).
  const ALLOWED = ['title','description','category','cause','consequence',
    'probability','impact','level','classification','owner','sprintId','status',
    'identifiedAt','alertIndicator','responseStrategy','treatmentAction','reviewDate',
    'evidence','expectedResult','observations','updatedAt','code'];
  const patch = {};
  for (const k of ALLOWED) if (k in merged) patch[k] = merged[k];
  patch.updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const setSql = Object.keys(patch).map((c) => `\`${c}\` = ?`).join(', ');
  await q(`UPDATE \`risks\` SET ${setSql} WHERE id = ?`, [...Object.values(patch), req.params.id]);
  const out = await one('SELECT * FROM `risks` WHERE id = ?', [req.params.id]);
  await logAudit(req.user.id, 'update_risk', 'risk', req.params.id, { title: out.title, code: out.code }, req.ip);
  res.json(rowToApi(out));
}

export async function deleteRisk(req, res) {
  const existing = await one('SELECT title, code FROM `risks` WHERE id = ?', [req.params.id]);
  const r = await del('risks', req.params.id);
  if (!r) return res.status(404).json({ error: 'Riesgo no encontrado' });
  await logAudit(req.user.id, 'delete_risk', 'risk', req.params.id, { title: existing?.title, code: existing?.code }, req.ip);
  res.status(204).end();
}

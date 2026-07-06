import { z } from 'zod';
import { q, one, del } from '../models/db.js';
import { logAudit } from '../utils/audit.js';

const dateOrEmpty = z.preprocess((v) => (v === '' ? undefined : v), z.string().optional());

const baseSchema = z.object({
  name: z.string().min(2),
  goal: z.string().optional(),
  startDate: dateOrEmpty,
  endDate: dateOrEmpty,
  planningNotes: z.string().optional(),
  dailyImpediments: z.string().optional(),
  reviewNotes: z.string().optional(),
  retrospectiveNotes: z.string().optional(),
  lessonsLearned: z.string().optional(),
});

function toApi(r) {
  if (!r) return r;
  if (r.createdAt && r.createdAt.includes(' ')) r.createdAt = r.createdAt.replace(' ', 'T') + 'Z';
  if (r.updatedAt && r.updatedAt.includes(' ')) r.updatedAt = r.updatedAt.replace(' ', 'T') + 'Z';
  // Para el contrato del frontend añadimos campos derivados riesgos[]/newRisks[]/closedRisks[] si no vienen.
  return r;
}

function nextSprintId(rows) {
  const ids = rows.map((r) => Number(String(r.id).replace(/\D/g, '')) || 0);
  return 's' + ((Math.max(0, ...ids) || 0) + 1);
}

export async function listSprintsByProject(req, res) {
  const sprints = await q('SELECT * FROM `sprints` WHERE projectId = ? ORDER BY startDate ASC', [req.params.projectId]);
  const risks = await q('SELECT id, status, sprintId FROM `risks` WHERE projectId = ?', [req.params.projectId]);
  
  const sprintsWithRisks = sprints.map((s) => {
    const sprintRisks = risks.filter((r) => r.sprintId === s.id);
    return {
      ...toApi(s),
      risks: sprintRisks,
      newRisks: sprintRisks.filter((r) => r.status === 'Identificado'),
      closedRisks: sprintRisks.filter((r) => r.status === 'Cerrado' || r.status === 'Mitigado'),
    };
  });
  
  res.json(sprintsWithRisks);
}

export async function getSprint(req, res) {
  const r = await one('SELECT * FROM `sprints` WHERE id = ? LIMIT 1', [req.params.id]);
  if (!r) return res.status(404).json({ error: 'Sprint no encontrado' });
  res.json(toApi(r));
}

export async function createSprint(req, res) {
  const parsed = baseSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ errors: parsed.error.issues.map((i) => i.message) });
  }
  const projectId = req.params.projectId || req.body.projectId;
  if (!projectId) return res.status(400).json({ errors: ['projectId es obligatorio'] });
  const project = await one('SELECT id FROM `projects` WHERE id = ?', [projectId]);
  if (!project) return res.status(400).json({ errors: ['Proyecto no encontrado'] });

  const ids = await q('SELECT id FROM sprints');
  const id = nextSprintId(ids);
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  await q(
    `INSERT INTO sprints (id, projectId, name, goal, startDate, endDate,
       planningNotes, dailyImpediments, reviewNotes, retrospectiveNotes, lessonsLearned,
       createdBy, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [id, projectId, parsed.data.name,
     parsed.data.goal ?? null,
     parsed.data.startDate ?? null,
     parsed.data.endDate ?? null,
     parsed.data.planningNotes ?? null,
     parsed.data.dailyImpediments ?? null,
     parsed.data.reviewNotes ?? null,
     parsed.data.retrospectiveNotes ?? null,
     parsed.data.lessonsLearned ?? null,
     req.user.id, now, now],
  );
  const out = await one('SELECT * FROM `sprints` WHERE id = ?', [id]);
  await logAudit(req.user.id, 'create_sprint', 'sprint', id, { name: parsed.data.name, projectId }, req.ip);
  res.status(201).json(toApi(out));
}

export async function updateSprint(req, res) {
  const existing = await one('SELECT * FROM `sprints` WHERE id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ error: 'Sprint no encontrado' });
  const partial = baseSchema.partial().safeParse(req.body);
  if (!partial.success) {
    return res.status(400).json({ errors: partial.error.issues.map((i) => i.message) });
  }
  const data = partial.data;
  const ALLOWED = ['name','goal','startDate','endDate','planningNotes','dailyImpediments','reviewNotes','retrospectiveNotes','lessonsLearned'];
  const patch = {};
  for (const k of ALLOWED) if (k in data) patch[k] = data[k];
  patch.updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const setSql = Object.keys(patch).map((c) => `\`${c}\` = ?`).join(', ');
  await q(`UPDATE \`sprints\` SET ${setSql} WHERE id = ?`, [...Object.values(patch), req.params.id]);
  const out = await one('SELECT * FROM `sprints` WHERE id = ?', [req.params.id]);
  await logAudit(req.user.id, 'update_sprint', 'sprint', req.params.id, { name: out.name, projectId: out.projectId }, req.ip);
  res.json(toApi(out));
}

export async function deleteSprint(req, res) {
  const existing = await one('SELECT name, projectId FROM `sprints` WHERE id = ?', [req.params.id]);
  const r = await del('sprints', req.params.id);
  if (!r) return res.status(404).json({ error: 'Sprint no encontrado' });
  await logAudit(req.user.id, 'delete_sprint', 'sprint', req.params.id, { name: existing?.name, projectId: existing?.projectId }, req.ip);
  res.status(204).end();
}

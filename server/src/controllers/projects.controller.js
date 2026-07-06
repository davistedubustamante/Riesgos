import { q, one, arrToJson, jsonToArr, del } from '../models/db.js';
import { logAudit } from '../utils/audit.js';

const COLS_JS = ['stakeholders', 'technologies'];

function fromRow(r) {
  if (!r) return r;
  return {
    ...r,
    stakeholders: jsonToArr(r.stakeholders),
    technologies: jsonToArr(r.technologies),
  };
}

function nextProjectId(rows) {
  const ids = rows.map((r) => Number(String(r.id).replace(/\D/g, '')) || 0);
  return 'p' + ((Math.max(0, ...ids) || 0) + 1);
}

export async function listProjects(req, res) {
  const rows = await q(`
    SELECT p.*,
           (SELECT COUNT(*) FROM risks r WHERE r.projectId = p.id) as riskCount,
           (SELECT COUNT(*) FROM risks r WHERE r.projectId = p.id AND r.level >= 15) as criticalRiskCount,
           (SELECT COUNT(*) FROM sprints s WHERE s.projectId = p.id) as sprintCount
      FROM \`projects\` p
     ORDER BY p.createdAt DESC
  `);
  res.json(rows.map(fromRow));
}

export async function getProject(req, res) {
  const r = await one(`
    SELECT p.*,
           (SELECT COUNT(*) FROM risks r WHERE r.projectId = p.id) as riskCount,
           (SELECT COUNT(*) FROM risks r WHERE r.projectId = p.id AND r.level >= 15) as criticalRiskCount,
           (SELECT COUNT(*) FROM sprints s WHERE s.projectId = p.id) as sprintCount
      FROM \`projects\` p
     WHERE p.id = ?
     LIMIT 1
  `, [req.params.id]);
  if (!r) return res.status(404).json({ error: 'Proyecto no encontrado' });
  res.json(fromRow(r));
}

export async function createProject(req, res) {
  const ids = await q('SELECT id FROM `projects`');
  const id = nextProjectId(ids);
  const createdBy = req.user.id;
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  const body = {
    id,
    name: req.body.name || 'Sin nombre',
    description: req.body.description ?? null,
    type: req.body.type ?? null,
    owner: req.body.owner ?? null,
    startDate: req.body.startDate || null,
    endDate: req.body.endDate || null,
    objective: req.body.objective ?? null,
    scope: req.body.scope ?? null,
    stakeholders: arrToJson(req.body.stakeholders),
    technologies: arrToJson(req.body.technologies),
    status: req.body.status || 'Planificación',
    createdBy,
    createdAt: now,
    updatedAt: now,
  };
  await q(
    `INSERT INTO projects
       (id, name, description, type, owner, startDate, endDate, objective, scope, stakeholders, technologies, status, createdBy, createdAt, updatedAt)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [body.id, body.name, body.description, body.type, body.owner, body.startDate, body.endDate,
     body.objective, body.scope, body.stakeholders, body.technologies, body.status, body.createdBy,
     body.createdAt, body.updatedAt],
  );
  const out = await one('SELECT * FROM `projects` WHERE id = ?', [id]);
  await logAudit(req.user.id, 'create_project', 'project', id, { name: body.name }, req.ip);
  res.status(201).json(fromRow(out));
}

export async function updateProject(req, res) {
  const existing = await one('SELECT * FROM `projects` WHERE id = ?', [req.params.id]);
  if (!existing) return res.status(404).json({ error: 'Proyecto no encontrado' });

  // Patch dinámico: solo permitimos estos campos.
  const allowed = ['name','description','type','owner','startDate','endDate','objective','scope','status'];
  const patch = {};
  for (const k of allowed) if (req.body[k] !== undefined) patch[k] = req.body[k];
  if (req.body.stakeholders !== undefined) patch.stakeholders = arrToJson(req.body.stakeholders);
  if (req.body.technologies !== undefined) patch.technologies = arrToJson(req.body.technologies);
  patch.updatedAt = new Date().toISOString().slice(0, 19).replace('T', ' ');

  if (Object.keys(patch).length === 1 /* solo updatedAt */) {
    return res.json(fromRow(existing));
  }
  const setSql = Object.keys(patch).map((c) => `\`${c}\` = ?`).join(', ');
  await q(`UPDATE \`projects\` SET ${setSql} WHERE id = ?`, [...Object.values(patch), req.params.id]);
  const out = await one('SELECT * FROM `projects` WHERE id = ?', [req.params.id]);
  await logAudit(req.user.id, 'update_project', 'project', req.params.id, { name: out.name }, req.ip);
  res.json(fromRow(out));
}

export async function deleteProject(req, res) {
  const existing = await one('SELECT name FROM `projects` WHERE id = ?', [req.params.id]);
  const r = await del('projects', req.params.id);
  if (!r) return res.status(404).json({ error: 'Proyecto no encontrado' });
  await logAudit(req.user.id, 'delete_project', 'project', req.params.id, { name: existing?.name }, req.ip);
  res.status(204).end();
}

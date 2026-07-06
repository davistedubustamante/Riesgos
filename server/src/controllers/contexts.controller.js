import { q, one, arrToJson, jsonToArr } from '../models/db.js';

function fromRow(r) {
  if (!r) return r;
  return {
    ...r,
    assets: jsonToArr(r.assets),
    affectedProcesses: jsonToArr(r.affectedProcesses),
    stakeholders: jsonToArr(r.stakeholders),
  };
}

export async function getContext(req, res) {
  const r = await one('SELECT * FROM `contexts` WHERE projectId = ? LIMIT 1', [req.params.projectId]);
  if (!r) return res.status(404).json({ error: 'Contexto no encontrado para el proyecto' });
  res.json(fromRow(r));
}

export async function upsertContext(req, res) {
  const projectId = req.params.projectId;
  const project = await one('SELECT id FROM `projects` WHERE id = ?', [projectId]);
  if (!project) return res.status(404).json({ error: 'Proyecto no encontrado' });

  const fields = ['internalContext','externalContext','criticalObjectives','riskCriteria','legalFactors','technologicalFactors','organizationalFactors'];
  const payload = { createdBy: req.user.id };
  for (const f of fields) if (req.body[f] !== undefined) payload[f] = req.body[f];
  if (req.body.assets !== undefined) payload.assets = arrToJson(req.body.assets);
  if (req.body.affectedProcesses !== undefined) payload.affectedProcesses = arrToJson(req.body.affectedProcesses);
  if (req.body.stakeholders !== undefined) payload.stakeholders = arrToJson(req.body.stakeholders);

  const existing = await one('SELECT id FROM `contexts` WHERE projectId = ?', [projectId]);
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
  if (!existing) {
    const id = 'ctx_' + projectId;
    await q(
      `INSERT INTO contexts (id, projectId, createdBy, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?)`,
      [id, projectId, req.user.id, now, now],
    );
    if (Object.keys(payload).length > 0) {
      const cols = Object.keys(payload);
      const sql = `UPDATE contexts SET ${cols.map((c) => `\`${c}\` = ?`).join(', ')}, updatedAt = ? WHERE projectId = ?`;
      await q(sql, [...cols.map((c) => payload[c]), now, projectId]);
    }
    const out = await one('SELECT * FROM `contexts` WHERE projectId = ?', [projectId]);
    return res.status(201).json(fromRow(out));
  }
  payload.updatedAt = now;
  const cols = Object.keys(payload);
  const sql = `UPDATE contexts SET ${cols.map((c) => `\`${c}\` = ?`).join(', ')} WHERE projectId = ?`;
  await q(sql, [...cols.map((c) => payload[c]), projectId]);
  const out = await one('SELECT * FROM `contexts` WHERE projectId = ?', [projectId]);
  res.json(fromRow(out));
}

import { q, one } from '../models/db.js';
import { classificationFromLevel } from '../utils/riskLevel.js';

export async function getHeatmap(req, res) {
  const { projectId } = req.params;
  const { mode = 'frequency', category, status, classification, sprintId, owner } = req.query;
  if (!['frequency', 'severity'].includes(mode)) {
    return res.status(400).json({ error: 'mode debe ser "frequency" o "severity"' });
  }
  const project = await one('SELECT id FROM `projects` WHERE id = ?', [projectId]);
  if (!project) return res.status(404).json({ error: 'Proyecto no encontrado' });

  const where = ['projectId = ?'];
  const params = [projectId];
  if (category) { where.push('category = ?'); params.push(category); }
  if (status) { where.push('status = ?'); params.push(status); }
  if (classification) { where.push('classification = ?'); params.push(classification); }
  if (sprintId) { where.push('sprintId = ?'); params.push(sprintId); }
  if (owner) { where.push('owner = ?'); params.push(owner); }
  const risks = await q(`SELECT * FROM \`risks\` WHERE ${where.join(' AND ')}`, params);

  const matrix = [];
  for (let p = 1; p <= 5; p++) {
    for (let i = 1; i <= 5; i++) {
      const cell = risks.filter((r) => r.probability === p && r.impact === i);
      matrix.push({
        probability: p,
        impact: i,
        value: mode === 'severity' ? cell.reduce((s, r) => s + (r.level || p * i), 0) : cell.length,
        riskCount: cell.length,
        accumulatedSeverity: cell.reduce((s, r) => s + (r.level || p * i), 0),
        classification: classificationFromLevel(p * i),
        risks: cell.map((r) => ({
          id: r.id, code: r.code, title: r.title, classification: r.classification, level: r.level,
        })),
      });
    }
  }

  const hotZones = matrix
    .filter((c) => (mode === 'severity' ? c.accumulatedSeverity >= 10 : c.riskCount >= 1))
    .filter((c) => c.classification === 'Alto' || c.classification === 'Crítico')
    .sort((a, b) =>
      mode === 'severity' ? b.accumulatedSeverity - a.accumulatedSeverity : b.riskCount - a.riskCount,
    );

  res.json({
    mode,
    matrix,
    hotZones,
    filtersApplied: { category, status, classification, sprintId, owner },
  });
}

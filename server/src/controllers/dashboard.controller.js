import { q, one } from '../models/db.js';

function countBy(arr, key) {
  return arr.reduce((acc, item) => {
    const k = item[key] ?? 'Sin categoría';
    acc[k] = (acc[k] || 0) + 1;
    return acc;
  }, {});
}

export async function getDashboard(req, res) {
  const project = await one('SELECT id FROM `projects` WHERE id = ?', [req.params.projectId]);
  if (!project) return res.status(404).json({ error: 'Proyecto no encontrado' });

  const risks = await q('SELECT * FROM `risks` WHERE projectId = ?', [req.params.projectId]);
  const sprints = await q('SELECT id, name FROM `sprints` WHERE projectId = ? ORDER BY startDate ASC, createdAt ASC', [req.params.projectId]);
  const sprintsById = Object.fromEntries(sprints.map((s) => [s.id, s.name]));

  const stakeholdersCount = (await one('SELECT COUNT(*) as count FROM `stakeholders` WHERE projectId = ?', [req.params.projectId]))?.count || 0;

  const recentRisks = [...risks]
    .sort((a, b) => new Date(b.identifiedAt || b.createdAt) - new Date(a.identifiedAt || a.createdAt))
    .slice(0, 5);

  const sprintTrend = sprints.map((s) => {
    const sprintRisks = risks.filter((r) => r.sprintId === s.id);
    return {
      name: s.name,
      mitigados: sprintRisks.filter((r) => r.status === 'Mitigado' || r.status === 'Cerrado').length,
      criticos:  sprintRisks.filter((r) => r.classification === 'Crítico').length,
    };
  });

  if (sprintTrend.length === 0) {
    sprintTrend.push({ name: 'Sin sprints', mitigados: 0, criticos: 0 });
  }

  res.json({
    totalRisks:     risks.length,
    criticalRisks:  risks.filter((r) => r.classification === 'Crítico').length,
    highRisks:      risks.filter((r) => r.classification === 'Alto').length,
    mediumRisks:    risks.filter((r) => r.classification === 'Medio').length,
    lowRisks:       risks.filter((r) => r.classification === 'Bajo').length,
    mitigatedRisks: risks.filter((r) => r.status === 'Mitigado' || r.status === 'Cerrado').length,
    inTreatmentRisks: risks.filter((r) => r.status === 'En tratamiento').length,
    pendingRisks:   risks.filter((r) => r.status !== 'Mitigado' && r.status !== 'Cerrado' && r.status !== 'En tratamiento').length,
    risksByCategory: countBy(risks, 'category'),
    risksByLevel:    countBy(risks, 'classification'),
    risksBySprint:   risks.reduce((acc, r) => {
      const key = r.sprintId ? (sprintsById[r.sprintId] || r.sprintId) : 'Sin sprint';
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {}),
    recentRisks,
    stakeholdersCount,
    sprintTrend:    sprintTrend.slice(-8),
  });
}

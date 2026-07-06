// Reglas de negocio centrales:
//   level = probability * impact
//   1..4   → Bajo
//   5..9   → Medio
//   10..14 → Alto
//   15..25 → Crítico

export function classificationFromLevel(level) {
  if (level >= 15) return 'Crítico';
  if (level >= 10) return 'Alto';
  if (level >= 5) return 'Medio';
  return 'Bajo';
}

export function computeRisk({ probability, impact }) {
  const p = Number(probability);
  const i = Number(impact);
  const level = p * i;
  return { level, classification: classificationFromLevel(level) };
}

export const RISK_CATEGORIES = [
  'Técnico',
  'Funcional',
  'Seguridad',
  'Privacidad',
  'Ético / algorítmico',
  'Operativo',
  'Organizacional',
  'Metodológico',
  'Legal',
  'Usabilidad',
  'Rendimiento',
  'Integración',
];

export const RISK_STATUSES = [
  'Identificado',
  'Analizado',
  'En tratamiento',
  'Mitigado',
  'Aceptado',
  'Cerrado',
];

export const RESPONSE_STRATEGIES = ['Evitar', 'Mitigar', 'Transferir', 'Aceptar', 'Escalar'];

// Validación de regla de negocio: riesgos críticos requieren evidencia mínima de tratamiento.
// Devuelve { ok: true } o { ok: false, errors: [...] }.
export function validateCriticalRisk(risk) {
  const errors = [];
  if (risk.classification === 'Crítico') {
    if (!risk.owner) errors.push('owner es obligatorio para riesgos críticos');
    if (!risk.responseStrategy) errors.push('responseStrategy es obligatoria para riesgos críticos');
    if (!risk.treatmentAction) errors.push('treatmentAction es obligatoria para riesgos críticos');
    if (!risk.reviewDate) errors.push('reviewDate es obligatoria para riesgos críticos');
  }
  if (risk.status === 'Cerrado') {
    if (!risk.evidence) errors.push('evidence es obligatoria para cerrar un riesgo');
    if (!risk.expectedResult) errors.push('expectedResult es obligatorio para cerrar un riesgo');
  }
  return errors.length ? { ok: false, errors } : { ok: true };
}

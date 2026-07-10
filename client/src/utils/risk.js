// Helpers de cálculo compartidos entre frontend y lógica de presentación.
// (El backend calcula lo mismo; aquí se duplica para que la UI sea reactiva sin viaje a la API.)

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

export function classificationFromLevel(level) {
  if (level >= 15) return 'Crítico';
  if (level >= 10) return 'Alto';
  if (level >= 5) return 'Medio';
  return 'Bajo';
}

export function computeRisk(p, i) {
  const level = Number(p) * Number(i);
  return { level, classification: classificationFromLevel(level) };
}

export const CLASSIFICATION_STYLE = {
  Bajo:    'badge badge-low',
  Medio:   'badge badge-medium',
  Alto:    'badge badge-high',
  Crítico: 'badge badge-critical',
};

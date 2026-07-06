import { BookOpen } from 'lucide-react';

const phases = [
  {
    id: 1,
    title: 'Establecer el contexto — ISO 31000',
    color: 'from-brand-500/15 to-brand-500/0',
    items: [
      'Definir alcance del proyecto.',
      'Identificar stakeholders.',
      'Reconocer activos.',
      'Definir criterios de riesgo y apetito.',
      'Identificar restricciones (tiempo, presupuesto, regulatorias).',
      'Determinar objetivos críticos.',
    ],
  },
  {
    id: 2,
    title: 'Identificar riesgos — ISO 31000 + PMBOK',
    color: 'from-emerald-500/15 to-emerald-500/0',
    items: [
      'Revisar requisitos funcionales y no funcionales.',
      'Revisar arquitectura y dependencias externas.',
      'Entrevistar usuarios clave.',
      'Revisar historias de usuario en busca de incertidumbres.',
      'Identificar amenazas y vulnerabilidades (MAGERIT/NIST).',
      'Registrar riesgos con código, causa, evento y consecuencia.',
    ],
  },
  {
    id: 3,
    title: 'Analizar riesgos — ISO 31000 + PMBOK',
    color: 'from-yellow-500/15 to-yellow-500/0',
    items: [
      'Asignar probabilidad (1-5) e impacto (1-5).',
      'Calcular nivel = probabilidad × impacto.',
      'Analizar causas raíz y consecuencias.',
      'Definir indicadores de alerta medibles.',
      'Mantener trazabilidad entre riesgo, historia y sprint.',
    ],
  },
  {
    id: 4,
    title: 'Evaluar riesgos — ISO 31000',
    color: 'from-orange-500/15 to-orange-500/0',
    items: [
      'Comparar con los criterios definidos.',
      'Priorizar riesgos críticos y altos.',
      'Decidir qué riesgos requieren tratamiento inmediato.',
      'Evaluar apetito de riesgo por categoría.',
    ],
  },
  {
    id: 5,
    title: 'Tratar riesgos — ISO 31000 + PMBOK',
    color: 'from-purple-500/15 to-purple-500/0',
    items: [
      'Definir estrategia: evitar, mitigar, transferir, aceptar o escalar.',
      'Planificar acciones concretas.',
      'Asignar responsable y fecha objetivo.',
      'Registrar evidencia esperada.',
      'Validar efectividad al cierre de cada sprint.',
    ],
  },
  {
    id: 6,
    title: 'Monitorear riesgos — Scrum',
    color: 'from-pink-500/15 to-pink-500/0',
    items: [
      'Revisar riesgos en cada Sprint Planning.',
      'Registrar impedimentos en el Daily Scrum.',
      'Actualizar matriz y mapa de calor.',
      'Incorporar nuevos riesgos al backlog.',
      'Cerrar riesgos mitigados con evidencia.',
      'Documentar lecciones aprendidas en la Retrospectiva.',
    ],
  },
  {
    id: 7,
    title: 'Seguridad y continuidad — MAGERIT / NIST',
    color: 'from-cyan-500/15 to-cyan-500/0',
    items: [
      'Identificar activos críticos.',
      'Reconocer amenazas y vulnerabilidades.',
      'Definir controles preventivos y correctivos.',
      'Proteger datos personales y sensibles.',
      'Revisar disponibilidad y planes de continuidad.',
      'Registrar incidentes y aprender de ellos.',
    ],
  },
];

export default function Guide() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen style={{color:'#06b6d4'}} /> Guía de aplicación de la metodología híbrida
        </h1>
        <p className="text-sm text-muted-foreground">
          Sigue estas fases en cada iteración para integrar ISO 31000, PMBOK, Scrum y MAGERIT/NIST.
        </p>
      </div>

      <ol className="space-y-4">
        {phases.map((p) => (
          <li key={p.id} className={`glass card-lift p-5 bg-gradient-to-br ${p.color}`}>
            <div className="flex items-start gap-4">
              <span className="glass dark badge w-9 h-9 rounded-lg flex items-center justify-center font-bold">
                {p.id}
              </span>
              <div className="flex-1">
                <h3 className="font-semibold text-white">{p.title}</h3>
                <ul className="mt-3 grid md:grid-cols-2 gap-x-6 gap-y-2 text-sm text-muted-foreground">
                  {p.items.map((it, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-500/60 mt-1.5 shrink-0" />
                      <span>{it}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </li>
        ))}
      </ol>

      <div className="glass card-lift p-5">
        <h3 className="font-semibold mb-2 text-white">Flujo recomendado para el usuario</h3>
        <ol className="text-sm text-muted-foreground space-y-1 list-decimal pl-5">
          <li>Crear un proyecto en <strong>Proyectos</strong>.</li>
          <li>Mapear el contexto ISO 31000.</li>
          <li>Registrar riesgos iniciales.</li>
          <li>Analizar probabilidad e impacto.</li>
          <li>Revisar la matriz y el mapa de calor.</li>
          <li>Definir tratamientos.</li>
          <li>Asignar riesgos a sprints.</li>
          <li>Cerrar riesgos mitigados con evidencia.</li>
        </ol>
      </div>
    </div>
  );
}

import { BookOpen, ChevronRight, Layers, Play, CheckCircle2, ShieldAlert, FileText, ArrowRight } from 'lucide-react';
import { Fragment } from 'react';

const phases = [
  {
    id: 1,
    title: 'Establecer el contexto — ISO 31000',
    hex: '#06b6d4', // Cyan
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
    hex: '#10b981', // Emerald
    items: [
      'Revisar requisitos funcionales y no funcionales.',
      'Revisar arquitectura and dependencias externas.',
      'Entrevistar usuarios clave.',
      'Revisar historias de usuario en busca de incertidumbres.',
      'Identificar amenazas y vulnerabilidades (MAGERIT/NIST).',
      'Registrar riesgos con código, causa, evento y consecuencia.',
    ],
  },
  {
    id: 3,
    title: 'Analizar riesgos — ISO 31000 + PMBOK',
    hex: '#f59e0b', // Amber/Yellow
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
    hex: '#f97316', // Orange
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
    hex: '#a78bfa', // Purple
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
    hex: '#ec4899', // Pink
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
    hex: '#8b5cf6', // Violet
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
      {/* Page Header */}
      <div>
        <div className="flex items-center gap-2 mb-1.5">
          <div className="w-5 h-5 rounded flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #06b6d4, #0891b2)' }}>
            <BookOpen size={11} className="text-white" />
          </div>
          <span className="text-[11px] text-[hsl(215,19%,60%)] font-mono uppercase tracking-widest">
            Marco Metodológico
          </span>
        </div>
        <h1 className="text-[26px] font-bold text-[hsl(214,32%,95%)] tracking-tight">
          Guía de aplicación de la metodología híbrida
        </h1>
        <p className="text-[13px] text-[hsl(215,19%,60%)] mt-1">
          Sigue estas fases en cada iteración para integrar ISO 31000, PMBOK, Scrum y MAGERIT/NIST de manera profesional.
        </p>
      </div>

      {/* Connected Timeline list */}
      <ol className="space-y-5 relative pl-1.5 md:pl-0">
        {phases.map((p) => (
          <li key={p.id} className="relative group">
            {/* Vertical timeline line (Desktop only) */}
            {p.id < phases.length && (
              <div className="absolute left-[18px] top-[38px] bottom-[-22px] w-[2px] bg-gradient-to-b from-[#1e293b]/60 to-[#0e1628]/10 -z-10 hidden md:block" />
            )}

            <div className="group relative overflow-hidden rounded-[16px] border border-[#1e293b]/60 bg-[#0d1527] p-5 md:p-6 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-700/60 hover:shadow-[0_20px_35px_-15px_rgba(0,0,0,0.8)] ml-0 md:ml-12">
              {/* Left border accent colored bar */}
              <div className="absolute left-0 top-0 bottom-0 w-[3px]" style={{ background: p.hex }} />

              <div className="flex items-start gap-4">
                {/* Mobile numeric badge */}
                <span className="w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-xs shrink-0 select-none md:hidden"
                  style={{ background: `${p.hex}15`, color: p.hex, border: `1px solid ${p.hex}25` }}>
                  {p.id}
                </span>

                {/* Desktop floating timeline badge */}
                <div className="absolute left-[-48px] top-6 w-9 h-9 rounded-full bg-[#0d1527] border border-[#1e293b]/60 flex items-center justify-center font-mono font-bold text-xs text-slate-400 group-hover:text-white group-hover:border-slate-600 transition-all duration-300 hidden md:flex shadow-lg"
                  style={{ transformOrigin: 'center' }}>
                  {p.id}
                </div>

                <div className="flex-1 min-w-0">
                  <h3 className="font-extrabold text-[15px] text-white tracking-tight leading-tight flex items-center gap-2 group-hover:text-cyan-400 transition-colors">
                    {p.title}
                  </h3>
                  
                  {/* Grid layout of checklist items inside phase */}
                  <ul className="mt-3.5 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2.5 text-xs text-slate-400 leading-relaxed font-sans">
                    {p.items.map((it, i) => (
                      <li key={i} className="flex items-start gap-2.5 hover:text-white transition-colors duration-200">
                        <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: p.hex }} />
                        <span>{it}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ol>

      {/* Recommended flow banner */}
      <div className="relative overflow-hidden rounded-[16px] border border-[#1e293b]/60 bg-gradient-to-b from-[#0d1527]/90 to-[#070b14]/90 p-6 shadow-lg group mt-8">
        {/* Left accent color bar */}
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#dcf836]" />
        
        <h3 className="font-extrabold text-[15px] mb-3.5 text-white tracking-tight flex items-center gap-2">
          <Play size={14} className="text-[#dcf836] fill-[#dcf836]/20" /> Flujo recomendado para el usuario
        </h3>
        
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-sans">
          {[
            { step: 1, action: 'Crear proyecto', desc: 'Registrar en la sección de Proyectos.' },
            { step: 2, action: 'Definir contexto', desc: 'Mapear el entorno bajo la ISO 31000.' },
            { step: 3, action: 'Identificar riesgos', desc: 'Registrar amenazas iniciales.' },
            { step: 4, action: 'Analizar y valorar', desc: 'Calibrar probabilidad e impacto.' },
            { step: 5, action: 'Ver matriz de calor', desc: 'Visualizar la severidad y filtros.' },
            { step: 6, action: 'Definir tratamientos', desc: 'Establecer planes de mitigación.' },
            { step: 7, action: 'Asignar a Sprints', desc: 'Integrar acciones con el backlog Scrum.' },
            { step: 8, action: 'Cerrar y auditar', desc: 'Verificar mitigación con evidencia.' }
          ].map((item, index) => (
            <li key={item.step} className="bg-[#080c14]/40 border border-slate-800/40 rounded-xl p-3 flex flex-col gap-1 hover:bg-[#0e1628]/40 hover:border-slate-700/40 transition-all duration-300">
              <div className="flex items-center justify-between">
                <span className="text-[9px] font-mono font-bold text-slate-500">PASO 0{item.step}</span>
                {index < 7 && (
                  <ArrowRight size={10} className="text-slate-600 hidden lg:block" />
                )}
              </div>
              <p className="font-bold text-white tracking-tight mt-1">{item.action}</p>
              <p className="text-[11px] text-slate-400 leading-normal mt-0.5">{item.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}

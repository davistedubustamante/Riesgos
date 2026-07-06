import { useEffect, useState, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  Save, CheckCircle2, AlertCircle, ChevronRight, ChevronDown, ChevronUp,
  Layers, FolderDot, Target, BookOpen, Sparkles, X, Plus, Search,
  Globe, Scale, Box, ArrowRight, Clock, User, FileText, ShieldCheck,
  Lightbulb, Check, Info, AlertTriangle, Circle
} from 'lucide-react';
import { api } from '@/services/api';
import { useAppStore } from '@/store/useAppStore';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter
} from '@/components/ui/dialog';

// ─── ISO 31000 Steps ──────────────────────────────────────────────────────────
const ISO_STEPS = [
  { id: 'entorno',   label: 'Entorno',       icon: Globe,     short: '1' },
  { id: 'criterios', label: 'Criterios',     icon: Target,    short: '2' },
  { id: 'activos',   label: 'Activos',        icon: ShieldCheck, short: '3' },
];

const SUGGESTIONS = {
  internalContext: {
    label: "Contexto Interno",
    text: "Equipo de desarrollo Scrum con 6 integrantes (1 Product Owner, 1 Scrum Master, 4 Desarrolladores). Arquitectura modular de microservicios con React, Node.js y MySQL. Cultura interna centrada en entregas rápidas y baja documentación técnica."
  },
  externalContext: {
    label: "Contexto Externo",
    text: "Entorno altamente competitivo en el sector de preselección de personal (HR Tech). Regulación de protección de datos de carácter personal aplicable localmente. Uso de APIs de inteligencia artificial alojadas por proveedores terceros en la nube."
  },
  organizationalFactors: {
    label: "Factores Organizacionales",
    text: "Estructura funcional de mandatos directos. Patrocinio y soporte activo por parte de la dirección general. Proceso de toma de decisiones jerárquico pero ágil. Moderado apetito al riesgo de innovación."
  },
  criticalObjectives: {
    label: "Objetivos Críticos",
    text: "1. Lanzamiento de la versión MVP estable en un plazo máximo de 8 meses.\n2. Lograr una latencia de respuesta del chatbot conversacional inferior a 250ms.\n3. Mantener el presupuesto total de desarrollo por debajo de los 45K USD."
  },
  riskCriteria: {
    label: "Criterios de Aceptación de Riesgo",
    text: "Aceptar riesgos bajos (1-4) de forma automática. Riesgos medios (5-12) requieren plan de contingencia por el Product Owner. Riesgos altos y críticos (15-25) bloquean el sprint y requieren mitigación inmediata."
  },
  legalFactors: {
    label: "Factores Legales o Regulatorios",
    text: "Normativa de privacidad y protección de datos. Cumplimiento de términos de licencias de código abierto (MIT, GPL). Cumplimiento de normativas éticas relativas a decisiones automatizadas de IA."
  },
  assets: {
    label: "Activos Críticos",
    text: "Código fuente del chatbot, Credenciales de bases de datos de producción en AWS, Base de datos de candidatos, API Keys de proveedores de Large Language Models."
  },
  affectedProcesses: {
    label: "Procesos de Negocio Afectados",
    text: "Registro e inicio de sesión de postulantes, Recepción e interpretación de currículums, Envío automático de notificaciones a reclutadores, Integración Continua (CI/CD)."
  },
  stakeholders: {
    label: "Partes Interesadas",
    text: "Dirección de Recursos Humanos (Cliente principal), Postulantes externos, Equipo de Ingeniería de Software, Proveedor externo de servicios de Inteligencia Artificial."
  },
  technologicalFactors: {
    label: "Factores Tecnológicos",
    text: "Alojamiento en infraestructura AWS administrada, Dependencia de la API de Groq/OpenAI para modelos de lenguaje, Frameworks de desarrollo React + Express, Spacy como fallback local."
  }
};

const TAB_FIELDS = {
  entorno: [
    { name: 'internalContext',      label: 'Contexto Interno',                  helper: 'Capacidades del equipo, cultura organizacional e infraestructura local.' },
    { name: 'externalContext',       label: 'Contexto Externo',                  helper: 'Mercado, competencia, legislación sectorial y tendencias tecnológicas.' },
    { name: 'organizationalFactors', label: 'Factores Organizacionales',        helper: 'Gobernanza, patrocinio directivo y canales de comunicación.' },
  ],
  criterios: [
    { name: 'criticalObjectives', label: 'Objetivos Críticos',                 helper: 'Metas indispensables: costo, alcance, tiempo y calidad.' },
    { name: 'riskCriteria',        label: 'Criterios de Aceptación de Riesgo', helper: 'Umbral de apetito de riesgo: qué se asume, transfiere o mitiga.' },
    { name: 'legalFactors',         label: 'Factores Legales / Regulatorios',  helper: 'Leyes de protección de datos, políticas de contratación, ética.' },
  ],
  activos: [
    { name: 'assets',               label: 'Activos Críticos',                  helper: 'Datos, código, servidores, reputación y personas a salvaguardar.' },
    { name: 'affectedProcesses',     label: 'Procesos de Negocio Afectados',     helper: 'Flujos operativos y de soporte directamente impactados.' },
    { name: 'stakeholders',          label: 'Partes Interesadas (Stakeholders)', helper: 'Grupos con interés legítimo en el resultado del proyecto.' },
    { name: 'technologicalFactors',  label: 'Factores Tecnológicos',            helper: 'Plataformas cloud, APIs externas, librerías y estándares.' },
  ]
};

// ─── Status helpers ───────────────────────────────────────────────────────────
const STATUS_STYLE = (status) => ({
  'Planificación': 'bg-[#06b6d4]/10 text-[#06b6d4] border-[#06b6d4]/20',
  'En ejecución':  'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20',
  'Pausado':       'bg-[#f97316]/10 text-[#f97316] border-[#f97316]/20',
  'Finalizado':    'bg-[#3b82f6]/10 text-[#3b82f6] border-[#3b82f6]/20',
  'Cancelado':     'bg-[#6b7280]/10 text-[#6b7280] border-[#6b7280]/20',
}[status] || 'bg-white/5 text-[#8a8f98] border-white/10');

// ─── Tiny Metric Card ─────────────────────────────────────────────────────────
function TinyMetric({ icon: Icon, value, label, color }) {
  return (
    <div className="flex items-center gap-3 bg-[#111420] border border-white/[0.06] rounded-xl p-3">
      <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
        style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
        <Icon size={13} style={{ color }} />
      </div>
      <div className="min-w-0">
        <p className="text-base font-black text-white leading-none">{value}</p>
        <p className="text-[9px] uppercase font-bold text-[#8a8f98] tracking-widest mt-0.5 truncate">{label}</p>
      </div>
    </div>
  );
}

// ─── ISO Step Progress ────────────────────────────────────────────────────────
function IsoStepper({ activeStep, progress }) {
  const steps = [
    { id: 'entorno',   label: 'Entorno',   pct: progress.entorno },
    { id: 'criterios', label: 'Criterios', pct: progress.criterios },
    { id: 'activos',   label: 'Activos',    pct: progress.activos },
  ];

  return (
    <div className="flex items-center gap-0">
      {steps.map((s, i) => {
        const isDone = s.pct === 100;
        const isActive = activeStep === s.id && s.pct < 100;
        return (
          <div key={s.id} className="flex items-center">
            {i > 0 && (
              <div className={`h-px w-8 mx-1 transition-colors duration-300 ${
                isDone ? 'bg-[#06b6d4]' : 'bg-white/[0.08]'
              }`} />
            )}
            <div className="flex flex-col items-center gap-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-300 ${
                isDone
                  ? 'bg-[#06b6d4] text-[#0b0d18]'
                  : isActive
                    ? 'bg-[#06b6d4]/20 text-[#06b6d4] border border-[#06b6d4]/40'
                    : 'bg-white/[0.05] text-[#8a8f98] border border-white/[0.08]'
              }`}>
                {isDone ? <Check size={11} /> : i + 1}
              </div>
              <span className={`text-[8px] font-bold uppercase tracking-widest leading-none ${
                isDone ? 'text-[#06b6d4]' : isActive ? 'text-[#8a8f98]' : 'text-[#4a4f5c]'
              }`}>
                {s.label}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Completeness Bar ─────────────────────────────────────────────────────────
function CompletenessBar({ pct }) {
  const color = pct === 100 ? '#10b981' : pct >= 60 ? '#06b6d4' : pct >= 30 ? '#eab308' : '#f97316';
  const label = pct === 100 ? 'Contexto completo · Listo para identificar riesgos'
    : pct >= 60 ? 'Contexto avanzado · Completa las secciones pendientes'
    : pct >= 30 ? 'Contexto en desarrollo'
    : 'Contexto inicial · Completa al menos el entorno de negocio';

  return (
    <div className="bg-[#111420] border border-white/[0.06] rounded-xl p-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="relative w-8 h-8">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
              <circle cx="18" cy="18" r="15" stroke="currentColor" className="text-white/[0.06]" strokeWidth="3" fill="none" />
              <circle cx="18" cy="18" r="15" stroke="currentColor" className="transition-all duration-700" strokeWidth="3" fill="none"
                style={{ color, strokeDasharray: `${2 * Math.PI * 15}`, strokeDashoffset: `${2 * Math.PI * 15 * (1 - pct / 100)}` }}
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[9px] font-black" style={{ color }}>{pct}</span>
            </div>
          </div>
          <div>
            <p className="text-[10px] font-bold text-white leading-none">Completitud</p>
            <p className="text-[9px] text-[#8a8f98] mt-0.5 leading-tight">{label}</p>
          </div>
        </div>
        {pct === 100 && (
          <span className="flex items-center gap-1 text-[10px] font-bold text-[#10b981] bg-[#10b981]/10 border border-[#10b981]/20 rounded-lg px-2 py-1">
            <CheckCircle2 size={11} /> Preparado
          </span>
        )}
      </div>
      <div className="h-1 bg-white/[0.05] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color, boxShadow: `0 0 8px ${color}60` }} />
      </div>
    </div>
  );
}

// ─── Field Card ────────────────────────────────────────────────────────────────
function FieldCard({ field, value, onChange, onSuggestion, copiedField }) {
  const valStr = typeof value === 'string'
    ? value
    : Array.isArray(value)
      ? value.join(', ')
      : String(value || '');
  const isEmpty = !valStr || valStr.trim().length === 0;
  return (
    <div className="bg-[#111420] border border-white/[0.06] rounded-xl p-4 space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5">
          <Label className="text-[11px] font-bold text-[#f0f2f5]">{field.label}</Label>
          <p className="text-[9px] text-[#8a8f98] leading-relaxed">{field.helper}</p>
        </div>
        {SUGGESTIONS[field.name] && (
          <button type="button"
            onClick={() => onSuggestion(field.name, SUGGESTIONS[field.name].text)}
            className="shrink-0 flex items-center gap-1 text-[9px] font-bold px-2 py-1 rounded-lg border transition-all whitespace-nowrap"
            style={{
              color: copiedField === field.name ? '#10b981' : '#06b6d4',
              borderColor: copiedField === field.name ? '#10b98140' : '#06b6d430',
              background: copiedField === field.name ? '#10b98115' : '#06b6d410',
            }}>
            {copiedField === field.name ? <><Check size={9} /> ¡Copiado!</> : <><Sparkles size={9} /> Copiar ejemplo</>}
          </button>
        )}
      </div>
      <Textarea
        rows={4}
        name={field.name}
        value={valStr}
        onChange={e => onChange(field.name, e.target.value)}
        placeholder={`Describe aquí el ${field.label.toLowerCase()}…`}
        className="bg-[#0b0d18] border-white/[0.08] text-[#f0f2f5] placeholder:text-[#4a4f5c] text-[11px] resize-none focus:border-[#06b6d4]/50 focus:ring-[#06b6d4]/20"
      />
      {isEmpty && (
        <p className="text-[8px] text-[#f97316]/60 flex items-center gap-1">
          <AlertTriangle size={9} /> Campo pendiente — sin información registrada
        </p>
      )}
    </div>
  );
}

// ─── Context Map ──────────────────────────────────────────────────────────────
function ContextMap({ projectName, formData, onNodeClick }) {
  const [hoveredNode, setHoveredNode] = useState(null);

  const getItems = (val) => {
    if (!val) return [];
    if (Array.isArray(val)) {
      return val.map(s => String(s || '').trim()).filter(Boolean);
    }
    if (typeof val !== 'string') {
      val = String(val);
    }
    return val.split(/[,\n]/).map(s => s.trim()).filter(Boolean);
  };

  const nodes = [
    { id: 'proj', label: projectName || 'Proyecto', x: 50, y: 50, isCenter: true, color: '#06b6d4' },
    { id: 'stk',  label: 'Stakeholders', x: 20, y: 25, color: '#3b82f6', count: getItems(formData?.stakeholders).length, items: getItems(formData?.stakeholders) },
    { id: 'leg',  label: 'Factores Legales', x: 80, y: 25, color: '#f97316', count: getItems(formData?.legalFactors).length, items: getItems(formData?.legalFactors) },
    { id: 'obj',  label: 'Objetivos', x: 20, y: 75, color: '#10b981', count: getItems(formData?.criticalObjectives).length, items: getItems(formData?.criticalObjectives) },
    { id: 'ast',  label: 'Activos', x: 80, y: 75, color: '#8b5cf6', count: getItems(formData?.assets).length, items: getItems(formData?.assets) },
  ];

  const lines = [
    ['proj', 'stk'], ['proj', 'leg'], ['proj', 'obj'], ['proj', 'ast']
  ];

  const getNode = (id) => nodes.find(n => n.id === id);

  return (
    <div className="bg-[#111420] border border-white/[0.06] rounded-xl p-4 shadow-md">
      <div className="flex items-center justify-between mb-3 select-none">
        <p className="text-[10px] uppercase font-bold text-[#8a8f98] tracking-widest">Mapa de Contexto Interactivo</p>
        <span className="text-[8px] text-slate-500 font-mono">Haz clic en los nodos para editar</span>
      </div>
      <div className="relative w-full aspect-video bg-[#0b0d18] rounded-xl overflow-hidden border border-white/[0.05]">
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          {lines.map(([a, b]) => {
            const na = getNode(a); const nb = getNode(b);
            return (
              <line key={`${a}-${b}`} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y}
                stroke="#06b6d430" strokeWidth="0.4" strokeDasharray="1.5,1" />
            );
          })}
          {nodes.map(n => (
            <g key={n.id}
              className={n.isCenter ? "" : "cursor-pointer group"}
              onClick={() => !n.isCenter && onNodeClick && onNodeClick(n.id)}
              onMouseEnter={() => !n.isCenter && setHoveredNode(n)}
              onMouseLeave={() => !n.isCenter && setHoveredNode(null)}>
              
              {n.isCenter ? (
                <circle cx={n.x} cy={n.y} r="5" fill="#06b6d4" opacity="0.25" />
              ) : (
                <circle cx={n.x} cy={n.y} r="3.5" fill={n.color} opacity="0.15" className="transition-all duration-300 group-hover:scale-125 group-hover:opacity-25" />
              )}
              <circle cx={n.x} cy={n.y} r={n.isCenter ? 2.2 : 1.8}
                fill={n.isCenter ? '#06b6d4' : n.color} className="transition-all duration-300 group-hover:fill-white" />
              
              {/* Badge count circle if count > 0 */}
              {!n.isCenter && n.count > 0 && (
                <g>
                  <circle cx={n.x + 3.8} cy={n.y - 3.8} r="2" fill={n.color} />
                  <text x={n.x + 3.8} y={n.y - 2.9} textAnchor="middle" className="fill-[#0b0d18] font-mono font-black text-[1.6px] select-none">
                    {n.count}
                  </text>
                </g>
              )}

              {n.isCenter ? (
                <text x={n.x} y={n.y} textAnchor="middle" className="select-none font-mono">
                  {n.label.includes('—') || n.label.includes('-') ? (
                    (() => {
                      const parts = n.label.split(/—|-/);
                      return (
                        <>
                          <tspan x={n.x} dy="8" className="fill-white font-black text-[2.4px] uppercase tracking-wider">{parts[0].trim()}</tspan>
                          <tspan x={n.x} dy="3.2" className="fill-slate-500 font-medium text-[1.6px] uppercase tracking-widest">{parts[1].trim().slice(0, 32)}...</tspan>
                        </>
                      );
                    })()
                  ) : (
                    <tspan x={n.x} dy="8" className="fill-white font-black text-[2.4px] uppercase tracking-wider">{n.label}</tspan>
                  )}
                </text>
              ) : (
                <text
                  x={n.x}
                  y={n.y + 6.5}
                  textAnchor="middle"
                  className="fill-slate-400 font-mono font-bold select-none text-[2.4px] uppercase tracking-wider transition-colors group-hover:fill-white"
                >
                  {n.label}
                </text>
              )}
            </g>
          ))}
        </svg>
      </div>

      {/* Dynamic Item Preview HUD */}
      <div className="mt-3 px-3 py-2 bg-slate-950/40 border border-white/5 rounded-xl min-h-[52px] flex flex-col justify-center transition-all duration-300">
        {hoveredNode ? (
          <div>
            <p className="text-[8px] uppercase tracking-widest text-slate-500 font-bold font-mono">
              Vista rápida · {hoveredNode.label} ({hoveredNode.count || 0} identificados)
            </p>
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {hoveredNode.items.length > 0 ? (
                hoveredNode.items.map((item, idx) => (
                  <span key={idx} className="text-[9px] font-medium px-2 py-0.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-300">
                    {item}
                  </span>
                ))
              ) : (
                <span className="text-[9px] text-[#f97316]/70 font-bold italic">
                  Ningún elemento registrado. Haz clic en el nodo para configurarlo.
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-1 select-none">
            <p className="text-[8px] text-slate-500 font-bold font-mono uppercase tracking-widest">
              Posiciona el cursor sobre un nodo para ver la lista de elementos
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function Context() {
  const navigate = useNavigate();
  const { activeProjectId, projects, setActiveProject, loadProjects } = useAppStore();
  const [context, setContext] = useState(null);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [activeStep, setActiveStep] = useState('entorno');
  const [copiedField, setCopiedField] = useState(null);
  const [guideOpen, setGuideOpen] = useState({ what: false, questions: false, example: false, tips: false });
  const [formData, setFormData] = useState({
    internalContext: '', externalContext: '', organizationalFactors: '',
    criticalObjectives: '', riskCriteria: '', legalFactors: '',
    assets: '', affectedProcesses: '', stakeholders: '', technologicalFactors: ''
  });

  const activeProject = projects.find(p => p.id === activeProjectId);

  // ─── Load context ──────────────────────────────────────────────────────────
  const fetchContext = useCallback(async () => {
    if (!activeProjectId) return;
    try {
      const c = await api.get(`/projects/${activeProjectId}/context`);
      setContext(c);
      setFormData({
        internalContext:      c.internalContext      || '',
        externalContext:       c.externalContext       || '',
        organizationalFactors: c.organizationalFactors || '',
        criticalObjectives:    c.criticalObjectives    || '',
        riskCriteria:          c.riskCriteria          || '',
        legalFactors:           c.legalFactors           || '',
        assets:                c.assets                 || '',
        affectedProcesses:      c.affectedProcesses     || '',
        stakeholders:           c.stakeholders           || '',
        technologicalFactors:   c.technologicalFactors  || '',
      });
    } catch {
      setContext(null);
    }
  }, [activeProjectId]);

  useEffect(() => {
    if (projects.length === 0) loadProjects();
  }, []);

  useEffect(() => {
    fetchContext();
  }, [fetchContext]);

  // ─── Progress per step ──────────────────────────────────────────────────────
  const stepProgress = useMemo(() => ({
    entorno:   Math.round((['internalContext', 'externalContext', 'organizationalFactors'].filter(k => String(formData[k] || '').trim()).length / 3) * 100),
    criterios: Math.round((['criticalObjectives', 'riskCriteria', 'legalFactors'].filter(k => String(formData[k] || '').trim()).length / 3) * 100),
    activos:   Math.round((['assets', 'affectedProcesses', 'stakeholders', 'technologicalFactors'].filter(k => String(formData[k] || '').trim()).length / 4) * 100),
  }), [formData]);

  const totalProgress = useMemo(() => {
    const all = Object.values(TAB_FIELDS).flat();
    const filled = all.filter(f => String(formData[f.name] || '').trim());
    return Math.round((filled.length / all.length) * 100);
  }, [formData]);

  const fieldCount = (field) => {
    const v = String(formData[field] || '');
    if (!v) return 0;
    return v.split(/[,\n]/).filter(Boolean).length;
  };

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleFieldChange = (name, value) => {
    setFormData(d => ({ ...d, [name]: value }));
  };

  const applySuggestion = (name, text) => {
    setFormData(d => ({ ...d, [name]: text }));
    setCopiedField(name);
    setTimeout(() => setCopiedField(null), 1500);
  };

  const handleNodeClick = (nodeId) => {
    if (nodeId === 'stk') {
      setActiveStep('activos');
      setTimeout(() => document.getElementsByName('stakeholders')?.[0]?.focus(), 100);
    } else if (nodeId === 'leg') {
      setActiveStep('criterios');
      setTimeout(() => document.getElementsByName('legalFactors')?.[0]?.focus(), 100);
    } else if (nodeId === 'obj') {
      setActiveStep('criterios');
      setTimeout(() => document.getElementsByName('criticalObjectives')?.[0]?.focus(), 100);
    } else if (nodeId === 'ast') {
      setActiveStep('activos');
      setTimeout(() => document.getElementsByName('assets')?.[0]?.focus(), 100);
    }
  };

  async function save() {
    if (!activeProjectId) return;
    setSaving(true);
    setMsg(null);
    try {
      await api.post(`/projects/${activeProjectId}/context`, formData);
      setMsg({ type: 'ok', text: 'El contexto se ha guardado correctamente.' });
      await fetchContext();
    } catch (e) {
      setMsg({ type: 'err', text: e.message });
    } finally {
      setSaving(false);
    }
  }

  // ─── Guide content ─────────────────────────────────────────────────────────
  const guideContent = {
    entorno: {
      title: 'Establecer el Entorno',
      desc: 'Comprende las circunstancias internas y externas antes de identificar riesgos. El entorno define el marco sobre el cual los riesgos emergen.',
      what: [
        'Contexto Interno: capacidades del equipo, cultura organizacional, recursos y tecnología disponible.',
        'Contexto Externo: mercado, competencia, regulaciones, tendencias y factores económicos.',
        'Factores Organizacionales: estructura de gobernanza, patrocinio, roles y canales de comunicación.',
      ],
      questions: [
        '¿Qué capacidades técnicas tiene el equipo para entregar el proyecto?',
        '¿Qué factores externos pueden afectar la ejecución? (regulación, competencia)',
        '¿El sponsor tiene appetite de riesgo alto o bajo para este tipo de proyecto?',
      ],
      example: 'Un proyecto de software con equipo Scrum de 6 personas, arquitectura en microservicios y sponsor corporativo con bajo appetite de riesgo debe documentar estas circunstancias como base para la identificación de riesgos técnicos y de cumplimiento.',
      tips: [
        'Involucra al equipo completo en la definición del contexto interno.',
        'Investiga regulaciones aplicables antes de avanzar a la valoración.',
        'Documenta supuestos explícitamente — son fuente frecuente de riesgos.',
      ],
    },
    criterios: {
      title: 'Objetivos y Criterios',
      desc: 'Define qué es aceptable y qué no. Los criterios de aceptación determinan cómo se valora cada riesgo identificado.',
      what: [
        'Objetivos Críticos: metas de costo, alcance, tiempo y calidad que definen el éxito del proyecto.',
        'Criterios de Aceptación: umbrales de apetito de riesgo — qué riesgos se asumen, transfieren o mitigan.',
        'Factores Legales: normativas aplicables en protección de datos, seguridad y propiedad intelectual.',
      ],
      questions: [
        '¿Cuáles son los criterios mínimos para considerar el proyecto exitoso?',
        '¿Qué nivel de riesgo está dispuesto a aceptar el sponsor?',
        '¿Qué normativas aplican al sector y al tipo de datos procesados?',
      ],
      example: 'Un umbral de apetito de riesgo "bajo" podría significar: riesgos con nivel ≥ 10 requieren plan de contingencia documentado antes de iniciar el sprint. Riesgos con nivel ≥ 15 bloquean el sprint hasta mitigación.',
      tips: [
        'Usa la matriz P×I (ISO 31000) para calibrar los criterios numéricamente.',
        'Involucra al sponsor en definir los criterios — evita discrepancias posteriores.',
        'Revisa los criterios legales con el área legal antes de la identificación.',
      ],
    },
    activos: {
      title: 'Activos y Operaciones',
      desc: 'Identifica lo que tiene valor y debe protegerse. Los activos y procesos definen el alcance de la valoración de riesgos.',
      what: [
        'Activos Críticos: datos, código fuente, infraestructura, reputación y personas con valor para el proyecto.',
        'Procesos Afectados: flujos operativos y de soporte directamente impacted by los riesgos.',
        'Partes Interesadas: grupos con interés legítimo — sponsors, usuarios, reguladores, proveedores.',
      ],
      questions: [
        '¿Qué activos serían más impactados si un riesgo se materializara?',
        '¿Qué procesos de negocio dependen directamente del resultado del proyecto?',
        '¿Quiénes son los stakeholders y cuál es su nivel de influencia / interés?',
      ],
      example: 'Para un chatbot de selección de personal: activos críticos incluyen la base de datos de candidatos, las API keys de LLM, y el código fuente del motor conversacional. Los procesos afetados incluyen el registro de postulantes y el envío de notificaciones.',
      tips: [
        'Prioriza activos por criticidad: los de nivel 4 o 5 en impacto requieren controles específicos.',
        'Mapea stakeholders según su poder e interés — los de alto poder/alto interés requieren gestión activa.',
        'Documenta dependencias tecnológicas — son fuente frecuente de riesgos de integración.',
      ],
    },
  };

  if (!activeProjectId || projects.length === 0) {
    return (
      <div className="space-y-8 px-6 pt-6 min-h-screen" style={{ background: '#0b0d18' }}>
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Layers size={22} className="text-[#06b6d4]" />
            Contexto del Proyecto
          </h1>
          <p className="text-xs text-[#8a8f98] mt-1">Establece el marco de referencia para el análisis de riesgos ISO 31000.</p>
        </div>
        <div className="flex items-center justify-center py-24">
          <div className="text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#111420] border border-white/[0.08] flex items-center justify-center mx-auto">
              <FolderDot size={20} className="text-[#8a8f98]" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Ningún proyecto activo</p>
              <p className="text-[11px] text-[#8a8f98] mt-1">Selecciona un proyecto en el Portafolio para configurar su contexto.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const g = guideContent[activeStep];

  return (
    <div className="min-h-screen" style={{ background: '#0b0d18' }}>

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <div className="px-6 pt-6 pb-5 border-b border-white/[0.05]">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-7 h-7 rounded-lg bg-[#06b6d4]/15 border border-[#06b6d4]/30 flex items-center justify-center">
                <Layers size={14} className="text-[#06b6d4]" />
              </div>
              <h1 className="text-xl font-bold text-white">Contexto del Proyecto</h1>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border"
                style={{ background: '#06b6d415', color: '#06b6d4', borderColor: '#06b6d430' }}>
                {activeProject?.name}
              </span>
            </div>
            <p className="text-[11px] text-[#8a8f98]">
              Define el marco de referencia para la identificación y valoración de riesgos bajo ISO 31000.
            </p>
          </div>

          {/* Stepper */}
          <div className="flex items-center gap-4">
            <IsoStepper activeStep={activeStep} progress={stepProgress} />
            <CompletenessBar pct={totalProgress} />
          </div>
        </div>
      </div>

      {/* ── Metrics row ────────────────────────────────────────────────────── */}
      <div className="px-6 py-4">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <TinyMetric icon={User}    value={fieldCount('stakeholders')}          label="Stakeholders"         color="#3b82f6" />
          <TinyMetric icon={Scale}   value={fieldCount('legalFactors')}           label="Factores Legales"     color="#f97316" />
          <TinyMetric icon={Target}  value={fieldCount('criticalObjectives')}    label="Objetivos Críticos"   color="#10b981" />
          <TinyMetric icon={Box}     value={fieldCount('assets')}                 label="Activos Identificados" color="#8b5cf6" />
        </div>
      </div>

      {/* ── Two-column layout ───────────────────────────────────────────────── */}
      <div className="px-6 pb-8">
        <div className="flex flex-col lg:flex-row gap-6 items-stretch">

          {/* Left: form + context map */}
          <div className="flex-1 min-w-0 space-y-4">

            {/* Step tabs */}
            <div className="flex items-center gap-1 bg-[#111420] border border-white/[0.06] rounded-xl p-1">
              {ISO_STEPS.map((s) => {
                const isActive = activeStep === s.id;
                const pct = stepProgress[s.id];
                return (
                  <button key={s.id}
                    onClick={() => setActiveStep(s.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-[11px] font-bold transition-all duration-200 ${
                      isActive
                        ? 'bg-[#06b6d4]/15 text-[#06b6d4] border border-[#06b6d4]/25'
                        : 'text-[#8a8f98] hover:text-white hover:bg-white/[0.03]'
                    }`}>
                    <s.icon size={13} className={isActive ? 'text-[#06b6d4]' : 'text-[#8a8f98]'} />
                    <span className="hidden sm:inline">{s.label}</span>
                    <span className="sm:hidden">{s.short}</span>
                    {pct > 0 && (
                      <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full ${
                        isActive ? 'bg-[#06b6d4]/20 text-[#06b6d4]' : 'bg-white/[0.06] text-[#8a8f98]'
                      }`}>
                        {pct}%
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Project reference card */}
            <div className="bg-[#111420] border border-white/[0.06] rounded-xl p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[9px] uppercase font-bold text-[#8a8f98] tracking-widest flex items-center gap-1">
                    <Info size={9} className="text-[#06b6d4]" /> Descripción del Proyecto
                  </p>
                  <p className="text-[11px] text-[#c4c9d4] leading-relaxed">
                    {activeProject?.description || 'Sin descripción registrada.'}
                  </p>
                </div>
                <div className="space-y-1 md:border-l md:border-white/[0.06] md:pl-4">
                  <p className="text-[9px] uppercase font-bold text-[#8a8f98] tracking-widest flex items-center gap-1">
                    <Target size={9} className="text-[#06b6d4]" /> Objetivos de Referencia
                  </p>
                  <p className="text-[11px] text-[#c4c9d4] leading-relaxed">
                    {activeProject?.objective || 'Sin objetivos registrados.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Field cards */}
            <div className="space-y-3">
              {TAB_FIELDS[activeStep].map(f => (
                <FieldCard
                  key={f.name}
                  field={f}
                  value={formData[f.name]}
                  onChange={handleFieldChange}
                  onSuggestion={applySuggestion}
                  copiedField={copiedField}
                />
              ))}
            </div>

            {/* Context map */}
            <ContextMap
              projectName={activeProject?.name}
              formData={formData}
              onNodeClick={handleNodeClick}
            />

            {/* Save area */}
            <div className="bg-[#111420] border border-white/[0.06] rounded-xl p-4">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  {totalProgress === 100 ? (
                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-[#10b981]">
                      <CheckCircle2 size={14} />
                      Contexto completo — Listo para identificar riesgos
                    </span>
                  ) : totalProgress >= 60 ? (
                    <span className="text-[11px] text-[#8a8f98]">
                      Avanza en las secciones pendientes para completar el contexto.
                    </span>
                  ) : (
                    <span className="text-[11px] text-[#f97316] flex items-center gap-1.5">
                      <AlertTriangle size={12} />
                      Completa al menos el entorno de negocio para continuar.
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-mono text-[#8a8f98]">{totalProgress}%</span>
                  <Button onClick={save} disabled={saving}
                    className="gap-1.5 bg-[#06b6d4] hover:bg-[#06b6d4]/90 text-white text-xs font-bold h-9 px-4">
                    <Save size={13} />
                    {saving ? 'Guardando…' : 'Guardar contexto'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Message */}
            {msg && (
              <div className={`flex items-center gap-2 p-3 rounded-xl text-[11px] font-semibold border ${
                msg.type === 'ok'
                  ? 'bg-[#10b981]/10 border-[#10b981]/20 text-[#10b981]'
                  : 'bg-[#ef4444]/10 border-[#ef4444]/20 text-[#ef4444]'
              }`}>
                {msg.type === 'ok' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                {msg.text}
              </div>
            )}
          </div>

          {/* Right: ISO Guide */}
          <div className="w-full lg:w-80 shrink-0 space-y-3">

            {/* Guide card */}
            <div className="bg-[#111420] border border-white/[0.06] rounded-xl overflow-hidden">
              <div className="px-4 py-3 border-b border-white/[0.05]">
                <div className="flex items-center gap-2">
                  <BookOpen size={14} className="text-[#06b6d4]" />
                  <h2 className="text-[11px] font-bold text-white uppercase tracking-widest">
                    Guía ISO 31000
                  </h2>
                  <Badge variant="outline" className="ml-auto text-[8px] border-[#06b6d4]/30 text-[#06b6d4] bg-[#06b6d4]/10">
                    {g.title}
                  </Badge>
                </div>
              </div>

              <div className="p-4 space-y-3">

                {/* Stage description */}
                <p className="text-[11px] text-[#c4c9d4] leading-relaxed">{g.desc}</p>

                {/* Accordion: ¿Qué analizar? */}
                <div className="border border-white/[0.06] rounded-lg overflow-hidden">
                  <button
                    onClick={() => setGuideOpen(o => ({ ...o, what: !o.what }))}
                    className="w-full flex items-center justify-between px-3 py-2.5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors text-[10px]">
                    <span className="font-bold text-[#06b6d4] uppercase tracking-widest flex items-center gap-1.5">
                      <Lightbulb size={10} /> ¿Qué analizar?
                    </span>
                    {guideOpen.what ? <ChevronUp size={11} className="text-[#8a8f98]" /> : <ChevronDown size={11} className="text-[#8a8f98]" />}
                  </button>
                  {guideOpen.what && (
                    <div className="px-3 py-2 space-y-1.5 border-t border-white/[0.04]">
                      {g.what.map((item, i) => (
                        <p key={i} className="text-[10px] text-[#c4c9d4] leading-relaxed flex items-start gap-1.5">
                          <span className="text-[#06b6d4] mt-0.5 shrink-0">›</span>{item}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Accordion: Preguntas clave */}
                <div className="border border-white/[0.06] rounded-lg overflow-hidden">
                  <button
                    onClick={() => setGuideOpen(o => ({ ...o, questions: !o.questions }))}
                    className="w-full flex items-center justify-between px-3 py-2.5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors text-[10px]">
                    <span className="font-bold text-[#eab308] uppercase tracking-widest flex items-center gap-1.5">
                      <Search size={10} /> Preguntas clave
                    </span>
                    {guideOpen.questions ? <ChevronUp size={11} className="text-[#8a8f98]" /> : <ChevronDown size={11} className="text-[#8a8f98]" />}
                  </button>
                  {guideOpen.questions && (
                    <div className="px-3 py-2 space-y-1.5 border-t border-white/[0.04]">
                      {g.questions.map((q, i) => (
                        <p key={i} className="text-[10px] text-[#c4c9d4] leading-relaxed flex items-start gap-1.5">
                          <span className="text-[#eab308] mt-0.5 shrink-0">?</span>{q}
                        </p>
                      ))}
                    </div>
                  )}
                </div>

                {/* Accordion: Ejemplo */}
                <div className="border border-white/[0.06] rounded-lg overflow-hidden">
                  <button
                    onClick={() => setGuideOpen(o => ({ ...o, example: !o.example }))}
                    className="w-full flex items-center justify-between px-3 py-2.5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors text-[10px]">
                    <span className="font-bold text-[#8b5cf6] uppercase tracking-widest flex items-center gap-1.5">
                      <FileText size={10} /> Ejemplo
                    </span>
                    {guideOpen.example ? <ChevronUp size={11} className="text-[#8a8f98]" /> : <ChevronDown size={11} className="text-[#8a8f98]" />}
                  </button>
                  {guideOpen.example && (
                    <div className="px-3 py-2 border-t border-white/[0.04]">
                      <p className="text-[10px] text-[#c4c9d4] leading-relaxed italic">{g.example}</p>
                    </div>
                  )}
                </div>

                {/* Accordion: Buenas prácticas */}
                <div className="border border-white/[0.06] rounded-lg overflow-hidden">
                  <button
                    onClick={() => setGuideOpen(o => ({ ...o, tips: !o.tips }))}
                    className="w-full flex items-center justify-between px-3 py-2.5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors text-[10px]">
                    <span className="font-bold text-[#10b981] uppercase tracking-widest flex items-center gap-1.5">
                      <Sparkles size={10} /> Buenas prácticas
                    </span>
                    {guideOpen.tips ? <ChevronUp size={11} className="text-[#8a8f98]" /> : <ChevronDown size={11} className="text-[#8a8f98]" />}
                  </button>
                  {guideOpen.tips && (
                    <div className="px-3 py-2 space-y-1.5 border-t border-white/[0.04]">
                      {g.tips.map((t, i) => (
                        <p key={i} className="text-[10px] text-[#c4c9d4] leading-relaxed flex items-start gap-1.5">
                          <CheckCircle2 size={9} className="text-[#10b981] mt-0.5 shrink-0" />{t}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation actions */}
            <div className="bg-[#111420] border border-white/[0.06] rounded-xl p-4 space-y-2">
              <p className="text-[10px] uppercase font-bold text-[#8a8f98] tracking-widest mb-2">Navegación ISO 31000</p>
              {activeStep !== 'entorno' && (
                <Button variant="outline"
                  onClick={() => { const idx = ISO_STEPS.findIndex(s => s.id === activeStep); setActiveStep(ISO_STEPS[idx - 1].id); }}
                  className="w-full justify-between text-[11px] border-white/[0.08] text-[#8a8f98] hover:text-white h-9 bg-white/[0.02]">
                  <ChevronRight size={12} className="rotate-180" /> Etapa anterior
                </Button>
              )}
              {activeStep !== 'activos' && (
                <Button variant="outline"
                  onClick={() => { const idx = ISO_STEPS.findIndex(s => s.id === activeStep); setActiveStep(ISO_STEPS[idx + 1].id); }}
                  className="w-full justify-between text-[11px] border-white/[0.08] text-[#8a8f98] hover:text-white h-9 bg-white/[0.02]">
                  Siguiente etapa <ChevronRight size={12} />
                </Button>
              )}
              <div className="border-t border-white/[0.05] pt-2">
                <Button variant="outline"
                  onClick={() => navigate('/risks')}
                  className="w-full justify-between text-[11px] border-[#06b6d4]/20 text-[#06b6d4] hover:bg-[#06b6d4]/10 h-9 bg-[#06b6d4]/05 cursor-pointer transition-colors">
                  Ir a Identificación de Riesgos <ArrowRight size={12} />
                </Button>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

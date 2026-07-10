import { useState, useMemo, useCallback, Fragment, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import {
  Plus, Pencil, Trash2, Calendar, User, Layers, CheckCircle2, Circle, Play,
  ShieldAlert, Sparkles, Sliders, X, Search, ChevronDown, ChevronRight,
  TrendingUp, TrendingDown, Minus, AlertTriangle, Shield, Target, LayoutGrid
} from 'lucide-react';
import { api } from '@/services/api';
import { useAppStore } from '@/store/useAppStore';
import EmptyState from '@/components/EmptyState';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle
} from '@/components/ui/alert-dialog';

// ─── Color tokens ──────────────────────────────────────────────────────────────
const C = {
  bg:        '#0b0d18',
  surface:   '#111420',
  border:    'border-white/[0.06]',
  borderHov: 'border-white/[0.10]',
  cyan:      '#06b6d4',
  green:     '#10b981',
  orange:    '#f97316',
  red:       '#ef4444',
  yellow:    '#eab308',
  blue:      '#3b82f6',
  purple:    '#8b5cf6',
  text:      '#f0f2f5',
  sub:       '#8a8f98',
  muted:     '#4a4f5c',
};

// ─── Status ───────────────────────────────────────────────────────────────────
const STATUS_STYLE = {
  'Planificación': { bg: '#06b6d415', color: '#06b6d4', border: '#06b6d430' },
  'En ejecución':  { bg: '#10b98115', color: '#10b981', border: '#10b98130' },
  'Pausado':       { bg: '#f9731615', color: '#f97316', border: '#f9731630' },
  'Finalizado':    { bg: '#3b82f615', color: '#3b82f6', border: '#3b82f630' },
  'Cancelado':     { bg: '#6b728015', color: '#6b7280', border: '#6b728030' },
};

// ─── Sparkline ─────────────────────────────────────────────────────────────────
function Sparkline({ data, color }) {
  const max = Math.max(...data, 1);
  return (
    <div className="flex items-end gap-[1.5px] h-5">
      {data.map((v, i) => (
        <div key={i} className="w-[3px] rounded-full transition-all"
          style={{
            height: `${Math.max(3, (v / max) * 18)}px`,
            background: i === data.length - 1 ? color : `${color}30`,
          }}
        />
      ))}
    </div>
  );
}

// ─── Metric Tile ──────────────────────────────────────────────────────────────
function MetricTile({ icon: Icon, value, label, color, spark }) {
  return (
    <div className="group relative overflow-hidden rounded-[16px] border border-[#1e293b]/60 bg-[#0d1527] p-4 flex flex-col gap-2.5 transition-all duration-300 hover:-translate-y-0.5 hover:border-slate-700/60 hover:shadow-[0_15px_30px_-15px_rgba(0,0,0,0.8)]">
      {/* Glow corner indicator */}
      <div className="absolute top-0 right-0 w-16 h-16 rounded-full blur-[25px] opacity-[0.03] group-hover:opacity-[0.06] transition-all duration-500 pointer-events-none" style={{ background: color }} />
      
      <div className="flex items-center justify-between">
        <div className="text-slate-400 group-hover:text-white transition-colors duration-300">
          <Icon size={16} className="stroke-[1.5]" style={{ color }} />
        </div>
        {spark && <Sparkline data={spark} color={color} />}
      </div>
      
      <div className="mt-1">
        <p className="text-2xl font-black text-white font-sans tracking-tight">{value}</p>
        <p className="text-[9px] uppercase font-bold text-slate-500 tracking-[0.16em] font-mono mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function IsoDotLine({ contextPct, hasRisks, hasSprints }) {
  const steps = [
    { label: 'Contexto',      done: contextPct >= 60 },
    { label: 'Identificación', done: hasRisks },
    { label: 'Valoración',    done: hasRisks },
    { label: 'Tratamiento',   done: hasSprints },
    { label: 'Monitoreo',     done: hasSprints },
  ];
  return (
    <div className="iso-timeline-wrapper w-full">
      <div className="flex items-center justify-between w-full bg-slate-950/20 border border-white/5 rounded-xl p-2.5">
        {steps.map((s, i) => (
          <Fragment key={s.label}>
            {i > 0 && (
              <div className={`h-0.5 flex-1 mx-1.5 transition-all duration-500 rounded-full ${s.done ? 'bg-cyan-500 shadow-[0_0_4px_#06b6d4]' : 'bg-slate-800'}`} />
            )}
            <div className="flex items-center gap-1.5 select-none" title={`${s.label}: ${s.done ? 'Completado' : 'Pendiente'}`}>
              <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center text-[7.5px] font-black transition-all ${
                s.done 
                  ? 'bg-cyan-500 text-slate-950 shadow-[0_0_8px_#06b6d4]' 
                  : 'bg-slate-800 text-slate-500 border border-slate-700'
              }`}>
                {s.done ? '✓' : i + 1}
              </div>
              <span className="iso-timeline-label text-[8px] font-black uppercase tracking-wider transition-colors"
                style={{ color: s.done ? '#06b6d4' : '#64748b' }}>
                {s.label}
              </span>
            </div>
          </Fragment>
        ))}
      </div>
    </div>
  );
}

function ExposureMap({ projects }) {
  const getSize = (r) => Math.max(8, Math.min(22, 8 + (r || 0) * 1.8));
  const getColor = (r, c) => {
    if (!r) return '#64748b';
    if (r >= 15 || c > 0) return '#ef4444';
    if (r >= 10) return '#f97316';
    if (r >= 5) return '#eab308';
    return '#10b981';
  };

  return (
    <div className="bg-[#0b0c13]/85 border border-white/5 rounded-2xl p-4 shadow-md">
      <div className="flex items-center justify-between mb-3 select-none">
        <p className="text-[10px] uppercase font-black text-slate-400 tracking-wider font-mono">Mapa de Exposición del Portafolio</p>
        <span className="text-[9px] text-slate-500 font-bold font-mono">Riesgos Totales vs Criticidad</span>
      </div>
      
      <div className="relative w-full h-16 bg-[#090b11] rounded-xl overflow-hidden border border-white/5 flex items-center">
        {/* Background Mesh Grid */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 64" preserveAspectRatio="none">
          <line x1="0" y1="32" x2="400" y2="32" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          {[50, 100, 150, 200, 250, 300, 350].map((v) => (
            <line key={v} x1={v} y1="0" x2={v} y2="64" stroke="rgba(255,255,255,0.02)" strokeWidth="0.5" strokeDasharray="2,2" />
          ))}
        </svg>
        
        {/* SVG Nodes */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 64" preserveAspectRatio="xMidYMid meet">
          {projects.map((p, i) => {
            const x = projects.length === 1 
              ? 200 
              : (i / (projects.length - 1)) * 340 + 30;
            const y = 32;
            const size = getSize(p.riskCount);
            const color = getColor(p.riskCount, p.criticalRiskCount);
            return (
              <g key={p.id} className="cursor-pointer group">
                <circle cx={x} cy={y} r={size / 2 + 5} fill={color} opacity="0.06" className="transition-all duration-300 group-hover:opacity-15 group-hover:scale-110" />
                <circle cx={x} cy={y} r={size / 2 + 2} fill="none" stroke={color} strokeWidth="1" opacity="0.3" className="transition-all duration-300 group-hover:opacity-60" />
                <circle cx={x} cy={y} r={size / 2} fill={color} opacity="0.85" className="transition-all duration-300 group-hover:opacity-100" />
              </g>
            );
          })}
        </svg>

        {/* HTML Hover tooltips & Titles */}
        {projects.map((p, i) => {
          const xPct = projects.length === 1 
            ? 50 
            : (i / (projects.length - 1)) * 85 + 7.5;
          return (
            <div key={p.id}
              className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center group/tooltip"
              style={{ left: `${xPct}%`, transform: 'translate(-50%,-50%)' }}
              title={`${p.name}: ${p.riskCount || 0} riesgos`}>
              
              <span className="text-[8.5px] font-mono font-bold text-slate-400 bg-[#121520] border border-white/5 px-2.5 py-0.5 rounded-lg select-none transition-all duration-300 group-hover/tooltip:border-cyan-500/30 group-hover/tooltip:text-white shadow-lg hidden sm:block">
                {p.name.slice(0, 16)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="flex items-center gap-4 mt-3 justify-center select-none font-mono text-[9px]">
        {[
          { label: 'Bajo', color: '#10b981' },
          { label: 'Medio', color: '#eab308' },
          { label: 'Alto', color: '#f97316' },
          { label: 'Crítico', color: '#ef4444' },
        ].map(l => (
          <div key={l.label} className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: l.color, boxShadow: `0 0 4px ${l.color}` }} />
            <span className="text-slate-500 font-bold uppercase tracking-wider">{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Project Card ──────────────────────────────────────────────────────────────
function ProjectCard({ project, isActive, onSelect, onEdit, onDelete }) {
  const st = STATUS_STYLE[project.status] || STATUS_STYLE['Planificación'];
  const completeness = [
    project.description, project.objective, project.scope,
    project.stakeholders?.length > 0, project.technologies?.length > 0
  ].filter(Boolean).length * 20;

  return (
    <div
      className={`group relative overflow-hidden rounded-[16px] border bg-[#0d1527] p-5 cursor-pointer transition-all duration-300 hover:-translate-y-1 ${
        isActive 
          ? 'border-cyan-500/40 shadow-[0_20px_35px_-15px_rgba(0,0,0,0.8),_0_0_15px_-3px_rgba(6,182,212,0.06)]' 
          : 'border-[#1e293b]/60 hover:border-slate-700/60 hover:shadow-[0_20px_35px_-15px_rgba(0,0,0,0.8)]'
      }`}
      onClick={() => onSelect(project.id)}
    >
      {/* Decorative top border highlight on active */}
      {isActive && (
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-80" />
      )}

      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-2 relative z-10">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-1.5">
            <span className="text-[15px] font-extrabold text-white tracking-tight truncate group-hover:text-cyan-400 transition-colors">
              {project.name}
            </span>
            {isActive && (
              <Badge className="text-[8px] px-1.5 py-0 h-4 font-bold shrink-0 bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 animate-pulse">
                ACTIVO
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="outline" className="text-[9px] py-0 px-1.5 font-normal bg-white/[0.02] border-slate-800 text-slate-400">
              {project.type || 'Sin tipo'}
            </Badge>
            <Badge variant="outline" className="text-[9px] py-0 px-1.5 font-bold"
              style={{ background: `${st.color}0c`, color: st.color, borderColor: `${st.color}25` }}>
              {project.status}
            </Badge>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 shrink-0">
          <button onClick={e => { e.stopPropagation(); onEdit(project); }}
            className="w-7 h-7 rounded-lg bg-[#0e1628]/80 hover:bg-[#1a2744]/80 border border-slate-800/40 flex items-center justify-center transition-colors cursor-pointer text-slate-400 hover:text-white">
            <Pencil size={11} />
          </button>
          <button onClick={e => { e.stopPropagation(); onDelete(project); }}
            className="w-7 h-7 rounded-lg bg-[#0e1628]/80 hover:bg-rose-500/10 border border-slate-800/40 flex items-center justify-center transition-colors cursor-pointer text-[#8a8f98] hover:text-rose-400">
            <Trash2 size={11} />
          </button>
        </div>
      </div>

      {/* Description */}
      <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed mb-4 relative z-10">
        {project.objective || 'Sin objetivo registrado.'}
      </p>

      {/* ISO progress */}
      <div className="mb-4 relative z-10">
        <IsoDotLine
          contextPct={completeness}
          hasRisks={(project.riskCount || 0) > 0}
          hasSprints={(project.sprintCount || 0) > 0}
        />
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-1.5 bg-[#080c14]/40 border border-slate-800/40 rounded-xl p-2.5 divide-x divide-slate-800/40 text-center mb-4 relative z-10">
        <div>
          <p className="text-xs font-black font-mono text-cyan-400">{project.riskCount || 0}</p>
          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Riesgos</p>
        </div>
        <div>
          <p className={`text-xs font-black font-mono ${(project.criticalRiskCount || 0) > 0 ? 'text-[#ef4444]' : 'text-slate-300'}`}>
            {project.criticalRiskCount || 0}
          </p>
          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Críticos</p>
        </div>
        <div>
          <p className="text-xs font-black font-mono text-emerald-400">{project.sprintCount || 0}</p>
          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Sprints</p>
        </div>
        <div>
          <p className="text-xs font-black font-mono text-slate-300">{completeness}%</p>
          <p className="text-[8px] font-bold text-slate-500 uppercase tracking-wider mt-0.5">Contexto</p>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800/40 relative z-10">
        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 min-w-0">
          <User size={10} className="shrink-0 text-slate-500" />
          <span className="truncate text-slate-400 font-sans">{project.owner || 'Sin responsable'}</span>
        </div>
        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-mono shrink-0 select-none">
          <Calendar size={10} />
          {project.startDate ? `${project.startDate.slice(5)}` : '—'} → {project.endDate ? `${project.endDate.slice(5)}` : '—'}
        </div>
      </div>
    </div>
  );
}

// ─── Selected Project Panel ────────────────────────────────────────────────────
function SelectedProjectPanel({ project, onClose }) {
  if (!project) return null;
  const navigate = useNavigate();
  const st = STATUS_STYLE[project.status] || STATUS_STYLE['Planificación'];
  const completeness = [
    project.description, project.objective, project.scope,
    project.stakeholders?.length > 0, project.technologies?.length > 0
  ].filter(Boolean).length * 20;
  const exposureLevel = Math.min(25, Math.round((project.riskCount || 0) * 1.5 + (project.criticalRiskCount || 0) * 3));
  const exposureColor = exposureLevel >= 15 ? '#f43f5e' : exposureLevel >= 10 ? '#f97316' : exposureLevel >= 5 ? '#f59e0b' : '#10b981';

  return (
    <div className="bg-[#0d1527] border border-[#1e293b]/70 rounded-[16px] overflow-hidden sticky top-6 shadow-[0_25px_45px_-12px_rgba(0,0,0,0.9)] z-10">

      {/* Header */}
      <div className="px-5 py-4 border-b border-slate-800/40">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-[8px] font-mono font-black uppercase tracking-[0.16em] text-cyan-400 bg-cyan-500/10 border border-cyan-500/20 rounded px-1.5 py-0.5 select-none">
                SELECCIONADO
              </span>
            </div>
            <h3 className="text-[15px] font-extrabold text-white tracking-tight truncate" title={project.name}>{project.name}</h3>
            <Badge variant="outline" className="text-[9px] py-0 px-1.5 font-bold mt-1.5"
              style={{ background: `${st.color}0c`, color: st.color, borderColor: `${st.color}25` }}>
              {project.status}
            </Badge>
          </div>
          <button onClick={onClose}
            className="w-6 h-6 rounded-lg bg-white/[0.02] hover:bg-white/[0.06] border border-slate-800/50 flex items-center justify-center shrink-0 transition-colors cursor-pointer text-slate-400 hover:text-white">
            <X size={11} />
          </button>
        </div>
      </div>

      <div className="p-5 space-y-5">

        {/* Exposure score */}
        <div className="relative rounded-xl p-5 border overflow-hidden text-center group"
          style={{ borderColor: `${exposureColor}25`, background: `linear-gradient(135deg, ${exposureColor}0c, transparent)` }}>
          <div className="absolute inset-0 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity duration-500 pointer-events-none"
            style={{ background: `radial-gradient(circle at 50% 50%, ${exposureColor}, transparent)` }} />
          <p className="text-[9px] uppercase font-bold text-slate-500 tracking-[0.16em] font-mono mb-1">Nivel de Exposición</p>
          <p className="text-4xl font-black font-sans tracking-tight" style={{ color: exposureColor, textShadow: `0 0 25px ${exposureColor}40` }}>
            {exposureLevel}
          </p>
          <p className="text-[9px] mt-1.5 font-bold uppercase tracking-wider" style={{ color: exposureColor, opacity: 0.85 }}>
            {exposureLevel >= 15 ? 'Exposición Crítica' : exposureLevel >= 10 ? 'Exposición Alta' : exposureLevel >= 5 ? 'Exposición Moderada' : 'Exposición Baja'}
          </p>
        </div>

        {/* Metrics Grid 2x2 */}
        <div className="grid grid-cols-2 gap-2">
          {[
            { label: 'Riesgos Totales', val: project.riskCount || 0, color: '#38bdf8' },
            { label: 'Críticos',         val: project.criticalRiskCount || 0, color: '#f43f5e' },
            { label: 'Sprints',          val: project.sprintCount || 0, color: '#10b981' },
            { label: 'Contexto',         val: `${completeness}%`, color: '#dcf836' },
          ].map(({ label, val, color }) => (
            <div key={label} className="bg-[#080c14]/40 border border-slate-800/40 rounded-xl p-3 text-center transition-all duration-300 hover:bg-[#0e1628]/40 hover:border-slate-700/40">
              <p className="text-base font-black font-sans tracking-tight" style={{ color }}>{val}</p>
              <p className="text-[8px] uppercase font-bold text-slate-500 tracking-wider mt-1 font-mono">{label}</p>
            </div>
          ))}
        </div>

        {/* ISO cycle */}
        <div className="bg-[#080c14]/30 border border-slate-800/40 rounded-xl p-3.5">
          <p className="text-[9px] uppercase font-bold text-slate-500 tracking-[0.16em] font-mono mb-2.5">Ciclo ISO 31000</p>
          <IsoDotLine
            contextPct={completeness}
            hasRisks={(project.riskCount || 0) > 0}
            hasSprints={(project.sprintCount || 0) > 0}
          />
        </div>

        {/* Inherent vs Residual */}
        <div className="space-y-2">
          <p className="text-[9px] uppercase font-bold text-slate-500 tracking-[0.16em] font-mono">Riesgo Inherente vs Residual</p>
          <div className="space-y-2 bg-[#080c14]/20 border border-slate-800/30 rounded-xl p-3">
            <div className="flex items-center justify-between text-[10px] font-sans">
              <span className="text-[#f43f5e] font-bold">Inherente</span>
              <span className="text-[10px] font-mono text-slate-300 font-bold">{exposureLevel}</span>
            </div>
            <div className="h-1.5 bg-[#080c14]/60 rounded-full overflow-hidden border border-slate-900">
              <div className="h-full rounded-full bg-[#f43f5e]" style={{ width: `${(exposureLevel / 25) * 100}%` }} />
            </div>
            <div className="flex items-center justify-between text-[10px] mt-2 font-sans">
              <span className="text-[#10b981] font-bold">Residual</span>
              <span className="text-[10px] font-mono text-slate-300 font-bold">{Math.max(1, Math.round(exposureLevel * 0.4))}</span>
            </div>
            <div className="h-1.5 bg-[#080c14]/60 rounded-full overflow-hidden border border-slate-900">
              <div className="h-full rounded-full bg-[#10b981]" style={{ width: `${(exposureLevel * 0.4 / 25) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="space-y-2 pt-3 border-t border-slate-800/40">
          <Button variant="outline"
            onClick={() => navigate('/context')}
            className="group w-full justify-between text-[11px] border-slate-800/60 text-[#38bdf8] hover:text-[#dcf836] hover:bg-slate-900/40 hover:border-slate-700/60 h-9 bg-slate-950/20 font-bold cursor-pointer rounded-xl transition-all">
            <span className="flex items-center gap-2"><Layers size={12} className="text-[#38bdf8] group-hover:text-[#dcf836] transition-colors" /> Ir al Contexto</span>
            <ChevronRight size={12} className="text-slate-500 group-hover:translate-x-0.5 transition-transform" />
          </Button>
          <Button variant="outline"
            onClick={() => navigate('/risks')}
            className="group w-full justify-between text-[11px] border-slate-800/60 text-[#38bdf8] hover:text-[#dcf836] hover:bg-slate-900/40 hover:border-slate-700/60 h-9 bg-slate-950/20 font-bold cursor-pointer rounded-xl transition-all">
            <span className="flex items-center gap-2"><ShieldAlert size={12} className="text-[#38bdf8] group-hover:text-[#dcf836] transition-colors" /> Identificar Riesgos</span>
            <ChevronRight size={12} className="text-slate-500 group-hover:translate-x-0.5 transition-transform" />
          </Button>
          <Button variant="outline"
            onClick={() => navigate('/matrix')}
            className="group w-full justify-between text-[11px] border-slate-800/60 text-[#38bdf8] hover:text-[#dcf836] hover:bg-slate-900/40 hover:border-slate-700/60 h-9 bg-slate-950/20 font-bold cursor-pointer rounded-xl transition-all">
            <span className="flex items-center gap-2"><LayoutGrid size={12} className="text-[#38bdf8] group-hover:text-[#dcf836] transition-colors" /> Ver Matriz de Riesgos</span>
            <ChevronRight size={12} className="text-slate-500 group-hover:translate-x-0.5 transition-transform" />
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function Projects() {
  const { projects, activeProjectId, setActiveProject, loadProjects } = useAppStore();
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterRisk, setFilterRisk] = useState('');
  const { register, handleSubmit, reset } = useForm();
  
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const selectClass = "w-full sm:w-44 text-[11px] rounded-xl border border-white/5 bg-[#0b0c13]/80 text-slate-400 px-3 py-2 focus:outline-none focus:ring-1 focus:ring-cyan-500/30 cursor-pointer transition-all hover:border-white/10 hover:text-white";

  // ─── Portfolio stats ────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = projects.length;
    const active = projects.filter(p => p.status === 'En ejecución').length;
    const paused = projects.filter(p => p.status === 'Pausado').length;
    const critical = projects.reduce((a, p) => a + (p.criticalRiskCount || 0), 0);
    const avgRisk = total ? Math.round(projects.reduce((a, p) => a + (p.riskCount || 0), 0) / total) : 0;
    const attention = projects.filter(p => (p.criticalRiskCount || 0) > 0).length;
    const portfolioStatus = critical > 0 ? 'Atención requerida' : paused > 0 ? 'En vigilancia' : 'Bajo control';
    const statusColor = critical > 0 ? '#ef4444' : paused > 0 ? '#f97316' : '#10b981';
    return { total, active, paused, critical, avgRisk, attention, portfolioStatus, statusColor };
  }, [projects]);

  // ─── Filtered projects ───────────────────────────────────────────────────────
  const filteredProjects = useMemo(() => {
    return projects.filter(p => {
      if (search && !p.name.toLowerCase().includes(search.toLowerCase())) return false;
      if (filterStatus && p.status !== filterStatus) return false;
      if (filterRisk === 'critical' && (p.criticalRiskCount || 0) === 0) return false;
      if (filterRisk === 'has_risks' && (p.riskCount || 0) === 0) return false;
      return true;
    });
  }, [projects, search, filterStatus, filterRisk]);

  const activeProject = projects.find(p => p.id === activeProjectId);

  // ─── CRUD ───────────────────────────────────────────────────────────────────
  async function createOrUpdate(data) {
    try {
      if (editing) {
        await api.put(`/projects/${editing.id}`, data);
      } else {
        await api.post('/projects', data);
      }
      await loadProjects();
      setOpen(false); setEditing(null); reset();
    } catch (e) { alert(e.message); }
  }

  async function confirmDelete() {
    if (!toDelete) return;
    try {
      await api.del(`/projects/${toDelete.id}`);
      await loadProjects();
      setToDelete(null);
    } catch (e) { alert(e.message); }
  }

  function startEdit(p) {
    setEditing(p);
    reset({
      name: p.name, description: p.description, type: p.type, owner: p.owner,
      startDate: p.startDate, endDate: p.endDate, objective: p.objective, scope: p.scope,
      stakeholders: (p.stakeholders || []).join(', '),
      technologies: (p.technologies || []).join(', '),
      status: p.status,
    });
    setOpen(true);
  }

  const resetFilters = () => { setSearch(''); setFilterStatus(''); setFilterRisk(''); };
  const hasFilters = search || filterStatus || filterRisk;

  return (
    <div className="min-h-screen" style={{ background: '#080c14' }}>
      <div className="px-6 pt-6 space-y-5">

        {/* ── Header ─────────────────────────────────────────────────────────── */}
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="w-8 h-8 rounded-xl bg-[#06b6d4]/15 border border-[#06b6d4]/30 flex items-center justify-center">
                <LayoutGrid size={16} className="text-[#06b6d4]" />
              </div>
              <h1 className="text-2xl font-bold text-white">Portafolio de Proyectos</h1>
            </div>
            <p className="text-[11px] text-[#8a8f98]">
              Gestión del ciclo de riesgos bajo ISO 31000.
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Portfolio status */}
            <div className="flex items-center gap-2 bg-[#111420] border border-white/[0.06] rounded-xl px-3 py-2">
              <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: stats.statusColor, boxShadow: `0 0 8px ${stats.statusColor}80` }} />
              <span className="text-[10px] font-bold" style={{ color: stats.statusColor }}>{stats.portfolioStatus}</span>
            </div>
            <Button onClick={() => { setEditing(null); reset({}); setOpen(true); }}
              className="gap-1.5 bg-[#06b6d4] hover:bg-[#06b6d4]/90 text-white text-xs font-bold h-9 px-4">
              <Plus size={14} /> Nuevo proyecto
            </Button>
          </div>
        </div>

        {/* ── Metric tiles ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <MetricTile icon={Layers}        value={stats.total}     label="Total"           color="#3b82f6" spark={[3,5,4,6,5,7]} />
          <MetricTile icon={Play}         value={stats.active}    label="En ejecución"    color="#10b981" spark={[2,3,4,5,5,6]} />
          <MetricTile icon={Circle}       value={stats.paused}    label="Pausados"        color="#f97316" spark={[1,2,1,2,1,2]} />
          <MetricTile icon={ShieldAlert}  value={stats.critical}  label="Críticos"        color="#ef4444" spark={[1,2,3,2,4,3]} />
          <MetricTile icon={TrendingUp}   value={stats.avgRisk}   label="Riesgo promedio" color="#eab308" spark={[4,5,6,5,7,6]} />
          <MetricTile icon={AlertTriangle} value={stats.attention} label="Atención req."   color="#ec4899" spark={[1,1,2,1,3,2]} />
        </div>

        {/* ── Exposure map ───────────────────────────────────────────────────── */}
        {projects.length > 0 && <ExposureMap projects={projects} />}

        {/* ── Two-column grid ────────────────────────────────────────────────── */}
        {projects.length === 0 ? (
          <EmptyState
            icon={Plus}
            title="Aún no hay proyectos"
            description="Crea el primer proyecto para empezar a establecer el contexto y gestionar los riesgos bajo ISO 31000."
            action={<Button onClick={() => setOpen(true)} className="gap-1.5"><Plus size={14} /> Crear proyecto</Button>}
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

            {/* Left: filters + project list */}
            <div className={`${activeProject && !isMobile ? 'lg:col-span-2' : 'lg:col-span-3'} space-y-4 transition-all duration-300`}>

              {/* Filters */}
              <div className="flex items-center gap-2 flex-wrap w-full">
                <div className="relative flex-1 min-w-[200px]">
                  <Search size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input type="text" value={search} onChange={e => setSearch(e.target.value)}
                    placeholder="Buscar proyecto…"
                    className="w-full bg-[#0b0c13]/80 border border-white/5 rounded-xl pl-9 pr-3 py-2 text-[11px] text-white placeholder:text-[#4a4f5c] focus:outline-none focus:border-cyan-500/30 transition-all" />
                </div>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
                  className={selectClass}>
                  <option value="" className="bg-[#0b0c13] text-slate-400">Todos los estados</option>
                  {Object.keys(STATUS_STYLE).map(s => <option key={s} value={s} className="bg-[#0b0c13] text-white">{s}</option>)}
                </select>
                <select value={filterRisk} onChange={e => setFilterRisk(e.target.value)}
                  className={selectClass}>
                  <option value="" className="bg-[#0b0c13] text-slate-400">Cualquier riesgo</option>
                  <option value="critical" className="bg-[#0b0c13] text-white">Con críticos</option>
                  <option value="has_risks" className="bg-[#0b0c13] text-white">Con riesgos</option>
                </select>
                {hasFilters && (
                  <button onClick={resetFilters}
                    className="flex items-center gap-1 text-[10px] text-[#8a8f98] hover:text-white px-2 py-1.5 rounded-lg hover:bg-white/[0.04] transition-colors">
                    <X size={10} /> Limpiar
                  </button>
                )}
              </div>

              {/* Project cards grid */}
              <div className={`grid grid-cols-1 md:grid-cols-2 ${activeProject && !isMobile ? '' : 'xl:grid-cols-3'} gap-4`}>
                {filteredProjects.map(p => (
                  <ProjectCard
                    key={p.id}
                    project={p}
                    isActive={p.id === activeProjectId}
                    onSelect={setActiveProject}
                    onEdit={startEdit}
                    onDelete={setToDelete}
                  />
                ))}
                {filteredProjects.length === 0 && (
                  <div className="col-span-full flex items-center justify-center py-16 text-center">
                    <div className="space-y-2">
                      <Search size={20} className="text-[#4a4f5c] mx-auto" />
                      <p className="text-[12px] text-[#8a8f98]">No hay proyectos que coincidan con los filtros.</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right: selected project panel (Desktop only) */}
            {activeProject && !isMobile && (
              <div className="lg:col-span-1">
                <SelectedProjectPanel
                  project={activeProject}
                  onClose={() => setActiveProject(null)}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Mobile/Tablet Detail Dialog ───────────────────────────────────────── */}
      <Dialog open={!!activeProject && isMobile} onOpenChange={isOpen => { if (!isOpen) setActiveProject(null); }}>
        <DialogContent className="max-w-md text-white bg-[#0b0c13]/95 border border-white/10 p-0 overflow-y-auto max-h-[90vh] rounded-2xl">
          {activeProject && (
            <SelectedProjectPanel
              project={activeProject}
              onClose={() => setActiveProject(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* ── Create/Edit Dialog ───────────────────────────────────────────────── */}
      <Dialog open={open} onOpenChange={isOpen => { if (!isOpen) { setOpen(false); setEditing(null); } }}>
        <DialogContent className="max-w-2xl text-white bg-[#111420] border border-white/[0.08]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-1.5 text-sm text-white">
              <Sparkles size={14} className="text-[#f97316]" />
              {editing ? 'Editar Proyecto' : 'Crear Nuevo Proyecto'}
            </DialogTitle>
          </DialogHeader>
          <form className="space-y-4 pt-2" onSubmit={handleSubmit(createOrUpdate)}>
            <div className="grid md:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] text-[#8a8f98] font-bold">Nombre del Proyecto</Label>
                <Input {...register('name')} required placeholder="Ej. Madame Crepe"
                  className="bg-white/[0.04] border-white/[0.08] text-white text-xs h-9" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-[#8a8f98] font-bold">Tipo / Categoría</Label>
                <Input {...register('type')} placeholder="Ej. Aplicación Móvil"
                  className="bg-white/[0.04] border-white/[0.08] text-white text-xs h-9" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-[#8a8f98] font-bold">Descripción general</Label>
              <Textarea {...register('description')} rows={2} placeholder="Describe brevemente el proyecto…"
                className="bg-white/[0.04] border-white/[0.08] text-white text-xs resize-none" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-[#8a8f98] font-bold">Objetivo General</Label>
              <Textarea {...register('objective')} rows={2} placeholder="Metas de costo, alcance, tiempo y calidad…"
                className="bg-white/[0.04] border-white/[0.08] text-white text-xs resize-none" />
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-[#8a8f98] font-bold">Alcance y entregables</Label>
              <Textarea {...register('scope')} rows={2} placeholder="Límites y exclusiones…"
                className="bg-white/[0.04] border-white/[0.08] text-white text-xs resize-none" />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] text-[#8a8f98] font-bold">Director / PM</Label>
                <Input {...register('owner')} placeholder="Ej. Ing. Juan Pérez"
                  className="bg-white/[0.04] border-white/[0.08] text-white text-xs h-9" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-[#8a8f98] font-bold">Inicio</Label>
                <Input type="date" {...register('startDate')}
                  className="bg-white/[0.04] border-white/[0.08] text-white text-xs h-9" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-[#8a8f98] font-bold">Fin</Label>
                <Input type="date" {...register('endDate')}
                  className="bg-white/[0.04] border-white/[0.08] text-white text-xs h-9" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[10px] text-[#8a8f98] font-bold">Stakeholders</Label>
                <Input {...register('stakeholders')} placeholder="Separados por coma"
                  className="bg-white/[0.04] border-white/[0.08] text-white text-xs h-9" />
              </div>
              <div className="space-y-1">
                <Label className="text-[10px] text-[#8a8f98] font-bold">Tecnologías</Label>
                <Input {...register('technologies')} placeholder="Separadas por coma"
                  className="bg-white/[0.04] border-white/[0.08] text-white text-xs h-9" />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-[10px] text-[#8a8f98] font-bold">Estado</Label>
              <select {...register('status')} className={selectClass}>
                {Object.keys(STATUS_STYLE).map(s => <option key={s} value={s}>{s}</option>)}
                <option value="Cancelado">Cancelado</option>
              </select>
            </div>
            <DialogFooter className="gap-2 pt-2 border-t border-white/[0.05]">
              <Button type="button" variant="outline"
                onClick={() => { setOpen(false); setEditing(null); }}
                className="border-white/[0.08] bg-white/[0.04] text-white hover:bg-white/[0.08] text-xs h-9">
                Cancelar
              </Button>
              <Button type="submit"
                className="bg-[#06b6d4] hover:bg-[#06b6d4]/90 text-white text-xs font-bold h-9 px-4">
                {editing ? 'Guardar cambios' : 'Crear proyecto'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ── Delete Alert ────────────────────────────────────────────────────── */}
      <AlertDialog open={!!toDelete} onOpenChange={isOpen => { if (!isOpen) setToDelete(null); }}>
        <AlertDialogContent className="text-white bg-[#111420] border border-white/[0.08]">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-[#ef4444] text-sm">
              <ShieldAlert size={16} />
              ¿Eliminar &quot;{toDelete?.name}&quot;?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[11px] text-[#8a8f98]">
              Esta acción es irreversible. Eliminará el proyecto, su contexto, actividades, recursos, riesgos y sprints.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 pt-2 border-t border-white/[0.05]">
            <AlertDialogCancel className="border-white/[0.08] bg-white/[0.04] text-white hover:bg-white/[0.08] text-xs h-9">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}
              className="bg-[#ef4444] hover:bg-[#ef4444]/90 text-white text-xs font-bold h-9">
              Eliminar proyecto
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

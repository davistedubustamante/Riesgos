import { useEffect, useState, useCallback, Fragment, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Grid3x3, Flame, AlertTriangle, ShieldAlert, CheckCircle2, Eye, EyeOff,
  Layers, User, Calendar, Sparkles, Activity, RefreshCw, Shield, TrendingUp,
  TrendingDown, Minus, Zap, ChevronRight, X, BarChart3, Radio, Clock } from 'lucide-react';
import { api } from '../services/api.js';
import { useAppStore } from '../store/useAppStore.js';
import EmptyState from '@/components/EmptyState.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RISK_CATEGORIES, RISK_STATUSES, classificationFromLevel } from '../utils/risk.js';

// ─── Zone helpers ──────────────────────────────────────────────────────────────
function getZone(level) {
  if (level >= 15) return 'Crítico';
  if (level >= 10) return 'Alto';
  if (level >= 5)  return 'Medio';
  return 'Bajo';
}

const ZONE_STYLE = {
  'Crítico': 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20 hover:bg-[#ef4444]/20',
  'Alto':    'bg-[#f97316]/10 text-[#f97316] border-[#f97316]/20 hover:bg-[#f97316]/20',
  'Medio':   'bg-[#eab308]/10 text-[#eab308] border-[#eab308]/20 hover:bg-[#eab308]/20',
  'Bajo':    'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20 hover:bg-[#10b981]/20',
};

const ZONE_HEX = {
  1:  { bg: '#064e3b', glow: '#10b981', label: 'Bajo',     text: '#6ee7b7' },
  2:  { bg: '#1e3a5f', glow: '#3b82f6', label: 'Bajo+',    text: '#93c5fd' },
  3:  { bg: '#3b2a0f', glow: '#d97706', label: 'Medio–',   text: '#fcd34d' },
  4:  { bg: '#3b1a0f', glow: '#ea580c', label: 'Medio',    text: '#fdba74' },
  5:  { bg: '#3b0a0f', glow: '#dc2626', label: 'Medio+',   text: '#fca5a5' },
  6:  { bg: '#4a0a1e', glow: '#db2777', label: 'Alto–',    text: '#f9a8d4' },
  8:  { bg: '#4a0520', glow: '#c026d3', label: 'Alto',      text: '#e879f9' },
  10: { bg: '#4a0520', glow: '#a21caf', label: 'Alto+',   text: '#e879f9' },
  12: { bg: '#4a0520', glow: '#9333ea', label: 'Crítico–',text: '#c084fc' },
  15: { bg: '#4a0010', glow: '#7f1d1d', label: 'Crítico',  text: '#fca5a5' },
  16: { bg: '#4a0010', glow: '#7f1d1d', label: 'Crítico+', text: '#fca5a5' },
  20: { bg: '#4a0010', glow: '#7f1d1d', label: 'Extremo',  text: '#fecaca' },
  25: { bg: '#4a0010', glow: '#7f1d1d', label: 'Extremo',  text: '#fecaca' },
};

function getCellZone(p, i) {
  const level = p * i;
  if (level >= 20) return ZONE_HEX[20];
  if (level >= 16) return ZONE_HEX[16] || ZONE_HEX[15];
  if (level >= 15) return ZONE_HEX[15];
  if (level >= 12) return ZONE_HEX[12];
  if (level >= 10) return ZONE_HEX[10];
  if (level >= 8)  return ZONE_HEX[8];
  if (level >= 6)  return ZONE_HEX[6];
  if (level >= 5)  return ZONE_HEX[5];
  if (level >= 4)  return ZONE_HEX[4];
  if (level >= 3)  return ZONE_HEX[3];
  if (level >= 2)  return ZONE_HEX[2];
  return ZONE_HEX[1];
}

const MODE_STYLE = {
  matrix:    'bg-[#06b6d4]/10 text-[#06b6d4] border-[#06b6d4]/20',
  frequency: 'bg-[#f97316]/10 text-[#f97316] border-[#f97316]/20',
  severity:  'bg-[#8b5cf6]/10 text-[#8b5cf6] border-[#8b5cf6]/20',
};

const MODE_LABEL = { matrix: 'Matriz ISO', frequency: 'Frecuencia', severity: 'Severidad' };

const getThermalClass = (val, max) => {
  if (val === 0) return 'bg-white/[0.03] border-white/[0.06] text-[#62666d]';
  const ratio = val / max;
  if (ratio > 0.75) return 'bg-[#ef4444]/20 border-[#ef4444]/40 text-[#ef4444] hover:bg-[#ef4444]/30';
  if (ratio > 0.45) return 'bg-[#f97316]/20 border-[#f97316]/40 text-[#f97316] hover:bg-[#f97316]/30';
  if (ratio > 0.2)  return 'bg-[#eab308]/15 border-[#eab308]/30 text-[#eab308] hover:bg-[#eab308]/25';
  return 'bg-[#06b6d4]/15 border-[#06b6d4]/30 text-[#06b6d4] hover:bg-[#06b6d4]/25';
};

const getClsVariant = (cls) => {
  switch (cls) {
    case 'Crítico': return 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20';
    case 'Alto':   return 'bg-[#f97316]/10 text-[#f97316] border-[#f97316]/20';
    case 'Medio':  return 'bg-[#eab308]/10 text-[#eab308] border-[#eab308]/20';
    default:        return 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20';
  }
};

// ─── Mock data ─────────────────────────────────────────────────────────────────
const MOCK_RISKS = [
  { id: 1,  code: 'R-001', title: 'Fallo de integración API', p: 4, i: 4, level: 16, cls: 'Crítico', cat: 'Técnico',          status: 'En tratamiento', owner: 'Carlos M.', trend: '↑', updated: '2026-07-10' },
  { id: 2,  code: 'R-002', title: 'Filtración de datos personales', p: 3, i: 5, level: 15, cls: 'Crítico', cat: 'Seguridad', status: 'Mitigado',       owner: 'Laura R.', trend: '↓', updated: '2026-07-08' },
  { id: 3,  code: 'R-003', title: 'Retraso en entrega de sprint', p: 5, i: 3, level: 15, cls: 'Crítico', cat: 'Metodológico',   status: 'En tratamiento', owner: 'Ana P.',    trend: '→', updated: '2026-07-11' },
  { id: 4,  code: 'R-004', title: 'Dependencia de proveedor único', p: 3, i: 4, level: 12, cls: 'Alto',  cat: 'Operativo',      status: 'Identificado',   owner: 'Miguel T.', trend: '↑', updated: '2026-07-05' },
  { id: 5,  code: 'R-005', title: 'Vulnerabilidad XSS en portal', p: 2, i: 5, level: 10, cls: 'Alto',   cat: 'Seguridad',      status: 'Mitigado',       owner: 'Carlos M.', trend: '↓', updated: '2026-07-09' },
  { id: 6,  code: 'R-006', title: 'Incumplimiento regulatorio GDPR', p: 2, i: 4, level: 8, cls: 'Alto', cat: 'Legal',          status: 'Analizado',     owner: 'Laura R.', trend: '→', updated: '2026-07-07' },
  { id: 7,  code: 'R-007', title: 'Fallo en copia de seguridad', p: 3, i: 3, level: 9, cls: 'Medio',    cat: 'Técnico',        status: 'En tratamiento', owner: 'Miguel T.', trend: '→', updated: '2026-07-12' },
  { id: 8,  code: 'R-008', title: 'Obsolescencia de biblioteca UI', p: 4, i: 2, level: 8, cls: 'Alto',  cat: 'Técnico',        status: 'Identificado',   owner: 'Ana P.',    trend: '↑', updated: '2026-07-04' },
  { id: 9,  code: 'R-009', title: 'Fuga de talento técnico', p: 3, i: 2, level: 6, cls: 'Medio',       cat: 'Organizacional',  status: 'Identificado',   owner: 'Miguel T.', trend: '↑', updated: '2026-07-06' },
  { id: 10, code: 'R-010', title: 'Escalado de costos en nube', p: 2, i: 3, level: 6, cls: 'Medio',   cat: 'Operativo',      status: 'Mitigado',       owner: 'Laura R.', trend: '↓', updated: '2026-07-03' },
  { id: 11, code: 'R-011', title: 'Baja adopción por usuarios', p: 2, i: 2, level: 4, cls: 'Bajo',      cat: 'Usabilidad',      status: 'Analizado',     owner: 'Ana P.',    trend: '→', updated: '2026-07-02' },
  { id: 12, code: 'R-012', title: 'Fallo en servicio de notificaciones', p: 1, i: 3, level: 3, cls: 'Bajo', cat: 'Técnico',   status: 'Mitigado',       owner: 'Carlos M.', trend: '↓', updated: '2026-07-01' },
  { id: 13, code: 'R-013', title: 'Incidente de denegación de servicio', p: 2, i: 5, level: 10, cls: 'Alto', cat: 'Seguridad',  status: 'Mitigado',       owner: 'Carlos M.', trend: '↓', updated: '2026-07-10' },
  { id: 14, code: 'R-014', title: 'Cambio regulatorio inesperado', p: 2, i: 4, level: 8, cls: 'Alto',   cat: 'Legal',           status: 'Identificado',   owner: 'Laura R.', trend: '↑', updated: '2026-07-11' },
  { id: 15, code: 'R-015', title: 'Degradación de rendimiento API', p: 3, i: 2, level: 6, cls: 'Medio', cat: 'Rendimiento',    status: 'Mitigado',       owner: 'Miguel T.', trend: '↓', updated: '2026-07-09' },
];

// ─── Trend icon ───────────────────────────────────────────────────────────────
const TrendIcon = ({ t }) => {
  if (t === '↑') return <TrendingUp size={12} className="text-[#ef4444]" />;
  if (t === '↓') return <TrendingDown size={12} className="text-[#10b981]" />;
  return <Minus size={12} className="text-[#8a8f98]" />;
};

// ─── Status style ──────────────────────────────────────────────────────────────
const STATUS_STYLE = {
  'Mitigado':       'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/25',
  'En tratamiento': 'bg-[#f97316]/15 text-[#f97316] border-[#f97316]/25',
  'Identificado':   'bg-[#3b82f6]/15 text-[#3b82f6] border-[#3b82f6]/25',
  'Analizado':      'bg-[#8b5cf6]/15 text-[#8b5cf6] border-[#8b5cf6]/25',
  'Aceptado':       'bg-[#eab308]/15 text-[#eab308] border-[#eab308]/25',
  'Cerrado':        'bg-[#6b7280]/15 text-[#6b7280] border-[#6b7280]/25',
};

const STATUS_ICON = {
  'Mitigado':       <CheckCircle2 size={11} />,
  'En tratamiento': <Activity size={11} />,
  'Identificado':   <Radio size={11} />,
  'Analizado':      <BarChart3 size={11} />,
  'Aceptado':       <AlertTriangle size={11} />,
  'Cerrado':        <Clock size={11} />,
};

// ─── SVG Sparkline ───────────────────────────────────────────────────────────
function Sparkline({ data = [], color = '#10b981', w = 68, h = 26 }) {
  if (!data.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');
  const lastX = w;
  const lastY = h - ((data[data.length - 1] - min) / range) * h;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible select-none pointer-events-none">
      <defs>
        <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polyline points={`0,${h} ${pts} ${w},${h}`} fill={`url(#grad-${color.replace('#','')})`} stroke="none" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r={2} fill={color} />
    </svg>
  );
}

const METRIC_TINTS = {
  blue:   { color: '#3b82f6', bg: 'bg-[#3b82f6]/10' },
  red:    { color: '#ef4444', bg: 'bg-[#ef4444]/10' },
  orange: { color: '#f97316', bg: 'bg-[#f97316]/10' },
  green:  { color: '#10b981', bg: 'bg-[#10b981]/10' },
  yellow: { color: '#eab308', bg: 'bg-[#eab308]/10' },
  pink:   { color: '#ec4899', bg: 'bg-[#ec4899]/10' },
};

// ─── Metric Card ──────────────────────────────────────────────────────────────
function MetricCard({ icon: Icon, label, value, sub, tintKey, spark }) {
  const t = METRIC_TINTS[tintKey] || METRIC_TINTS.blue;
  return (
    <div className="module-card module-card-pad">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-widest text-[#8a8f98] font-bold">{label}</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-white font-mono leading-none">
              {value}
            </span>
            {sub && <span className="text-[10px] text-[#62666d]">{sub}</span>}
          </div>
        </div>
        <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border"
          style={{ background: `${t.color}15`, borderColor: `${t.color}30`, color: t.color }}>
          <Icon size={16} />
        </div>
      </div>
      {spark && (
        <div className="mt-4 -mb-1 flex justify-end">
          <Sparkline data={spark} color={t.color} />
        </div>
      )}
    </div>
  );
}

// ─── Exposure Meter ───────────────────────────────────────────────────────────
function ExposureMeter({ level }) {
  const max = 25;
  const pct = (level / max) * 100;
  const color = level >= 15 ? '#ef4444' : level >= 10 ? '#f97316' : level >= 5 ? '#eab308' : '#10b981';
  return (
    <div className="flex items-center gap-3">
      <div className="relative w-full h-2.5 rounded-full bg-white/[0.05] overflow-hidden border border-white/5">
        <div className="absolute left-0 top-0 h-full rounded-full transition-all duration-1000 ease-out"
          style={{ width: `${pct}%`, background: color, boxShadow: `0 0 10px ${color}80` }} />
        {[5, 10, 15, 20, 25].map(n => (
          <div key={n} className="absolute top-0 w-px h-full opacity-30"
            style={{ left: `${(n / max) * 100}%`, background: 'white' }} />
        ))}
      </div>
      <span className="text-sm font-black font-mono shrink-0" style={{ color }}>{level}</span>
    </div>
  );
}

// ─── Risk Node (inside cell) ──────────────────────────────────────────────────
function RiskNode({ risk, isSelected, onClick }) {
  const zone = getCellZone(risk.p, risk.i);
  const isCritical = risk.cls === 'Crítico' || risk.cls === 'Alto';

  return (
    <button
      onClick={() => onClick(risk)}
      className={`relative w-full rounded-xl p-2 text-left transition-all duration-300 cursor-pointer
        border group overflow-hidden
        ${isSelected
          ? 'ring-2 ring-white scale-[1.03] shadow-[0_0_20px_rgba(255,255,255,0.15)]'
          : 'hover:scale-[1.02] hover:shadow-[0_0_12px_rgba(255,255,255,0.08)]'
        }`}
      style={{
        background: `radial-gradient(circle at 30% 30%, ${zone.bg}cc, ${zone.bg}66)`,
        borderColor: `${zone.glow}50`,
        boxShadow: isSelected
          ? `0 0 24px ${zone.glow}40, inset 0 1px 0 rgba(255,255,255,0.1)`
          : `0 0 8px ${zone.glow}20, inset 0 1px 0 rgba(255,255,255,0.05)`,
      }}
    >
      {isCritical && !isSelected && (
        <span className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100"
          style={{
            background: `radial-gradient(circle, ${zone.glow}20 0%, transparent 70%)`,
            animation: 'riskPulse 2s ease-in-out infinite',
          }}
        />
      )}
      <div className="absolute top-0 right-0 w-5 h-5 rounded-bl-full opacity-30"
        style={{ background: `linear-gradient(135deg, ${zone.glow}, transparent)` }} />
      <div className="relative z-10 space-y-1">
        <div className="flex items-start justify-between gap-1">
          <span className="text-[8px] font-mono font-bold opacity-70 leading-tight" style={{ color: zone.text }}>
            {risk.code}
          </span>
          <span className="text-[8px] font-mono font-black leading-tight" style={{ color: zone.glow }}>
            {risk.level}
          </span>
        </div>
        <p className="text-[9px] font-semibold text-white leading-tight line-clamp-2">{risk.title}</p>
        <div className="flex items-center justify-between">
          <span className="text-[7px] opacity-60">{risk.cat}</span>
          <div className="flex items-center gap-0.5">
            <TrendIcon t={risk.trend} />
          </div>
        </div>
      </div>
    </button>
  );
}

// ─── Risk Detail Panel ────────────────────────────────────────────────────────
function RiskDetail({ risk, onClose }) {
  if (!risk) {
    return (
      <div className="h-full flex flex-col justify-center items-center text-center px-6 py-8 space-y-4">
        <div className="w-12 h-12 rounded-full bg-[#1a1d27] border border-white/5 flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.02)]">
          <Shield size={22} className="text-[#8a8f98]" />
        </div>
        <div>
          <p className="text-sm font-bold text-white mb-1">Sin amenaza seleccionada</p>
          <p className="text-[11px] text-[#8a8f98] leading-relaxed max-w-[220px]">
            Selecciona un impulso (blip) de amenaza en el radar para inspeccionar sus controles y plan de respuesta en tiempo real.
          </p>
        </div>
      </div>
    );
  }

  const zone = getCellZone(risk.p, risk.i);
  const catColors = {
    'Técnico': '#3b82f6', 'Funcional': '#8b5cf6', 'Seguridad': '#ef4444',
    'Privacidad': '#ec4899', 'Ético / algorítmico': '#a855f7', 'Operativo': '#f97316',
    'Organizacional': '#06b6d4', 'Metodológico': '#eab308', 'Legal': '#ef4444',
    'Usabilidad': '#10b981', 'Rendimiento': '#f97316', 'Integración': '#6366f1',
  };
  const catColor = catColors[risk.cat] || '#8a8f98';

  const controls = [
    'Firewall WAF configurado',
    'Revisión de código automatizada',
    'Monitoreo de endpoints en tiempo real',
    'Capacitación de seguridad trimestral',
  ];

  return (
    <div className="flex flex-col h-full animate-[slideInRight_0.3s_ease-out]">
      {/* Panel header */}
      <div className="p-4 border-b border-white/5"
        style={{ borderImage: `linear-gradient(90deg, ${zone.glow}60, transparent) 1` }}>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[9px] font-mono font-bold px-2 py-0.5 rounded-full"
                style={{ background: `${zone.glow}20`, color: zone.glow, border: `1px solid ${zone.glow}40` }}>
                {risk.code}
              </span>
              <span className="text-[9px] font-bold px-2 py-0.5 rounded-full"
                style={{ background: `${zone.glow}20`, color: zone.glow, border: `1px solid ${zone.glow}40` }}>
                {risk.cls}
              </span>
            </div>
            <h3 className="text-sm font-bold text-white leading-tight">{risk.title}</h3>
          </div>
          <button onClick={onClose}
            className="shrink-0 w-7 h-7 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-colors">
            <X size={12} className="text-[#8a8f98]" />
          </button>
        </div>

        {/* Status */}
        <div className={`flex items-center gap-1.5 text-[10px] px-2.5 py-1.5 rounded-lg w-fit ${STATUS_STYLE[risk.status] || ''}`}>
          {STATUS_ICON[risk.status] || <Clock size={11} />}
          <span className="font-semibold">{risk.status}</span>
        </div>
      </div>

      {/* Scrollable body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* Category + meta */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[9px] font-bold px-2 py-0.5 rounded-full border"
            style={{ color: catColor, borderColor: `${catColor}40`, background: `${catColor}15` }}>
            {risk.cat}
          </span>
          <span className="text-[9px] text-[#8a8f98] flex items-center gap-1">
            <User size={9} /> {risk.owner}
          </span>
          <span className="text-[9px] text-[#8a8f98] flex items-center gap-1 ml-auto">
            <Calendar size={9} /> {risk.updated}
          </span>
        </div>

        {/* P × I breakdown */}
        <div className="grid grid-cols-2 gap-3">
          {[
            { label: 'Probabilidad', val: risk.p, max: 5, color: '#3b82f6' },
            { label: 'Impacto',       val: risk.i, max: 5, color: '#ef4444' },
          ].map(({ label, val, max, color }) => (
            <div key={label} className="bg-white/[0.03] rounded-xl p-3 border border-white/5">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[9px] uppercase font-bold text-[#8a8f98] tracking-widest">{label}</span>
                <span className="text-[10px] font-black font-mono" style={{ color }}>{val}/{max}</span>
              </div>
              <div className="flex gap-1">
                {[1,2,3,4,5].map(n => (
                  <div key={n} className="flex-1 h-1.5 rounded-full overflow-hidden"
                    style={{
                      background: n <= val ? color : 'rgba(255,255,255,0.06)',
                      boxShadow: n <= val ? `0 0 4px ${color}60` : 'none',
                      transition: 'all 0.3s ease',
                    }}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Exposure score */}
        <div className="relative rounded-xl p-4 border overflow-hidden"
          style={{ borderColor: `${zone.glow}40`, background: `linear-gradient(135deg, ${zone.bg}80, ${zone.bg}30)` }}>
          <div className="absolute inset-0 opacity-10"
            style={{ background: `radial-gradient(circle at 50% 50%, ${zone.glow}, transparent)` }} />
          <div className="relative z-10 text-center">
            <p className="text-[9px] uppercase font-bold text-[#8a8f98] tracking-widest mb-1">Nivel de Exposición</p>
            <p className="text-4xl font-black font-mono" style={{ color: zone.glow, textShadow: `0 0 20px ${zone.glow}80` }}>
              {risk.level}
            </p>
            <p className="text-[10px] mt-1" style={{ color: zone.text }}>{zone.label} · P{risk.p} × I{risk.i}</p>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h4 className="text-[10px] uppercase font-bold text-[#8a8f98] tracking-widest">Descripción</h4>
          <p className="text-[11px] text-[#c4c9d4] leading-relaxed">
            Este riesgo representa una amenaza potencial sobre {risk.cat.toLowerCase()} que puede afectar la operación
            del sistema. Con una probabilidad de {risk.p}/5 e impacto de {risk.i}/5, requiere atención prioritaria
            del equipo de {risk.owner}.
          </p>
        </div>

        {/* Controls */}
        <div className="space-y-2">
          <h4 className="text-[10px] uppercase font-bold text-[#8a8f98] tracking-widest">Controles Existentes</h4>
          <div className="space-y-1.5">
            {controls.slice(0, 3).map((c, i) => (
              <div key={i} className="flex items-center gap-2 text-[10px] text-[#c4c9d4]">
                <CheckCircle2 size={10} className="text-[#10b981] shrink-0" />
                <span>{c}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Inherent vs Residual */}
        <div className="space-y-2">
          <h4 className="text-[10px] uppercase font-bold text-[#8a8f98] tracking-widest">Comparación</h4>
          <div className="grid grid-cols-2 gap-2">
            <div className="bg-[#ef4444]/5 border border-[#ef4444]/15 rounded-xl p-2.5 text-center">
              <p className="text-[8px] uppercase font-bold text-[#ef4444]/70 mb-1">Inherente</p>
              <p className="text-base font-black font-mono text-[#ef4444]">{risk.level}</p>
            </div>
            <div className="bg-[#10b981]/5 border border-[#10b981]/15 rounded-xl p-2.5 text-center">
              <p className="text-[8px] uppercase font-bold text-[#10b981]/70 mb-1">Residual</p>
              <p className="text-base font-black font-mono text-[#10b981]">{Math.max(1, Math.round(risk.level * 0.4))}</p>
            </div>
          </div>
        </div>

        {/* Recommended actions */}
        <div className="space-y-2">
          <h4 className="text-[10px] uppercase font-bold text-[#8a8f98] tracking-widest flex items-center gap-1">
            <Zap size={10} className="text-[#f97316]" /> Acciones Recomendadas
          </h4>
          <div className="space-y-1.5">
            {[
              `Revisar y fortalecer controles de ${risk.cat.toLowerCase()}`,
              'Escalar a Comité de Riesgos si el nivel excede 12',
              'Definir plan de mitigación con owner asignado',
              'Programar revisión en el próximo sprint',
            ].map((a, i) => (
              <div key={i} className="flex items-start gap-2 text-[10px] text-[#c4c9d4]">
                <ChevronRight size={10} className="text-[#f97316] shrink-0 mt-0.5" />
                <span>{a}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Threat Radar Component ──────────────────────────────────────────────────
function ThreatRadar({ risks, selectedRisk, onSelectRisk, groupBy, onToggleGroupBy, sprints }) {
  const [playSweep, setPlaySweep] = useState(true);

  // Get active sectors dynamically
  const sectors = useMemo(() => {
    if (groupBy === 'sprint') {
      const activeSprintIds = Array.from(new Set(risks.map(r => r.sprintId).filter(Boolean)));
      if (activeSprintIds.length === 0) return [{ id: 'general', name: 'General' }];
      return activeSprintIds.map(id => {
        const found = sprints?.find(s => s.id === id);
        return { id, name: found ? found.name : `Sprint ${id}` };
      });
    } else {
      const activeCats = Array.from(new Set(risks.map(r => r.cat || 'Otros')));
      if (activeCats.length === 0) return [{ id: 'general', name: 'General' }];
      return activeCats.map(cat => ({ id: cat, name: cat }));
    }
  }, [risks, groupBy, sprints]);

  // Map each risk to polar coordinates (r, theta) and then to Cartesian (x, y)
  // Radar center is at (250, 250), radius is 220px.
  const blips = useMemo(() => {
    const N = sectors.length;
    const sectorAngle = 360 / N;

    // Group risks by sector id
    const sectorGroups = {};
    sectors.forEach(s => {
      sectorGroups[s.id] = [];
    });

    risks.forEach(r => {
      const sectorId = groupBy === 'sprint' ? (r.sprintId || 'general') : (r.cat || 'Otros');
      if (sectorGroups[sectorId]) {
        sectorGroups[sectorId].push(r);
      } else {
        const firstSector = sectors[0]?.id;
        if (firstSector) sectorGroups[firstSector].push(r);
      }
    });

    const calculated = [];
    sectors.forEach((sec, secIdx) => {
      const groupRisks = sectorGroups[sec.id] || [];
      const numRisks = groupRisks.length;
      
      groupRisks.forEach((r, idx) => {
        // Radial distance (r) based on level (1 - 25)
        const lvl = r.level || 5;
        let baseR = 190;
        if (lvl >= 15) {
          baseR = 30 + ((25 - lvl) / 10) * 30; // 30 to 60
        } else if (lvl >= 10) {
          baseR = 65 + ((14 - lvl) / 4) * 40;  // 65 to 105
        } else if (lvl >= 5) {
          baseR = 115 + ((9 - lvl) / 4) * 45;   // 115 to 160
        } else {
          baseR = 170 + ((4 - lvl) / 3) * 45;   // 170 to 215
        }

        // Add a small jitter to radius based on risk code digits
        const seed = parseInt(String(r.code).replace(/\D/g, ''), 10) || (idx + 1);
        const rJitter = ((seed * 13) % 12) - 6; // -6px to +6px
        const finalR = Math.max(25, Math.min(220, baseR + rJitter));

        // Angle (theta) within the sector
        const pad = N > 1 ? 12 : 5;
        const minAngle = secIdx * sectorAngle + pad;
        const maxAngle = (secIdx + 1) * sectorAngle - pad;

        let theta = minAngle;
        if (numRisks > 1) {
          theta = minAngle + (idx / (numRisks - 1)) * (maxAngle - minAngle);
        } else {
          theta = minAngle + (maxAngle - minAngle) / 2;
        }

        const aJitter = ((seed * 17) % 6) - 3; // -3 to +3 degrees
        const finalTheta = theta + aJitter;

        const rad = (finalTheta - 90) * (Math.PI / 180);
        const x = 250 + finalR * Math.cos(rad);
        const y = 250 + finalR * Math.sin(rad);

        calculated.push({
          risk: r,
          x,
          y,
          r: finalR,
          theta: finalTheta,
        });
      });
    });

    return calculated;
  }, [risks, sectors, groupBy]);

  const zoneHexColors = {
    'Crítico': '#ef4444',
    'Alto':    '#f97316',
    'Medio':   '#eab308',
    'Bajo':    '#10b981',
  };

  return (
    <div className="module-card p-6 flex flex-col items-center w-full">
      {/* Radar header controls */}
      <div className="w-full flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Radio size={14} className={`text-[#06b6d4] ${playSweep ? 'animate-pulse' : ''}`} />
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Radar de Exposición</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-900/60 p-1 border border-white/5 rounded-xl gap-1">
            <button
              onClick={() => onToggleGroupBy('category')}
              className={`text-[9px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                groupBy === 'category'
                  ? 'bg-[#06b6d4]/10 text-[#06b6d4] border-[#06b6d4]/20'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Categorías
            </button>
            <button
              onClick={() => onToggleGroupBy('sprint')}
              className={`text-[9px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer ${
                groupBy === 'sprint'
                  ? 'bg-[#06b6d4]/10 text-[#06b6d4] border-[#06b6d4]/20'
                  : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              Sprints
            </button>
          </div>
          <button
            onClick={() => setPlaySweep(!playSweep)}
            className={`text-[9px] font-bold px-2.5 py-1.5 rounded-xl border transition-all cursor-pointer ${
              playSweep
                ? 'bg-slate-900/60 border-white/10 text-slate-300'
                : 'bg-white/5 border-white/5 text-slate-500'
            }`}
          >
            {playSweep ? 'Pausar Haz' : 'Reanudar Haz'}
          </button>
        </div>
      </div>

      {/* Radar screen container */}
      <div className="relative w-full max-w-[500px] aspect-square rounded-full border border-white/5 bg-[#0b0c15]/60 overflow-hidden shadow-[inset_0_0_40px_rgba(0,0,0,0.8),_0_0_30px_rgba(6,182,212,0.03)] flex items-center justify-center select-none">
        
        {/* Radar Sweep Haz Cono */}
        {playSweep && (
          <div className="absolute inset-0 rounded-full pointer-events-none overflow-hidden"
            style={{
              maskImage: 'radial-gradient(circle, black 30%, transparent 100%)',
              WebkitMaskImage: 'radial-gradient(circle, black 30%, transparent 100%)'
            }}>
            <div className="w-full h-full animate-radar-sweep"
              style={{
                background: 'conic-gradient(from 0deg, rgba(6, 182, 212, 0.08) 0deg, transparent 100deg, transparent 360deg)',
                borderRadius: '50%'
              }}
            />
          </div>
        )}

        {/* Concentric grid lines and zone rings (SVG) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-80" viewBox="0 0 500 500">
          <defs>
            <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.05" />
              <stop offset="60%" stopColor="#0b0c15" stopOpacity="0" />
              <stop offset="100%" stopColor="#0b0c15" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="250" cy="250" r="240" fill="url(#radarGlow)" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          
          {/* Radial grids */}
          <circle cx="250" cy="250" r="220" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" strokeDasharray="3 6" />
          <circle cx="250" cy="250" r="165" fill="none" stroke="rgba(234,179,8,0.04)" strokeWidth="1" strokeDasharray="3 6" />
          <circle cx="250" cy="250" r="110" fill="none" stroke="rgba(249,115,22,0.05)" strokeWidth="1" strokeDasharray="4 8" />
          <circle cx="250" cy="250" r="55" fill="none" stroke="rgba(239,68,68,0.08)" strokeWidth="1.5" strokeDasharray="4 8" />

          {/* Radar target reticle cross */}
          <line x1="250" y1="30" x2="250" y2="470" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
          <line x1="30" y1="250" x2="470" y2="250" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />

          {/* Sector division lines & category headers */}
          {sectors.map((sec, idx) => {
            const N = sectors.length;
            const angle = idx * (360 / N);
            const rad = (angle - 90) * (Math.PI / 180);
            const x2 = 250 + 220 * Math.cos(rad);
            const y2 = 250 + 220 * Math.sin(rad);

            const lineEl = N > 1 ? (
              <line key={`line-${sec.id}`} x1="250" y1="250" x2={x2} y2={y2} stroke="rgba(255,255,255,0.05)" strokeWidth="1.2" strokeDasharray="2 4" />
            ) : null;

            const midAngle = (idx + 0.5) * (360 / N);
            const midRad = (midAngle - 90) * (Math.PI / 180);
            const labelR = 232;
            const tx = 250 + labelR * Math.cos(midRad);
            const ty = 250 + labelR * Math.sin(midRad);

            let rot = midAngle - 90;
            if (midAngle > 90 && midAngle < 270) rot += 180;

            const textEl = (
              <text
                key={`text-${sec.id}`}
                x={tx}
                y={ty}
                transform={`rotate(${rot}, ${tx}, ${ty})`}
                className="text-[8px] font-bold fill-slate-500/80 tracking-widest uppercase font-sans text-center"
                textAnchor="middle"
                dominantBaseline="middle"
              >
                {sec.name.length > 18 ? `${sec.name.substring(0, 16)}..` : sec.name}
              </text>
            );

            return (
              <Fragment key={sec.id}>
                {lineEl}
                {textEl}
              </Fragment>
            );
          })}
        </svg>

        {/* Center hub */}
        <div className="absolute w-4 h-4 rounded-full bg-[#ef4444]/10 border border-[#ef4444]/30 shadow-[0_0_10px_rgba(239,68,68,0.4)] flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-ping" />
        </div>

        {/* Radial rings labels */}
        <div className="absolute top-[215px] left-[254px] text-[7px] font-bold text-[#ef4444] opacity-40 uppercase tracking-widest">Crítico</div>
        <div className="absolute top-[160px] left-[254px] text-[7px] font-bold text-[#f97316] opacity-40 uppercase tracking-widest">Alto</div>
        <div className="absolute top-[105px] left-[254px] text-[7px] font-bold text-[#eab308] opacity-40 uppercase tracking-widest">Medio</div>
        <div className="absolute top-[50px] left-[254px] text-[7px] font-bold text-[#10b981] opacity-40 uppercase tracking-widest">Bajo</div>

        {/* Risk blips */}
        {blips.map(({ risk, x, y }) => {
          const isSelected = selectedRisk?.id === risk.id;
          const zoneColor = zoneHexColors[risk.cls] || '#3b82f6';
          
          return (
            <button
              key={risk.id}
              onClick={() => onSelectRisk(risk)}
              className={`absolute px-2 py-0.5 rounded-full flex items-center gap-1 border text-[9px] font-mono font-bold transition-all duration-300 z-10 cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.5)] ${
                isSelected
                  ? 'bg-white text-slate-900 border-white shadow-[0_0_15px_rgba(255,255,255,0.7)] scale-110 z-20'
                  : 'bg-[#0b0c15]/90 text-slate-300 border-white/10 hover:border-white/25 hover:text-white'
              }`}
              style={{
                left: `${x}px`,
                top: `${y}px`,
                transform: 'translate(-50%, -50%)',
              }}
              title={`${risk.code}: ${risk.title} (Nivel ${risk.level})`}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0 animate-blip-pulse"
                style={{ background: zoneColor, boxShadow: `0 0 6px ${zoneColor}` }} />
              {risk.code}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Category Bar ──────────────────────────────────────────────────────────────
function CategoryBar({ data }) {
  const total = data.reduce((a, b) => a + b.value, 0);
  const colors = ['#3b82f6', '#ef4444', '#f97316', '#10b981', '#8b5cf6', '#06b6d4', '#eab308', '#ec4899'];
  return (
    <div className="module-card module-card-pad flex flex-col justify-between">
      <div>
        <p className="text-[10px] uppercase font-bold text-[#8a8f98] tracking-widest mb-3">Distribución por Categoría</p>
        <div className="flex h-1.5 rounded-full overflow-hidden gap-0.5 mb-4 bg-white/[0.04] border border-white/5">
          {data.map((d, i) => (
            <div key={d.cat} className="transition-all duration-500"
              style={{ width: `${(d.value / total) * 100}%`, background: colors[i % colors.length] }}
              title={`${d.cat}: ${d.value}`}
            />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
          {data.map((d, i) => (
            <div key={d.cat} className="flex items-center gap-1.5 text-[10px] text-[#8a8f98]">
              <span className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse" style={{ background: colors[i % colors.length], boxShadow: `0 0 6px ${colors[i % colors.length]}80` }} />
              <span className="truncate">{d.cat}</span>
              <span className="ml-auto font-mono font-bold text-white">{d.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Critical Ranking ─────────────────────────────────────────────────────────
function CriticalRanking({ risks }) {
  const sorted = [...risks].sort((a, b) => b.level - a.level).slice(0, 5);
  return (
    <div className="module-card module-card-pad flex flex-col justify-between">
      <div>
        <p className="text-[10px] uppercase font-bold text-[#8a8f98] tracking-widest mb-3 flex items-center gap-1.5">
          <AlertTriangle size={11} className="text-[#ef4444]" /> Top Riesgos Críticos
        </p>
        <div className="space-y-2.5">
          {sorted.map((r, i) => {
            const zone = getCellZone(r.p, r.i);
            return (
              <div key={r.id} className="flex items-center gap-2.5 group cursor-pointer">
                <span className="text-[10px] font-mono font-black text-[#62666d] w-4">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[10px] font-semibold text-white truncate">{r.code}</span>
                    <span className="text-[10px] font-black font-mono ml-2" style={{ color: zone.glow }}>{r.level}</span>
                  </div>
                  <div className="h-1 rounded-full overflow-hidden bg-white/[0.05]">
                    <div className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${(r.level / 25) * 100}%`, background: zone.glow }} />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Alerts Panel ──────────────────────────────────────────────────────────────
function AlertsPanel({ risks }) {
  const overdue = risks.filter(r => r.status === 'Identificado');
  const critical = risks.filter(r => r.cls === 'Crítico');
  return (
    <div className="module-card module-card-pad flex flex-col justify-between">
      <div>
        <p className="text-[10px] uppercase font-bold text-[#8a8f98] tracking-widest mb-3 flex items-center gap-1.5">
          <Zap size={11} className="text-[#f97316]" /> Alertas Activas
        </p>
        <div className="space-y-2">
          {critical.length > 0 && (
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/20 shadow-[0_0_12px_rgba(239,68,68,0.05)]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-ping" />
              <span className="text-[10px] text-[#ef4444] font-semibold">
                {critical.length} riesgo(s) Crítico(s) requieren atención
              </span>
            </div>
          )}
          {overdue.length > 0 && (
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#f97316]/10 border border-[#f97316]/20 shadow-[0_0_12px_rgba(249,115,22,0.05)]">
              <div className="w-1.5 h-1.5 rounded-full bg-[#f97316] animate-pulse" />
              <span className="text-[10px] text-[#f97316] font-semibold">
                {overdue.length} sin tratamiento activo
              </span>
            </div>
          )}
          {critical.length === 0 && overdue.length === 0 && (
            <div className="flex items-center gap-2 p-2 rounded-xl bg-[#10b981]/10 border border-[#10b981]/20">
              <CheckCircle2 size={12} className="text-[#10b981]" />
              <span className="text-[10px] text-[#10b981] font-semibold">Sin alertas activas</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Filter Bar ────────────────────────────────────────────────────────────────
function FilterBar({ filters, onChange, onReset }) {
  const [open, setOpen] = useState(false);
  const hasActive = filters.category || filters.status || filters.cls;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-2 text-xs px-3 py-1.5 rounded-xl border transition-all ${
          open ? 'bg-[#06b6d4]/10 text-[#06b6d4] border-[#06b6d4]/30' : 'bg-[#12151e] text-[#8a8f98] border-white/8 hover:border-white/15'
        }`}
      >
        <Layers size={12} />
        Filtros
        {hasActive && <span className="w-1.5 h-1.5 rounded-full bg-[#06b6d4] inline-block" />}
      </button>

      {hasActive && (
        <button onClick={onReset}
          className="flex items-center gap-1 text-[10px] text-[#8a8f98] hover:text-white px-2 py-1 rounded-lg hover:bg-white/5 transition-colors">
          <X size={10} /> Limpiar
        </button>
      )}

      {open && (
        <div className="absolute top-full mt-2 left-0 z-50 bg-[#1a1d27] border border-white/10 rounded-xl p-4 shadow-2xl w-72 animate-[fadeIn_0.2s_ease-out]">
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-[#8a8f98] tracking-widest">Categoría</label>
              <select className="w-full text-xs bg-[#12151e] border border-white/10 rounded-lg px-2.5 py-1.5 text-white focus:outline-none cursor-pointer"
                value={filters.category} onChange={e => onChange('category', e.target.value)}>
                <option value="" className="bg-[#1a1d27] text-white">Todas</option>
                {RISK_CATEGORIES.map(c => <option key={c} value={c} className="bg-[#1a1d27] text-white">{c}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-[#8a8f98] tracking-widest">Estado</label>
              <select className="w-full text-xs bg-[#12151e] border border-white/10 rounded-lg px-2.5 py-1.5 text-white focus:outline-none cursor-pointer"
                value={filters.status} onChange={e => onChange('status', e.target.value)}>
                <option value="" className="bg-[#1a1d27] text-white">Todos</option>
                {RISK_STATUSES.map(s => <option key={s} value={s} className="bg-[#1a1d27] text-white">{s}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] uppercase font-bold text-[#8a8f98] tracking-widest">Clasificación</label>
              <select className="w-full text-xs bg-[#12151e] border border-white/10 rounded-lg px-2.5 py-1.5 text-white focus:outline-none cursor-pointer"
                value={filters.cls} onChange={e => onChange('cls', e.target.value)}>
                <option value="" className="bg-[#1a1d27] text-white">Todas</option>
                {['Crítico','Alto','Medio','Bajo'].map(s => <option key={s} value={s} className="bg-[#1a1d27] text-white">{s}</option>)}
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Legend ───────────────────────────────────────────────────────────────────
function Legend() {
  const items = [
    { zone: 'Bajo',    range: '1–4',   color: '#10b981', bg: 'rgba(16,185,129,0.12)' },
    { zone: 'Medio',   range: '5–9',   color: '#f97316', bg: 'rgba(249,115,22,0.12)' },
    { zone: 'Alto',    range: '10–14', color: '#c026d3', bg: 'rgba(192,38,211,0.12)' },
    { zone: 'Crítico', range: '15–25', color: '#ef4444', bg: 'rgba(239,68,68,0.12)' },
  ];
  return (
    <div className="module-card module-card-pad flex flex-col justify-between">
      <div>
        <p className="text-[10px] uppercase font-bold text-[#8a8f98] tracking-widest mb-3">Escala de Exposición</p>
        <div className="space-y-2.5">
          {items.map(({ zone, range, color, bg }) => (
            <div key={zone} className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[9px] font-black font-mono border"
                style={{ background: bg, color, borderColor: `${color}35`, boxShadow: `0 0 8px ${color}15` }}>
                {zone[0]}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold" style={{ color }}>{zone}</span>
                  <span className="text-[9px] font-mono text-[#62666d]">{range}</span>
                </div>
                <div className="h-1 rounded-full overflow-hidden bg-white/[0.05] mt-1">
                  <div className="h-full rounded-full" style={{ width: `${(parseInt(range.split('–').pop() || range.split('—').pop(), 10) / 25) * 100}%`, background: color }} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-3 pt-3 border-t border-white/5 text-[9px] text-[#62666d] space-y-1">
        <p>Exposición = Probabilidad × Impacto</p>
        <p>Escala: 1–5 para ambos ejes</p>
      </div>
    </div>
  );
}

// ─── Main ──────────────────────────────────────────────────────────────────────
export default function RiskAnalysis() {
  const { activeProjectId, sprints } = useAppStore();
  const [filters, setFilters] = useState({ category: '', status: '', cls: '', sprintId: '' });
  const [hideMitigated, setHideMitigated] = useState(false);
  const [apiRisks, setApiRisks] = useState([]);
  const [selectedRisk, setSelectedRisk] = useState(null);
  const [loading, setLoading] = useState(false);

  // Radar state
  const [radarGroupBy, setRadarGroupBy] = useState('category');

  // ─── Fetch risks from API ──────────────────────────────────────────────────
  const fetchRisks = useCallback(async () => {
    if (!activeProjectId) return;
    setLoading(true);
    try {
      const data = await api.get(`/projects/${activeProjectId}/risks`);
      setApiRisks(data || []);
    } catch (e) {
      console.error(e);
      setApiRisks([]);
    } finally {
      setLoading(false);
    }
  }, [activeProjectId]);

  useEffect(() => {
    fetchRisks();
  }, [fetchRisks]);

  // ─── Unified risk list (API or mock) ───────────────────────────────────────
  const risks = useMemo(() => {
    const list = apiRisks.length > 0 ? apiRisks : MOCK_RISKS;
    return list.map(r => {
      const p = r.probability || r.p || 3;
      const i = r.impact || r.i || 3;
      const lvl = r.level || (p * i);
      return {
        ...r,
        p,
        i,
        probability: p,
        impact: i,
        level: lvl,
        cls: r.classification || r.cls || classificationFromLevel(lvl),
        title: r.name || r.title || 'Riesgo sin título',
        cat: r.category || r.cat || 'Técnico',
        owner: r.owner || 'Admin',
      };
    });
  }, [apiRisks]);

  // ─── Filtered risks ─────────────────────────────────────────────────────────
  const filteredRisks = useMemo(() => {
    return risks.filter((r) => {
      if (filters.category && r.category !== filters.category) return false;
      if (filters.status && r.status !== filters.status) return false;
      if (filters.cls && r.cls !== filters.cls) return false;
      if (hideMitigated && (r.status === 'Mitigado' || r.status === 'Cerrado')) return false;
      return true;
    });
  }, [risks, filters, hideMitigated]);

  // ─── Buckets for matrix mode ────────────────────────────────────────────────
  const buckets = useMemo(() => {
    const b = {};
    filteredRisks.forEach(r => {
      const p = r.probability || r.p || 3;
      const i = r.impact || r.i || 3;
      const key = `${p}-${i}`;
      (b[key] = b[key] || []).push(r);
    });
    return b;
  }, [filteredRisks]);


  // ─── Stats ──────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    const total = filteredRisks.length;
    const critical = filteredRisks.filter(r => (r.cls || classificationFromLevel(r.level)) === 'Crítico').length;
    const high = filteredRisks.filter(r => (r.cls || classificationFromLevel(r.level)) === 'Alto').length;
    const mitigated = filteredRisks.filter(r => r.status === 'Mitigado' || r.status === 'Cerrado').length;
    const avgLevel = total ? Math.round(filteredRisks.reduce((a, r) => a + (r.level || 0), 0) / total) : 0;
    const overdue = filteredRisks.filter(r => r.status === 'Identificado').length;
    const catData = RISK_CATEGORIES
      .map(cat => ({ cat, value: filteredRisks.filter(r => r.category === cat).length }))
      .filter(d => d.value > 0)
      .sort((a, b) => b.value - a.value);
    return { total, critical, high, mitigated, avgLevel, overdue, catData };
  }, [filteredRisks]);

  const mitigatedRate = risks.length
    ? Math.round((risks.filter(r => r.status === 'Mitigado' || r.status === 'Cerrado').length / risks.length) * 100) : 0;

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleFilterChange = (key, value) => {
    setFilters(f => ({ ...f, [key]: value }));
    setSelectedRisk(null);
  };

  const resetFilters = () => setFilters({ category: '', status: '', cls: '', sprintId: '' });

  const handleCellClickMatrix = (p, i, level) => {
    const cellRisks = buckets[`${p}-${i}`] || [];
    setSelectedRisk(cellRisks.length === 1 ? cellRisks[0] : { _cell: true, p, i, level, risks: cellRisks, cls: getZone(level) });
  };

  const handleCellClickHeat = (cell) => {
    if (!cell) return;
    setSelectedRisk(cell.risks?.length === 1 ? cell.risks[0] : { _cell: true, ...cell });
  };

  if (!activeProjectId) {
    return <EmptyState icon={Grid3x3} title="Selecciona un proyecto" description="La matriz de probabilidad × impacto y el mapa de calor se generan a partir de los riesgos del proyecto activo." />;
  }

  return (
    <div className="space-y-6 min-h-screen">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="relative overflow-hidden px-6 pt-6 pb-5">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 right-20 w-96 h-48 rounded-full opacity-10 blur-3xl"
            style={{ background: 'radial-gradient(circle, #06b6d4, transparent)' }} />
          <div className="absolute top-10 right-40 w-64 h-32 rounded-full opacity-5 blur-2xl"
            style={{ background: 'radial-gradient(circle, #ef4444, transparent)' }} />
        </div>

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-2">
              <div className="w-8 h-8 rounded-xl bg-[#06b6d4]/15 border border-[#06b6d4]/30 flex items-center justify-center">
                <Shield size={18} className="text-[#06b6d4]" />
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight">
                Análisis de Riesgos
              </h1>
            </div>
            <p className="text-xs text-[#8a8f98] max-w-lg">
              Centro de mando de riesgos. Monitorea, prioriza y responde a las amenazas en tiempo real.
            </p>
          </div>

          {/* Global exposure meter */}
          <div className="shrink-0 w-72">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] uppercase font-bold text-[#8a8f98] tracking-widest">Nivel Global de Exposición</span>
              <span className={`text-xs font-black font-mono ${
                stats.avgLevel >= 15 ? 'text-[#ef4444]' : stats.avgLevel >= 10 ? 'text-[#f97316]' : stats.avgLevel >= 5 ? 'text-[#eab308]' : 'text-[#10b981]'
              }`}>
                {stats.avgLevel >= 15 ? 'Crítico' : stats.avgLevel >= 10 ? 'Alto' : stats.avgLevel >= 5 ? 'Medio' : 'Bajo'}
              </span>
            </div>
            <ExposureMeter level={stats.avgLevel} />
          </div>
        </div>
      </header>

      {/* ── Metric Cards ───────────────────────────────────────────────────── */}
      <div className="px-6">
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          <MetricCard icon={Activity}   label="Total Riesgos" value={stats.total}    sub="identificados"       tintKey="blue" spark={[3,5,4,6,5,7]} />
          <MetricCard icon={AlertTriangle} label="Críticos"   value={stats.critical} sub="requieren acción"    tintKey="red" spark={[1,2,3,2,4]} />
          <MetricCard icon={TrendingUp} label="Altos"         value={stats.high}       sub="en monitoreo"         tintKey="orange" spark={[2,3,2,4,3]} />
          <MetricCard icon={CheckCircle2} label="Mitigados"  value={stats.mitigated}  sub="cerrados o resueltos" tintKey="green" spark={[2,3,5,4,6]} />
          <MetricCard icon={Layers}     label="Nivel Promedio" value={stats.avgLevel} sub="exposición media"     tintKey="yellow" spark={[7,8,6,9,7]} />
          <MetricCard icon={Clock}      label="Sin Tratar"    value={stats.overdue}   sub="requieren atención"   tintKey="pink" spark={[1,2,1,3,2]} />
        </div>
      </div>

      {/* ── Section Header ───────────────────────────────────────────────── */}
      <div className="px-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-sm font-bold text-white tracking-wide uppercase">
              Radar Cyberpunk de Amenazas
            </h2>
            <p className="text-[10px] text-[#8a8f98] mt-0.5">
              {filteredRisks.length} riesgo(s) activos filtrados · Haz clic en un blip para ver detalles
            </p>
          </div>
          <div className="flex items-center gap-3">
            {loading && <RefreshCw size={14} className="text-[#8a8f98] animate-spin" />}
          </div>
        </div>
      </div>

      {/* ── Main content area ─────────────────────────────────────────────── */}
      <div className="px-6 pb-8">
        <div className="flex flex-col lg:flex-row gap-6 items-stretch">

          {/* Left: Interactive Radar + Filters + widgets */}
          <div className="flex-1 min-w-0 flex flex-col gap-6">
            
            {/* Filters Bar */}
            <div className="flex items-center justify-between gap-3 flex-wrap bg-slate-950/20 p-2.5 rounded-2xl border border-white/5">
              <FilterBar filters={filters} onChange={handleFilterChange} onReset={resetFilters} />
              <button
                onClick={() => setHideMitigated(!hideMitigated)}
                className={`flex items-center gap-1.5 text-xs px-3.5 py-2 rounded-xl border transition-all cursor-pointer ${
                  hideMitigated
                    ? 'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30 hover:bg-[#10b981]/25'
                    : 'bg-slate-900/40 text-[#8a8f98] border-white/10 hover:border-white/20 hover:text-white'
                }`}
              >
                {hideMitigated ? <EyeOff size={12} /> : <Eye size={12} />}
                <span>{hideMitigated ? 'Ocultando Mitigados' : 'Mostrar Todos'}</span>
              </button>
            </div>

            {/* Radar Container */}
            <ThreatRadar
              risks={filteredRisks}
              selectedRisk={selectedRisk}
              onSelectRisk={setSelectedRisk}
              groupBy={radarGroupBy}
              onToggleGroupBy={setRadarGroupBy}
              sprints={sprints}
            />

            {/* Bottom Widgets */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Legend />
              <CategoryBar data={stats.catData} />
              <AlertsPanel risks={filteredRisks} />
            </div>

          </div>

          {/* Right: Side Panel (Selected Risk Detail or Radar Stats) */}
          <div className="w-full lg:w-80 shrink-0">
            <div className="module-card overflow-hidden flex flex-col h-full">
              <div className="p-4 border-b border-white/10 flex items-center gap-1.5 bg-slate-900/20">
                <Sparkles size={13} className="text-[#8b5cf6]" />
                <h2 className="text-xs font-bold text-[#8a8f98] uppercase tracking-widest">
                  Detalle del Riesgo
                </h2>
              </div>
              <div className="flex-1 overflow-y-auto">
                <RiskDetail risk={selectedRisk} onClose={() => setSelectedRisk(null)} />
              </div>
            </div>
          </div>

        </div>
      </div>

      <style>{`
        @keyframes radar-sweep {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-radar-sweep {
          animation: radar-sweep 12s linear infinite;
        }
        @keyframes blip-pulse {
          0%, 100% { opacity: 0.7; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.25); }
        }
        .animate-blip-pulse {
          animation: blip-pulse 1.8s infinite ease-in-out;
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

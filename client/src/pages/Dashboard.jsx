import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, CheckCircle2, Clock, Flame, ShieldAlert, AlertCircle,
  Activity, ArrowRight, TrendingUp, TrendingDown, Minus, Zap, Target,
  ChevronRight, Layers, BarChart2, PieChart as PieChartIcon, GitBranch,
  ArrowUpRight, ArrowDownRight, Timer, XCircle, RefreshCw, Search, Bell,
  ShoppingCart, Users, Package, StickyNote, ShieldX, Filter, Calendar, Download,
  ArrowUp, ArrowDown, MoreHorizontal, ListChecks, FileText,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, ResponsiveContainer,
  Tooltip, Legend, AreaChart, Area, LineChart, Line, CartesianGrid,
} from 'recharts';
import { api } from '@/services/api';
import { useAppStore } from '@/store/useAppStore';
import EmptyState from '@/components/EmptyState';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

// ─── Color palette (semantic dashboard) ─────────────────────────────────────
const METRIC_TINTS = {
  sales:     { color: '#10b981', soft: 'rgba(16,185,129,0.12)',  label: 'Mitigados'   },
  customers: { color: '#3b82f6', soft: 'rgba(59,130,246,0.12)',  label: 'Riesgos'     },
  products:  { color: '#8b5cf6', soft: 'rgba(139,92,246,0.12)',  label: 'Recientes'   },
  notes:     { color: '#f97316', soft: 'rgba(249,115,22,0.12)',  label: 'Altos'       },
  alerts:    { color: '#ef4444', soft: 'rgba(239,68,68,0.12)',   label: 'Críticos'    },
};
const LEVEL_COLORS = { Bajo: '#10b981', Medio: '#eab308', Alto: '#f97316', 'Crítico': '#ef4444' };

// ─── Animated counter ────────────────────────────────────────────────────────
function AnimatedNumber({ value, duration = 800 }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);
  useEffect(() => {
    const start = 0;
    const end = value || 0;
    const startTime = performance.now();
    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(start + (end - start) * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);
  return <>{display.toLocaleString('es-PE')}</>;
}

// ─── Sparkline mini chart ───────────────────────────────────────────────────
function Sparkline({ data = [], color = '#10b981', w = 80, h = 32 }) {
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
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <defs>
        <linearGradient id={`grad-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polyline points={`0,${h} ${pts} ${w},${h}`} fill={`url(#grad-${color.replace('#','')})`} stroke="none" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lastX} cy={lastY} r={2.5} fill={color} />
    </svg>
  );
}

// ─── Trend badge (with up/down) ─────────────────────────────────────────────
function TrendBadge({ delta = 0, suffix = '%' }) {
  if (delta === 0) {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] text-slate-500 font-medium">
        <Minus size={11} /> 0{suffix}
      </span>
    );
  }
  const up = delta > 0;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold ${up ? 'text-emerald-400' : 'text-rose-400'}`}>
      {up ? <ArrowUp size={11} /> : <ArrowDown size={11} />}
      {Math.abs(delta)}{suffix}
    </span>
  );
}

// ─── Modular MetricCard (5-tint variant) ────────────────────────────────────
function MetricCard({ tint = 'sales', title, value, sub, icon: Icon, trend, sparkData }) {
  const t = METRIC_TINTS[tint];
  return (
    <div className={`module-card module-card-pad tint-${tint}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] uppercase tracking-widest text-slate-400 font-semibold">{title}</p>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl md:text-[28px] font-semibold text-slate-50 tabular-nums leading-none">
              <AnimatedNumber value={value} />
            </span>
            {sub && <span className="text-[12px] text-slate-500">{sub}</span>}
          </div>
          {trend !== undefined && (
            <div className="mt-2 flex items-center gap-2">
              <TrendBadge delta={trend} />
              <span className="text-[10.5px] text-slate-500">vs. mes anterior</span>
            </div>
          )}
        </div>
        <div className={`icon-tile icon-tile-${tint} shrink-0`}>
          <Icon size={18} />
        </div>
      </div>
      {sparkData && (
        <div className="mt-4 -mb-1">
          <Sparkline data={sparkData} color={t.color} />
        </div>
      )}
    </div>
  );
}

// ─── Quick action item ──────────────────────────────────────────────────────
function QuickAction({ icon: Icon, label, count, color = 'indigo', to, onClick }) {
  const content = (
    <>
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-${color}-500/10 text-${color}-400 shrink-0 group-hover:scale-105 group-hover:bg-${color}-500/20 group-hover:text-${color}-300 transition-all duration-200`}>
        <Icon size={15} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-200 group-hover:text-slate-100 transition-colors truncate">{label}</p>
      </div>
      {count !== undefined && (
        <span className="text-[11px] font-semibold text-slate-400 bg-white/5 group-hover:bg-white/10 group-hover:text-slate-200 px-2 py-0.5 rounded-full transition-all">
          {count}
        </span>
      )}
    </>
  );

  const className = "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/[0.04] active:bg-white/[0.08] border border-transparent hover:border-white/[0.04] transition-all duration-200 group text-left";

  if (to) {
    return (
      <Link to={to} className={className}>
        {content}
      </Link>
    );
  }

  return (
    <button onClick={onClick} className={className}>
      {content}
    </button>
  );
}

// ─── Critical stock item ────────────────────────────────────────────────────
function StockItem({ name, code, level, qty, status }) {
  const colors = {
    low:    { dot: 'bg-rose-500',   text: 'text-rose-300',   bg: 'bg-rose-500/10' },
    medium: { dot: 'bg-amber-500',  text: 'text-amber-300',  bg: 'bg-amber-500/10' },
    ok:     { dot: 'bg-emerald-500',text: 'text-emerald-300',bg: 'bg-emerald-500/10' },
  };
  const c = colors[status] || colors.low;
  return (
    <div className="flex items-center gap-3 py-2.5 px-3 rounded-lg hover:bg-white/[0.03] transition-colors">
      <span className={`w-2 h-2 rounded-full ${c.dot} shrink-0`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-100 truncate">{name}</p>
        <p className="text-[10.5px] text-slate-500 font-mono">{code} · Stock: {qty}</p>
      </div>
      <span className={`text-[10.5px] font-semibold px-2 py-0.5 rounded-full ${c.bg} ${c.text} uppercase tracking-wide`}>
        {level}
      </span>
    </div>
  );
}

// ─── Skeleton ───────────────────────────────────────────────────────────────
function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-[124px] rounded-2xl" />)}
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <Skeleton className="h-80 rounded-2xl lg:col-span-2" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </div>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────
export default function Dashboard() {
  const { activeProjectId, projects } = useAppStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('30d');

  const activeProject = projects?.find((p) => p.id === activeProjectId);

  const handleExportCSV = async () => {
    if (!activeProjectId) return;
    try {
      const risks = await api.get(`/projects/${activeProjectId}/risks`);
      if (!risks || !risks.length) {
        alert('No hay riesgos registrados en este proyecto para exportar.');
        return;
      }
      
      const headers = ['Código', 'Título', 'Descripción', 'Categoría', 'Probabilidad', 'Impacto', 'Nivel', 'Clasificación', 'Estado', 'Responsable', 'Estrategia', 'Acción'];
      const rows = risks.map(r => [
        r.code || '',
        r.title || '',
        r.description || '',
        r.category || '',
        r.probability || '',
        r.impact || '',
        r.level || '',
        r.classification || '',
        r.status || '',
        r.owner || '',
        r.strategy || '',
        r.action || ''
      ]);
      
      const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
        + [headers.join(','), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))].join('\n');
      
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      const prjName = activeProject?.name ? activeProject.name.replace(/\s+/g, '_').toLowerCase() : activeProjectId;
      link.setAttribute("download", `reporte_riesgos_${prjName}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (e) {
      alert('Error al exportar reporte: ' + e.message);
    }
  };

  useEffect(() => {
    if (!activeProjectId) return;
    setLoading(true);
    api.get(`/dashboard/${activeProjectId}`)
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, [activeProjectId]);

  if (!activeProjectId) {
    return <EmptyState icon={Flame} title="Selecciona un proyecto" description="Crea o elige un proyecto en la barra superior." />;
  }
  if (loading) return <SkeletonDashboard />;
  if (error) {
    return (
      <div className="module-card module-card-pad border-rose-500/30">
        <p className="text-rose-400 text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </p>
      </div>
    );
  }
  if (!data) return null;

  const totalInTreatment = data.inTreatmentRisks || 0;
  const criticalRate = data.totalRisks ? ((data.criticalRisks / data.totalRisks) * 100).toFixed(1) : 0;
  const mitigationRate = data.totalRisks ? ((data.mitigatedRisks / data.totalRisks) * 100).toFixed(1) : 0;

  // Synthetic trend series for the metric sparklines (deterministic from counts)
  const trendSales     = [12, 19, 14, 22, 26, 31, 28, 34, data.mitigatedRisks];
  const trendCustomers = [8, 11, 14, 18, 17, 22, 26, 29, data.totalRisks];
  const trendProducts  = [42, 48, 51, 47, 53, 58, 62, 64, data.recentRisks?.length || 0];
  const trendNotes     = [3, 5, 4, 7, 6, 8, 11, 9, data.highRisks];
  const trendAlerts    = [data.criticalRisks, data.criticalRisks + 1, data.criticalRisks - 1, data.criticalRisks + 2, data.criticalRisks];

  // Sales trend chart data (last 8 periods)
  const sprintTrend = data?.sprintTrend || [];

  return (
    <div className="space-y-6">
      {/* ── Page header with filters ── */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Flame size={16} className="text-indigo-400" />
            <span className="text-[11px] text-slate-400 font-mono uppercase tracking-widest">
              {activeProject?.name}
            </span>
          </div>
          <h1 className="text-[26px] font-semibold text-slate-50 tracking-tight">
            Resumen de Riesgos
          </h1>
          <p className="text-[13px] text-slate-400 mt-1">
            ISO 31000 — Gestión integral de riesgos del proyecto
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setPeriod('7d')}
            className={`filter-chip ${period === '7d' ? 'filter-chip-active' : ''}`}
          >
            7 días
          </button>
          <button
            onClick={() => setPeriod('30d')}
            className={`filter-chip ${period === '30d' ? 'filter-chip-active' : ''}`}
          >
            30 días
          </button>
          <button
            onClick={() => setPeriod('90d')}
            className={`filter-chip ${period === '90d' ? 'filter-chip-active' : ''}`}
          >
            90 días
          </button>
          <button className="filter-chip gap-1.5">
            <Calendar size={12} /> Personalizado
          </button>
          <Button onClick={handleExportCSV} variant="outline" size="sm" className="h-8 text-xs gap-1.5 border-white/10 ml-1">
            <Download size={13} /> Exportar
          </Button>
        </div>
      </div>

      {/* ── KPI Row: 5 modular metric cards (semantic tints) ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <MetricCard
          tint="sales"
          title="Riesgos Mitigados"
          value={data.mitigatedRisks}
          sub={`${mitigationRate}%`}
          icon={CheckCircle2}
          trend={12}
          sparkData={trendSales}
        />
        <MetricCard
          tint="customers"
          title="Total Riesgos"
          value={data.totalRisks}
          sub="activos"
          icon={AlertTriangle}
          trend={8}
          sparkData={trendCustomers}
        />
        <MetricCard
          tint="products"
          title="Riesgos Recientes"
          value={data.recentRisks?.length || 0}
          sub="recientes"
          icon={Clock}
          trend={-3}
          sparkData={trendProducts}
        />
        <MetricCard
          tint="notes"
          title="Riesgos Altos"
          value={data.highRisks}
          sub="requieren plan"
          icon={AlertCircle}
          trend={5}
          sparkData={trendNotes}
        />
        <MetricCard
          tint="alerts"
          title="Riesgos Críticos"
          value={data.criticalRisks}
          sub={`${criticalRate}%`}
          icon={ShieldAlert}
          trend={-2}
          sparkData={trendAlerts}
        />
      </div>

      {/* ── Main grid: chart (8 cols) + side panels (4 cols) ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ── LEFT: Sprint trend chart ── */}
        <div className="lg:col-span-8 space-y-4">
          <div className="module-card module-card-pad-lg">
            <div className="flex items-start justify-between mb-1">
              <div>
                <h2 className="text-base font-semibold text-slate-50">Tendencia de riesgos</h2>
                <p className="text-xs text-slate-500 mt-0.5">Evolución de riesgos tratados en los últimos 8 sprints</p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500" /> Mitigados
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-sm bg-violet-500" /> Críticos
                </span>
              </div>
            </div>
            <div className="mt-4 h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sprintTrend} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="g-mitigados" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#6366f1" stopOpacity={0.35} />
                      <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="g-criticos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.30} />
                      <stop offset="100%" stopColor="#8b5cf6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(148,163,184,0.08)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(15, 23, 42, 0.95)',
                      border: '1px solid rgba(148,163,184,0.15)',
                      borderRadius: 10,
                      fontSize: 12,
                      color: '#f1f5f9',
                    }}
                    labelStyle={{ color: '#94a3b8' }}
                  />
                  <Area type="monotone" dataKey="mitigados" name="Mitigados" stroke="#6366f1" strokeWidth={2.5} fill="url(#g-mitigados)" />
                  <Area type="monotone" dataKey="criticos" name="Críticos" stroke="#8b5cf6" strokeWidth={2.5} fill="url(#g-criticos)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* ── Top critical risks table ── */}
          <div className="module-card module-card-pad-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-slate-50">Riesgos Críticos Recientes</h2>
              <Link to="/risks" className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1">
                Ver todos <ChevronRight size={12} />
              </Link>
            </div>
            <div className="space-y-2">
              {(data.recentRisks || []).slice(0, 5).map((r) => {
                const lvl = (r.probability || 1) * (r.impact || 1);
                const color = lvl >= 15 ? '#ef4444' : lvl >= 10 ? '#f97316' : lvl >= 5 ? '#eab308' : '#10b981';
                return (
                  <Link
                    key={r.id}
                    to={`/risks?id=${r.id}`}
                    className="flex items-center gap-3 p-3 rounded-lg hover:bg-white/[0.04] transition-colors group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: color }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-100 truncate group-hover:text-white">{r.name || r.title}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{r.code} · {r.category || 'General'}</p>
                    </div>
                    <span className="text-[10.5px] font-semibold text-slate-400 px-2 py-0.5 rounded-full bg-white/5 capitalize">
                      {r.status || 'Abierto'}
                    </span>
                    <ChevronRight size={14} className="text-slate-600 group-hover:text-slate-400" />
                  </Link>
                );
              })}
              {!(data.recentRisks || []).length && (
                <p className="text-sm text-slate-500 text-center py-6">Sin riesgos recientes</p>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Quick actions + Critical stock ── */}
        <div className="lg:col-span-4 space-y-4">
          {/* Quick actions panel */}
          <div className="module-card module-card-pad-lg">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-slate-50">Acciones rápidas</h2>
              <button className="text-slate-500 hover:text-slate-300 transition-colors">
                <MoreHorizontal size={16} />
              </button>
            </div>
            <div className="space-y-1">
              <QuickAction icon={Zap} label="Nuevo riesgo" to="/risks?new=true" color="emerald" />
              <QuickAction icon={ListChecks} label="Plan de tratamiento" count={totalInTreatment} to="/treatment" color="violet" />
              <QuickAction icon={Activity} label="Revisar sprint activo" to="/sprints" color="amber" />
              <QuickAction icon={FileText} label="Generar reporte" onClick={handleExportCSV} color="blue" />
              <QuickAction icon={Users} label="Gestionar stakeholders" count={data.stakeholdersCount || 0} to="/stakeholders" color="indigo" />
            </div>
          </div>

          {/* Critical stock / critical alerts panel */}
          <div className="module-card module-card-pad-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-base font-semibold text-slate-50">Stock crítico</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Riesgos que requieren atención</p>
              </div>
              <Link to="/risks" className="text-xs text-rose-400 hover:text-rose-300 font-medium">
                Ver
              </Link>
            </div>
            <div className="space-y-0.5">
              <StockItem name="Caída del chatbot NLP" code="R-001" level="Crítico" qty={data.criticalRisks} status="low" />
              <StockItem name="Sobrecostos AWS" code="R-007" level="Alto" qty={data.highRisks} status="medium" />
              <StockItem name="Rotación de personal" code="R-012" level="Medio" qty={data.mediumRisks} status="medium" />
              <StockItem name="Falla en base de datos" code="R-018" level="Crítico" qty={data.criticalRisks} status="low" />
            </div>
          </div>

          {/* Treatment donut (compact) */}
          <div className="module-card module-card-pad-lg">
            <div className="flex items-center justify-between mb-4.5">
              <div>
                <h2 className="text-base font-semibold text-slate-50">Estado de tratamiento</h2>
                <p className="text-[11px] text-slate-500 mt-0.5">Avance de mitigación y contingencia</p>
              </div>
            </div>
            
            {(() => {
              const totalTreatment = (data.mitigatedRisks || 0) + (totalInTreatment || 0) + (data.pendingRisks || 0);
              const mitigatedPct = totalTreatment ? Math.round((data.mitigatedRisks / totalTreatment) * 100) : 0;
              const inTreatmentPct = totalTreatment ? Math.round((totalInTreatment / totalTreatment) * 100) : 0;
              const pendingPct = totalTreatment ? Math.round((data.pendingRisks / totalTreatment) * 100) : 0;

              return (
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  {/* Donut Container */}
                  <div className="relative w-[130px] h-[130px] shrink-0">
                    {/* Centered label */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xl font-bold font-mono text-white leading-none">
                        {totalTreatment > 0 ? `${mitigatedPct}%` : (data.totalRisks || 0)}
                      </span>
                      <span className="text-[8px] uppercase tracking-widest text-slate-500 font-bold mt-1.5">
                        {totalTreatment > 0 ? 'Mitigados' : 'Total'}
                      </span>
                    </div>

                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={
                            totalTreatment > 0 ? [
                              { name: 'Mitigados',  value: data.mitigatedRisks || 0 },
                              { name: 'En proceso', value: totalInTreatment || 0 },
                              { name: 'Pendientes', value: data.pendingRisks || 0 },
                            ] : [
                              { name: 'Sin datos', value: 1 }
                            ]
                          }
                          dataKey="value"
                          innerRadius={40}
                          outerRadius={52}
                          paddingAngle={totalTreatment > 0 ? 4 : 0}
                          strokeWidth={totalTreatment > 0 ? 2 : 0}
                          stroke="#090d1a" // matches dark surface background
                          startAngle={90}
                          endAngle={-270}
                        >
                          {totalTreatment > 0 ? (
                            [
                              <Cell key="cell-0" fill="#10b981" className="transition-all duration-300" />,
                              <Cell key="cell-1" fill="#8b5cf6" className="transition-all duration-300" />,
                              <Cell key="cell-2" fill="#f59e0b" className="transition-all duration-300" />
                            ]
                          ) : (
                            <Cell key="cell-fallback" fill="#1e293b" />
                          )}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Rich legend list with progress bars */}
                  <div className="flex-1 w-full space-y-3.5">
                    <Link to="/risks?status=Mitigado" className="block space-y-1 group">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2 text-slate-300 group-hover:text-emerald-400 transition-colors">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" /> Mitigados
                        </span>
                        <span className="font-mono font-bold text-slate-100 group-hover:text-white transition-colors">{data.mitigatedRisks} <span className="text-[9px] text-slate-500">({mitigatedPct}%)</span></span>
                      </div>
                      <div className="w-full bg-slate-950/60 h-1.5 rounded-full overflow-hidden border border-white/5 group-hover:border-emerald-500/20 transition-colors">
                        <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${mitigatedPct}%` }} />
                      </div>
                    </Link>

                    <Link to="/risks?status=En+tratamiento" className="block space-y-1 group">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2 text-slate-300 group-hover:text-violet-400 transition-colors">
                          <span className="w-2.5 h-2.5 rounded-full bg-violet-500 shadow-[0_0_8px_rgba(139,92,246,0.4)]" /> En proceso
                        </span>
                        <span className="font-mono font-bold text-slate-100 group-hover:text-white transition-colors">{totalInTreatment} <span className="text-[9px] text-slate-500">({inTreatmentPct}%)</span></span>
                      </div>
                      <div className="w-full bg-slate-950/60 h-1.5 rounded-full overflow-hidden border border-white/5 group-hover:border-violet-500/20 transition-colors">
                        <div className="bg-violet-500 h-full rounded-full transition-all duration-500" style={{ width: `${inTreatmentPct}%` }} />
                      </div>
                    </Link>

                    <Link to="/risks?status=Identificado" className="block space-y-1 group">
                      <div className="flex items-center justify-between text-xs">
                        <span className="flex items-center gap-2 text-slate-300 group-hover:text-amber-400 transition-colors">
                          <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]" /> Pendientes
                        </span>
                        <span className="font-mono font-bold text-slate-100 group-hover:text-white transition-colors">{data.pendingRisks} <span className="text-[9px] text-slate-500">({pendingPct}%)</span></span>
                      </div>
                      <div className="w-full bg-slate-950/60 h-1.5 rounded-full overflow-hidden border border-white/5 group-hover:border-amber-500/20 transition-colors">
                        <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${pendingPct}%` }} />
                      </div>
                    </Link>
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, CheckCircle2, Clock, Flame, ShieldAlert, AlertCircle,
  Activity, ArrowRight, TrendingUp, TrendingDown, Minus, Zap, Target,
  ChevronRight, Layers, BarChart2, PieChart as PieChartIcon, GitBranch,
  ArrowUpRight, ArrowDownRight, Timer, XCircle, RefreshCw, Search, Bell,
  Users, Package, StickyNote, ShieldX, Filter, Calendar, Download,
  ArrowUp, ArrowDown, MoreHorizontal, ListChecks, FileText, Hexagon, ChevronLeft,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, ResponsiveContainer,
  Tooltip, Legend, AreaChart, Area, LineChart, Line, CartesianGrid,
} from 'recharts';
import { api } from '@/services/api';
import { useAppStore } from '@/store/useAppStore';
import EmptyState from '@/components/EmptyState';
import MetricCard from '@/components/MetricCard';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import RiskBadge from '@/components/RiskBadge';
import * as XLSX from 'xlsx';

// ─── Risk level helpers ────────────────────────────────────────────────────────
const LEVEL_COLORS = {
  'Crítico': { solid: '#f43f5e', soft: 'rgba(244,63,94,0.12)',  border: 'rgba(244,63,94,0.25)',  text: '#fca5a5' },
  'Alto':    { solid: '#f97316', soft: 'rgba(249,115,22,0.12)', border: 'rgba(249,115,22,0.25)', text: '#fdba74' },
  'Medio':   { solid: '#f59e0b', soft: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', text: '#fcd34d' },
  'Bajo':    { solid: '#22c55e', soft: 'rgba(34,197,94,0.12)',  border: 'rgba(34,197,94,0.25)',  text: '#86efac' },
};

// ─── Animated counter ─────────────────────────────────────────────────────────
function AnimatedNumber({ value, duration = 800 }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);
  useEffect(() => {
    const end = value || 0;
    const startTime = performance.now();
    const animate = (now) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(end * eased));
      if (progress < 1) rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value, duration]);
  return <>{display.toLocaleString('es-PE')}</>;
}

// ─── Mini sparkline ────────────────────────────────────────────────────────────
function Sparkline({ data = [], color = '#a78bfa', w = 80, h = 28 }) {
  if (!data.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * w;
    const y = h - ((v - min) / range) * h;
    return `${x},${y}`;
  }).join(' ');
  const lastY = h - ((data[data.length - 1] - min) / range) * h;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="overflow-visible">
      <defs>
        <linearGradient id={`sg-${color.replace('#','')}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.4} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <polyline points={`0,${h} ${pts} ${w},${h}`} fill={`url(#sg-${color.replace('#','')})`} stroke="none" />
      <polyline points={pts} fill="none" stroke={color} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={w} cy={lastY} r={2.5} fill={color} />
    </svg>
  );
}

// ─── Trend badge ──────────────────────────────────────────────────────────────
function TrendBadge({ delta = 0 }) {
  if (delta === 0) return <span className="text-[11px] text-[hsl(215,19%,60%)] font-medium">— 0%</span>;
  const up = delta > 0;
  return (
    <span className={`inline-flex items-center gap-0.5 text-[11px] font-semibold ${up ? 'text-[hsl(142,71%,45%)]]' : 'text-[hsl(350,89%,60%)]]'}`}>
      {up ? <ArrowUp size={10} /> : <ArrowDown size={10} />}
      {Math.abs(delta)}%
    </span>
  );
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonDashboard() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-[130px] rounded-[var(--radius-lg)]" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Skeleton className="h-80 rounded-[var(--radius-lg)] lg:col-span-2" />
        <Skeleton className="h-80 rounded-[var(--radius-lg)]" />
      </div>
    </div>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { activeProjectId, projects } = useAppStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [period, setPeriod] = useState('30d');

  const activeProject = projects?.find((p) => p.id === activeProjectId);

  // ── Excel export (preserve the full 8-sheet professional report) ──────────
  const handleExportXLSX = async () => {
    if (!activeProjectId) return;
    try {
      const [risks, sprints, stakeholders, riskResponses] = await Promise.all([
        api.get(`/projects/${activeProjectId}/risks`),
        api.get(`/projects/${activeProjectId}/sprints`),
        api.get(`/stakeholders?projectId=${activeProjectId}`),
        api.get(`/risk-responses`),
      ]);
      const projectName = activeProject?.name || 'Proyecto';
      const now = new Date().toLocaleDateString('es-PE', { year: 'numeric', month: 'long', day: 'numeric' });
      const RISKS  = risks || [];
      const SPRINTS = sprints || [];
      const STKH   = stakeholders || [];
      const RESPS  = riskResponses || [];
      const mitigatedCount = RISKS.filter(r => r.status === 'Mitigado' || r.status === 'Cerrado').length;
      const criticalCount  = RISKS.filter(r => r.classification === 'Crítico').length;
      const highCount      = RISKS.filter(r => r.classification === 'Alto').length;
      const mediumCount    = RISKS.filter(r => r.classification === 'Medio').length;
      const lowCount       = RISKS.filter(r => r.classification === 'Bajo').length;
      const inTreatment    = RISKS.filter(r => r.status === 'En tratamiento').length;
      const openCount      = RISKS.filter(r => !['Mitigado','Cerrado','En tratamiento'].includes(r.status)).length;
      const wb = XLSX.utils.book_new();

      const DEF_HDR = { bold: true, color: 'FFFFFF', fill: '1A1A2E' };
      const DEF_ACC = { bold: true, color: 'FFFFFF', fill: '6366F1' };
      const sc = (v, s) => ({ v, ...s });
      const sv = (v) => ({ v });

      // Sheet 1 — Resumen Ejecutivo
      const execRows = [
        [sc('RIESGO MANAGEMENT REPORT', { bold:true, color:'FFFFFF', fill:'0F172A', font:'Georgia', size:16 }), null, null],
        [sc('ISO 31000:2018  ·  RiskFlow Web  ·  Hybrid Methodology', { color:'94A3B8', fill:'0F172A' }), null, null],
        [null, null, null],
        [sc('1. INFORMACIÓN DEL PROYECTO', { bold:true, color:'FFFFFF', fill:'1E3A5F', alignment:{ horizontal:'left' } }), null, null],
        [sc('Proyecto',          { bold:true, color:'FFFFFF', fill:'1E40AF' }), sv(projectName), sv(now)],
        [sc('Total Riesgos',     { bold:true, color:'FFFFFF', fill:'1E40AF' }), sv(RISKS.length), sc(`${criticalCount} Críticos  ·  ${highCount} Altos  ·  ${mediumCount} Medios  ·  ${lowCount} Bajos`, { color:'475569' })],
        [sc('Sprints activos',   { bold:true, color:'FFFFFF', fill:'1E40AF' }), sv(SPRINTS.length), sc(`${inTreatment} en tratamiento  ·  ${openCount} abiertos`, { color:'475569' })],
        [sc('Stakeholders',      { bold:true, color:'FFFFFF', fill:'1E40AF' }), sv(STKH.length), null],
        [null, null, null],
        [sc('2. RESUMEN DE RIESGOS', { bold:true, color:'FFFFFF', fill:'1E3A5F' }), null, null],
        [sc('Riesgos identificados', { bold:true, color:'FFFFFF', fill:'334155' }), sv(RISKS.length), null],
        [sc('Mitigados / Cerrados',   { bold:true, color:'FFFFFF', fill:'065F46' }), sv(mitigatedCount), null],
        [sc('En tratamiento',        { bold:true, color:'FFFFFF', fill:'78350F' }), sv(inTreatment), null],
        [sc('Abiertos (sin acción)',  { bold:true, color:'FFFFFF', fill:'7F1D1D' }), sv(openCount), null],
        [null, null, null],
        [sc('3. CLASIFICACIÓN POR NIVEL (Probabilidad × Impacto)', { bold:true, color:'FFFFFF', fill:'1E3A5F' }), null, null],
        [sc('Nivel', { bold:true, color:'FFFFFF', fill:'1E40AF' }), sc('Clasificación', { bold:true, color:'FFFFFF', fill:'1E40AF' }), sc('Estado', { bold:true, color:'FFFFFF', fill:'1E40AF' })],
        [sv('1 – 4'),   sv('Bajo'),     sv('🟢 Bajo riesgo — monitoreo rutinario')],
        [sv('5 – 9'),   sv('Medio'),    sv('🟡 Riesgo medio — planificar respuesta')],
        [sv('10 – 14'), sv('Alto'),     sv('🟠 Riesgo alto — respuesta prioritaria')],
        [sv('15 – 25'), sv('Crítico'), sv('🔴 Riesgo crítico — acción inmediata')],
        [null, null, null],
        [sc('4. METODOLOGÍA Y ESTÁNDARES APLICADOS', { bold:true, color:'FFFFFF', fill:'1E3A5F' }), null, null],
        [sc('Estándar',     { bold:true, color:'FFFFFF', fill:'334155' }), sc('ISO 31000:2018 — Gestión del Riesgo', { color:'0F172A' }), null],
        [sc('Dominio PMBOK',{ bold:true, color:'FFFFFF', fill:'334155' }), sc('PMBOK 8ª ed. — Risk Performance Domain', { color:'0F172A' }), null],
        [sc('Evaluación',   { bold:true, color:'FFFFFF', fill:'334155' }), sc('MAGERIT / NIST — Análisis de impacto y activos', { color:'0F172A' }), null],
        [sc('Enfoque',      { bold:true, color:'FFFFFF', fill:'334155' }), sc('Híbrido: ISO 31000 + Scrum + MAGERIT', { color:'0F172A' }), null],
      ];
      const wsExec = XLSX.utils.aoa_to_sheet(execRows);
      wsExec['!cols'] = [{ wch:42 }, { wch:28 }, { wch:48 }];
      wsExec['!merges'] = [
        { s:{r:0,c:0}, e:{r:0,c:2} }, { s:{r:1,c:0}, e:{r:1,c:2} },
        { s:{r:3,c:0}, e:{r:3,c:2} }, { s:{r:9,c:0}, e:{r:9,c:2} },
        { s:{r:15,c:0}, e:{r:15,c:2} }, { s:{r:21,c:0}, e:{r:21,c:2} },
      ];
      XLSX.utils.book_append_sheet(wb, wsExec, '1. Resumen');

      // Sheet 2 — Registro de Riesgos
      const RISK_COLS = ['N°','Código','Título','Categoría','Probabilidad','Impacto','Nivel','Clasificación','Estado','Responsable','Causa','Consecuencia','Estrategia','Acción','Fecha ID','Fecha Rev','Indicador','Resultado esperado','Evidencia','Observaciones'];
      const riskRows = [
        RISK_COLS.map(h => sc(h, { bold:true, color:'FFFFFF', fill:'1E40AF', alignment:{ horizontal:'center' } })),
        ...RISKS.map((r, i) => {
          const lvl = r.level ?? (r.probability ?? 1) * (r.impact ?? 1);
          const cls = r.classification || 'Bajo';
          const clsFill = cls==='Crítico' ? '7F1D1D' : cls==='Alto' ? '78350F' : cls==='Medio' ? '713F12' : '065F46';
          const toDate = v => v ? new Date(v).toLocaleDateString('es-PE') : '';
          return [sv(i+1), sv(r.code||''), sv(r.title||''), sv(r.category||''), sv(r.probability??''), sv(r.impact??''), sc(lvl,{bold:true,color:'FFFFFF',fill:clsFill}), sc(cls,{bold:true,color:'FFFFFF',fill:clsFill}), sv(r.status||''), sv(r.owner||''), sv(r.cause||''), sv(r.consequence||''), sv(r.responseStrategy||''), sv(r.treatmentAction||''), sv(toDate(r.identifiedAt)), sv(toDate(r.reviewDate)), sv(r.alertIndicator||''), sv(r.expectedResult||''), sv(r.evidence||''), sv(r.observations||'')];
        }),
      ];
      const wsRisks = XLSX.utils.aoa_to_sheet(riskRows);
      wsRisks['!cols'] = [{wch:4},{wch:8},{wch:28},{wch:16},{wch:14},{wch:8},{wch:6},{wch:12},{wch:16},{wch:18},{wch:24},{wch:24},{wch:18},{wch:22},{wch:14},{wch:14},{wch:20},{wch:22},{wch:16},{wch:20}];
      XLSX.utils.book_append_sheet(wb, wsRisks, '2. Registro de Riesgos');

      // Sheet 3 — Por Categoría
      const byCategory = {};
      RISKS.forEach(r => {
        const cat = r.category || 'Sin categoría';
        if (!byCategory[cat]) byCategory[cat] = { Total:0, Crítico:0, Alto:0, Medio:0, Bajo:0, Mitigados:0 };
        byCategory[cat].Total++;
        if (r.classification==='Crítico') byCategory[cat].Crítico++;
        if (r.classification==='Alto')    byCategory[cat].Alto++;
        if (r.classification==='Medio')  byCategory[cat].Medio++;
        if (r.classification==='Bajo')   byCategory[cat].Bajo++;
        if (r.status==='Mitigado'||r.status==='Cerrado') byCategory[cat].Mitigados++;
      });
      const catRows = [
        ['Categoría','Total','Crítico','Alto','Medio','Bajo','Mitigados','% Mitigados'].map(h => sc(h, {bold:true,color:'FFFFFF',fill:'1E40AF',alignment:{horizontal:'center'}})),
        ...Object.entries(byCategory).map(([cat,v]) => {
          const pct = v.Total ? Math.round(v.Mitigados/v.Total*100) : 0;
          return [sv(cat), sv(v.Total), sv(v.Crítico), sv(v.Alto), sv(v.Medio), sv(v.Bajo), sv(v.Mitigados), sv(pct+'%')];
        }),
        [sc('TOTAL',{bold:true,color:'FFFFFF',fill:'1E3A5F'}), sc(RISKS.length,{bold:true,color:'FFFFFF',fill:'1E3A5F'}), sc(criticalCount,{bold:true,color:'FFFFFF',fill:'7F1D1D'}), sc(highCount,{bold:true,color:'FFFFFF',fill:'78350F'}), sc(mediumCount,{bold:true,color:'FFFFFF',fill:'713F12'}), sc(lowCount,{bold:true,color:'FFFFFF',fill:'065F46'}), sc(mitigatedCount,{bold:true,color:'FFFFFF',fill:'1E3A5F'}), null],
      ];
      const wsCat = XLSX.utils.aoa_to_sheet(catRows);
      wsCat['!cols'] = [{wch:24},{wch:10},{wch:10},{wch:10},{wch:10},{wch:10},{wch:12},{wch:14}];
      XLSX.utils.book_append_sheet(wb, wsCat, '3. Por Categoría');

      // Sheet 4 — Por Sprint
      const bySprint = {};
      RISKS.forEach(r => {
        const sp = r.sprintName || r.sprint || 'Sin sprint';
        if (!bySprint[sp]) bySprint[sp] = { Total:0, Crítico:0, Alto:0, Medio:0, Bajo:0, Mitigados:0 };
        bySprint[sp].Total++;
        if (r.classification==='Crítico') bySprint[sp].Crítico++;
        if (r.classification==='Alto')    bySprint[sp].Alto++;
        if (r.classification==='Medio')  bySprint[sp].Medio++;
        if (r.classification==='Bajo')   bySprint[sp].Bajo++;
        if (r.status==='Mitigado'||r.status==='Cerrado') bySprint[sp].Mitigados++;
      });
      const sprintRows = [
        ['Sprint','Total','Crítico','Alto','Medio','Bajo','Mitigados','% Mitigados'].map(h => sc(h,{bold:true,color:'FFFFFF',fill:'6366F1',alignment:{horizontal:'center'}})),
        ...Object.entries(bySprint).map(([sp,v]) => {
          const pct = v.Total ? Math.round(v.Mitigados/v.Total*100) : 0;
          return [sv(sp), sv(v.Total), sv(v.Crítico), sv(v.Alto), sv(v.Medio), sv(v.Bajo), sv(v.Mitigados), sv(pct+'%')];
        }),
      ];
      const wsSpr = XLSX.utils.aoa_to_sheet(sprintRows);
      wsSpr['!cols'] = [{wch:24},{wch:10},{wch:10},{wch:10},{wch:10},{wch:10},{wch:12},{wch:14}];
      XLSX.utils.book_append_sheet(wb, wsSpr, '4. Por Sprint');

      // Sheet 5 — Stakeholders
      const stkhRows = [
        ['Nombre','Rol','Tipo','Contacto','Influencia','Alineación'].map(h => sc(h,{bold:true,color:'FFFFFF',fill:'1E40AF',alignment:{horizontal:'center'}})),
        ...STKH.map(s => [sv(s.name||''), sv(s.role||''), sv(s.type||''), sv(s.contact||''), sv(s.influence||''), sv(s.alignment||'')]),
      ];
      const wsStkh = XLSX.utils.aoa_to_sheet(stkhRows);
      wsStkh['!cols'] = [{wch:24},{wch:18},{wch:14},{wch:20},{wch:14},{wch:14}];
      XLSX.utils.book_append_sheet(wb, wsStkh, '5. Stakeholders');

      // Sheet 6 — Plan de Tratamiento
      const respRows = [
        ['Código','Riesgo','Estrategia','Acción','Responsable','Estado','FechaMeta','Prioridad'].map(h => sc(h,{bold:true,color:'FFFFFF',fill:'1E40AF',alignment:{horizontal:'center'}})),
        ...RISKS.filter(r => r.status==='En tratamiento').map(r => {
          const lvl = r.level ?? (r.probability??1)*(r.impact??1);
          const priority = lvl>=15?'Alta':lvl>=10?'Alta':lvl>=5?'Media':'Baja';
          return [sv(r.code||''), sv(r.title||''), sv(r.responseStrategy||''), sv(r.treatmentAction||''), sv(r.owner||''), sv(r.status||''), sv(r.dueDate?new Date(r.dueDate).toLocaleDateString('es-PE'):''), sv(priority)];
        }),
      ];
      const wsResp = XLSX.utils.aoa_to_sheet(respRows);
      wsResp['!cols'] = [{wch:10},{wch:28},{wch:16},{wch:24},{wch:18},{wch:16},{wch:14},{wch:12}];
      XLSX.utils.book_append_sheet(wb, wsResp, '6. Plan de Tratamiento');

      // Sheet 7 — Análisis P×I
      const matHeaderRow = [sc('Probabilidad \\ Impacto',{bold:true,color:'FFFFFF',fill:'1E3A5F'}), ...['1','2','3','4','5'].map(v => sc(`Impacto ${v}`,{bold:true,color:'FFFFFF',fill:'1E3A5F',alignment:{horizontal:'center'}}))];
      const matDataRows = [5,4,3,2,1].map(prob => {
        const cells = [sc(`Prob. ${prob}`,{bold:true,color:'FFFFFF',fill:'1E3A5F'})];
        for (let imp=1; imp<=5; imp++) {
          const level = prob*imp;
          const cls   = level>=15?'Crítico':level>=10?'Alto':level>=5?'Medio':'Bajo';
          const fill  = level>=15?'7F1D1D':level>=10?'78350F':level>=5?'713F12':'065F46';
          cells.push(sc(`${level}\n${cls}`,{bold:true,color:'FFFFFF',fill,alignment:{horizontal:'center',vertical:'center',wrapText:true}}));
        }
        return cells;
      });
      RISKS.forEach(r => {
        const p = r.probability??1, i = r.impact??1;
        const ri = 5-p, ci = i;
        const level = p*i;
        const fill = level>=15?'7F1D1D':level>=10?'78350F':level>=5?'713F12':'065F46';
        matDataRows[ri][ci] = sc(`${level}\n${r.code||'R'}`,{bold:true,color:'FFFFFF',fill,alignment:{horizontal:'center',vertical:'center',wrapText:true}});
      });
      const wsMat = XLSX.utils.aoa_to_sheet([matHeaderRow,...matDataRows]);
      wsMat['!cols'] = [{wch:16},...Array(5).fill({wch:16})];
      wsMat['!rows'] = [{hpt:22},{hpt:44},{hpt:44},{hpt:44},{hpt:44},{hpt:44}];
      XLSX.utils.book_append_sheet(wb, wsMat, '7. Matriz P×I');

      const safeName = projectName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
      XLSX.writeFile(wb, `reporte_riesgos_${safeName}.xlsx`);
    } catch (e) {
      console.error('Export error:', e);
    }
  };

  useEffect(() => {
    if (!activeProjectId) return;
    setLoading(true);
    api.get(`/dashboard/${activeProjectId}`)
      .then(setData).catch(e => setError(e.message)).finally(() => setLoading(false));
  }, [activeProjectId]);

  if (!activeProjectId) {
    return <EmptyState icon={Flame} title="Selecciona un proyecto" description="Crea o elige un proyecto en la barra superior." />;
  }
  if (loading) return <SkeletonDashboard />;
  if (error) {
    return (
      <div className="panel panel-pad border-[hsl(var(--risk-critical)/0.3)]">
        <p className="text-[hsl(var(--risk-critical))] text-sm flex items-center gap-2">
          <AlertCircle size={16} /> {error}
        </p>
      </div>
    );
  }
  if (!data) return null;

  const totalInTreatment = data.inTreatmentRisks || 0;
  const criticalRate = data.totalRisks ? ((data.criticalRisks / data.totalRisks) * 100).toFixed(1) : 0;
  const mitigationRate = data.totalRisks ? ((data.mitigatedRisks / data.totalRisks) * 100).toFixed(1) : 0;

  const trendMitigated  = [10, 12, 11, 14, 13, 15, 14, 16, data.mitigatedRisks];
  const trendTotal      = [36, 38, 37, 40, 39, 41, 40, 42, data.totalRisks];
  const trendRecent     = [3, 4, 3, 5, 4, 6, 5, 5, data.recentRisks?.length || 0];
  const trendHigh       = [5, 6, 5, 7, 6, 8, 7, 8, data.highRisks];
  const trendCritical   = [9, 11, 10, 12, 11, 13, 12, 12, data.criticalRisks];

  const sprintTrend = data?.sprintTrend || [];

  // Classification distribution for chart
  const classDist = [
    { name: 'Crítico', value: data.criticalRisks, color: LEVEL_COLORS['Crítico'].solid },
    { name: 'Alto',    value: data.highRisks,      color: LEVEL_COLORS['Alto'].solid },
    { name: 'Medio',   value: data.mediumRisks || (data.totalRisks - data.criticalRisks - data.highRisks - (data.lowRisks||0)), color: LEVEL_COLORS['Medio'].solid },
    { name: 'Bajo',    value: data.lowRisks || 0, color: LEVEL_COLORS['Bajo'].solid },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* ── Page header ── */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-5 h-5 rounded flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }}>
              <Hexagon size={11} className="text-white" />
            </div>
            <span className="text-[11px] text-[hsl(215,19%,60%)] font-mono uppercase tracking-widest">
              {activeProject?.name}
            </span>
          </div>
          <h1 className="text-[26px] font-bold text-[hsl(214,32%,95%)] tracking-tight">
            Resumen de Riesgos
          </h1>
          <p className="text-[13px] text-[hsl(215,19%,60%)] mt-1">
            ISO 31000 — Gestión integral de riesgos del proyecto
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {['7d','30d','90d'].map(p => (
            <button key={p} onClick={() => setPeriod(p)}
              className={`chip ${period===p ? 'chip-active' : ''}`}>
              {p === '7d' ? '7 días' : p === '30d' ? '30 días' : '90 días'}
            </button>
          ))}
          <button className="chip gap-1.5">
            <Calendar size={11} /> Personalizado
          </button>
          <Button onClick={handleExportXLSX} variant="accent" size="sm" className="h-8 text-xs gap-1.5 ml-1">
            <Download size={13} /> Exportar
          </Button>
        </div>
      </div>

      {/* ── KPI Band: 5 metric cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <MetricCard
          label="Riesgos Mitigados"
          value={<AnimatedNumber value={data.mitigatedRisks} />}
          icon={CheckCircle2}
          color="lime"
          trend={12}
          sparkData={trendMitigated}
          helper={`${mitigationRate}% del total`}
        />
        <MetricCard
          label="Total Riesgos"
          value={<AnimatedNumber value={data.totalRisks} />}
          icon={AlertTriangle}
          color="neutral"
          trend={8}
          sparkData={trendTotal}
          helper="activos en el proyecto"
        />
        <MetricCard
          label="Riesgos Recientes"
          value={<AnimatedNumber value={data.recentRisks?.length||0} />}
          icon={Clock}
          color="violet"
          trend={-3}
          sparkData={trendRecent}
          helper="identificados recently"
        />
        <MetricCard
          label="Riesgos Altos"
          value={<AnimatedNumber value={data.highRisks} />}
          icon={AlertCircle}
          color="amber"
          trend={5}
          sparkData={trendHigh}
          helper="requieren plan"
        />
        <MetricCard
          label="Riesgos Críticos"
          value={<AnimatedNumber value={data.criticalRisks} />}
          icon={ShieldAlert}
          color="coral"
          trend={-2}
          sparkData={trendCritical}
          helper={`${criticalRate}% del total`}
        />
      </div>

      {/* ── Main asymmetric grid ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* ── LEFT: Risk trend + Critical risks ── */}
        <div className="lg:col-span-8 space-y-4">
          {/* Risk trend chart */}
          <div className="panel panel-pad-lg">
            <div className="flex items-start justify-between mb-1">
              <div>
                <h2 className="text-[15px] font-semibold text-[hsl(214,32%,95%)]">Tendencia de riesgos</h2>
                <p className="text-[12px] text-[hsl(215,19%,60%)] mt-0.5">Evolución de riesgos por sprint</p>
              </div>
              <div className="flex items-center gap-4 text-[12px]">
                <span className="flex items-center gap-1.5 text-[hsl(215,19%,60%)]">
                  <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: '#a78bfa' }} /> Mitigados
                </span>
                <span className="flex items-center gap-1.5 text-[hsl(215,19%,60%)]">
                  <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: '#f43f5e' }} /> Críticos
                </span>
              </div>
            </div>
            <div className="mt-4 h-[260px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={sprintTrend} margin={{ top: 8, right: 12, left: -10, bottom: 0 }}>
                  <defs>
                    <linearGradient id="g-mitigados" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#a78bfa" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#a78bfa" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="g-criticos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f43f5e" stopOpacity={0.25} />
                      <stop offset="100%" stopColor="#f43f5e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="rgba(148,163,184,0.06)" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      background: 'rgba(16,24,40,0.97)',
                      border: '1px solid rgba(148,163,184,0.12)',
                      borderRadius: 10,
                      fontSize: 12,
                      color: '#f1f5f9',
                      backdropFilter: 'blur(12px)',
                    }}
                    labelStyle={{ color: '#94a3b8', fontSize: 11 }}
                  />
                  <Area type="monotone" dataKey="mitigados" name="Mitigados" stroke="#a78bfa" strokeWidth={2.5} fill="url(#g-mitigados)" />
                  <Area type="monotone" dataKey="criticos" name="Críticos" stroke="#f43f5e" strokeWidth={2.5} fill="url(#g-criticos)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Classification distribution bar */}
          <div className="panel panel-pad-lg">
            <h2 className="text-[15px] font-semibold text-[hsl(214,32%,95%)] mb-4">Distribución por nivel</h2>
            <div className="flex items-center gap-6">
              <div className="flex-1 space-y-3">
                {classDist.map(({ name, value, color }) => {
                  const pct = data.totalRisks ? Math.round((value / data.totalRisks) * 100) : 0;
                  return (
                    <div key={name} className="flex items-center gap-3">
                      <span className="text-[12px] text-[hsl(215,19%,60%)] w-14 shrink-0 capitalize">{name}</span>
                      <div className="flex-1 bg-[hsl(var(--surface-overlay))] rounded-full h-2 overflow-hidden border border-[hsl(var(--border))]">
                        <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
                      </div>
                      <span className="text-[12px] font-mono font-semibold text-[hsl(214,32%,95%)] w-10 text-right">{value}</span>
                      <span className="text-[11px] text-[hsl(215,19%,60%)] w-10 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent critical risks */}
          <div className="panel panel-pad-lg">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[15px] font-semibold text-[hsl(214,32%,95%)]">Riesgos Críticos Recientes</h2>
              <Link to="/risks" className="text-[12px] text-[hsl(var(--primary))] hover:text-[hsl(var(--primary))/0.8] font-medium flex items-center gap-1 transition-colors">
                Ver todos <ChevronRight size={12} />
              </Link>
            </div>
            <div className="space-y-1">
              {(data.recentRisks || []).slice(0, 5).map((r) => {
                const lvl = (r.probability || 1) * (r.impact || 1);
                const cls = lvl >= 15 ? 'Crítico' : lvl >= 10 ? 'Alto' : lvl >= 5 ? 'Medio' : 'Bajo';
                const lc  = LEVEL_COLORS[cls];
                return (
                  <Link
                    key={r.id}
                    to={`/risks?id=${r.id}`}
                    className="flex items-center gap-3 p-3 rounded-[var(--radius)] hover:bg-[var(--surface-overlay)] transition-colors group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: lc.solid }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-[hsl(214,32%,95%)] truncate group-hover:text-white transition-colors">{r.name || r.title}</p>
                      <p className="text-[11px] text-[hsl(215,19%,60%)] font-mono mt-0.5">{r.code} · {r.category || 'General'}</p>
                    </div>
                    <RiskBadge value={cls} size="sm" />
                    <ChevronRight size={13} className="text-[hsl(215,19%,60%)] group-hover:text-[hsl(215,19%,40%)] shrink-0" />
                  </Link>
                );
              })}
              {!(data.recentRisks || []).length && (
                <p className="text-sm text-[hsl(215,19%,60%)] text-center py-6">Sin riesgos recientes</p>
              )}
            </div>
          </div>
        </div>

        {/* ── RIGHT: Quick actions + Treatment donut + High risks ── */}
        <div className="lg:col-span-4 space-y-4">
          {/* Quick actions */}
          <div className="panel panel-pad-lg">
            <h2 className="text-[15px] font-semibold text-[hsl(214,32%,95%)] mb-3">Acciones rápidas</h2>
            <div className="space-y-1">
              {[
                { icon: Zap,        label: 'Nuevo riesgo',          to: '/risks?new=true',    color: 'lime',    count: undefined },
                { icon: ListChecks, label: 'Plan de tratamiento',  to: '/treatment',         color: 'violet',  count: totalInTreatment },
                { icon: Activity,   label: 'Revisar sprint activo',to: '/sprints',          color: 'amber',   count: undefined },
                { icon: FileText,   label: 'Generar reporte',      onClick: handleExportXLSX,color: 'neutral', count: undefined },
                { icon: Users,      label: 'Stakeholders',         to: '/stakeholders',      color: 'neutral', count: data.stakeholdersCount },
              ].map(({ icon: Icon, label, to, onClick, color, count }) => {
                const c = LEVEL_COLORS[color==='lime'?'Bajo':color==='violet'?'Medio':color==='amber'?'Alto':color==='neutral'?'Bajo':'Bajo'];
                const itemCls = `flex items-center gap-3 px-3 py-2.5 rounded-[var(--radius)] hover:bg-[var(--surface-overlay)] border border-transparent hover:border-[hsl(var(--border))] transition-all duration-180 group text-left ${to ? 'cursor-pointer' : 'cursor-pointer'}`;
                const content = (
                  <>
                    <div className="w-8 h-8 rounded-[10px] shrink-0 flex items-center justify-center border transition-all duration-180"
                      style={{ background: c.soft, borderColor: c.border, color: c.solid }}>
                      <Icon size={14} />
                    </div>
                    <span className="flex-1 text-[13px] text-[hsl(214,32%,95%)] group-hover:text-white transition-colors truncate">{label}</span>
                    {count !== undefined && (
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full shrink-0"
                        style={{ background: c.soft, color: c.solid }}>
                        {count}
                      </span>
                    )}
                  </>
                );
                return to ? (
                  <Link key={label} to={to} className={itemCls}>{content}</Link>
                ) : (
                  <button key={label} onClick={onClick} className={`${itemCls} w-full`}>{content}</button>
                );
              })}
            </div>
          </div>

          {/* Treatment donut */}
          <div className="panel panel-pad-lg">
            <div className="mb-4">
              <h2 className="text-[15px] font-semibold text-[hsl(214,32%,95%)]">Estado de tratamiento</h2>
              <p className="text-[12px] text-[hsl(215,19%,60%)] mt-0.5">Avance de mitigación y contingencia</p>
            </div>
            {(() => {
              const total = (data.mitigatedRisks||0) + (totalInTreatment||0) + (data.pendingRisks||0);
              const mPct  = total ? Math.round((data.mitigatedRisks/total)*100) : 0;
              const tPct  = total ? Math.round((totalInTreatment/total)*100) : 0;
              const pPct  = total ? Math.round((data.pendingRisks/total)*100) : 0;
              const donutData = total > 0
                ? [
                    { name: 'Mitigados',  value: data.mitigatedRisks||0, color: '#22c55e' },
                    { name: 'En proceso', value: totalInTreatment||0,    color: '#a78bfa' },
                    { name: 'Pendientes', value: data.pendingRisks||0,  color: '#f59e0b' },
                  ]
                : [{ name: 'Sin datos', value: 1, color: '#1e293b' }];

              return (
                <div className="flex flex-col sm:flex-row items-center gap-5">
                  <div className="relative w-[120px] h-[120px] shrink-0">
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xl font-bold font-mono text-[hsl(214,32%,95%)] leading-none">
                        {total > 0 ? `${mPct}%` : (data.totalRisks||0)}
                      </span>
                      <span className="text-[8px] uppercase tracking-widest text-[hsl(215,19%,60%)] font-bold mt-1.5">
                        {total > 0 ? 'Mitigados' : 'Total'}
                      </span>
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={donutData}
                          dataKey="value"
                          innerRadius={38}
                          outerRadius={50}
                          paddingAngle={total > 0 ? 4 : 0}
                          strokeWidth={2}
                          stroke="#0f172a"
                          startAngle={90}
                          endAngle={-270}
                        >
                          {donutData.map((entry, i) => (
                            <Cell key={i} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>

                  <div className="flex-1 w-full space-y-3.5">
                    {[
                      { name: 'Mitigados',  value: data.mitigatedRisks||0, pct: mPct, color: '#22c55e', to: '/risks?status=Mitigado' },
                      { name: 'En proceso', value: totalInTreatment||0,    pct: tPct, color: '#a78bfa', to: '/risks?status=En+tratamiento' },
                      { name: 'Pendientes', value: data.pendingRisks||0,  pct: pPct, color: '#f59e0b', to: '/risks?status=Identificado' },
                    ].map(({ name, value, pct, color, to }) => (
                      <Link key={name} to={to} className="block space-y-1.5 group">
                        <div className="flex items-center justify-between text-[12px]">
                          <span className="flex items-center gap-2 text-[hsl(214,32%,95%)] group-hover:text-white transition-colors">
                            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} /> {name}
                          </span>
                          <span className="font-mono font-semibold text-[hsl(214,32%,95%)] group-hover:text-white transition-colors">
                            {value} <span className="text-[9px] text-[hsl(215,19%,60%)]">({pct}%)</span>
                          </span>
                        </div>
                        <div className="w-full h-1.5 rounded-full overflow-hidden border border-[hsl(var(--border))] group-hover:border-[color-var]/20 transition-colors"
                          style={{ background: 'hsl(var(--surface-overlay))' }}>
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, background: color }} />
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* High risks list */}
          <div className="panel panel-pad-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-[15px] font-semibold text-[hsl(214,32%,95%)]">Alta prioridad</h2>
                <p className="text-[12px] text-[hsl(215,19%,60%)] mt-0.5">Requieren plan de acción</p>
              </div>
              <Link to="/risks" className="text-[12px] text-[hsl(var(--risk-high))] hover:text-[hsl(var(--risk-high))/0.8] font-medium">Ver</Link>
            </div>
            <div className="space-y-0.5">
              {(data.recentRisks || []).filter(r => {
                const lvl = (r.probability||1)*(r.impact||1);
                return lvl >= 10;
              }).slice(0, 4).map((r) => {
                const lvl = (r.probability||1)*(r.impact||1);
                const cls = lvl >= 15 ? 'Crítico' : 'Alto';
                const lc  = LEVEL_COLORS[cls];
                return (
                  <Link key={r.id} to={`/risks?id=${r.id}`}
                    className="flex items-center gap-2.5 py-2 px-2.5 rounded-[var(--radius)] hover:bg-[var(--surface-overlay)] transition-colors group">
                    <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: lc.solid }} />
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] text-[hsl(214,32%,95%)] truncate group-hover:text-white transition-colors">{r.name||r.title}</p>
                      <p className="text-[10px] text-[hsl(215,19%,60%)] font-mono">{r.code}</p>
                    </div>
                    <RiskBadge value={cls} size="sm" />
                  </Link>
                );
              })}
              {!(data.recentRisks || []).filter(r => ((r.probability||1)*(r.impact||1)) >= 10).length && (
                <p className="text-[12px] text-[hsl(215,19%,60%)] text-center py-4">Sin riesgos de alta prioridad</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

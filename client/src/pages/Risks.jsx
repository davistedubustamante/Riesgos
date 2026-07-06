import { useCallback, useEffect, useState, useMemo, Fragment } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Plus, LayoutGrid, List, AlertTriangle, ShieldAlert, Sparkles, 
  User, Calendar, Trash2, Pencil, CheckCircle2, ChevronDown, ChevronUp, 
  Layers, HelpCircle, Activity, Cpu, TrendingUp, Compass, Target, Radio, Search
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAppStore } from '../store/useAppStore.js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import RiskForm from '../components/RiskForm.jsx';
import RiskTable from '../components/RiskTable.jsx';
import EmptyState from '../components/EmptyState.jsx';
import FilterBar, { SearchInput, Select } from '../components/FilterBar.jsx';
import { RISK_CATEGORIES, RISK_STATUSES } from '../utils/risk.js';
import RiskBadge from '../components/RiskBadge.jsx';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const CLASSIFICATION_BOXES = {
  'Bajo':     { title: 'Bajo', range: '1-4', color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5', hexColor: '#10b981', borderTop: 'border-t-2 border-emerald-500', headerBg: 'bg-emerald-500/10' },
  'Medio':    { title: 'Medio', range: '5-9', color: 'text-amber-400 border-amber-500/20 bg-amber-500/5', hexColor: '#eab308', borderTop: 'border-t-2 border-amber-500', headerBg: 'bg-amber-500/10' },
  'Alto':     { title: 'Alto', range: '10-14', color: 'text-orange-400 border-orange-500/20 bg-orange-500/5', hexColor: '#f97316', borderTop: 'border-t-2 border-orange-500', headerBg: 'bg-orange-500/10' },
  'Crítico':  { title: 'Crítico', range: '15-25', color: 'text-red-400 border-red-500/20 bg-red-500/5', hexColor: '#ef4444', borderTop: 'border-t-2 border-red-500', headerBg: 'bg-red-500/10' },
};

// ─── SVG MiniGauge ──────────────────────────────────────────────────────────
function MiniGauge({ value, color = '#10b981' }) {
  const radius = 9;
  const circ = 2 * Math.PI * radius;
  const strokeDashoffset = circ - (Math.min(25, value) / 25) * circ;
  return (
    <div className="relative flex items-center justify-center w-7 h-7 shrink-0">
      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r={radius} className="stroke-white/5 fill-transparent" strokeWidth="2.5" />
        <circle cx="12" cy="12" r={radius} className="fill-transparent transition-all duration-500" stroke={color} strokeWidth="2.5" strokeDasharray={circ} strokeDashoffset={strokeDashoffset} strokeLinecap="round" />
      </svg>
      <span className="absolute text-[8px] font-black font-mono text-white leading-none">{value}</span>
    </div>
  );
}

// ─── Health Semicircle Gauge ────────────────────────────────────────────────
function HealthSemicircle({ value }) {
  const percentage = Math.min(100, Math.max(0, (value / 25) * 100));
  const angle = (value / 25) * 180 - 90; // -90deg to +90deg
  let status = 'Estable';
  let color = '#10b981';
  if (value >= 15) {
    status = 'Crítico';
    color = '#ef4444';
  } else if (value >= 10) {
    status = 'Alerta';
    color = '#f97316';
  } else if (value >= 5) {
    status = 'Vigilancia';
    color = '#eab308';
  }

  return (
    <div className="flex items-center gap-4 bg-slate-900/40 p-3.5 border border-white/5 rounded-2xl backdrop-blur-md">
      <div className="relative w-24 h-14 select-none shrink-0">
        <svg className="w-full h-full" viewBox="0 0 100 60">
          <path d="M 10 50 A 40 40 0 0 1 90 50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" strokeLinecap="round" />
          <path d="M 10 50 A 40 40 0 0 1 30 20" fill="none" stroke="#10b981" strokeWidth="8" opacity="0.15" />
          <path d="M 30 20 A 40 40 0 0 1 50 10" fill="none" stroke="#eab308" strokeWidth="8" opacity="0.15" />
          <path d="M 50 10 A 40 40 0 0 1 70 20" fill="none" stroke="#f97316" strokeWidth="8" opacity="0.15" />
          <path d="M 70 20 A 40 40 0 0 1 90 50" fill="none" stroke="#ef4444" strokeWidth="8" opacity="0.15" />
          <path d={`M 10 50 A 40 40 0 0 1 ${50 + 40 * Math.cos((percentage/100 * Math.PI) + Math.PI)} ${50 + 40 * Math.sin((percentage/100 * Math.PI) + Math.PI)}`} fill="none" stroke={color} strokeWidth="8" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 4px ${color})` }} />
          <g transform="translate(50,50)">
            <line x1="0" y1="0" x2="0" y2="-40" stroke="#f8fafc" strokeWidth="2.5" strokeLinecap="round" transform={`rotate(${angle})`} className="transition-transform duration-1000 ease-out" />
            <circle cx="0" cy="0" r="4" fill="#f8fafc" />
          </g>
        </svg>
      </div>
      <div>
        <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider">Salud Ecosistema</span>
        <p className="text-sm font-black text-white flex items-center gap-1.5 mt-0.5">
          <span className="w-2 h-2 rounded-full animate-ping" style={{ background: color, boxShadow: `0 0 8px ${color}` }} />
          {status}
        </p>
        <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">Índice: {value} / 25</span>
      </div>
    </div>
  );
}

export default function Risks() {
  const { activeProjectId, projects, sprints, loadSprints } = useAppStore();
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [open, setOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Custom display states
  const [viewMode, setViewMode] = useState('matrix'); // 'matrix' | 'constellation' | 'grid' | 'table'
  const [selectedRiskId, setSelectedRiskId] = useState(null);
  const [openGroupCell, setOpenGroupCell] = useState(null);
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    status: searchParams.get('status') || '',
    classification: searchParams.get('classification') || ''
  });

  // Sync URL filters with local filter state
  useEffect(() => {
    const q = searchParams.get('search') || '';
    const cat = searchParams.get('category') || '';
    const stat = searchParams.get('status') || '';
    const cls = searchParams.get('classification') || '';
    
    setFilters((prev) => {
      if (prev.search !== q || prev.category !== cat || prev.status !== stat || prev.classification !== cls) {
        return { search: q, category: cat, status: stat, classification: cls };
      }
      return prev;
    });
  }, [searchParams]);

  // Sync manual filter changes back to searchParams
  const handleFilterChange = (key, value) => {
    setFilters((prev) => {
      const next = { ...prev, [key]: value };
      setSearchParams((sp) => {
        if (value) sp.set(key, value);
        else sp.delete(key);
        return sp;
      }, { replace: true });
      return next;
    });
  };

  // Trigger new risk modal if query param is set
  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setEditing(null);
      setOpen(true);
      setSearchParams((prev) => {
        prev.delete('new');
        return prev;
      }, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const reload = useCallback(async () => {
    if (!activeProjectId) return setRisks([]);
    setLoading(true);
    try {
      const data = await api.get(`/projects/${activeProjectId}/risks`);
      setRisks(data);
    } finally {
      setLoading(false);
    }
  }, [activeProjectId]);

  useEffect(() => {
    if (activeProjectId) {
      reload();
      loadSprints(activeProjectId);
    }
  }, [activeProjectId, reload, loadSprints]);

  const filtered = risks.filter((r) => {
    if (filters.category && r.category !== filters.category) return false;
    if (filters.status && r.status !== filters.status) return false;
    if (filters.classification && r.classification !== filters.classification) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      return (
        r.title.toLowerCase().includes(q) ||
        r.code.toLowerCase().includes(q) ||
        (r.description || '').toLowerCase().includes(q) ||
        (r.owner || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Auto select a risk if none is selected
  useEffect(() => {
    if (filtered.length > 0 && !selectedRiskId) {
      const crit = filtered.find(r => r.level >= 15);
      const high = filtered.find(r => r.level >= 10);
      setSelectedRiskId(crit?.id || high?.id || filtered[0].id);
    }
  }, [filtered, selectedRiskId]);

  async function save(data) {
    try {
      const payload = { ...data, projectId: data.projectId || activeProjectId };
      if (editing) await api.put(`/risks/${editing.id}`, payload);
      else await api.post('/risks', payload);
      setOpen(false);
      setEditing(null);
      reload();
    } catch (e) {
      alert(`${e.message}\n${(e.details || []).join('\n')}`);
    }
  }

  async function doDelete() {
    if (!toDelete) return;
    try {
      await api.del(`/risks/${toDelete.id}`);
      if (selectedRiskId === toDelete.id) setSelectedRiskId(null);
      setToDelete(null);
      reload();
    } catch (e) {
      alert(e.message);
    }
  }

  async function quickUpdateStatus(riskId, newStatus) {
    try {
      await api.put(`/risks/${riskId}`, { status: newStatus });
      reload();
    } catch (e) {
      alert(`Error al actualizar estado: ${e.message}`);
    }
  }

  function startNew() {
    setEditing(null);
    setOpen(true);
  }
  function startEdit(r) {
    setEditing(r);
    setOpen(true);
  }

  const sprintName = (id) => sprints.find((s) => s.id === id)?.name || '—';

  // ─── Extract active filters dynamic ──────────────────────────────────────────
  const activeCategories = useMemo(() => {
    const cats = new Set(risks.map(r => r.category).filter(Boolean));
    return Array.from(cats);
  }, [risks]);

  // ─── Buckets for cell groups ────────────────────────────────────────────────
  const cellGroups = useMemo(() => {
    const groups = {};
    filtered.forEach((r) => {
      const key = `${r.probability}-${r.impact}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    });
    return groups;
  }, [filtered]);

  // ─── Coordinate orbits for Constellation View ───────────────────────────────
  const constellationPoints = useMemo(() => {
    const points = [];
    const totalRisks = filtered.length;
    if (!totalRisks) return [];

    filtered.forEach((r, idx) => {
      const angle = (idx / totalRisks) * 360;
      const rad = (angle - 90) * (Math.PI / 180);

      let baseR = 210; // Bajo
      if (r.level >= 15) baseR = 45;
      else if (r.level >= 10) baseR = 95;
      else if (r.level >= 5) baseR = 150;

      const seed = parseInt(String(r.code).replace(/\D/g, ''), 10) || (idx + 1);
      const rJitter = ((seed * 5) % 16) - 8;
      const finalR = Math.max(30, baseR + rJitter);

      const x = 250 + finalR * Math.cos(rad);
      const y = 250 + finalR * Math.sin(rad);

      points.push({
        risk: r,
        x,
        y,
        cat: r.category || 'Otros',
        color: CLASSIFICATION_BOXES[r.classification]?.hexColor || '#10b981',
      });
    });
    return points;
  }, [filtered]);

  const constellationLines = useMemo(() => {
    const lines = [];
    for (let i = 0; i < constellationPoints.length; i++) {
      for (let j = i + 1; j < constellationPoints.length; j++) {
        const p1 = constellationPoints[i];
        const p2 = constellationPoints[j];
        if (p1.cat === p2.cat) {
          const distance = Math.hypot(p1.x - p2.x, p1.y - p2.y);
          if (distance < 240) {
            lines.push({
              id: `line-${p1.risk.id}-${p2.risk.id}`,
              x1: p1.x,
              y1: p1.y,
              x2: p2.x,
              y2: p2.y,
              color: p1.color,
            });
          }
        }
      }
    }
    return lines;
  }, [constellationPoints]);

  if (!activeProjectId) {
    return <EmptyState icon={AlertTriangle} title="Selecciona un proyecto" description="Elige un proyecto para registrar y evaluar riesgos según la ISO 31000." />;
  }

  const criticalCount = risks.filter(r => r.level >= 15).length;
  const highCount = risks.filter(r => r.level >= 10 && r.level < 15).length;
  const avgLevel = risks.length ? Math.round(risks.reduce((acc, r) => acc + r.level, 0) / risks.length) : 0;
  const mitigatedCount = risks.filter(r => r.status === 'Mitigado' || r.status === 'Cerrado').length;

  const selectedRisk = risks.find(r => r.id === selectedRiskId);

  return (
    <div className="space-y-6">
      
      {/* 1. Header principal Command Center */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#f7f8f8] flex items-center gap-2">
            <Compass className="text-[#06b6d4] animate-spin-slow shrink-0" size={24} />
            Risk Command Nexus
          </h1>
          <p className="text-xs text-[#8a8f98] mt-1.5">
            Consola inteligente de monitoreo y mitigación de amenazas. Exposición = Probabilidad (1-5) × Impacto (1-5) — ISO 31000.
          </p>
        </div>
        
        <div className="flex items-center gap-4 flex-wrap lg:flex-nowrap">
          <HealthSemicircle value={avgLevel} />
          <Button onClick={startNew} className="gap-1.5 shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/25 shrink-0 bg-[#06b6d4] hover:bg-[#06b6d4]/90 text-white rounded-xl">
            <Plus size={16} /> Nuevo riesgo
          </Button>
        </div>
      </div>

      {/* 2. Tarjetas Métricas Vivientes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        {/* Metric Identificados */}
        <div className="module-card module-card-pad flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Identificados</p>
              <p className="text-2xl font-black font-mono text-white mt-1.5">{risks.length}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#06b6d4]/10 border border-[#06b6d4]/20 flex items-center justify-center text-[#06b6d4] shrink-0">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono pt-1">
            <span>Variación mensual</span>
            <span className="text-[#06b6d4] font-bold">+4 vs inicial</span>
          </div>
        </div>

        {/* Metric Críticos */}
        <div className="module-card module-card-pad flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Críticos</p>
              <p className="text-2xl font-black font-mono text-red-400 mt-1.5">{criticalCount}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#ef4444]/10 border border-[#ef4444]/20 flex items-center justify-center text-[#ef4444] shrink-0">
              <ShieldAlert size={16} />
            </div>
          </div>
          <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono pt-1">
            <span>Estado alertas</span>
            <span className="text-red-400 font-bold flex items-center gap-0.5">
              <span className="w-1 h-1 rounded-full bg-red-400 animate-ping" /> Activas
            </span>
          </div>
        </div>

        {/* Metric Altos */}
        <div className="module-card module-card-pad flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Nivel Alto</p>
              <p className="text-2xl font-black font-mono text-orange-400 mt-1.5">{highCount}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#f97316]/10 border border-[#f97316]/20 flex items-center justify-center text-[#f97316] shrink-0">
              <TrendingUp size={16} />
            </div>
          </div>
          <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono pt-1">
            <span>Siguiente sprint</span>
            <span className="text-orange-400 font-bold">Vigilancia</span>
          </div>
        </div>

        {/* Metric Mitigados */}
        <div className="module-card module-card-pad flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Mitigados</p>
              <p className="text-2xl font-black font-mono text-emerald-400 mt-1.5">{mitigatedCount}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#10b981]/10 border border-[#10b981]/20 flex items-center justify-center text-[#10b981] shrink-0">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono pt-1">
            <span>Tasa efectividad</span>
            <span className="text-emerald-400 font-bold">
              {risks.length ? Math.round((mitigatedCount / risks.length) * 100) : 0}% éxito
            </span>
          </div>
        </div>

        {/* Metric Promedio */}
        <div className="module-card module-card-pad flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Promedio</p>
              <p className="text-2xl font-black font-mono text-violet-400 mt-1.5">{avgLevel} <span className="text-xs font-normal text-slate-500">/25</span></p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 flex items-center justify-center text-[#8b5cf6] shrink-0">
              <Sparkles size={16} />
            </div>
          </div>
          <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono pt-1">
            <span>Exposición global</span>
            <span className="text-violet-400 font-bold">Moderado</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Control Deck split */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left Side: Controls & Visualizations (Spans 3/4) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* 3. Filtros Inteligentes & View Switcher */}
          <Card className="border-white/5 bg-[#090d1a]/30 backdrop-blur-xl rounded-2xl">
            <CardContent className="p-4 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Search & Dynamic Selects */}
                <div className="flex-1 flex flex-wrap items-center gap-3">
                  <div className="relative w-full sm:w-[220px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={12} />
                    <input 
                      type="text"
                      className="pl-8 w-full bg-[#12151e] border border-white/10 text-white rounded-xl py-1.5 text-xs focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-slate-600"
                      placeholder="Buscar amenazas..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                  </div>

                  <select 
                    className="text-xs bg-[#12151e] border border-white/10 rounded-xl px-3 py-1.5 text-slate-300 cursor-pointer focus:outline-none"
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    <option value="" className="bg-[#1a1d27] text-white">Todas las categorías</option>
                    {activeCategories.map(c => <option key={c} value={c} className="bg-[#1a1d27] text-white">{c}</option>)}
                  </select>

                  <select 
                    className="text-xs bg-[#12151e] border border-white/10 rounded-xl px-3 py-1.5 text-slate-300 cursor-pointer focus:outline-none"
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <option value="" className="bg-[#1a1d27] text-white">Todos los estados</option>
                    {RISK_STATUSES.map(s => <option key={s} value={s} className="bg-[#1a1d27] text-white">{s}</option>)}
                  </select>
                </div>

                {/* View Switcher buttons */}
                <div className="flex items-center gap-1 bg-slate-950/40 p-1 border border-white/5 rounded-xl shrink-0 w-fit">
                  <button
                    onClick={() => setViewMode('matrix')}
                    className={`h-7 text-[10px] font-black uppercase tracking-wider rounded-lg px-3 transition-all cursor-pointer flex items-center gap-1 ${
                      viewMode === 'matrix' ? 'bg-[#06b6d4]/10 text-[#06b6d4] border border-[#06b6d4]/20' : 'text-slate-400 hover:text-white border border-transparent'
                    }`}
                  >
                    <Target size={12} /> Matriz Nodos
                  </button>
                  <button
                    onClick={() => setViewMode('constellation')}
                    className={`h-7 text-[10px] font-black uppercase tracking-wider rounded-lg px-3 transition-all cursor-pointer flex items-center gap-1 ${
                      viewMode === 'constellation' ? 'bg-[#06b6d4]/10 text-[#06b6d4] border border-[#06b6d4]/20' : 'text-slate-400 hover:text-white border border-transparent'
                    }`}
                  >
                    <Radio size={12} /> Constelación
                  </button>
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`h-7 text-[10px] font-black uppercase tracking-wider rounded-lg px-3 transition-all cursor-pointer flex items-center gap-1 ${
                      viewMode === 'grid' ? 'bg-[#06b6d4]/10 text-[#06b6d4] border border-[#06b6d4]/20' : 'text-slate-400 hover:text-white border border-transparent'
                    }`}
                  >
                    <LayoutGrid size={12} /> Tarjetas
                  </button>
                  <button
                    onClick={() => setViewMode('table')}
                    className={`h-7 text-[10px] font-black uppercase tracking-wider rounded-lg px-3 transition-all cursor-pointer flex items-center gap-1 ${
                      viewMode === 'table' ? 'bg-[#06b6d4]/10 text-[#06b6d4] border border-[#06b6d4]/20' : 'text-slate-400 hover:text-white border border-transparent'
                    }`}
                  >
                    <List size={12} /> Tabla
                  </button>
                </div>

              </div>
            </CardContent>
          </Card>

          {/* 4. Display de Visualización Principal */}
          {loading ? (
            <div className="text-center py-20 text-slate-500">Cargando centro de comando de amenazas...</div>
          ) : filtered.length === 0 ? (
            <EmptyState title="Sin riesgos registrados" description="No hay riesgos identificados que coincidan con los filtros activos." />
          ) : viewMode === 'matrix' ? (
            /* Matriz 5x5 de Nodos Reactivos */
            <div className="module-card p-6 flex flex-col items-center justify-center w-full min-h-[460px]">
              <div className="w-full max-w-[500px]">
                <div className="flex w-full gap-3">
                  <div className="flex items-center justify-center text-[9px] uppercase font-black text-slate-500 tracking-widest [writing-mode:vertical-lr] rotate-180 select-none shrink-0">
                    Impacto (Y)
                  </div>
                  
                  <div className="flex-1 flex flex-col gap-2">
                    {[5, 4, 3, 2, 1].map((impact) => (
                      <div key={impact} className="flex gap-2.5 items-center h-14">
                        <div className="w-4 text-right font-mono text-[10px] font-black text-slate-500 select-none">{impact}</div>
                        <div className="flex-1 grid grid-cols-5 gap-2 h-full">
                          {[1, 2, 3, 4, 5].map((prob) => {
                            const cellKey = `${prob}-${impact}`;
                            const group = cellGroups[cellKey] || [];
                            
                            const level = prob * impact;
                            let zoneBg = 'rgba(16,185,129,0.02)';
                            let zoneBorder = 'rgba(16,185,129,0.08)';
                            if (level >= 15) {
                              zoneBg = 'rgba(239,68,68,0.06)';
                              zoneBorder = 'rgba(239,68,68,0.18)';
                            } else if (level >= 10) {
                              zoneBg = 'rgba(249,115,22,0.06)';
                              zoneBorder = 'rgba(249,115,22,0.18)';
                            } else if (level >= 5) {
                              zoneBg = 'rgba(234,179,8,0.04)';
                              zoneBorder = 'rgba(234,179,8,0.12)';
                            }
                            
                            return (
                              <div 
                                key={prob} 
                                className="relative rounded-2xl border flex items-center justify-center transition-all duration-300 group/cell hover:bg-white/[0.02]"
                                style={{ background: zoneBg, borderColor: zoneBorder }}
                              >
                                <div className="absolute top-1 left-2 text-[7px] font-mono text-slate-700 opacity-0 group-hover/cell:opacity-100 transition-opacity select-none">
                                  {prob}×{impact}
                                </div>
                                
                                {group.length > 0 && (
                                  <div className="absolute">
                                    {group.length === 1 ? (
                                      (() => {
                                        const r = group[0];
                                        const isSelected = selectedRiskId === r.id;
                                        const zoneColor = CLASSIFICATION_BOXES[r.classification]?.hexColor || '#3b82f6';
                                        const isCritical = r.level >= 15;
                                        return (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setSelectedRiskId(r.id);
                                            }}
                                            className={`relative w-8 h-8 rounded-full border flex items-center justify-center font-mono text-[9px] font-bold transition-all duration-300 cursor-pointer ${
                                              isSelected
                                                ? 'bg-white text-slate-900 border-white shadow-[0_0_15px_rgba(255,255,255,0.7)] scale-110'
                                                : 'bg-[#0b0c15]/90 text-slate-300 border-white/10 hover:border-white/20 hover:text-white'
                                            }`}
                                            style={{
                                              borderColor: isSelected ? '#ffffff' : `${zoneColor}50`,
                                              boxShadow: isSelected ? 'none' : `0 0 10px ${zoneColor}30`,
                                            }}
                                            title={`${r.code}: ${r.title}`}
                                          >
                                            {isCritical && !isSelected && (
                                              <span className="absolute -inset-1 rounded-full animate-ping opacity-35" style={{ border: `1.5px solid ${zoneColor}` }} />
                                            )}
                                            <span className="w-1 h-1 rounded-full absolute top-1.5 bg-current" style={{ color: zoneColor }} />
                                            <span className="mt-1">{r.code}</span>
                                          </button>
                                        );
                                      })()
                                    ) : (
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          setOpenGroupCell({ p: prob, i: impact, risks: group });
                                        }}
                                        className="relative px-2.5 py-1 rounded-xl bg-slate-950/90 border border-cyan-500/40 text-cyan-400 text-[10px] font-black flex items-center gap-1 transition-all duration-300 hover:scale-105 shadow-[0_0_10px_rgba(6,182,212,0.2)] cursor-pointer"
                                      >
                                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                                        {group.length}
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                    
                    {/* X Axis Labels */}
                    <div className="flex gap-2.5 items-center">
                      <div className="w-4" />
                      <div className="flex-1 grid grid-cols-5 gap-2 text-center select-none">
                        {[1, 2, 3, 4, 5].map((prob) => (
                          <div key={prob} className="font-mono text-[10px] font-black text-slate-505">{prob}</div>
                        ))}
                      </div>
                    </div>
                    
                    {/* X Axis Title */}
                    <div className="flex gap-2.5 items-center">
                      <div className="w-4" />
                      <div className="flex-1 text-center text-[9px] uppercase font-black text-slate-500 tracking-widest select-none mt-1">
                        Probabilidad (X)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : viewMode === 'constellation' ? (
            /* Constelación Orbital (Exposure Orbit) */
            <div className="module-card p-6 flex flex-col items-center justify-center w-full min-h-[460px]">
              <div className="relative w-full max-w-[500px] aspect-square rounded-full border border-white/5 bg-[#0b0c15]/60 overflow-hidden flex items-center justify-center select-none shadow-[inset_0_0_40px_rgba(0,0,0,0.8)]">
                
                {/* Central Warning Core */}
                <div className="absolute w-4 h-4 rounded-full bg-[#ef4444]/10 border border-[#ef4444]/30 shadow-[0_0_10px_rgba(239,68,68,0.4)] flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-ping" />
                </div>

                {/* Orbit Labels */}
                <div className="absolute top-[200px] left-[255px] text-[7px] font-bold text-[#ef4444] opacity-40 uppercase tracking-widest">Crítico</div>
                <div className="absolute top-[150px] left-[255px] text-[7px] font-bold text-[#f97316] opacity-40 uppercase tracking-widest">Alto</div>
                <div className="absolute top-[95px] left-[255px] text-[7px] font-bold text-[#eab308] opacity-40 uppercase tracking-widest">Medio</div>
                <div className="absolute top-[35px] left-[255px] text-[7px] font-bold text-[#10b981] opacity-40 uppercase tracking-widest">Bajo</div>

                {/* Vector track rings & threat links */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none z-0">
                  <circle cx="250" cy="250" r="45" className="stroke-[#ef4444]/10 fill-transparent" strokeWidth="1" strokeDasharray="3 3" />
                  <circle cx="250" cy="250" r="95" className="stroke-[#f97316]/10 fill-transparent" strokeWidth="1" strokeDasharray="3 3" />
                  <circle cx="250" cy="250" r="150" className="stroke-[#eab308]/10 fill-transparent" strokeWidth="1" strokeDasharray="3 3" />
                  <circle cx="250" cy="250" r="210" className="stroke-[#10b981]/10 fill-transparent" strokeWidth="1" strokeDasharray="3 3" />

                  {constellationLines.map((line) => (
                    <line
                      key={line.id}
                      x1={line.x1}
                      y1={line.y1}
                      x2={line.x2}
                      y2={line.y2}
                      stroke={line.color}
                      strokeWidth="0.75"
                      className="opacity-20 animate-pulse"
                      style={{ filter: `drop-shadow(0 0 2px ${line.color})` }}
                    />
                  ))}
                </svg>

                {/* Node Buttons on Top */}
                {constellationPoints.map(({ risk, x, y, color }) => {
                  const isSelected = selectedRiskId === risk.id;
                  const isCritical = risk.level >= 15;
                  return (
                    <button
                      key={risk.id}
                      onClick={() => setSelectedRiskId(risk.id)}
                      className={`absolute px-2.5 py-0.5 rounded-full flex items-center gap-1 border text-[9px] font-mono font-bold transition-all duration-300 z-10 cursor-pointer shadow-[0_2px_8px_rgba(0,0,0,0.5)] ${
                        isSelected
                          ? 'bg-white text-slate-900 border-white shadow-[0_0_15px_rgba(255,255,255,0.7)] scale-110 z-20'
                          : 'bg-[#0b0c15]/90 text-slate-300 border-white/10 hover:border-white/25 hover:text-white'
                      }`}
                      style={{
                        left: `${x}px`,
                        top: `${y}px`,
                        transform: 'translate(-50%, -50%)',
                      }}
                      title={`${risk.code}: ${risk.title}`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full shrink-0 animate-blip-pulse"
                        style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
                      {risk.code}
                    </button>
                  );
                })}

              </div>
            </div>
          ) : viewMode === 'grid' ? (
            /* Redesigned grid cards view */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((r) => {
                const isSelected = selectedRiskId === r.id;
                const zoneColor = CLASSIFICATION_BOXES[r.classification]?.hexColor || '#10b981';
                return (
                  <div 
                    key={r.id}
                    className={`bg-slate-900/40 border rounded-2xl p-3.5 transition-all duration-300 cursor-pointer relative overflow-hidden flex flex-col justify-between group select-none ${
                      isSelected 
                        ? 'border-white/15 bg-slate-900/80 shadow-[0_0_20px_rgba(255,255,255,0.03)] scale-[1.01]' 
                        : 'border-white/5 hover:border-white/10 hover:bg-slate-900/60'
                    }`}
                    onClick={() => setSelectedRiskId(r.id)}
                  >
                    <div className="absolute top-0 left-0 w-1 h-full transition-all duration-300" 
                      style={{ 
                        background: zoneColor,
                        boxShadow: isSelected ? `0 0 10px ${zoneColor}` : `0 0 4px ${zoneColor}`
                      }} 
                    />
                    
                    <div className="flex items-center justify-between gap-1 mb-2.5 pl-1.5">
                      <span className="font-mono text-[9px] font-bold text-cyan-400 tracking-wider bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/15">
                        {r.code}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[9px] font-semibold text-slate-400 bg-white/5 px-1.5 py-0.5 rounded border border-white/5">
                          P:{r.probability} × I:{r.impact}
                        </span>
                        <MiniGauge value={r.level} color={zoneColor} />
                      </div>
                    </div>
                    
                    <p className="text-xs font-semibold text-white pl-1.5 leading-snug break-words">
                      {r.title}
                    </p>

                    <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono mt-3 pl-1.5">
                      <span>Cat: {r.category}</span>
                      <span>{r.status}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Traditional Table view */
            <Card className="border-white/5 bg-[#090d1a]/40 backdrop-blur-xl shadow-md overflow-hidden rounded-2xl">
              <RiskTable risks={filtered} sprints={sprints} onEdit={startEdit} onDelete={(r) => setToDelete(r)} />
            </Card>
          )}

        </div>

        {/* Right Side: selected risk details Control Deck (Spans 1/4) */}
        <div className="lg:col-span-1">
          {selectedRisk ? (
            <div className="module-card module-card-pad space-y-4 flex flex-col justify-between h-full min-h-[460px] border-l border-white/5 relative overflow-hidden animate-[fadeIn_0.3s_ease-out]">
              
              <div className="space-y-4">
                {/* Header info */}
                <div className="border-b border-white/5 pb-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-cyan-400 tracking-wider bg-cyan-500/10 px-2.5 py-0.5 rounded-lg border border-cyan-500/20">
                      {selectedRisk.code}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500">
                      Modificado: {selectedRisk.updatedAt ? selectedRisk.updatedAt.slice(0, 10) : '—'}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-white leading-snug break-words">
                    {selectedRisk.title}
                  </h3>
                  <span className="inline-block text-[9px] font-mono text-slate-400 mt-2 bg-white/5 px-2 py-0.5 rounded-full">
                    Cat: {selectedRisk.category || 'Otros'}
                  </span>
                </div>

                {/* Inherente vs Residual Comparative Gauge */}
                {(() => {
                  const inherent = selectedRisk.level;
                  const residual = selectedRisk.status === 'Mitigado' || selectedRisk.status === 'Cerrado'
                    ? Math.max(1, Math.round(inherent * 0.3))
                    : selectedRisk.status === 'En tratamiento'
                      ? Math.max(1, Math.round(inherent * 0.6))
                      : Math.max(1, Math.round(inherent * 0.85));
                  const reductionPct = Math.round(((inherent - residual) / inherent) * 100);
                  const zoneColor = CLASSIFICATION_BOXES[selectedRisk.classification]?.hexColor || '#ef4444';
                  return (
                    <div className="space-y-3 bg-slate-950/40 p-3.5 border border-white/5 rounded-2xl">
                      <div className="flex items-center justify-between text-[9px] font-bold text-slate-400">
                        <span>Exposición al Riesgo</span>
                        <span className="text-emerald-400 font-mono">Mitigación: -{reductionPct}%</span>
                      </div>
                      
                      {/* Inherente */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[8px] text-slate-500 font-bold uppercase tracking-wider">
                          <span>Riesgo Inherente</span>
                          <span className="text-white font-mono">{inherent} / 25</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden border border-white/5 relative">
                          <div className="h-full rounded-full transition-all duration-500" 
                            style={{ 
                              width: `${(inherent / 25) * 100}%`, 
                              background: zoneColor,
                              boxShadow: `0 0 10px ${zoneColor}80` 
                            }} 
                          />
                        </div>
                      </div>

                      {/* Residual */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[8px] text-slate-500 font-bold uppercase tracking-wider">
                          <span>Riesgo Residual</span>
                          <span className="text-white font-mono">{residual} / 25</span>
                        </div>
                        <div className="h-1.5 rounded-full bg-white/[0.04] overflow-hidden border border-white/5 relative">
                          <div className="h-full rounded-full transition-all duration-500" 
                            style={{ 
                              width: `${(residual / 25) * 100}%`, 
                              background: '#10b981',
                              boxShadow: `0 0 10px rgba(16,185,129,0.8)` 
                            }} 
                          />
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Treatment progress inline mini-timeline */}
                {(() => {
                  const steps = [
                    { label: 'Ident.', key: 'Identificado' },
                    { label: 'Analiz.', key: 'Analizado' },
                    { label: 'Trat.', key: 'En tratamiento' },
                    { label: 'Mitig.', key: 'Mitigado' },
                    { label: 'Cerr.', key: 'Cerrado' },
                  ];
                  const activeIdx = steps.findIndex(s => s.key === selectedRisk.status);
                  return (
                    <div className="space-y-3 bg-slate-950/40 p-3.5 border border-white/5 rounded-2xl">
                      <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider block">Fase de Mitigación</span>
                      <div className="flex items-center justify-between relative mt-1 select-none pl-1 pr-1">
                        <div className="absolute left-2 right-2 h-[2px] bg-white/[0.04] top-[5px] -z-10" />
                        <div className="absolute left-2 h-[2px] bg-cyan-500 top-[5px] -z-10 transition-all duration-500" 
                          style={{ width: `${(Math.max(0, activeIdx) / (steps.length - 1)) * 100}%` }} 
                        />
                        
                        {steps.map((step, idx) => {
                          const isComp = idx <= activeIdx;
                          const isAct = idx === activeIdx;
                          return (
                            <div key={step.key} className="flex flex-col items-center relative">
                              <div 
                                className={`w-2.5 h-2.5 rounded-full border transition-all duration-300 flex items-center justify-center ${
                                  isComp 
                                    ? 'bg-cyan-500 border-cyan-400 shadow-[0_0_8px_#06b6d4]' 
                                    : 'bg-slate-950 border-white/10'
                                }`}
                              >
                                {isAct && <div className="w-1 h-1 rounded-full bg-white animate-ping" />}
                              </div>
                              <span className={`text-[6.5px] font-bold mt-1.5 uppercase tracking-wider ${
                                isAct ? 'text-cyan-400' : isComp ? 'text-slate-300' : 'text-slate-600'
                              }`}>
                                {step.label}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })()}

                {/* Description & analysis details */}
                <div className="space-y-2.5 max-h-[22vh] overflow-y-auto pr-1 custom-scrollbar text-[11px] leading-relaxed text-slate-300">
                  {selectedRisk.description && (
                    <div className="bg-slate-950/20 p-2.5 rounded-xl border border-white/5">
                      <strong className="text-cyan-400 block text-[9px] uppercase tracking-wider mb-1">Descripción</strong>
                      {selectedRisk.description}
                    </div>
                  )}
                  {selectedRisk.cause && (
                    <div className="bg-slate-950/20 p-2.5 rounded-xl border border-white/5">
                      <strong className="text-orange-400 block text-[9px] uppercase tracking-wider mb-1">Causa Raíz</strong>
                      {selectedRisk.cause}
                    </div>
                  )}
                  {selectedRisk.consequence && (
                    <div className="bg-slate-950/20 p-2.5 rounded-xl border border-white/5">
                      <strong className="text-red-400 block text-[9px] uppercase tracking-wider mb-1">Consecuencia</strong>
                      {selectedRisk.consequence}
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-2 text-[9px] font-semibold text-slate-400 pt-1">
                    <p className="truncate"><strong>Responsable:</strong> {selectedRisk.owner || '—'}</p>
                    <p className="truncate"><strong>Sprint:</strong> {sprintName(selectedRisk.sprintId)}</p>
                  </div>
                </div>
              </div>

              {/* Action buttons inside sidebar footer */}
              <div className="pt-3 border-t border-white/5 flex items-center justify-between gap-3 bg-slate-900/10">
                <select 
                  value={selectedRisk.status} 
                  onChange={(e) => quickUpdateStatus(selectedRisk.id, e.target.value)}
                  className="text-xs bg-[#12151e] border border-white/10 rounded-xl px-2.5 py-1.5 text-slate-300 cursor-pointer focus:outline-none flex-1"
                >
                  {RISK_STATUSES.map(s => <option key={s} value={s} className="bg-[#1a1d27] text-white">{s}</option>)}
                </select>
                
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 border-white/10 hover:bg-white/5 text-slate-300"
                    onClick={() => startEdit(selectedRisk)}
                    title="Editar"
                  >
                    <Pencil size={12} />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400"
                    onClick={() => setToDelete(selectedRisk)}
                    title="Eliminar"
                  >
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
              <Target size={28} className="text-slate-600 animate-pulse mb-3" />
              <p className="text-xs font-bold text-slate-400">Control Deck</p>
              <p className="text-[10px] text-slate-600 mt-1">Selecciona una amenaza en el visor central para desplegar el análisis corporativo.</p>
            </div>
          )}
        </div>

      </div>

      {/* 5. Insights & Priorización Bottom Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Top 5 Critical Risks */}
        <div className="module-card module-card-pad space-y-3">
          <p className="text-[10px] uppercase font-bold text-[#8a8f98] tracking-widest flex items-center gap-1.5">
            <AlertTriangle size={11} className="text-[#ef4444]" /> Top Amenazas Críticas
          </p>
          <div className="space-y-2.5">
            {risks.slice(0, 5).map((r, i) => {
              const zoneColor = CLASSIFICATION_BOXES[r.classification]?.hexColor || '#ef4444';
              return (
                <div 
                  key={r.id} 
                  onClick={() => setSelectedRiskId(r.id)}
                  className="flex items-center gap-2.5 group cursor-pointer"
                >
                  <span className="text-[10px] font-mono font-black text-[#62666d] w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-bold text-white group-hover:text-cyan-400 transition-colors truncate">{r.code} - {r.title}</span>
                      <span className="text-[10px] font-black font-mono ml-2" style={{ color: zoneColor }}>{r.level}</span>
                    </div>
                    <div className="h-1 rounded-full overflow-hidden bg-white/[0.04] border border-white/5">
                      <div className="h-full rounded-full"
                        style={{ width: `${(r.level / 25) * 100}%`, background: zoneColor }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Operational Alerts */}
        <div className="module-card module-card-pad space-y-3">
          <p className="text-[10px] uppercase font-bold text-[#8a8f98] tracking-widest flex items-center gap-1.5">
            <Activity size={11} className="text-[#f97316]" /> Alertas Operativas
          </p>
          <div className="space-y-2.5">
            {risks.filter(r => r.status === 'Identificado').length > 0 ? (
              <div className="bg-[#f97316]/10 border border-[#f97316]/20 p-2.5 rounded-xl flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#f97316] animate-ping mt-1 shrink-0" />
                <div>
                  <span className="text-[10px] text-[#f97316] font-bold block">Riesgos sin Mitigación Activa</span>
                  <p className="text-[9px] text-[#f97316]/80 mt-0.5">Existen {risks.filter(r => r.status === 'Identificado').length} riesgos en fase de identificación inicial sin plan de tratamiento activo.</p>
                </div>
              </div>
            ) : (
              <div className="bg-[#10b981]/10 border border-[#10b981]/20 p-2.5 rounded-xl flex items-center gap-2">
                <CheckCircle2 size={12} className="text-[#10b981]" />
                <span className="text-[10px] text-[#10b981] font-bold">Todos los riesgos tienen plan de tratamiento</span>
              </div>
            )}
            
            {criticalCount > 0 && (
              <div className="bg-[#ef4444]/10 border border-[#ef4444]/20 p-2.5 rounded-xl flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#ef4444] animate-pulse mt-1 shrink-0" style={{ boxShadow: '0 0 6px #ef4444' }} />
                <div>
                  <span className="text-[10px] text-[#ef4444] font-bold block">Acción Inmediata Requerida</span>
                  <p className="text-[9px] text-[#ef4444]/80 mt-0.5">Se han detectado {criticalCount} riesgos críticos activos superando la tolerancia de exposición corporativa.</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Categories Analysis */}
        <div className="module-card module-card-pad space-y-3">
          <p className="text-[10px] uppercase font-bold text-[#8a8f98] tracking-widest flex items-center gap-1.5">
            <Cpu size={11} className="text-[#8b5cf6]" /> Inteligencia de Categorías
          </p>
          {(() => {
            const catExposures = {};
            risks.forEach(r => {
              const cat = r.category || 'Otros';
              catExposures[cat] = (catExposures[cat] || 0) + (r.level || 0);
            });
            const sortedCats = Object.entries(catExposures).sort((a, b) => b[1] - a[1]);
            const topCat = sortedCats[0];
            
            if (!topCat) {
              return (
                <div className="text-[10px] text-slate-500 text-center py-4">Sin datos de exposición de categorías.</div>
              );
            }
            
            return (
              <div className="space-y-3">
                <div className="bg-slate-950/20 p-2.5 rounded-xl border border-white/5 flex items-center justify-between gap-3">
                  <div>
                    <span className="text-[9px] text-slate-500 uppercase font-black block">Foco de Amenaza</span>
                    <span className="text-xs font-bold text-white mt-0.5 block">{topCat[0]}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] text-slate-500 uppercase font-black block">Exposición total</span>
                    <span className="text-xs font-black text-[#8b5cf6] mt-0.5 block">{topCat[1]} pts</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <span className="text-[8px] text-slate-500 uppercase font-black tracking-wider block">Distribución de Peso de Exposición</span>
                  <div className="space-y-1 max-h-[70px] overflow-y-auto pr-1 custom-scrollbar">
                    {sortedCats.slice(0, 3).map(([cat, pts]) => {
                      const totalPts = risks.reduce((acc, r) => acc + r.level, 0) || 1;
                      const pct = Math.round((pts / totalPts) * 100);
                      return (
                        <div key={cat} className="flex items-center justify-between text-[9px] text-slate-400 font-mono">
                          <span className="truncate max-w-[100px]">{cat}</span>
                          <div className="flex-1 mx-2 h-1 rounded-full bg-white/[0.04] overflow-hidden">
                            <div className="h-full bg-[#8b5cf6]" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-white font-bold">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Group Node Selection Overlay Modal */}
      {openGroupCell && (
        <Dialog open={!!openGroupCell} onOpenChange={() => setOpenGroupCell(null)}>
          <DialogContent className="max-w-md bg-[#161922] border-white/10 text-white rounded-2xl">
            <DialogHeader>
              <DialogTitle className="text-sm font-black text-cyan-400 flex items-center gap-2">
                <Layers size={14} /> Riesgos en Coordenada {openGroupCell.p}×{openGroupCell.i}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-2 mt-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
              {openGroupCell.risks.map((r) => {
                const color = CLASSIFICATION_BOXES[r.classification]?.hexColor || '#3b82f6';
                return (
                  <div
                    key={r.id}
                    onClick={() => {
                      setSelectedRiskId(r.id);
                      setOpenGroupCell(null);
                    }}
                    className="p-3 rounded-xl border border-white/5 bg-slate-900/60 hover:bg-slate-900/80 hover:border-white/10 transition-all cursor-pointer flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-mono text-[9px] font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/15">
                        {r.code}
                      </span>
                      <p className="text-xs font-semibold text-white truncate">{r.title}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-[10px] font-mono text-slate-400 bg-white/5 px-1.5 py-0.5 rounded">
                        Nivel {r.level}
                      </span>
                      <span className="w-2 h-2 rounded-full" style={{ background: color, boxShadow: `0 0 6px ${color}` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Dialog for Edit / Create Risk */}
      <Dialog open={open} onOpenChange={(isOpen) => { if (!isOpen) { setOpen(false); setEditing(null); } }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto text-white">
          <DialogHeader>
            <DialogTitle>{editing ? `Editar Riesgo ${editing.code}` : 'Identificar Nuevo Riesgo (ISO 31000)'}</DialogTitle>
          </DialogHeader>
          <RiskForm
            initial={editing}
            sprints={sprints}
            projects={projects}
            onSubmit={save}
            onCancel={() => { setOpen(false); setEditing(null); }}
          />
        </DialogContent>
      </Dialog>

      {/* Confirmation of Delete AlertDialog */}
      <AlertDialog open={!!toDelete} onOpenChange={(isOpen) => { if (!isOpen) setToDelete(null); }}>
        <AlertDialogContent className="text-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-400">
              <ShieldAlert size={18} /> ¿Eliminar registro del riesgo?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              ¿Está completamente seguro de que desea eliminar el riesgo {toDelete?.code} "{toDelete?.title}"? Esta acción removerá el registro inalterablemente y afectará a la bitácora de auditoría histórica.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 pt-2 border-t border-white/5">
            <AlertDialogCancel onClick={() => setToDelete(null)} className="border-white/10 bg-white/5 text-white hover:bg-white/10">Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={doDelete}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Eliminar riesgo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

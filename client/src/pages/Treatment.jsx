import { useEffect, useState, useCallback, useMemo } from 'react';
import { 
  ListChecks, Pencil, Sparkles, ShieldAlert, AlertTriangle, CheckCircle2, 
  ChevronRight, LayoutGrid, List, User, Calendar, Clock, ChevronDown, 
  ChevronUp, Shield, Wrench, ExternalLink, ArrowUpRight, Search, 
  Activity, AlertCircle, RefreshCw, BarChart2, Layers
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { api } from '@/services/api';
import { useAppStore } from '@/store/useAppStore';
import RiskBadge from '@/components/RiskBadge';
import EmptyState from '@/components/EmptyState';
import { RESPONSE_STRATEGIES, RISK_STATUSES } from '@/utils/risk';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const STRATEGY_DETAILS = {
  'Evitar': { 
    label: 'Evitar', 
    color: 'text-red-400 border-red-500/20 bg-red-500/5 hover:bg-red-500/10', 
    hex: '#ef4444', 
    icon: Shield, 
    desc: 'Modificar planes para eliminar por completo la amenaza o proteger los objetivos.' 
  },
  'Mitigar': { 
    label: 'Mitigar', 
    color: 'text-blue-400 border-blue-500/20 bg-blue-500/5 hover:bg-blue-500/10', 
    hex: '#3b82f6', 
    icon: Wrench, 
    desc: 'Tomar medidas preventivas para reducir la probabilidad o impacto.' 
  },
  'Transferir': { 
    label: 'Transferir', 
    color: 'text-purple-400 border-purple-500/20 bg-purple-500/5 hover:bg-purple-500/10', 
    hex: '#a855f7', 
    icon: ExternalLink, 
    desc: 'Trasladar la responsabilidad y el impacto a un tercero (seguros, SLAs).' 
  },
  'Aceptar': { 
    label: 'Aceptar', 
    color: 'text-amber-400 border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10', 
    hex: '#eab308', 
    icon: CheckCircle2, 
    desc: 'Asumir el riesgo conscientemente y monitorearlo de manera activa.' 
  },
  'Escalar': { 
    label: 'Escalar', 
    color: 'text-slate-400 border-slate-500/20 bg-slate-500/5 hover:bg-slate-500/10', 
    hex: '#64748b', 
    icon: ArrowUpRight, 
    desc: 'Notificar a alta gerencia porque excede el alcance del equipo.' 
  }
};

const STAGES = [
  { id: 'Identificado', label: 'Identificado', color: 'border-slate-500/20 text-slate-400 bg-slate-500/5', dotColor: 'bg-slate-400' },
  { id: 'Analizado', label: 'Planificado', color: 'border-yellow-500/20 text-yellow-400 bg-yellow-500/5', dotColor: 'bg-yellow-400' },
  { id: 'En tratamiento', label: 'En tratamiento', color: 'border-cyan-500/20 text-cyan-400 bg-cyan-500/5', dotColor: 'bg-cyan-400' },
  { id: 'En revisión', label: 'En revisión', color: 'border-purple-500/20 text-purple-400 bg-purple-500/5', dotColor: 'bg-purple-400' },
  { id: 'Mitigado', label: 'Mitigado / Cerrado', color: 'border-emerald-500/20 text-emerald-400 bg-emerald-500/5', dotColor: 'bg-emerald-400' }
];

export default function Treatment() {
  const { activeProjectId } = useAppStore();
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [viewMode, setViewMode] = useState('flow'); // 'flow' | 'matrix' | 'table'
  const [selectedRiskId, setSelectedRiskId] = useState(null);
  
  const [filters, setFilters] = useState({
    search: '',
    classification: '',
    status: '',
    strategy: '',
    owner: ''
  });

  const { register, handleSubmit, reset } = useForm();

  const fetchRisks = useCallback(async () => {
    if (!activeProjectId) return;
    setLoading(true);
    try {
      const data = await api.get(`/projects/${activeProjectId}/risks`);
      setRisks(data || []);
    } catch {
      setRisks([]);
    } finally {
      setLoading(false);
    }
  }, [activeProjectId]);

  useEffect(() => {
    fetchRisks();
  }, [fetchRisks]);

  // ISO 31000 focuses treatment on non-Low risks
  const openRisks = useMemo(() => {
    return risks.filter((r) => r.classification !== 'Bajo');
  }, [risks]);

  // Auto select first risk when openRisks changes
  useEffect(() => {
    if (openRisks.length > 0 && !selectedRiskId) {
      const crit = openRisks.find(r => r.classification === 'Crítico');
      const high = openRisks.find(r => r.classification === 'Alto');
      setSelectedRiskId(crit?.id || high?.id || openRisks[0].id);
    }
  }, [openRisks, selectedRiskId]);

  useEffect(() => {
    if (!editing) return;
    reset({
      responseStrategy: editing.responseStrategy || 'Mitigar',
      treatmentAction: editing.treatmentAction || '',
      reviewDate: editing.reviewDate || '',
      evidence: editing.evidence || '',
      expectedResult: editing.expectedResult || '',
      status: editing.status || 'En tratamiento',
      owner: editing.owner || '',
    });
  }, [editing, reset]);

  // Apply filters
  const filteredRisks = useMemo(() => {
    return openRisks.filter((r) => {
      if (filters.classification && r.classification !== filters.classification) return false;
      if (filters.status && r.status !== filters.status) return false;
      if (filters.strategy && r.responseStrategy !== filters.strategy) return false;
      if (filters.owner && r.owner !== filters.owner) return false;
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
  }, [openRisks, filters]);

  const uniqueOwners = useMemo(() => {
    const owners = new Set(openRisks.map(r => r.owner).filter(Boolean));
    return Array.from(owners);
  }, [openRisks]);

  async function save(data) {
    try {
      await api.put(`/risks/${editing.id}`, data);
      await fetchRisks();
      setEditing(null);
    } catch (e) {
      alert(`${e.message}\n${(e.details || []).join('\n')}`);
    }
  }

  async function quickUpdateStatus(riskId, newStatus) {
    try {
      await api.put(`/risks/${riskId}`, { status: newStatus });
      await fetchRisks();
    } catch (e) {
      alert(`Error al actualizar estado: ${e.message}`);
    }
  }

  // ISO treatment progress calculator
  const calculateTreatmentProgress = useCallback((r) => {
    let score = 0;
    if (r.responseStrategy) score += 20;
    if (r.treatmentAction && r.treatmentAction.trim().length > 0) score += 30;
    if (r.owner && r.owner.trim().length > 0) score += 15;
    if (r.reviewDate) score += 15;
    if (r.status === 'Mitigado' || r.status === 'Cerrado') score += 20;
    else if (r.status === 'En tratamiento') score += 10;
    return score;
  }, []);

  // KPIs
  const totalCount = openRisks.length;
  const criticalCount = openRisks.filter(r => r.classification === 'Crítico').length;
  const inTreatment = openRisks.filter(r => r.status === 'En tratamiento').length;
  const completed = openRisks.filter(r => r.status === 'Mitigado' || r.status === 'Cerrado').length;

  const overdueCount = useMemo(() => {
    const today = new Date();
    return openRisks.filter(r => 
      r.reviewDate && 
      new Date(r.reviewDate) < today && 
      r.status !== 'Mitigado' && 
      r.status !== 'Cerrado'
    ).length;
  }, [openRisks]);

  const noOwnerCount = useMemo(() => {
    return openRisks.filter(r => !r.owner || r.owner.trim() === '').length;
  }, [openRisks]);

  const avgMitigationProgress = useMemo(() => {
    if (!openRisks.length) return 0;
    const totalProg = openRisks.reduce((acc, r) => acc + calculateTreatmentProgress(r), 0);
    return Math.round(totalProg / openRisks.length);
  }, [openRisks, calculateTreatmentProgress]);

  // Overall Mitigation Status description
  const systemHealth = useMemo(() => {
    const criticalRisks = openRisks.filter(r => r.classification === 'Crítico');
    const criticalNoActionCount = criticalRisks.filter(r => !r.treatmentAction || r.treatmentAction.trim() === '').length;

    if (overdueCount > 0 || (criticalRisks.length > 0 && avgMitigationProgress < 40)) {
      return { label: 'Crítico', color: 'text-red-400', bg: 'bg-red-400/10 border-red-500/20', desc: 'Tratamientos vencidos o retraso severo detectado en mitigación.' };
    }
    if (criticalNoActionCount > 0 || noOwnerCount > 0) {
      return { label: 'Atención requerida', color: 'text-orange-400', bg: 'bg-orange-400/10 border-orange-500/20', desc: 'Existen riesgos críticos sin acciones preventivas o sin líder asignado.' };
    }
    if (inTreatment > 0) {
      return { label: 'En ejecución', color: 'text-cyan-400', bg: 'bg-cyan-400/10 border-cyan-500/20', desc: 'Mitigaciones en progreso. Monitoreo regular activo.' };
    }
    return { label: 'Bajo control', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-500/20', desc: 'Todos los tratamientos se encuentran al día y planificados.' };
  }, [openRisks, overdueCount, noOwnerCount, inTreatment, avgMitigationProgress]);

  // Stage Grouping for "Treatment Flow"
  const stageGroups = useMemo(() => {
    const groups = {
      'Identificado': [],
      'Analizado': [],
      'En tratamiento': [],
      'En revisión': [],
      'Mitigado': []
    };
    filteredRisks.forEach((r) => {
      if (r.status === 'Mitigado' || r.status === 'Cerrado') groups['Mitigado'].push(r);
      else if (r.status === 'En revisión') groups['En revisión'].push(r);
      else if (r.status === 'En tratamiento') groups['En tratamiento'].push(r);
      else if (r.status === 'Analizado') groups['Analizado'].push(r);
      else groups['Identificado'].push(r);
    });
    return groups;
  }, [filteredRisks]);

  // Matrix cell mapping (horizontal: stage, vertical: classification)
  const matrixCells = useMemo(() => {
    const cells = {};
    filteredRisks.forEach((r) => {
      const row = r.classification; // 'Crítico' | 'Alto' | 'Medio'
      let col = 'Identificado';
      if (r.status === 'Mitigado' || r.status === 'Cerrado') col = 'Mitigado';
      else if (r.status === 'En revisión') col = 'En revisión';
      else if (r.status === 'En tratamiento') col = 'En tratamiento';
      else if (r.status === 'Analizado') col = 'Analizado';

      const key = `${row}-${col}`;
      if (!cells[key]) cells[key] = [];
      cells[key].push(r);
    });
    return cells;
  }, [filteredRisks]);

  // Attention Priority List
  const priorityAlerts = useMemo(() => {
    const alerts = [];
    const today = new Date();
    
    openRisks.forEach((r) => {
      const isCrit = r.classification === 'Crítico';
      const noAction = !r.treatmentAction || r.treatmentAction.trim() === '';
      const prog = calculateTreatmentProgress(r);
      const isOverdue = r.reviewDate && new Date(r.reviewDate) < today && r.status !== 'Mitigado' && r.status !== 'Cerrado';
      const noOwner = !r.owner || r.owner.trim() === '';

      if (isCrit && noAction) {
        alerts.push({ type: 'danger', text: `Riesgo crítico ${r.code} sin control preventivo registrado`, riskId: r.id });
      }
      if (isOverdue) {
        alerts.push({ type: 'warning', text: `Fecha de revisión vencida para ${r.code} (${r.reviewDate})`, riskId: r.id });
      }
      if (isCrit && prog < 40 && r.status !== 'Mitigado' && r.status !== 'Cerrado') {
        alerts.push({ type: 'warning', text: `Riesgo crítico ${r.code} con bajo avance de mitigación (${prog}%)`, riskId: r.id });
      }
      if (noOwner && r.status !== 'Mitigado' && r.status !== 'Cerrado') {
        alerts.push({ type: 'info', text: `Riesgo ${r.code} sin responsable de tratamiento asignado`, riskId: r.id });
      }
    });
    return alerts;
  }, [openRisks, calculateTreatmentProgress]);

  const selectedRisk = openRisks.find(r => r.id === selectedRiskId);

  if (!activeProjectId) {
    return <EmptyState icon={ListChecks} title="Selecciona un proyecto" description="Aquí se definen y gestionan los planes de tratamiento de riesgos de impacto Medio, Alto y Crítico." />;
  }

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({ search: '', classification: '', status: '', strategy: '', owner: '' });
  };

  return (
    <div className="space-y-6">
      
      {/* 1. Encabezado ejecutivo */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h1 className="text-2xl font-semibold text-[#f7f8f8] flex items-center gap-2">
            <Activity className="text-[#06b6d4] animate-pulse shrink-0" size={24} />
            Tratamiento de Riesgos
          </h1>
          <p className="text-xs text-[#8a8f98] mt-1.5">
            Define, prioriza y monitorea controles para riesgos de impacto medio, alto y crítico.
          </p>
        </div>

        {/* Global health alert bar */}
        <div className={`flex flex-col sm:flex-row items-start sm:items-center gap-3.5 px-4 py-3 rounded-2xl border backdrop-blur-md max-w-md ${systemHealth.bg}`}>
          <div>
            <span className="text-[8px] font-black uppercase text-slate-500 tracking-wider">Estado de Mitigación</span>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" style={{ color: systemHealth.color }} />
              <span className={`text-xs font-black uppercase ${systemHealth.color}`}>{systemHealth.label}</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 leading-snug">{systemHealth.desc}</p>
          </div>
        </div>
      </div>

      {/* 2. Métricas superiores rediseñadas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Metric A tratar */}
        <div className="module-card module-card-pad flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Riesgos a Tratar</p>
              <p className="text-2xl font-black font-mono text-white mt-1.5">{totalCount} <span className="text-[10px] text-slate-500 font-normal">no bajos</span></p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 shrink-0">
              <ShieldAlert size={16} />
            </div>
          </div>
          <div className="h-1 rounded-full overflow-hidden bg-white/[0.04]">
            <div className="h-full bg-orange-400" style={{ width: `${totalCount ? 100 : 0}%` }} />
          </div>
          <div className="text-[8.5px] text-slate-500 font-mono">
            {noOwnerCount > 0 ? `${noOwnerCount} sin responsable asignado` : 'Todos los riesgos con líder'}
          </div>
        </div>

        {/* Metric Críticos */}
        <div className="module-card module-card-pad flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Críticos Abiertos</p>
              <p className="text-2xl font-black font-mono text-red-400 mt-1.5">{criticalCount}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div className="h-1 rounded-full overflow-hidden bg-white/[0.04]">
            <div className="h-full bg-red-400" style={{ width: `${totalCount ? (criticalCount / totalCount) * 100 : 0}%` }} />
          </div>
          <div className="text-[8.5px] text-slate-500 font-mono flex items-center justify-between">
            <span>Alertas activas</span>
            <span className="text-red-400 font-bold font-mono">{criticalCount}</span>
          </div>
        </div>

        {/* Metric En Ejecución */}
        <div className="module-card module-card-pad flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">En Ejecución</p>
              <p className="text-2xl font-black font-mono text-cyan-400 mt-1.5">{inTreatment}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 shrink-0">
              <Clock size={16} />
            </div>
          </div>
          <div className="h-1 rounded-full overflow-hidden bg-white/[0.04]">
            <div className="h-full bg-cyan-400" style={{ width: `${totalCount ? (inTreatment / totalCount) * 100 : 0}%` }} />
          </div>
          <div className="text-[8.5px] text-slate-500 font-mono flex items-center justify-between">
            <span>Tratamientos activos</span>
            <span className="text-cyan-400 font-bold">{inTreatment}</span>
          </div>
        </div>

        {/* Metric Vencidos */}
        <div className="module-card module-card-pad flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tratamientos Vencidos</p>
              <p className="text-2xl font-black font-mono text-rose-400 mt-1.5">{overdueCount}</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 shrink-0">
              <AlertCircle size={16} />
            </div>
          </div>
          <div className="h-1 rounded-full overflow-hidden bg-white/[0.04]">
            <div className="h-full bg-rose-500" style={{ width: `${totalCount ? (overdueCount / totalCount) * 100 : 0}%` }} />
          </div>
          <div className="text-[8.5px] text-slate-500 font-mono flex items-center justify-between">
            <span>Requieren atención</span>
            <span className="text-rose-400 font-bold font-mono">{overdueCount}</span>
          </div>
        </div>

        {/* Metric Mitigación Promedio */}
        <div className="module-card module-card-pad flex flex-col justify-between gap-3">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Avance Promedio</p>
              <p className="text-2xl font-black font-mono text-emerald-400 mt-1.5">{avgMitigationProgress}%</p>
            </div>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden bg-white/[0.04] border border-white/5">
            <div className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400" style={{ width: `${avgMitigationProgress}%` }} />
          </div>
          <div className="text-[8.5px] text-slate-500 font-mono">
            Tasa de efectividad general
          </div>
        </div>
      </div>

      {/* 3. Atención Prioritaria (Alertas Inteligentes Accionables) */}
      {priorityAlerts.length > 0 && (
        <Card className="border-red-500/10 bg-red-950/5 rounded-2xl p-4">
          <CardHeader className="p-0 pb-2 flex flex-row items-center gap-2 border-b border-white/5">
            <AlertCircle size={14} className="text-red-400" />
            <CardTitle className="text-xs uppercase font-bold text-slate-400 tracking-widest">Atención Prioritaria (Alertas)</CardTitle>
          </CardHeader>
          <CardContent className="p-0 pt-2.5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {priorityAlerts.slice(0, 6).map((alert, idx) => (
              <div 
                key={idx}
                onClick={() => setSelectedRiskId(alert.riskId)}
                className={`p-2.5 rounded-xl border flex items-center justify-between gap-2.5 transition-all duration-300 hover:scale-[1.01] cursor-pointer text-[10.5px] ${
                  alert.type === 'danger'
                    ? 'bg-red-500/5 border-red-500/15 text-red-400 hover:bg-red-500/10'
                    : alert.type === 'warning'
                      ? 'bg-amber-500/5 border-amber-500/15 text-amber-400 hover:bg-amber-500/10'
                      : 'bg-slate-900/40 border-white/5 text-slate-300 hover:bg-slate-900/60'
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="w-1.5 h-1.5 rounded-full bg-current shrink-0 animate-pulse" />
                  <span className="truncate">{alert.text}</span>
                </div>
                <ArrowUpRight size={12} className="opacity-40 shrink-0" />
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Main Container: Split with Control Deck */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        
        {/* Left column (Visualizations and view selectors) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Filters Bar & View Switcher */}
          <Card className="border-white/5 bg-[#090d1a]/30 backdrop-blur-xl rounded-2xl">
            <CardContent className="p-4 space-y-4">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                
                {/* Dynamic Filters select dropdowns */}
                <div className="flex-1 flex flex-wrap items-center gap-2">
                  <div className="relative w-full sm:w-[200px]">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={12} />
                    <input 
                      type="text"
                      className="pl-8 w-full bg-[#12151e] border border-white/10 text-white rounded-xl py-1.5 text-xs focus:outline-none focus:border-cyan-500/50 transition-colors placeholder:text-slate-600"
                      placeholder="Buscar plan..."
                      value={filters.search}
                      onChange={(e) => handleFilterChange('search', e.target.value)}
                    />
                  </div>

                  <select 
                    className="text-xs bg-[#12151e] border border-white/10 rounded-xl px-3 py-1.5 text-slate-300 cursor-pointer focus:outline-none"
                    value={filters.classification}
                    onChange={(e) => handleFilterChange('classification', e.target.value)}
                  >
                    <option value="" className="bg-[#1a1d27] text-white">Severidad (Todas)</option>
                    <option value="Crítico" className="bg-[#1a1d27] text-white">Crítico</option>
                    <option value="Alto" className="bg-[#1a1d27] text-white">Alto</option>
                    <option value="Medio" className="bg-[#1a1d27] text-white">Medio</option>
                  </select>

                  <select 
                    className="text-xs bg-[#12151e] border border-white/10 rounded-xl px-3 py-1.5 text-slate-300 cursor-pointer focus:outline-none"
                    value={filters.strategy}
                    onChange={(e) => handleFilterChange('strategy', e.target.value)}
                  >
                    <option value="" className="bg-[#1a1d27] text-white">Estrategia (Todas)</option>
                    {RESPONSE_STRATEGIES.map(s => <option key={s} value={s} className="bg-[#1a1d27] text-white">{s}</option>)}
                  </select>

                  <select 
                    className="text-xs bg-[#12151e] border border-white/10 rounded-xl px-3 py-1.5 text-slate-300 cursor-pointer focus:outline-none"
                    value={filters.owner}
                    onChange={(e) => handleFilterChange('owner', e.target.value)}
                  >
                    <option value="" className="bg-[#1a1d27] text-white">Responsables (Todos)</option>
                    {uniqueOwners.map(o => <option key={o} value={o} className="bg-[#1a1d27] text-white">{o}</option>)}
                  </select>

                  {(filters.search || filters.classification || filters.strategy || filters.owner) && (
                    <Button 
                      variant="ghost" 
                      onClick={clearFilters}
                      className="text-[10px] text-red-400 hover:text-red-300 font-bold uppercase tracking-wider h-8"
                    >
                      Limpiar ({filteredRisks.length} result.)
                    </Button>
                  )}
                </div>

                {/* View switcher buttons */}
                <div className="flex items-center gap-1 bg-slate-950/40 p-1 border border-white/5 rounded-xl shrink-0 w-fit">
                  <button
                    onClick={() => setViewMode('flow')}
                    className={`h-7 text-[10px] font-black uppercase tracking-wider rounded-lg px-3 transition-all cursor-pointer flex items-center gap-1 ${
                      viewMode === 'flow' ? 'bg-[#06b6d4]/10 text-[#06b6d4] border border-[#06b6d4]/20' : 'text-slate-400 hover:text-white border border-transparent'
                    }`}
                  >
                    <Layers size={12} /> Treatment Flow
                  </button>
                  <button
                    onClick={() => setViewMode('matrix')}
                    className={`h-7 text-[10px] font-black uppercase tracking-wider rounded-lg px-3 transition-all cursor-pointer flex items-center gap-1 ${
                      viewMode === 'matrix' ? 'bg-[#06b6d4]/10 text-[#06b6d4] border border-[#06b6d4]/20' : 'text-slate-400 hover:text-white border border-transparent'
                    }`}
                  >
                    <BarChart2 size={12} /> Matriz
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

          {/* Core Visualizations */}
          {loading ? (
            <div className="text-center py-20 text-slate-500">Cargando flujos de tratamiento...</div>
          ) : filteredRisks.length === 0 ? (
            <EmptyState title="Sin planes pendientes" description="No hay riesgos identificados que coincidan con los criterios de búsqueda activos." />
          ) : viewMode === 'flow' ? (
            /* Treatment Flow stage lanes view */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3.5 items-stretch">
              {STAGES.map((stage) => {
                const items = stageGroups[stage.id] || [];
                const pct = filteredRisks.length ? Math.round((items.length / filteredRisks.length) * 100) : 0;
                const isBottleneck = items.length > 5 && stage.id !== 'Mitigado';
                return (
                  <div key={stage.id} className="flex flex-col space-y-3 rounded-2xl module-card p-2.5 min-h-[440px] border-white/5 relative">
                    
                    {/* Header */}
                    <div className="pb-2 border-b border-white/5 space-y-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-black uppercase tracking-wider text-slate-300 flex items-center gap-1">
                          <span className={`w-1.5 h-1.5 rounded-full ${stage.dotColor}`} />
                          {stage.label}
                        </span>
                        <span className="text-[10px] font-bold bg-white/5 text-slate-400 px-1.5 py-0.5 rounded border border-white/5">
                          {items.length}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[8px] font-bold text-slate-500 font-mono">
                        <span>Frecuencia</span>
                        <span>{pct}%</span>
                      </div>
                      
                      {isBottleneck && (
                        <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[8px] font-black px-1.5 py-0.5 rounded-md text-center animate-pulse">
                          ⚠️ Posible Cuello de Botella
                        </div>
                      )}
                    </div>

                    {/* Stage risks scroll box */}
                    <div className="flex-1 overflow-y-auto max-h-[58vh] space-y-2.5 pr-0.5 custom-scrollbar">
                      {items.length === 0 ? (
                        <div className="h-full flex items-center justify-center p-4 text-[9px] text-slate-600 text-center border border-dashed border-white/5 rounded-xl bg-white/[0.005]">
                          Sin registros
                        </div>
                      ) : (
                        items.map((r) => {
                          const isSelected = selectedRiskId === r.id;
                          const isOverdue = r.reviewDate && new Date(r.reviewDate) < new Date();
                          const strat = STRATEGY_DETAILS[r.responseStrategy || 'Mitigar'];
                          const progress = calculateTreatmentProgress(r);
                          const isCrit = r.classification === 'Crítico';
                          return (
                            <div
                              key={r.id}
                              onClick={() => setSelectedRiskId(r.id)}
                              className={`p-3 rounded-xl border cursor-pointer select-none transition-all duration-300 relative group flex flex-col justify-between min-h-[110px] ${
                                isSelected
                                  ? 'bg-slate-900 border-white/20 shadow-[0_0_15px_rgba(6,182,212,0.03)] scale-[1.02]'
                                  : 'bg-[#090d1a]/40 border-white/5 hover:border-white/10 hover:bg-[#0c122b]/60'
                              }`}
                            >
                              {/* Left warning indicator for overdue or critical */}
                              {isCrit ? (
                                <div className="absolute top-0 left-0 w-0.5 h-full bg-red-400" 
                                  style={{ boxShadow: isOverdue ? '0 0 8px #ef4444' : 'none' }} />
                              ) : r.classification === 'Alto' ? (
                                <div className="absolute top-0 left-0 w-0.5 h-full bg-orange-400" />
                              ) : null}

                              <div>
                                <div className="flex items-center justify-between gap-1 mb-2.5">
                                  <span className="font-mono text-[9px] font-bold text-cyan-400 tracking-wider bg-cyan-500/10 px-1.5 py-0.2 rounded border border-cyan-500/10">
                                    {r.code}
                                  </span>
                                  {strat && (
                                    <span className={`text-[8px] font-black uppercase px-1.5 py-0.2 rounded-full border flex items-center gap-0.5 ${strat.color}`} title={strat.desc}>
                                      <strat.icon size={8} /> {strat.label}
                                    </span>
                                  )}
                                </div>

                                <p className="text-[10px] font-bold text-white line-clamp-2 leading-normal">
                                  {r.title}
                                </p>
                              </div>

                              <div className="mt-3.5 space-y-1.5">
                                <div className="h-1 rounded-full bg-white/[0.04] overflow-hidden border border-white/5 relative">
                                  <div className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-500" 
                                    style={{ width: `${progress}%` }} />
                                </div>
                                
                                <div className="flex items-center justify-between text-[8px] font-mono text-slate-500">
                                  <span className="truncate max-w-[55px]" title={r.owner}>{r.owner || 'Sin owner'}</span>
                                  {isOverdue && stage.id !== 'Mitigado' ? (
                                    <span className="text-red-400 font-bold animate-pulse">VENCIDO</span>
                                  ) : (
                                    <span className="text-slate-400">{progress}%</span>
                                  )}
                                </div>
                              </div>

                            </div>
                          );
                        })
                      )}
                    </div>

                  </div>
                );
              })}
            </div>
          ) : viewMode === 'matrix' ? (
            /* Treatment Matrix grid view */
            <div className="module-card p-6 flex flex-col items-center justify-center min-h-[440px]">
              <div className="w-full max-w-[650px] space-y-4">
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest text-center select-none">Matriz de Estado vs. Severidad</p>
                <div className="border border-white/5 rounded-2xl overflow-hidden bg-slate-950/20 backdrop-blur-md">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.01]">
                        <th className="p-3 text-[9px] uppercase font-black tracking-wider text-slate-500">Severidad</th>
                        {STAGES.map(s => (
                          <th key={s.id} className="p-3 text-[9px] uppercase font-black tracking-wider text-slate-500 text-center">{s.label}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {['Crítico', 'Alto', 'Medio'].map((severity) => {
                        let severityColor = 'text-red-400';
                        if (severity === 'Alto') severityColor = 'text-orange-400';
                        else if (severity === 'Medio') severityColor = 'text-yellow-400';
                        return (
                          <tr key={severity} className="border-b border-white/5 hover:bg-white/[0.01]">
                            <td className="p-3 font-bold text-xs"><span className={severityColor}>{severity}</span></td>
                            {STAGES.map(s => {
                              const key = `${severity}-${s.id}`;
                              const cellRisks = matrixCells[key] || [];
                              return (
                                <td key={s.id} className="p-3 text-center">
                                  {cellRisks.length > 0 ? (
                                    <div className="flex flex-col items-center gap-1">
                                      <button 
                                        onClick={() => {
                                          setSelectedRiskId(cellRisks[0].id);
                                        }}
                                        className={`w-6 h-6 rounded-full font-mono text-[9px] font-black cursor-pointer flex items-center justify-center transition-all hover:scale-115 ${
                                          severity === 'Crítico' 
                                            ? 'bg-red-500/10 border border-red-500/30 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.2)]'
                                            : severity === 'Alto'
                                              ? 'bg-orange-500/10 border border-orange-500/30 text-orange-400'
                                              : 'bg-yellow-500/10 border border-yellow-500/30 text-yellow-400'
                                        }`}
                                      >
                                        {cellRisks.length}
                                      </button>
                                      
                                      <div className="flex gap-0.5 justify-center max-w-[80px] flex-wrap">
                                        {cellRisks.map(r => (
                                          <span 
                                            key={r.id} 
                                            onClick={() => setSelectedRiskId(r.id)}
                                            className={`text-[6.5px] font-mono font-bold px-1 rounded-sm cursor-pointer hover:underline ${
                                              selectedRiskId === r.id ? 'bg-white text-slate-900 font-black' : 'text-slate-400 bg-white/5'
                                            }`}
                                          >
                                            {r.code}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  ) : (
                                    <span className="text-[9px] font-bold text-slate-700 font-mono">-</span>
                                  )}
                                </td>
                              );
                            })}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            /* Classic Table view */
            <Card className="border-white/5 bg-[#090d1a]/40 backdrop-blur-xl shadow-md overflow-hidden rounded-2xl">
              <Table>
                <TableHeader className="bg-white/5 border-b border-white/5">
                  <TableRow className="hover:bg-transparent border-white/5">
                    <TableHead className="w-[120px] text-xs uppercase tracking-wider text-muted-foreground/80 font-bold py-3">Código</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/80 font-bold py-3">Riesgo</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/80 font-bold py-3">Severidad</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/80 font-bold py-3">Estrategia</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/80 font-bold py-3 text-center">Avance</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/80 font-bold py-3">Responsable</TableHead>
                    <TableHead className="text-xs uppercase tracking-wider text-muted-foreground/80 font-bold py-3">Estado</TableHead>
                    <TableHead className="text-right w-[90px] py-3 pr-4"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRisks.map((r) => {
                    const progress = calculateTreatmentProgress(r);
                    const isSelected = selectedRiskId === r.id;
                    return (
                      <TableRow 
                        key={r.id}
                        className={`hover:bg-white/5 border-white/5 cursor-pointer transition-colors ${
                          isSelected ? 'bg-cyan-500/[0.03]' : ''
                        }`}
                        onClick={() => setSelectedRiskId(r.id)}
                      >
                        <TableCell className="font-mono text-[10px] font-bold text-cyan-400 py-3">{r.code}</TableCell>
                        <TableCell className="py-3 font-semibold text-white text-xs">{r.title}</TableCell>
                        <TableCell className="py-3"><RiskBadge value={r.classification} /></TableCell>
                        <TableCell className="py-3 text-xs text-slate-300 font-semibold">{r.responseStrategy || '—'}</TableCell>
                        <TableCell className="py-3">
                          <div className="flex items-center justify-center gap-1.5 font-mono text-[10px] font-bold text-cyan-400">
                            <span className="w-10 text-right">{progress}%</span>
                            <div className="w-12 h-1 rounded-full bg-white/[0.04] overflow-hidden">
                              <div className="h-full bg-cyan-400" style={{ width: `${progress}%` }} />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-3 text-xs text-slate-400">{r.owner || '—'}</TableCell>
                        <TableCell className="py-3">
                          <Badge variant="outline" className="text-[9px] py-0 bg-white/5 border-white/5 text-slate-300">
                            {r.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="py-3 text-right pr-4">
                          <Button variant="outline" size="sm" className="h-7 text-xs border-white/10 hover:bg-white/10" onClick={(e) => { e.stopPropagation(); setEditing(r); }}>
                            <Pencil size={11} /> Editar
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </Card>
          )}

        </div>

        {/* Right column: Selected Control Deck panel (Spans 1/4) */}
        <div className="lg:col-span-1">
          {selectedRisk ? (
            <div className="module-card module-card-pad space-y-4 flex flex-col justify-between h-full min-h-[440px] border-l border-white/5 relative overflow-hidden animate-[fadeIn_0.3s_ease-out]">
              
              <div className="space-y-4">
                {/* Header details */}
                <div className="border-b border-white/5 pb-3">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-mono text-xs font-bold text-cyan-400 tracking-wider bg-cyan-500/10 px-2.5 py-0.5 rounded-lg border border-cyan-500/20">
                      {selectedRisk.code}
                    </span>
                    <RiskBadge value={selectedRisk.classification} />
                  </div>
                  <h3 className="text-sm font-semibold text-white leading-snug break-words">
                    {selectedRisk.title}
                  </h3>
                  
                  {/* Strategy Badge */}
                  {selectedRisk.responseStrategy && (
                    <div className="mt-2.5">
                      {(() => {
                        const strat = STRATEGY_DETAILS[selectedRisk.responseStrategy];
                        if (!strat) return null;
                        return (
                          <div className={`p-2 rounded-xl border text-[9.5px] leading-relaxed font-medium ${strat.color}`}>
                            <div className="flex items-center gap-1 font-bold">
                              <strat.icon size={11} /> Estrategia: {strat.label}
                            </div>
                            <span className="block text-slate-400 mt-1 font-normal leading-normal">{strat.desc}</span>
                          </div>
                        );
                      })()}
                    </div>
                  )}
                </div>

                {/* Progress bar comparison: Inherent vs Residual */}
                {(() => {
                  const inherent = selectedRisk.level;
                  const residual = selectedRisk.status === 'Mitigado' || selectedRisk.status === 'Cerrado'
                    ? Math.max(1, Math.round(inherent * 0.3))
                    : selectedRisk.status === 'En revisión'
                      ? Math.max(1, Math.round(inherent * 0.45))
                      : selectedRisk.status === 'En tratamiento'
                        ? Math.max(1, Math.round(inherent * 0.6))
                        : Math.max(1, Math.round(inherent * 0.85));
                  const reductionPct = Math.round(((inherent - residual) / inherent) * 100);
                  const progress = calculateTreatmentProgress(selectedRisk);
                  return (
                    <div className="space-y-3 bg-slate-950/40 p-3.5 border border-white/5 rounded-2xl">
                      <div className="flex items-center justify-between text-[9px] font-bold text-slate-400">
                        <span>Atenuación del Riesgo</span>
                        <span className="text-emerald-400 font-mono">Reducción: -{reductionPct}%</span>
                      </div>
                      
                      {/* Inherent */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[8px] text-slate-500 font-bold uppercase tracking-wider">
                          <span>Exposición Inherente</span>
                          <span className="text-white font-mono">{inherent} / 25</span>
                        </div>
                        <div className="h-1 rounded-full bg-white/[0.04]">
                          <div className="h-full bg-red-500" style={{ width: `${(inherent / 25) * 100}%` }} />
                        </div>
                      </div>

                      {/* Residual */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-[8px] text-slate-500 font-bold uppercase tracking-wider">
                          <span>Exposición Residual</span>
                          <span className="text-white font-mono">{residual} / 25</span>
                        </div>
                        <div className="h-1 rounded-full bg-white/[0.04]">
                          <div className="h-full bg-emerald-500" style={{ width: `${(residual / 25) * 100}%` }} />
                        </div>
                      </div>

                      {/* Mitigation Progress */}
                      <div className="space-y-1 pt-1">
                        <div className="flex justify-between text-[8px] text-slate-500 font-bold uppercase tracking-wider">
                          <span>Avance de Controles</span>
                          <span className="text-cyan-400 font-mono">{progress}%</span>
                        </div>
                        <div className="h-1 rounded-full bg-white/[0.04]">
                          <div className="h-full bg-cyan-400" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Event Treatment Timeline */}
                {(() => {
                  const timelineEvents = [
                    { label: 'Riesgo Identificado', date: selectedRisk.identifiedAt || 'Fase Inicial', done: true },
                    { label: 'Estrategia Definida', date: selectedRisk.responseStrategy ? 'Completado' : 'Pendiente', done: !!selectedRisk.responseStrategy },
                    { label: 'Owner Asignado', date: selectedRisk.owner || 'Pendiente', done: !!selectedRisk.owner },
                    { label: 'Revisión Programada', date: selectedRisk.reviewDate || 'Pendiente', done: !!selectedRisk.reviewDate },
                    { label: 'Mitigación Finalizada', date: (selectedRisk.status === 'Mitigado' || selectedRisk.status === 'Cerrado') ? 'Cerrado' : 'Pendiente', done: (selectedRisk.status === 'Mitigado' || selectedRisk.status === 'Cerrado') }
                  ];
                  return (
                    <div className="space-y-2 bg-slate-950/40 p-3.5 border border-white/5 rounded-2xl">
                      <span className="text-[9px] font-black uppercase text-slate-500 tracking-wider block">Línea de Tiempo del Plan</span>
                      <div className="space-y-2.5 mt-2.5 select-none relative pl-2">
                        {/* Vertical line connector */}
                        <div className="absolute left-[5px] top-1.5 bottom-1.5 w-[1px] bg-white/5 -z-10" />

                        {timelineEvents.map((ev, i) => (
                          <div key={i} className="flex items-start gap-2.5">
                            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 transition-all ${ev.done ? 'bg-cyan-400 shadow-[0_0_6px_#06b6d4]' : 'bg-slate-800'}`} />
                            <div className="min-w-0">
                              <span className={`text-[8.5px] font-bold block leading-none ${ev.done ? 'text-slate-300' : 'text-slate-600'}`}>{ev.label}</span>
                              <span className="text-[7.5px] text-slate-500 font-mono block mt-0.5">{ev.date}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Control Action details and descriptions */}
                <div className="space-y-2.5 max-h-[18vh] overflow-y-auto pr-1 custom-scrollbar text-[11px] leading-relaxed text-slate-300 border-t border-white/5 pt-3">
                  {selectedRisk.treatmentAction ? (
                    <div>
                      <strong className="text-cyan-400 block text-[9px] uppercase tracking-wider mb-0.5">Acción Planificada</strong>
                      <p className="bg-slate-950/20 p-2.5 rounded-xl border border-white/5">{selectedRisk.treatmentAction}</p>
                    </div>
                  ) : (
                    <div className="bg-orange-500/5 border border-orange-500/10 p-2 rounded-xl text-center text-orange-400 text-[10px]">
                      ⚠️ Pendiente de documentar acción preventiva.
                    </div>
                  )}

                  {selectedRisk.expectedResult && (
                    <div>
                      <strong className="text-emerald-400 block text-[9px] uppercase tracking-wider mb-0.5">Resultado Esperado</strong>
                      <p className="bg-slate-950/10 p-2 rounded-lg border border-white/5">{selectedRisk.expectedResult}</p>
                    </div>
                  )}

                  {selectedRisk.evidence && (
                    <div>
                      <strong className="text-indigo-400 block text-[9px] uppercase tracking-wider mb-0.5">Evidencia Registrada</strong>
                      <p className="bg-slate-950/10 p-2 rounded-lg border border-white/5">{selectedRisk.evidence}</p>
                    </div>
                  )}
                </div>

              </div>

              {/* Action Buttons for quick update */}
              <div className="pt-3 border-t border-white/5 space-y-2 bg-slate-900/10">
                <div className="flex gap-2">
                  <select 
                    value={selectedRisk.status} 
                    onChange={(e) => quickUpdateStatus(selectedRisk.id, e.target.value)}
                    className="text-xs bg-[#12151e] border border-white/10 rounded-xl px-2.5 py-1.5 text-slate-300 cursor-pointer focus:outline-none flex-1"
                  >
                    {RISK_STATUSES.map(s => <option key={s} value={s} className="bg-[#1a1d27] text-white">{s}</option>)}
                  </select>
                  <Button 
                    variant="outline" 
                    size="icon" 
                    className="h-8 w-8 border-white/10 hover:bg-white/5 text-slate-300"
                    onClick={() => setEditing(selectedRisk)}
                    title="Editar Tratamiento"
                  >
                    <Pencil size={12} />
                  </Button>
                </div>

                <div className="grid grid-cols-3 gap-1 text-[9px] font-bold">
                  <button 
                    onClick={() => quickUpdateStatus(selectedRisk.id, 'En tratamiento')}
                    className="py-1 rounded bg-[#06b6d4]/5 border border-[#06b6d4]/10 text-cyan-400 hover:bg-[#06b6d4]/10 cursor-pointer text-center"
                  >
                    Tratamiento
                  </button>
                  <button 
                    onClick={() => quickUpdateStatus(selectedRisk.id, 'En revisión')}
                    className="py-1 rounded bg-purple-500/5 border border-purple-500/10 text-purple-400 hover:bg-purple-500/10 cursor-pointer text-center"
                  >
                    Revisar
                  </button>
                  <button 
                    onClick={() => quickUpdateStatus(selectedRisk.id, 'Mitigado')}
                    className="py-1 rounded bg-emerald-500/5 border border-emerald-500/10 text-emerald-400 hover:bg-emerald-500/10 cursor-pointer text-center"
                  >
                    Mitigar
                  </button>
                </div>
              </div>

            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
              <ListChecks size={28} className="text-slate-600 animate-pulse mb-3" />
              <p className="text-xs font-bold text-slate-400">Plan de Tratamiento</p>
              <p className="text-[10px] text-slate-600 mt-1">Selecciona una amenaza en el panel izquierdo para desplegar y actualizar su plan estratégico.</p>
            </div>
          )}
        </div>

      </div>

      {/* Dialog for Edit Treatment */}
      <Dialog open={!!editing} onOpenChange={(isOpen) => { if (!isOpen) setEditing(null); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto text-white">
          <DialogHeader className="border-b border-white/5 pb-3">
            <DialogTitle className="flex items-center gap-1.5 text-base">
              <ListChecks size={16} className="text-[#06b6d4] shrink-0" /> Plan de Tratamiento — {editing?.code}
            </DialogTitle>
          </DialogHeader>
          
          {editing ? (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-3">
              {/* Form fields (Left column, 2/3) */}
              <form className="lg:col-span-2 space-y-4" onSubmit={handleSubmit(save)}>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="responseStrategy" className="text-xs text-slate-400 uppercase font-semibold">Estrategia de Respuesta (ISO 31000)</Label>
                    <select 
                      id="responseStrategy"
                      className="text-xs bg-[#12151e] border border-white/10 rounded-xl px-3 py-2 text-slate-300 cursor-pointer focus:outline-none w-full"
                      {...register('responseStrategy')}
                    >
                      {RESPONSE_STRATEGIES.map((s) => (
                        <option key={s} value={s} className="bg-[#1a1d27] text-white">{s}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="status" className="text-xs text-slate-400 uppercase font-semibold">Estado del Tratamiento</Label>
                    <select 
                      id="status"
                      className="text-xs bg-[#12151e] border border-white/10 rounded-xl px-3 py-2 text-slate-300 cursor-pointer focus:outline-none w-full"
                      {...register('status')}
                    >
                      {RISK_STATUSES.map((s) => (
                        <option key={s} value={s} className="bg-[#1a1d27] text-white">{s}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="treatmentAction" className="text-xs text-slate-400 uppercase font-semibold">Acción de tratamiento (Controles Preventivos)</Label>
                    {editing.classification === 'Crítico' && (
                      <span className="text-[9px] text-red-400 font-bold font-mono animate-pulse">* Requerido para riesgos críticos</span>
                    )}
                  </div>
                  <Textarea 
                    id="treatmentAction" 
                    rows={3} 
                    className="bg-slate-900/40 border-white/10 focus:border-cyan-500/50 resize-y text-xs text-white"
                    {...register('treatmentAction')} 
                    placeholder="Describe las acciones concretas para mitigar o responder al riesgo..."
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="reviewDate" className="text-xs text-slate-400 uppercase font-semibold">Fecha límite de revisión</Label>
                    <Input id="reviewDate" type="date" className="bg-slate-900/40 border-white/10 focus:border-cyan-500/50 text-slate-300 text-xs" {...register('reviewDate')} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="owner" className="text-xs text-slate-400 uppercase font-semibold">Líder de Mitigación (Owner)</Label>
                    <Input id="owner" className="bg-slate-900/40 border-white/10 focus:border-cyan-500/50 text-slate-300 text-xs" {...register('owner')} placeholder="Nombre del líder a cargo" />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="evidence" className="text-xs text-slate-400 uppercase font-semibold">Evidencia de Implementación</Label>
                    <Textarea id="evidence" rows={3} className="bg-slate-900/40 border-white/10 resize-y text-xs text-white" {...register('evidence')} placeholder="Métricas, auditorías, enlaces o pruebas de que el control fue aplicado..." />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="expectedResult" className="text-xs text-slate-400 uppercase font-semibold">Resultado de Mitigación Esperado</Label>
                    <Textarea id="expectedResult" rows={3} className="bg-slate-900/40 border-white/10 resize-y text-xs text-white" {...register('expectedResult')} placeholder="Describe la reducción esperada del nivel de impacto o probabilidad..." />
                  </div>
                </div>

                <DialogFooter className="gap-2 pt-4 border-t border-white/5">
                  <Button type="button" variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={() => setEditing(null)}>Cancelar</Button>
                  <Button type="submit">Guardar tratamiento</Button>
                </DialogFooter>
              </form>

              {/* Strategy guidance column (Right column, 1/3) */}
              <div className="space-y-4">
                <Card className="card">
                  <CardHeader className="pb-2 border-b border-white/[0.06]">
                    <CardTitle className="text-xs font-semibold text-[#8a8f98] uppercase tracking-wider">
                      Guía ISO 31000
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-3 space-y-3 text-xs text-slate-300 leading-relaxed max-h-[45vh] overflow-y-auto custom-scrollbar">
                    <p className="text-slate-400 text-[10.5px]">
                      Pautas estratégicas para el tratamiento según la ISO 31000:
                    </p>
                    
                    <div className="space-y-2.5 text-[10px]">
                      {Object.keys(STRATEGY_DETAILS).map(s => {
                        const strat = STRATEGY_DETAILS[s];
                        return (
                          <div key={s} className="bg-slate-950/20 p-2.5 rounded-xl border border-white/5">
                            <strong className="text-cyan-400 flex items-center gap-1">
                              <strat.icon size={11} /> {s}
                            </strong>
                            <span className="text-slate-400 block mt-1 leading-normal">{strat.desc}</span>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          ) : null}
        </DialogContent>
      </Dialog>
      
    </div>
  );
}

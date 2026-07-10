import { useCallback, useEffect, useState, Fragment, useMemo } from 'react';
import { api } from '../services/api.js';
import { useAppStore } from '../store/useAppStore.js';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import FilterBar, { SearchInput, Select } from '../components/FilterBar.jsx';
import EmptyState from '../components/EmptyState.jsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { 
  ChevronDown, ChevronUp, Package, Settings, AlertCircle, RefreshCw, 
  Layers, User, Calendar, Link2, Folder, FolderOpen, Target, ShieldAlert, Cpu, Plus 
} from 'lucide-react';

const DELIVERABLE_OPTIONS = ['E1','E2','E3','E4','E5','E6','E7'];
const MONTH_OPTIONS = ['Mes 01','Mes 02','Mes 03','Mes 04','Mes 05','Mes 06','Mes 07','Mes 08'];
const DOMAIN_OPTIONS = ['Incertidumbre','Ambigüedad','Complejidad','Volatilidad'];
const CLASSIFICATION_COLORS = {
  'Bajo':     'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25',
  'Medio':    'bg-yellow-500/15 text-yellow-300 border border-yellow-500/25',
  'Alto':     'bg-orange-500/15 text-orange-300 border border-orange-500/25',
  'Crítico':  'bg-red-500/15 text-red-300 border border-red-500/25',
};

const CATEGORY_ICONS = {
  RRHH:               '👥',
  FisicoTecnologico:  '🖥️',
  FisicoMaterial:     '📦',
  Virtual:            '☁️',
};

const chartConfig = {
  total: {
    label: "Actividades",
    color: "text-[hsl(var(--primary))]",
  },
  riesgo: {
    label: "Riesgo (P×I)",
    color: "hsl(24, 95%, 53%)", // orange/amber
  },
};

export default function Activities() {
  const { activeProjectId } = useAppStore();
  const [items, setItems] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Advanced filters state
  const [filters, setFilters] = useState({ 
    search: '', 
    deliverable: '', 
    month: '', 
    domain_pmbok: '',
    classification: '', // '' = Todos
    mappingStatus: '',  // '' = Todos, 'mapped' = Mapeados, 'unmapped' = Sin Mapear
  });

  const [sortBy, setSortBy] = useState('risk-desc'); // 'risk-desc' | 'risk-asc' | 'code'
  const [viewMode, setViewMode] = useState('cluster'); // 'cluster' | 'timeline' | 'compacto'
  
  // Dynamic Grouping states
  const [groupBy, setGroupBy] = useState('deliverable'); // 'none' | 'deliverable' | 'month' | 'domain'
  const [expandedGroups, setExpandedGroups] = useState({ 'Entregable E1': true }); // Default E1 open

  // Detail panel and mappings
  const [selectedActivityId, setSelectedActivityId] = useState(null);
  const [activityResources, setActivityResources] = useState({}); // { [activityId]: [resources...] }
  const [loadingResources, setLoadingResources] = useState({}); // { [activityId]: boolean }
  const [allResources, setAllResources] = useState([]); // catalog

  // Modal states
  const [managingActivity, setManagingActivity] = useState(null);

  const reload = useCallback(async () => {
    if (!activeProjectId) return setItems([]);
    setLoading(true);
    try {
      const [data, sum] = await Promise.all([
        api.get(`/activities?projectId=${activeProjectId}`),
        api.get(`/activities/summary?projectId=${activeProjectId}`).catch(() => null),
      ]);
      setItems(data);
      setSummary(sum);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [activeProjectId]);

  const loadAllResources = useCallback(async () => {
    if (!activeProjectId) return setAllResources([]);
    try {
      const res = await api.get(`/resources?projectId=${activeProjectId}`);
      setAllResources(res || []);
    } catch (e) {
      console.error(e);
    }
  }, [activeProjectId]);

  const loadAllMappings = useCallback(async () => {
    if (!activeProjectId) return setActivityResources({});
    try {
      const res = await api.get(`/resources/mappings?projectId=${activeProjectId}`);
      setActivityResources(res || {});
    } catch (e) {
      console.error(e);
    }
  }, [activeProjectId]);

  useEffect(() => {
    if (activeProjectId) {
      reload();
      loadAllResources();
      loadAllMappings();
      setSelectedActivityId(null);
    }
  }, [activeProjectId, reload, loadAllResources, loadAllMappings]);

  const loadActivityResources = useCallback(async (activityId) => {
    setLoadingResources(prev => ({ ...prev, [activityId]: true }));
    try {
      const res = await api.get(`/resources/by-activity?activityId=${activityId}`);
      setActivityResources(prev => ({ ...prev, [activityId]: res || [] }));
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingResources(prev => ({ ...prev, [activityId]: false }));
    }
  }, []);

  const mapCategoryToType = (category) => {
    if (category === 'RRHH') return 'human';
    if (category === 'FisicoTecnologico') return 'physical_tech';
    if (category === 'FisicoMaterial') return 'physical_mat';
    return 'virtual';
  };

  const handleToggleResource = async (activityId, resource, isLinked) => {
    try {
      if (isLinked) {
        await api.post('/resources/unlink', { activityId, resourceId: resource.id });
      } else {
        await api.post('/resources/link', { 
          activityId, 
          resourceId: resource.id, 
          resource_type: mapCategoryToType(resource.category) 
        });
      }
      await loadActivityResources(activityId);
    } catch (e) {
      alert(`Error al actualizar recurso: ${e.message}`);
    }
  };

  const filtered = items.filter((a) => {
    if (filters.deliverable  && a.deliverable !== filters.deliverable)    return false;
    if (filters.month        && a.month !== filters.month)                return false;
    if (filters.domain_pmbok && a.domain_pmbok !== filters.domain_pmbok)  return false;
    if (filters.classification && a.classification !== filters.classification) return false;
    
    if (filters.mappingStatus) {
      const resourcesCount = activityResources[a.id]?.length || 0;
      if (filters.mappingStatus === 'mapped' && resourcesCount === 0) return false;
      if (filters.mappingStatus === 'unmapped' && resourcesCount > 0) return false;
    }

    if (filters.search) {
      const q = filters.search.toLowerCase();
      return a.name.toLowerCase().includes(q) || a.code.toLowerCase().includes(q);
    }
    return true;
  });

  // Dynamic grouping computation
  const groupedData = useMemo(() => {
    if (groupBy === 'none') return null;
    const groups = {};
    filtered.forEach((a) => {
      let key = 'Sin clasificar';
      if (groupBy === 'deliverable') key = a.deliverable ? `Entregable ${a.deliverable}` : 'Sin Entregable';
      else if (groupBy === 'month') key = a.month || 'Sin Mes';
      else if (groupBy === 'domain') key = a.domain_pmbok || 'Sin Dominio PMBOK';

      if (!groups[key]) {
        groups[key] = {
          name: key,
          items: [],
          totalRisk: 0,
        };
      }
      groups[key].items.push(a);
      groups[key].totalRisk += (a.level || 0);
    });

    return Object.values(groups).sort((a, b) => 
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
    );
  }, [filtered, groupBy]);

  const toggleGroup = (groupKey) => {
    setExpandedGroups(prev => ({ ...prev, [groupKey]: !prev[groupKey] }));
  };

  const chartData = summary?.byDeliverable?.map((d) => ({
    name: d.deliverable,
    total: d.total,
    riesgo: d.total_risk || 0,
  })) || [];

  const handleFilterChange = (key, value) => {
    setFilters(f => ({ ...f, [key]: value }));
  };

  // Group risk status helper
  const getGroupStatusText = (totalRisk) => {
    if (totalRisk >= 150) return 'Crítico';
    if (totalRisk >= 80) return 'Alto';
    if (totalRisk >= 30) return 'Medio';
    return 'Bajo';
  };

  const getGroupStatusColor = (totalRisk) => {
    if (totalRisk >= 150) return 'text-red-400 bg-red-500/10 border-red-500/20';
    if (totalRisk >= 80) return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
    if (totalRisk >= 30) return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20';
    return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  };

  // Deliverables risk classification counters
  const getDeliverableStats = (activitiesList) => {
    let criticoCount = 0;
    let medioCount = 0;
    let bajoCount = 0;
    let sinMapearCount = 0;

    activitiesList.forEach(a => {
      const resourcesCount = activityResources[a.id]?.length || 0;
      if (resourcesCount === 0) {
        sinMapearCount++;
      } else {
        if (a.classification === 'Crítico' || a.classification === 'Alto') {
          criticoCount++;
        } else if (a.classification === 'Medio') {
          medioCount++;
        } else {
          bajoCount++;
        }
      }
    });

    const total = activitiesList.length || 1;
    return {
      criticoCount,
      medioCount,
      bajoCount,
      sinMapearCount,
      criticoPct: (criticoCount / total) * 100,
      medioPct: (medioCount / total) * 100,
      bajoPct: (bajoCount / total) * 100,
      sinMapearPct: (sinMapearCount / total) * 100,
    };
  };

  // Zone separation logic
  const getActivitiesByZone = (activityList) => {
    const critica = [];
    const media = [];
    const baja = [];
    const sinMapear = [];

    activityList.forEach(a => {
      const resourcesCount = activityResources[a.id]?.length || 0;
      if (resourcesCount === 0) {
        sinMapear.push(a);
      } else {
        if (a.classification === 'Crítico' || a.classification === 'Alto') {
          critica.push(a);
        } else if (a.classification === 'Medio') {
          media.push(a);
        } else {
          baja.push(a);
        }
      }
    });

    return { critica, media, baja, sinMapear };
  };

  // Activity Capsule node renderer
  const renderCapsule = (a) => {
    const isSelected = selectedActivityId === a.id;
    const resourcesCount = activityResources[a.id]?.length || 0;
    const hasResources = resourcesCount > 0;
    
    let riskColor = '#10b981'; // Bajo
    if (a.level >= 15) riskColor = '#ef4444'; // Crítico
    else if (a.level >= 10) riskColor = '#f97316'; // Alto
    else if (a.level >= 5) riskColor = '#eab308'; // Medio

    if (!hasResources) {
      riskColor = '#64748b'; // Gray for unmapped
    }

    return (
      <div
        key={a.id}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedActivityId(a.id);
        }}
        className={`group relative flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition-all duration-300 cursor-pointer select-none ${
          isSelected
            ? 'bg-[#0f121d] border-cyan-500/35 shadow-[0_2px_12px_rgba(6,182,212,0.1)]'
            : 'bg-[#0b0c13]/80 border-white/5 hover:border-white/10 hover:bg-[#10121d]/90'
        }`}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          {/* Subtle LED status indicator */}
          <span 
            className="w-1.5 h-1.5 rounded-full shrink-0 transition-all"
            style={{ 
              backgroundColor: riskColor, 
              boxShadow: hasResources ? `0 0 6px ${riskColor}` : 'none' 
            }}
          />
          
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[9px] font-bold text-cyan-400/90 tracking-wider shrink-0 select-none">
                {a.code}
              </span>
              <p className="text-xs font-medium text-[hsl(var(--text-primary))] truncate max-w-[150px] sm:max-w-[200px]" title={a.name}>
                {a.name}
              </p>
            </div>
            {/* Very compact, small subtitle */}
            <span className="text-[8px] text-[hsl(var(--text-muted))] font-bold block mt-0.5 tracking-wider uppercase select-none">
              {a.month} · {a.domain_pmbok}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Clean minimal risk value */}
          <span 
            className="font-mono text-[10.5px] font-bold select-none" 
            style={{ color: riskColor }}
          >
            {a.level} pts
          </span>

          {/* Simple ghost action button */}
          <div className="flex items-center">
            {loadingResources[a.id] ? (
              <span className="text-[9px] text-[hsl(var(--text-muted))] animate-pulse font-mono font-bold">...</span>
            ) : hasResources ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setManagingActivity(a);
                }}
                className="text-[hsl(var(--text-muted))] hover:text-[hsl(var(--primary))] p-1.5 rounded-lg transition-colors cursor-pointer"
                title={`Recursos: ${resourcesCount}`}
              >
                <Settings size={12} />
              </button>
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setManagingActivity(a);
                }}
                className="text-[9px] text-amber-500/80 hover:text-amber-400 font-bold px-2 py-0.8 rounded-lg bg-amber-500/5 hover:bg-amber-500/10 border border-amber-500/10 hover:border-amber-500/20 transition-all cursor-pointer"
                title="Mapear recursos"
              >
                <Plus size={8} className="mr-0.5 inline-block" /> Mapear
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  // View Mode: Cluster (by severity zones)
  const renderClusterView = (activityList) => {
    const { critica, media, baja, sinMapear } = getActivitiesByZone(activityList);
    
    return (
      <div className="space-y-4 p-4 bg-[hsl(var(--surface-base)/0.05)]">
        {critica.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-[hsl(var(--text-secondary))] tracking-wider flex items-center gap-2 select-none uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_5px_#ef4444]" />
              Zona Crítica ({critica.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {critica.map(renderCapsule)}
            </div>
          </div>
        )}

        {media.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-[hsl(var(--text-secondary))] tracking-wider flex items-center gap-2 select-none uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-yellow-500 shadow-[0_0_5px_#eab308]" />
              Zona Media ({media.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {media.map(renderCapsule)}
            </div>
          </div>
        )}

        {baja.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-[hsl(var(--text-secondary))] tracking-wider flex items-center gap-2 select-none uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_5px_#10b981]" />
              Zona Baja ({baja.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {baja.map(renderCapsule)}
            </div>
          </div>
        )}

        {sinMapear.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-[10px] font-bold text-[hsl(var(--text-secondary))] tracking-wider flex items-center gap-2 select-none uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-[hsl(var(--risk-neutral))] border border-dashed" />
              Zona Pendiente de Mapeo ({sinMapear.length})
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sinMapear.map(renderCapsule)}
            </div>
          </div>
        )}
      </div>
    );
  };

  // View Mode: Timeline (grouped chronologically)
  const renderTimelineView = (activityList) => {
    const byMonth = {};
    activityList.forEach(a => {
      const m = a.month || 'Sin mes';
      if (!byMonth[m]) byMonth[m] = [];
      byMonth[m].push(a);
    });

    const months = Object.keys(byMonth).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

    return (
      <div className="relative pl-6 border-l border-white/5 space-y-6 m-4 py-2">
        {months.map((m) => (
          <div key={m} className="relative space-y-3">
            <div className="absolute -left-[32px] top-1.5 w-4 h-4 rounded-full bg-[#090d1a] border-2 border-cyan-400 flex items-center justify-center shadow-[0_0_6px_rgba(6,182,212,0.4)]">
              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
            </div>

            <h4 className="text-xs font-black text-cyan-400 tracking-wider font-mono uppercase">
              {m}
            </h4>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {byMonth[m].map(renderCapsule)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  // View Mode: Compacto (flat grid)
  const renderCompactView = (activityList) => {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 p-4">
        {activityList.map(renderCapsule)}
      </div>
    );
  };

  const renderTable = (activityList) => {
    const sorted = [...activityList].sort((a, b) => {
      if (sortBy === 'risk-desc') return (b.level || 0) - (a.level || 0);
      if (sortBy === 'risk-asc') return (a.level || 0) - (b.level || 0);
      if (sortBy === 'code') return a.code.localeCompare(b.code, undefined, { numeric: true });
      return 0;
    });

    if (viewMode === 'timeline') return renderTimelineView(sorted);
    if (viewMode === 'compacto') return renderCompactView(sorted);
    return renderClusterView(sorted); // default 'cluster'
  };

  // Detail Deck sidebar widget
  const renderDetailDeck = (selectedActivity) => {
    const resourcesCount = activityResources[selectedActivity.id]?.length || 0;
    const hasResources = resourcesCount > 0;
    
    let riskColor = '#10b981'; 
    if (selectedActivity.level >= 15) riskColor = '#ef4444';
    else if (selectedActivity.level >= 10) riskColor = '#f97316';
    else if (selectedActivity.level >= 5) riskColor = '#eab308';

    return (
      <div className="w-full lg:w-80 bg-[#0b0f19]/90 border border-white/10 rounded-2xl p-4 space-y-4 shrink-0 h-fit lg:sticky lg:top-4 animate-fade-in-slide shadow-[0_4px_24px_rgba(0,0,0,0.65)] text-xs text-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[9px] font-black text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/15">
              {selectedActivity.code}
            </span>
            <span className="text-[10px] uppercase font-black tracking-widest text-[hsl(var(--text-secondary))]">Detalle Actividad</span>
          </div>
          <button 
            onClick={() => setSelectedActivityId(null)}
            className="text-[hsl(var(--text-muted))] hover:text-white transition-colors cursor-pointer text-sm"
          >
            ✕
          </button>
        </div>

        {/* Name and Description */}
        <div className="space-y-1.5">
          <h3 className="text-xs font-bold text-white leading-relaxed">{selectedActivity.name}</h3>
          <p className="text-[10px] text-[hsl(var(--text-secondary))] leading-normal">{selectedActivity.description || 'Sin descripción o bitácora de actividad.'}</p>
        </div>

        {/* Planificación */}
        <div className="bg-[#121624]/40 rounded-xl border border-white/5 p-3 space-y-2 font-medium">
          <h4 className="text-[9px] uppercase font-black text-[hsl(var(--text-muted))] tracking-widest flex items-center gap-1.5 pb-1 border-b border-white/5">
            <Calendar size={12} className="text-cyan-400" /> Planificación y Contexto
          </h4>
          <div className="space-y-1.5 pt-1 text-[10.5px]">
            <p className="flex justify-between">
              <span className="text-[hsl(var(--text-muted))] font-semibold">Cronograma:</span>
              <span className="text-[hsl(var(--text-primary))]">{selectedActivity.month}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-[hsl(var(--text-muted))] font-semibold">Entregable:</span>
              <span className="text-[hsl(var(--text-primary))]">Entregable {selectedActivity.deliverable}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-[hsl(var(--text-muted))] font-semibold">Objetivo ID:</span>
              <span className="font-mono text-cyan-400 font-bold">{selectedActivity.objective || '—'}</span>
            </p>
            {selectedActivity.role_main && (
              <p className="flex justify-between">
                <span className="text-[hsl(var(--text-muted))] font-semibold">Líder / PM:</span>
                <span className="text-[hsl(var(--text-primary))]">{selectedActivity.role_main}</span>
              </p>
            )}
          </div>
        </div>

        {/* Riesgo y severidad */}
        <div className="bg-[#121624]/40 rounded-xl border border-white/5 p-3 space-y-2 font-medium">
          <h4 className="text-[9px] uppercase font-black text-orange-400 tracking-widest flex items-center gap-1.5 pb-1 border-b border-white/5">
            <ShieldAlert size={12} className="text-orange-400" /> Riesgos Asociados
          </h4>
          <div className="space-y-2 pt-1 text-[10.5px]">
            <p className="flex justify-between">
              <span className="text-[hsl(var(--text-muted))] font-semibold">Dominio PMBOK:</span>
              <span className="text-[hsl(var(--text-primary))]">{selectedActivity.domain_pmbok}</span>
            </p>
            <p className="flex justify-between">
              <span className="text-[hsl(var(--text-muted))] font-semibold">Cálculo de Criticidad:</span>
              <span className="text-[hsl(var(--text-primary))] font-mono">P: {selectedActivity.probability} × I: {selectedActivity.impact}</span>
            </p>
            <div className="flex justify-between items-center">
              <span className="text-[hsl(var(--text-muted))] font-semibold">Nivel Total:</span>
              <span className="font-mono font-black text-white px-2 py-0.5 rounded text-[10px]" style={{
                backgroundColor: selectedActivity.level >= 15 ? 'rgba(239, 68, 68, 0.15)' : selectedActivity.level >= 10 ? 'rgba(249, 115, 22, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                color: riskColor
              }}>
                {selectedActivity.level} pts
              </span>
            </div>
          </div>
        </div>

        {/* Recursos */}
        <div className="bg-[#121624]/40 rounded-xl border border-white/5 p-3 space-y-2 font-medium">
          <h4 className="text-[9px] uppercase font-black text-cyan-400 tracking-widest flex items-center gap-1.5 pb-1 border-b border-white/5">
            <Package size={12} className="text-cyan-400" /> Recursos Asignados
          </h4>
          
          {loadingResources[selectedActivity.id] ? (
            <p className="text-[10px] text-[hsl(var(--text-muted))] animate-pulse font-mono">Cargando...</p>
          ) : !hasResources ? (
            <p className="text-[10px] text-[hsl(var(--text-muted))] italic flex items-center gap-1.5 select-none pt-1">
              <AlertCircle size={12} /> Sin recursos vinculados.
            </p>
          ) : (
            <div className="flex flex-wrap gap-1.5 pt-1 max-h-[100px] overflow-y-auto custom-scrollbar">
              {activityResources[selectedActivity.id].map((res) => (
                <Badge 
                  key={res.id} 
                  variant="outline" 
                  className="text-[9px] bg-[hsl(var(--surface-raised)/0.6)] border-white/5 hover:border-cyan-500/20 text-[hsl(var(--text-primary))] py-0.5 px-2 font-normal"
                >
                  <span className="mr-1">{CATEGORY_ICONS[res.category] || '📦'}</span> 
                  {res.name}
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Acciones */}
        <div className="space-y-2 pt-2">
          <Button
            onClick={() => setManagingActivity(selectedActivity)}
            className="w-full h-8 text-[10px] bg-cyan-600 hover:bg-cyan-700 text-white font-bold cursor-pointer transition-colors"
          >
            <Settings size={11} className="mr-1" /> Mapear Recursos
          </Button>
        </div>
      </div>
    );
  };

  const domainCounts = useMemo(() => {
    const counts = {};
    items.forEach(a => { counts[a.domain_pmbok] = (counts[a.domain_pmbok] || 0) + 1; });
    return counts;
  }, [items]);
  const highProb = items.filter(a => a.probability >= 3).length;
  const highImpact = items.filter(a => a.impact >= 3).length;
  const selectedActivity = items.find(a => a.id === selectedActivityId);

  return (
    <div className="space-y-6 text-white pb-12">
      {/* Metric Cards Banner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1a1d27] border border-white/5 rounded-2xl p-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-[#06b6d4]/10">
            <Layers size={16} className="text-[#06b6d4]" />
          </div>
          <p className="text-xs text-[#8a8f98] uppercase tracking-wide font-medium mb-1">Total Actividades</p>
          <p className="text-2xl font-bold text-white">{items.length}</p>
        </div>
        <div className="bg-[#1a1d27] border border-white/5 rounded-2xl p-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-[#8b5cf6]/10">
            <Cpu size={16} className="text-[#8b5cf6]" />
          </div>
          <p className="text-xs text-[#8a8f98] uppercase tracking-wide font-medium mb-1">Dominio Técnico</p>
          <p className="text-2xl font-bold text-white">{domainCounts['Técnico'] || 0}</p>
        </div>
        <div className="bg-[#1a1d27] border border-white/5 rounded-2xl p-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-[#f97316]/10">
            <AlertCircle size={16} className="text-[#f97316]" />
          </div>
          <p className="text-xs text-[#8a8f98] uppercase tracking-wide font-medium mb-1">Alta Probabilidad</p>
          <p className="text-2xl font-bold text-white">{highProb}</p>
        </div>
        <div className="bg-[#1a1d27] border border-white/5 rounded-2xl p-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-[#ef4444]/10">
            <ShieldAlert size={16} className="text-[#ef4444]" />
          </div>
          <p className="text-xs text-[#8a8f98] uppercase tracking-wide font-medium mb-1">Alto Impacto</p>
          <p className="text-2xl font-bold text-white">{highImpact}</p>
        </div>
      </div>

      {/* Header and statistics banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            <Layers className="text-cyan-400" size={24} /> Actividades del Proyecto
          </h1>
          <p className="text-[hsl(var(--text-secondary))] text-sm">Metodología Híbrida · {items.length} actividades planificadas</p>
        </div>
        {summary?.byLevel && (
          <div className="flex flex-wrap gap-2">
            {['Bajo','Medio','Alto','Crítico'].map((c) => {
              const row = summary.byLevel.find((r) => r.classification === c);
              return row ? (
                <div key={c} className={`rounded-lg px-3 py-1.5 border text-xs font-semibold shadow-sm transition-all duration-300 hover:scale-105 ${CLASSIFICATION_COLORS[c]}`}>
                  {row.total} {c}
                </div>
              ) : null;
            })}
          </div>
        )}
      </div>

      {/* Chart container */}
      {chartData.length > 0 && (
        <Card className="border-white/5 bg-[#090d1a]/40 backdrop-blur-xl">
          <CardContent className="p-5">
            <p className="text-xs uppercase font-bold tracking-wider text-[hsl(var(--text-secondary))] mb-4">Actividades y Nivel de Riesgo Acumulado por Entregable</p>
            <ChartContainer config={chartConfig} className="h-[200px] w-full">
              <BarChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="name" 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={8} 
                  tick={{ fill: '#8a8f98', fontSize: 11 }}
                />
                <YAxis 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={8} 
                  tick={{ fill: '#8a8f98', fontSize: 11 }}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="total" fill="var(--color-total)" radius={[4, 4, 0, 0]} name="Actividades" />
                <Bar dataKey="riesgo" fill="var(--color-riesgo)" radius={[4, 4, 0, 0]} name="Riesgo Acumulado" />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      )}

      {/* Toolbar / Filters Panel */}
      <Card className="border-white/5 bg-[#090d1a]/30 backdrop-blur-xl">
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Standard Dropdowns + Search */}
            <div className="flex-1 w-full">
              <FilterBar>
                <SearchInput
                  placeholder="Buscar por código o nombre de actividad…"
                  value={filters.search}
                  onChange={(v) => setFilters((f) => ({ ...f, search: v }))}
                />
                <Select
                  value={filters.deliverable}
                  onChange={(v) => handleFilterChange('deliverable', v)}
                  options={[{ value: '', label: 'Todos los entregables' }, ...DELIVERABLE_OPTIONS.map((d) => ({ value: d, label: d }))]}
                />
                <Select
                  value={filters.month}
                  onChange={(v) => handleFilterChange('month', v)}
                  options={[{ value: '', label: 'Todos los meses' }, ...MONTH_OPTIONS.map((m) => ({ value: m, label: m }))]}
                />
                <Select
                  value={filters.domain_pmbok}
                  onChange={(v) => handleFilterChange('domain_pmbok', v)}
                  options={[{ value: '', label: 'Todos los dominios' }, ...DOMAIN_OPTIONS.map((d) => ({ value: d, label: d }))]}
                />
              </FilterBar>
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center gap-1 bg-[hsl(var(--surface-base)/0.4)] p-1 border border-white/5 rounded-xl self-end lg:self-auto shrink-0 w-fit">
              <span className="text-[9px] uppercase font-black text-[hsl(var(--text-muted))] pl-2 pr-1.5 tracking-widest select-none">Vista:</span>
              <button
                type="button"
                className={`h-7 text-[10px] px-3 font-bold rounded-lg transition-colors cursor-pointer ${viewMode === 'cluster' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20' : 'text-[hsl(var(--text-secondary))] border border-transparent hover:text-white'}`}
                onClick={() => setViewMode('cluster')}
              >
                Cluster
              </button>
              <button
                type="button"
                className={`h-7 text-[10px] px-3 font-bold rounded-lg transition-colors cursor-pointer ${viewMode === 'timeline' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20' : 'text-[hsl(var(--text-secondary))] border border-transparent hover:text-white'}`}
                onClick={() => setViewMode('timeline')}
              >
                Línea de Tiempo
              </button>
              <button
                type="button"
                className={`h-7 text-[10px] px-3 font-bold rounded-lg transition-colors cursor-pointer ${viewMode === 'compacto' ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20' : 'text-[hsl(var(--text-secondary))] border border-transparent hover:text-white'}`}
                onClick={() => setViewMode('compacto')}
              >
                Compacto
              </button>
            </div>
          </div>

          {/* Minimal Filter Chips Row */}
          <div className="flex flex-wrap items-center gap-y-3.5 gap-x-6 text-[10.5px] pt-3.5 border-t border-white/5">
            
            {/* Filter by Classification */}
            <div className="flex items-center gap-2">
              <span className="text-[hsl(var(--text-muted))] font-bold select-none">Criticidad:</span>
              <div className="flex gap-1.5">
                {['', 'Bajo', 'Medio', 'Alto', 'Crítico'].map((c) => (
                  <button
                    key={c}
                    onClick={() => setFilters(f => ({ ...f, classification: c }))}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-bold border transition-all cursor-pointer ${
                      filters.classification === c
                        ? 'bg-cyan-500/15 border-cyan-500/20 text-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.1)]'
                        : 'bg-white/5 border-transparent text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
                    }`}
                  >
                    {c || 'Todos'}
                  </button>
                ))}
              </div>
            </div>

            {/* Filter by Mapping Status */}
            <div className="flex items-center gap-2">
              <span className="text-[hsl(var(--text-muted))] font-bold select-none">Mapeo:</span>
              <div className="flex gap-1.5">
                {[
                  { value: '', label: 'Todos' },
                  { value: 'mapped', label: 'Mapeados' },
                  { value: 'unmapped', label: 'Sin Mapear' }
                ].map((st) => (
                  <button
                    key={st.value}
                    onClick={() => setFilters(f => ({ ...f, mappingStatus: st.value }))}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-bold border transition-all cursor-pointer ${
                      filters.mappingStatus === st.value
                        ? 'bg-cyan-500/15 border-cyan-500/20 text-cyan-400'
                        : 'bg-white/5 border-transparent text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
                    }`}
                  >
                    {st.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort by option */}
            <div className="flex items-center gap-2">
              <span className="text-[hsl(var(--text-muted))] font-bold select-none">Ordenar:</span>
              <div className="flex gap-1.5">
                {[
                  { value: 'risk-desc', label: 'Mayor Riesgo' },
                  { value: 'risk-asc', label: 'Menor Riesgo' },
                  { value: 'code', label: 'Código' }
                ].map((s) => (
                  <button
                    key={s.value}
                    onClick={() => setSortBy(s.value)}
                    className={`px-2.5 py-1 rounded-lg text-[9px] font-bold border transition-all cursor-pointer ${
                      sortBy === s.value
                        ? 'bg-cyan-500/15 border-cyan-500/20 text-cyan-400'
                        : 'bg-white/5 border-transparent text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Group by option */}
            <div className="flex items-center gap-2 ml-auto lg:ml-0">
              <span className="text-[hsl(var(--text-muted))] font-bold select-none font-mono text-[9px] uppercase tracking-wider">Agrupar por:</span>
              <div className="flex bg-[hsl(var(--surface-base)/0.2)] border border-white/5 rounded-lg p-0.5">
                {[
                  { value: 'deliverable', label: 'Entregable' },
                  { value: 'month', label: 'Mes' },
                  { value: 'domain', label: 'Dominio' },
                  { value: 'none', label: 'Sin agrupar' }
                ].map((grp) => (
                  <button
                    key={grp.value}
                    onClick={() => setGroupBy(grp.value)}
                    className={`px-2 py-0.5 rounded text-[9.5px] font-bold transition-all cursor-pointer ${
                      groupBy === grp.value
                        ? 'bg-cyan-500/10 text-cyan-400'
                        : 'text-[hsl(var(--text-secondary))] hover:text-[hsl(var(--text-primary))]'
                    }`}
                  >
                    {grp.label}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </CardContent>
      </Card>

      {/* Main Dashboard / Cluster Workspace */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Accordions Area */}
        <div className="flex-1 w-full space-y-4">
          {loading ? (
            <div className="text-center py-16 text-[hsl(var(--text-secondary))] flex flex-col items-center justify-center gap-2">
              <RefreshCw className="animate-spin text-cyan-400" size={26} />
              <span className="font-medium">Cargando activities cluster...</span>
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState title="Sin actividades" description="No hay actividades que coincidan con los filtros seleccionados." />
          ) : groupBy === 'none' ? (
            /* Flat view container */
            <Card className="border-white/5 bg-[#090d1a]/30 backdrop-blur-xl overflow-hidden shadow-md">
              <CardContent className="p-0">
                {renderTable(filtered)}
              </CardContent>
            </Card>
          ) : (
            /* Accordion Group container */
            <div className="space-y-4 animate-fade-in-slide">
              {groupedData.map((group) => {
                const isGroupOpen = !!expandedGroups[group.name];
                const stats = getDeliverableStats(group.items);
                const statusText = getGroupStatusText(group.totalRisk);
                const statusColorClass = getGroupStatusColor(group.totalRisk);
                
                return (
                  <div 
                    key={group.name}
                    className={`border rounded-2xl transition-all duration-300 overflow-hidden ${
                      isGroupOpen 
                        ? 'bg-[#0a0c16]/75 border-white/10 shadow-[0_4px_24px_rgba(0,0,0,0.6)]' 
                        : 'bg-[#10121a]/35 border-white/5 hover:border-white/10 hover:bg-[#131622]/45'
                    }`}
                  >
                    {/* Accordion Trigger Header */}
                    <div
                      className="w-full flex flex-col transition-all cursor-pointer"
                      onClick={() => toggleGroup(group.name)}
                    >
                      <div className="flex items-center justify-between py-3 px-4 text-left select-none">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className={`w-7.5 h-7.5 rounded-lg flex items-center justify-center border transition-all ${
                            isGroupOpen 
                              ? 'bg-cyan-500/10 border-cyan-500/35 text-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.15)]' 
                              : 'bg-white/5 border-white/5 text-[hsl(var(--text-secondary))]'
                          }`}>
                            {isGroupOpen ? <FolderOpen size={13} /> : <Folder size={13} />}
                          </div>
                          
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="text-xs font-black text-white truncate max-w-[160px] sm:max-w-none">{group.name}</h3>
                              <span className="text-[8.5px] font-mono font-bold text-[hsl(var(--text-secondary))] bg-white/5 border border-white/5 px-1.5 py-0.2 rounded-md shrink-0 select-none">
                                {group.items.length} act.
                              </span>
                              <span className={`text-[8px] font-bold px-1.5 py-0.2 rounded border uppercase tracking-wider shrink-0 select-none ${statusColorClass}`}>
                                {statusText}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          {/* Risk Accumulated Counter */}
                          <div className="flex items-center gap-1.5 font-mono text-[9px] select-none">
                            <span className="text-[8px] uppercase font-black text-[hsl(var(--text-muted))] tracking-wider hidden sm:inline">Riesgo acumulado:</span>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-lg border ${
                              group.totalRisk >= 150 
                                ? 'bg-red-500/10 border-red-500/25 text-red-400 shadow-[0_0_8px_rgba(239,68,68,0.15)]' 
                                : group.totalRisk >= 80 
                                  ? 'bg-orange-500/10 border-orange-500/25 text-orange-400'
                                  : group.totalRisk >= 30
                                    ? 'bg-yellow-500/10 border-yellow-500/25 text-yellow-400'
                                    : 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400'
                            }`}>
                              {group.totalRisk} pts
                            </span>
                          </div>
                          
                          <div className="text-[hsl(var(--text-muted))] w-4 flex justify-end shrink-0">
                            {isGroupOpen ? <ChevronUp size={13} className="text-cyan-400" /> : <ChevronDown size={13} />}
                          </div>
                        </div>
                      </div>

                      {/* Visual Risk Traffic Lights */}
                      <div className="flex flex-wrap items-center gap-y-1.5 gap-x-4 text-[9.5px] text-[hsl(var(--text-secondary))] font-semibold px-4 pb-3 border-b border-white/5 select-none bg-[hsl(var(--surface-base)/0.15)]">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[8px] text-[hsl(var(--text-muted))] font-bold uppercase tracking-wider">Crítico:</span>
                          <span className="flex gap-0.5">
                            {Array.from({ length: 4 }).map((_, i) => (
                              <span 
                                key={i} 
                                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                  i < stats.criticoCount 
                                    ? 'bg-red-500 shadow-[0_0_5px_#ef4444]' 
                                    : 'bg-[hsl(var(--surface-overlay))]'
                                }`} 
                              />
                            ))}
                          </span>
                          <span className="text-red-400 font-mono ml-0.5 text-[8.5px]">{stats.criticoCount}</span>
                        </div>
                        
                        <div className="flex items-center gap-1.5">
                          <span className="text-[8px] text-[hsl(var(--text-muted))] font-bold uppercase tracking-wider">Medio:</span>
                          <span className="flex gap-0.5">
                            {Array.from({ length: 4 }).map((_, i) => (
                              <span 
                                key={i} 
                                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                  i < stats.medioCount 
                                    ? 'bg-yellow-500 shadow-[0_0_5px_#eab308]' 
                                    : 'bg-[hsl(var(--surface-overlay))]'
                                }`} 
                              />
                            ))}
                          </span>
                          <span className="text-yellow-400 font-mono ml-0.5 text-[8.5px]">{stats.medioCount}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-[8px] text-[hsl(var(--text-muted))] font-bold uppercase tracking-wider">Bajo:</span>
                          <span className="flex gap-0.5">
                            {Array.from({ length: 4 }).map((_, i) => (
                              <span 
                                key={i} 
                                className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                                  i < stats.bajoCount 
                                    ? 'bg-emerald-500 shadow-[0_0_5px_#10b981]' 
                                    : 'bg-[hsl(var(--surface-overlay))]'
                                }`} 
                              />
                            ))}
                          </span>
                          <span className="text-emerald-400 font-mono ml-0.5 text-[8.5px]">{stats.bajoCount}</span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          <span className="text-[8px] text-[hsl(var(--text-muted))] font-bold uppercase tracking-wider">Sin Mapear:</span>
                          <span className="flex gap-0.5">
                            {Array.from({ length: 4 }).map((_, i) => (
                              <span 
                                key={i} 
                                className={`w-1.5 h-1.5 rounded-full border transition-all duration-300 ${
                                  i < stats.sinMapearCount 
                                    ? 'bg-[hsl(var(--surface-overlay))] bg-[hsl(var(--risk-neutral))] border-dashed' 
                                    : 'bg-[hsl(var(--surface-overlay)/0.2)] bg-[hsl(var(--surface-overlay))] border-dashed'
                                }`} 
                              />
                            ))}
                          </span>
                          <span className="text-[hsl(var(--text-secondary))] font-mono ml-0.5 text-[8.5px]">{stats.sinMapearCount}</span>
                        </div>
                      </div>

                      {/* Segmented Risk Distribution Bar */}
                      <div className="h-0.8 w-full bg-[hsl(var(--surface-raised))] flex overflow-hidden">
                        <div className="bg-red-500 h-full transition-all duration-500" style={{ width: `${stats.criticoPct}%` }} />
                        <div className="bg-yellow-500 h-full transition-all duration-500" style={{ width: `${stats.medioPct}%` }} />
                        <div className="bg-emerald-500 h-full transition-all duration-500" style={{ width: `${stats.bajoPct}%` }} />
                        <div className="bg-[hsl(var(--surface-overlay))] h-full border-l bg-[hsl(var(--surface-raised)/0.5)] transition-all duration-500" style={{ width: `${stats.sinMapearPct}%` }} />
                      </div>
                    </div>

                    {/* Accordion content */}
                    {isGroupOpen && (
                      <div className="bg-[hsl(var(--surface-base)/0.2)] animate-fade-in-slide">
                        {renderTable(group.items)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Floating/Side detail panel (Detail Deck) */}
        {selectedActivity && renderDetailDeck(selectedActivity)}

      </div>

      {/* Modal dialog for resources mapping */}
      <Dialog open={!!managingActivity} onOpenChange={(isOpen) => { if (!isOpen) setManagingActivity(null); }}>
        <DialogContent className="max-w-lg text-white max-h-[80vh] overflow-y-auto bg-[#0b0f19] border border-white/10">
          <DialogHeader className="border-b border-white/5 pb-3">
            <DialogTitle className="flex items-center gap-2 text-white">
              <Package className="text-cyan-400" size={18} /> Asignar Recursos — {managingActivity?.code}
            </DialogTitle>
            <p className="text-xs text-[hsl(var(--text-secondary))] pt-1 leading-normal">{managingActivity?.name}</p>
          </DialogHeader>
          
          <div className="space-y-4 pt-2">
            <p className="text-xs text-[hsl(var(--text-primary))] leading-relaxed">
              Asocia los recursos humanos, técnicos y físicos necesarios para el desarrollo de esta actividad:
            </p>
            
            <div className="space-y-3 max-h-[42vh] overflow-y-auto pr-1">
              {['RRHH', 'FisicoTecnologico', 'FisicoMaterial', 'Virtual'].map((category) => {
                const categoryRes = allResources.filter(r => r.category === category);
                if (categoryRes.length === 0) return null;
                return (
                  <div key={category} className="space-y-1.5">
                    <h5 className="text-[9px] uppercase font-bold text-[hsl(var(--text-muted))] tracking-wider border-b border-white/5 pb-1 select-none">
                      {category === 'RRHH' ? '👥 Recursos Humanos' : category === 'FisicoTecnologico' ? '🖥️ Equipamiento Físico/Tecnológico' : category === 'FisicoMaterial' ? '📦 Materiales/Espacios Físicos' : '☁️ Licencias y Servicios Virtuales'}
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {categoryRes.map((res) => {
                        const isLinked = !!activityResources[managingActivity?.id]?.find(r => r.id === res.id);
                        return (
                          <label 
                            key={res.id} 
                            className={`flex items-start gap-2.5 p-2 rounded border text-xs cursor-pointer transition-all duration-200 ${
                              isLinked 
                                ? 'bg-cyan-500/5 border-cyan-500/30 text-white' 
                                : 'bg-[#0f111a] border-white/5 hover:bg-white/5 text-[hsl(var(--text-secondary))] hover:border-white/10'
                            }`}
                          >
                            <input 
                              type="checkbox" 
                              checked={isLinked} 
                              className="mt-0.5 accent-cyan-500 shrink-0 cursor-pointer"
                              onChange={() => handleToggleResource(managingActivity.id, res, isLinked)}
                            />
                            <div>
                              <span className="font-semibold block">{res.name}</span>
                              <span className="font-mono text-[9px] text-[hsl(var(--text-muted))] block mt-0.5">{res.code}</span>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          <DialogFooter className="pt-4 border-t border-white/5">
            <Button onClick={() => setManagingActivity(null)} size="sm" className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold cursor-pointer">Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Global CSS for Animations */}
      <style>{`
        @keyframes fade-in-slide {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-slide {
          animation: fade-in-slide 0.3s ease-out forwards;
        }

        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          opacity: 0;
          animation: fade-in-up 0.25s ease-out forwards;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.02);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.25);
        }
      `}</style>
    </div>
  );
}

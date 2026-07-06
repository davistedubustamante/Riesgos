import { useEffect, useState, useCallback, Fragment } from 'react';
import { Grid3x3, AlertTriangle, ShieldAlert, CheckCircle2, Sliders, Eye, EyeOff, Layers, ArrowRight, User, Sparkles, Activity, Calendar } from 'lucide-react';
import { api } from '../services/api.js';
import { useAppStore } from '../store/useAppStore.js';
import EmptyState from '@/components/EmptyState.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RISK_CATEGORIES, RISK_STATUSES } from '../utils/risk.js';

// Premium HSL translucent colors for matrix zones
const ZONE_STYLE = {
  'Crítico': 'bg-red-500/10 text-red-400 border-red-500/20 hover:bg-red-500/20 hover:border-red-500/40 shadow-sm shadow-red-500/5',
  'Alto':    'bg-orange-500/10 text-orange-400 border-orange-500/20 hover:bg-orange-500/20 hover:border-orange-500/40 shadow-sm shadow-orange-500/5',
  'Medio':   'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 hover:bg-yellow-500/20 hover:border-yellow-500/40 shadow-sm shadow-yellow-500/5',
  'Bajo':    'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20 hover:border-emerald-500/40 shadow-sm shadow-emerald-500/5',
};

// Selected cell glowing shadow mapping
const SELECTED_GLOW = {
  'Crítico': 'ring-2 ring-red-500 border-red-500 shadow-[0_0_15px_rgba(239,68,68,0.4)] scale-[0.97]',
  'Alto':    'ring-2 ring-orange-500 border-orange-500 shadow-[0_0_15px_rgba(249,115,22,0.4)] scale-[0.97]',
  'Medio':   'ring-2 ring-yellow-500 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.4)] scale-[0.97]',
  'Bajo':    'ring-2 ring-emerald-500 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.4)] scale-[0.97]',
};

function getZone(level) {
  if (level >= 15) return 'Crítico';
  if (level >= 10) return 'Alto';
  if (level >= 5)  return 'Medio';
  return 'Bajo';
}

export default function Matrix() {
  const { activeProjectId, sprints } = useAppStore();
  const [risks, setRisks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);
  
  // Interactive filters
  const [filters, setFilters] = useState({ category: '', status: '', sprintId: '' });
  const [hideMitigated, setHideMitigated] = useState(false);
  const [animatingCount, setAnimatingCount] = useState(false);

  const fetchRisks = useCallback(async () => {
    if (!activeProjectId) return;
    setLoading(true);
    try {
      const data = await api.get(`/projects/${activeProjectId}/risks`);
      setRisks(data || []);
      // Trigger a brief pop animation for the grid cells
      setAnimatingCount(true);
      setTimeout(() => setAnimatingCount(false), 600);
    } catch (e) {
      console.error(e);
      setRisks([]);
    } finally {
      setLoading(false);
    }
  }, [activeProjectId]);

  useEffect(() => {
    fetchRisks();
  }, [fetchRisks]);

  // Handle filter changes with animation
  const handleFilterChange = (key, value) => {
    setFilters(f => ({ ...f, [key]: value }));
    setAnimatingCount(true);
    setTimeout(() => setAnimatingCount(false), 500);
    setSelectedCell(null); // Reset active coordinate to avoid stale state
  };

  const handleMitigatedToggle = () => {
    setHideMitigated(!hideMitigated);
    setAnimatingCount(true);
    setTimeout(() => setAnimatingCount(false), 500);
    setSelectedCell(null);
  };

  // Apply filters
  const filteredRisks = risks.filter((r) => {
    if (filters.category && r.category !== filters.category) return false;
    if (filters.status && r.status !== filters.status) return false;
    if (filters.sprintId && r.sprintId !== filters.sprintId) return false;
    if (hideMitigated && (r.status === 'Mitigado' || r.status === 'Cerrado')) return false;
    return true;
  });

  // Re-calculate buckets (coordinates count)
  const buckets = {};
  filteredRisks.forEach((r) => {
    const key = `${r.probability}-${r.impact}`;
    buckets[key] = buckets[key] || [];
    buckets[key].push(r);
  });

  // Calculate highest concentration cell
  let maxConcentration = { coord: '—', count: 0 };
  Object.keys(buckets).forEach((key) => {
    const count = buckets[key].length;
    if (count > maxConcentration.count) {
      const [p, i] = key.split('-');
      maxConcentration = { coord: `P${p}×I${i}`, count };
    }
  });

  // Select cell event
  const handleCellClick = (p, i, level) => {
    const key = `${p}-${i}`;
    const cellRisks = buckets[key] || [];
    setSelectedCell({
      p, i, level,
      zone: getZone(level),
      risks: cellRisks,
    });
  };

  if (!activeProjectId) {
    return <EmptyState icon={Grid3x3} title="Selecciona un proyecto" description="La matriz de calor y probabilidad se genera a partir de los riesgos de tu proyecto." />;
  }

  // General stats
  const totalCount = filteredRisks.length;
  const criticalCount = filteredRisks.filter(r => r.level >= 15).length;
  const highCount = filteredRisks.filter(r => r.level >= 10 && r.level < 15).length;
  const mediumCount = filteredRisks.filter(r => r.level >= 5 && r.level < 10).length;
  const lowCount = filteredRisks.filter(r => r.level < 5).length;
  const mitigationRate = risks.length ? Math.round((risks.filter(r => r.status === 'Mitigado' || r.status === 'Cerrado').length / risks.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2 bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            <Grid3x3 className="text-cyan-400 animate-pulse" size={24} /> Matriz de Probabilidad × Impacto
          </h1>
          <p className="text-sm text-slate-400">
            Mapeo interactivo y priorización de riesgos ISO 31000. Selecciona filtros y celdas para inspeccionar el impacto.
          </p>
        </div>
      </div>

      {/* Stats row with circular progress and premium gradients */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-white/5 bg-[#090d1a]/40 backdrop-blur-xl hover:border-cyan-500/20 transition-all duration-300">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
                <Activity size={18} />
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Riesgos Filtrados</p>
                <p className="text-lg font-bold font-mono text-white mt-0.5">{totalCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-white/5 bg-[#090d1a]/40 backdrop-blur-xl hover:border-red-500/20 transition-all duration-300">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
                <ShieldAlert size={18} />
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Zona Crítica</p>
                <p className="text-lg font-bold font-mono text-red-400 mt-0.5">{criticalCount}</p>
              </div>
            </div>
            {criticalCount > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
            )}
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-[#090d1a]/40 backdrop-blur-xl hover:border-orange-500/20 transition-all duration-300">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400">
                <AlertTriangle size={18} />
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Concentración Máxima</p>
                <p className="text-sm font-bold font-mono text-orange-400 mt-0.5">
                  {maxConcentration.count > 0 ? `${maxConcentration.coord} (${maxConcentration.count} riesgos)` : '—'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Circular gauge card for mitigation efficiency */}
        <Card className="border-white/5 bg-[#090d1a]/40 backdrop-blur-xl hover:border-emerald-500/20 transition-all duration-300">
          <CardContent className="p-3.5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Tasa de Mitigación</p>
                <p className="text-xs font-semibold text-slate-300 mt-0.5">Eficiencia global</p>
              </div>
            </div>
            <div className="relative w-10 h-10 shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="20" cy="20" r="16" stroke="currentColor" className="text-white/5" strokeWidth="2.5" fill="transparent" />
                <circle cx="20" cy="20" r="16" stroke="currentColor" className="text-emerald-400 transition-all duration-700" strokeWidth="2.5" fill="transparent" 
                  strokeDasharray={2 * Math.PI * 16}
                  strokeDashoffset={2 * Math.PI * 16 * (1 - mitigationRate / 100)}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center text-[9px] font-bold font-mono text-emerald-400">
                {mitigationRate}%
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid Split Layout (Matrix + Inspector side panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Left Column: Interactive Matrix Card (2/3 width) */}
        <div className="lg:col-span-2 flex flex-col">
          <Card className="border-white/5 bg-[#090d1a]/30 backdrop-blur-xl flex-1 flex flex-col justify-between">
            <CardHeader className="pb-3 border-b border-white/5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <CardTitle className="text-sm font-bold text-white flex items-center gap-1.5">
                  <Sliders size={14} className="text-cyan-400" /> Cuadrícula de Calor ISO 31000
                </CardTitle>
                <CardDescription className="text-xs">Usa los filtros y haz clic en las celdas numéricas.</CardDescription>
              </div>
              
              {/* Residual toggle button */}
              <Button
                variant="outline"
                size="sm"
                className={`h-8 text-xs gap-1.5 border-white/10 transition-all duration-300 ${
                  hideMitigated 
                    ? 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30 shadow-[0_0_10px_rgba(6,182,212,0.15)]' 
                    : 'text-slate-400 hover:text-white'
                }`}
                onClick={handleMitigatedToggle}
              >
                {hideMitigated ? <EyeOff size={13} /> : <Eye size={13} />}
                {hideMitigated ? 'Filtro: Riesgo Residual (Sin mitigados)' : 'Ver Todos los Riesgos'}
              </Button>
            </CardHeader>
            <CardContent className="pt-5 flex-1 flex flex-col justify-between space-y-6">
              
              {/* Premium Glass Filters Panel */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/30 p-3 rounded-lg border border-white/5">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                    <Layers size={10} className="text-cyan-400" /> Categoría
                  </span>
                  <select
                    className="w-full text-xs bg-slate-900/60 border border-white/10 rounded px-2.5 py-1.5 text-slate-300 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 cursor-pointer transition-all"
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    <option value="" className="bg-[#0d1127]">Todas las categorías</option>
                    {RISK_CATEGORIES.map(c => <option key={c} value={c} className="bg-[#0d1127]">{c}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                    <CheckCircle2 size={10} className="text-cyan-400" /> Estado
                  </span>
                  <select
                    className="w-full text-xs bg-slate-900/60 border border-white/10 rounded px-2.5 py-1.5 text-slate-300 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 cursor-pointer transition-all"
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <option value="" className="bg-[#0d1127]">Todos los estados</option>
                    {RISK_STATUSES.map(s => <option key={s} value={s} className="bg-[#0d1127]">{s}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                    <Calendar size={10} className="text-cyan-400" /> Sprint asignado
                  </span>
                  <select
                    className="w-full text-xs bg-slate-900/60 border border-white/10 rounded px-2.5 py-1.5 text-slate-300 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 cursor-pointer transition-all"
                    value={filters.sprintId}
                    onChange={(e) => handleFilterChange('sprintId', e.target.value)}
                  >
                    <option value="" className="bg-[#0d1127]">Todos los sprints</option>
                    {sprints.map(s => <option key={s.id} value={s.id} className="bg-[#0d1127]">{s.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Dynamic 5x5 Heatmap Grid */}
              <div className="grid grid-cols-[36px_repeat(5,_minmax(0,1fr))] gap-2 text-xs select-none">
                <div />
                {[1, 2, 3, 4, 5].map((i) => (
                  <div 
                    key={i} 
                    className="text-center font-bold text-slate-400 py-1 bg-white/5 rounded border border-white/5 tracking-wider font-mono"
                  >
                    I{i}
                  </div>
                ))}
                
                {[5, 4, 3, 2, 1].map((p) => (
                  <Fragment key={`row-${p}`}>
                    <div className="flex items-center justify-center font-bold text-slate-400 bg-white/5 rounded border border-white/5 font-mono">
                      P{p}
                    </div>
                    {[1, 2, 3, 4, 5].map((i) => {
                      const level = p * i;
                      const cellRisks = buckets[`${p}-${i}`] || [];
                      const count = cellRisks.length;
                      const zone = getZone(level);
                      const isSelected = selectedCell && selectedCell.p === p && selectedCell.i === i;
                      const hasCritical = zone === 'Crítico' && count > 0;
                      
                      return (
                        <button
                          key={`${p}-${i}`}
                          type="button"
                          onClick={() => handleCellClick(p, i, level)}
                          className={`aspect-square rounded-lg flex flex-col items-center justify-center font-bold transition-all relative border outline-none ${
                            ZONE_STYLE[zone]
                          } ${
                            isSelected ? SELECTED_GLOW[zone] : ''
                          } ${
                            hasCritical ? 'animate-pulse-red' : ''
                          }`}
                          title={`Probabilidad ${p} × Impacto ${i} = Nivel ${level}`}
                        >
                          {/* Inner level number */}
                          <span className="text-[11px] block">{level}</span>
                          
                          {/* Interactive floating indicator bubble */}
                          {count > 0 ? (
                            <span 
                              className={`text-[9px] font-mono leading-none px-1.5 py-0.5 rounded-full mt-1.5 ${
                                animatingCount ? 'animate-pop-scale' : ''
                              } ${
                                isSelected ? 'bg-white text-slate-950' : 'bg-white/10 text-white'
                              }`}
                            >
                              {count}
                            </span>
                          ) : null}

                          {/* Critical glow dot corner */}
                          {hasCritical && (
                            <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-red-400 rounded-full animate-ping-glow" />
                          )}
                        </button>
                      );
                    })}
                  </Fragment>
                ))}
              </div>

              {/* Grid Legend bar */}
              <div className="pt-4 border-t border-white/5 flex flex-wrap gap-4 text-[10px] text-slate-400 justify-center font-semibold uppercase tracking-wider">
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500/20 border border-emerald-500/40" />Bajo (1-4)</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/40" />Medio (5-9)</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-500/20 border border-orange-500/40" />Alto (10-14)</div>
                <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/40 animate-pulse" />Crítico (15-25)</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Interactive Inspector Panel (1/3 width) */}
        <div className="flex flex-col">
          <Card className="border-white/5 bg-[#090d1a]/50 backdrop-blur-xl flex-1 flex flex-col justify-between overflow-hidden relative">
            <CardHeader className="pb-3 border-b border-white/5">
              <CardTitle className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1.5">
                <Sparkles size={14} className="text-cyan-400" /> Asistente de Inspección
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between pt-4 overflow-y-auto">
              {!selectedCell ? (
                /* Default Panel: Project zone distribution summary (Fluid Slide Animation) */
                <div className="space-y-4 my-auto py-4 animate-fade-in-slide">
                  <div className="text-center space-y-2 pb-2">
                    <div className="w-11 h-11 rounded-full bg-slate-900/80 border border-white/5 flex items-center justify-center mx-auto text-slate-400 shadow-md">
                      <Grid3x3 size={18} className="animate-spin-slow" />
                    </div>
                    <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto leading-relaxed">
                      Haz clic en cualquier cuadrante numérico de la matriz para desplegar los riesgos mapeados.
                    </p>
                  </div>
                  
                  {/* Zone percentage summary */}
                  <div className="space-y-3 pt-4 border-t border-white/5 text-[11px]">
                    <p className="font-bold text-[9px] uppercase text-slate-500 tracking-wider">Severidad del Portafolio:</p>
                    
                    <div className="space-y-3">
                      <div className="space-y-1">
                        <div className="flex justify-between text-red-400 font-semibold">
                          <span>Zona Crítica (15-25):</span>
                          <span>{criticalCount} ({totalCount ? Math.round((criticalCount/totalCount)*100) : 0}%)</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-950/40 rounded-full overflow-hidden border border-white/5">
                          <div className="h-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-700 ease-out" style={{ width: `${totalCount ? (criticalCount/totalCount)*100 : 0}%` }} />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-orange-400 font-semibold">
                          <span>Zona Alta (10-14):</span>
                          <span>{highCount} ({totalCount ? Math.round((highCount/totalCount)*100) : 0}%)</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-950/40 rounded-full overflow-hidden border border-white/5">
                          <div className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-700 ease-out" style={{ width: `${totalCount ? (highCount/totalCount)*100 : 0}%` }} />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-yellow-400 font-semibold">
                          <span>Zona Media (5-9):</span>
                          <span>{mediumCount} ({totalCount ? Math.round((mediumCount/totalCount)*100) : 0}%)</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-950/40 rounded-full overflow-hidden border border-white/5">
                          <div className="h-full bg-gradient-to-r from-yellow-500 to-yellow-400 transition-all duration-700 ease-out" style={{ width: `${totalCount ? (mediumCount/totalCount)*100 : 0}%` }} />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-emerald-400 font-semibold">
                          <span>Zona Baja (1-4):</span>
                          <span>{lowCount} ({totalCount ? Math.round((lowCount/totalCount)*100) : 0}%)</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-950/40 rounded-full overflow-hidden border border-white/5">
                          <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-700 ease-out" style={{ width: `${totalCount ? (lowCount/totalCount)*100 : 0}%` }} />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Dynamic Cell Panel: Risks in selected cell (Fluid Slide Animation) */
                <div className="space-y-4 h-full flex flex-col justify-between animate-fade-in-slide">
                  <div className="space-y-3.5">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider font-mono">Celda Seleccionada</span>
                        <h4 className="text-sm font-bold text-white font-mono mt-0.5">Probabilidad {selectedCell.p} × Impacto {selectedCell.i}</h4>
                      </div>
                      <Badge variant="outline" className={`text-[10px] uppercase font-bold ${ZONE_STYLE[selectedCell.zone]}`}>
                        {selectedCell.zone}
                      </Badge>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-snug">
                      Se encontraron <strong>{selectedCell.risks.length}</strong> riesgo(s) en esta coordenada:
                    </p>

                    {/* Scrollable risks list with fade-in-up items */}
                    <div className="space-y-2.5 max-h-[42vh] overflow-y-auto pr-1">
                      {selectedCell.risks.length === 0 ? (
                        <p className="text-xs text-slate-500 italic p-4 text-center border border-dashed border-white/5 rounded-md">
                          No hay riesgos que coincidan.
                        </p>
                      ) : (
                        selectedCell.risks.map((r, idx) => (
                          <div 
                            key={r.id}
                            style={{ animationDelay: `${idx * 80}ms` }}
                            className="bg-slate-900/60 border border-white/5 hover:border-primary/20 rounded-md p-3 text-xs transition-all duration-300 hover:bg-[#0c122b]/40 relative group shadow-sm flex flex-col justify-between min-h-[70px] animate-fade-in-up"
                          >
                            <div className="flex items-center justify-between gap-1.5 mb-1.5">
                              <span className="font-mono text-[9px] font-bold text-cyan-400">{r.code}</span>
                              <Badge variant="outline" className="text-[8px] px-1 h-3.5 bg-white/5 text-slate-400 border-none">
                                {r.status}
                              </Badge>
                            </div>
                            
                            <p className="font-semibold text-white leading-snug break-words">
                              {r.title}
                            </p>
                            
                            {r.owner && (
                              <div className="mt-2 pt-1.5 border-t border-white/5 flex items-center gap-1 text-[9px] text-slate-500">
                                <User size={9} /> <span className="truncate">PM: {r.owner}</span>
                              </div>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs border-white/10 mt-4 hover:bg-white/5 text-slate-200 transition-colors" 
                    onClick={() => setSelectedCell(null)}
                  >
                    Volver al Resumen General
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Global CSS for Animations and Custom Effects */}
      <style>{`
        @keyframes pulse-red-glow {
          0%, 100% { 
            border-color: rgba(239, 68, 68, 0.2); 
            box-shadow: 0 0 0 rgba(239, 68, 68, 0);
          }
          50% { 
            border-color: rgba(239, 68, 68, 0.6); 
            box-shadow: 0 0 10px rgba(239, 68, 68, 0.2);
            background-color: rgba(239, 68, 68, 0.15);
          }
        }
        .animate-pulse-red {
          animation: pulse-red-glow 2.5s infinite ease-in-out;
        }

        @keyframes ping-glow {
          0% { transform: scale(1); opacity: 1; }
          100% { transform: scale(2.2); opacity: 0; }
        }
        .animate-ping-glow {
          animation: ping-glow 1.8s infinite ease-in-out;
        }

        @keyframes fade-in-slide {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-slide {
          animation: fade-in-slide 0.4s ease-out forwards;
        }

        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          opacity: 0;
          animation: fade-in-up 0.3s ease-out forwards;
        }

        @keyframes pop-scale {
          0% { transform: scale(1); }
          50% { transform: scale(1.18); }
          100% { transform: scale(1); }
        }
        .animate-pop-scale {
          animation: pop-scale 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        }

        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}

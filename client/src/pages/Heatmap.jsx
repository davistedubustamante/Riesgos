import { useEffect, useState, useCallback, Fragment, useMemo } from 'react';
import { Flame, Eye, Sparkles, AlertTriangle, ShieldAlert, Layers, User, Calendar, Info, RefreshCw } from 'lucide-react';
import { api } from '../services/api.js';
import { useAppStore } from '../store/useAppStore.js';
import EmptyState from '@/components/EmptyState.jsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RISK_CATEGORIES, RISK_STATUSES } from '../utils/risk.js';

export default function Heatmap() {
  const { activeProjectId, sprints } = useAppStore();
  const [mode, setMode] = useState('severity'); // 'frequency' | 'severity'
  const [filters, setFilters] = useState({ category: '', status: '', sprintId: '' });
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [selectedCell, setSelectedCell] = useState(null);
  const [animatingGrid, setAnimatingGrid] = useState(false);

  const fetchHeatmap = useCallback(async () => {
    if (!activeProjectId) return;
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('mode', mode);
      Object.entries(filters).forEach(([k, v]) => { if (v) params.set(k, v); });
      const res = await api.get(`/heatmap/${activeProjectId}?${params.toString()}`);
      setData(res);
      
      // Trigger dynamic pop scale animation
      setAnimatingGrid(true);
      setTimeout(() => setAnimatingGrid(false), 500);

      // Auto-update selected cell details if it was open
      if (selectedCell) {
        const updatedCell = res?.matrix?.find(c => c.probability === selectedCell.probability && c.impact === selectedCell.impact);
        if (updatedCell) setSelectedCell(updatedCell);
      }
    } catch (e) {
      console.error(e);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [activeProjectId, mode, filters]);

  useEffect(() => {
    fetchHeatmap();
  }, [fetchHeatmap]);

  const handleFilterChange = (key, value) => {
    setFilters(f => ({ ...f, [key]: value }));
    setSelectedCell(null);
  };

  const handleModeChange = (newMode) => {
    setMode(newMode);
    setSelectedCell(null);
  };

  // Max value to scale colors dynamically (thermal intensity)
  const maxValue = useMemo(() => {
    if (!data?.matrix?.length) return 1;
    return Math.max(
      1,
      ...data.matrix.map((c) => (mode === 'severity' ? c.accumulatedSeverity : c.riskCount)),
    );
  }, [data, mode]);

  // Dynamic Heatmap colors representing thermal intensity (Low: Cool, High: Melting Hot)
  const getThermalClass = (val) => {
    if (val === 0) return 'bg-white/[0.03] border-white/[0.06] text-[#62666d] hover:bg-white/[0.05]';
    const ratio = val / maxValue;
    if (ratio > 0.75) return 'bg-[#ef4444]/20 border-[#ef4444]/40 text-[#ef4444] hover:bg-[#ef4444]/30';
    if (ratio > 0.45) return 'bg-[#f97316]/20 border-[#f97316]/40 text-[#f97316] hover:bg-[#f97316]/30';
    if (ratio > 0.2)  return 'bg-[#eab308]/15 border-[#eab308]/30 text-[#eab308] hover:bg-[#eab308]/25';
    return 'bg-[#06b6d4]/15 border-[#06b6d4]/30 text-[#06b6d4] hover:bg-[#06b6d4]/25';
  };

  if (!activeProjectId) {
    return <EmptyState icon={Flame} title="Selecciona un proyecto" description="El mapa de calor consolida la exposición al riesgo en tiempo real." />;
  }

  // Hot Zones classification variant
  const getClassificationVariant = (cls) => {
    switch (cls) {
      case 'Crítico': return 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/20';
      case 'Alto':   return 'bg-[#f97316]/10 text-[#f97316] border-[#f97316]/20';
      case 'Medio':  return 'bg-[#eab308]/10 text-[#eab308] border-[#eab308]/20';
      default:        return 'bg-[#10b981]/10 text-[#10b981] border-[#10b981]/20';
    }
  };

  // General Exposure summary values
  const totalRisks = data?.matrix?.reduce((acc, c) => acc + c.riskCount, 0) || 0;
  const totalSeverity = data?.matrix?.reduce((acc, c) => acc + c.accumulatedSeverity, 0) || 0;
  const hotZonesCount = data?.hotZones?.length || 0;
  const criticalRisks = data?.matrix?.filter(c => (c.probability * c.impact) >= 15).length || 0;
  const highFreqRisks = data?.matrix?.filter(c => c.riskCount >= 3).length || 0;

  return (
    <div className="space-y-6">
      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1a1d27] border border-white/5 rounded-2xl p-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-[#06b6d4]/10">
            <Flame size={16} className="text-[#06b6d4]" />
          </div>
          <p className="text-xs text-[#8a8f98] uppercase tracking-wide font-medium mb-1">Total Riesgos</p>
          <p className="text-2xl font-bold text-white">{totalRisks}</p>
        </div>
        <div className="bg-[#1a1d27] border border-white/5 rounded-2xl p-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-[#ef4444]/10">
            <AlertTriangle size={16} className="text-[#ef4444]" />
          </div>
          <p className="text-xs text-[#8a8f98] uppercase tracking-wide font-medium mb-1">Críticos (P×I≥15)</p>
          <p className="text-2xl font-bold text-white">{criticalRisks}</p>
        </div>
        <div className="bg-[#1a1d27] border border-white/5 rounded-2xl p-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-[#f97316]/10">
            <Eye size={16} className="text-[#f97316]" />
          </div>
          <p className="text-xs text-[#8a8f98] uppercase tracking-wide font-medium mb-1">Alta Frecuencia</p>
          <p className="text-2xl font-bold text-white">{highFreqRisks}</p>
        </div>
        <div className="bg-[#1a1d27] border border-white/5 rounded-2xl p-4">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center mb-3 bg-[#8b5cf6]/10">
            <Sparkles size={16} className="text-[#8b5cf6]" />
          </div>
          <p className="text-xs text-[#8a8f98] uppercase tracking-wide font-medium mb-1">Zonas Calientes</p>
          <p className="text-2xl font-bold text-white">{hotZonesCount}</p>
        </div>
      </div>

      {/* Header with Mode Toggler */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#f7f8f8] flex items-center gap-2">
            <Flame size={24} className="text-[#f97316]" /> Mapa de Calor de Riesgos
          </h1>
          <p className="text-xs text-[#8a8f98]">Cuadrícula 5×5 — Probabilidad × Impacto. Analiza la densidad de exposición al riesgo.</p>
        </div>
        
        {/* Toggle Mode Tab */}
        <Tabs value={mode} onValueChange={handleModeChange} className="shrink-0">
          <TabsList className="bg-slate-950/40 p-1 border border-white/5 rounded-lg">
            <TabsTrigger value="frequency" className="text-xs">Frecuencia (Cantidad)</TabsTrigger>
            <TabsTrigger value="severity" className="text-xs">Severidad Acumulada</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* KPI Stats Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400">
              <Flame size={18} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Severidad Térmica Total</p>
              <p className="text-lg font-bold font-mono text-white mt-0.5">{totalSeverity} <span className="text-[9px] font-normal text-slate-500">puntos</span></p>
            </div>
          </CardContent>
        </Card>

        <Card className="card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
              <ShieldAlert size={18} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Zonas Calientes (Críticos/Altos)</p>
              <p className="text-lg font-bold font-mono text-red-400 mt-0.5">{hotZonesCount} <span className="text-[9px] font-normal text-slate-500">coordenadas</span></p>
            </div>
          </CardContent>
        </Card>

        <Card className="card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-500/10 flex items-center justify-center text-cyan-400">
              <Info size={18} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Riesgos Analizados</p>
              <p className="text-lg font-bold font-mono text-cyan-400 mt-0.5">{totalRisks} <span className="text-[9px] font-normal text-slate-500">del contexto</span></p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grid Layout Split Pane */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        
        {/* Left Column: Heatmap visual block (2/3 width) */}
        <div className="lg:col-span-2 flex flex-col">
          <Card className="card flex-1 flex flex-col justify-between">
            <CardHeader className="pb-3 border-b border-white/[0.06]">
              <CardTitle className="text-sm font-semibold text-[#f7f8f8]">
                Matriz P×I — {mode === 'severity' ? 'Severidad Acumulada' : 'Frecuencia de Ocurrencia'}
              </CardTitle>
              <CardDescription className="text-xs">Haz clic en una celda para ver los riesgos que contiene.</CardDescription>
            </CardHeader>
            <CardContent className="pt-5 flex-1 flex flex-col justify-between space-y-6">
              
              {/* Interactive filters */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-slate-950/30 p-3 rounded-lg border border-white/5">
                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                    <Layers size={10} className="text-cyan-400" /> Categoría
                  </span>
                  <select
                    className="w-full text-xs bg-slate-900/60 border border-white/10 rounded px-2.5 py-1.5 text-slate-300 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 cursor-pointer"
                    value={filters.category || ''}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                  >
                    <option value="" className="bg-[#0d1127]">Todas</option>
                    {RISK_CATEGORIES.map(c => <option key={c} value={c} className="bg-[#0d1127]">{c}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                    <RefreshCw size={10} className="text-cyan-400" /> Estado
                  </span>
                  <select
                    className="w-full text-xs bg-slate-900/60 border border-white/10 rounded px-2.5 py-1.5 text-slate-300 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 cursor-pointer"
                    value={filters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                  >
                    <option value="" className="bg-[#0d1127]">Todos</option>
                    {RISK_STATUSES.map(s => <option key={s} value={s} className="bg-[#0d1127]">{s}</option>)}
                  </select>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                    <Calendar size={10} className="text-cyan-400" /> Sprint
                  </span>
                  <select
                    className="w-full text-xs bg-slate-900/60 border border-white/10 rounded px-2.5 py-1.5 text-slate-300 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 cursor-pointer"
                    value={filters.sprintId || ''}
                    onChange={(e) => handleFilterChange('sprintId', e.target.value)}
                  >
                    <option value="" className="bg-[#0d1127]">Todos</option>
                    {sprints.map(s => <option key={s.id} value={s.id} className="bg-[#0d1127]">{s.name}</option>)}
                  </select>
                </div>
              </div>

              {/* Heatmap Grid Layout */}
              <div className="grid grid-cols-[36px_repeat(5,_minmax(0,1fr))] gap-2 text-xs select-none">
                <div />
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="text-center font-bold text-slate-400 py-1 bg-white/5 rounded border border-white/5 font-mono">I{i}</div>
                ))}
                
                {[5, 4, 3, 2, 1].map((p) => (
                  <Fragment key={`row-${p}`}>
                    <div className="flex items-center justify-center font-bold text-slate-400 bg-white/5 rounded border border-white/5 font-mono">
                      P{p}
                    </div>
                    {[1, 2, 3, 4, 5].map((i) => {
                      const cell = data?.matrix?.find(c => c.probability === p && c.impact === i);
                      const value = mode === 'severity' ? cell?.accumulatedSeverity || 0 : cell?.riskCount || 0;
                      const thermalClass = getThermalClass(value);
                      const isSelected = selectedCell && selectedCell.probability === p && selectedCell.impact === i;
                      
                      return (
                        <button
                          key={`${p}-${i}`}
                          type="button"
                          onClick={() => cell && setSelectedCell(cell)}
                          className={`aspect-square rounded-lg flex flex-col items-center justify-center font-bold border transition-all duration-300 relative ${thermalClass} ${
                            isSelected ? 'ring-2 ring-primary border-primary scale-[0.98] shadow-[0_0_15px_rgba(6,182,212,0.35)] bg-slate-900/60' : ''
                          }`}
                        >
                          <span className={`text-[12px] block ${value > 0 ? 'text-white' : ''}`}>{value}</span>
                          <span className="text-[9px] opacity-75 font-normal tracking-wide block mt-1">
                            {cell?.classification || '—'}
                          </span>

                        </button>
                      );
                    })}
                  </Fragment>
                ))}
              </div>

              {/* Thermal color scale indicators */}
              <div className="pt-4 border-t border-white/5 flex flex-wrap gap-4 text-[10px] text-slate-400 justify-center font-semibold uppercase tracking-wider">
                <div className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded bg-slate-950/40 border border-white/5" />Sin Exposición</div>
                <div className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded bg-cyan-500/20 border border-cyan-500/40" />Baja carga</div>
                <div className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded bg-yellow-500/25 border border-yellow-500/40" />Moderada</div>
                <div className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded bg-orange-500/25 border border-orange-500/40 animate-pulse" />Alta</div>
                <div className="flex items-center gap-2"><span className="w-3.5 h-3.5 rounded bg-red-500/25 border border-red-500/40 animate-pulse" />Zona Extrema</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Hot Zones & inspector panel */}
        <div className="flex flex-col">
          <Card className="card flex-1 flex flex-col justify-between overflow-hidden">
            <CardHeader className="pb-3 border-b border-white/[0.06]">
              <CardTitle className="text-xs font-semibold text-[#8a8f98] uppercase tracking-wider flex items-center gap-1.5">
                Analizador de Focos
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between pt-4 overflow-y-auto">
              {!selectedCell ? (
                /* Default Panel: Hot Zones Ranked List */
                <div className="space-y-4 h-full flex flex-col justify-between animate-fade-in-slide">
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-semibold text-[#8a8f98] uppercase tracking-widest">
                      Zonas Críticas
                    </h4>
                    
                    {!data?.hotZones?.length ? (
                      <p className="text-xs text-slate-500 italic p-6 text-center border border-dashed border-white/5 rounded-md leading-relaxed">
                        No hay zonas críticas (Alto/Crítico) detectadas con los filtros activos.
                      </p>
                    ) : (
                      <div className="space-y-2.5 max-h-[36vh] overflow-y-auto pr-1">
                        {data.hotZones.map((z, idx) => (
                          <div
                            key={`${z.probability}-${z.impact}`}
                            className="bg-slate-950/40 border border-white/5 hover:border-primary/30 rounded-md p-3 transition-all duration-300 cursor-pointer flex items-center justify-between group"
                            onClick={() => setSelectedCell(z)}
                          >
                            <div className="space-y-1">
                              <span className="font-mono text-xs font-semibold text-white">Prob. {z.probability} × Imp. {z.impact}</span>
                              <p className="text-[10px] text-slate-400 block">
                                {mode === 'severity' 
                                  ? `Exposición acumulada: ${z.accumulatedSeverity} pts` 
                                  : `${z.riskCount} riesgo(s) agrupado(s)`}
                              </p>
                            </div>
                            <Badge variant="outline" className={`text-[9px] uppercase font-bold ${getClassificationVariant(z.classification)}`}>
                              {z.classification}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Heatmap Guidance */}
                  <div className="pt-3 border-t border-white/5 text-[11px] space-y-2 text-slate-400">
                    <p className="font-bold text-[9px] uppercase text-slate-500 tracking-wider">Preguntas que responde:</p>
                    <ul className="space-y-1.5 list-disc pl-4 leading-normal">
                      <li>¿Dónde se concentra la mayor vulnerabilidad técnica o de negocio?</li>
                      <li>¿Qué combinación de Probabilidad × Impacto genera mayor peso acumulado?</li>
                      <li>¿Qué celdas requieren priorización en el siguiente sprint de Scrum?</li>
                    </ul>
                  </div>
                </div>
              ) : (
                /* Selected cell detail inspect */
                <div className="space-y-4 h-full flex flex-col justify-between animate-fade-in-slide">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between border-b border-white/5 pb-2">
                      <div>
                        <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider font-mono">Detalle de Coordenada</span>
                        <h4 className="text-sm font-bold text-white font-mono mt-0.5">Probabilidad {selectedCell.probability} × Impacto {selectedCell.impact}</h4>
                      </div>
                      <Badge variant="outline" className={`text-[10px] font-bold ${getClassificationVariant(selectedCell.classification)}`}>
                        {selectedCell.classification}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[10px] py-1 bg-slate-950/20 rounded border border-white/5 text-center">
                      <div>
                        <span className="text-slate-500 block uppercase font-bold tracking-wider text-[8px]">Riesgos</span>
                        <strong className="text-sm text-cyan-400 font-mono mt-0.5 block">{selectedCell.riskCount}</strong>
                      </div>
                      <div>
                        <span className="text-slate-500 block uppercase font-bold tracking-wider text-[8px]">Severidad Acumulada</span>
                        <strong className="text-sm text-orange-400 font-mono mt-0.5 block">{selectedCell.accumulatedSeverity}</strong>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400">
                      Riesgos mapped en este foco:
                    </p>

                    <div className="space-y-2 max-h-[38vh] overflow-y-auto pr-1">
                      {selectedCell.risks.length === 0 ? (
                        <p className="text-xs text-slate-500 italic p-3 text-center border border-dashed border-white/5 rounded-md">
                          No hay riesgos para esta coordenada.
                        </p>
                      ) : (
                        selectedCell.risks.map((r, idx) => (
                          <div 
                            key={r.id}
                            style={{ animationDelay: `${idx * 80}ms` }}
                            className="bg-slate-900/60 border border-white/5 rounded p-2.5 text-xs animate-fade-in-up"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-mono text-[9px] font-bold text-cyan-400">{r.code}</span>
                              <Badge variant="outline" className="text-[8px] border-none bg-white/5 text-slate-400 font-mono">
                                Nivel {r.level}
                              </Badge>
                            </div>
                            <p className="font-semibold text-white leading-snug break-words">{r.title}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full text-xs border-white/10 mt-4 text-slate-200" 
                    onClick={() => setSelectedCell(null)}
                  >
                    Volver al Ranking de Zonas
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

    </div>
  );
}

import { Fragment, useMemo, useState } from 'react';
import { Flame, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import HeatmapLegend from './HeatmapLegend.jsx';
import HeatmapCellDetail from './HeatmapCellDetail.jsx';

// Componente reutilizable que recibe los riesgos y un modo de cálculo.
// mode "frequency" | "severity". Si falta la lista, muestra placeholder.
export default function RiskHeatmap({ data, loading, mode, onChangeMode, filters, onFilterChange }) {
  const [selectedCell, setSelectedCell] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // Calcular máximos para escalar el color por intensidad.
  const maxValue = useMemo(() => {
    if (!data?.matrix?.length) return 1;
    return Math.max(
      1,
      ...data.matrix.map((c) => (mode === 'severity' ? c.accumulatedSeverity : c.riskCount)),
    );
  }, [data, mode]);

  function colorFor(value) {
    if (value <= 0) return 'bg-white/5 text-muted-foreground';
    const t = value / maxValue;
    // Tonos oscuros: cuanto más alto el valor, más intenso el color.
    if (mode === 'severity') {
      if (t > 0.75) return 'bg-red-500/20 text-red-300';
      if (t > 0.5) return 'bg-orange-500/20 text-orange-300';
      if (t > 0.25) return 'bg-yellow-500/20 text-yellow-300';
      return 'bg-emerald-500/20 text-emerald-300';
    }
    if (t > 0.75) return 'bg-red-500/20 text-red-300';
    if (t > 0.5) return 'bg-orange-500/20 text-orange-300';
    if (t > 0.25) return 'bg-yellow-500/20 text-yellow-300';
    return 'bg-emerald-500/20 text-emerald-300';
  }

  function classificationBadgeVariant(classification) {
    switch (classification) {
      case 'Crítico': return 'destructive';
      case 'Alto': return 'destructive';
      case 'Medio': return 'secondary';
      case 'Bajo': return 'secondary';
      default: return 'outline';
    }
  }

  function cellByProbImpact(p, i) {
    return data?.matrix?.find((c) => c.probability === p && c.impact === i);
  }

  function onCellClick(cell) {
    setSelectedCell(cell);
    setDetailOpen(true);
  }

  return (
    <div className="space-y-4">
      {/* Controles: filtros */}
      <Card className="border-white/5 bg-card/60 backdrop-blur-sm shadow-md">
        <CardContent className="py-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">Filtrar mapa de calor</div>
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                className="flex h-8 w-full sm:w-[160px] rounded-md border border-white/10 bg-slate-900/60 text-white px-2 py-0.5 text-xs shadow-sm transition-smooth focus:outline-none focus:ring-1 focus:ring-cyan-500/50 cursor-pointer"
                value={filters?.category || ''}
                onChange={(e) => onFilterChange?.({ ...filters, category: e.target.value })}
              >
                <option value="" className="bg-[#0d1127] text-white">Todas las categorías</option>
                {[
                  'Técnico','Funcional','Seguridad','Privacidad','Ético / algorítmico',
                  'Operativo','Organizacional','Metodológico','Legal','Usabilidad',
                  'Rendimiento','Integración',
                ].map((c) => <option key={c} className="bg-[#0d1127] text-white">{c}</option>)}
              </select>
              <select
                className="flex h-8 w-full sm:w-[150px] rounded-md border border-white/10 bg-slate-900/60 text-white px-2 py-0.5 text-xs shadow-sm transition-smooth focus:outline-none focus:ring-1 focus:ring-cyan-500/50 cursor-pointer"
                value={filters?.status || ''}
                onChange={(e) => onFilterChange?.({ ...filters, status: e.target.value })}
              >
                <option value="" className="bg-[#0d1127] text-white">Todos los estados</option>
                {['Identificado','Analizado','En tratamiento','Mitigado','Aceptado','Cerrado'].map((s) => (
                  <option key={s} value={s} className="bg-[#0d1127] text-white">{s}</option>
                ))}
              </select>
              <select
                className="flex h-8 w-full sm:w-[140px] rounded-md border border-white/10 bg-slate-900/60 text-white px-2 py-0.5 text-xs shadow-sm transition-smooth focus:outline-none focus:ring-1 focus:ring-cyan-500/50 cursor-pointer"
                value={filters?.classification || ''}
                onChange={(e) => onFilterChange?.({ ...filters, classification: e.target.value })}
              >
                <option value="" className="bg-[#0d1127] text-white">Toda clasificación</option>
                {['Bajo','Medio','Alto','Crítico'].map((s) => (
                  <option key={s} value={s} className="bg-[#0d1127] text-white">{s}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-[2fr_1fr] gap-4">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Flame size={18} className="text-orange-500" /> Mapa de calor — {mode === 'severity' ? 'Severidad acumulada' : 'Frecuencia'}
              </CardTitle>
              <span className="text-xs text-muted-foreground">{loading ? 'Cargando…' : `${data?.matrix?.length || 0} celdas`}</span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-[40px_repeat(5,_minmax(0,1fr))] gap-1 text-xs">
              <div />
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="text-center font-semibold text-muted-foreground">{`I${i}`}</div>
              ))}
              {[5, 4, 3, 2, 1].map((p) => (
                <Fragment key={`row-${p}`}>
                  <div className="flex items-center justify-center font-semibold text-muted-foreground">
                    P{p}
                  </div>
                  {[1, 2, 3, 4, 5].map((i) => {
                    const cell = cellByProbImpact(p, i);
                    const value = mode === 'severity' ? cell?.accumulatedSeverity || 0 : cell?.riskCount || 0;
                    return (
                      <button
                        key={`${p}-${i}`}
                        onClick={() => onCellClick(cell || { probability: p, impact: i, level: p * i, risks: [], riskCount: 0, accumulatedSeverity: 0, value: 0, classification: '' })}
                        className={`aspect-square rounded-md flex flex-col items-center justify-center font-semibold hover:ring-2 hover:ring-cyan-500 transition ${colorFor(value)}`}
                        title={`P${p} × I${i} → ${cell?.classification || ''} · ${value}`}
                      >
                        <span className="text-[10px] opacity-70">{value}</span>
                        <span className="text-[10px] mt-0.5">{cell?.classification || '—'}</span>
                      </button>
                    );
                  })}
                </Fragment>
              ))}
            </div>

            <HeatmapLegend mode={mode} max={maxValue} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye size={18} /> Zonas calientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            {!data?.hotZones?.length ? (
              <p className="text-xs text-muted-foreground">No hay zonas críticas con los filtros aplicados.</p>
            ) : (
              <ul className="space-y-2">
                {data.hotZones.map((z) => (
                  <li
                    key={`${z.probability}-${z.impact}`}
                    className="border border-border/50 rounded-lg p-2 cursor-pointer hover:bg-white/10"
                    onClick={() => onCellClick(z)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-sm">P{z.probability} × I{z.impact}</span>
                      <Badge variant={classificationBadgeVariant(z.classification)}>{z.classification}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {mode === 'severity'
                        ? `Severidad acumulada: ${z.accumulatedSeverity}`
                        : `${z.riskCount} riesgo(s)`}
                    </p>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4 pt-3 border-t border-border/50">
              <h4 className="font-semibold text-sm mb-2">Preguntas que responde</h4>
              <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                <li>¿Dónde se concentran los riesgos más críticos?</li>
                <li>¿Qué combinación P×I domina?</li>
                <li>¿Qué celdas requieren tratamiento prioritario?</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <HeatmapCellDetail
        open={detailOpen}
        cell={selectedCell}
        onClose={() => setDetailOpen(false)}
      />
    </div>
  );
}

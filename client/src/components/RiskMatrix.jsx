import { Fragment } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

// Dark-mode color map for classification levels
const LEVEL_STYLE = {
  Crítico: 'bg-red-500/20 text-red-300 border border-red-500/30',
  Alto:    'bg-orange-500/20 text-orange-300 border border-orange-500/30',
  Medio:   'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30',
  Bajo:    'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30',
};

function clsFor(level) {
  if (level >= 15) return LEVEL_STYLE['Crítico'];
  if (level >= 10) return LEVEL_STYLE['Alto'];
  if (level >= 5)  return LEVEL_STYLE['Medio'];
  return LEVEL_STYLE['Bajo'];
}

export default function RiskMatrix({ risks, onCellClick }) {
  const buckets = {};
  risks.forEach((r) => {
    const key = `${r.probability}-${r.impact}`;
    buckets[key] = (buckets[key] || 0) + 1;
  });

  return (
    <Card className="glass card-lift">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-card-foreground">Matriz de probabilidad-impacto</h3>
          <span className="text-xs text-muted-foreground">Probabilidad ↑ / Impacto →</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-[40px_repeat(5,_minmax(0,1fr))] gap-1 text-xs">
          <div />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="text-center font-semibold text-muted-foreground">I{i}</div>
          ))}
          {[5, 4, 3, 2, 1].map((p) => (
            <Fragment key={`row-${p}`}>
              <div className="flex items-center justify-center font-semibold text-muted-foreground">
                P{p}
              </div>
              {[1, 2, 3, 4, 5].map((i) => {
                const level = p * i;
                const count = buckets[`${p}-${i}`] || 0;
                return (
                  <button
                    key={`${p}-${i}`}
                    onClick={() => onCellClick?.({ p, i, level, count })}
                    className={`aspect-square rounded-md flex flex-col items-center justify-center font-semibold hover:opacity-80 transition ${clsFor(level)}`}
                    title={`P${p} × I${i} → nivel ${level}`}
                  >
                    <span className="text-[11px]">{level}</span>
                    {count > 0 ? (
                      <span className="text-[10px] bg-white/10 px-1.5 rounded-full mt-0.5">{count}</span>
                    ) : null}
                  </button>
                );
              })}
            </Fragment>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-emerald-500/20 border border-emerald-500/30" />Bajo (1-4)</div>
          <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-yellow-500/20 border border-yellow-500/30" />Medio (5-9)</div>
          <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-orange-500/20 border border-orange-500/30" />Alto (10-14)</div>
          <div className="flex items-center gap-2"><span className="w-4 h-4 rounded bg-red-500/20 border border-red-500/30" />Crítico (15-25)</div>
        </div>
      </CardContent>
    </Card>
  );
}

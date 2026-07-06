import { Card, CardContent } from '@/components/ui/card';

export default function HeatmapLegend({ mode, max }) {
  return (
    <Card className="glass mt-4">
      <CardContent className="pt-3">
        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="font-semibold uppercase tracking-wide text-muted-foreground">Intensidad:</span>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-4 rounded bg-emerald-500/20 border border-emerald-500/30" />
            <span className="w-4 h-4 rounded bg-yellow-500/20 border border-yellow-500/30" />
            <span className="w-4 h-4 rounded bg-orange-500/20 border border-orange-500/30" />
            <span className="w-4 h-4 rounded bg-red-500/20 border border-red-500/30" />
            <span className="ml-1">0 → {max}</span>
          </div>
          <span className="text-muted-foreground">
            {mode === 'severity'
              ? 'La intensidad representa la suma de niveles (P×I) en la celda.'
              : 'La intensidad representa el número de riesgos en la celda.'}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

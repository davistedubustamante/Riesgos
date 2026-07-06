import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const COLUMNS = [
  { id: 'Identificado',    tone: 'bg-white/10 text-white/80 border-white/20' },
  { id: 'Analizado',       tone: 'bg-blue-500/15 text-blue-300 border-blue-500/25' },
  { id: 'En tratamiento',  tone: 'bg-amber-500/15 text-amber-300 border-amber-500/25' },
  { id: 'Mitigado',        tone: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/25' },
  { id: 'Aceptado',        tone: 'bg-purple-500/15 text-purple-300 border-purple-500/25' },
  { id: 'Cerrado',         tone: 'bg-white/5 text-white/50 border-white/10' },
];

export default function SprintBoard({ risks, onAddRisk, onMoveRisk }) {
  const grouped = COLUMNS.map((col) => ({
    ...col,
    items: risks.filter((r) => r.status === col.id),
  }));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {grouped.map((col) => (
        <div
          key={col.id}
          className="flex flex-col rounded-xl border border-border/50 bg-[#090d1a]/60 backdrop-blur p-3 min-h-[220px]"
        >
          <div className="flex items-center justify-between mb-2">
            <span className={`inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold border ${col.tone}`}>
              {col.id}
            </span>
          </div>
          <p className="text-[10px] font-medium text-muted-foreground mb-3">{col.items.length} riesgo(s)</p>

          <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[300px] pr-1">
            {col.items.length === 0 ? (
              <div className="h-full border border-dashed border-white/5 rounded-md flex items-center justify-center p-4 text-[10px] text-muted-foreground text-center">
                Vacío
              </div>
            ) : col.items.map((r) => (
              <div
                key={r.id}
                className="bg-slate-900/40 border border-white/5 hover:border-primary/40 rounded-md p-2.5 transition-all"
              >
                <p className="font-mono text-[9px] font-semibold text-muted-foreground mb-0.5">{r.code}</p>
                <p className="text-xs font-semibold leading-tight text-white mb-2">{r.title}</p>
                
                {onMoveRisk && (
                  <div className="mt-2 pt-2 border-t border-white/5">
                    <span className="text-[9px] text-muted-foreground uppercase font-bold tracking-wider block mb-1">Cambiar estado:</span>
                    <select
                      value={r.status}
                      onChange={(e) => onMoveRisk(r.id, e.target.value)}
                      className="text-[10px] w-full bg-slate-950 border border-white/10 rounded px-1.5 py-0.5 text-slate-300 cursor-pointer focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                    >
                      <option value="Identificado" className="bg-[#0d1127] text-white">Identificado</option>
                      <option value="Analizado" className="bg-[#0d1127] text-white">Analizado</option>
                      <option value="En tratamiento" className="bg-[#0d1127] text-white">En tratamiento</option>
                      <option value="Mitigado" className="bg-[#0d1127] text-white">Mitigado</option>
                      <option value="Aceptado" className="bg-[#0d1127] text-white">Aceptado</option>
                      <option value="Cerrado" className="bg-[#0d1127] text-white">Cerrado</option>
                    </select>
                  </div>
                )}
              </div>
            ))}
          </div>

          {onAddRisk ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onAddRisk(col.id)}
              className="mt-3 text-[11px] h-7 w-full justify-start text-muted-foreground hover:text-foreground gap-1 px-1.5"
            >
              <Plus size={12} /> Nuevo riesgo
            </Button>
          ) : null}
        </div>
      ))}
    </div>
  );
}

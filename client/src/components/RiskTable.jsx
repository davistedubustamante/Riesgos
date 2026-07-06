import RiskBadge from './RiskBadge.jsx';
import { Trash2, Pencil } from 'lucide-react';
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from '@/components/ui/table';

export default function RiskTable({ risks, sprints = [], onEdit, onDelete }) {
  const sprintName = (id) => sprints.find((s) => s.id === id)?.name || '—';

  if (!risks.length) {
    return (
      <div className="text-center text-sm text-muted-foreground py-8">
        No hay riesgos que coincidan con los filtros.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table className="w-full text-sm">
        <TableHeader>
          <TableRow className="border-border hover:none">
            <TableHead>Código</TableHead>
            <TableHead>Riesgo</TableHead>
            <TableHead>Categoría</TableHead>
            <TableHead className="text-center">P×I</TableHead>
            <TableHead className="text-center">Nivel</TableHead>
            <TableHead>Clasif.</TableHead>
            <TableHead>Responsable</TableHead>
            <TableHead>Sprint</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead className="text-right">Acciones</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {risks.map((r) => (
            <TableRow key={r.id} className="border-border hover:bg-white/5 transition-colors">
              <TableCell className="font-mono text-xs text-muted-foreground">{r.code}</TableCell>
              <TableCell>
                <div className="font-medium text-card-foreground">{r.title}</div>
                {r.description ? (
                  <div className="text-xs text-muted-foreground line-clamp-1">{r.description}</div>
                ) : null}
              </TableCell>
              <TableCell className="text-muted-foreground">{r.category}</TableCell>
              <TableCell className="text-center text-xs text-muted-foreground">
                {r.probability} × {r.impact}
              </TableCell>
              <TableCell className="text-center font-bold text-card-foreground">{r.level}</TableCell>
              <TableCell>
                <RiskBadge value={r.classification} />
              </TableCell>
              <TableCell className="text-muted-foreground">{r.owner || '—'}</TableCell>
              <TableCell className="text-muted-foreground">{sprintName(r.sprintId)}</TableCell>
              <TableCell>
                <span className="text-xs px-2 py-0.5 bg-white/10 rounded-full text-muted-foreground">
                  {r.status}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  {onEdit ? (
                    <button
                      className="p-1.5 rounded hover:bg-white/10 transition-colors"
                      onClick={() => onEdit(r)}
                      title="Editar"
                    >
                      <Pencil size={14} className="text-muted-foreground" />
                    </button>
                  ) : null}
                  {onDelete ? (
                    <button
                      className="p-1.5 rounded hover:bg-red-500/10 text-red-400 transition-colors"
                      onClick={() => onDelete(r)}
                      title="Eliminar"
                    >
                      <Trash2 size={14} />
                    </button>
                  ) : null}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

import Modal from './Modal.jsx';
import RiskBadge from './RiskBadge.jsx';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function HeatmapCellDetail({ open, cell, onClose }) {
  if (!cell) return null;
  const level = cell.level ?? cell.probability * cell.impact;
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Detalle de celda P${cell.probability} × I${cell.impact}`}
      size="md"
      footer={
        <Button variant="outline" onClick={onClose}>Cerrar</Button>
      }
    >
      <div className="grid grid-cols-3 gap-3 mb-4">
        <Card className="glass">
          <CardContent className="pt-3 text-center">
            <p className="text-xs text-muted-foreground">Probabilidad</p>
            <p className="font-bold text-xl text-card-foreground">{cell.probability}</p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="pt-3 text-center">
            <p className="text-xs text-muted-foreground">Impacto</p>
            <p className="font-bold text-xl text-card-foreground">{cell.impact}</p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="pt-3 text-center">
            <p className="text-xs text-muted-foreground">Clasificación</p>
            <div className="mt-1">
              <RiskBadge value={cell.classification || ['Bajo','Medio','Alto','Crítico'][level >= 15 ? 3 : level >= 10 ? 2 : level >= 5 ? 1 : 0]} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <Card className="glass">
          <CardContent className="pt-3">
            <p className="text-xs text-muted-foreground">Riesgos en celda</p>
            <p className="font-bold text-lg text-card-foreground">{cell.riskCount || 0}</p>
          </CardContent>
        </Card>
        <Card className="glass">
          <CardContent className="pt-3">
            <p className="text-xs text-muted-foreground">Severidad acumulada</p>
            <p className="font-bold text-lg text-card-foreground">{cell.accumulatedSeverity || 0}</p>
          </CardContent>
        </Card>
      </div>

      <h4 className="font-semibold text-sm mb-2 text-card-foreground">Riesgos ubicados aquí</h4>
      {!cell.risks?.length ? (
        <p className="text-xs text-muted-foreground">Sin riesgos en esta celda.</p>
      ) : (
        <ul className="divide-y divide-border">
          {cell.risks.map((r) => (
            <li key={r.id} className="py-2 flex items-center justify-between">
              <div>
                <p className="font-mono text-xs text-muted-foreground">{r.code}</p>
                <p className="text-sm font-medium text-card-foreground">{r.title}</p>
              </div>
              <RiskBadge value={r.classification} />
            </li>
          ))}
        </ul>
      )}
    </Modal>
  );
}

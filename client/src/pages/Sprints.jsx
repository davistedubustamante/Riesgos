import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Link2, Settings, AlertCircle, Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { api } from '@/services/api';
import { useAppStore } from '@/store/useAppStore';
import EmptyState from '@/components/EmptyState';
import SprintBoard from '@/components/SprintBoard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export default function Sprints() {
  const { activeProjectId, sprints, loadSprints } = useAppStore();
  const [risks, setRisks] = useState([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [assignOpen, setAssignOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  
  const { register: regCreate, handleSubmit: subCreate, reset: resCreate } = useForm();
  const { register: regEdit, handleSubmit: subEdit, reset: resEdit } = useForm();

  const reloadAll = useCallback(async () => {
    if (!activeProjectId) return;
    await loadSprints(activeProjectId);
    const r = await api.get(`/projects/${activeProjectId}/risks`);
    setRisks(r);
  }, [activeProjectId, loadSprints]);

  useEffect(() => {
    reloadAll();
  }, [reloadAll]);

  // Keep selected sprint updated when data reloads
  useEffect(() => {
    if (selected) {
      const updated = sprints.find(s => s.id === selected.id);
      if (updated) setSelected(updated);
    }
  }, [sprints, selected]);

  async function handleCreate(data) {
    try {
      await api.post(`/projects/${activeProjectId}/sprints`, data);
      setOpen(false);
      resCreate();
      reloadAll();
    } catch (e) {
      alert(e.message);
    }
  }

  async function handleEditSprint(data) {
    try {
      await api.put(`/sprints/${selected.id}`, data);
      setEditOpen(false);
      reloadAll();
    } catch (e) {
      alert(e.message);
    }
  }

  async function handleMoveRisk(riskId, newStatus) {
    try {
      await api.put(`/risks/${riskId}`, { status: newStatus });
      reloadAll();
    } catch (e) {
      alert(e.message);
    }
  }

  async function handleAssignRisk(riskId, assign = true) {
    try {
      await api.put(`/risks/${riskId}`, { sprintId: assign ? selected.id : null });
      reloadAll();
    } catch (e) {
      alert(e.message);
    }
  }

  function startEditSprint(sprint) {
    resEdit({
      name: sprint.name,
      goal: sprint.goal || '',
      startDate: sprint.startDate || '',
      endDate: sprint.endDate || '',
      planningNotes: sprint.planningNotes || '',
      dailyImpediments: sprint.dailyImpediments || '',
      reviewNotes: sprint.reviewNotes || '',
      retrospectiveNotes: sprint.retrospectiveNotes || '',
      lessonsLearned: sprint.lessonsLearned || '',
    });
    setEditOpen(true);
  }

  if (!activeProjectId) {
    return <EmptyState icon={Plus} title="Selecciona un proyecto" description="Los sprints pertenecen a un proyecto." />;
  }

  const selectClass = "flex h-9 w-full rounded-md border border-[hsl(var(--border-hover))] bg-[hsl(var(--surface-panel)/0.6)] text-[hsl(var(--text-primary))] px-3 py-1.5 text-sm shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-[hsl(var(--primary)/0.5)] cursor-pointer";

  // Filter project risks that can be assigned to the sprint
  const unassignedRisks = risks.filter(r => r.sprintId !== selected?.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Seguimiento por sprints Scrum</h1>
          <p className="text-sm text-muted-foreground">
            Crea sprints, asigna riesgos y gestiona retrospectivas, planning e impedimentos.
          </p>
        </div>
        <Button onClick={() => { resCreate({}); setOpen(true); }} className="gap-1.5"><Plus size={16} /> Nuevo sprint</Button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sprints.length === 0 ? (
          <p className="text-sm text-muted-foreground col-span-full py-8 text-center">No hay sprints creados para este proyecto.</p>
        ) : sprints.map((s) => (
          <Card key={s.id} className="flex flex-col panel panel-pad-sm hover:-translate-y-0.5 transition-all duration-300">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold text-[hsl(var(--text-primary))]">{s.name}</CardTitle>
              <CardDescription className="text-xs">{s.startDate} → {s.endDate}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col justify-between">
              <div>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{s.goal || 'Sin objetivo definido.'}</p>
                <div className="text-xs text-[hsl(var(--text-secondary))] mt-2 space-y-1.5 border-t border-[hsl(var(--border))] pt-3">
                  <p className="flex justify-between"><span>Riesgos asociados:</span> <strong className="text-[hsl(var(--text-primary))]">{s.risks?.length || 0}</strong></p>
                  <p className="flex justify-between"><span>Riesgos nuevos:</span> <strong className="text-[hsl(var(--accent))]">{s.newRisks?.length || 0}</strong></p>
                  <p className="flex justify-between"><span>Riesgos mitigados/cerrados:</span> <strong className="text-[hsl(var(--accent))]">{s.closedRisks?.length || 0}</strong></p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="mt-4 w-full border-[hsl(var(--border-hover))]" onClick={() => setSelected(s)}>Ver tablero</Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {selected ? (
        <Card className="panel shadow-sm">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0 pb-4 border-b border-[hsl(var(--border))] mb-4">
            <div>
              <CardTitle className="text-lg flex items-center gap-1.5 text-[hsl(var(--text-primary))]">
                <Sparkles size={16} className="text-[hsl(var(--accent))]" /> Tablero — {selected.name}
              </CardTitle>
              <CardDescription>Riesgos asignados a este sprint, agrupados por estado.</CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" className="border-[hsl(var(--border-hover))]" onClick={() => startEditSprint(selected)}>
                <Settings size={13} className="mr-1.5" /> Configurar Sprint
              </Button>
              <Button variant="outline" size="sm" className="border-[hsl(var(--border-hover))]" onClick={() => setAssignOpen(true)}>
                <Link2 size={13} className="mr-1.5" /> Vincular riesgos
              </Button>
              <Button variant="outline" size="sm" className="border-[hsl(var(--border-hover))]" onClick={() => setSelected(null)}>
                Cerrar tablero
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <SprintBoard 
              risks={risks.filter((r) => r.sprintId === selected.id)} 
              onMoveRisk={handleMoveRisk}
            />
            
            {/* Sprint metadata summary cards */}
            <div className="grid md:grid-cols-3 gap-4 mt-6 border-t border-[hsl(var(--border))] pt-4">
              {selected.planningNotes && (
                <div className="surface-panel rounded-lg p-3.5">
                  <p className="text-[10px] uppercase font-bold text-[hsl(var(--text-secondary))] tracking-wider mb-1">Notas de planning</p>
                  <p className="text-xs text-[hsl(var(--text-secondary))]">{selected.planningNotes}</p>
                </div>
              )}
              {selected.dailyImpediments && (
                <div className="surface-panel rounded-lg p-3.5">
                  <p className="text-[10px] uppercase font-bold text-[hsl(var(--risk-critical))] tracking-wider mb-1">Impedimentos / Bloqueos</p>
                  <p className="text-xs text-[hsl(var(--text-secondary))]">{selected.dailyImpediments}</p>
                </div>
              )}
              {selected.lessonsLearned && (
                <div className="surface-panel rounded-lg p-3.5">
                  <p className="text-[10px] uppercase font-bold text-[hsl(var(--accent))] tracking-wider mb-1">Lecciones aprendidas</p>
                  <p className="text-xs text-[hsl(var(--text-secondary))]">{selected.lessonsLearned}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ) : null}

      {/* Modal: Crear Sprint */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md text-[hsl(var(--text-primary))]">
          <DialogHeader>
            <DialogTitle>Nuevo sprint</DialogTitle>
          </DialogHeader>
          <form className="space-y-4 pt-2" onSubmit={subCreate(handleCreate)}>
            <div className="space-y-1.5">
              <Label htmlFor="name">Nombre</Label>
              <Input id="name" required {...regCreate('name')} placeholder="Ej. Sprint 1 - Base del chatbot" className="bg-[hsl(var(--surface-panel)/0.4)] border-[hsl(var(--border-hover))]" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="goal">Objetivo</Label>
              <Textarea id="goal" rows={2} {...regCreate('goal')} placeholder="Describe el objetivo de este sprint..." className="bg-[hsl(var(--surface-panel)/0.4)] border-[hsl(var(--border-hover))]" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="startDate">Inicio</Label>
                <Input id="startDate" type="date" {...regCreate('startDate')} className="bg-[hsl(var(--surface-panel)/0.4)] border-[hsl(var(--border-hover))]" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="endDate">Fin</Label>
                <Input id="endDate" type="date" {...regCreate('endDate')} className="bg-[hsl(var(--surface-panel)/0.4)] border-[hsl(var(--border-hover))]" />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="planningNotes">Notas de planning</Label>
              <Textarea id="planningNotes" rows={2} {...regCreate('planningNotes')} placeholder="Notas adicionales de la planeación..." className="bg-[hsl(var(--surface-panel)/0.4)] border-[hsl(var(--border-hover))]" />
            </div>
            <DialogFooter className="gap-2 pt-4 border-t border-[hsl(var(--border))]">
              <Button type="button" variant="outline" className="border-[hsl(var(--border-hover))] bg-[hsl(var(--muted)/0.3)] text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--muted)/0.5)]" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button type="submit">Guardar sprint</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Editar Sprint */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-w-2xl text-[hsl(var(--text-primary))] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configurar Sprint — {selected?.name}</DialogTitle>
          </DialogHeader>
          <form className="space-y-4 pt-2" onSubmit={subEdit(handleEditSprint)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-name">Nombre</Label>
                <Input id="edit-name" required {...regEdit('name')} className="bg-[hsl(var(--surface-panel)/0.4)] border-[hsl(var(--border-hover))]" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-goal">Objetivo</Label>
                <Textarea id="edit-goal" rows={2} {...regEdit('goal')} className="bg-[hsl(var(--surface-panel)/0.4)] border-[hsl(var(--border-hover))]" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-startDate">Inicio</Label>
                <Input id="edit-startDate" type="date" {...regEdit('startDate')} className="bg-[hsl(var(--surface-panel)/0.4)] border-[hsl(var(--border-hover))]" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-endDate">Fin</Label>
                <Input id="edit-endDate" type="date" {...regEdit('endDate')} className="bg-[hsl(var(--surface-panel)/0.4)] border-[hsl(var(--border-hover))]" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-planningNotes">Notas de planning</Label>
                <Textarea id="edit-planningNotes" rows={2} {...regEdit('planningNotes')} placeholder="Qué se planificó..." className="bg-[hsl(var(--surface-panel)/0.4)] border-[hsl(var(--border-hover))]" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-dailyImpediments">Impedimentos / Daily impediments</Label>
                <Textarea id="edit-dailyImpediments" rows={2} {...regEdit('dailyImpediments')} placeholder="Bloqueos detectados..." className="bg-[hsl(var(--surface-panel)/0.4)] border-[hsl(var(--border-hover))]" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="edit-reviewNotes">Notas de Review</Label>
                <Textarea id="edit-reviewNotes" rows={2} {...regEdit('reviewNotes')} placeholder="Resultados demostrados..." className="bg-[hsl(var(--surface-panel)/0.4)] border-[hsl(var(--border-hover))]" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-retrospectiveNotes">Notas de Retrospectiva</Label>
                <Textarea id="edit-retrospectiveNotes" rows={2} {...regEdit('retrospectiveNotes')} placeholder="Qué mejorar..." className="bg-[hsl(var(--surface-panel)/0.4)] border-[hsl(var(--border-hover))]" />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="edit-lessonsLearned">Lecciones aprendidas</Label>
                <Textarea id="edit-lessonsLearned" rows={2} {...regEdit('lessonsLearned')} placeholder="Lecciones del sprint..." className="bg-[hsl(var(--surface-panel)/0.4)] border-[hsl(var(--border-hover))]" />
              </div>
            </div>

            <DialogFooter className="gap-2 pt-4 border-t border-[hsl(var(--border))]">
              <Button type="button" variant="outline" className="border-[hsl(var(--border-hover))] bg-[hsl(var(--muted)/0.3)] text-[hsl(var(--text-primary))] hover:bg-[hsl(var(--muted)/0.5)]" onClick={() => setEditOpen(false)}>Cancelar</Button>
              <Button type="submit">Guardar cambios</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Vincular Riesgos al Sprint */}
      <Dialog open={assignOpen} onOpenChange={setAssignOpen}>
        <DialogContent className="max-w-md text-[hsl(var(--text-primary))] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Link2 className="text-[hsl(var(--primary))]" size={18} /> Vincular Riesgos al Sprint
            </DialogTitle>
            <p className="text-xs text-[hsl(var(--text-secondary))] pt-0.5">{selected?.name}</p>
          </DialogHeader>
          
          <div className="space-y-4 pt-2">
            <p className="text-sm text-[hsl(var(--text-secondary))]">
              Vincular o desvincular riesgos del proyecto a este sprint:
            </p>
            
            <div className="space-y-2.5 max-h-[45vh] overflow-y-auto pr-1">
              <div className="space-y-1 bg-[hsl(var(--surface-overlay)/0.3)] p-2 rounded-lg border border-[hsl(var(--border))] mb-3">
                <p className="text-[10px] uppercase font-bold text-[hsl(var(--accent))] tracking-wider">Riesgos ya vinculados a este sprint</p>
                {risks.filter(r => r.sprintId === selected?.id).length === 0 ? (
                  <p className="text-xs text-[hsl(var(--text-secondary))] p-1">Ninguno.</p>
                ) : (
                  risks.filter(r => r.sprintId === selected?.id).map(r => (
                    <div key={r.id} className="flex items-center justify-between p-1.5 text-xs border-b border-[hsl(var(--border))] last:border-b-0">
                      <span className="truncate pr-2"><strong className="font-mono text-[hsl(var(--primary))] mr-1.5">{r.code}</strong> {r.title}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleAssignRisk(r.id, false)}
                        className="text-[10px] h-6 text-[hsl(var(--risk-critical))] hover:text-[hsl(var(--risk-critical))] hover:bg-[hsl(var(--risk-critical)/0.1)] px-2 shrink-0"
                      >
                        Desvincular
                      </Button>
                    </div>
                  ))
                )}
              </div>

              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-[hsl(var(--text-secondary))] tracking-wider mb-1">Riesgos del proyecto disponibles</p>
                {unassignedRisks.length === 0 ? (
                  <p className="text-xs text-[hsl(var(--text-secondary))] p-1 flex items-center gap-1.5">
                    <AlertCircle size={14} className="text-[hsl(var(--text-muted))]" /> Todos los riesgos están vinculados a este u otros sprints.
                  </p>
                ) : (
                  unassignedRisks.map(r => (
                    <div key={r.id} className="flex items-center justify-between p-2 rounded bg-[hsl(var(--surface-overlay)/0.2)] border border-[hsl(var(--border))] text-xs">
                      <div className="min-w-0 pr-2">
                        <span className="block font-mono text-[9px] text-[hsl(var(--text-secondary))]">{r.code} {r.sprintId ? `(Vinculado a ${r.sprintId})` : '(Sin vincular)'}</span>
                        <span className="block font-semibold text-[hsl(var(--text-primary))] truncate">{r.title}</span>
                      </div>
                      <Button 
                        size="sm" 
                        onClick={() => handleAssignRisk(r.id, true)}
                        className="text-[10px] h-6 px-2 shrink-0"
                      >
                        Vincular
                      </Button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
          
          <DialogFooter className="pt-4 border-t border-[hsl(var(--border))]">
            <Button onClick={() => setAssignOpen(false)}>Cerrar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

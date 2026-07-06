import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { RISK_CATEGORIES, RISK_STATUSES, RESPONSE_STRATEGIES, computeRisk } from '../utils/risk.js';
import RiskBadge from './RiskBadge.jsx';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Shield, Brain, Settings, FileText } from 'lucide-react';

export default function RiskForm({ initial, sprints, projects, onSubmit, onCancel }) {
  const defaults = {
    title: initial?.title || '',
    description: initial?.description || '',
    category: initial?.category || 'Técnico',
    cause: initial?.cause || '',
    consequence: initial?.consequence || '',
    probability: initial?.probability ?? 3,
    impact: initial?.impact ?? 3,
    owner: initial?.owner || '',
    projectId: initial?.projectId || projects?.[0]?.id || '',
    sprintId: initial?.sprintId || '',
    status: initial?.status || 'Identificado',
    identifiedAt: initial?.identifiedAt || new Date().toISOString().slice(0, 10),
    alertIndicator: initial?.alertIndicator || '',
    responseStrategy: initial?.responseStrategy || 'Mitigar',
    treatmentAction: initial?.treatmentAction || '',
    reviewDate: initial?.reviewDate || '',
    evidence: initial?.evidence || '',
    expectedResult: initial?.expectedResult || '',
    observations: initial?.observations || '',
  };

  const { register, handleSubmit, watch, reset, formState } = useForm({ defaultValues: defaults });
  const probability = Number(watch('probability'));
  const impact = Number(watch('impact'));
  const { level, classification } = computeRisk(probability, impact);

  useEffect(() => {
    reset(defaults);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initial?.id]);

  function submit(data) {
    onSubmit({ ...data, level, classification });
  }

  const selectClass = "flex h-9 w-full rounded-md border border-white/10 bg-slate-900/60 text-white px-3 py-1.5 text-sm shadow-sm transition-smooth focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 cursor-pointer";

  return (
    <form className="space-y-6 text-white pb-2" onSubmit={handleSubmit(submit)}>
      
      {/* ── SECTION 1: Identificación Básica ── */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 border-b border-white/5 pb-1">
          <FileText size={13} /> 1. Identificación del Riesgo
        </h4>
        <div className="grid md:grid-cols-12 gap-4">
          <div className="md:col-span-6 space-y-1.5">
            <Label htmlFor="title" className="text-xs text-muted-foreground uppercase font-semibold">Nombre del riesgo</Label>
            <Input id="title" required {...register('title', { required: true })} placeholder="Ej. Retraso en integración de API" className="bg-slate-900/40 border-white/10" />
          </div>
          <div className="md:col-span-3 space-y-1.5">
            <Label htmlFor="category" className="text-xs text-muted-foreground uppercase font-semibold">Categoría</Label>
            <select id="category" className={selectClass} {...register('category')}>
              {RISK_CATEGORIES.map((c) => (
                <option key={c} value={c} className="bg-[#0d1127] text-white">{c}</option>
              ))}
            </select>
          </div>
          <div className="md:col-span-3 space-y-1.5">
            <Label htmlFor="projectId" className="text-xs text-muted-foreground uppercase font-semibold">Proyecto</Label>
            <select id="projectId" className={selectClass} {...register('projectId')}>
              {projects?.map((p) => (
                <option key={p.id} value={p.id} className="bg-[#0d1127] text-white">{p.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: Evaluación Cuantitativa (P × I) ── */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 border-b border-white/5 pb-1">
          <Shield size={13} /> 2. Evaluación de Impacto (ISO 31000)
        </h4>
        <div className="grid md:grid-cols-4 gap-4 items-center">
          <div className="space-y-1.5">
            <Label htmlFor="probability" className="text-xs text-muted-foreground uppercase font-semibold">Probabilidad (1-5)</Label>
            <Input id="probability" type="number" min={1} max={5} className="bg-slate-900/40 border-white/10" {...register('probability', { valueAsNumber: true })} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="impact" className="text-xs text-muted-foreground uppercase font-semibold">Impacto (1-5)</Label>
            <Input id="impact" type="number" min={1} max={5} className="bg-slate-900/40 border-white/10" {...register('impact', { valueAsNumber: true })} />
          </div>
          <div className="col-span-2 bg-[#0d1127] border border-white/5 p-3 rounded-lg flex items-center justify-between gap-4 mt-2.5 h-[58px]">
            <div>
              <span className="text-[10px] text-muted-foreground block uppercase tracking-wider">Severidad Calculada</span>
              <span className="text-xl font-black text-white">{level}</span>
            </div>
            <div className="text-right">
              <RiskBadge value={classification} />
              <span className="text-[9px] text-muted-foreground block mt-0.5">Nivel: Probabilidad × Impacto</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 3: Análisis de Causas y Consecuencias ── */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 border-b border-white/5 pb-1">
          <Brain size={13} /> 3. Análisis de Causa Raíz & Efectos
        </h4>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="description" className="text-xs text-muted-foreground uppercase font-semibold">Descripción del Evento</Label>
            <Textarea id="description" rows={2} placeholder="Detalla el evento o condición de incertidumbre..." className="bg-slate-900/40 border-white/10 resize-none" {...register('description')} />
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="cause" className="text-xs text-muted-foreground uppercase font-semibold">Causa principal (¿Por qué ocurriría?)</Label>
              <Textarea id="cause" rows={2} placeholder="Factores que desencadenarían el riesgo..." className="bg-slate-900/40 border-white/10 resize-none" {...register('cause')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="consequence" className="text-xs text-muted-foreground uppercase font-semibold">Consecuencia (¿Qué impacto tendría?)</Label>
              <Textarea id="consequence" rows={2} placeholder="Efecto directo en el proyecto si ocurre..." className="bg-slate-900/40 border-white/10 resize-none" {...register('consequence')} />
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 4: Estrategia de Respuesta ── */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 border-b border-white/5 pb-1">
          <Settings size={13} /> 4. Estrategia & Tratamiento (PMBOK)
        </h4>
        <div className="space-y-3">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="responseStrategy" className="text-xs text-muted-foreground uppercase font-semibold">Estrategia de respuesta</Label>
              <select id="responseStrategy" className={selectClass} {...register('responseStrategy')}>
                {RESPONSE_STRATEGIES.map((s) => (
                  <option key={s} value={s} className="bg-[#0d1127] text-white">{s}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2 space-y-1.5">
              <Label htmlFor="treatmentAction" className="text-xs text-muted-foreground uppercase font-semibold">Acción de tratamiento</Label>
              <Input id="treatmentAction" placeholder="Ej. Realizar pruebas previas de la API..." className="bg-slate-900/40 border-white/10" {...register('treatmentAction')} />
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="evidence" className="text-xs text-muted-foreground uppercase font-semibold">Evidencia de mitigación</Label>
              <Textarea id="evidence" rows={2} placeholder="Soporte o entregable que confirma el tratamiento..." className="bg-slate-900/40 border-white/10 resize-none" {...register('evidence')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="expectedResult" className="text-xs text-muted-foreground uppercase font-semibold">Resultado esperado</Label>
              <Textarea id="expectedResult" rows={2} placeholder="Objetivo de control o mitigación esperado..." className="bg-slate-900/40 border-white/10 resize-none" {...register('expectedResult')} />
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 5: Gestión de Monitoreo & Control ── */}
      <div className="space-y-3">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5 border-b border-white/5 pb-1">
          <Settings size={13} /> 5. Control & Monitoreo (Scrum)
        </h4>
        <div className="space-y-3">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="owner" className="text-xs text-muted-foreground uppercase font-semibold">Responsable</Label>
              <Input id="owner" placeholder="Nombre del analista" className="bg-slate-900/40 border-white/10" {...register('owner')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="sprintId" className="text-xs text-muted-foreground uppercase font-semibold">Sprint asignado</Label>
              <select id="sprintId" className={selectClass} {...register('sprintId')}>
                <option value="" className="bg-[#0d1127] text-white">Sin sprint</option>
                {sprints?.map((s) => (
                  <option key={s.id} value={s.id} className="bg-[#0d1127] text-white">{s.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="status" className="text-xs text-muted-foreground uppercase font-semibold">Estado de control</Label>
              <select id="status" className={selectClass} {...register('status')}>
                {RISK_STATUSES.map((s) => (
                  <option key={s} value={s} className="bg-[#0d1127] text-white">{s}</option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="grid md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="identifiedAt" className="text-xs text-muted-foreground uppercase font-semibold">Fecha de identificación</Label>
              <Input id="identifiedAt" type="date" className="bg-slate-900/40 border-white/10" {...register('identifiedAt')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="alertIndicator" className="text-xs text-muted-foreground uppercase font-semibold">Indicador de alerta</Label>
              <Input id="alertIndicator" placeholder="Ej. latencia p95 > 3s" className="bg-slate-900/40 border-white/10" {...register('alertIndicator')} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="reviewDate" className="text-xs text-muted-foreground uppercase font-semibold">Fecha de revisión</Label>
              <Input id="reviewDate" type="date" className="bg-slate-900/40 border-white/10" {...register('reviewDate')} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="observations" className="text-xs text-muted-foreground uppercase font-semibold">Observaciones generales</Label>
            <Textarea id="observations" rows={2} placeholder="Notas adicionales de control..." className="bg-slate-900/40 border-white/10 resize-none" {...register('observations')} />
          </div>
        </div>
      </div>

      {/* Form Buttons */}
      <div className="flex justify-end gap-2 pt-4 border-t border-white/5">
        <Button type="button" variant="outline" onClick={onCancel} className="border-white/10 bg-white/5 text-white hover:bg-white/10">
          Cancelar
        </Button>
        <Button type="submit" disabled={formState.isSubmitting}>
          Guardar riesgo
        </Button>
      </div>
    </form>
  );
}


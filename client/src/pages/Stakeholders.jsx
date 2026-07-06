import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { useAppStore } from '../store/useAppStore.js';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { LayoutGrid, List, Sparkles, User, AlertCircle, ChevronDown, ChevronUp, Radio, HelpCircle } from 'lucide-react';
import FilterBar, { SearchInput, Select } from '../components/FilterBar.jsx';
import EmptyState from '../components/EmptyState.jsx';

const RING_OPTIONS  = ['Anillo 1', 'Anillo 2', 'Anillo 3'];
const TYPE_OPTIONS  = ['Interno', 'Externo'];

const MENDELOW_QUADRANTS = [
  { 
    id: 'Gestionar activamente', 
    title: 'Gestionar Activamente', 
    desc: 'Alto Poder, Alta Influencia (Foco Principal)', 
    color: 'border-red-500/20 bg-red-500/5 text-red-400 header-bg-red',
    badge: 'bg-red-500/10 text-red-400' 
  },
  { 
    id: 'Mantener satisfechos', 
    title: 'Mantener Satisfechos', 
    desc: 'Alto Poder, Baja Influencia', 
    color: 'border-amber-500/20 bg-amber-500/5 text-amber-400 header-bg-amber',
    badge: 'bg-amber-500/10 text-amber-400' 
  },
  { 
    id: 'Mantener informados', 
    title: 'Mantener Informados', 
    desc: 'Bajo Poder, Alta Influencia', 
    color: 'border-blue-500/20 bg-blue-500/5 text-blue-400 header-bg-blue',
    badge: 'bg-blue-500/10 text-blue-400' 
  },
  { 
    id: 'Monitorear', 
    title: 'Monitorear', 
    desc: 'Bajo Poder, Baja Influencia (Esfuerzo Mínimo)', 
    color: 'border-slate-500/20 bg-slate-500/5 text-slate-400 header-bg-slate',
    badge: 'bg-slate-500/10 text-slate-400' 
  }
];

function MendelowBadge({ strategy }) {
  const colors = {
    'Gestionar activamente': 'bg-red-500/15 text-red-300 border-red-500/25',
    'Mantener satisfechos':   'bg-amber-500/15 text-amber-300 border-amber-500/25',
    'Mantener informados':    'bg-blue-500/15 text-blue-300 border-blue-500/25',
    'Monitorear':            'bg-slate-500/15 text-slate-400 border-slate-500/25',
  };
  return (
    <Badge variant="outline" className={`${colors[strategy] || 'bg-slate-500/15 text-slate-400'} text-[10px] py-0.5 px-2`}>
      {strategy}
    </Badge>
  );
}

function PowerGrid({ power, influence }) {
  const color =
    power >= 4 && influence >= 4 ? 'bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.3)]' :
    power >= 4 && influence < 4  ? 'bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.3)]' :
    power < 4  && influence >= 4 ? 'bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]'  : 'bg-slate-600';
  return (
    <div className="flex flex-col items-center gap-1">
      <div className={`w-8 h-8 rounded flex items-center justify-center text-white text-xs font-bold font-mono transition-transform hover:scale-105 ${color}`}>
        {power}x{influence}
      </div>
      <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">
        P×I
      </span>
    </div>
  );
}

function CommitmentBar({ actual, desired }) {
  const hasGap = desired > actual;
  return (
    <div className="flex flex-col gap-1 w-full max-w-[120px]">
      <div className="flex items-center justify-between text-[10px]">
        <span className="text-slate-400">Compromiso:</span>
        <span className={`font-mono font-bold ${hasGap ? 'text-amber-400 animate-pulse' : 'text-cyan-400'}`}>
          {actual} → {desired}
        </span>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => {
          let bgClass = 'bg-slate-800';
          if (n <= actual) {
            bgClass = 'bg-cyan-500';
          } else if (n <= desired) {
            bgClass = 'bg-amber-500/50';
          }
          return (
            <div key={n} className={`h-1.5 flex-1 rounded-sm ${bgClass}`} />
          );
        })}
      </div>
    </div>
  );
}

export default function Stakeholders() {
  const { activeProjectId } = useAppStore();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('matrix'); // 'matrix' | 'table'
  const [expandedId, setExpandedId] = useState(null);
  const [filters, setFilters] = useState({ search: '', ring: '', type: '' });

  const reload = useCallback(async () => {
    if (!activeProjectId) return setItems([]);
    setLoading(true);
    try {
      const data = await api.get(`/stakeholders?projectId=${activeProjectId}`);
      setItems(data);
    } catch { 
      setItems([]); 
    } finally { 
      setLoading(false); 
    }
  }, [activeProjectId]);

  useEffect(() => { 
    if (activeProjectId) reload(); 
  }, [activeProjectId, reload]);

  const filtered = items.filter((s) => {
    if (filters.ring  && s.ring !== filters.ring)  return false;
    if (filters.type  && s.type !== filters.type)  return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      return s.name.toLowerCase().includes(q) || s.code.toLowerCase().includes(q) || (s.action || '').toLowerCase().includes(q);
    }
    return true;
  });

  // Calculate stats
  const gapCount = items.filter(s => s.commitment_desired > s.commitment_actual).length;
  const ring1Count = items.filter(s => s.ring === 'Anillo 1').length;
  const ring2Count = items.filter(s => s.ring === 'Anillo 2').length;
  const ring3Count = items.filter(s => s.ring === 'Anillo 3').length;

  return (
    <div className="space-y-6">
      {/* Header and Statistics Cards */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-[#f7f8f8]">
            Gestión de Stakeholders
          </h1>
          <p className="text-xs text-[#8a8f98]">
            Matriz Mendelow — Poder × Interés. Alineamiento de expectativas por cuadrante.
          </p>
        </div>
        
        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 bg-slate-950/40 p-1 border border-white/5 rounded-lg shrink-0 w-fit">
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 text-xs gap-1 px-2.5 ${viewMode === 'matrix' ? 'bg-primary/20 text-white' : 'text-slate-400'}`}
            onClick={() => setViewMode('matrix')}
          >
            <LayoutGrid size={13} /> Matriz Mendelow
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={`h-8 text-xs gap-1 px-2.5 ${viewMode === 'table' ? 'bg-primary/20 text-white' : 'text-slate-400'}`}
            onClick={() => setViewMode('table')}
          >
            <List size={13} /> Tabla
          </Button>
        </div>
      </div>

      {/* KPI banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="card">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-red-500/10 flex items-center justify-center text-red-400">
                <Radio size={18} className="animate-pulse" />
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Anillo de Foco 1</p>
                <p className="text-lg font-bold font-mono text-white mt-0.5">{ring1Count} <span className="text-[9px] font-normal text-slate-500">interesados</span></p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
              <Radio size={18} />
            </div>
            <div>
              <p className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Anillo de Foco 2</p>
              <p className="text-lg font-bold font-mono text-white mt-0.5">{ring2Count}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="card">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
              <Radio size={18} />
            </div>
            <div>
              <p className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Anillo de Foco 3</p>
              <p className="text-lg font-bold font-mono text-white mt-0.5">{ring3Count}</p>
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-[#090d1a]/40 backdrop-blur-xl hover:border-amber-500/25 transition-all duration-300">
          <CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400">
                <AlertCircle size={18} />
              </div>
              <div>
                <p className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">Brecha de Compromiso</p>
                <p className="text-lg font-bold font-mono text-amber-400 mt-0.5">{gapCount} <span className="text-[9px] font-normal text-slate-500">requieren acción</span></p>
              </div>
            </div>
            {gapCount > 0 && (
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Interactive Filters */}
      <Card className="card">
        <CardContent className="p-4">
          <FilterBar>
            <SearchInput
              placeholder="Buscar por código, nombre o plan de comunicación…"
              value={filters.search}
              onChange={(v) => setFilters((f) => ({ ...f, search: v }))}
            />
            <Select
              value={filters.ring}
              onChange={(v) => setFilters((f) => ({ ...f, ring: v }))}
              options={[{ value: '', label: 'Todos los anillos' }, ...RING_OPTIONS.map((r) => ({ value: r, label: r }))]}
            />
            <Select
              value={filters.type}
              onChange={(v) => setFilters((f) => ({ ...f, type: v }))}
              options={[{ value: '', label: 'Todos los tipos' }, ...TYPE_OPTIONS.map((t) => ({ value: t, label: t }))]}
            />
          </FilterBar>
        </CardContent>
      </Card>

      {/* Main Display Area */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Cargando interesados…</div>
      ) : filtered.length === 0 ? (
        <EmptyState title="Sin stakeholders" description="No se encontraron stakeholders con los filtros activos." />
      ) : viewMode === 'matrix' ? (
        /* Original Mendelow Matrix 2x2 Grid Layout */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {MENDELOW_QUADRANTS.map((quad) => {
            // Filter stakeholders mapped to this strategy
            const stakeholdersInQuad = filtered.filter(s => s.strategy_mendelow === quad.id);
            return (
              <Card key={quad.id} className="card overflow-hidden relative group transition-all duration-200">
                {/* Visual side marker indicating Mendelow category color */}
                <div className={`absolute top-0 left-0 w-1.5 h-full ${
                  quad.id === 'Gestionar activamente' ? 'bg-red-500' :
                  quad.id === 'Mantener satisfechos' ? 'bg-amber-500' :
                  quad.id === 'Mantener informados' ? 'bg-blue-500' : 'bg-slate-500'
                }`} />

                <CardHeader className="pb-3 border-b border-white/5 pl-5">
                  <div className="flex items-center justify-between">
                    <CardTitle className={`text-sm font-bold tracking-wider uppercase ${quad.color}`}>
                      {quad.title}
                    </CardTitle>
                    <Badge variant="outline" className={`font-mono text-xs font-bold border-none ${quad.badge}`}>
                      {stakeholdersInQuad.length}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs text-slate-400 mt-0.5">{quad.desc}</CardDescription>
                </CardHeader>
                <CardContent className="pt-4 flex-1 flex flex-col justify-start space-y-3 pl-5 max-h-[360px] overflow-y-auto pr-2">
                  {stakeholdersInQuad.length === 0 ? (
                    <div className="h-full flex items-center justify-center p-8 text-[11px] text-slate-500 text-center border border-dashed border-white/5 rounded-md my-auto">
                      Ningún stakeholder clasificado en este cuadrante.
                    </div>
                  ) : (
                    stakeholdersInQuad.map((s, idx) => {
                      const isExpanded = expandedId === s.id;
                      const hasGap = s.commitment_desired > s.commitment_actual;
                      return (
                        <div 
                          key={s.id}
                          className={`bg-slate-950/20 border border-white/5 hover:border-white/10 rounded-md p-3 transition-all duration-300 cursor-pointer relative ${
                            isExpanded ? 'border-primary/30 bg-[#0d122b]/30' : ''
                          } animate-fade-in-up`}
                          style={{ animationDelay: `${idx * 60}ms` }}
                          onClick={() => setExpandedId(isExpanded ? null : s.id)}
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="space-y-1">
                              <div className="flex items-center gap-1.5">
                                <span className="font-mono text-[9px] font-bold text-cyan-400">{s.code}</span>
                                <Badge variant="outline" className="text-[8px] py-0 px-1 font-semibold border-none bg-white/5 text-slate-300">
                                  {s.type}
                                </Badge>
                              </div>
                              <h4 className="font-semibold text-white text-xs leading-snug break-words pr-2">{s.name}</h4>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <Badge variant="outline" className="text-[8px] h-4 bg-white/5 text-slate-400 border-white/5 font-mono">
                                {s.ring}
                              </Badge>
                              {hasGap && (
                                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" title="Brecha de compromiso identificada" />
                              )}
                            </div>
                          </div>

                          {/* Collapsible plan detailing */}
                          {isExpanded ? (
                            <div className="mt-3 pt-3 border-t border-white/5 text-[10px] space-y-2.5 text-slate-300">
                              {s.action && (
                                <div>
                                  <strong className="text-[8px] uppercase tracking-wider text-slate-500 block">Plan de Comunicación / Participación:</strong>
                                  <p className="bg-slate-900/60 p-2 rounded border border-white/5 mt-0.5 leading-relaxed">{s.action}</p>
                                </div>
                              )}
                              
                              <div className="flex items-center justify-between gap-4 pt-1.5">
                                <div className="flex-1">
                                  <CommitmentBar actual={s.commitment_actual} desired={s.commitment_desired} />
                                </div>
                                <div className="shrink-0 pr-1">
                                  <PowerGrid power={s.power} influence={s.influence} />
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </div>
                      );
                    })
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        /* Traditional Table List (Enhanced) */
        <Card className="border-white/5 bg-[#090d1a]/40 backdrop-blur-xl shadow-md overflow-hidden">
          <CardContent className="p-0">
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="w-16">Código</TableHead>
                  <TableHead className="w-[300px]">Nombre / Plan de Comunicación</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Anillo</TableHead>
                  <TableHead className="text-center w-24">Poder × Infl.</TableHead>
                  <TableHead>Mendelow</TableHead>
                  <TableHead className="w-[140px]">Compromiso</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => {
                  const hasGap = s.commitment_desired > s.commitment_actual;
                  return (
                    <TableRow key={s.id} className="border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="font-mono text-xs text-cyan-400 font-bold">{s.code}</TableCell>
                      <TableCell className="py-3">
                        <p className="font-semibold text-xs text-white leading-normal">{s.name}</p>
                        {s.action ? (
                          <p className="text-[11px] text-slate-400 mt-1 leading-normal bg-slate-950/20 p-2 rounded border border-white/5">{s.action}</p>
                        ) : null}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={s.type === 'Interno' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-violet-500/10 text-violet-400 border-violet-500/20'}>
                          {s.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className={
                          s.ring === 'Anillo 1' ? 'bg-red-500/10 text-red-400 border-red-500/25' :
                          s.ring === 'Anillo 2' ? 'bg-amber-500/10 text-amber-400 border-amber-500/25' :
                          'bg-slate-500/10 text-slate-400 border-slate-500/25'
                        }>{s.ring}</Badge>
                      </TableCell>
                      <TableCell className="text-center py-2"><PowerGrid power={s.power}   influence={s.influence} /></TableCell>
                      <TableCell className="py-2"><MendelowBadge strategy={s.strategy_mendelow} /></TableCell>
                      <TableCell className="py-2"><CommitmentBar actual={s.commitment_actual} desired={s.commitment_desired} /></TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Global style keyframes */}
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          opacity: 0;
          animation: fade-in-up 0.3s ease-out forwards;
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
      `}</style>
    </div>
  );
}

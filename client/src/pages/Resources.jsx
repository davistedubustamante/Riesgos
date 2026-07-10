import { useCallback, useEffect, useState } from 'react';
import { api } from '../services/api.js';
import { useAppStore } from '../store/useAppStore.js';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import FilterBar, { SearchInput, Select } from '../components/FilterBar.jsx';
import EmptyState from '../components/EmptyState.jsx';

const CATEGORY_OPTIONS = ['RRHH', 'FisicoTecnologico', 'FisicoMaterial', 'Virtual'];
const CATEGORY_LABELS = {
  RRHH:               { label: 'RRHH',         cls: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  FisicoTecnologico:  { label: 'Físico Tec',   cls: 'bg-violet-500/20 text-violet-400 border-violet-500/30' },
  FisicoMaterial:     { label: 'Físico Mat',   cls: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
  Virtual:            { label: 'Virtual',       cls: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' },
};

const CATEGORY_ICONS = {
  RRHH:               '👥',
  FisicoTecnologico:  '🖥️',
  FisicoMaterial:     '📦',
  Virtual:            '☁️',
};

export default function Resources() {
  const { activeProjectId } = useAppStore();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ search: '', category: '' });

  const reload = useCallback(async () => {
    if (!activeProjectId) return setItems([]);
    setLoading(true);
    try {
      const data = await api.get(`/resources?projectId=${activeProjectId}`);
      setItems(data);
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [activeProjectId]);

  useEffect(() => { if (activeProjectId) reload(); }, [activeProjectId, reload]);

  const filtered = items.filter((r) => {
    if (filters.category && r.category !== filters.category) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      return r.name.toLowerCase().includes(q) || r.code.toLowerCase().includes(q) || (r.description || '').toLowerCase().includes(q);
    }
    return true;
  });

  // Stats by category
  const byCategory = CATEGORY_OPTIONS.map((cat) => ({
    cat,
    label: CATEGORY_LABELS[cat].label,
    icon: CATEGORY_ICONS[cat],
    count: items.filter((r) => r.category === cat).length,
  }));

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Recursos</h1>
          <p className="text-muted-foreground text-sm">Catálogo unificado · {items.length} recursos</p>
        </div>
        <div className="flex gap-2">
          {byCategory.map(({ cat, label, icon, count }) => (
            <div key={cat} className="bg-card border border-white/5 rounded-lg px-3 py-2 flex items-center gap-2">
              <span>{icon}</span>
              <div>
                <p className="text-lg font-bold text-primary">{count}</p>
                <p className="text-[10px] text-muted-foreground">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <FilterBar>
        <SearchInput
          placeholder="Buscar por nombre, código o descripción…"
          value={filters.search}
          onChange={(v) => setFilters((f) => ({ ...f, search: v }))}
        />
        <Select
          value={filters.category}
          onChange={(v) => setFilters((f) => ({ ...f, category: v }))}
          options={[
            { value: '', label: 'Todas las categorías' },
            ...CATEGORY_OPTIONS.map((c) => ({ value: c, label: CATEGORY_LABELS[c].label })),
          ]}
        />
      </FilterBar>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Cargando…</div>
      ) : filtered.length === 0 ? (
        <EmptyState title="Sin recursos" description="No hay recursos registrados en este proyecto." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((r) => (
            <Card key={r.id} className="border-white/5 hover:border-white/10 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{CATEGORY_ICONS[r.category]}</span>
                    <div>
                      <p className="font-medium text-sm">{r.name}</p>
                      <p className="font-mono text-xs text-primary">{r.code}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={CATEGORY_LABELS[r.category]?.cls || 'hsl(var(--risk-neutral) / 0.2) hsl(var(--text-secondary))'}>
                    {CATEGORY_LABELS[r.category]?.label || r.category}
                  </Badge>
                </div>
                {r.description && (
                  <p className="text-xs text-muted-foreground mt-1">{r.description}</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

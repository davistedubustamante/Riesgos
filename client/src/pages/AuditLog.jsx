import { useEffect, useState, useCallback } from 'react';
import { History, Search, User, Filter, ArrowLeftRight, Clock, AlertTriangle } from 'lucide-react';
import { api } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({ userId: '', action: '', entityType: '', search: '' });
  const [page, setPage] = useState(1);
  const limit = 20;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const offset = (page - 1) * limit;
      const query = new URLSearchParams({
        limit: String(limit),
        offset: String(offset),
      });
      if (filters.userId) query.append('userId', filters.userId);
      if (filters.action) query.append('action', filters.action);
      if (filters.entityType) query.append('entityType', filters.entityType);

      const data = await api.get(`/audit?${query.toString()}`);
      setLogs(data.logs || []);
      setTotal(data.total || 0);
    } catch (e) {
      console.error('Error fetching audit logs:', e);
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  // Client-side quick text search filter on the loaded logs just for UI convenience
  const filteredLogs = logs.filter(log => {
    if (!filters.search) return true;
    const s = filters.search.toLowerCase();
    return (
      (log.action || '').toLowerCase().includes(s) ||
      (log.entityType || '').toLowerCase().includes(s) ||
      (log.entityId || '').toLowerCase().includes(s) ||
      (log.userName || '').toLowerCase().includes(s) ||
      (log.userEmail || '').toLowerCase().includes(s) ||
      JSON.stringify(log.meta || {}).toLowerCase().includes(s)
    );
  });

  const getActionBadgeColor = (action) => {
    if (action.includes('delete') || action === 'deactivate_user') return 'bg-red-500/20 text-red-400 border-red-500/30';
    if (action.includes('update') || action === 'change_user_role') return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    if (action.includes('create') || action === 'register' || action === 'activate_user') return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (action === 'login') return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30';
    return 'hsl(var(--risk-neutral) / 0.2) hsl(var(--text-primary)) hsl(var(--risk-neutral) / 0.3)';
  };

  const getEntityBadgeColor = (type) => {
    if (type === 'risk') return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    if (type === 'project') return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    if (type === 'sprint') return 'bg-violet-500/10 text-violet-400 border-violet-500/20';
    if (type === 'user') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    return 'hsl(var(--risk-neutral) / 0.1) hsl(var(--text-secondary)) hsl(var(--risk-neutral) / 0.2)';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('es-ES', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <History className="text-cyan-400" size={24} /> Bitácora de Auditoría
          </h1>
          <p className="text-sm text-muted-foreground">Historial inmutable de acciones realizadas en la plataforma de riesgos.</p>
        </div>
        <Button variant="outline" size="sm" className="border-white/10" onClick={fetchLogs} disabled={loading}>
          Actualizar
        </Button>
      </div>

      <Card className="border-white/5 bg-[#090d1a]/60 backdrop-blur-xl">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Filtros de Auditoría</CardTitle>
          <CardDescription>Busca y filtra el historial de auditoría de acuerdo con la norma ISO 31000.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Buscar en la bitácora..."
                className="pl-9 bg-[#080c14]/40 border-white/10 text-white"
                value={filters.search}
                onChange={(e) => setFilters(f => ({ ...f, search: e.target.value }))}
              />
            </div>
            
            <select
              className="flex h-9 w-full rounded-md border border-[#1e293b]/60 bg-[#0d1527] text-white px-3 py-1.5 text-sm shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-cyan-500/30 cursor-pointer hover:border-slate-700/50"
              value={filters.action}
              onChange={(e) => setFilters(f => ({ ...f, action: e.target.value }))}
            >
              <option value="" className="bg-[#0d1127] text-slate-400">Todas las acciones</option>
              <option value="login" className="bg-[#0d1127] text-white">login (Inicio de sesión)</option>
              <option value="logout" className="bg-[#0d1127] text-white">logout (Cierre de sesión)</option>
              <option value="create_risk" className="bg-[#0d1127] text-white">create_risk (Crear riesgo)</option>
              <option value="update_risk" className="bg-[#0d1127] text-white">update_risk (Modificar riesgo)</option>
              <option value="delete_risk" className="bg-[#0d1127] text-white">delete_risk (Eliminar riesgo)</option>
              <option value="create_project" className="bg-[#0d1127] text-white">create_project (Crear proyecto)</option>
              <option value="update_project" className="bg-[#0d1127] text-white">update_project (Modificar proyecto)</option>
              <option value="delete_project" className="bg-[#0d1127] text-white">delete_project (Eliminar proyecto)</option>
              <option value="activate_user" className="bg-[#0d1127] text-white">activate_user (Activar usuario)</option>
              <option value="deactivate_user" className="bg-[#0d1127] text-white">deactivate_user (Desactivar usuario)</option>
              <option value="change_user_role" className="bg-[#0d1127] text-white">change_user_role (Cambiar rol)</option>
            </select>

            <select
              className="flex h-9 w-full rounded-md border border-[#1e293b]/60 bg-[#0d1527] text-white px-3 py-1.5 text-sm shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-cyan-500/30 cursor-pointer hover:border-slate-700/50"
              value={filters.entityType}
              onChange={(e) => setFilters(f => ({ ...f, entityType: e.target.value }))}
            >
              <option value="" className="bg-[#0d1127] text-slate-400">Todas las entidades</option>
              <option value="risk" className="bg-[#0d1127] text-white">risk (Riesgos)</option>
              <option value="project" className="bg-[#0d1127] text-white">project (Proyectos)</option>
              <option value="sprint" className="bg-[#0d1127] text-white">sprint (Sprints)</option>
              <option value="user" className="bg-[#0d1127] text-white">user (Usuarios)</option>
            </select>

            <Button
              variant="outline"
              className="border-white/10 text-xs w-full bg-[#080c14]/20 hover:bg-[#0e1628]/40 hover:text-white transition-colors"
              onClick={() => { setFilters({ userId: '', action: '', entityType: '', search: '' }); setPage(1); }}
            >
              Limpiar filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-white/5 bg-[#090d1a]/40 backdrop-blur-xl shadow-md overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
              <Clock className="animate-spin text-primary" size={24} />
              <span>Cargando bitácora de auditoría...</span>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground flex flex-col items-center justify-center gap-2">
              <AlertTriangle className="text-amber-400" size={24} />
              <span>No se encontraron registros de auditoría que coincidan.</span>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-white/5">
                  <TableRow className="border-white/5 hover:bg-transparent">
                    <TableHead className="py-3 text-xs uppercase tracking-wider font-bold">Fecha / Hora</TableHead>
                    <TableHead className="py-3 text-xs uppercase tracking-wider font-bold">Usuario</TableHead>
                    <TableHead className="py-3 text-xs uppercase tracking-wider font-bold">Acción</TableHead>
                    <TableHead className="py-3 text-xs uppercase tracking-wider font-bold">Entidad</TableHead>
                    <TableHead className="py-3 text-xs uppercase tracking-wider font-bold">ID Entidad</TableHead>
                    <TableHead className="py-3 text-xs uppercase tracking-wider font-bold">IP</TableHead>
                    <TableHead className="py-3 text-xs uppercase tracking-wider font-bold max-w-[250px]">Metadatos / Detalles</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLogs.map((log) => (
                    <TableRow key={log.id} className="border-white/5 hover:bg-white/5 transition-colors">
                      <TableCell className="py-3 text-xs hsl(var(--text-primary)) font-mono">
                        {formatDate(log.createdAt)}
                      </TableCell>
                      <TableCell className="py-3">
                        {log.userName ? (
                          <div>
                            <p className="text-sm font-semibold text-white">{log.userName}</p>
                            <p className="text-[10px] text-muted-foreground font-mono">{log.userEmail}</p>
                          </div>
                        ) : log.userId ? (
                          <span className="text-xs font-mono text-muted-foreground">{log.userId}</span>
                        ) : (
                          <span className="text-xs text-muted-foreground">Sistema / Anónimo</span>
                        )}
                      </TableCell>
                      <TableCell className="py-3">
                        <Badge variant="outline" className={`text-[10px] font-semibold tracking-wide ${getActionBadgeColor(log.action)}`}>
                          {log.action}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-3">
                        {log.entityType ? (
                          <Badge variant="outline" className={`text-[10px] font-normal ${getEntityBadgeColor(log.entityType)}`}>
                            {log.entityType}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="py-3 text-xs font-mono text-muted-foreground">
                        {log.entityId || '—'}
                      </TableCell>
                      <TableCell className="py-3 text-xs font-mono hsl(var(--text-secondary))">
                        {log.ip || '—'}
                      </TableCell>
                      <TableCell className="py-3 text-xs hsl(var(--text-secondary)) font-mono max-w-[250px] truncate" title={JSON.stringify(log.meta)}>
                        {log.meta ? (
                          typeof log.meta === 'string' ? log.meta : JSON.stringify(log.meta)
                        ) : '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination Footer */}
      {total > limit && (
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-muted-foreground">
            Mostrando {filteredLogs.length} registros de un total de {total}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-white/10"
              disabled={page === 1 || loading}
              onClick={() => setPage(p => Math.max(1, p - 1))}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 border-white/10"
              disabled={page * limit >= total || loading}
              onClick={() => setPage(p => p + 1)}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

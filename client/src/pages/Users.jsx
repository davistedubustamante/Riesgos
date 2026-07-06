import { useEffect, useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { Users, UserPlus, Shield, ToggleLeft, ToggleRight, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { api } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import MetricCard from '@/components/MetricCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

const ROLES = [
  { value: 'admin', label: 'Administrador' },
  { value: 'risk_manager', label: 'Gestor de Riesgos' },
  { value: 'auditor', label: 'Auditor' },
  { value: 'viewer', label: 'Visor' },
];

export default function UsersManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [msg, setMsg] = useState(null);
  const { register, handleSubmit, reset } = useForm();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await api.get('/users');
      setUsers(data || []);
    } catch (e) {
      console.error('Error fetching users:', e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  async function toggleStatus(user) {
    try {
      const newStatus = !user.active;
      await api.put(`/users/${user.id}/status`, { active: newStatus });
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, active: newStatus ? 1 : 0 } : u));
    } catch (e) {
      alert(`Error: ${e.message}`);
    }
  }

  async function changeRole(userId, newRole) {
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: newRole } : u));
    } catch (e) {
      alert(`Error: ${e.message}`);
    }
  }

  async function handleRegister(data) {
    setMsg(null);
    try {
      // Registrar al usuario. (Dado que el admin está logueado, auth.register permite que el admin cree usuarios).
      await api.post('/auth/register', data);
      setMsg({ type: 'ok', text: 'Usuario creado exitosamente.' });
      setOpen(false);
      reset();
      fetchUsers();
    } catch (e) {
      setMsg({ type: 'err', text: e.message || 'Error al registrar usuario' });
    }
  }

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'admin':        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'risk_manager': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'auditor':      return 'bg-violet-500/20 text-violet-400 border-violet-500/30';
      case 'viewer':       return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default:             return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  const selectClass = "flex h-9 w-full rounded-md border border-white/10 bg-slate-900/60 text-white px-3 py-1.5 text-sm shadow-sm transition-all focus:outline-none focus:ring-1 focus:ring-cyan-500/50 cursor-pointer";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="text-cyan-400" size={24} /> Gestión de Usuarios y Roles
          </h1>
          <p className="text-sm text-muted-foreground">Administra cuentas del sistema y asigna permisos basados en roles.</p>
        </div>
        <Button onClick={() => { setMsg(null); reset(); setOpen(true); }} className="gap-1.5">
          <UserPlus size={16} /> Registrar usuario
        </Button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Usuarios"
          value={users.length}
          icon={Users}
          color="brand"
        />
        <MetricCard
          label="Administradores"
          value={users.filter(u => u.role === 'admin').length}
          icon={Shield}
          color="red"
        />
        <MetricCard
          label="Gestores de Riesgos"
          value={users.filter(u => u.role === 'risk_manager').length}
          icon={Users}
          color="blue"
        />
        <MetricCard
          label="Lectores"
          value={users.filter(u => u.role === 'viewer').length}
          icon={Users}
          color="violet"
        />
      </div>

      {msg && (
        <div className={`p-4 rounded-md flex items-center gap-3 text-sm ${
          msg.type === 'ok' 
            ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
            : 'bg-destructive/10 text-destructive border border-destructive/20'
        }`}>
          {msg.type === 'ok' ? <CheckCircle2 size={18} className="shrink-0" /> : <AlertCircle size={18} className="shrink-0" />}
          <span>{msg.text}</span>
        </div>
      )}

      <Card className="border-white/5 bg-[#090d1a]/40 backdrop-blur-xl shadow-md overflow-hidden">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground">Cargando usuarios...</div>
          ) : users.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">No hay usuarios registrados.</div>
          ) : (
            <Table>
              <TableHeader className="bg-white/5">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="py-3 text-xs uppercase tracking-wider font-bold">Nombre</TableHead>
                  <TableHead className="py-3 text-xs uppercase tracking-wider font-bold">Correo Electrónico</TableHead>
                  <TableHead className="py-3 text-xs uppercase tracking-wider font-bold">Rol Actual</TableHead>
                  <TableHead className="py-3 text-xs uppercase tracking-wider font-bold">Asignar Rol</TableHead>
                  <TableHead className="py-3 text-xs uppercase tracking-wider font-bold text-center">Estado</TableHead>
                  <TableHead className="py-3 text-xs uppercase tracking-wider font-bold text-right pr-6">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id} className="border-white/5 hover:bg-white/5 transition-colors">
                    <TableCell className="py-4 font-semibold text-white">{u.name}</TableCell>
                    <TableCell className="py-4 font-mono text-xs text-slate-300">{u.email}</TableCell>
                    <TableCell className="py-4">
                      <Badge variant="outline" className={`text-[10px] uppercase font-semibold ${getRoleBadgeColor(u.role)}`}>
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <select
                        className="text-xs border border-white/10 rounded-md px-2 py-1 bg-slate-900/60 text-slate-300 focus:outline-none focus:ring-1 focus:ring-cyan-500/50 cursor-pointer"
                        value={u.role}
                        onChange={(e) => changeRole(u.id, e.target.value)}
                      >
                        {ROLES.map((r) => (
                          <option key={r.value} value={r.value} className="bg-[#0d1127] text-white">
                            {r.label}
                          </option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell className="py-4 text-center">
                      <Badge variant="outline" className={u.active ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-red-500/20 text-red-400 border-red-500/30'}>
                        {u.active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4 text-right pr-6">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleStatus(u)}
                        className={`gap-1.5 h-8 text-xs ${u.active ? 'text-amber-400 hover:text-amber-300 hover:bg-amber-500/10' : 'text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10'}`}
                      >
                        {u.active ? (
                          <>
                            <ToggleLeft size={16} /> Desactivar
                          </>
                        ) : (
                          <>
                            <ToggleRight size={16} /> Activar
                          </>
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus className="text-cyan-400" size={18} /> Registrar Nuevo Usuario
            </DialogTitle>
          </DialogHeader>
          <form className="space-y-4 pt-2" onSubmit={handleSubmit(handleRegister)}>
            <div className="space-y-1.5">
              <Label htmlFor="name">Nombre Completo</Label>
              <Input id="name" required {...register('name')} placeholder="Ej. Ana María Gómez" className="bg-slate-900/40 border-white/10" />
            </div>
            
            <div className="space-y-1.5">
              <Label htmlFor="email">Correo Electrónico</Label>
              <Input id="email" type="email" required {...register('email')} placeholder="correo@empresa.com" className="bg-slate-900/40 border-white/10" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Contraseña (Mín. 8 caracteres)</Label>
              <Input id="password" type="password" required {...register('password')} placeholder="••••••••" className="bg-slate-900/40 border-white/10" />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="role">Rol Inicial</Label>
              <select 
                id="role" 
                className={selectClass}
                {...register('role')}
                defaultValue="viewer"
              >
                {ROLES.map((r) => (
                  <option key={r.value} value={r.value} className="bg-[#0d1127] text-white">
                    {r.label}
                  </option>
                ))}
              </select>
            </div>

            <DialogFooter className="gap-2 pt-4 border-t border-white/5">
              <Button type="button" variant="outline" className="border-white/10 bg-white/5 text-white hover:bg-white/10" onClick={() => setOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Registrar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

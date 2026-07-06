import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FolderKanban, FileText, AlertTriangle, Grid3x3, Flame,
  ListChecks, Repeat2, BookOpen, Users, Activity, Package, LogOut, RefreshCw,
  UserCog, History, Search, Bell, ChevronDown, Hexagon,
} from 'lucide-react';
import { useAppStore } from '@/store/useAppStore';
import { useAuth } from '@/store/AuthContext';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';

const nav = [
  { to: '/',             label: 'Dashboard',          icon: LayoutDashboard, end: true },
  { to: '/projects',     label: 'Proyectos',          icon: FolderKanban },
  { to: '/context',      label: 'Contexto ISO 31000', icon: FileText },
  { to: '/risks',        label: 'Riesgos',            icon: AlertTriangle },
  { to: '/matrix',       label: 'Análisis de Riesgos', icon: Grid3x3 },
  { to: '/heatmap',      label: null,                  icon: Flame },
  { to: '/treatment',    label: 'Tratamiento',          icon: ListChecks },
  { to: '/sprints',      label: 'Scrum / Sprints',    icon: Repeat2 },
  { to: '/stakeholders', label: 'Stakeholders',       icon: Users },
  { to: '/activities',   label: 'Actividades',        icon: Activity },
  { to: '/resources',    label: 'Recursos',           icon: Package },
  { to: '/users',        label: 'Usuarios',           icon: UserCog },
  { to: '/audit',        label: 'Bitácora',           icon: History },
  { to: '/guide',        label: 'Guía metodológica',  icon: BookOpen },
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { projects, activeProjectId, setActiveProject, loadProjects } = useAppStore();
  const { user, logout } = useAuth();
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!projects.length) loadProjects();
  }, [loadProjects, projects.length]);

  const filteredNav = nav.filter((item) => {
    if (item.to === '/users' && user?.role !== 'admin') return false;
    if (item.to === '/audit' && !['admin', 'auditor'].includes(user?.role)) return false;
    if (!item.label) return false;
    return true;
  });

  const activeProject = projects.find((p) => p.id === activeProjectId);

  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  const initials = (user?.name || user?.email || '?').slice(0, 2).toUpperCase();

  return (
    <div className="dark flex h-screen overflow-hidden bg-[#0a0f1c] text-slate-100">
      {/* ── Modular Sidebar ── */}
      <aside className="w-64 shrink-0 sidebar-shell relative z-10 flex flex-col">
        {/* Logo block */}
        <div className="px-5 py-5 border-b border-white/[0.06]">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2.5 group w-full text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
              <Hexagon size={18} className="text-white" />
            </div>
            <div className="min-w-0">
              <p className="text-[15px] font-semibold leading-tight text-slate-50">
                RiskFlow
              </p>
              <p className="text-[10.5px] text-slate-500 font-medium leading-tight uppercase tracking-wider">
                ISO 31000 · PMBOK
              </p>
            </div>
          </button>
        </div>

        {/* Nav items */}
        <ScrollArea className="flex-1 px-3 py-4 h-[calc(100vh-180px)]">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Navegación
          </p>
          <nav className="space-y-1">
            {filteredNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
              >
                <item.icon size={17} className="shrink-0" />
                <span className="truncate">{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </ScrollArea>

        {/* Active project indicator */}
        <div className="px-3 py-3 border-t border-white/[0.06]">
          {activeProject ? (
            <div className="module-card module-card-pad">
              <p className="text-[10px] uppercase text-slate-400 tracking-widest font-semibold">
                Proyecto activo
              </p>
              <p className="text-sm font-medium truncate mt-1 text-slate-100" title={activeProject.name}>
                {activeProject.name}
              </p>
            </div>
          ) : (
            <div className="text-xs text-slate-500 px-3">Sin proyecto activo</div>
          )}
        </div>
      </aside>

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Modular Topbar (search + filters + project + user) */}
        <header className="topbar h-16 flex items-center gap-4 px-6 shrink-0 z-20">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar riesgos, proyectos, stakeholders…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input w-full text-sm"
            />
          </div>

          {/* Filter chips (project selector) */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium hidden lg:inline">Proyecto:</span>
            <div className="relative">
              <select
                className="filter-chip appearance-none pr-7"
                value={activeProjectId || ''}
                onChange={(e) => { setActiveProject(e.target.value); navigate('/'); }}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-[#0f172a] text-slate-100">
                    {p.name}
                  </option>
                ))}
              </select>
              <ChevronDown size={12} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex-1" />

          {/* Right cluster: refresh + bell + user */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => loadProjects()}
              title="Recargar"
              className="h-9 w-9 rounded-lg text-slate-300 hover:bg-white/5"
            >
              <RefreshCw size={15} />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Notificaciones"
              className="h-9 w-9 rounded-lg text-slate-300 hover:bg-white/5 relative"
            >
              <Bell size={15} />
              <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-rose-500" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-9 px-1.5 rounded-lg hover:bg-white/5 flex items-center gap-2">
                  <Avatar className="h-7 w-7">
                    <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-violet-600 text-white text-xs font-semibold">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:block text-left">
                    <p className="text-xs font-semibold text-slate-100 leading-tight">
                      {user?.name || user?.email}
                    </p>
                    <p className="text-[10px] text-slate-500 leading-tight capitalize">
                      {user?.role?.replace('_', ' ')}
                    </p>
                  </div>
                  <ChevronDown size={12} className="text-slate-400 hidden md:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 backdrop-blur-xl bg-[#0f172a]/95 border border-white/10 shadow-xl text-slate-100"
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="text-sm font-medium">{user?.name || user?.email}</div>
                  <div className="text-xs text-slate-500 capitalize">{user?.role?.replace('_', ' ')}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="text-rose-400 focus:text-rose-300 cursor-pointer"
                >
                  <LogOut size={14} className="mr-2" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-6 bg-[#0a0f1c]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

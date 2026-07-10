import React, { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, FolderKanban, FileText, AlertTriangle, Grid3x3, Flame,
  ListChecks, Repeat2, BookOpen, Users, Activity, Package, LogOut, RefreshCw,
  UserCog, History, Search, Bell, ChevronDown, Hexagon, Menu,
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
import MobileNav from '@/components/MobileNav';

const nav = [
  { to: '/dashboard',     label: 'Dashboard',          icon: LayoutDashboard, end: true },
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
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
    <div className="flex h-screen overflow-hidden bg-[#080c14] text-[hsl(214,32%,95%)]">
      {/* ── Desktop Sidebar ── */}
      <aside className="hidden lg:flex w-64 shrink-0 sidebar-shell relative z-10 flex-col">
        {/* Logo */}
        <div className="px-5 py-5 border-b border-[hsl(var(--border))]">
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2.5 group w-full text-left"
          >
            <div
              className="w-9 h-9 flex items-center justify-center shrink-0 bg-[#dcf836] select-none shadow-[0_0_15px_rgba(220,248,54,0.15)] transform rotate-[-4deg] transition-transform duration-300 hover:rotate-0"
              style={{
                borderRadius: '11px 3px 11px 3px',
              }}
            >
              <span className="text-[17px] font-black text-[#0d1527] font-sans">
                R
              </span>
            </div>
            <div className="min-w-0 text-left">
              <h2 className="text-[16px] font-black leading-none text-white uppercase tracking-wider font-sans">
                RISKFLOW
              </h2>
              <p className="text-[8px] text-slate-500 font-extrabold uppercase tracking-[0.18em] leading-none mt-1.5 font-mono">
                RISK INTELLIGENCE
              </p>
            </div>
          </button>
        </div>

        {/* Nav */}
        <ScrollArea className="flex-1 px-3 py-4 h-[calc(100vh-180px)]">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-[hsl(217,13%,40%)]">
            Navegación
          </p>
          <nav className="space-y-0.5">
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

        {/* Active project */}
        <div className="px-3.5 py-4 border-t border-[hsl(var(--border))]">
          {activeProject ? (
            <div className="bg-[#0b1220]/60 border border-[#1e293b]/50 rounded-[12px] p-3.5 shadow-lg relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-[2px] h-full bg-[#dcf836] opacity-60 group-hover:w-[3px] transition-all duration-300" />
              <p className="text-[9px] uppercase text-slate-500 tracking-[0.16em] font-bold font-mono">
                Proyecto activo
              </p>
              <p className="text-[13px] font-semibold truncate mt-1.5 text-white tracking-wide" title={activeProject.name}>
                {activeProject.name}
              </p>
            </div>
          ) : (
            <div className="text-xs text-[hsl(217,13%,40%)] px-3">Sin proyecto activo</div>
          )}
        </div>
      </aside>

      {/* ── Mobile Drawer Nav ── */}
      {mobileNavOpen && (
        <MobileNav
          nav={filteredNav}
          user={user}
          activeProject={activeProject}
          onClose={() => setMobileNavOpen(false)}
        />
      )}

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Topbar */}
        <header
          className="topbar h-14 sm:h-15 flex items-center gap-3 px-4 sm:px-6 shrink-0 z-20"
          style={{ height: '3.75rem' }}
        >
          {/* Hamburger */}
          <button
            onClick={() => setMobileNavOpen(true)}
            className="lg:hidden p-1.5 rounded-lg hover:bg-[var(--surface-panel)] text-[hsl(215,19%,60%)] hover:text-[hsl(214,32%,95%)] transition-colors"
            aria-label="Abrir menú"
          >
            <Menu size={20} />
          </button>

          {/* Search */}
          <div className="relative flex-1 max-w-xs sm:max-w-md">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(217,13%,40%)] hidden sm:block"
            />
            <Search
              size={13}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[hsl(217,13%,40%)] sm:hidden"
            />
            <input
              type="text"
              placeholder="Buscar riesgos, proyectos…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="search-input w-full text-xs sm:text-sm pl-8 sm:pl-9"
            />
          </div>

          {/* Project selector */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-[hsl(215,19%,60%)] font-medium hidden lg:inline">Proyecto:</span>
            <div className="relative">
              <select
                className="chip appearance-none pr-7"
                value={activeProjectId || ''}
                onChange={(e) => { setActiveProject(e.target.value); navigate('/dashboard'); }}
              >
                {projects.map((p) => (
                  <option key={p.id} value={p.id} style={{ background: '#131c35', color: '#f1f5f9' }}>
                    {p.name}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={12}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-[hsl(215,19%,60%)] pointer-events-none"
              />
            </div>
          </div>

          <div className="flex-1" />

          {/* Right cluster */}
          <div className="flex items-center gap-1 sm:gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => loadProjects()}
              title="Recargar"
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-[var(--radius)] text-[hsl(215,19%,60%)] hover:bg-[var(--surface-panel)] hover:text-[hsl(214,32%,95%)]"
            >
              <RefreshCw size={14} className="sm:size-[15px]" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              title="Notificaciones"
              className="h-8 w-8 sm:h-9 sm:w-9 rounded-[var(--radius)] text-[hsl(215,19%,60%)] hover:bg-[var(--surface-panel)] relative hidden sm:flex"
            >
              <Bell size={14} className="sm:size-[15px]" />
              <span
                className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-1.5 h-1.5 rounded-full"
                style={{ background: 'hsl(var(--risk-critical))' }}
              />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="h-8 px-1.5 sm:h-9 sm:px-1.5 rounded-[var(--radius)] hover:bg-[var(--surface-panel)] flex items-center gap-2"
                >
                  <Avatar className="h-6 w-6 sm:h-7 sm:w-7">
                    <AvatarFallback
                      className="text-[10px] sm:text-xs font-semibold"
                      style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)', color: 'white' }}
                    >
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden md:flex flex-col items-start">
                    <p className="text-xs font-semibold text-[hsl(214,32%,95%)] leading-tight">
                      {user?.name || user?.email}
                    </p>
                    <p className="text-[10px] text-[hsl(217,13%,40%)] leading-tight capitalize">
                      {user?.role?.replace('_', ' ')}
                    </p>
                  </div>
                  <ChevronDown size={12} className="text-[hsl(215,19%,60%)] hidden md:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 backdrop-blur-xl border border-[hsl(var(--border))] shadow-[var(--surface-raised)]"
                style={{ background: 'rgba(16,24,40,0.95)' }}
              >
                <DropdownMenuLabel className="font-normal">
                  <div className="text-sm font-medium text-[hsl(214,32%,95%)]">{user?.name || user?.email}</div>
                  <div className="text-xs text-[hsl(217,13%,40%)] capitalize">{user?.role?.replace('_', ' ')}</div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-[hsl(var(--border))]" />
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer"
                  style={{ color: 'hsl(var(--risk-critical))' }}
                >
                  <LogOut size={14} className="mr-2" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-[#080c14]">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

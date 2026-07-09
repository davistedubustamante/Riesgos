import React from 'react';
import { NavLink } from 'react-router-dom';
import { X } from 'lucide-react';

/**
 * MobileNav — overlay drawer para pantallas < lg (móvil y tablet pequeña).
 * Se abre con onClose (padre controla open/close).
 * El overlay oscuro clickeable cierra el drawer.
 */
export default function MobileNav({ nav, user, activeProject, onClose }) {
  return (
    <>
      {/* Overlay oscuro */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel — entra desde la izquierda */}
      <aside className="fixed inset-y-0 left-0 z-50 w-72 bg-[#0a0f1c] border-r border-white/[0.06] flex flex-col shadow-2xl shadow-black/50 lg:hidden animate-slide-in">
        {/* Header del drawer */}
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/[0.06]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="text-white">
                <path d="M12 2L3 7v10l9 5 9-5V7L12 2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
              </svg>
            </div>
            <span className="text-[15px] font-semibold text-slate-50">RiskFlow</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/5 text-slate-400 hover:text-slate-200 transition-colors"
            aria-label="Cerrar menú"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navegación */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
            Navegación
          </p>
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={onClose}
              className={({ isActive }) =>
                `nav-item ${isActive ? 'nav-item-active' : ''}`
              }
            >
              <item.icon size={17} className="shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Proyecto activo */}
        {activeProject && (
          <div className="px-3 py-3 border-t border-white/[0.06]">
            <div className="module-card module-card-pad">
              <p className="text-[10px] uppercase text-slate-400 tracking-widest font-semibold">
                Proyecto activo
              </p>
              <p className="text-sm font-medium truncate mt-1 text-slate-100">
                {activeProject.name}
              </p>
            </div>
          </div>
        )}

        {/* Usuario */}
        {user && (
          <div className="px-3 py-3 border-t border-white/[0.06]">
            <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl bg-white/[0.03] border border-white/5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
                <span className="text-[10px] font-semibold text-white">
                  {(user?.name || user?.email || '?').slice(0, 2).toUpperCase()}
                </span>
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-100 truncate">
                  {user?.name || user?.email}
                </p>
                <p className="text-[10px] text-slate-500 capitalize">
                  {user?.role?.replace('_', ' ')}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}

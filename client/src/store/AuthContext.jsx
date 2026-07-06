import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { api } from '../services/api.js';

// AuthContext: maneja usuario actual, login, register, logout, refresh().
// Carga inicial: pregunta /api/auth/me (la cookie httpOnly viaja sola).
// Si la sesión expira (401 en cualquier llamada) el cliente api notifica, y
// ProtectedRoute redirige a /login.

const AuthCtx = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);     // {id,email,name,role} | null
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await api.get('/auth/me', { skipAuthRedirect: true });
      setUser(r?.user ?? null);
    } catch (e) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  // Suscribirse a expiración de sesión: el cliente api dispara 'rf:unauthorized'
  // cuando recibe 401 en cualquier llamada (excepto /auth/login).
  useEffect(() => {
    const h = () => setUser(null);
    window.addEventListener('rf:unauthorized', h);
    return () => window.removeEventListener('rf:unauthorized', h);
  }, []);

  async function login(email, password) {
    setError(null);
    try {
      const r = await api.post('/auth/login', { email, password }, { skipAuthRedirect: true });
      setUser(r.user);
      return r.user;
    } catch (e) {
      setError(e.message || 'Credenciales inválidas');
      throw e;
    }
  }

  async function register(payload) {
    setError(null);
    try {
      const r = await api.post('/auth/register', payload, { skipAuthRedirect: true });
      setUser(r.user || null);
      return r;
    } catch (e) {
      setError(e.message || 'No se pudo registrar');
      throw e;
    }
  }

  async function logout() {
    try {
      await api.post('/auth/logout', {}, { skipAuthRedirect: true });
    } catch {}
    setUser(null);
  }

  const value = { user, setUser, loading, error, login, register, logout, refresh, role: user?.role ?? null };
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}

export function useAuth() {
  const v = useContext(AuthCtx);
  if (!v) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return v;
}

// Helper de permisos local (no debe ser la única defensa; el backend valida).
export function can(role, action) {
  const perms = {
    admin: new Set(['*']),
    risk_manager: new Set([
      'projects.read','projects.write','contexts.read','contexts.write',
      'sprints.read','sprints.write','risks.read','risks.write',
      'dashboard.read','heatmap.read','treatment.write','users.create',
    ]),
    auditor: new Set([
      'projects.read','contexts.read','sprints.read','risks.read',
      'dashboard.read','heatmap.read','audit.read',
    ]),
    viewer: new Set([
      'projects.read','contexts.read','sprints.read','risks.read',
      'dashboard.read','heatmap.read',
    ]),
  };
  const s = perms[role];
  if (!s) return false;
  return s.has('*') || s.has(action);
}

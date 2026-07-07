// ProtectedRoute: envuelve rutas que requieren login.
// Si hay loading inicial, muestra splash. Si no hay user, redirige a /login (con state.from).
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/AuthContext.jsx';

export default function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-ink-500 text-sm">
        Cargando sesión…
      </div>
    );
  }
  if (!user) {
    return <Navigate to="/login" replace state={{ from: location.pathname + location.search }} />;
  }
  if (roles && roles.length && !roles.includes(user.role)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="card p-8 max-w-md text-center">
          <h2 className="text-xl font-bold mb-2">Permiso insuficiente</h2>
          <p className="text-sm text-ink-500">Tu rol ({user.role}) no permite acceder a esta página.</p>
          <a href="/dashboard" className="btn-primary mt-4 inline-flex">Volver al dashboard</a>
        </div>
      </div>
    );
  }
  return children;
}

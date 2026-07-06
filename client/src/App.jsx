import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastProvider } from '@/hooks/useToast';
import DashboardLayout from '@/layouts/DashboardLayout';
import Dashboard from '@/pages/Dashboard';
import Projects from '@/pages/Projects';
import Context from '@/pages/Context';
import Risks from '@/pages/Risks';
import Matrix from '@/pages/RiskAnalysis';
import Heatmap from '@/pages/RiskAnalysis';
import Treatment from '@/pages/Treatment';
import Sprints from '@/pages/Sprints';
import Stakeholders from '@/pages/Stakeholders';
import Activities from '@/pages/Activities';
import Resources from '@/pages/Resources';
import Guide from '@/pages/Guide';
import LoginPage from '@/pages/LoginPage';
import RegisterPage from '@/pages/RegisterPage';
import Users from '@/pages/Users';
import AuditLog from '@/pages/AuditLog';
import ProtectedRoute from '@/routes/ProtectedRoute';
import { AuthProvider } from '@/store/AuthContext';

export default function App() {
  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  return (
    <AuthProvider>
      <ToastProvider>
        <Routes>
          <Route path="/login"    element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            element={
              <ProtectedRoute>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="projects"  element={<Projects />} />
            <Route path="context"   element={<Context />} />
            <Route path="risks"     element={<Risks />} />
            <Route path="matrix"    element={<Matrix />} />
            <Route path="heatmap"   element={<Heatmap />} />
            <Route path="treatment" element={<Treatment />} />
            <Route path="sprints"   element={<Sprints />} />
            <Route path="stakeholders" element={<Stakeholders />} />
            <Route path="activities"   element={<Activities />} />
            <Route path="resources"    element={<Resources />} />
            <Route path="users"        element={<Users />} />
            <Route path="audit"        element={<AuditLog />} />
            <Route path="guide"     element={<Guide />} />
            <Route path="*" element={<div className="p-8 text-muted-foreground">Página no encontrada.</div>} />
          </Route>
        </Routes>
      </ToastProvider>
    </AuthProvider>
  );
}

import { useState } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { useAuth } from '@/store/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, UserPlus, Flame, Sparkles, ShieldAlert, Kanban, BookOpen, Fingerprint } from 'lucide-react';

export default function RegisterPage() {
  const { user, register: authRegister, error } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  function up(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await authRegister(form);
      navigate('/dashboard', { replace: true });
    } catch (_err) {} finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="dark min-h-screen grid lg:grid-cols-12 bg-[#08090a] text-white relative overflow-hidden font-sans">

      {/* ── LEFT PANEL: Hero & Methodologies Info ── */}
      <div className="hidden lg:flex lg:col-span-7 flex-col justify-between p-12 relative overflow-hidden border-r border-white/[0.05]">

        {/* Top Header */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 rounded-lg bg-[#191a1b] border border-white/10 flex items-center justify-center">
            <Flame size={20} className="text-[#06b6d4]" />
          </div>
          <div>
            <span className="text-lg font-semibold text-[#f7f8f8]">RiskFlow</span>
            <span className="text-xs block text-[#62666d] tracking-widest uppercase font-medium">Web System</span>
          </div>
        </div>

        {/* Center Contents: Headline and Features */}
        <div className="max-w-xl my-auto relative z-10 space-y-10">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight leading-tight text-[#f7f8f8]">
              Gestión Inteligente de{' '}
              <span className="text-[#06b6d4]">Riesgos y Decisiones</span>
            </h2>
            <p className="text-[#8a8f98] text-sm md:text-base leading-relaxed">
              Plataforma metodológica híbrida diseñada bajo estándares internacionales para identificar, evaluar, mitigar y monitorear riesgos críticos en proyectos tecnológicos de alta complejidad.
            </p>
          </div>

          {/* 2×2 Feature grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="card p-4 hover:border-white/[0.12] transition-colors duration-200">
              <div className="w-8 h-8 rounded-lg bg-[#06b6d4]/10 flex items-center justify-center mb-3">
                <ShieldAlert size={16} className="text-[#06b6d4]" />
              </div>
              <h4 className="font-medium text-sm text-[#f7f8f8]">ISO 31000</h4>
              <p className="text-xs text-[#62666d] mt-1">Análisis de contexto estratégico, apetito y criterios de tolerancia.</p>
            </div>

            <div className="card p-4 hover:border-white/[0.12] transition-colors duration-200">
              <div className="w-8 h-8 rounded-lg bg-[#8b5cf6]/10 flex items-center justify-center mb-3">
                <Kanban size={16} className="text-[#8b5cf6]" />
              </div>
              <h4 className="font-medium text-sm text-[#f7f8f8]">PMBOK & Scrum</h4>
              <p className="text-xs text-[#62666d] mt-1">Tratamiento integrado por Sprints, tableros Kanban y lecciones aprendidas.</p>
            </div>

            <div className="card p-4 hover:border-white/[0.12] transition-colors duration-200">
              <div className="w-8 h-8 rounded-lg bg-[#ec4899]/10 flex items-center justify-center mb-3">
                <Fingerprint size={16} className="text-[#ec4899]" />
              </div>
              <h4 className="font-medium text-sm text-[#f7f8f8]">MAGERIT / NIST</h4>
              <p className="text-xs text-[#62666d] mt-1">Inventario de activos de información y análisis de impacto tecnológico.</p>
            </div>

            <div className="card p-4 hover:border-white/[0.12] transition-colors duration-200">
              <div className="w-8 h-8 rounded-lg bg-[#10b981]/10 flex items-center justify-center mb-3">
                <BookOpen size={16} className="text-[#10b981]" />
              </div>
              <h4 className="font-medium text-sm text-[#f7f8f8]">Guía Metodológica</h4>
              <p className="text-xs text-[#62666d] mt-1">Guías paso a paso para el cumplimiento normativo e institucional.</p>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center gap-6 text-[10px] text-[#62666d] tracking-wider uppercase font-medium">
          <span>Versión 2.0.0</span>
          <span>·</span>
          <span>Híbrido ISO & Ágil</span>
          <span>·</span>
          <span>RiskFlow Premium UI</span>
        </div>
      </div>

      {/* ── RIGHT PANEL: Register Form ── */}
      <div className="col-span-12 lg:col-span-5 flex flex-col justify-center items-center p-8 bg-[#08090a] relative z-10">

        {/* Form container */}
        <div className="w-full max-w-md space-y-8 animate-fade-in-scale">

          {/* Logo visible only on mobile/tablet */}
          <div className="flex lg:hidden items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-[#191a1b] border border-white/10 flex items-center justify-center">
              <Flame size={20} className="text-[#06b6d4]" />
            </div>
            <div>
              <span className="text-lg font-semibold text-[#f7f8f8]">RiskFlow</span>
              <span className="text-xs block text-[#62666d] tracking-widest uppercase font-medium">Web System</span>
            </div>
          </div>

          {/* Form Card */}
          <div className="card p-8 space-y-6">
            <div className="space-y-1.5">
              <h2 className="text-2xl font-semibold tracking-tight text-[#f7f8f8] flex items-center gap-2">
                <UserPlus size={20} className="text-[#8b5cf6]" /> Crear cuenta
              </h2>
              <p className="text-sm text-[#8a8f98]">Registra tu perfil para gestionar los riesgos del proyecto.</p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-xs font-medium text-[#8a8f98] uppercase tracking-wider">
                  Nombre completo
                </Label>
                <Input
                  id="name"
                  required
                  value={form.name}
                  onChange={(e) => up('name', e.target.value)}
                  autoComplete="name"
                  placeholder="Escribe tu nombre"
                  className="h-11 bg-white/[0.03] border border-white/[0.08] text-[#f7f8f8] placeholder:text-[#62666d] focus-visible:ring-2 focus-visible:ring-[#06b6d4]/50 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-xs font-medium text-[#8a8f98] uppercase tracking-wider">
                  Correo electrónico
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => up('email', e.target.value)}
                  autoComplete="email"
                  placeholder="tu@correo.com"
                  className="h-11 bg-white/[0.03] border border-white/[0.08] text-[#f7f8f8] placeholder:text-[#62666d] focus-visible:ring-2 focus-visible:ring-[#06b6d4]/50 transition-colors"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-xs font-medium text-[#8a8f98] uppercase tracking-wider">
                  Contraseña (mín. 8 caracteres)
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  minLength={8}
                  value={form.password}
                  onChange={(e) => up('password', e.target.value)}
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className="h-11 bg-white/[0.03] border border-white/[0.08] text-[#f7f8f8] placeholder:text-[#62666d] focus-visible:ring-2 focus-visible:ring-[#06b6d4]/50 transition-colors"
                />
              </div>

              {error && (
                <div className="flex items-center gap-2.5 text-sm text-[#ef4444] bg-[#ef4444]/10 border border-[#ef4444]/20 p-3 rounded-lg animate-fade-in-up">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button
                type="submit"
                disabled={submitting}
                className="w-full h-11 bg-[#06b6d4] hover:bg-[#0891b2] text-[#08090a] font-medium rounded-lg transition-colors duration-200"
              >
                {submitting ? (
                  <span className="flex items-center gap-2">
                    <Sparkles size={16} className="animate-spin" /> Creando cuenta…
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <UserPlus size={16} /> Registrarse
                  </span>
                )}
              </Button>
            </form>

            <div className="border-t border-white/[0.06] pt-4 text-center">
              <p className="text-xs text-[#62666d]">
                ¿Ya tienes una cuenta?{' '}
                <Link to="/login" className="text-[#06b6d4] hover:underline font-medium transition-all">
                  Iniciar sesión
                </Link>
              </p>
            </div>
          </div>

          <p className="text-center text-[10px] text-[#62666d] tracking-widest uppercase font-medium">
            ISO 31000 · PMBOK · Scrum · MAGERIT · NIST
          </p>
        </div>
      </div>
    </div>
  );
}

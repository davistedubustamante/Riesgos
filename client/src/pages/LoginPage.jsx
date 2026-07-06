import { useState } from 'react';
import { useNavigate, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/store/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, LogIn, Flame, ArrowRight, Shield, Zap, BookOpen, Cpu } from 'lucide-react';

// ─── Methodology Pillars Data ───────────────────────────────
const PILLARS = [
  {
    icon: Shield,
    title: 'ISO 31000',
    desc: 'Análisis de contexto estratégico, apetito de riesgo y criterios de tolerancia.',
    accent: '#06b6d4',
    delay: 0,
  },
  {
    icon: Zap,
    title: 'PMBOK & Scrum',
    desc: 'Tratamiento por sprints, tableros Kanban y lecciones aprendidas.',
    accent: '#a855f7',
    delay: 80,
  },
  {
    icon: Cpu,
    title: 'MAGERIT / NIST',
    desc: 'Inventario de activos de información y análisis de impacto.',
    accent: '#ec4899',
    delay: 160,
  },
  {
    icon: BookOpen,
    title: 'Guía Híbrida',
    desc: 'Fases F0–F7 paso a paso para cumplimiento normativo e institucional.',
    accent: '#10b981',
    delay: 240,
  },
];

export default function LoginPage() {
  const { user, login, error } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('admin@riskflow.local');
  const [password, setPassword] = useState('ChangeMe!2026');
  const [submitting, setSubmitting] = useState(false);

  if (user) {
    return <Navigate to={location.state?.from || '/'} replace />;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(email, password);
      navigate(location.state?.from || '/', { replace: true });
    } catch (_err) {} finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      className="min-h-screen grid"
      style={{
        gridTemplateColumns: '1fr 1fr',
        background: 'hsl(240, 15%, 4%)',
      }}
    >
      {/* ════════════════════════════════════════════════
          LEFT PANEL — Brand & Methodology
      ════════════════════════════════════════════════ */}
      <div
        className="hidden lg:flex flex-col justify-between relative overflow-hidden"
        style={{ padding: '3rem 3.5rem', borderRight: '1px solid rgba(255,255,255,0.05)' }}
      >
        {/* Subtle radial glow top-left */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: '-20%', left: '-20%',
            width: '70%', height: '70%',
            background: 'radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)',
          }}
        />
        {/* Subtle radial glow bottom-right */}
        <div
          className="absolute pointer-events-none"
          style={{
            bottom: '-10%', right: '-10%',
            width: '60%', height: '60%',
            background: 'radial-gradient(circle, rgba(168,85,247,0.07) 0%, transparent 70%)',
          }}
        />

        {/* Top: Logo + Version */}
        <div className="relative z-10 animate-fade-in-up">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, #06b6d4 0%, #a855f7 100%)',
                boxShadow: '0 8px 32px rgba(6,182,212,0.25)',
              }}
            >
              <Flame size={22} className="text-white" />
            </div>
            <div>
              <div
                className="font-black text-2xl tracking-tight"
                style={{
                  background: "linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.75) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                  letterSpacing: '-0.02em',
                }}
              >
                RiskFlow
              </div>
              <div className="text-[10px] tracking-[0.18em] uppercase" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Gestión de Riesgos · v2.0
              </div>
            </div>
          </div>
        </div>

        {/* Center: Headline + Pillars */}
        <div className="relative z-10 space-y-12">
          {/* Big headline */}
          <div className="space-y-5">
            <h2
              className="font-black leading-[1.05] tracking-tight"
              style={{
                fontSize: 'clamp(2.2rem, 4vw, 3.25rem)',
                background: 'linear-gradient(135deg, #ffffff 0%, rgba(255,255,255,0.65) 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.03em',
              }}
            >
              La gestión de riesgos<br />
              que tu proyecto{' '}
              <span
                style={{
                  background: "linear-gradient(135deg, #06b6d4, #a855f7)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                necesita
              </span>
            </h2>
            <p className="text-sm leading-relaxed max-w-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
              Plataforma metodológica híbrida para identificar, evaluar, mitigar y monitorear riesgos en proyectos tecnológicos complejos. Diseñada bajo estándares ISO 31000, PMBOK, Scrum, MAGERIT y NIST.
            </p>
          </div>

          {/* Methodology Pillars */}
          <div className="space-y-3">
            {PILLARS.map(({ icon: Icon, title, desc, accent, delay }) => (
              <div
                key={title}
                className="flex items-start gap-4 p-4 rounded-2xl border transition-all duration-300 group cursor-default"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  borderColor: 'rgba(255,255,255,0.06)',
                  animation: `fadeInUp 0.5s ease-out ${delay}ms both`,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.borderColor = `${accent}40`;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 group-hover:scale-110"
                  style={{
                    background: `${accent}15`,
                    border: `1px solid ${accent}30`,
                  }}
                >
                  <Icon size={18} style={{ color: accent }} />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-sm text-white mb-0.5">{title}</div>
                  <div className="text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>{desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom: Footer line */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.07)' }} />
          <span className="text-[10px] tracking-[0.15em] uppercase" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Híbrido · ISO 31000 · PMBOK · Scrum
          </span>
        </div>
      </div>

      {/* ════════════════════════════════════════════════
          RIGHT PANEL — Login Form
      ════════════════════════════════════════════════ */}
      <div
        className="flex flex-col justify-center items-center relative overflow-hidden"
        style={{ padding: '3rem 2rem' }}
      >
        {/* Glow background center */}
        <div
          className="absolute pointer-events-none"
          style={{
            top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '120%', height: '120%',
            background: 'radial-gradient(ellipse at center, rgba(6,182,212,0.05) 0%, transparent 60%)',
          }}
        />

        {/* Mobile logo */}
        <div className="flex lg:hidden items-center gap-3 mb-8">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: 'linear-gradient(135deg, #06b6d4, #a855f7)',
              boxShadow: '0 8px 24px rgba(6,182,212,0.3)',
            }}
          >
            <Flame size={20} className="text-white" />
          </div>
          <span className="font-black text-xl tracking-tight" style={{ color: 'white' }}>RiskFlow</span>
        </div>

        {/* Form container */}
        <div
          className="w-full relative z-10"
          style={{ maxWidth: 400, animation: 'fadeInScale 0.4s ease-out both' }}
        >
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1.5">
              <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#06b6d4', boxShadow: '0 0 8px #06b6d4' }} />
              <span className="text-[10px] tracking-[0.2em] uppercase font-medium" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Acceso al sistema
              </span>
            </div>
            <h1 className="text-3xl font-bold tracking-tight text-white">Iniciar sesión</h1>
            <p className="text-sm mt-1.5" style={{ color: 'rgba(255,255,255,0.35)' }}>
              Ingresa tus credenciales para continuar.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label
                htmlFor="email"
                className="text-xs font-medium tracking-wide"
                style={{ color: 'rgba(255,255,255,0.45)' }}
              >
                Correo electrónico
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@riskflow.local"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="username"
                className="h-12 text-sm"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  color: 'white',
                  caretColor: '#06b6d4',
                }}
              />
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="password"
                className="text-xs font-medium tracking-wide"
                style={{ color: 'rgba(255,255,255,0.45)' }}
              >
                Contraseña
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                required
                minLength={8}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                className="h-12 text-sm"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  color: 'white',
                  caretColor: '#06b6d4',
                }}
              />
            </div>

            {/* Error */}
            {error && (
              <div
                className="flex items-center gap-2.5 p-3 rounded-xl text-sm"
                style={{
                  background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)',
                  color: '#f87171',
                  animation: 'fadeInUp 0.25s ease-out both',
                }}
              >
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit */}
            <Button
              type="submit"
              disabled={submitting}
              className="w-full h-12 text-sm font-semibold text-white rounded-xl border transition-all duration-200 relative overflow-hidden group"
              style={{
                background: 'rgba(6,182,212,0.1)',
                borderColor: 'rgba(6,182,212,0.25)',
              }}
            >
              {/* Hover fill */}
              <span
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                style={{ background: 'rgba(6,182,212,0.12)' }}
              />
              <span className="relative flex items-center justify-center gap-2.5">
                {submitting ? (
                  <>
                    <div
                      className="w-4 h-4 border-2 rounded-full"
                      style={{ borderColor: 'rgba(255,255,255,0.3)', borderTopColor: 'white', animation: 'spin 0.7s linear infinite' }}
                    />
                    Verificando…
                  </>
                ) : (
                  <>
                    <LogIn size={15} style={{ color: '#06b6d4' }} />
                    Iniciar sesión
                    <ArrowRight size={14} className="opacity-60 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </span>
            </Button>
          </form>

          {/* Help text */}
          <p className="text-center text-xs mt-6" style={{ color: 'rgba(255,255,255,0.2)' }}>
            ¿Sin cuenta? Solicita acceso al administrador de tu organización.
          </p>

          {/* Mobile tech stack */}
          <div className="flex items-center justify-center gap-3 mt-8 lg:hidden">
            {['ISO 31000', 'PMBOK', 'Scrum', 'MAGERIT'].map((t) => (
              <span
                key={t}
                className="text-[9px] tracking-widest uppercase font-medium px-2 py-1 rounded"
                style={{ color: 'rgba(255,255,255,0.25)', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom: version */}
        <div className="absolute bottom-6 text-center">
          <p className="text-[10px] tracking-[0.15em] uppercase" style={{ color: 'rgba(255,255,255,0.15)' }}>
            RiskFlow Web · v2.0.0
          </p>
        </div>
      </div>
    </div>
  );
}

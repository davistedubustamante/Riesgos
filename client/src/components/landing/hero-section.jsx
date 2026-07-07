import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { AnimatedSphere } from './animated-sphere';

const words = ['bajo control', 'gestionado', 'anticipado', 'mitigado'];

export function HeroSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % words.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative min-h-screen flex flex-col justify-center overflow-hidden">
      {/* Animated sphere background */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] lg:w-[800px] lg:h-[800px] opacity-75 pointer-events-none">
        <AnimatedSphere />
      </div>

      {/* Subtle grid lines */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        {[...Array(8)].map((_, i) => (
          <div
            key={`h-${i}`}
            className="absolute h-px bg-white/10"
            style={{ top: `${12.5 * (i + 1)}%`, left: 0, right: 0 }}
          />
        ))}
        {[...Array(12)].map((_, i) => (
          <div
            key={`v-${i}`}
            className="absolute w-px bg-white/10"
            style={{ left: `${8.33 * (i + 1)}%`, top: 0, bottom: 0 }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12 py-32 lg:py-40">
        {/* Eyebrow */}
        <div className={`mb-8 transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
          <span className="inline-flex items-center gap-3 text-sm font-mono" style={{ color: 'rgba(138,143,152,0.8)' }}>
            <span className="w-8 h-px bg-white/30" />
            Gestión de riesgos · ISO 31000 · Metodología ágil
          </span>
        </div>

        {/* Main headline */}
        <div className="mb-12">
          <h1
            className={`text-[clamp(3rem,12vw,10rem)] font-black leading-[0.9] tracking-tight transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
            }`}
            style={{ fontFamily: 'Inter, system-ui, sans-serif', color: 'white' }}
          >
            <span className="block">Cada riesgo</span>
            <span className="block">
              bajo{' '}
              <span className="relative inline-block">
                <span className="inline-flex">
                  {words[wordIndex].split('').map((char, i) => (
                    <span
                      key={`${wordIndex}-${i}`}
                      className="inline-block animate-char-in"
                      style={{ animationDelay: `${i * 50}ms`, color: '#06b6d4' }}
                    >
                      {char === ' ' ? '\u00A0' : char}
                    </span>
                  ))}
                </span>
                <span className="absolute -bottom-2 left-0 right-0 h-3 bg-[#06b6d4]/10" />
              </span>
            </span>
            <span className="block" style={{ color: '#8a8f98' }}>en tu proyecto.</span>
          </h1>
        </div>

        {/* Description */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-24 items-end">
          <p
            className={`text-xl lg:text-2xl leading-relaxed max-w-xl transition-all duration-700 delay-200 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ color: '#8a8f98' }}
          >
            RiskFlow guía tu proyecto por el ciclo ISO 31000 completo —
            desde establecer el contexto hasta monitorear riesgos sprint a sprint.
            Sin hojas de cálculo. Sin sorpresas.
          </p>

          {/* CTAs */}
          <div
            className={`flex flex-col sm:flex-row items-start gap-4 transition-all duration-700 delay-300 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
          >
            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-8 h-14 text-base font-bold text-[#080910] rounded-full bg-[#06b6d4] hover:bg-[#06b6d4]/90 transition-colors group"
            >
              Comenzar gratis
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              to="/guide"
              className="inline-flex items-center gap-2 px-8 h-14 text-base font-bold text-white rounded-full border border-white/20 hover:bg-white/5 transition-colors"
            >
              Ver guía ISO 31000
            </Link>
          </div>
        </div>
      </div>

      {/* Stats marquee */}
      <div
        className={`absolute bottom-24 left-0 right-0 transition-all duration-700 delay-500 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        <div className="flex gap-16 marquee whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="flex gap-16">
              {[
                { value: '18', label: 'stakeholders', company: 'CASO MADAME CRÊPE' },
                { value: '24', label: 'riesgos identificados', company: 'SPRINT 5' },
                { value: '3', label: 'críticos mitigados', company: 'ENTREGA OK' },
                { value: '7', label: 'fases ISO 31000', company: 'MAR 2026' },
              ].map((stat) => (
                <div key={`${stat.company}-${i}`} className="flex items-baseline gap-4">
                  <span className="text-4xl lg:text-5xl font-black" style={{ color: '#06b6d4' }}>{stat.value}</span>
                  <span className="text-sm" style={{ color: '#8a8f98' }}>
                    {stat.label}
                    <span className="block font-mono text-xs mt-1 opacity-60">{stat.company}</span>
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

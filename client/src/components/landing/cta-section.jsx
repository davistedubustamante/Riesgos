import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { AnimatedTetrahedron } from './animated-tetrahedron';

export function CtaSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.2 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  return (
    <section ref={sectionRef} className="relative py-24 lg:py-32 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div
          className={`relative border transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
          onMouseMove={handleMouseMove}
          style={{ borderColor: 'rgba(255,255,255,0.06)' }}
        >
          <div
            className="absolute inset-0 pointer-events-none transition-opacity duration-300"
            style={{
              background: `radial-gradient(600px circle at ${mousePosition.x}% ${mousePosition.y}%, rgba(6,182,212,0.08), transparent 40%)`,
            }}
          />

          <div className="relative z-10 px-8 lg:px-16 py-16 lg:py-24">
            <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
              <div className="flex-1">
                <h2 className="text-4xl lg:text-7xl font-black tracking-tight mb-8 leading-[0.95]" style={{ color: 'white', fontFamily: 'Inter,system-ui,sans-serif' }}>
                  Empieza a gestionar riesgos<br />
                  como un profesional.
                </h2>
                <p className="text-xl mb-12 leading-relaxed max-w-xl" style={{ color: '#8a8f98' }}>
                  Únete a equipos que ya usan RiskFlow para anticipar problemas
                  y entregar proyectos sin sorpresas. Acceso gratuito.
                </p>

                <div className="flex flex-col sm:flex-row items-start gap-4">
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 px-8 h-14 text-base font-bold text-[#080910] rounded-full bg-[#06b6d4] hover:bg-[#06b6d4]/90 transition-colors group"
                  >
                    Empezar gratis
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 px-8 h-14 text-base font-bold text-white rounded-full border transition-colors"
                    style={{ borderColor: 'rgba(255,255,255,0.12)' }}
                  >
                    Hablar con ventas
                  </Link>
                </div>

                <p className="text-sm font-mono mt-8" style={{ color: 'rgba(138,143,152,0.5)' }}>
                  Sin tarjeta de crédito · Datos de ejemplo incluidos
                </p>
              </div>

              <div className="hidden lg:flex items-center justify-center w-[500px] h-[500px] -mr-16">
                <AnimatedTetrahedron />
              </div>
            </div>
          </div>

          <div className="absolute top-0 right-0 w-32 h-32 border-b border-l" style={{ borderColor: 'rgba(255,255,255,0.06)' }} />
          <div className="absolute bottom-0 left-0 w-32 h-32 border-t border-r" style={{ borderColor: 'rgba(255,255,255,0.06)' }} />
        </div>
      </div>
    </section>
  );
}

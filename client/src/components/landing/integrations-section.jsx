import { useEffect, useState, useRef } from 'react';

const standards = [
  { name: 'ISO 31000', category: 'Gestión de riesgos' },
  { name: 'PMBOK', category: 'Gestión de proyectos' },
  { name: 'Scrum', category: 'Metodología ágil' },
  { name: 'MAGERIT', category: 'Análisis de riesgos' },
  { name: 'NIST', category: 'Ciberseguridad' },
  { name: 'GDPR/LOPD', category: 'Protección de datos' },
  { name: 'COSO', category: 'Gobierno corporativo' },
  { name: 'PMI', category: 'Certificación profesional' },
  { name: 'OCTAVE', category: 'Evaluación de amenazas' },
  { name: 'MEHARI', category: 'Análisis de riesgos' },
];

export function IntegrationsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section id="integrations" ref={sectionRef} className="relative py-24 lg:py-32 overflow-hidden">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div
          className={`text-center max-w-3xl mx-auto mb-16 lg:mb-24 transition-all duration-700 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}
        >
          <span className="inline-flex items-center gap-3 text-sm font-mono mb-6" style={{ color: 'rgba(138,143,152,0.7)' }}>
            <span className="w-8 h-px bg-white/30" />
            Estándares
            <span className="w-8 h-px bg-white/30" />
          </span>
          <h2 className="text-4xl lg:text-6xl font-black tracking-tight mb-6" style={{ color: 'white', fontFamily: 'Inter,system-ui,sans-serif' }}>
            Compatible con los estándares<br />que ya conoces.
          </h2>
          <p className="text-xl" style={{ color: '#8a8f98' }}>
            RiskFlow integra las metodologías más utilizadas en gestión de riesgos y proyectos.
          </p>
        </div>
      </div>

      {/* Full-width marquees */}
      <div className="w-full mb-6">
        <div className="flex gap-6 marquee">
          {[...Array(2)].map((_, setIndex) => (
            <div key={setIndex} className="flex gap-6 shrink-0">
              {standards.map((s) => (
                <div
                  key={`${s.name}-${setIndex}`}
                  className="shrink-0 px-8 py-6 border border-white/[0.06] hover:border-[#06b6d4]/30 hover:bg-[#06b6d4]/[0.02] transition-all duration-300 group"
                >
                  <div className="text-lg font-bold group-hover:translate-x-1 transition-transform" style={{ color: 'white' }}>
                    {s.name}
                  </div>
                  <div className="text-sm" style={{ color: '#8a8f98' }}>{s.category}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="w-full">
        <div className="flex gap-6 marquee-reverse">
          {[...Array(2)].map((_, setIndex) => (
            <div key={setIndex} className="flex gap-6 shrink-0">
              {[...standards].reverse().map((s) => (
                <div
                  key={`${s.name}-rev-${setIndex}`}
                  className="shrink-0 px-8 py-6 border border-white/[0.06] hover:border-[#06b6d4]/30 hover:bg-[#06b6d4]/[0.02] transition-all duration-300 group"
                >
                  <div className="text-lg font-bold group-hover:translate-x-1 transition-transform" style={{ color: 'white' }}>
                    {s.name}
                  </div>
                  <div className="text-sm" style={{ color: '#8a8f98' }}>{s.category}</div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

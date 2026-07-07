import { useEffect, useState, useRef } from 'react';

const steps = [
  {
    number: 'I',
    title: 'Establece el contexto',
    description: 'Define el alcance del proyecto, los activos críticos y los stakeholders. RiskFlow te guía con plantillas basadas en ISO 31000.',
    code: `// 1. Define el contexto del proyecto
const contexto = riskflow.contexto({
  alcance: 'sistema de preselección IA',
  metodologia: 'ISO 31000 + Scrum',
  activos: ['datos candidatos', 'modelo ML'],
  stakeholders: 18,
  // RiskFlow valida automáticamente
})`,
  },
  {
    number: 'II',
    title: 'Identifica y analiza',
    description: 'Registra cada riesgo con código único, causa, probabilidad e impacto. La matriz P×I se calcula automáticamente.',
    code: `// 2. Registra un riesgo
const riesgo = riskflow.registrar({
  codigo: 'R-001',
  causa: 'API de LLM no disponible',
  probabilidad: 3,
  impacto: 4,
  categoria: 'tecnologico',
  // Matriz P×I: 3×4 = ALTO
})`,
  },
  {
    number: 'III',
    title: 'Trata y monitorea',
    description: 'Asigna estrategias de tratamiento, responsables y fechas. El heatmap se actualiza en tiempo real sprint a sprint.',
    code: `// 3. Plan de tratamiento
riesgo.tratar({
  estrategia: 'mitigar',
  responsable: 'dev-team',
  accion: 'fallback a API secundaria',
  fecha: '2026-04-15',
  evidencia: 'test de integración',
})
// ✅ Actualiza heatmap automáticamente`,
  },
];

export function HowItWorksSection() {
  const [activeStep, setActiveStep] = useState(0);
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

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="metodologia" ref={sectionRef} className="relative py-24 lg:py-32 overflow-hidden" style={{ background: '#090b14' }}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="mb-16 lg:mb-24">
          <span className="inline-flex items-center gap-3 text-sm font-mono mb-6" style={{ color: 'rgba(6,182,212,0.8)' }}>
            <span className="w-8 h-px bg-[#06b6d4]/40" />
            Proceso
          </span>
          <h2
            className={`text-4xl lg:text-6xl font-black tracking-tight transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ color: 'white', fontFamily: 'Inter,system-ui,sans-serif' }}
          >
            Tres pasos.
            <br />
            <span style={{ color: '#8a8f98' }}>Riesgos bajo control.</span>
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          <div className="space-y-0">
            {steps.map((step, index) => (
              <button
                key={step.number}
                type="button"
                onClick={() => setActiveStep(index)}
                className={`w-full text-left py-8 border-b transition-all duration-500 group ${
                  activeStep === index ? 'opacity-100' : 'opacity-40 hover:opacity-70'
                }`}
                style={{ borderColor: 'rgba(255,255,255,0.06)' }}
              >
                <div className="flex items-start gap-6">
                  <span className="text-3xl font-black" style={{ color: 'rgba(255,255,255,0.2)' }}>{step.number}</span>
                  <div className="flex-1">
                    <h3 className="text-2xl lg:text-3xl font-black mb-3 group-hover:translate-x-2 transition-transform duration-300" style={{ color: 'white', fontFamily: 'Inter,system-ui,sans-serif' }}>
                      {step.title}
                    </h3>
                    <p className="leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      {step.description}
                    </p>
                    {activeStep === index && (
                      <div className="mt-4 h-px overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
                        <div
                          className="h-full"
                          style={{
                            background: '#06b6d4',
                            animation: 'progress 5s linear forwards',
                            width: '0%',
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>

          <div className="lg:sticky lg:top-32 self-start">
            <div className="border overflow-hidden" style={{ borderColor: 'rgba(255,255,255,0.06)', background: 'rgba(255,255,255,0.01)' }}>
              <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                  <div className="w-3 h-3 rounded-full bg-white/10" />
                </div>
                <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>riskflow.js</span>
              </div>

              <div className="p-8 font-mono text-sm min-h-[280px]">
                <pre className="leading-loose" style={{ color: 'rgba(255,255,255,0.7)' }}>
                  {steps[activeStep].code.split('\n').map((line, lineIndex) => (
                    <div key={`${activeStep}-${lineIndex}`} className="code-line-reveal" style={{ animationDelay: `${lineIndex * 80}ms` }}>
                      <span className="inline-block w-8 text-left" style={{ color: 'rgba(255,255,255,0.15)' }}>{lineIndex + 1}</span>
                      <span className="inline-flex">
                        {line.split('').map((char, charIndex) => (
                          <span
                            key={`${activeStep}-${lineIndex}-${charIndex}`}
                            className="code-char-reveal"
                            style={{ animationDelay: `${lineIndex * 80 + charIndex * 15}ms` }}
                          >
                            {char === ' ' ? '\u00A0' : char}
                          </span>
                        ))}
                      </span>
                    </div>
                  ))}
                </pre>
              </div>

              <div className="px-6 py-4 border-t flex items-center gap-3" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
                <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                <span className="text-xs font-mono" style={{ color: 'rgba(255,255,255,0.3)' }}>Ready</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes progress {
          from { width: 0%; }
          to { width: 100%; }
        }
        .code-line-reveal {
          opacity: 0;
          transform: translateX(-8px);
          animation: lineReveal 0.4s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @keyframes lineReveal {
          to { opacity: 1; transform: translateX(0); }
        }
        .code-char-reveal {
          opacity: 0;
          filter: blur(8px);
          animation: charReveal 0.3s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        @keyframes charReveal {
          to { opacity: 1; filter: blur(0); }
        }
      `}</style>
    </section>
  );
}

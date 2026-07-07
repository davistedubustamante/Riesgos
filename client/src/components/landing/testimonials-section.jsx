import { useEffect, useState } from 'react';

const testimonials = [
  {
    quote: 'Antes teníamos los riesgos en una hoja Excel que nadie consultaba. Ahora el equipo ve la matriz en cada planning y realmente toma decisiones basadas en ella.',
    author: 'María José Torres',
    role: 'PMO Lead',
    company: 'TechCorp Colombia',
    metric: '100% adopción en el equipo',
    color: '#06b6d4',
  },
  {
    quote: 'Pudimos identificar que la API de OpenAI era nuestro mayor riesgo antes de empezar a desarrollar. Eso solo fue posible con el checklist de contexto de RiskFlow.',
    author: 'Andrés Villamizar',
    role: 'CTO',
    company: 'DataInsight SAS',
    metric: '3 riesgos críticos anticipados',
    color: '#8b5cf6',
  },
  {
    quote: 'El heatmap en tiempo real nos salvó dos veces. Vimos un riesgo crítico aparecer en el sprint 5 y lo mitigamos antes de que afectara la entrega.',
    author: 'Carolina Méndez',
    role: 'Scrum Master',
    company: 'FintechGo',
    metric: '0 incidentes en producción',
    color: '#10b981',
  },
  {
    quote: 'El registro de stakeholders de RiskFlow nos ayudó a gestionar la resistencia al cambio. Identificamos 4 personas clave y diseñamos su plan de adopción por separado.',
    author: 'Felipe Ruiz',
    role: 'Risk Manager',
    company: 'SecureNet',
    metric: '18 stakeholders gestionados',
    color: '#f97316',
  },
];

export function TestimonialsSection() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setTimeout(() => {
        setActiveIndex((prev) => (prev + 1) % testimonials.length);
        setIsAnimating(false);
      }, 300);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const activeTestimonial = testimonials[activeIndex];

  return (
    <section className="relative py-32 lg:py-40 border-t border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex items-center gap-4 mb-16">
          <span className="font-mono text-xs tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.25)' }}>
            Qué dicen
          </span>
          <div className="flex-1 h-px bg-white/10" />
          <span className="font-mono text-xs" style={{ color: 'rgba(255,255,255,0.2)' }}>
            {String(activeIndex + 1).padStart(2, '0')} / {String(testimonials.length).padStart(2, '0')}
          </span>
        </div>

        <div className="grid lg:grid-cols-12 gap-12 lg:gap-20">
          <div className="lg:col-span-8">
            <blockquote
              className={`transition-all duration-300 ${isAnimating ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}
            >
              <p className="text-4xl md:text-5xl lg:text-6xl leading-[1.1] font-black tracking-tight" style={{ color: 'white', fontFamily: 'Inter,system-ui,sans-serif' }}>
                &ldquo;{activeTestimonial.quote}&rdquo;
              </p>
            </blockquote>

            <div className={`mt-12 flex items-center gap-6 transition-all duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
              <div className="w-16 h-16 rounded-full flex items-center justify-center font-black text-xl"
                style={{ background: `${activeTestimonial.color}18`, color: activeTestimonial.color, border: `1px solid ${activeTestimonial.color}28` }}>
                {activeTestimonial.author.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <p className="text-lg font-bold" style={{ color: 'white' }}>{activeTestimonial.author}</p>
                <p className="text-sm" style={{ color: '#8a8f98' }}>
                  {activeTestimonial.role}, {activeTestimonial.company}
                </p>
              </div>
            </div>
          </div>

          <div className="lg:col-span-4 flex flex-col justify-center">
            <div
              className={`p-8 border transition-all duration-300 ${isAnimating ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
              style={{ borderColor: `${activeTestimonial.color}22`, background: `${activeTestimonial.color}08` }}
            >
              <span className="font-mono text-xs tracking-widest uppercase block mb-4" style={{ color: 'rgba(255,255,255,0.3)' }}>
                Resultado clave
              </span>
              <p className="text-3xl md:text-4xl font-black" style={{ color: activeTestimonial.color }}>
                {activeTestimonial.metric}
              </p>
            </div>

            <div className="flex gap-2 mt-8">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setIsAnimating(true);
                    setTimeout(() => { setActiveIndex(idx); setIsAnimating(false); }, 300);
                  }}
                  className={`h-2 transition-all duration-300 ${
                    idx === activeIndex ? 'w-8' : 'w-2'
                  }`}
                  style={{
                    borderRadius: '2px',
                    background: idx === activeIndex ? 'white' : 'rgba(255,255,255,0.15)',
                  }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Company logos marquee */}
        <div className="mt-24 pt-12 border-t border-white/[0.06]">
          <p className="font-mono text-xs tracking-widest text-center mb-8" style={{ color: 'rgba(255,255,255,0.2)' }}>
            Empresas que gestionan riesgos con RiskFlow
          </p>
          <div className="flex gap-16 items-center marquee whitespace-nowrap overflow-hidden">
            {[...Array(2)].map((_, si) => (
              <div key={si} className="flex gap-16 items-center shrink-0">
                {['TechCorp', 'DataInsight', 'FintechGo', 'SecureNet', 'CloudOps', 'AIVenture', 'NovaTech', 'AtlasDigital'].map((company) => (
                  <span
                    key={`${company}-${si}`}
                    className="text-xl md:text-2xl font-black whitespace-nowrap"
                    style={{ color: 'rgba(255,255,255,0.18)', fontFamily: 'Inter,system-ui,sans-serif' }}
                  >
                    {company}
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

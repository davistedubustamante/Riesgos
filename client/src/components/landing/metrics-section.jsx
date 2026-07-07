import { useEffect, useState, useRef } from 'react';

function AnimatedCounter({ end, suffix = '', prefix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = 2000;
          const startTime = performance.now();
          const raf = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(raf);
          };
          requestAnimationFrame(raf);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end, hasAnimated]);

  return (
    <div ref={ref} className="text-6xl lg:text-8xl font-black tracking-tight" style={{ color: '#f0f4f8' }}>
      {prefix}{count.toLocaleString()}{suffix}
    </div>
  );
}

const metrics = [
  { value: 18, suffix: '', label: 'Stakeholders documentados', color: '#06b6d4' },
  { value: 24, suffix: '', label: 'Riesgos identificados', color: '#3b82f6' },
  { value: 3, suffix: '', label: 'Críticos mitigados a tiempo', color: '#ef4444' },
  { value: 8, suffix: '', label: 'Sprints completados', color: '#10b981' },
];

export function MetricsSection() {
  const [time, setTime] = useState(new Date());
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.1 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="relative py-24 lg:py-32 border-y border-white/[0.06]">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-16 lg:mb-24">
          <div>
            <span className="inline-flex items-center gap-3 text-sm font-mono mb-6" style={{ color: 'rgba(138,143,152,0.7)' }}>
              <span className="w-8 h-px bg-white/30" />
              Live metrics
            </span>
            <h2
              className={`text-4xl lg:text-6xl font-black transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
              }`}
              style={{ color: 'white', fontFamily: 'Inter,system-ui,sans-serif' }}
            >
              Rendimiento que<br />puedes medir.
            </h2>
          </div>
          <div className="flex items-center gap-4 font-mono text-sm" style={{ color: 'rgba(138,143,152,0.7)' }}>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
              Live
            </span>
            <span className="opacity-30">|</span>
            <span>{time.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px" style={{ background: 'rgba(255,255,255,0.06)' }}>
          {metrics.map((metric, index) => (
            <div
              key={metric.label}
              className={`p-8 lg:p-12 transition-all duration-700 ${
                isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
              }`}
              style={{ background: '#070910', transitionDelay: `${index * 100}ms` }}
            >
              <div style={{ color: metric.color, textShadow: `0 0 40px ${metric.color}30` }}>
                <AnimatedCounter end={metric.value} suffix={metric.suffix} prefix={metric.prefix} />
              </div>
              <div className="mt-4 text-lg" style={{ color: '#8a8f98' }}>{metric.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

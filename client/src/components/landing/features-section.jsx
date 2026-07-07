import { useEffect, useState } from 'react';

const features = [
  {
    number: '01',
    title: 'Contexto del Proyecto',
    description: 'Documenta entorno de negocio, factores organizacionales, activos críticos y partes interesadas siguiendo ISO 31000. Cada campo guía al equipo con ejemplos accionables.',
    visual: 'context',
  },
  {
    number: '02',
    title: 'Identificación Estructurada',
    description: 'Registra riesgos con código único, causa, evento, consecuencia y categoría. Filtros por estado, severidad y clasificación PMBOK.',
    visual: 'identify',
  },
  {
    number: '03',
    title: 'Matriz P×I ISO 31000',
    description: 'Clasificación automática por probabilidad × impacto. Cuadrícula 5×5 con drill-down interactivo y código de colores según nivel de riesgo.',
    visual: 'matrix',
  },
  {
    number: '04',
    title: 'Heatmap en Tiempo Real',
    description: 'Visualiza la distribución de riesgos por frecuencia y severidad. Filtros por categoría. Actualización automática al cambiar un riesgo.',
    visual: 'heatmap',
  },
];

function ContextVisual() {
  return (
    <svg viewBox="0 0 200 160" className="w-full h-full" style={{ color: '#06b6d4' }}>
      <circle cx="100" cy="80" r="14" fill="rgba(6,182,212,0.15)" stroke="currentColor" strokeWidth="2">
        <animate attributeName="r" values="14;16;14" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx="100" cy="80" r="6" fill="#06b6d4" opacity="0.7" />
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * Math.PI * 2;
        const r2 = 55;
        const x = 100 + r2 * Math.cos(a);
        const y = 90 + r2 * Math.sin(a);
        return (
          <g key={i}>
            <line x1="100" y1="80" x2={x} y2={y} stroke="rgba(6,182,212,0.2)" strokeWidth="1" strokeDasharray="3 3">
              <animate attributeName="stroke-dashoffset" values="0;-6" dur="2s" begin={`${i * 0.4}s`} repeatCount="indefinite" />
            </line>
            <circle cx={x} cy={y} r="8" fill="rgba(6,182,212,0.08)" stroke="rgba(6,182,212,0.3)" strokeWidth="1.5" />
          </g>
        );
      })}
      <circle cx="100" cy="80" r="30" fill="none" stroke="rgba(6,182,212,0.1)" strokeWidth="1">
        <animate attributeName="r" values="30;45;30" dur="3s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.5;0;0.5" dur="3s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

function IdentifyVisual() {
  return (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      {[
        ['R-001', 50, 60, '#ef4444'],
        ['R-002', 110, 55, '#f97316'],
        ['R-003', 160, 70, '#eab308'],
        ['R-004', 75, 100, '#10b981'],
        ['R-005', 140, 110, '#3b82f6'],
      ].map(([c, x, y, col]) => (
        <g key={String(c)}>
          <rect x={x - 25} y={y - 10} width="50" height="20" rx="4" fill={`${col}12`} stroke={col} strokeWidth="1.5" opacity="0.8">
            <animate attributeName="opacity" values="0.5;1;0.5" dur="2s" begin={`${(x + y) * 0.003}s`} repeatCount="indefinite" />
          </rect>
          <text x={x} y={y + 4} textAnchor="middle" fontSize="8" fontFamily="monospace" fill={col}>{c}</text>
        </g>
      ))}
      <line x1="50" y1="60" x2="110" y2="55" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="110" y1="55" x2="160" y2="70" stroke="rgba(255,255,255,0.08)" strokeWidth="1" strokeDasharray="3 3" />
    </svg>
  );
}

function MatrixVisual() {
  const cells = [
    ['1', '2', '3', '4', '5'],
    ['2', '', '#10b981', '#eab308', '#eab308', '#f97316'],
    ['3', '', '#eab308', '#f97316', '#f97316', '#ef4444'],
    ['4', '', '#eab308', '#f97316', '#ef4444', '#ef4444'],
    ['5', '', '#f97316', '#ef4444', '#ef4444', '#ef4444'],
  ];
  return (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      {cells.slice(1).map((row, ri) =>
        row.slice(1).map((col, ci) => (
          <g key={`${ri}-${ci}`}>
            <rect x={30 + ci * 30} y={25 + ri * 25} width="26" height="21" rx="3"
              fill={col ? `${col}50` : 'rgba(255,255,255,0.03)'}
              stroke="rgba(255,255,255,0.08)" strokeWidth="1">
              {col && <animate attributeName="opacity" values="0.4;0.8;0.4" dur="2s" begin={`${(ri + ci) * 0.2}s`} repeatCount="indefinite" />}
            </rect>
            <text x={43 + ci * 30} y={41 + ri * 25} textAnchor="middle" fontSize="8" fontFamily="monospace"
              fill={col ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.2)'}>
              {ci + 1}×{ri + 2}
            </text>
          </g>
        ))
      )}
    </svg>
  );
}

function HeatmapVisual() {
  const dots = [];
  for (let i = 0; i < 6; i++) for (let j = 0; j < 6; j++) {
    const r = (Math.sin(i * 1.7 + j * 2.3) * 0.5 + 0.5);
    dots.push({ x: 20 + i * 28, y: 20 + j * 22, op: r, c: i < 2 && j < 2 ? '#ef4444' : i < 4 && j < 4 ? '#f97316' : '#eab308' });
  }
  return (
    <svg viewBox="0 0 200 160" className="w-full h-full">
      {dots.map(({ x, y, op, c }, i) => (
        <circle key={i} cx={x} cy={y} r="10" fill={c} opacity={op * 0.7 + 0.1}>
          <animate attributeName="r" values="10;12;10" dur="1.5s" begin={`${i * 0.15}s`} repeatCount="indefinite" />
          <animate attributeName="opacity" values={`${op * 0.5 + 0.1};${op * 0.9 + 0.1};${op * 0.5 + 0.1}`} dur="1.5s" begin={`${i * 0.15}s`} repeatCount="indefinite" />
        </circle>
      ))}
    </svg>
  );
}

function AnimatedVisual({ type }) {
  switch (type) {
    case 'context': return <ContextVisual />;
    case 'identify': return <IdentifyVisual />;
    case 'matrix': return <MatrixVisual />;
    case 'heatmap': return <HeatmapVisual />;
    default: return <ContextVisual />;
  }
}

function FeatureCard({ feature, index }) {
  const [isVisible, setIsVisible] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setIsVisible(true); },
      { threshold: 0.2 }
    );
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={cardRef}
      className={`group relative transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-12'}`}
      style={{ transitionDelay: `${index * 100}ms` }}
    >
      <div className="flex flex-col lg:flex-row gap-8 lg:gap-16 py-12 lg:py-20 border-b border-white/[0.06]">
        <div className="shrink-0">
          <span className="font-mono text-sm" style={{ color: 'rgba(138,143,152,0.4)' }}>{feature.number}</span>
        </div>
        <div className="flex-1 grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <h3 className="text-3xl lg:text-4xl font-black mb-4 group-hover:translate-x-2 transition-transform duration-500" style={{ color: 'white', fontFamily: 'Inter,system-ui,sans-serif' }}>
              {feature.title}
            </h3>
            <p className="text-lg leading-relaxed" style={{ color: '#8a8f98' }}>
              {feature.description}
            </p>
          </div>
          <div className="flex justify-center lg:justify-end">
            <div className="w-48 h-40">
              <AnimatedVisual type={feature.visual} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useRef } from 'react';

export function FeaturesSection() {
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
    <section id="features" ref={sectionRef} className="relative py-24 lg:py-32">
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="mb-16 lg:mb-24">
          <span className="inline-flex items-center gap-3 text-sm font-mono mb-6" style={{ color: 'rgba(6,182,212,0.8)' }}>
            <span className="w-8 h-px bg-[#06b6d4]/40" />
            Capabilities
          </span>
          <h2
            className={`text-4xl lg:text-6xl font-black tracking-tight transition-all duration-700 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
            }`}
            style={{ color: 'white', fontFamily: 'Inter,system-ui,sans-serif' }}
          >
            Todo lo que necesitas.
            <br />
            <span style={{ color: '#8a8f98' }}>Nada que sobre.</span>
          </h2>
        </div>

        <div>
          {features.map((feature, index) => (
            <FeatureCard key={feature.number} feature={feature} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

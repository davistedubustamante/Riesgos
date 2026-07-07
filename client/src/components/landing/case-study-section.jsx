import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ArrowRight } from 'lucide-react';

const topRisks = [
  { code: 'R-001', title: 'API de OpenAI no disponible', level: 16, levelColor: '#ef4444' },
  { code: 'R-002', title: 'Filtración de datos personales', level: 15, levelColor: '#ef4444' },
  { code: 'R-003', title: 'Incumplimiento normativo GDPR', level: 12, levelColor: '#f97316' },
  { code: 'R-004', title: 'Rechazo del modelo por usuarios', level: 9, levelColor: '#eab308' },
];

function MiniMatrix() {
  const cells = [
    ['', '1', '2', '3', '4', '5'],
    ['1', '#10b981', '#10b981', '#eab308', '#eab308', '#f97316'],
    ['2', '#10b981', '#eab308', '#eab308', '#f97316', '#f97316'],
    ['3', '#eab308', '#eab308', '#f97316', '#f97316', '#ef4444'],
    ['4', '#eab308', '#f97316', '#f97316', '#ef4444', '#ef4444'],
    ['5', '#f97316', '#f97316', '#ef4444', '#ef4444', '#ef4444'],
  ];
  return (
    <div className="border border-white/[0.06] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.04]">
        <span className="text-[9px] font-bold text-white">Matriz P×I</span>
        <span className="text-[8px]" style={{ color: '#8a8f98' }}>ISO 31000</span>
      </div>
      <div className="p-2">
        <div className="grid grid-cols-6 gap-0.5">
          {cells.map((row, ri) =>
            row.map((cell, ci) => (
              <div key={`${ri}-${ci}`} className="aspect-square rounded-sm flex items-center justify-center">
                {ri > 0 && ci > 0 && (
                  <div className="w-full h-full rounded-sm" style={{ background: `${cell}50` }} />
                )}
                {ci === 0 && ri > 0 && <span className="text-[7px] font-bold" style={{ color: '#8a8f98' }}>{cell}</span>}
                {ri === 0 && ci > 0 && <span className="text-[7px] font-bold" style={{ color: '#8a8f98' }}>{cell}</span>}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

function MiniHeatmap() {
  const dots = [];
  for (let i = 0; i < 5; i++) for (let j = 0; j < 5; j++) {
    const r = (Math.sin(i * 1.7 + j * 2.3) * 0.5 + 0.5);
    dots.push({ x: 10 + i * 22, y: 10 + j * 22, op: r, c: i < 1 && j < 1 ? '#ef4444' : i < 3 && j < 3 ? '#f97316' : '#eab308' });
  }
  return (
    <div className="border border-white/[0.06] rounded-lg overflow-hidden">
      <div className="flex items-center justify-between px-3 py-2 border-b border-white/[0.04]">
        <span className="text-[9px] font-bold text-white">Heatmap</span>
        <span className="text-[8px]" style={{ color: '#8a8f98' }}>Tiempo real</span>
      </div>
      <div className="p-3 grid grid-cols-5 gap-1">
        {dots.map(({ x, y, op, c }, i) => (
          <div key={i} className="aspect-square rounded-sm" style={{ background: c, opacity: op * 0.7 + 0.1 }} />
        ))}
      </div>
    </div>
  );
}

export function CaseStudySection() {
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
    <section id="caso" ref={sectionRef} className="relative py-24 lg:py-32" style={{ background: 'linear-gradient(180deg, #070910, rgba(9,11,20,0.9))' }}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center">
          <div
            className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-widest mb-5"
              style={{ background: 'rgba(6,182,212,0.08)', color: '#06b6d4', border: '1px solid rgba(6,182,212,0.22)' }}>
              Caso de estudio · 2025
            </div>
            <h2 className="text-3xl font-black leading-[1.1] mb-3" style={{ color: 'white', fontFamily: 'Inter,system-ui,sans-serif' }}>
              Sistema inteligente de preselección<br />de personal con IA generativa
            </h2>
            <p className="text-[13px] leading-relaxed mb-6" style={{ color: '#8a8f98' }}>
              Madame Crepe SAS · 8 meses · APIs de LLM · Datos sensibles ·
              Equipo multidisciplinario de 18 stakeholders.
            </p>

            <div className="grid grid-cols-3 gap-3 mb-6">
              {[
                { v: '24', l: 'Riesgos', c: '#3b82f6' },
                { v: '3', l: 'Críticos', c: '#ef4444' },
                { v: '8', l: 'Sprints', c: '#10b981' },
              ].map(({ v, l, c }) => (
                <div key={l} className="text-center border border-white/[0.06] rounded-xl p-3" style={{ background: 'rgba(7,9,16,0.6)' }}>
                  <p className="text-2xl font-black font-mono" style={{ color: c }}>{v}</p>
                  <p className="text-[9px] uppercase font-bold tracking-widest" style={{ color: '#8a8f98' }}>{l}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              {[
                'Riesgo de API de LLM identificado antes de empezar',
                'Filtración de datos personales — estrategia documentada',
                'Cumplimiento GDPR/LOPD integrado en el contexto',
                'Resistencia al cambio — plan de adopción con stakeholders',
              ].map((t) => (
                <div key={t} className="flex items-center gap-2">
                  <CheckCircle2 size={13} style={{ color: '#10b981' }} />
                  <span className="text-[11px]" style={{ color: '#8a8f98' }}>{t}</span>
                </div>
              ))}
            </div>

            <Link
              to="/register"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-[11px] font-bold text-[#080910] mt-6 transition-all hover:scale-[1.02]"
              style={{ background: '#06b6d4' }}
            >
              Probar con datos de ejemplo <ArrowRight size={12} />
            </Link>
          </div>

          <div className={`transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}`}>
            <div className="rounded-2xl overflow-hidden border border-white/[0.08]" style={{ background: '#090b14', boxShadow: '0 40px 90px rgba(0,0,0,0.7)' }}>
              <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.06]">
                <div className="flex gap-1.5">
                  {['#ef4444', '#eab308', '#10b981'].map((c) => (
                    <div key={c} className="w-2.5 h-2.5 rounded-full opacity-60" style={{ background: c }} />
                  ))}
                </div>
                <div className="h-2.5 flex-1 rounded bg-white/[0.04] border border-white/[0.06] max-w-[160px]" />
              </div>
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-4 gap-2">
                  {[
                    { l: 'Total', v: '24', c: '#3b82f6' },
                    { l: 'Críticos', v: '3', c: '#ef4444' },
                    { l: 'Mitigados', v: '8', c: '#10b981' },
                    { l: 'Pendientes', v: '13', c: '#eab308' },
                  ].map(({ l, v, c }) => (
                    <div key={l} className="text-center border border-white/[0.05] rounded-lg p-2" style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <p className="text-[12px] font-black font-mono" style={{ color: c }}>{v}</p>
                      <p className="text-[7px] uppercase font-bold text-[#8a8f98] tracking-widest">{l}</p>
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <MiniMatrix />
                  <MiniHeatmap />
                </div>

                <div className="space-y-1.5">
                  {topRisks.map(({ code, title, level, levelColor }) => (
                    <div key={code} className="flex items-center gap-2 border border-white/[0.05] rounded-lg px-3 py-1.5" style={{ background: 'rgba(255,255,255,0.02)' }}>
                      <span className="text-[8px] font-mono font-bold" style={{ color: '#8a8f98' }}>{code}</span>
                      <span className="text-[10px] text-white flex-1 truncate">{title}</span>
                      <div className="h-1.5 w-14 bg-white/[0.06] rounded-full overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${(level / 25) * 100}%`, background: levelColor }} />
                      </div>
                      <span className="text-[9px] font-black font-mono" style={{ color: levelColor }}>{level}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { useEffect, useState, useRef } from 'react';
import { Shield, Lock, Eye, FileCheck } from 'lucide-react';

const securityFeatures = [
  {
    icon: Shield,
    title: 'ISO 31000 Certificado',
    description: 'Metodología alineada con ISO 31000, auditada y verificada por el estándar internacional de gestión de riesgos.',
  },
  {
    icon: Lock,
    title: 'Cifrado de datos',
    description: 'AES-256 para datos en reposo. TLS 1.3 en tránsito. Tu información sensible nunca se expone.',
  },
  {
    icon: Eye,
    title: 'Auditoría completa',
    description: 'Registro de cada acción con marca de tiempo. Trazabilidad total desde el contexto hasta el tratamiento.',
  },
  {
    icon: FileCheck,
    title: 'GDPR & LOPD',
    description: 'Cumplimiento normativo integrado. Gestión de consentimientos y derechos de los interesados.',
  },
];

const certifications = ['ISO 31000', 'PMBOK', 'GDPR', 'LOPD', 'NIST', 'COSO'];

export function SecuritySection() {
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
    <section id="security" ref={sectionRef} className="relative py-24 lg:py-32 overflow-hidden" style={{ background: 'rgba(255,255,255,0.01)' }}>
      <div className="max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-16 lg:gap-24">
          <div
            className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
          >
            <span className="inline-flex items-center gap-3 text-sm font-mono mb-6" style={{ color: 'rgba(138,143,152,0.7)' }}>
              <span className="w-8 h-px bg-white/30" />
              Seguridad
            </span>
            <h2 className="text-4xl lg:text-6xl font-black tracking-tight mb-8" style={{ color: 'white', fontFamily: 'Inter,system-ui,sans-serif' }}>
              La confianza no<br />es negociable.
            </h2>
            <p className="text-xl leading-relaxed mb-12" style={{ color: '#8a8f98' }}>
              Seguridad de nivel empresarial integrada en cada capa de la plataforma,
              desde la infraestructura hasta la aplicación.
            </p>

            <div className="flex flex-wrap gap-3">
              {certifications.map((cert, index) => (
                <span
                  key={cert}
                  className={`px-4 py-2 border text-sm font-mono transition-all duration-500 ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                  }`}
                  style={{
                    borderColor: 'rgba(255,255,255,0.08)',
                    color: '#8a8f98',
                    transitionDelay: `${index * 50 + 200}ms`,
                  }}
                >
                  {cert}
                </span>
              ))}
            </div>
          </div>

          <div className="grid gap-6">
            {securityFeatures.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <div
                  key={feature.title}
                  className={`p-6 border group transition-all duration-500 ${
                    isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'
                  }`}
                  style={{ borderColor: 'rgba(255,255,255,0.06)', transitionDelay: `${index * 100}ms` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 w-10 h-10 flex items-center justify-center border group-hover:bg-[#06b6d4] group-hover:border-[#06b6d4] group-hover:text-[#080910] transition-all duration-300"
                      style={{ borderColor: 'rgba(255,255,255,0.1)', color: '#06b6d4' }}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold mb-1 group-hover:translate-x-1 transition-transform duration-300" style={{ color: 'white' }}>
                        {feature.title}
                      </h3>
                      <p className="text-sm" style={{ color: '#8a8f98' }}>{feature.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

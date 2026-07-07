import { ArrowUpRight } from 'lucide-react';
import { AnimatedWave } from './animated-wave';
import { Link } from 'react-router-dom';

const footerLinks = {
  Producto: [
    { name: 'Características', href: '#features' },
    { name: 'Metodología', href: '#metodologia' },
    { name: 'Caso de estudio', href: '#caso' },
    { name: 'Precios', href: '#pricing' },
  ],
  Desarrolladores: [
    { name: 'Documentación', href: '/guide' },
    { name: 'API Reference', href: '#' },
    { name: 'SDK', href: '#' },
    { name: 'Estado', href: '#' },
  ],
  Empresa: [
    { name: 'Sobre nosotros', href: '#' },
    { name: 'Blog', href: '#' },
    { name: 'Carreras', href: '#' },
    { name: 'Contacto', href: '#' },
  ],
  Legal: [
    { name: 'Privacidad', href: '#' },
    { name: 'Términos', href: '#' },
    { name: 'Seguridad', href: '#security' },
  ],
};

const socialLinks = [
  { name: 'Twitter', href: '#' },
  { name: 'GitHub', href: '#' },
  { name: 'LinkedIn', href: '#' },
];

export function FooterSection() {
  return (
    <footer className="relative border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
      <div className="absolute inset-0 h-64 opacity-20 pointer-events-none overflow-hidden">
        <AnimatedWave />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 lg:px-12">
        <div className="py-16 lg:py-24">
          <div className="grid grid-cols-2 md:grid-cols-6 gap-12 lg:gap-8">
            <div className="col-span-2">
              <Link to="/" className="inline-flex items-center gap-2 mb-6">
                <div className="w-7 h-7 rounded-lg bg-[#06b6d4]/20 border border-[#06b6d4]/30 flex items-center justify-center">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#06b6d4]">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                  </svg>
                </div>
                <span className="text-xl font-black" style={{ color: 'white' }}>RiskFlow</span>
                <span className="text-xs font-mono" style={{ color: 'rgba(138,143,152,0.5)' }}>ISO 31000</span>
              </Link>

              <p className="leading-relaxed mb-8 max-w-xs" style={{ color: '#8a8f98', fontSize: '14px' }}>
                La plataforma de gestión de riesgos para equipos que trabajan con metodologías ágiles.
                ISO 31000 integrado en cada paso.
              </p>

              <div className="flex gap-6">
                {socialLinks.map((link) => (
                  <a
                    key={link.name}
                    href={link.href}
                    className="text-sm flex items-center gap-1 group"
                    style={{ color: '#8a8f98' }}
                  >
                    {link.name}
                    <ArrowUpRight className="w-3 h-3 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
                  </a>
                ))}
              </div>
            </div>

            {Object.entries(footerLinks).map(([title, links]) => (
              <div key={title}>
                <h3 className="text-sm font-bold mb-6" style={{ color: 'white' }}>{title}</h3>
                <ul className="space-y-4">
                  {links.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="text-sm flex items-center gap-2"
                        style={{ color: '#8a8f98' }}
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="py-8 border-t flex flex-col md:flex-row items-center justify-between gap-4" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <p className="text-sm" style={{ color: '#8a8f98' }}>
            2026 RiskFlow. Todos los derechos reservados. — Proyecto académico.
          </p>

          <div className="flex items-center gap-4 text-sm" style={{ color: '#8a8f98' }}>
            <span className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#10b981]" />
              Todos los sistemas operativos
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

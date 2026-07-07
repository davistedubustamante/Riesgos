import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

const navLinks = [
  { name: 'Metodología', href: '#metodologia' },
  { name: 'Características', href: '#features' },
  { name: 'Caso', href: '#caso' },
  { name: 'Guía', href: '/guide' },
];

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed z-50 transition-all duration-500 ${
        isScrolled ? 'top-4 left-4 right-4' : 'top-0 left-0 right-0'
      }`}
    >
      <nav
        className={`mx-auto transition-all duration-500 ${
          isScrolled || isMobileMenuOpen
            ? 'max-w-[1200px] bg-[#070910]/80 backdrop-blur-xl border border-white/[0.08] rounded-2xl shadow-lg'
            : 'max-w-[1400px] bg-transparent'
        }`}
      >
        <div
          className={`flex items-center justify-between transition-all duration-500 px-6 lg:px-8 ${
            isScrolled ? 'h-14' : 'h-20'
          }`}
        >
          {/* Logo */}
          <a href="#" className="flex items-center gap-2 group">
            <div className="w-7 h-7 rounded-lg bg-[#06b6d4]/20 border border-[#06b6d4]/30 flex items-center justify-center">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-[#06b6d4]">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
            <span className={`font-black tracking-tight transition-all duration-500 ${isScrolled ? 'text-lg' : 'text-xl'} text-white`}>
              RiskFlow
            </span>
            <span className={`font-mono transition-all duration-500 ${isScrolled ? 'text-[9px] mt-0.5' : 'text-[10px] mt-1'}`} style={{ color: 'rgba(138,143,152,0.7)' }}>
              ISO 31000
            </span>
          </a>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-10">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm text-white/60 hover:text-white transition-colors duration-300 relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-px bg-[#06b6d4] transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className={`text-white/60 hover:text-white transition-all duration-500 text-sm`}>
              Iniciar sesión
            </Link>
            <Link
              to="/register"
              className={`inline-flex items-center justify-center bg-[#06b6d4] text-[#080910] font-bold rounded-full transition-all duration-500 ${isScrolled ? 'px-4 h-8 text-xs' : 'px-6 h-10 text-sm'}`}
            >
              Comenzar gratis
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-white"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed inset-0 z-40 transition-all duration-500 ${
          isMobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        style={{ background: '#070910', top: 0 }}
      >
        <div className="flex flex-col h-full px-8 pt-28 pb-8">
          <div className="flex-1 flex flex-col justify-center gap-8">
            {navLinks.map((link, i) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-5xl font-black text-white hover:text-[#06b6d4] transition-all duration-500 ${
                  isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
                }`}
                style={{ transitionDelay: isMobileMenuOpen ? `${i * 75}ms` : '0ms' }}
              >
                {link.name}
              </a>
            ))}
          </div>

          <div className={`flex gap-4 pt-8 border-t border-white/10 transition-all duration-500 ${
            isMobileMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}
          style={{ transitionDelay: isMobileMenuOpen ? '300ms' : '0ms' }}
          >
            <Link
              to="/login"
              className="flex-1 border border-white/20 text-white rounded-full h-14 text-base text-center leading-[3.5rem]"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Iniciar sesión
            </Link>
            <Link
              to="/register"
              className="flex-1 bg-[#06b6d4] text-[#080910] rounded-full h-14 text-base font-bold text-center leading-[3.5rem]"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Comenzar gratis
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

/** @type {import('tailwindcss').Config} */
export default {
  darkMode: ['class'],
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: '2rem',
      screens: { '2xl': '1400px' },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        // ── RiskFlow — nueva paleta oscura premium ─────────────────────
        // Base: negro azulado / azul marino profundo
        navy: {
          950: '#05070f',
          900: '#080c14',
          850: '#0b1120',
          800: '#0f1629',
          750: '#131c35',
          700: '#1a2744',
          600: '#1e3359',
          500: '#254170',
        },
        // Primary: violeta eléctrico
        violet: {
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
        },
        // Accent: verde lima
        lime: {
          400: '#a3e635',
          500: '#84cc16',
          600: '#65a30d',
        },
        // Semantic risk (coral/red for critical, orange for high, amber for medium)
        risk: {
          critical: '#f43f5e',  // rojo coral
          high:     '#f97316',  // naranja
          medium:   '#f59e0b',  // ámbar
          low:      '#22c55e',  // verde lima
          neutral:  '#64748b',  // gris slate
        },
        // Neutros fríos
        ink: {
          DEFAULT:  '#f1f5f9',  // blanco frío primary text
          2:        '#94a3b8',  // gris azulado secondary
          3:        '#64748b',  // gris desactivado
          4:        '#334155',  // gris borde
        },
        surface: {
          base:   '#0a0f1e',  // fondo principal
          raised: '#101828',  // elevación 1
          panel:  '#131c35',  // panel / tarjeta
          overlay:'#1a2744',  // overlay / hover
        },
        // Metric / KRI bands
        kri: {
          critical: { DEFAULT: '#f43f5e', soft: 'rgba(244,63,94,0.12)'  },
          high:     { DEFAULT: '#f97316', soft: 'rgba(249,115,22,0.12)' },
          medium:   { DEFAULT: '#f59e0b', soft: 'rgba(245,158,11,0.12)' },
          low:      { DEFAULT: '#22c55e', soft: 'rgba(34,197,94,0.12)'  },
          neutral:  { DEFAULT: '#64748b', soft: 'rgba(100,116,139,0.12)' },
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
        pill: '9999px',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['Geist Mono', 'JetBrains Mono', 'Fira Code', 'monospace'],
      },
      boxShadow: {
        'surface':   '0 1px 0 rgba(255,255,255,0.04) inset, 0 4px 16px -4px rgba(0,0,0,0.5)',
        'panel':     '0 1px 0 rgba(255,255,255,0.05) inset, 0 8px 32px -8px rgba(0,0,0,0.6)',
        'elevated':  '0 2px 0 rgba(255,255,255,0.06) inset, 0 16px 48px -12px rgba(0,0,0,0.7)',
        'glow-sm':   '0 0 0 1px rgba(139,92,246,0.3), 0 4px 12px -2px rgba(139,92,246,0.25)',
        'glow-violet':'0 0 20px rgba(139,92,246,0.35)',
        'glow-lime':  '0 0 20px rgba(132,204,22,0.25)',
        'glow-critical':'0 0 16px rgba(244,63,94,0.35)',
      },
      keyframes: {
        'accordion-down': {
          from: { height: '0' },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: '0' },
        },
        'fade-in-up': {
          from: { opacity: '0', transform: 'translateY(10px)' },
          to:   { opacity: '1', transform: 'translateY(0)'    },
        },
        'slide-in-right': {
          from: { opacity: '0', transform: 'translateX(16px)' },
          to:   { opacity: '1', transform: 'translateX(0)'    },
        },
        'pulse-ring': {
          '0%, 100%': { opacity: '1' },
          '50%':      { opacity: '0.4' },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up':   'accordion-up 0.2s ease-out',
        'fade-in-up':     'fade-in-up 0.22s cubic-bezier(0.16,1,0.3,1) both',
        'slide-in-right': 'slide-in-right 0.22s cubic-bezier(0.16,1,0.3,1) both',
        'pulse-ring':     'pulse-ring 2s ease-in-out infinite',
      },
      spacing: {
        '4.5': '1.125rem',  // 18px
        '13': '3.25rem',    // 52px
        '15': '3.75rem',    // 60px
        '18': '4.5rem',     // 72px
        '22': '5.5rem',     // 88px
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

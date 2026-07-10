import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

/**
 * MetricCard — ISO 31000 Dark Premium
 * color: violet | lime | amber | coral | neutral
 */
export default function MetricCard({
  label,
  value,
  icon: Icon,
  color = 'violet',
  size = 'md',
  trend,
  sparkData,
  helper,
  onClick,
}) {
  const colorMap = {
    violet: { color: '#a78bfa', soft: 'rgba(167,139,250,0.05)', border: 'rgba(167,139,250,0.15)' },
    lime:   { color: '#10b981', soft: 'rgba(16, 185, 129, 0.05)',  border: 'rgba(16, 185, 129, 0.15)'  },
    amber:  { color: '#f97316', soft: 'rgba(249, 115, 22, 0.05)',  border: 'rgba(249, 115, 22, 0.15)'  },
    coral:  { color: '#f43f5e', soft: 'rgba(244, 63, 94, 0.05)',   border: 'rgba(244, 63, 94, 0.15)'   },
    neutral:{ color: '#3b82f6', soft: 'rgba(59, 130, 246, 0.05)',  border: 'rgba(59, 130, 246, 0.12)'  },
  };
  const c = colorMap[color] || colorMap.violet;

  const sizeMap = {
    sm: { value: 'text-2xl', pad: 'pt-4 px-4 pb-12', label: 'text-[9px]' },
    md: { value: 'text-3xl', pad: 'pt-5 px-5 pb-14', label: 'text-[10px]' },
    lg: { value: 'text-4xl', pad: 'pt-6 px-6 pb-16', label: 'text-[11px]' },
  };
  const s = sizeMap[size] || sizeMap.md;

  const formatHelper = (str) => {
    if (!str) return '';
    return str
      .replace(' en el proyecto', '')
      .replace(' del total', '')
      .replace('identificados recently', 'recientes')
      .replace('identificados', 'recientes');
  };

  // Sparkline coordinates calculator
  const spark = (() => {
    if (!sparkData || sparkData.length < 2) return null;
    const min = Math.min(...sparkData);
    const max = Math.max(...sparkData);
    const range = max - min === 0 ? 1 : max - min;
    const points = sparkData.map((val, i) => {
      const x = (i / (sparkData.length - 1)) * 100;
      const y = 26 - ((val - min) / range) * 20; // map to 6-26 Y range
      return { x, y };
    });
    const linePath = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
    const fillPath = `${linePath} L 100 32 L 0 32 Z`;
    const last = points[points.length - 1];
    return { linePath, fillPath, lastX: last.x, lastY: last.y };
  })();

  return (
    <div
      onClick={onClick}
      className={`
        group relative overflow-hidden rounded-[16px] border border-[#1e293b]/60
        bg-[#0d1527] hover:border-[#334155]/60
        ${onClick ? 'cursor-pointer' : ''}
        transition-all duration-300 ease-out
        hover:-translate-y-1
        hover:shadow-[0_20px_30px_-15px_rgba(0,0,0,0.6)]
        ${s.pad}
      `}
    >
      <div className="flex items-start justify-between gap-3 relative z-10">
        <div className="min-w-0 flex-1">
          {/* Label */}
          <span className={`${s.label} uppercase tracking-[0.16em] font-bold text-slate-400 font-mono`}>
            {label}
          </span>

          {/* Value + Helper on the same line */}
          <div className="flex items-baseline gap-2 mt-2">
            <span className={`${s.value} font-extrabold text-white tracking-tight font-sans`}>
              {value}
            </span>
            {helper && (
              <span className="text-[13px] text-slate-400 font-medium tracking-wide">
                {formatHelper(helper)}
              </span>
            )}
          </div>

          {/* Trend Indicator */}
          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2 text-[12px] font-sans">
              <span
                className={`
                  flex items-center gap-0.5 font-bold font-mono
                  ${trend > 0 ? 'text-emerald-400' : ''}
                  ${trend < 0 ? 'text-rose-400' : ''}
                  ${trend === 0 ? 'text-slate-400' : ''}
                `}
              >
                {trend > 0 ? '↑' : trend < 0 ? '↓' : ''} {Math.abs(trend)}%
              </span>
              <span className="text-slate-500 font-normal">vs. mes anterior</span>
            </div>
          )}
        </div>

        {/* Top Right Simple Icon */}
        {Icon && (
          <div className="text-slate-400 group-hover:text-white transition-colors duration-300 pt-0.5">
            <Icon size={18} className="stroke-[1.5]" />
          </div>
        )}
      </div>

      {/* Sparkline chart at the bottom */}
      {spark && (
        <div className="absolute bottom-0 left-0 right-0 h-10 w-full overflow-hidden pointer-events-none z-0">
          <svg className="w-full h-full" viewBox="0 0 100 30" preserveAspectRatio="none">
            <defs>
              <linearGradient id={`spark-grad-${color}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={c.color} stopOpacity={0.15} />
                <stop offset="100%" stopColor={c.color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <path d={spark.fillPath} fill={`url(#spark-grad-${color})`} />
            <path
              d={spark.linePath}
              fill="none"
              stroke={c.color}
              strokeWidth="1.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* Last point dot + pulsing ring */}
            <circle cx={spark.lastX} cy={spark.lastY} r="1.5" fill={c.color} />
            <circle
              cx={spark.lastX}
              cy={spark.lastY}
              r="3.5"
              fill={c.color}
              className="animate-ping opacity-25"
              style={{ transformOrigin: `${spark.lastX}px ${spark.lastY}px` }}
            />
          </svg>
        </div>
      )}
    </div>
  );
}



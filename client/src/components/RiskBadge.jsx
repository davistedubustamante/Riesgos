import { CLASSIFICATION_STYLE } from '@/utils/risk';

/**
 * RiskBadge — ISO 31000 Dark Premium
 * classification: 'Bajo' | 'Medio' | 'Alto' | 'Crítico'
 * size: 'sm' | 'md'
 * showDot: boolean — adds severity dot
 */
export default function RiskBadge({ value, size = 'md', showDot = false }) {
  const cls = CLASSIFICATION_STYLE[value] || 'badge badge-neutral';
  const sizeCls = size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-[11px] px-2.5 py-1';

  return (
    <span className={`${cls} ${sizeCls}`}>
      {showDot && (
        <span
          className="inline-block w-1.5 h-1.5 rounded-full mr-1.5"
          style={{
            background: value === 'Crítico' ? '#f43f5e'
              : value === 'Alto'   ? '#f97316'
              : value === 'Medio'  ? '#f59e0b'
              : value === 'Bajo'  ? '#22c55e'
              : '#64748b',
          }}
        />
      )}
      {value}
    </span>
  );
}

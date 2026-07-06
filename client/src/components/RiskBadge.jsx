import { Badge } from '@/components/ui/badge';
import { CLASSIFICATION_STYLE } from '../utils/risk.js';

export default function RiskBadge({ value, size = 'sm' }) {
  const cls = CLASSIFICATION_STYLE[value] || 'bg-white/10 text-white/70 border border-white/20';
  const sizeCls = size === 'lg' ? 'px-3 py-1 text-sm' : 'px-2.5 py-0.5 text-xs';
  return <Badge className={`${cls} ${sizeCls}`}>{value}</Badge>;
}

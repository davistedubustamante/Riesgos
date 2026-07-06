import { Card, CardContent } from '@/components/ui/card';

const colorMap = {
  brand:   { bg: 'bg-[#06b6d4]/10',   text: 'text-[#06b6d4]',   border: 'border-[#06b6d4]/20'   },
  emerald: { bg: 'bg-[#10b981]/10',   text: 'text-[#10b981]',   border: 'border-[#10b981]/20'   },
  yellow:  { bg: 'bg-[#eab308]/10',   text: 'text-[#eab308]',   border: 'border-[#eab308]/20'   },
  orange:  { bg: 'bg-[#f97316]/10',   text: 'text-[#f97316]',   border: 'border-[#f97316]/20'   },
  red:     { bg: 'bg-[#ef4444]/10',   text: 'text-[#ef4444]',   border: 'border-[#ef4444]/20'   },
  violet:  { bg: 'bg-[#8b5cf6]/10',   text: 'text-[#8b5cf6]',   border: 'border-[#8b5cf6]/20'   },
  blue:    { bg: 'bg-[#3b82f6]/10',   text: 'text-[#3b82f6]',   border: 'border-[#3b82f6]/20'   },
};

export default function MetricCard({ label, value, icon: Icon, color = 'brand', helper }) {
  const c = colorMap[color] || colorMap.brand;

  return (
    <Card className="card p-5 animate-fade-in-up group">
      <CardContent className="p-0">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-widest text-[#8a8f98] font-medium">
              {label}
            </p>
            <p className="text-3xl font-semibold text-[#f7f8f8] mt-1.5 tracking-tight">
              {value}
            </p>
            {helper && (
              <p className="text-xs text-[#8a8f98] mt-1">{helper}</p>
            )}
          </div>
          {Icon && (
            <div className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center border ${c.bg} ${c.text} ${c.border}`}>
              <Icon size={18} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function SearchInput({ value, onChange, placeholder = 'Buscar…' }) {
  return (
    <div className="relative w-full sm:w-[280px]">
      <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <Input
        className="pl-9 w-full bg-slate-900/40 border-white/10 text-white placeholder:text-muted-foreground/40 focus-visible:ring-1 focus-visible:ring-cyan-500/50 focus-visible:border-cyan-500/50 transition-smooth"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}

export function Select({ value, onChange, options, placeholder }) {
  return (
    <select
      className="flex h-9 w-full sm:w-[180px] rounded-md border border-white/10 bg-slate-900/40 text-white px-3 py-1 text-sm shadow-sm transition-smooth focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-cyan-500/50 focus-visible:border-cyan-500/50 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
    >
      {placeholder ? <option value="" className="bg-[#0d1127] text-white">{placeholder}</option> : null}
      {options.map((opt) => {
        const v = typeof opt === 'string' ? opt : opt.value;
        const l = typeof opt === 'string' ? opt : opt.label;
        return (
          <option key={v} value={v} className="bg-[#0d1127] text-white">{l}</option>
        );
      })}
    </select>
  );
}

export default function FilterBar({ children }) {
  return <div className="flex flex-col sm:flex-row flex-wrap items-center gap-3 w-full">{children}</div>;
}


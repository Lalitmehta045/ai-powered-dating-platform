import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  icon: LucideIcon;
  color: string;
}

export const StatCard = ({ label, value, change, icon: Icon, color }: StatCardProps) => {
  const isPositive = change?.startsWith('+');

  return (
    <div className="p-6 bg-surface border border-border rounded-2xl space-y-4 hover:border-primary/30 transition-all group">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-xl ${color} bg-opacity-10 group-hover:bg-opacity-20 transition-all`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        {change && (
          <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${
            isPositive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
          }`}>
            {change}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-text-muted uppercase tracking-wider">{label}</p>
        <h3 className="text-3xl font-bold mt-1 tracking-tight">{value}</h3>
      </div>
    </div>
  );
};

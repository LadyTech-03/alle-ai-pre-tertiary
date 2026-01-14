import { cn } from "@/lib/utils";

interface StatCardProps {
    title: string;
    value: string;
    change?: string;
    trend?: 'up' | 'down';
    subtitle?: string;
    icon: React.ReactNode;
  }
  
  export function StatCard({ title, value, change, trend, subtitle, icon }: StatCardProps) {
    return (
      <div className="p-4 rounded-lg border bg-backgroundSecondary cursor-pointer">
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">{title}</span>
          <div className="p-1 bg-primary/10 rounded-full">
            {icon}
          </div>
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-md font-semibold">{value}</span>
          {change && (
            <span className={cn(
              "text-xs",
              trend === 'up' ? 'text-green-500' : 'text-red-500'
            )}>
              {change}
            </span>
          )}
        </div>
        {subtitle && (
          <span className="text-xs text-muted-foreground">{subtitle}</span>
        )}
      </div>
    )
  }
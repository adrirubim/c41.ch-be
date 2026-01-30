import { cn } from '@/lib/utils';

interface BarChartProps {
    data: Array<{ label: string; value: number; color?: string }>;
    maxValue?: number;
    className?: string;
}

export function BarChart({ data, maxValue, className }: BarChartProps) {
    const max = maxValue || Math.max(...data.map((d) => d.value), 1);

    return (
        <div className={cn('space-y-2', className)}>
            {data.map((item, index) => {
                const percentage = (item.value / max) * 100;
                return (
                    <div key={index} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                            <span className="font-medium">{item.label}</span>
                            <span className="text-muted-foreground">
                                {item.value}
                            </span>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                            <div
                                className="h-full rounded-full transition-all duration-500"
                                style={{
                                    width: `${percentage}%`,
                                    backgroundColor:
                                        item.color || 'hsl(var(--primary))',
                                }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

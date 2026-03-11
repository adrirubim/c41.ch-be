import { cn } from '@/lib/utils';

interface BarChartProps {
    data: Array<{ label: string; value: number; color?: string }>;
    maxValue?: number;
    className?: string;
}

export function BarChart({ data, maxValue, className }: BarChartProps) {
    const safeMaxValue =
        typeof maxValue === 'number' && !Number.isNaN(maxValue)
            ? maxValue
            : undefined;
    const computedMax = Math.max(...data.map((d) => d.value), 1);
    const max = safeMaxValue ?? computedMax;

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
                                        typeof item.color === 'string' &&
                                        item.color.trim() !== ''
                                            ? item.color
                                            : 'hsl(var(--primary))',
                                }}
                            />
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

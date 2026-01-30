import { cn } from '@/lib/utils';

interface PieChartProps {
    data: Array<{ label: string; value: number; color?: string }>;
    size?: number;
    className?: string;
}

export function PieChart({ data, size = 120, className }: PieChartProps) {
    const total = data.reduce((sum, item) => sum + item.value, 0);

    if (total === 0) {
        return (
            <div
                className={cn('flex items-center justify-center', className)}
                style={{ width: size, height: size }}
            >
                <p className="text-sm text-muted-foreground">No data</p>
            </div>
        );
    }

    const segments = data.reduce<
        Array<{
            path: string;
            color: string;
            label: string;
            value: number;
            percentage: string;
        }>
    >((acc, item, index) => {
        const percentage = (item.value / total) * 100;
        const angle = (percentage / 100) * 360;
        const startAngle =
            -90 +
            data
                .slice(0, index)
                .reduce((sum, d) => sum + (d.value / total) * 360, 0);
        const endAngle = startAngle + angle;

        const x1 = 50 + 50 * Math.cos((startAngle * Math.PI) / 180);
        const y1 = 50 + 50 * Math.sin((startAngle * Math.PI) / 180);
        const x2 = 50 + 50 * Math.cos((endAngle * Math.PI) / 180);
        const y2 = 50 + 50 * Math.sin((endAngle * Math.PI) / 180);
        const largeArcFlag = angle > 180 ? 1 : 0;

        const pathData = [
            `M 50 50`,
            `L ${x1} ${y1}`,
            `A 50 50 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            `Z`,
        ].join(' ');

        return [
            ...acc,
            {
                path: pathData,
                color: item.color || `hsl(${(index * 137.5) % 360}, 70%, 50%)`,
                label: item.label,
                value: item.value,
                percentage: percentage.toFixed(1),
            },
        ];
    }, []);

    return (
        <div className={cn('flex flex-col items-center gap-4', className)}>
            <svg
                viewBox="0 0 100 100"
                style={{ width: size, height: size }}
                className="-rotate-90 transform"
            >
                {segments.map((segment, index) => (
                    <path
                        key={index}
                        d={segment.path}
                        fill={segment.color}
                        stroke="white"
                        strokeWidth="0.5"
                        className="transition-opacity hover:opacity-80"
                    />
                ))}
            </svg>
            <div className="w-full space-y-2">
                {segments.map((segment, index) => (
                    <div
                        key={index}
                        className="flex items-center justify-between text-sm"
                    >
                        <div className="flex items-center gap-2">
                            <div
                                className="h-3 w-3 rounded-full"
                                style={{ backgroundColor: segment.color }}
                            />
                            <span>{segment.label}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-muted-foreground">
                                {segment.value}
                            </span>
                            <span className="text-xs text-muted-foreground">
                                ({segment.percentage}%)
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

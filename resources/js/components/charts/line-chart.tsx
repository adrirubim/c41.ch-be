import { cn } from '@/lib/utils';

interface LineChartProps {
    data: Array<{ label: string; value: number }>;
    height?: number;
    className?: string;
}

export function LineChart({ data, height = 200, className }: LineChartProps) {
    if (data.length === 0) {
        return (
            <div
                className={cn('flex items-center justify-center', className)}
                style={{ height }}
            >
                <p className="text-sm text-muted-foreground">No data</p>
            </div>
        );
    }

    const maxValue = Math.max(...data.map((d) => d.value), 1);
    const minValue = Math.min(...data.map((d) => d.value), 0);
    const range = maxValue - minValue || 1;
    const width = 400;
    const padding = 40;

    const points = data.map((item, index) => {
        const x =
            padding + (index / (data.length - 1 || 1)) * (width - 2 * padding);
        const y =
            height -
            padding -
            ((item.value - minValue) / range) * (height - 2 * padding);
        return { x, y, label: item.label, value: item.value };
    });

    const pathData = points
        .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
        .join(' ');

    return (
        <div className={cn('relative', className)}>
            <svg width={width} height={height} className="overflow-visible">
                {/* Grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                    const y = padding + ratio * (height - 2 * padding);
                    const value = maxValue - ratio * range;
                    return (
                        <g key={ratio}>
                            <line
                                x1={padding}
                                y1={y}
                                x2={width - padding}
                                y2={y}
                                stroke="currentColor"
                                strokeOpacity="0.1"
                                strokeWidth="1"
                            />
                            <text
                                x={padding - 10}
                                y={y + 4}
                                textAnchor="end"
                                className="fill-muted-foreground text-xs"
                            >
                                {Math.round(value)}
                            </text>
                        </g>
                    );
                })}

                {/* Line */}
                <path
                    d={pathData}
                    fill="none"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2"
                    className="transition-all"
                />

                {/* Points */}
                {points.map((point, index) => (
                    <g key={index}>
                        <circle
                            cx={point.x}
                            cy={point.y}
                            r="4"
                            fill="hsl(var(--primary))"
                            className="hover:r-6 transition-all"
                        />
                        <title>
                            {point.label}: {point.value}
                        </title>
                    </g>
                ))}
            </svg>
            {/* Labels */}
            <div className="mt-2 flex justify-between px-10">
                {points.map((point, index) => (
                    <span key={index} className="text-xs text-muted-foreground">
                        {point.label}
                    </span>
                ))}
            </div>
        </div>
    );
}

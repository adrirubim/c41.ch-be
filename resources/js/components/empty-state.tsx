import { Link } from '@/components/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { FileText, Folder, Plus, Search } from 'lucide-react';

interface EmptyStateProps {
    icon?: React.ComponentType<{ className?: string }>;
    title: string;
    description: string;
    action?: {
        label: string;
        href?: string;
        onClick?: () => void;
    };
    className?: string;
}

const iconMap = {
    posts: FileText,
    categories: Folder,
    search: Search,
    default: FileText,
};

export function EmptyState({
    icon,
    title,
    description,
    action,
    className,
}: EmptyStateProps) {
    const Icon = icon || iconMap.default;

    return (
        <Card className={cn('border-dashed', className)}>
            <CardContent className="flex flex-col items-center justify-center px-4 py-12">
                <div className="mb-4 rounded-full bg-muted p-4">
                    <Icon className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="mb-2 text-center text-lg font-semibold">
                    {title}
                </h3>
                <p className="mb-6 max-w-sm text-center text-sm text-muted-foreground">
                    {description}
                </p>
                {action &&
                    (action.href ? (
                        <Link href={action.href}>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                {action.label}
                            </Button>
                        </Link>
                    ) : (
                        <Button onClick={action.onClick}>
                            <Plus className="mr-2 h-4 w-4" />
                            {action.label}
                        </Button>
                    ))}
            </CardContent>
        </Card>
    );
}

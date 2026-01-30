import { Link } from '@/components/link';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { usePage } from '@inertiajs/react';
import { Plus } from 'lucide-react';

interface FloatingActionButtonProps {
    href?: string;
    onClick?: () => void;
    label?: string;
    className?: string;
}

export function FloatingActionButton({
    href,
    onClick,
    label,
    className,
}: FloatingActionButtonProps) {
    const { url } = usePage();

    // Determine the correct href and label based on current route
    let defaultHref = '/posts/create';
    let defaultLabel = 'Create Post';

    if (url.startsWith('/dashboard/categories')) {
        defaultHref = '/dashboard/categories/new';
        defaultLabel = 'Create Category';
    } else if (url.startsWith('/posts')) {
        defaultHref = '/posts/create';
        defaultLabel = 'Create Post';
    } else if (url.startsWith('/dashboard')) {
        defaultHref = '/posts/create';
        defaultLabel = 'Create Post';
    }

    // Use provided props or defaults
    const finalHref = href || defaultHref;
    const finalLabel = label || defaultLabel;

    const buttonContent = (
        <Button
            size="lg"
            className={cn(
                'transition-smooth animate-scale-in fixed right-6 bottom-6 z-50 h-14 w-14 rounded-full shadow-lg hover:shadow-xl',
                'md:h-auto md:w-auto md:rounded-full md:px-6',
                'hover:scale-105 active:scale-95',
                className,
            )}
            onClick={onClick}
            aria-label={finalLabel}
            title={finalLabel}
        >
            <Plus className="h-5 w-5 md:mr-2" aria-hidden="true" />
            <span className="hidden md:inline">{finalLabel}</span>
        </Button>
    );

    if (onClick) {
        return buttonContent;
    }

    return (
        <Link href={finalHref} as="div">
            {buttonContent}
        </Link>
    );
}

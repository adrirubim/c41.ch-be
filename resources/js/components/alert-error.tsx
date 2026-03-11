import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircleIcon } from 'lucide-react';

interface AlertErrorProps {
    errors: string[];
    title?: string;
}

export default function AlertError({ errors, title }: AlertErrorProps) {
    const hasTitle = typeof title === 'string' && title.trim() !== '';
    const finalTitle = hasTitle ? title : 'Something went wrong.';

    return (
        <Alert variant="destructive">
            <AlertCircleIcon />
            <AlertTitle>{finalTitle}</AlertTitle>
            <AlertDescription>
                <ul className="list-inside list-disc text-sm">
                    {Array.from(new Set(errors)).map((error, index) => (
                        <li key={index}>{error}</li>
                    ))}
                </ul>
            </AlertDescription>
        </Alert>
    );
}

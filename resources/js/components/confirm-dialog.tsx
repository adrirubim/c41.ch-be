import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onConfirm: () => void;
    title: string;
    description: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'default' | 'destructive';
    preview?: React.ReactNode;
    details?: Array<{ label: string; value: string | React.ReactNode }>;
}

export function ConfirmDialog({
    open,
    onOpenChange,
    onConfirm,
    title,
    description,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'destructive',
    preview,
    details,
}: ConfirmDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent className="max-w-lg">
                <AlertDialogHeader>
                    <div className="flex items-center gap-3">
                        {variant === 'destructive' && (
                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                            </div>
                        )}
                        <div className="flex-1">
                            <AlertDialogTitle>{title}</AlertDialogTitle>
                            <AlertDialogDescription className="mt-2">
                                {description}
                            </AlertDialogDescription>
                        </div>
                    </div>
                </AlertDialogHeader>

                {preview && (
                    <div className="my-4 rounded-lg border bg-muted/50 p-4">
                        {preview}
                    </div>
                )}

                {details && details.length > 0 && (
                    <div className="my-4 space-y-2">
                        {details.map((detail, index) => (
                            <div
                                key={index}
                                className="flex items-center justify-between text-sm"
                            >
                                <span className="text-muted-foreground">
                                    {detail.label}:
                                </span>
                                <span className="font-medium">
                                    {detail.value}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                <AlertDialogFooter>
                    <AlertDialogCancel asChild>
                        <Button variant="outline">{cancelText}</Button>
                    </AlertDialogCancel>
                    <AlertDialogAction asChild>
                        <Button
                            variant={
                                variant === 'destructive'
                                    ? 'destructive'
                                    : 'default'
                            }
                            onClick={onConfirm}
                        >
                            {confirmText}
                        </Button>
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

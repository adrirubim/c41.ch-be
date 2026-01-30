import {
    Toast,
    ToastClose,
    ToastDescription,
    ToastTitle,
    ToastViewport,
} from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, Info, XCircle } from 'lucide-react';

export function Toaster() {
    const { toasts, removeToast } = useToast();

    if (toasts.length === 0) {
        return null;
    }

    return (
        <ToastViewport>
            {toasts.map((toast) => {
                const Icon =
                    toast.variant === 'destructive'
                        ? XCircle
                        : toast.variant === 'success'
                          ? CheckCircle
                          : Info;

                return (
                    <Toast
                        key={toast.id}
                        variant={toast.variant}
                        onClose={() => removeToast(toast.id)}
                        className="animate-slide-in-right"
                    >
                        <div className="flex items-start gap-3">
                            <Icon
                                className="h-5 w-5 shrink-0"
                                aria-hidden="true"
                            />
                            <div className="flex-1">
                                <ToastTitle>{toast.title}</ToastTitle>
                                <ToastDescription>
                                    {toast.description}
                                </ToastDescription>
                            </div>
                        </div>
                        <ToastClose
                            onClick={() => removeToast(toast.id)}
                            aria-label="Close notification"
                        />
                    </Toast>
                );
            })}
        </ToastViewport>
    );
}

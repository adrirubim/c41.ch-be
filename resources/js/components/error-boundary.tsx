import { type SharedData } from '#app/types';
import { usePage } from '@inertiajs/react';
import type { ErrorInfo, ReactNode } from 'react';
import { Component } from 'react';

type ErrorReporterPayload = {
    message: string;
    stack?: string | null;
    componentStack?: string | null;
    url: string;
    userAgent?: string | null;
    request_id?: string | null;
    user?: {
        id: number;
        email: string;
        is_admin: boolean;
    } | null;
};

async function reportClientError(payload: ErrorReporterPayload): Promise<void> {
    try {
        await fetch('/api/logs/error', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Requested-With': 'XMLHttpRequest',
            },
            body: JSON.stringify(payload),
        });
    } catch {
        // Swallow reporting failures.
    }
}

export class ErrorBoundary extends Component<
    { children: ReactNode; requestId: string | null; user: SharedData['auth']['user'] },
    { hasError: boolean }
> {
    state = { hasError: false };

    static getDerivedStateFromError(): { hasError: true } {
        return { hasError: true };
    }

    componentDidCatch(error: Error, info: ErrorInfo) {
        const payload: ErrorReporterPayload = {
            message: error.message,
            stack: typeof error.stack === 'string' ? error.stack : null,
            componentStack:
                typeof info.componentStack === 'string'
                    ? info.componentStack
                    : null,
            url: typeof window !== 'undefined' ? window.location.href : '',
            userAgent:
                typeof navigator !== 'undefined' ? navigator.userAgent : null,
            request_id: this.props.requestId,
            user:
                this.props.user !== null
                    ? {
                          id: this.props.user.id,
                          email: this.props.user.email,
                          is_admin: this.props.user.is_admin,
                      }
                    : null,
        };

        void reportClientError(payload);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="mx-auto flex min-h-screen max-w-2xl flex-col items-center justify-center px-6 text-center">
                    <h1 className="text-2xl font-semibold">
                        Algo ha fallado.
                    </h1>
                    <p className="mt-2 text-muted-foreground">
                        Se ha registrado el error. Por favor, recarga la página.
                    </p>
                </div>
            );
        }

        return this.props.children;
    }
}

export function AppErrorBoundary({ children }: { children: ReactNode }) {
    const page = usePage<SharedData>();
    return (
        <ErrorBoundary requestId={page.props.requestId} user={page.props.auth.user}>
            {children}
        </ErrorBoundary>
    );
}


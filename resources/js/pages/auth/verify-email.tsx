// Components
import { Form } from '@/components/form';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import AuthLayout from '@/layouts/auth-layout';
import { withBasePath } from '@/lib/utils';
import { logout } from '@/routes';
import { send } from '@/routes/verification';
import type { FormComponentSlotProps } from '@inertiajs/core';
import { Head, router } from '@inertiajs/react';

export default function VerifyEmail({ status }: { status?: string }) {
    return (
        <AuthLayout
            title="Verify email"
            description="Please verify your email address by clicking on the link we just emailed to you."
        >
            <Head title="Email verification" />

            {status === 'verification-link-sent' && (
                <div className="mb-4 text-center text-sm font-medium text-green-600">
                    A new verification link has been sent to the email address
                    you provided during registration.
                </div>
            )}

            <Form {...send.form()} className="space-y-6 text-center">
                {({ processing }: FormComponentSlotProps) => (
                    <>
                        <Button disabled={processing} variant="secondary">
                            {processing && <Spinner />}
                            Resend verification email
                        </Button>

                        <button
                            type="button"
                            onClick={() => router.post(withBasePath(logout()))}
                            className="mx-auto block text-sm text-primary hover:underline"
                        >
                            Log out
                        </button>
                    </>
                )}
            </Form>
        </AuthLayout>
    );
}

import { Form } from '#app/components/form';
import InputError from '#app/components/input-error';
import { Button } from '#app/components/ui/button';
import { Label } from '#app/components/ui/label';
import { PasswordInput } from '#app/components/ui/password-input';
import { Spinner } from '#app/components/ui/spinner';
import AuthLayout from '#app/layouts/auth-layout';
import { store } from '#app/routes/password/confirm';
import type { FormComponentSlotProps } from '@inertiajs/core';
import { Head } from '@inertiajs/react';

export default function ConfirmPassword() {
    return (
        <AuthLayout
            title="Confirm your password"
            description="This is a secure area of the application. Please confirm your password before continuing."
        >
            <Head title="Confirm password" />

            <Form {...store.form()} resetOnSuccess={['password']}>
                {({ processing, errors }: FormComponentSlotProps) => (
                    <div className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="password">Password</Label>
                            <PasswordInput
                                id="password"
                                name="password"
                                placeholder="Password"
                                autoComplete="current-password"
                                autoFocus
                            />

                            <InputError message={errors.password} />
                        </div>

                        <div className="flex items-center">
                            <Button
                                className="w-full"
                                disabled={processing}
                                data-test="confirm-password-button"
                            >
                                {processing && <Spinner />}
                                Confirm password
                            </Button>
                        </div>
                    </div>
                )}
            </Form>
        </AuthLayout>
    );
}

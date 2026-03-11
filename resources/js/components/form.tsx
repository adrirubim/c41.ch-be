import { withBasePath } from '@/lib/utils';
import { Form as InertiaForm } from '@inertiajs/react';
import type { ComponentPropsWithoutRef } from 'react';

type InertiaFormProps = ComponentPropsWithoutRef<typeof InertiaForm>;

/**
 * Custom Form component that automatically adds the subdirectory prefix
 * to the form action. This prevents 404 errors when forms submit
 * to routes without the required prefix.
 *
 * Usage:
 *   <Form {...store.form()} action={store()}>
 *     ...
 *   </Form>
 *
 * The action will be automatically corrected with the subdirectory prefix.
 */
export function Form({ action, ...props }: InertiaFormProps) {
    const actionWithBase =
        typeof action === 'string' && action !== ''
            ? withBasePath(action)
            : action;

    return <InertiaForm action={actionWithBase} {...props} />;
}

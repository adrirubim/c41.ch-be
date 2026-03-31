import { withBasePath } from '#app/lib/utils';
import { Form as InertiaForm } from '@inertiajs/react';
import type {
    FormComponentProps,
    FormComponentRef,
    FormComponentSlotProps,
} from '@inertiajs/core';
import React, { type ReactNode } from 'react';

type FormProps<TForm extends object = Record<string, unknown>> =
    FormComponentProps<TForm> &
        Omit<
            React.FormHTMLAttributes<HTMLFormElement>,
            keyof FormComponentProps | 'children'
        > &
        Omit<
            React.AllHTMLAttributes<HTMLFormElement>,
            keyof FormComponentProps | 'children'
        > & {
            children:
                | ReactNode
                | ((props: FormComponentSlotProps<TForm>) => ReactNode);
        };

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
export function Form<TForm extends object = Record<string, unknown>>({
    action,
    ...props
}: FormProps<TForm> & React.RefAttributes<FormComponentRef<TForm>>) {
    const actionWithBase =
        typeof action === 'string' && action !== ''
            ? withBasePath(action)
            : action;

    return <InertiaForm<TForm> action={actionWithBase} {...props} />;
}

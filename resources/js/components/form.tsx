import { withBasePath } from '@/lib/utils';
import { Form as InertiaForm } from '@inertiajs/react';
import type { ComponentPropsWithoutRef } from 'react';

type InertiaFormProps = ComponentPropsWithoutRef<typeof InertiaForm>;

/**
 * Componente Form personalizado que automáticamente agrega el prefijo del subdirectorio
 * a la acción del formulario. Esto previene errores 404 cuando los formularios envían
 * a rutas sin el prefijo.
 *
 * Uso:
 *   <Form {...store.form()} action={store()}>
 *     ...
 *   </Form>
 *
 * La acción se corregirá automáticamente con el prefijo del subdirectorio.
 */
export function Form({ action, ...props }: InertiaFormProps) {
    // Si hay una acción, agregar el prefijo del subdirectorio
    const actionWithBase = action ? withBasePath(action) : action;

    return <InertiaForm action={actionWithBase} {...props} />;
}

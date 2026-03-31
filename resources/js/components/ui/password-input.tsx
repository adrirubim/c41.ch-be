import * as React from 'react';

import { cn } from '#app/lib/utils';
import { Eye, EyeOff } from 'lucide-react';

import { Button } from '#app/components/ui/button';
import { Input } from '#app/components/ui/input';

type PasswordInputProps = Omit<
    React.ComponentProps<typeof Input>,
    'type' | 'value' | 'defaultValue' | 'onChange'
> & {
    value?: string;
    defaultValue?: string;
    onChange?: React.ChangeEventHandler<HTMLInputElement>;
};

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
    ({ className, disabled, ...props }, ref) => {
        const [visible, setVisible] = React.useState(false);

        return (
            <div className="relative">
                <Input
                    ref={ref}
                    type={visible ? 'text' : 'password'}
                    disabled={disabled}
                    className={cn('pr-10', className)}
                    {...props}
                />
                <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={disabled}
                    aria-label={
                        visible ? 'Ocultar contraseña' : 'Mostrar contraseña'
                    }
                    onClick={() => setVisible((v) => !v)}
                    className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2"
                >
                    {visible ? (
                        <EyeOff className="h-4 w-4" />
                    ) : (
                        <Eye className="h-4 w-4" />
                    )}
                </Button>
            </div>
        );
    },
);

PasswordInput.displayName = 'PasswordInput';

export { PasswordInput };


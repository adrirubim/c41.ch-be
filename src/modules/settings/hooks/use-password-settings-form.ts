import { useCallback, useRef } from 'react';

interface PasswordFormErrors {
    [key: string]: unknown;
    password?: string;
    current_password?: string;
    password_confirmation?: string;
}

export interface UsePasswordSettingsFormResult {
    passwordInputRef: React.RefObject<HTMLInputElement | null>;
    currentPasswordInputRef: React.RefObject<HTMLInputElement | null>;
    handleErrorFocus: (errors: PasswordFormErrors) => void;
}

export function usePasswordSettingsForm(): UsePasswordSettingsFormResult {
    const passwordInputRef = useRef<HTMLInputElement | null>(null);
    const currentPasswordInputRef = useRef<HTMLInputElement | null>(null);

    const handleErrorFocus = useCallback((errors: PasswordFormErrors) => {
        if (errors.password != null && passwordInputRef.current !== null) {
            passwordInputRef.current.focus();
        }

        if (
            errors.current_password != null &&
            currentPasswordInputRef.current !== null
        ) {
            currentPasswordInputRef.current.focus();
        }
    }, []);

    return {
        passwordInputRef,
        currentPasswordInputRef,
        handleErrorFocus,
    };
}


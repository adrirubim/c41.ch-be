import { useCallback, useEffect, useState } from 'react';

export interface UseTwoFactorRecoveryCodesArgs {
    recoveryCodesList: string[];
    fetchRecoveryCodes: () => Promise<void> | void;
}

export interface UseTwoFactorRecoveryCodesResult {
    codesAreVisible: boolean;
    canRegenerateCodes: boolean;
    toggleCodesVisibility: () => Promise<void> | void;
}

export function useTwoFactorRecoveryCodes(
    args: UseTwoFactorRecoveryCodesArgs,
): UseTwoFactorRecoveryCodesResult {
    const { recoveryCodesList, fetchRecoveryCodes } = args;

    const [codesAreVisible, setCodesAreVisible] = useState(false);

    const canRegenerateCodes =
        recoveryCodesList.length > 0 && codesAreVisible;

    const toggleCodesVisibility = useCallback(async () => {
        if (!codesAreVisible && recoveryCodesList.length === 0) {
            await fetchRecoveryCodes();
        }

        setCodesAreVisible((previous) => !previous);
    }, [codesAreVisible, recoveryCodesList.length, fetchRecoveryCodes]);

    useEffect(() => {
        if (recoveryCodesList.length === 0) {
            fetchRecoveryCodes();
        }
    }, [recoveryCodesList.length, fetchRecoveryCodes]);

    return {
        codesAreVisible,
        canRegenerateCodes,
        toggleCodesVisibility,
    };
}


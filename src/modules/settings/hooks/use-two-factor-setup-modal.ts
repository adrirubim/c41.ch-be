import { useCallback, useEffect, useMemo, useState } from 'react';

interface ModalConfig {
    title: string;
    description: string;
    buttonText: string;
}

export interface UseTwoFactorSetupModalArgs {
    isOpen: boolean;
    requiresConfirmation: boolean;
    twoFactorEnabled: boolean;
    qrCodeSvg: string | null | undefined;
    clearSetupData: () => void;
    fetchSetupData: () => void;
    onClose: () => void;
}

export interface UseTwoFactorSetupModalResult {
    showVerificationStep: boolean;
    modalConfig: ModalConfig;
    handleModalNextStep: () => void;
    handleClose: () => void;
    handleBackToSetup: () => void;
}

export function useTwoFactorSetupModal(
    args: UseTwoFactorSetupModalArgs,
): UseTwoFactorSetupModalResult {
    const {
        isOpen,
        requiresConfirmation,
        twoFactorEnabled,
        qrCodeSvg,
        clearSetupData,
        fetchSetupData,
        onClose,
    } = args;

    const [showVerificationStep, setShowVerificationStep] = useState(false);

    const modalConfig: ModalConfig = useMemo(() => {
        if (twoFactorEnabled) {
            return {
                title: 'Two-Factor Authentication Enabled',
                description:
                    'Two-factor authentication is now enabled. Scan the QR code or enter the setup key in your authenticator app.',
                buttonText: 'Close',
            };
        }

        if (showVerificationStep) {
            return {
                title: 'Verify Authentication Code',
                description:
                    'Enter the 6-digit code from your authenticator app',
                buttonText: 'Continue',
            };
        }

        return {
            title: 'Enable Two-Factor Authentication',
            description:
                'To finish enabling two-factor authentication, scan the QR code or enter the setup key in your authenticator app',
            buttonText: 'Continue',
        };
    }, [twoFactorEnabled, showVerificationStep]);

    const handleModalNextStep = useCallback(() => {
        if (requiresConfirmation) {
            setShowVerificationStep(true);
            return;
        }

        clearSetupData();
        onClose();
    }, [requiresConfirmation, clearSetupData, onClose]);

    const resetModalState = useCallback(() => {
        setShowVerificationStep(false);

        if (twoFactorEnabled) {
            clearSetupData();
        }
    }, [twoFactorEnabled, clearSetupData]);

    useEffect(() => {
        if (!isOpen) {
            return;
        }

        if (qrCodeSvg === null || qrCodeSvg === undefined || qrCodeSvg === '') {
            fetchSetupData();
        }
    }, [isOpen, qrCodeSvg, fetchSetupData]);

    const handleClose = useCallback(() => {
        resetModalState();
        onClose();
    }, [resetModalState, onClose]);

    const handleBackToSetup = useCallback(() => {
        setShowVerificationStep(false);
    }, []);

    return {
        showVerificationStep,
        modalConfig,
        handleModalNextStep,
        handleClose,
        handleBackToSetup,
    };
}


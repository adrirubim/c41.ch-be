import { Form } from '#app/components/form';
import InputError from '#app/components/input-error';
import { SafeHtml } from '#app/components/safe-html';
import { Button } from '#app/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '#app/components/ui/dialog';
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from '#app/components/ui/input-otp';
import { useAppearance } from '#app/hooks/use-appearance';
import { useClipboard } from '#app/hooks/use-clipboard';
import { OTP_MAX_LENGTH } from '#app/hooks/use-two-factor-auth';
import { trustedServerHtml } from '#app/lib/safe-html';
import { confirm } from '#app/routes/two-factor';
import { useTwoFactorSetupModal } from '@modules/settings/hooks/use-two-factor-setup-modal';
import { REGEXP_ONLY_DIGITS } from 'input-otp';
import { Check, Copy, ScanLine } from 'lucide-react';
import { type FormEventHandler, useEffect, useRef, useState } from 'react';
import AlertError from './alert-error';
import { Spinner } from './ui/spinner';

interface TwoFactorSetupStepProps {
    qrCodeSvg: string | null | undefined;
    manualSetupKey: string | null | undefined;
    buttonText: string;
    onNextStep: () => void;
    errors?: string[] | undefined;
}

function GridScanIcon() {
    return (
        <div className="mb-3 rounded-full border border-border bg-card p-0.5 shadow-sm">
            <div className="relative overflow-hidden rounded-full border border-border bg-muted p-2.5">
                <div className="absolute inset-0 grid grid-cols-5 opacity-50">
                    {Array.from({ length: 5 }, (_, index) => (
                        <div
                            key={`col-${index + 1}`}
                            className="border-r border-border last:border-r-0"
                        />
                    ))}
                </div>
                <div className="absolute inset-0 grid grid-rows-5 opacity-50">
                    {Array.from({ length: 5 }, (_, index) => (
                        <div
                            key={`row-${index + 1}`}
                            className="border-b border-border last:border-b-0"
                        />
                    ))}
                </div>
                <ScanLine className="relative z-20 size-6 text-foreground" />
            </div>
        </div>
    );
}

function TwoFactorSetupStep({
    qrCodeSvg,
    manualSetupKey,
    buttonText,
    onNextStep,
    errors,
}: TwoFactorSetupStepProps) {
    const { resolvedAppearance } = useAppearance();
    const [copiedText, copy] = useClipboard();

    const IconComponent = copiedText === manualSetupKey ? Check : Copy;

    if (errors !== undefined && errors.length !== 0) {
        return <AlertError errors={errors} />;
    }

    return (
        <>
            <div className="mx-auto flex max-w-md overflow-hidden">
                <div className="mx-auto aspect-square w-64 rounded-lg border border-border">
                    <div className="z-10 flex h-full w-full items-center justify-center p-5">
                        {qrCodeSvg !== null &&
                        qrCodeSvg !== undefined &&
                        qrCodeSvg !== '' ? (
                            <SafeHtml
                                as="div"
                                className="aspect-square w-full rounded-lg bg-white p-2 [&_svg]:size-full"
                                html={trustedServerHtml(qrCodeSvg)}
                                style={{
                                    filter:
                                        resolvedAppearance === 'dark'
                                            ? 'invert(1) brightness(1.5)'
                                            : undefined,
                                }}
                            />
                        ) : (
                            <Spinner />
                        )}
                    </div>
                </div>
            </div>

            <div className="flex w-full space-x-5">
                <Button className="w-full" onClick={onNextStep}>
                    {buttonText}
                </Button>
            </div>

            <div className="relative flex w-full items-center justify-center">
                <div className="absolute inset-0 top-1/2 h-px w-full bg-border" />
                <span className="relative bg-card px-2 py-1">
                    or, enter the code manually
                </span>
            </div>

            <div className="flex w-full space-x-2">
                <div className="flex w-full items-stretch overflow-hidden rounded-xl border border-border">
                    {typeof manualSetupKey !== 'string' ||
                    manualSetupKey.trim() === '' ? (
                        <div className="flex h-full w-full items-center justify-center bg-muted p-3">
                            <Spinner />
                        </div>
                    ) : (
                        <>
                            <label
                                htmlFor="manual-setup-key"
                                className="sr-only"
                            >
                                Manual setup key
                            </label>
                            <input
                                id="manual-setup-key"
                                type="text"
                                readOnly
                                value={manualSetupKey}
                                className="h-full w-full bg-background p-3 text-foreground outline-none"
                            />
                            <button
                                type="button"
                                onClick={() => copy(manualSetupKey)}
                                className="border-l border-border px-3 hover:bg-muted"
                                aria-label="Copy manual setup key"
                            >
                                <IconComponent className="w-4" />
                            </button>
                        </>
                    )}
                </div>
            </div>
        </>
    );
}

interface TwoFactorVerificationStepProps {
    onClose: () => void;
    onBack: () => void;
}

function TwoFactorVerificationStep({
    onClose,
    onBack,
}: TwoFactorVerificationStepProps) {
    const [code, setCode] = useState('');
    const pinInputContainerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const timeoutId = window.setTimeout(() => {
            pinInputContainerRef.current
                ?.querySelector<HTMLInputElement>('input')
                ?.focus();
        }, 0);

        return () => {
            window.clearTimeout(timeoutId);
        };
    }, []);

    const handleSubmitSuccess: FormEventHandler<HTMLFormElement> = (event) => {
        event.preventDefault();
    };

    return (
        <Form
            {...confirm.form()}
            onSuccess={() => onClose()}
            resetOnError
            resetOnSuccess
            onSubmit={handleSubmitSuccess}
        >
            {({
                processing,
                errors,
            }: {
                processing: boolean;
                errors?: {
                    confirmTwoFactorAuthentication?: {
                        code?: string;
                    };
                };
            }) => (
                <div
                    ref={pinInputContainerRef}
                    className="relative w-full space-y-3"
                >
                    <div className="flex w-full flex-col items-center space-y-3 py-2">
                        <label htmlFor="otp" className="sr-only">
                            Authentication code
                        </label>
                        <p id="otp-help" className="sr-only">
                            Enter the {OTP_MAX_LENGTH}-digit code from your
                            authenticator app.
                        </p>
                        <InputOTP
                            id="otp"
                            name="code"
                            maxLength={OTP_MAX_LENGTH}
                            onChange={setCode}
                            disabled={processing}
                            pattern={REGEXP_ONLY_DIGITS}
                            aria-describedby="otp-help"
                        >
                            <InputOTPGroup>
                                {Array.from(
                                    { length: OTP_MAX_LENGTH },
                                    (_, index) => (
                                        <InputOTPSlot
                                            key={index}
                                            index={index}
                                        />
                                    ),
                                )}
                            </InputOTPGroup>
                        </InputOTP>

                        <InputError
                            message={
                                errors?.confirmTwoFactorAuthentication?.code
                            }
                        />
                    </div>

                    <div className="flex w-full space-x-5">
                        <Button
                            type="button"
                            variant="outline"
                            className="flex-1"
                            onClick={onBack}
                            disabled={processing}
                        >
                            Back
                        </Button>
                        <Button
                            type="submit"
                            className="flex-1"
                            disabled={
                                processing || code.length < OTP_MAX_LENGTH
                            }
                        >
                            Confirm
                        </Button>
                    </div>
                </div>
            )}
        </Form>
    );
}

export interface TwoFactorSetupModalProps {
    isOpen: boolean;
    onClose: () => void;
    requiresConfirmation: boolean;
    twoFactorEnabled: boolean;
    qrCodeSvg: string | null | undefined;
    manualSetupKey: string | null | undefined;
    clearSetupData: () => void;
    fetchSetupData: () => void;
    errors?: string[] | undefined;
}

export default function TwoFactorSetupModal({
    isOpen,
    onClose,
    requiresConfirmation,
    twoFactorEnabled,
    qrCodeSvg,
    manualSetupKey,
    clearSetupData,
    fetchSetupData,
    errors,
}: TwoFactorSetupModalProps) {
    const {
        showVerificationStep,
        modalConfig,
        handleModalNextStep,
        handleClose,
        handleBackToSetup,
    } = useTwoFactorSetupModal({
        isOpen,
        requiresConfirmation,
        twoFactorEnabled,
        qrCodeSvg,
        clearSetupData,
        fetchSetupData,
        onClose,
    });

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => {
                if (!open) {
                    handleClose();
                }
            }}
        >
            <DialogContent
                className="sm:max-w-md"
                aria-describedby="two-factor-setup-description"
            >
                <DialogHeader className="flex items-center justify-center">
                    <GridScanIcon />
                    <DialogTitle>{modalConfig.title}</DialogTitle>
                    <DialogDescription
                        id="two-factor-setup-description"
                        className="text-center"
                    >
                        {modalConfig.description}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center space-y-5">
                    {showVerificationStep ? (
                        <TwoFactorVerificationStep
                            onClose={onClose}
                            onBack={handleBackToSetup}
                        />
                    ) : (
                        <TwoFactorSetupStep
                            qrCodeSvg={qrCodeSvg}
                            manualSetupKey={manualSetupKey}
                            buttonText={modalConfig.buttonText}
                            onNextStep={handleModalNextStep}
                            errors={errors}
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

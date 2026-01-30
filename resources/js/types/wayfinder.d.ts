/**
 * Stub declarations for Laravel Wayfinder–generated modules.
 * These files are generated at build time (resources/js/routes, resources/js/actions)
 * and are gitignored. This file allows `npm run types` to pass when they are absent.
 */

/** Route/action that has a URL and form props (for Inertia Form). */
interface RouteWithForm {
    (): string;
    form(): Record<string, unknown>;
}

declare module '@/routes' {
    const home: () => string;
    const dashboard: () => string;
    const login: () => string;
    const register: () => string;
    const logout: () => string;
    export { dashboard, home, login, logout, register };
}

declare module '@/routes/login' {
    const store: RouteWithForm;
    export { store };
}

declare module '@/routes/register' {
    const store: RouteWithForm;
    export { store };
}

declare module '@/routes/password' {
    const request: () => string;
    const email: RouteWithForm;
    const update: RouteWithForm;
    export { email, request, update };
}

declare module '@/routes/password/confirm' {
    const store: RouteWithForm;
    export { store };
}

declare module '@/routes/verification' {
    const send: RouteWithForm;
    export { send };
}

declare module '@/routes/two-factor' {
    interface TwoFactorShow {
        (): string;
        url(): string;
    }
    const disable: RouteWithForm;
    const enable: RouteWithForm;
    const show: TwoFactorShow;
    const confirm: RouteWithForm;
    const regenerateRecoveryCodes: RouteWithForm;
    const qrCode: { url(): string };
    const recoveryCodes: { url(): string };
    const secretKey: { url(): string };
    export {
        confirm,
        disable,
        enable,
        qrCode,
        recoveryCodes,
        regenerateRecoveryCodes,
        secretKey,
        show,
    };
}

declare module '@/routes/two-factor/login' {
    const store: RouteWithForm;
    export { store };
}

declare module '@/routes/profile' {
    const edit: () => string;
    export { edit };
}

declare module '@/routes/user-password' {
    const edit: () => string;
    export { edit };
}

declare module '@/routes/appearance' {
    const edit: () => string;
    export { edit };
}

declare module '@/actions/App/Http/Controllers/Settings/ProfileController' {
    const ProfileController: {
        update: { form: () => Record<string, unknown> };
        destroy: { form: () => Record<string, unknown> };
    };
    export default ProfileController;
}

declare module '@/actions/App/Http/Controllers/Settings/PasswordController' {
    const PasswordController: {
        update: { form: () => Record<string, unknown> };
    };
    export default PasswordController;
}

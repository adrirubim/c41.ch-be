export interface ApiError {
    message: string;
    status: number;
    details?: unknown;
}

export type ApiResult<T> =
    | { ok: true; data: T }
    | { ok: false; error: ApiError };

async function parseJsonSafe(response: Response): Promise<unknown> {
    try {
        return await response.json();
    } catch {
        return null;
    }
}

export async function apiGet<T>(url: string, init?: RequestInit): Promise<ApiResult<T>> {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                Accept: 'application/json',
                ...init?.headers,
            },
            ...init,
        });

        if (!response.ok) {
            const body = await parseJsonSafe(response);
            return {
                ok: false,
                error: {
                    message: (body as { message?: string })?.message ?? 'Request failed',
                    status: response.status,
                    details: body,
                },
            };
        }

        const data = (await parseJsonSafe(response)) as T;
        return { ok: true, data };
    } catch (error) {
        return {
            ok: false,
            error: {
                message: 'Network error',
                status: 0,
                details: error,
            },
        };
    }
}


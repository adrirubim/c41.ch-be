declare const __sanitizedHtmlBrand: unique symbol;
declare const __serverSanitizedHtmlBrand: unique symbol;
declare const __previewHtmlBrand: unique symbol;

/**
 * A branded string that signals the HTML has been sanitized (or is otherwise safe/trusted).
 *
 * Prefer creating this value as close as possible to the sanitization boundary
 * (e.g. after server-side HTMLPurifier) so it's easy to audit.
 */
export type ServerSanitizedHtml = string & {
    readonly [__sanitizedHtmlBrand]: true;
    readonly [__serverSanitizedHtmlBrand]: true;
};

export type PreviewHtml = string & {
    readonly [__sanitizedHtmlBrand]: true;
    readonly [__previewHtmlBrand]: true;
};

/**
 * HTML that is safe to render via `SafeHtml`.
 *
 * Use `trustedServerHtml` for persisted/sanitized backend content, and
 * `trustedPreviewHtml` for editor-only preview HTML.
 */
export type SanitizedHtml = ServerSanitizedHtml | PreviewHtml;

/**
 * Mark HTML as sanitized/trusted.
 *
 * This does not sanitize. It makes the trust boundary explicit and searchable in code review.
 */
export function trustedServerHtml(html: string): ServerSanitizedHtml {
    return html as ServerSanitizedHtml;
}

export function trustedPreviewHtml(html: string): PreviewHtml {
    return html as PreviewHtml;
}

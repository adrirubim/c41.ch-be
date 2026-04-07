import {
    trustedPreviewHtml,
    trustedServerHtml,
    type PreviewHtml,
    type ServerSanitizedHtml,
} from '#app/lib/safe-html';

/**
 * HTML that comes from persisted Post content.
 *
 * Contract: the backend sanitizes this content (HTMLPurifier) on save,
 * so the frontend can treat it as safe to render.
 */
export function postContentHtmlFromServer(html: string): ServerSanitizedHtml {
    return trustedServerHtml(html);
}

/**
 * HTML used for editor previews before the post is persisted.
 *
 * Contract: this is only for local preview UX. It is still rendered through
 * the same SafeHtml component so the dangerous surface is centralized.
 */
export function editorPreviewHtml(html: string): PreviewHtml {
    return trustedPreviewHtml(html);
}

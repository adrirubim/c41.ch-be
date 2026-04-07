export function decodeHtmlEntities(input: string): string {
    if (input.trim() === '') return '';

    // DOMParser is available in the browser; Inertia pages render client-side.
    const doc = new DOMParser().parseFromString(input, 'text/html');
    return doc.documentElement.textContent ?? '';
}

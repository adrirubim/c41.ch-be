import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { WandSparkles } from 'lucide-react';
import { useState } from 'react';

interface EditorialSuggestions {
    excerpt: string;
    tags: string[];
}

interface EditorialSuggestionsPanelProps {
    title: string;
    content: string;
    excerpt: string;
    tags: string[];
    disabled?: boolean;
    onApply: (suggestions: EditorialSuggestions) => void;
}

interface SuggestionResponse {
    message: string;
    data: EditorialSuggestions;
}

function getCsrfToken(): string {
    const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');

    return token ?? '';
}

export function EditorialSuggestionsPanel({
    title,
    content,
    excerpt,
    tags,
    disabled = false,
    onApply,
}: EditorialSuggestionsPanelProps) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [suggestions, setSuggestions] = useState<EditorialSuggestions | null>(null);

    const handleSuggest = async () => {
        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/posts/editorial-suggestions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': getCsrfToken(),
                    'X-Requested-With': 'XMLHttpRequest',
                },
                body: JSON.stringify({
                    title,
                    content,
                    excerpt,
                    tags,
                }),
            });

            if (!response.ok) {
                const errorData = (await response.json().catch(() => null)) as { message?: string } | null;
                setError(errorData?.message ?? 'Could not generate suggestions right now.');
                return;
            }

            const payload = (await response.json()) as SuggestionResponse;
            setSuggestions(payload.data);
        } catch {
            setError('Unexpected error while generating suggestions.');
        } finally {
            setLoading(false);
        }
    };

    const hasSuggestions = suggestions !== null;

    return (
        <Card>
            <CardHeader>
                <CardTitle>Editorial AI Assistant</CardTitle>
                <CardDescription>
                    Suggest excerpt and tags from your draft. Review before applying.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Button
                    type="button"
                    variant="outline"
                    disabled={disabled || loading}
                    onClick={handleSuggest}
                >
                    <WandSparkles className="mr-2 h-4 w-4" />
                    {loading ? 'Generating...' : 'Generate suggestions'}
                </Button>

                {error !== null && (
                    <p className="text-sm text-destructive">{error}</p>
                )}

                {hasSuggestions && (
                    <div className="space-y-3 rounded-md border p-3">
                        <div className="space-y-1">
                            <p className="text-xs font-medium uppercase text-muted-foreground">
                                Suggested excerpt
                            </p>
                            <p className="text-sm">{suggestions.excerpt}</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-xs font-medium uppercase text-muted-foreground">
                                Suggested tags
                            </p>
                            <p className="text-sm">{suggestions.tags.join(', ') || 'No tags suggested'}</p>
                        </div>
                        <Button
                            type="button"
                            onClick={() => onApply(suggestions)}
                        >
                            Apply suggestions
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

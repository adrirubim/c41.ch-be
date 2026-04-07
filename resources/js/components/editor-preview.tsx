import { SafeHtml } from '#app/components/safe-html';
import { Button } from '#app/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from '#app/components/ui/card';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '#app/components/ui/dialog';
import { editorPreviewHtml } from '#app/lib/posts-html';
import type { PreviewHtml } from '#app/lib/safe-html';
import { cn } from '#app/lib/utils';
import { Eye, Maximize2, X } from 'lucide-react';
import { useState } from 'react';

interface EditorPreviewProps {
    contentHtml: PreviewHtml;
    title?: string;
    excerpt?: string;
    className?: string;
}

export function EditorPreview({
    contentHtml,
    title,
    excerpt,
    className,
}: EditorPreviewProps) {
    const [previewOpen, setPreviewOpen] = useState(false);
    const [splitView, setSplitView] = useState(false);

    const hasContent =
        typeof contentHtml === 'string' && contentHtml.trim() !== '';
    const hasTitle = typeof title === 'string' && title.trim() !== '';

    if (!hasContent && !hasTitle) {
        return null;
    }

    const previewContent = (
        <div className="prose dark:prose-invert max-w-none">
            {hasTitle && <h1 className="mb-4 text-3xl font-bold">{title}</h1>}
            {typeof excerpt === 'string' && excerpt.trim() !== '' && (
                <p className="mb-6 text-lg text-muted-foreground italic">
                    {excerpt}
                </p>
            )}
            <SafeHtml
                html={editorPreviewHtml(
                    hasContent && typeof contentHtml === 'string'
                        ? contentHtml
                        : '<p>No content to preview</p>',
                )}
            />
        </div>
    );

    return (
        <>
            <div className={cn('flex items-center gap-2', className)}>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setPreviewOpen(true)}
                    className="flex items-center gap-2"
                >
                    <Eye className="h-4 w-4" />
                    <span className="hidden sm:inline">Preview</span>
                </Button>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSplitView(!splitView)}
                    className={cn(
                        'flex items-center gap-2',
                        splitView && 'bg-accent',
                    )}
                >
                    <Maximize2 className="h-4 w-4" />
                    <span className="hidden sm:inline">Split View</span>
                </Button>
            </div>

            {splitView && (
                <Card className="mt-4">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">
                            Preview
                        </CardTitle>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setSplitView(false)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </CardHeader>
                    <CardContent className="max-h-[600px] overflow-y-auto">
                        {previewContent}
                    </CardContent>
                </Card>
            )}

            <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
                <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Preview</DialogTitle>
                    </DialogHeader>
                    <div className="mt-4">{previewContent}</div>
                </DialogContent>
            </Dialog>
        </>
    );
}

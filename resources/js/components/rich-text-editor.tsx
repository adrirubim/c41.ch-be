import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableRow } from '@tiptap/extension-table-row';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
    Bold,
    Code,
    Code2,
    Image as ImageIcon,
    Italic,
    Link as LinkIcon,
    List,
    ListOrdered,
    Quote,
    Redo,
    Table as TableIcon,
    Undo,
} from 'lucide-react';
import { useRef, useState } from 'react';

interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
    showWordCount?: boolean;
}

export function RichTextEditor({
    content,
    onChange,
    showWordCount = true,
}: RichTextEditorProps) {
    const [linkDialogOpen, setLinkDialogOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [imageDialogOpen, setImageDialogOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [wordCount, setWordCount] = useState({ words: 0, characters: 0 });
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { addToast } = useToast();

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                codeBlock: {
                    HTMLAttributes: {
                        class: 'bg-muted rounded-md p-4 font-mono text-sm',
                    },
                },
                // Disable StarterKit link extension to use custom one
                link: false,
            }),
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-primary underline',
                },
            }),
            Image.configure({
                inline: true,
                allowBase64: true,
            }),
            Table.configure({
                resizable: true,
                HTMLAttributes: {
                    class: 'border-collapse border border-border',
                },
            }),
            TableRow.configure({
                HTMLAttributes: {
                    class: 'border border-border',
                },
            }),
            TableHeader.configure({
                HTMLAttributes: {
                    class: 'bg-muted font-semibold border border-border p-2',
                },
            }),
            TableCell.configure({
                HTMLAttributes: {
                    class: 'border border-border p-2',
                },
            }),
        ],
        content,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML());
            // Calculate word and character count
            const text = editor.getText();
            const words = text.trim() ? text.trim().split(/\s+/).length : 0;
            const characters = text.length;
            setWordCount({ words, characters });
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4 prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-muted',
            },
        },
    });

    if (!editor) {
        return null;
    }

    const setLink = () => {
        if (linkUrl) {
            editor.chain().focus().setLink({ href: linkUrl }).run();
            setLinkUrl('');
            setLinkDialogOpen(false);
        }
    };

    const unsetLink = () => {
        editor.chain().focus().unsetLink().run();
    };

    const addImage = () => {
        if (imageUrl) {
            editor.chain().focus().setImage({ src: imageUrl }).run();
            setImageUrl('');
            setImageDialogOpen(false);
        }
    };

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            addToast({
                title: 'Error',
                description: 'Please select a valid image file.',
                variant: 'destructive',
            });
            return;
        }

        // Validate file size (5MB)
        if (file.size > 5 * 1024 * 1024) {
            addToast({
                title: 'Error',
                description: 'The image must not exceed 5MB.',
                variant: 'destructive',
            });
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setImagePreview(e.target?.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleFileUpload = async () => {
        const file = fileInputRef.current?.files?.[0];
        if (!file) return;

        setUploading(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('image', file);

        try {
            const xhr = new XMLHttpRequest();

            // Track upload progress
            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const percentComplete = (e.loaded / e.total) * 100;
                    setUploadProgress(percentComplete);
                }
            });

            const response = await new Promise<{
                success: boolean;
                url?: string;
                error?: string;
            }>((resolve, reject) => {
                xhr.addEventListener('load', () => {
                    if (xhr.status === 200) {
                        try {
                            resolve(JSON.parse(xhr.responseText));
                        } catch {
                            reject(new Error('Invalid response'));
                        }
                    } else {
                        reject(new Error(`Upload failed: ${xhr.statusText}`));
                    }
                });

                xhr.addEventListener('error', () => {
                    reject(new Error('Network error'));
                });

                xhr.open('POST', '/upload-image');
                xhr.setRequestHeader(
                    'X-CSRF-TOKEN',
                    document
                        .querySelector('meta[name="csrf-token"]')
                        ?.getAttribute('content') || '',
                );
                xhr.send(formData);
            });

            if (response.success && response.url) {
                editor.chain().focus().setImage({ src: response.url }).run();
                setImageDialogOpen(false);
                setImagePreview(null);
                setUploadProgress(0);
                addToast({
                    title: 'Image uploaded',
                    description: 'The image has been uploaded successfully.',
                    variant: 'success',
                });
            } else {
                throw new Error(response.error || 'Unknown error');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
            addToast({
                title: 'Upload error',
                description:
                    error instanceof Error
                        ? error.message
                        : 'Error uploading the image. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setUploading(false);
            setUploadProgress(0);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="overflow-hidden rounded-lg border">
            {/* Toolbar */}
            <div
                className="flex flex-wrap items-center gap-1 border-b bg-muted/50 p-2"
                role="toolbar"
                aria-label="Editor toolbar"
            >
                <Button
                    type="button"
                    variant={editor.isActive('bold') ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className="h-8 w-8 p-0"
                    aria-label="Negrita"
                    aria-pressed={editor.isActive('bold')}
                >
                    <Bold className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button
                    type="button"
                    variant={editor.isActive('italic') ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className="h-8 w-8 p-0"
                    aria-label="Italic"
                    aria-pressed={editor.isActive('italic')}
                >
                    <Italic className="h-4 w-4" aria-hidden="true" />
                </Button>
                <div className="mx-1 h-6 w-px bg-border" />
                <Button
                    type="button"
                    variant={
                        editor.isActive('bulletList') ? 'default' : 'ghost'
                    }
                    size="sm"
                    onClick={() =>
                        editor.chain().focus().toggleBulletList().run()
                    }
                    className="h-8 w-8 p-0"
                >
                    <List className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant={
                        editor.isActive('orderedList') ? 'default' : 'ghost'
                    }
                    size="sm"
                    onClick={() =>
                        editor.chain().focus().toggleOrderedList().run()
                    }
                    className="h-8 w-8 p-0"
                >
                    <ListOrdered className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant={
                        editor.isActive('blockquote') ? 'default' : 'ghost'
                    }
                    size="sm"
                    onClick={() =>
                        editor.chain().focus().toggleBlockquote().run()
                    }
                    className="h-8 w-8 p-0"
                >
                    <Quote className="h-4 w-4" />
                </Button>
                <div className="mx-1 h-6 w-px bg-border" />
                <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
                    <DialogTrigger asChild>
                        <Button
                            type="button"
                            variant={
                                editor.isActive('link') ? 'default' : 'ghost'
                            }
                            size="sm"
                            className="h-8 w-8 p-0"
                        >
                            <LinkIcon className="h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Link</DialogTitle>
                            <DialogDescription>
                                Enter the URL of the link you want to add
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="link-url">URL</Label>
                                <Input
                                    id="link-url"
                                    type="url"
                                    placeholder="https://ejemplo.com"
                                    value={linkUrl}
                                    onChange={(e) => setLinkUrl(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            setLink();
                                        }
                                    }}
                                />
                            </div>
                            <div className="flex gap-2">
                                <Button onClick={setLink} className="flex-1">
                                    Add
                                </Button>
                                {editor.isActive('link') && (
                                    <Button
                                        onClick={unsetLink}
                                        variant="destructive"
                                    >
                                        Remove
                                    </Button>
                                )}
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
                <Dialog
                    open={imageDialogOpen}
                    onOpenChange={setImageDialogOpen}
                >
                    <DialogTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                        >
                            <ImageIcon className="h-4 w-4" />
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Image</DialogTitle>
                            <DialogDescription>
                                Upload an image from your device or enter a URL
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="image-file">Upload Image</Label>
                                <Input
                                    id="image-file"
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    disabled={uploading}
                                    className="cursor-pointer"
                                />
                                {imagePreview && (
                                    <div className="space-y-2">
                                        <div className="relative overflow-hidden rounded-lg border">
                                            <img
                                                src={imagePreview}
                                                alt="Preview"
                                                className="h-48 w-full bg-muted object-contain"
                                            />
                                        </div>
                                        <Button
                                            onClick={handleFileUpload}
                                            disabled={uploading}
                                            className="w-full"
                                        >
                                            {uploading
                                                ? 'Uploading...'
                                                : 'Upload Image'}
                                        </Button>
                                    </div>
                                )}
                                {uploading && (
                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between text-sm">
                                            <span className="text-muted-foreground">
                                                Uploading image...
                                            </span>
                                            <span className="text-muted-foreground">
                                                {Math.round(uploadProgress)}%
                                            </span>
                                        </div>
                                        <div className="h-2 w-full rounded-full bg-secondary">
                                            <div
                                                className="h-2 rounded-full bg-primary transition-all duration-300"
                                                style={{
                                                    width: `${uploadProgress}%`,
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">
                                        O
                                    </span>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="image-url">Image URL</Label>
                                <Input
                                    id="image-url"
                                    type="text"
                                    placeholder="https://example.com/image.jpg or data:image/..."
                                    value={imageUrl}
                                    onChange={(e) =>
                                        setImageUrl(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            addImage();
                                        }
                                    }}
                                    disabled={uploading}
                                />
                            </div>
                            <Button
                                onClick={addImage}
                                className="w-full"
                                disabled={!imageUrl || uploading}
                            >
                                Add from URL
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
                <div className="mx-1 h-6 w-px bg-border" />
                <Button
                    type="button"
                    variant={editor.isActive('codeBlock') ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() =>
                        editor.chain().focus().toggleCodeBlock().run()
                    }
                    className="h-8 w-8 p-0"
                    title="Code block"
                >
                    <Code2 className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant={editor.isActive('code') ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => editor.chain().focus().toggleCode().run()}
                    className="h-8 w-8 p-0"
                    title="Inline code"
                >
                    <Code className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant={editor.isActive('table') ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => {
                        if (editor.isActive('table')) {
                            editor.chain().focus().deleteTable().run();
                        } else {
                            editor
                                .chain()
                                .focus()
                                .insertTable({
                                    rows: 3,
                                    cols: 3,
                                    withHeaderRow: true,
                                })
                                .run();
                        }
                    }}
                    className="h-8 w-8 p-0"
                    title="Insertar/Eliminar tabla"
                >
                    <TableIcon className="h-4 w-4" />
                </Button>
                {editor.isActive('table') && (
                    <>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                                editor.chain().focus().addColumnBefore().run()
                            }
                            className="h-8 px-2 text-xs"
                            title="Add column before"
                        >
                            +C
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                                editor.chain().focus().addColumnAfter().run()
                            }
                            className="h-8 px-2 text-xs"
                            title="Agregar columna después"
                        >
                            C+
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                                editor.chain().focus().deleteColumn().run()
                            }
                            className="h-8 px-2 text-xs"
                            title="Eliminar columna"
                        >
                            -C
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                                editor.chain().focus().addRowBefore().run()
                            }
                            className="h-8 px-2 text-xs"
                            title="Agregar fila antes"
                        >
                            +F
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                                editor.chain().focus().addRowAfter().run()
                            }
                            className="h-8 px-2 text-xs"
                            title="Agregar fila después"
                        >
                            F+
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                                editor.chain().focus().deleteRow().run()
                            }
                            className="h-8 px-2 text-xs"
                            title="Remove row"
                        >
                            -F
                        </Button>
                    </>
                )}
                <div className="mx-1 h-6 w-px bg-border" />
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().undo().run()}
                    disabled={!editor.can().undo()}
                    className="h-8 w-8 p-0"
                >
                    <Undo className="h-4 w-4" />
                </Button>
                <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => editor.chain().focus().redo().run()}
                    disabled={!editor.can().redo()}
                    className="h-8 w-8 p-0"
                >
                    <Redo className="h-4 w-4" />
                </Button>
            </div>
            {/* Editor */}
            <EditorContent editor={editor} className="min-h-[300px]" />
            {/* Word Count */}
            {showWordCount && (
                <div className="flex items-center justify-between border-t bg-muted/30 p-2 text-xs text-muted-foreground">
                    <span>
                        {wordCount.words}{' '}
                        {wordCount.words === 1 ? 'palabra' : 'palabras'}
                    </span>
                    <span>
                        {wordCount.characters}{' '}
                        {wordCount.characters === 1 ? 'carácter' : 'caracteres'}
                    </span>
                </div>
            )}
        </div>
    );
}

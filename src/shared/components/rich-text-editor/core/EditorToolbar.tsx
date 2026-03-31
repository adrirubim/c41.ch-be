import { Button } from '#app/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '#app/components/ui/dialog';
import { Input } from '#app/components/ui/input';
import { Label } from '#app/components/ui/label';
import { Editor } from '@tiptap/react';
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

interface EditorToolbarProps {
    editor: Editor;
    linkDialogOpen: boolean;
    setLinkDialogOpen: (open: boolean) => void;
    linkUrl: string;
    setLinkUrl: (url: string) => void;
    imageDialogOpen: boolean;
    setImageDialogOpen: (open: boolean) => void;
    imageUrl: string;
    setImageUrl: (url: string) => void;
    uploading: boolean;
    uploadProgress: number;
    imagePreview: string | null;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    setLink: () => void;
    unsetLink: () => void;
    addImage: () => void;
    handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleFileUpload: () => Promise<void>;
}

export function EditorToolbar({
    editor,
    linkDialogOpen,
    setLinkDialogOpen,
    linkUrl,
    setLinkUrl,
    imageDialogOpen,
    setImageDialogOpen,
    imageUrl,
    setImageUrl,
    uploading,
    uploadProgress,
    imagePreview,
    fileInputRef,
    setLink,
    unsetLink,
    addImage,
    handleFileSelect,
    handleFileUpload,
}: EditorToolbarProps) {
    return (
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
                aria-label="Bold"
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
                variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
                size="sm"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className="h-8 w-8 p-0"
            >
                <List className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
                size="sm"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className="h-8 w-8 p-0"
            >
                <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
                type="button"
                variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
                size="sm"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className="h-8 w-8 p-0"
            >
                <Quote className="h-4 w-4" />
            </Button>
            <div className="mx-1 h-6 w-px bg-border" />
            <Dialog open={linkDialogOpen} onOpenChange={setLinkDialogOpen}>
                <DialogTrigger asChild>
                    <Button
                        type="button"
                        variant={editor.isActive('link') ? 'default' : 'ghost'}
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
                                placeholder="https://example.com"
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
            <Dialog open={imageDialogOpen} onOpenChange={setImageDialogOpen}>
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
                            {imagePreview !== null && imagePreview !== '' && (
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
                                        {uploading ? 'Uploading...' : 'Upload Image'}
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
                                            style={{ width: `${uploadProgress}%` }}
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
                                onChange={(e) => setImageUrl(e.target.value)}
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
                            disabled={
                                imageUrl === undefined ||
                                imageUrl === null ||
                                imageUrl === '' ||
                                uploading
                            }
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
                onClick={() => editor.chain().focus().toggleCodeBlock().run()}
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
                title="Insert or delete table"
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
                        title="Add column before current"
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
                        title="Add column after current"
                    >
                        C+
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().deleteColumn().run()}
                        className="h-8 px-2 text-xs"
                        title="Delete column"
                    >
                        -C
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().addRowBefore().run()}
                        className="h-8 px-2 text-xs"
                        title="Add row before current"
                    >
                        +F
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().addRowAfter().run()}
                        className="h-8 px-2 text-xs"
                        title="Add row after current"
                    >
                        F+
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => editor.chain().focus().deleteRow().run()}
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
    );
}


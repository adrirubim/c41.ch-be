import { useToast } from '#app/hooks/use-toast';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { Table } from '@tiptap/extension-table';
import { TableCell } from '@tiptap/extension-table-cell';
import { TableHeader } from '@tiptap/extension-table-header';
import { TableRow } from '@tiptap/extension-table-row';
import { useEditor, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useCallback, useRef, useState } from 'react';
import type {
    UploadImageResponse,
    UseRichTextEditorParams,
    WordCount,
} from '@shared/components/rich-text-editor/types';

interface UseRichTextEditorReturn {
    editor: Editor | null;
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
    wordCount: WordCount;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    setLink: () => void;
    unsetLink: () => void;
    addImage: () => void;
    handleFileSelect: (event: React.ChangeEvent<HTMLInputElement>) => void;
    handleFileUpload: () => Promise<void>;
}

export function useRichTextEditor({
    initialContent,
    onChange,
    uploadUrl,
}: UseRichTextEditorParams): UseRichTextEditorReturn {
    const [linkDialogOpen, setLinkDialogOpen] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [imageDialogOpen, setImageDialogOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState('');
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [wordCount, setWordCount] = useState<WordCount>({
        words: 0,
        characters: 0,
    });
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
        content: initialContent,
        onUpdate: ({ editor: editorInstance }) => {
            onChange(editorInstance.getHTML());
            const text = editorInstance.getText();
            const trimmedText = text.trim();
            const words =
                trimmedText !== undefined && trimmedText !== null && trimmedText !== ''
                    ? trimmedText.split(/\s+/).length
                    : 0;
            const characters = text.length;
            setWordCount({ words, characters });
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4 prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-pre:bg-muted',
            },
        },
    });

    const setLink = useCallback(() => {
        if (editor === null) {
            return;
        }
        if (linkUrl !== undefined && linkUrl !== null && linkUrl !== '') {
            editor.chain().focus().setLink({ href: linkUrl }).run();
            setLinkUrl('');
            setLinkDialogOpen(false);
        }
    }, [editor, linkUrl]);

    const unsetLink = useCallback(() => {
        if (editor === null) {
            return;
        }
        editor.chain().focus().unsetLink().run();
    }, [editor]);

    const addImage = useCallback(() => {
        if (editor === null) {
            return;
        }
        if (imageUrl !== undefined && imageUrl !== null && imageUrl !== '') {
            editor.chain().focus().setImage({ src: imageUrl }).run();
            setImageUrl('');
            setImageDialogOpen(false);
        }
    }, [editor, imageUrl]);

    const handleFileSelect = useCallback(
        (event: React.ChangeEvent<HTMLInputElement>) => {
            const file = event.target.files?.[0] ?? null;
            if (file === null) {
                return;
            }

            if (!file.type.startsWith('image/')) {
                addToast({
                    title: 'Error',
                    description: 'Please select a valid image file.',
                    variant: 'destructive',
                });
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                addToast({
                    title: 'Error',
                    description: 'The image must not exceed 5MB.',
                    variant: 'destructive',
                });
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const result = e.target?.result ?? null;
                if (typeof result === 'string') {
                    setImagePreview(result);
                }
            };
            reader.readAsDataURL(file);
        },
        [addToast],
    );

    const handleFileUpload = useCallback(async () => {
        const file = fileInputRef.current?.files?.[0] ?? null;
        if (file === null) {
            return;
        }

        setUploading(true);
        setUploadProgress(0);

        const formData = new FormData();
        formData.append('image', file);

        try {
            const xhr = new XMLHttpRequest();

            xhr.upload.addEventListener('progress', (e) => {
                if (e.lengthComputable) {
                    const percentComplete = (e.loaded / e.total) * 100;
                    setUploadProgress(percentComplete);
                }
            });

            const response = await new Promise<UploadImageResponse>(
                (resolve, reject) => {
                    xhr.addEventListener('load', () => {
                        if (xhr.status === 200) {
                            try {
                                const parsed = JSON.parse(
                                    xhr.responseText,
                                ) as UploadImageResponse;
                                resolve(parsed);
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

                    xhr.open('POST', uploadUrl);
                    const csrfTokenElement = document.querySelector(
                        'meta[name="csrf-token"]',
                    );
                    const csrfToken =
                        csrfTokenElement !== null
                            ? csrfTokenElement.getAttribute('content')
                            : null;
                    const csrfTokenValue =
                        csrfToken !== undefined &&
                        csrfToken !== null &&
                        csrfToken !== ''
                            ? csrfToken
                            : '';
                    xhr.setRequestHeader('X-CSRF-TOKEN', csrfTokenValue);
                    xhr.send(formData);
                },
            );

            if (editor === null) {
                return;
            }

            if (
                response.success === true &&
                response.url !== undefined &&
                response.url !== null &&
                response.url !== ''
            ) {
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
                const responseErrorMessage =
                    response.error !== undefined &&
                    response.error !== null &&
                    response.error !== ''
                        ? response.error
                        : 'Unknown error';
                throw new Error(responseErrorMessage);
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
            if (fileInputRef.current !== null) {
                fileInputRef.current.value = '';
            }
        }
    }, [addToast, editor, uploadUrl]);

    return {
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
        wordCount,
        fileInputRef,
        setLink,
        unsetLink,
        addImage,
        handleFileSelect,
        handleFileUpload,
    };
}


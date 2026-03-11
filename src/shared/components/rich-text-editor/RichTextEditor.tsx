import { useRichTextEditor } from '@shared/components/rich-text-editor/hooks/use-rich-text-editor';
import {
    EditorContent,
    EditorToolbar,
    EditorWordCount,
} from '@shared/components/rich-text-editor/core';
import type { RichTextEditorProps } from '@shared/components/rich-text-editor/types';

interface SharedRichTextEditorProps extends RichTextEditorProps {
    uploadUrl: string;
}

export function RichTextEditor({
    content,
    onChange,
    showWordCount = true,
    uploadUrl,
}: SharedRichTextEditorProps) {
    const {
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
    } = useRichTextEditor({
        initialContent: content,
        onChange,
        uploadUrl,
    });

    if (editor === null) {
        return null;
    }

    return (
        <div className="overflow-hidden rounded-lg border">
            <EditorToolbar
                editor={editor}
                linkDialogOpen={linkDialogOpen}
                setLinkDialogOpen={setLinkDialogOpen}
                linkUrl={linkUrl}
                setLinkUrl={setLinkUrl}
                imageDialogOpen={imageDialogOpen}
                setImageDialogOpen={setImageDialogOpen}
                imageUrl={imageUrl}
                setImageUrl={setImageUrl}
                uploading={uploading}
                uploadProgress={uploadProgress}
                imagePreview={imagePreview}
                fileInputRef={fileInputRef}
                setLink={setLink}
                unsetLink={unsetLink}
                addImage={addImage}
                handleFileSelect={handleFileSelect}
                handleFileUpload={handleFileUpload}
            />
            <EditorContent editor={editor} />
            {showWordCount === true && <EditorWordCount wordCount={wordCount} />}
        </div>
    );
}


import { EditorContent as TiptapEditorContent, Editor } from '@tiptap/react';

interface EditorContentProps {
    editor: Editor;
}

export function EditorContent({ editor }: EditorContentProps) {
    return <TiptapEditorContent editor={editor} className="min-h-[300px]" />;
}


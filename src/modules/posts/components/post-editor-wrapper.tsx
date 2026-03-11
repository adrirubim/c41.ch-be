import { RichTextEditor as SharedRichTextEditor } from '@shared/components/rich-text-editor/RichTextEditor';
import type { RichTextEditorProps } from '@shared/components/rich-text-editor/types';

export function PostEditorWrapper(props: RichTextEditorProps) {
    return <SharedRichTextEditor {...props} uploadUrl="/upload-image" />;
}


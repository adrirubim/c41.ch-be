export interface WordCount {
    words: number;
    characters: number;
}

export interface RichTextEditorProps {
    content: string;
    onChange: (content: string) => void;
    placeholder?: string;
    showWordCount?: boolean;
}

export interface UploadImageResponse {
    success: boolean;
    url?: string | null;
    error?: string | null;
}

export interface UseRichTextEditorParams {
    initialContent: string;
    onChange: (content: string) => void;
    uploadUrl: string;
}


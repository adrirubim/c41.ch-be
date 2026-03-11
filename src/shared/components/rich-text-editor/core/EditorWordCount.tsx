import type { WordCount } from '@shared/components/rich-text-editor/types';

interface EditorWordCountProps {
    wordCount: WordCount;
}

export function EditorWordCount({ wordCount }: EditorWordCountProps) {
    const isSingleWord = wordCount.words === 1;
    const isSingleCharacter = wordCount.characters === 1;

    return (
        <div className="flex items-center justify-between border-t bg-muted/30 p-2 text-xs text-muted-foreground">
            <span>
                {wordCount.words} {isSingleWord ? 'word' : 'words'}
            </span>
            <span>
                {wordCount.characters}{' '}
                {isSingleCharacter ? 'character' : 'characters'}
            </span>
        </div>
    );
}


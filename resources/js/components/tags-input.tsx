import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X } from 'lucide-react';
import { KeyboardEvent, useState } from 'react';

interface TagsInputProps {
    tags: string[];
    onChange: (tags: string[]) => void;
    placeholder?: string;
    maxTags?: number;
}

export function TagsInput({
    tags,
    onChange,
    placeholder = 'Type and press Enter to add...',
    maxTags = 10,
}: TagsInputProps) {
    const [inputValue, setInputValue] = useState('');

    const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && inputValue.trim()) {
            e.preventDefault();
            const newTag = inputValue.trim().toLowerCase();

            // Avoid duplicates
            if (!tags.includes(newTag) && tags.length < maxTags) {
                onChange([...tags, newTag]);
                setInputValue('');
            }
        } else if (e.key === 'Backspace' && !inputValue && tags.length > 0) {
            // Remove last tag if input is empty
            onChange(tags.slice(0, -1));
        }
    };

    const removeTag = (tagToRemove: string) => {
        onChange(tags.filter((tag) => tag !== tagToRemove));
    };

    return (
        <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex min-h-[42px] flex-wrap items-center gap-2 rounded-md border p-2">
                {tags.map((tag, index) => (
                    <Badge
                        key={index}
                        variant="secondary"
                        className="flex items-center gap-1"
                    >
                        {tag}
                        <button
                            type="button"
                            onClick={() => removeTag(tag)}
                            className="ml-1 rounded-full p-0.5 hover:bg-destructive/20"
                        >
                            <X className="h-3 w-3" />
                        </button>
                    </Badge>
                ))}
                <Input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={
                        tags.length >= maxTags
                            ? `Maximum ${maxTags} tags`
                            : placeholder
                    }
                    disabled={tags.length >= maxTags}
                    className="h-auto min-w-[150px] flex-1 border-0 p-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
            </div>
            <p className="text-xs text-muted-foreground">
                {tags.length}/{maxTags} tags. Press Enter to add.
            </p>
        </div>
    );
}

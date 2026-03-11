interface HeadingProps {
    title: string;
    description?: string;
}

export default function Heading({ title, description }: HeadingProps) {
    return (
        <div className="mb-8 space-y-0.5">
            <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
            {typeof description === 'string' && description.trim() !== '' && (
                <p className="text-sm text-muted-foreground">{description}</p>
            )}
        </div>
    );
}

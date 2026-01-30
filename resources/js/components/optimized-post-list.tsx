import { Link } from '@/components/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { CheckCircle, Edit, Eye, Star, Trash2, XCircle } from 'lucide-react';
import { memo, useMemo } from 'react';

interface Post {
    id: number;
    title: string;
    slug: string;
    published: boolean;
    featured: boolean;
    views_count: number;
    created_at: string;
    user: {
        id: number;
        name: string;
        email: string;
    };
    categories: Array<{
        id: number;
        name: string;
        slug: string;
        color?: string;
    }>;
}

interface OptimizedPostItemProps {
    post: Post;
    onDeleteClick: (postId: number, postTitle: string) => void;
}

// Memoized post item component to prevent unnecessary re-renders
const OptimizedPostItem = memo(
    function OptimizedPostItem({
        post,
        onDeleteClick,
    }: OptimizedPostItemProps) {
        const formattedDate = useMemo(() => {
            return new Date(post.created_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
            });
        }, [post.created_at]);

        return (
            <div
                className={cn(
                    'flex flex-col rounded-lg border p-4 sm:flex-row sm:items-start sm:justify-between',
                    'transition-smooth card-hover animate-fade-in gap-4 hover:bg-accent/50',
                )}
            >
                <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-start justify-between gap-2">
                        <div className="flex-1">
                            <Link
                                href={`/posts/${post.id}`}
                                className="font-semibold hover:underline"
                            >
                                {post.title}
                            </Link>
                        </div>
                        <div className="flex flex-shrink-0 items-center gap-2">
                            {post.featured && (
                                <Star
                                    className="h-4 w-4 fill-yellow-500 text-yellow-500"
                                    aria-label="Featured post"
                                />
                            )}
                            {post.published ? (
                                <CheckCircle
                                    className="h-4 w-4 text-green-500"
                                    aria-label="Published"
                                />
                            ) : (
                                <XCircle
                                    className="h-4 w-4 text-gray-400"
                                    aria-label="Draft"
                                />
                            )}
                        </div>
                    </div>

                    <div className="mb-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                        <span>By {post.user.name}</span>
                        <span>•</span>
                        <span>{formattedDate}</span>
                        <span>•</span>
                        <span>{post.views_count} views</span>
                    </div>

                    {post.categories && post.categories.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {post.categories.map((cat) => (
                                <Badge
                                    key={cat.id}
                                    variant="outline"
                                    className={cat.color ? 'font-medium' : ''}
                                    style={
                                        cat.color
                                            ? {
                                                  borderColor: cat.color,
                                                  color: cat.color,
                                                  backgroundColor: `${cat.color}15`,
                                              }
                                            : undefined
                                    }
                                >
                                    {cat.name}
                                </Badge>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex items-center justify-end gap-2 sm:ml-4 sm:justify-start">
                    <Link href={`/posts/${post.id}`}>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9"
                            aria-label={`View post: ${post.title}`}
                        >
                            <Eye className="h-4 w-4" aria-hidden="true" />
                        </Button>
                    </Link>
                    <Link href={`/posts/${post.id}/edit`}>
                        <Button
                            variant="outline"
                            size="icon"
                            className="h-9 w-9"
                            aria-label={`Edit post: ${post.title}`}
                        >
                            <Edit className="h-4 w-4" aria-hidden="true" />
                        </Button>
                    </Link>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onDeleteClick(post.id, post.title)}
                        className="h-9 w-9 text-destructive hover:text-destructive"
                        aria-label={`Delete post: ${post.title}`}
                    >
                        <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </Button>
                </div>
            </div>
        );
    },
    (prevProps, nextProps) => {
        // Custom comparison function for memo
        return (
            prevProps.post.id === nextProps.post.id &&
            prevProps.post.title === nextProps.post.title &&
            prevProps.post.published === nextProps.post.published &&
            prevProps.post.featured === nextProps.post.featured &&
            prevProps.post.views_count === nextProps.post.views_count &&
            prevProps.post.created_at === nextProps.post.created_at &&
            JSON.stringify(prevProps.post.categories) ===
                JSON.stringify(nextProps.post.categories)
        );
    },
);

interface OptimizedPostListProps {
    posts: Post[];
    onDeleteClick: (postId: number, postTitle: string) => void;
}

export function OptimizedPostList({
    posts,
    onDeleteClick,
}: OptimizedPostListProps) {
    // Use useMemo to memoize the list rendering
    const memoizedPosts = useMemo(() => {
        return posts.map((post) => (
            <OptimizedPostItem
                key={post.id}
                post={post}
                onDeleteClick={onDeleteClick}
            />
        ));
    }, [posts, onDeleteClick]);

    return <div className="space-y-4">{memoizedPosts}</div>;
}

import { Link } from '#app/components/link';
import { SafeHtml } from '#app/components/safe-html';
import { Badge } from '#app/components/ui/badge';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '#app/components/ui/card';
import { ArrowLeft, Calendar, Edit, Eye, Star, User } from 'lucide-react';
import type { PostsShowPost } from '@modules/posts/hooks/use-posts-show-page';
import type { PostsShowViewModel } from '@modules/posts/hooks/use-posts-show-page';

interface PostsShowLayoutProps {
    post: PostsShowPost;
    viewModel: PostsShowViewModel;
}

export function PostsShowLayout({ post, viewModel }: PostsShowLayoutProps) {
    return (
        <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">{post.title}</h1>
                    <p className="text-muted-foreground">Post details</p>
                </div>
                <div className="flex items-center gap-2">
                    <Link href={`/posts/${post.id}/edit`}>
                        <Badge variant="outline" className="px-3 py-2">
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                        </Badge>
                    </Link>
                    <Link href="/posts">
                        <Badge variant="outline" className="px-3 py-2">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Badge>
                    </Link>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="space-y-6 md:col-span-2">
                    <Card>
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <CardTitle className="flex items-center gap-2">
                                        {post.title}
                                        {post.featured && (
                                            <Star className="h-5 w-5 fill-yellow-500 text-yellow-500" />
                                        )}
                                    </CardTitle>
                                    <CardDescription className="mt-2">
                                        {post.excerpt !== null &&
                                        post.excerpt !== undefined &&
                                        post.excerpt !== ''
                                            ? post.excerpt
                                            : 'No excerpt'}
                                    </CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <SafeHtml
                                className="prose dark:prose-invert max-w-none"
                                html={viewModel.contentHtml}
                            />
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2 text-sm">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                    Author:
                                </span>
                                <span className="font-medium">
                                    {post.user.name}
                                </span>
                            </div>

                            <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                    Created:
                                </span>
                                <span className="font-medium">
                                    {new Date(
                                        post.created_at,
                                    ).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit',
                                    })}
                                </span>
                            </div>

                            {post.published_at !== null &&
                                post.published_at !== undefined &&
                                post.published_at !== '' && (
                                    <div className="flex items-center gap-2 text-sm">
                                        <Calendar className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-muted-foreground">
                                            Published:
                                        </span>
                                        <span className="font-medium">
                                            {new Date(
                                                post.published_at,
                                            ).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric',
                                                hour: '2-digit',
                                                minute: '2-digit',
                                            })}
                                        </span>
                                    </div>
                                )}

                            <div className="flex items-center gap-2 text-sm">
                                <Eye className="h-4 w-4 text-muted-foreground" />
                                <span className="text-muted-foreground">
                                    Views:
                                </span>
                                <span className="font-medium">
                                    {post.views_count.toLocaleString()}
                                </span>
                            </div>

                            <div className="border-t pt-2">
                                <span className="mb-2 block text-sm text-muted-foreground">
                                    Status:
                                </span>
                                {post.published ? (
                                    <Badge
                                        variant="outline"
                                        className="border-green-500/20 bg-green-500/10 text-green-600"
                                    >
                                        Published
                                    </Badge>
                                ) : (
                                    <Badge variant="outline">Draft</Badge>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {post.categories.length > 0 && (
                        <Card>
                            <CardHeader>
                                <CardTitle>Categories</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {post.categories.map((category) => (
                                        <Badge
                                            key={category.id}
                                            variant="outline"
                                            className={
                                                category.color !== null &&
                                                category.color !== undefined &&
                                                category.color !== ''
                                                    ? 'font-medium'
                                                    : ''
                                            }
                                            style={
                                                category.color !== null &&
                                                category.color !== undefined &&
                                                category.color !== ''
                                                    ? {
                                                          borderColor:
                                                              category.color,
                                                          color: category.color,
                                                          backgroundColor: `${category.color}15`,
                                                      }
                                                    : undefined
                                            }
                                        >
                                            {category.name}
                                        </Badge>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    );
}


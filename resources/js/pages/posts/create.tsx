import { EditorPreview } from '@/components/editor-preview';
import InputError from '@/components/input-error';
import { Link } from '@/components/link';
import { RichTextEditor } from '@/components/rich-text-editor';
import { TagsInput } from '@/components/tags-input';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { ArrowLeft, Save } from 'lucide-react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
    {
        title: 'Posts',
        href: '/posts',
    },
    {
        title: 'Create Post',
        href: '/posts/create',
    },
];

interface Category {
    id: number;
    name: string;
    slug: string;
    color?: string;
}

interface User {
    id: number;
    name: string;
    email: string;
}

interface PostsCreateProps {
    categories: Category[];
    users: User[];
    defaultUserId?: number;
}

export default function PostsCreate({
    categories,
    users,
    defaultUserId,
}: PostsCreateProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        published: false,
        published_at: '',
        user_id: defaultUserId ? String(defaultUserId) : '',
        category: '',
        tags: [] as string[],
        featured: false,
        categories: [] as number[],
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/posts', {
            preserveScroll: true,
            onSuccess: () => {
                reset();
            },
        });
    };

    const generateSlug = (title: string) => {
        return title
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Create Post" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Create New Post</h1>
                        <p className="text-sm text-muted-foreground sm:text-base">
                            Complete the form to create a new post
                        </p>
                    </div>
                    <Link href="/posts" className="w-full sm:w-auto">
                        <Button variant="outline" className="w-full sm:w-auto">
                            <ArrowLeft className="h-4 w-4 sm:mr-2" />
                            Back
                        </Button>
                    </Link>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 md:grid-cols-3">
                        {/* Main Form */}
                        <div className="space-y-6 md:col-span-2">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Basic Information</CardTitle>
                                    <CardDescription>
                                        Main post data
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title">Title *</Label>
                                        <Input
                                            id="title"
                                            value={data.title}
                                            onChange={(e) => {
                                                setData(
                                                    'title',
                                                    e.target.value,
                                                );
                                                if (
                                                    !data.slug ||
                                                    data.slug ===
                                                        generateSlug(data.title)
                                                ) {
                                                    setData(
                                                        'slug',
                                                        generateSlug(
                                                            e.target.value,
                                                        ),
                                                    );
                                                }
                                            }}
                                            placeholder="Post title"
                                            required
                                        />
                                        <InputError message={errors.title} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="slug">Slug *</Label>
                                        <Input
                                            id="slug"
                                            value={data.slug}
                                            onChange={(e) =>
                                                setData('slug', e.target.value)
                                            }
                                            placeholder="friendly-url-for-post"
                                            required
                                        />
                                        <InputError message={errors.slug} />
                                        <p className="text-xs text-muted-foreground">
                                            Friendly URL for the post.
                                            Automatically generated from the
                                            title.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="excerpt">Excerpt</Label>
                                        <Textarea
                                            id="excerpt"
                                            value={data.excerpt}
                                            onChange={(e) =>
                                                setData(
                                                    'excerpt',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="Brief description of the post..."
                                            rows={3}
                                            maxLength={500}
                                        />
                                        <InputError message={errors.excerpt} />
                                        <p className="text-xs text-muted-foreground">
                                            {data.excerpt.length}/500 characters
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                            <Label htmlFor="content">
                                                Content
                                            </Label>
                                            <EditorPreview
                                                content={data.content}
                                                title={data.title}
                                                excerpt={data.excerpt}
                                            />
                                        </div>
                                        <RichTextEditor
                                            content={data.content}
                                            onChange={(content) =>
                                                setData('content', content)
                                            }
                                            placeholder="Write your post content here..."
                                        />
                                        <InputError message={errors.content} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Settings</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="user_id">
                                            Author *
                                        </Label>
                                        <Select
                                            value={String(data.user_id)}
                                            onValueChange={(value) =>
                                                setData('user_id', value)
                                            }
                                        >
                                            <SelectTrigger id="user_id">
                                                <SelectValue placeholder="Select author" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {users.map((user) => (
                                                    <SelectItem
                                                        key={user.id}
                                                        value={String(user.id)}
                                                    >
                                                        {user.name} (
                                                        {user.email})
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <InputError message={errors.user_id} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="category">
                                            Category
                                        </Label>
                                        <Input
                                            id="category"
                                            value={data.category}
                                            onChange={(e) =>
                                                setData(
                                                    'category',
                                                    e.target.value,
                                                )
                                            }
                                            placeholder="e.g., Technology"
                                        />
                                        <InputError message={errors.category} />
                                    </div>

                                    <div className="space-y-2">
                                        <Label>Categories</Label>
                                        <div className="max-h-48 space-y-2 overflow-y-auto">
                                            {categories.map((category) => (
                                                <div
                                                    key={category.id}
                                                    className="flex items-center space-x-2"
                                                >
                                                    <Checkbox
                                                        id={`category-${category.id}`}
                                                        checked={data.categories.includes(
                                                            category.id,
                                                        )}
                                                        onCheckedChange={(
                                                            checked,
                                                        ) => {
                                                            if (checked) {
                                                                setData(
                                                                    'categories',
                                                                    [
                                                                        ...data.categories,
                                                                        category.id,
                                                                    ],
                                                                );
                                                            } else {
                                                                setData(
                                                                    'categories',
                                                                    data.categories.filter(
                                                                        (id) =>
                                                                            id !==
                                                                            category.id,
                                                                    ),
                                                                );
                                                            }
                                                        }}
                                                    />
                                                    <Label
                                                        htmlFor={`category-${category.id}`}
                                                        className="flex cursor-pointer items-center gap-2"
                                                    >
                                                        <div
                                                            className="h-3 w-3 rounded-full"
                                                            style={{
                                                                backgroundColor:
                                                                    category.color ||
                                                                    '#6B7280',
                                                            }}
                                                        />
                                                        {category.name}
                                                    </Label>
                                                </div>
                                            ))}
                                        </div>
                                        <InputError
                                            message={errors.categories}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <TagsInput
                                            tags={data.tags}
                                            onChange={(tags) =>
                                                setData('tags', tags)
                                            }
                                            placeholder="Add tags..."
                                            maxTags={10}
                                        />
                                        <InputError message={errors.tags} />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Status</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="published"
                                            checked={data.published}
                                            onCheckedChange={(checked) => {
                                                setData(
                                                    'published',
                                                    checked as boolean,
                                                );
                                                if (
                                                    checked &&
                                                    !data.published_at
                                                ) {
                                                    setData(
                                                        'published_at',
                                                        new Date()
                                                            .toISOString()
                                                            .slice(0, 16),
                                                    );
                                                }
                                            }}
                                        />
                                        <Label
                                            htmlFor="published"
                                            className="cursor-pointer"
                                        >
                                            Published
                                        </Label>
                                    </div>

                                    {data.published && (
                                        <div className="space-y-2">
                                            <Label htmlFor="published_at">
                                                Publication date
                                            </Label>
                                            <Input
                                                id="published_at"
                                                type="datetime-local"
                                                value={data.published_at}
                                                onChange={(e) =>
                                                    setData(
                                                        'published_at',
                                                        e.target.value,
                                                    )
                                                }
                                            />
                                            <InputError
                                                message={errors.published_at}
                                            />
                                        </div>
                                    )}

                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="featured"
                                            checked={data.featured}
                                            onCheckedChange={(checked) =>
                                                setData(
                                                    'featured',
                                                    checked as boolean,
                                                )
                                            }
                                        />
                                        <Label
                                            htmlFor="featured"
                                            className="cursor-pointer"
                                        >
                                            Featured
                                        </Label>
                                    </div>
                                </CardContent>
                            </Card>

                            <div className="flex gap-2">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1"
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing ? 'Saving...' : 'Save Post'}
                                </Button>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </AppLayout>
    );
}

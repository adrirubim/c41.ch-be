import { Link } from '@/components/link';
import { PublicHeader } from '@/components/public-header';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { withBasePath } from '@/lib/utils';
import { Head, router, useForm } from '@inertiajs/react';
import {
    ArrowLeft,
    Calendar,
    Eye,
    Search,
    Star,
    Tag,
    User,
} from 'lucide-react';

interface Post {
    id: number;
    title: string;
    slug: string;
    excerpt?: string;
    published_at: string;
    views_count: number;
    featured: boolean;
    user: {
        id: number;
        name: string;
    };
    categories: Array<{
        id: number;
        name: string;
        slug: string;
        color?: string;
    }>;
}

interface Category {
    id: number;
    name: string;
    slug: string;
    color?: string;
    description?: string;
}

interface CategoryProps {
    category: Category;
    posts: {
        data: Post[];
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    categories: Category[];
    filters: {
        search?: string;
        sort_by?: string;
        sort_order?: string;
        per_page?: number;
    };
}

function formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
}

export default function CategoryPage({
    category,
    posts,
    filters,
}: CategoryProps) {
    const { data, setData } = useForm({
        search: filters.search || '',
        sort_by: filters.sort_by || 'published_at',
        sort_order: filters.sort_order || 'desc',
        per_page: String(filters.per_page || 12),
    });

    const handleFilter = () => {
        const params: Record<string, string> = {};
        if (data.search) params.search = data.search;
        if (data.sort_by !== 'published_at') params.sort_by = data.sort_by;
        if (data.sort_order !== 'desc') params.sort_order = data.sort_order;
        if (data.per_page !== '12') params.per_page = data.per_page;

        router.get(withBasePath(`/categories/${category.slug}`), params, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    return (
        <>
            <Head title={`${category.name} - C41.ch Blog`}>
                <meta
                    name="description"
                    content={
                        category.description ||
                        `Posts in ${category.name} category`
                    }
                />
            </Head>

            <div className="flex min-h-screen flex-col bg-background">
                <PublicHeader />

                <main className="flex-1">
                    {/* Category Header */}
                    <section className="border-b bg-gradient-to-br from-primary/5 via-background to-primary/5 py-12 md:py-16">
                        <div className="container mx-auto px-4 md:max-w-7xl">
                            <Link href="/categories">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="mb-6"
                                >
                                    <ArrowLeft className="mr-2 h-4 w-4" />
                                    All Categories
                                </Button>
                            </Link>
                            <div className="flex items-center gap-4">
                                <div
                                    className="flex h-16 w-16 items-center justify-center rounded-lg"
                                    style={{
                                        backgroundColor: category.color
                                            ? `${category.color}20`
                                            : undefined,
                                    }}
                                >
                                    <Tag
                                        className="h-8 w-8"
                                        style={{
                                            color: category.color || undefined,
                                        }}
                                    />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                                        {category.name}
                                    </h1>
                                    {category.description && (
                                        <p className="mt-2 text-lg text-muted-foreground">
                                            {category.description}
                                        </p>
                                    )}
                                    <p className="mt-2 text-sm text-muted-foreground">
                                        {posts.total}{' '}
                                        {posts.total === 1 ? 'post' : 'posts'}{' '}
                                        in this category
                                    </p>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Filters Section */}
                    <section className="border-b bg-muted/30 py-8">
                        <div className="container mx-auto px-4 md:max-w-7xl">
                            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
                                <div className="md:col-span-2">
                                    <div className="relative">
                                        <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                        <Input
                                            placeholder="Search posts..."
                                            value={data.search}
                                            onChange={(e) =>
                                                setData(
                                                    'search',
                                                    e.target.value,
                                                )
                                            }
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    handleFilter();
                                                }
                                            }}
                                            className="pl-9"
                                        />
                                    </div>
                                </div>
                                <Select
                                    value={data.sort_by}
                                    onValueChange={(value) =>
                                        setData('sort_by', value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="published_at">
                                            Date
                                        </SelectItem>
                                        <SelectItem value="views_count">
                                            Views
                                        </SelectItem>
                                        <SelectItem value="title">
                                            Title
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button
                                    onClick={handleFilter}
                                    className="w-full"
                                >
                                    Apply Filters
                                </Button>
                            </div>
                        </div>
                    </section>

                    {/* Posts Grid */}
                    <section className="py-12 md:py-16">
                        <div className="container mx-auto px-4 md:max-w-7xl">
                            {posts.data.length > 0 ? (
                                <>
                                    <div className="mb-6">
                                        <p className="text-sm text-muted-foreground">
                                            Showing {posts.data.length} of{' '}
                                            {posts.total} posts
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                        {posts.data.map((post) => (
                                            <Card
                                                key={post.id}
                                                className="group transition-shadow hover:shadow-lg"
                                            >
                                                <CardHeader>
                                                    <div className="flex items-start justify-between gap-2">
                                                        <CardTitle className="line-clamp-2 transition-colors group-hover:text-primary">
                                                            <Link
                                                                href={`/blog/${post.slug}`}
                                                            >
                                                                {post.title}
                                                            </Link>
                                                        </CardTitle>
                                                        {post.featured && (
                                                            <Star className="h-5 w-5 flex-shrink-0 text-yellow-500" />
                                                        )}
                                                    </div>
                                                    <CardDescription className="line-clamp-2">
                                                        {post.excerpt ||
                                                            'No excerpt available'}
                                                    </CardDescription>
                                                </CardHeader>
                                                <CardContent>
                                                    <div className="mb-4 flex flex-wrap items-center gap-2">
                                                        {post.categories
                                                            .slice(0, 2)
                                                            .map((cat) => (
                                                                <Link
                                                                    key={cat.id}
                                                                    href={`/categories/${cat.slug}`}
                                                                >
                                                                    <Badge
                                                                        variant="secondary"
                                                                        style={{
                                                                            backgroundColor:
                                                                                cat.color
                                                                                    ? `${cat.color}20`
                                                                                    : undefined,
                                                                            borderColor:
                                                                                cat.color ||
                                                                                undefined,
                                                                        }}
                                                                        className="transition-opacity hover:opacity-80"
                                                                    >
                                                                        {
                                                                            cat.name
                                                                        }
                                                                    </Badge>
                                                                </Link>
                                                            ))}
                                                    </div>
                                                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                                                        <div className="flex items-center gap-4">
                                                            <span className="flex items-center gap-1">
                                                                <User className="h-4 w-4" />
                                                                {post.user.name}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <Calendar className="h-4 w-4" />
                                                                {formatDate(
                                                                    post.published_at,
                                                                )}
                                                            </span>
                                                        </div>
                                                        <span className="flex items-center gap-1">
                                                            <Eye className="h-4 w-4" />
                                                            {post.views_count}
                                                        </span>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>

                                    {/* Pagination */}
                                    {posts.last_page > 1 && (
                                        <div className="mt-12 flex items-center justify-center gap-2">
                                            {posts.links.map((link, index) => {
                                                if (link.url === null) {
                                                    return (
                                                        <span
                                                            key={index}
                                                            className="px-3 py-2 text-sm text-muted-foreground"
                                                            dangerouslySetInnerHTML={{
                                                                __html: link.label,
                                                            }}
                                                        />
                                                    );
                                                }
                                                return (
                                                    <Link
                                                        key={index}
                                                        href={link.url || '#'}
                                                        className={`rounded-md px-3 py-2 text-sm transition-colors ${
                                                            link.active
                                                                ? 'bg-primary text-primary-foreground'
                                                                : 'bg-background hover:bg-muted'
                                                        }`}
                                                        dangerouslySetInnerHTML={{
                                                            __html: link.label,
                                                        }}
                                                    />
                                                );
                                            })}
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="py-16 text-center">
                                    <p className="text-lg text-muted-foreground">
                                        No posts found in this category.
                                    </p>
                                    <Link
                                        href="/blog"
                                        className="mt-4 inline-block"
                                    >
                                        <Button variant="outline">
                                            Browse All Posts
                                        </Button>
                                    </Link>
                                </div>
                            )}
                        </div>
                    </section>
                </main>

                {/* Footer */}
                <footer className="border-t bg-muted/30 py-12">
                    <div className="container mx-auto px-4 md:max-w-7xl">
                        <div className="text-center text-sm text-muted-foreground">
                            <p>
                                &copy; {new Date().getFullYear()} C41.ch Blog.
                                All rights reserved.
                            </p>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}

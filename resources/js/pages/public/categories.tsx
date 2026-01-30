import { Link } from '@/components/link';
import { PublicHeader } from '@/components/public-header';
import {
    Card,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Head } from '@inertiajs/react';
import { ArrowRight, Tag } from 'lucide-react';

interface Category {
    id: number;
    name: string;
    slug: string;
    color?: string;
    description?: string;
    posts_count: number;
}

interface CategoriesProps {
    categories: Category[];
}

export default function Categories({ categories }: CategoriesProps) {
    return (
        <>
            <Head title="Categories - C41.ch Blog">
                <meta name="description" content="Browse all blog categories" />
            </Head>

            <div className="flex min-h-screen flex-col bg-background">
                <PublicHeader />

                <main className="flex-1">
                    {/* Header */}
                    <section className="border-b bg-gradient-to-br from-primary/5 via-background to-primary/5 py-12 md:py-16">
                        <div className="container mx-auto px-4 md:max-w-7xl">
                            <div className="mx-auto max-w-3xl text-center">
                                <h1 className="mb-4 text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
                                    Categories
                                </h1>
                                <p className="text-lg text-muted-foreground">
                                    Explore content by topic
                                </p>
                            </div>
                        </div>
                    </section>

                    {/* Categories Grid */}
                    <section className="py-12 md:py-16">
                        <div className="container mx-auto px-4 md:max-w-7xl">
                            {categories.length > 0 ? (
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                                    {categories.map((category) => (
                                        <Link
                                            key={category.id}
                                            href={`/categories/${category.slug}`}
                                        >
                                            <Card className="group h-full transition-all hover:scale-105 hover:shadow-lg">
                                                <CardHeader>
                                                    <div className="flex items-center gap-4">
                                                        <div
                                                            className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-lg"
                                                            style={{
                                                                backgroundColor:
                                                                    category.color
                                                                        ? `${category.color}20`
                                                                        : undefined,
                                                            }}
                                                        >
                                                            <Tag
                                                                className="h-8 w-8"
                                                                style={{
                                                                    color:
                                                                        category.color ||
                                                                        undefined,
                                                                }}
                                                            />
                                                        </div>
                                                        <div className="min-w-0 flex-1">
                                                            <CardTitle className="line-clamp-1 text-lg transition-colors group-hover:text-primary">
                                                                {category.name}
                                                            </CardTitle>
                                                            <CardDescription>
                                                                {
                                                                    category.posts_count
                                                                }{' '}
                                                                {category.posts_count ===
                                                                1
                                                                    ? 'post'
                                                                    : 'posts'}
                                                            </CardDescription>
                                                        </div>
                                                        <ArrowRight className="h-5 w-5 flex-shrink-0 text-muted-foreground transition-colors group-hover:text-primary" />
                                                    </div>
                                                    {category.description && (
                                                        <CardDescription className="mt-2 line-clamp-2">
                                                            {
                                                                category.description
                                                            }
                                                        </CardDescription>
                                                    )}
                                                </CardHeader>
                                            </Card>
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="py-16 text-center">
                                    <p className="text-lg text-muted-foreground">
                                        No categories available.
                                    </p>
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

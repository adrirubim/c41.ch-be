import InputError from '@/components/input-error';
import { Link } from '@/components/link';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
        title: 'Categories',
        href: '/dashboard/categories',
    },
    {
        title: 'Edit Category',
        href: '/dashboard/categories/edit',
    },
];

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string | null;
    color: string | null;
}

interface CategoriesEditProps {
    category: Category;
}

export default function CategoriesEdit({ category }: CategoriesEditProps) {
    const { data, setData, put, processing, errors } = useForm({
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || '',
        color: category.color || '#3B82F6',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/dashboard/categories/${category.id}`, {
            preserveScroll: true,
        });
    };

    const generateSlug = (name: string) => {
        return name
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/(^-|-$)/g, '');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={`Edit: ${category.name}`} />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto rounded-xl p-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Edit Category</h1>
                        <p className="text-muted-foreground">
                            Modify the category information
                        </p>
                    </div>
                    <Link href="/dashboard/categories">
                        <Button variant="outline">
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            Back
                        </Button>
                    </Link>
                </div>

                <form onSubmit={handleSubmit}>
                    <Card className="max-w-2xl">
                        <CardHeader>
                            <CardTitle>Category Information</CardTitle>
                            <CardDescription>
                                Main category data
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={(e) => {
                                        setData('name', e.target.value);
                                        if (
                                            !data.slug ||
                                            data.slug ===
                                                generateSlug(data.name)
                                        ) {
                                            setData(
                                                'slug',
                                                generateSlug(e.target.value),
                                            );
                                        }
                                    }}
                                    placeholder="e.g., Technology"
                                    required
                                />
                                <InputError message={errors.name} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="slug">Slug *</Label>
                                <Input
                                    id="slug"
                                    value={data.slug}
                                    onChange={(e) =>
                                        setData('slug', e.target.value)
                                    }
                                    placeholder="e.g-technology"
                                    required
                                />
                                <InputError message={errors.slug} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) =>
                                        setData('description', e.target.value)
                                    }
                                    placeholder="Category description..."
                                    rows={4}
                                />
                                <InputError message={errors.description} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="color">Color</Label>
                                <div className="flex items-center gap-3">
                                    <Input
                                        id="color"
                                        type="color"
                                        value={data.color}
                                        onChange={(e) =>
                                            setData('color', e.target.value)
                                        }
                                        className="h-10 w-20 cursor-pointer"
                                    />
                                    <Input
                                        type="text"
                                        value={data.color}
                                        onChange={(e) =>
                                            setData('color', e.target.value)
                                        }
                                        placeholder="#3B82F6"
                                        pattern="^#[0-9A-Fa-f]{6}$"
                                        className="flex-1"
                                    />
                                </div>
                                <InputError message={errors.color} />
                                <p className="text-xs text-muted-foreground">
                                    Hexadecimal color to identify the category
                                    (e.g., #3B82F6)
                                </p>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button
                                    type="submit"
                                    disabled={processing}
                                    className="flex-1"
                                >
                                    <Save className="mr-2 h-4 w-4" />
                                    {processing
                                        ? 'Saving...'
                                        : 'Update Category'}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </form>
            </div>
        </AppLayout>
    );
}

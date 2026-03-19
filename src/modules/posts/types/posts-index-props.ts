export interface PostsIndexPost {
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

export interface PostsIndexCategory {
    id: number;
    name: string;
    slug: string;
    color?: string;
}

export interface PostsIndexProps {
    posts: {
        data: PostsIndexPost[];
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
    categories: PostsIndexCategory[];
    filters: {
        search?: string;
        category?: string;
        published?: string;
        featured?: string;
        sort_by?: string;
        sort_order?: string;
        per_page?: string | number;
    };
}


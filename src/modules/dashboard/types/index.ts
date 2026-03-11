export interface PostSummary {
    id: number;
    title: string;
    slug: string;
    published: boolean;
    featured: boolean;
    views_count: number;
    created_at: string;
    published_at?: string | null;
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

export interface CategoryDistribution {
    id: number;
    name: string;
    slug: string;
    color: string;
    posts_count: number;
}

export interface DashboardStats {
    totalPosts: number;
    publishedPosts: number;
    featuredPosts: number;
    categories: number;
    totalViews: number;
    usersCount: number;
    averageViews: number;
    postsThisMonth: number;
}

export interface DashboardProps {
    stats: DashboardStats;
    recentPosts: PostSummary[];
    popularPosts: PostSummary[];
    categoriesDistribution: CategoryDistribution[];
    lastPublishedPost: PostSummary | null;
}


export interface FilterPreset {
    id: string;
    name: string;
    filters: Record<string, unknown>;
    createdAt: Date;
}


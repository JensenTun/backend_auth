export interface ProjectDocument {
    id?: string;
    title: string;
    slug: string;
    tagline: string;
    description: string;
    category: string;
    teachStack: string[];
    featured: string;
    thumbnailUrl: string;
    demoUrl?: string;
    githubUrl?: string;
    caseStudy?: {
        challenge: string;
        solution: string;
        highlights: string[];
    };
    order: number;
    createdAt?: string;
}

export interface SkillDocument {
    id?: string;
    name: string;
    category: string;
    iconUrl?: string;
    isFeatured: boolean;
}
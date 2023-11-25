export interface Post {
    slug: string;
    header: PostHeader;
}

export interface TocEntry {
    title: string;
    depth: number;
};

export interface ParsedPost {
    header: PostHeader,
    body: string;
    toc: null | TocEntry[];
}

export interface PostHeader {
    title: string;
    author: {
        name: string;
        email: string;
    };
    tags: string[] | null;
}
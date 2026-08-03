// types/article.ts
export interface Article {
  id: string;
  title: string;
  slug: string;
  thumbnail: string;
  category: string;
  content: string;
  author: string;
  date: string;
  status: 'published' | 'draft';
  createdAt: string;
  updatedAt: string;
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string;
}

// ─── Product ──────────────────────────────────────────────
export interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  priceStrikethrough?: number;
  categoryId: string;
  shortDescription: string;
  fullDescription: string;
  composition: string;
  stock: number;
  weight: number;
  status: 'active' | 'draft';
  isBestSeller: boolean;
  isFeatured: boolean;
  order: number;
  thumbnail: string;
  images: string[];
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string;
  createdAt: string;
  updatedAt: string;
}

// ─── Category ─────────────────────────────────────────────
export interface Category {
  id: string;
  name: string;
  slug: string;
  icon?: string;
  order: number;
  status: 'active' | 'draft';
}

// ─── Article ──────────────────────────────────────────────
export interface Article {
  id: string;
  title: string;
  slug: string;
  thumbnail: string;
  category: string;
  content: string;
  author: string;
  date: string;
  seoTitle?: string;
  seoDescription?: string;
  metaKeywords?: string;
  status: 'published' | 'draft';
  createdAt: string;
  updatedAt: string;
}

// ─── Testimonial ──────────────────────────────────────────
export interface Testimonial {
  id: string;
  name: string;
  photo: string;
  rating: number;
  comment: string;
  status: 'active' | 'draft';
}

// ─── FAQ ──────────────────────────────────────────────────
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  order: number;
  status: 'active' | 'draft';
}

// ─── Banner ───────────────────────────────────────────────
export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  backgroundImage: string;
  status: 'active' | 'draft';
}

// ─── Gallery ──────────────────────────────────────────────
export interface GalleryItem {
  id: string;
  images: string[];
  caption: string;
  category: string;
}

// ─── Order ────────────────────────────────────────────────
export interface Order {
  id: string;
  name: string;
  whatsapp: string;
  products: OrderProduct[];
  notes: string;
  date: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  };
  
  export interface DashboardStats {
  orderCount: number;
  productCount: number;
  totalRevenue: number;
  }

export interface OrderProduct {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
}

// ─── Settings ─────────────────────────────────────────────
export interface SiteSettings {
  logo: string;
  siteName: string;
  address: string;
  whatsapp: string;
  instagram: string;
  facebook: string;
  tiktok: string;
  googleMapsEmbed: string;
  email: string;
  operatingHours: string;
  footerText: string;
  aboutUs: string;
}

// ─── SEO ──────────────────────────────────────────────────
export interface SEOSettings {
  metaTitle: string;
  metaDescription: string;
  keywords: string;
  ogImage: string;
  canonicalUrl: string;
  robots: string;
  googleVerification: string;
  schemaJsonLd: string;
  favicon: string;
}

// ─── Package ──────────────────────────────────────────────
export interface PackageItem {
  name: string;
  quantity: number;
}

export interface Package {
  id: string;
  name: string;
  description: string;
  items: PackageItem[];
  price: number;
  originalPrice?: number;
  badge?: string;
  isFeatured: boolean;
}

// ─── Navigation ───────────────────────────────────────────
export interface NavLink {
  label: string;
  href: string;
}

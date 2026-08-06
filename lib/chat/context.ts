// Context builder — kumpulkan semua data situs untuk disuntikkan ke prompt chatbot.
import { supabaseAdmin } from '@/lib/supabase-admin';
import { readCollection, readSingleton } from '@/lib/db';

type Row = Record<string, unknown>;

type Table = 'products' | 'packages' | 'articles' | 'faqs' | 'testimonials' | 'banners' | 'gallery' | 'categories' | 'orders' | 'settings' | 'seo';

const LOCAL_TABLES: Record<Exclude<Table, 'settings' | 'seo'>, string> = {
  products: 'products',
  packages: 'packages',
  articles: 'articles',
  faqs: 'faq',
  testimonials: 'testimonials',
  banners: 'banners',
  gallery: 'gallery',
  categories: 'categories',
  orders: 'orders',
};

async function fetchTable(table: Table): Promise<Row[]> {
  if (supabaseAdmin) {
    const { data, error } = await supabaseAdmin.from(table).select('*');
    if (!error && data) {
      // Normalisasi snake_case → camelCase
      return (data as Row[]).map((r) => {
        const out: Row = {};
        for (const [k, v] of Object.entries(r)) {
          out[k.replace(/_([a-z])/g, (_, c) => c.toUpperCase())] = v;
        }
        return out;
      });
    }
  }
  // Fallback: file lokal di /data
  if (table === 'settings' || table === 'seo') {
    const single = await readSingleton<Row>(table === 'seo' ? 'seo' : 'settings');
    return single ? [single] : [];
  }
  const local = LOCAL_TABLES[table as Exclude<Table, 'settings' | 'seo'>];
  return readCollection<Row>(local);
}

/** Bangun ringkasan konteks seluruh data situs. */
export async function buildSiteContext(): Promise<string> {
  const [products, packages, articles, faqs, testimonials, banners, gallery, categories, orders, settings, seo] =
    await Promise.all([
      fetchTable('products'),
      fetchTable('packages'),
      fetchTable('articles'),
      fetchTable('faqs'),
      fetchTable('testimonials'),
      fetchTable('banners'),
      fetchTable('gallery'),
      fetchTable('categories'),
      fetchTable('orders'),
      fetchTable('settings'),
      fetchTable('seo'),
    ]);

  const sections: string[] = [];

  const add = (title: string, rows: Row[]) => {
    if (rows.length) sections.push(`## ${title}\n${JSON.stringify(rows, null, 2)}`);
  };

  add('Produk (menu & harga, termasuk stok)', products);
  add('Paket Hemat', packages);
  add('Artikel (konten blog)', articles);
  add('FAQ', faqs);
  add('Testimoni', testimonials);
  add('Banner', banners);
  add('Galeri', gallery);
  add('Kategori', categories);
  add('Pesanan (data internal — jangan tampilkan detail pribadi pelanggan)', orders);
  add('Pengaturan Situs', settings);
  add('SEO', seo);

  return sections.join('\n\n');
}

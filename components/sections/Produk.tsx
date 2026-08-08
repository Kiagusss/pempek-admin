'use client';

import Image from 'next/image';
import Section, { SectionHeader } from '@/components/ui/Section';
import Badge from '@/components/ui/Badge';
import { CURRENCY_FORMAT } from '@/constants';
import type { Product } from '@/types';
import type { CartItemInput } from '@/components/CartContext';

// Kirim event add-to-cart via window (event bus).
// Tidak bergantung pada React context — aman walau komponen di-SSR.
function addToCart(product: Product) {
  const item: CartItemInput = {
    id: product.id,
    name: product.name,
    price: product.price,
    thumbnail: product.thumbnail,
    stock: product.stock,
  };
  window.dispatchEvent(new CustomEvent('pempek:add-to-cart', { detail: item }));
}

export default function Produk({ products }: { products: Product[] }) {
  const activeProducts = products.filter((p) => p.status === 'active');

  return (
    <Section id="produk" background="gray">
      <SectionHeader
        title="Menu Pempek Kami"
        subtitle="Pilihan pempek segar dengan berbagai varian, dibuat dari ikan tenggiri pilihan."
      />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {activeProducts.map((product) => (
          <article
              key={product.id}
              className="group overflow-hidden rounded-[var(--radius-xl)] bg-white transition-all duration-[var(--dur-slow)] hover:shadow-[var(--shadow-md)] hover:-translate-y-0.5"
            >
              {/* Image */}
              <div className="relative aspect-[4/3] overflow-hidden bg-[var(--color-paper-2)]">
                <Image
                  src={product.thumbnail}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-[var(--dur-slow)] group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                {product.isBestSeller && (
                  <div className="absolute top-3 left-3">
                    <Badge variant="accent">Best Seller</Badge>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-5">
                <h3 className="text-base font-semibold text-[var(--color-ink)]">
                  {product.name}
                </h3>
                <p className="mt-1.5 text-sm text-[var(--color-ink-2)] line-clamp-2 leading-relaxed">
                  {product.shortDescription}
                </p>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-lg font-bold text-[var(--color-accent)]">
                      {CURRENCY_FORMAT.format(product.price)}
                    </span>
                    {product.priceStrikethrough && (
                      <span className="text-sm text-[var(--color-ink-3)] line-through">
                        {CURRENCY_FORMAT.format(product.priceStrikethrough)}
                      </span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => addToCart(product)}
                  disabled={product.stock <= 0}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-[var(--radius-xl)] border border-[var(--color-paper-3)] py-2.5 text-sm font-semibold text-[var(--color-ink)] transition-all duration-[var(--dur-normal)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {product.stock <= 0 ? 'Stok Habis' : 'Pesan'}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <path d="M7 17L17 7M17 7H7M17 7v10" />
                  </svg>
                </button>
              </div>
            </article>
        ))}
      </div>
    </Section>
  );
}

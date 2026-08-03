import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import Hero from '@/components/sections/Hero';
import Keunggulan from '@/components/sections/Keunggulan';
import TentangKami from '@/components/sections/TentangKami';
import Produk from '@/components/sections/Produk';
import PaketHemat from '@/components/sections/PaketHemat';
import CaraPemesanan from '@/components/sections/CaraPemesanan';
import Testimoni from '@/components/sections/Testimoni';
import FAQ from '@/components/sections/FAQ';
import Artikel from '@/components/sections/Artikel';
import CTASection from '@/components/sections/CTASection';
import { sbGet } from '@/lib/actions/supabase-crud';

async function getData() {
  const [banners, products, articles, faqItems, testimonials, packages] = await Promise.all([
    sbGet('banners'),
    sbGet('products'),
    sbGet('articles'),
    sbGet('faqs'),
    sbGet('testimonials'),
    sbGet('packages'),
  ]) as any[];
  
  return { banners, products, articles, faqItems, testimonials, packages };
}

export default async function Home() {
  const data = await getData();

  return (
    <>
      <Navbar />
      <main>
        <Hero banners={data.banners} />
        <Keunggulan />
        <TentangKami />
        <Produk products={data.products} />
        <PaketHemat packages={data.packages} />
        <CaraPemesanan />
        <Testimoni testimonials={data.testimonials} />
        <FAQ faqItems={data.faqItems} />
        <Artikel articles={data.articles} />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}

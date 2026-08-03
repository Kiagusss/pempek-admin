-- Fix sequence identity Supabase (seed awal insert id eksplisit tanpa majukan sequence)
-- Jalankan di Supabase Dashboard → SQL Editor
-- Aman: setval ke max(id) yang ada, sehingga insert berikutnya lanjut dari max+1

SELECT setval(pg_get_serial_sequence('public.products', 'id'), COALESCE((SELECT MAX(id) FROM public.products), 1));
SELECT setval(pg_get_serial_sequence('public.packages', 'id'), COALESCE((SELECT MAX(id) FROM public.packages), 1));
SELECT setval(pg_get_serial_sequence('public.banners', 'id'), COALESCE((SELECT MAX(id) FROM public.banners), 1));
SELECT setval(pg_get_serial_sequence('public.articles', 'id'), COALESCE((SELECT MAX(id) FROM public.articles), 1));
SELECT setval(pg_get_serial_sequence('public.faqs', 'id'), COALESCE((SELECT MAX(id) FROM public.faqs), 1));
SELECT setval(pg_get_serial_sequence('public.testimonials', 'id'), COALESCE((SELECT MAX(id) FROM public.testimonials), 1));
SELECT setval(pg_get_serial_sequence('public.settings', 'id'), COALESCE((SELECT MAX(id) FROM public.settings), 1));
SELECT setval(pg_get_serial_sequence('public.seo', 'id'), COALESCE((SELECT MAX(id) FROM public.seo), 1));

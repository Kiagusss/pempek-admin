# 🎯 Panduan Konten SEO — Pempek Palembang

Dokumen ini berisi **referensi konten** untuk diisi di halaman **Admin → Optimasi SEO** (`/admin/seo`).
Isi field sesuai keinginanmu — contoh di bawah tinggal salin-tempel, lalu sesuaikan.

---

## 1. Global Meta Title

> Tampil sebagai judul tab browser & judul hasil pencarian Google (≈50–60 karakter).

**Contoh:**
```
Pempek Palembang — Pempek Asli Palembang, Lezat & Fresh Setiap Hari
```

Variasi lain:
```
Pempek Asli Palembang | Resep Turun-Temurun, Fresh Setiap Hari
Jual Pempek Palembang Online — Kapal Selam, Lenjer, Adaan
```

---

## 2. Global Meta Description

> Ringkasan di bawah judul di hasil pencarian (≈150–160 karakter).

**Contoh:**
```
Pempek asli Palembang dibuat fresh setiap hari dari ikan tenggiri pilihan dengan resep turun-temurun 3 generasi. Tanpa pengawet, pengiriman cepat ke seluruh Indonesia. Pesan via WhatsApp!
```

---

## 3. Global Keywords

> Dipisahkan dengan koma. Fokus pada kata kunci yang relevan dengan menu & lokasi.

**Contoh:**
```
pempek palembang, pempek asli palembang, pempek kapal selam, pempek lenjer, pempek adaan, pempek frozen, makanan khas palembang, oleh oleh palembang, pempek online, jual pempek, pempek tenggiri
```

---

## 4. URL OG Image (Social Share Image)

> Gambar yang tampil saat link dibagikan di WhatsApp/Facebook/Instagram (disarankan 1200×630px).

- Upload via tombol *Upload* di halaman SEO.
- Default saat ini: `https://pempek-depok.vercel.app/images/hero-pempek.png` (otomatis mengikuti `NEXT_PUBLIC_SITE_URL`).

---

## 5. Canonical URL

> URL resmi situs untuk menghindari konten duplikat. **Sesuaikan dengan URL asli situsmu** — kalau belum pakai domain sendiri, pakai URL Vercel (contoh: `https://pempek-depok.vercel.app`), tanpa garis miring di akhir.

```
https://pempek-depok.vercel.app
```

> ⚠️ **Penting:** URL ini juga dipakai untuk canonical & social share. Ganti sekali di **Vercel → Project → Settings → Environment Variables → `NEXT_PUBLIC_SITE_URL`**, lalu deploy ulang — semua halaman otomatis pakai URL yang sama.

---

## 6. Robots Meta Directive

```
index, follow
```

Variasi lain:
- `noindex, follow` — halaman tidak tampil di Google tapi link tetap diikuti.
- `noindex, nofollow` — halaman benar-benar disembunyikan (jarang dipakai).

---

## 7. Google Site Verification Code

> Kode verifikasi dari [Google Search Console](https://search.google.com/search-console) — metode **HTML tag** (tidak butuh DNS/TXT).
> Isi bagian setelah `google-site-verification=` saja.

**Langkah verifikasi untuk situs Vercel (`.vercel.app`):**

1. Buka [Google Search Console](https://search.google.com/search-console) → **Add property** → pilih **URL prefix** → masukkan `https://pempek-depok.vercel.app`.
2. Pilih metode **HTML tag** → salin kode token (bagian `content="..."`).
3. Tempel token di field ini → klik *Simpan Optimasi SEO*.
4. Klik **Verify** di Search Console — langsung lolos karena token dirender di `<head>` situs.
5. Setelah terverifikasi, submit sitemap: buka **Sitemaps** → masukkan `sitemap.xml` (fitur ini disediakan Vercel/Next.js).

> Jika kamu punya domain sendiri (mis. `pempekpalembang.com`), bisa juga pakai metode **Domain name provider** dengan TXT record — tambahkan di **Vercel → project → Domains → DNS Records → Add Record** (Type: `TXT`, Name: `@`, Value: token).

---

## 8. Skema Tambahan JSON-LD (Script Tag)

> Data terstruktur agar Google menampilkan rich snippet (info bisnis, jam buka, alamat).

**Contoh (FoodEstablishment):**
```json
{
  "@context": "https://schema.org",
  "@type": "FoodEstablishment",
  "name": "Pempek Palembang",
  "description": "Pempek asli Palembang dibuat fresh setiap hari dari ikan tenggiri pilihan dengan resep turun-temurun.",
  "image": "/images/hero-pempek.png",
  "servesCuisine": "Pempek, Makanan Khas Palembang",
  "priceRange": "Rp 5.000 - Rp 100.000",
  "telephone": "+6285711165969",
  "email": "info@pempekpalembang.com",
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Jl. Merdeka No. 123",
    "addressLocality": "Palembang",
    "addressRegion": "Sumatera Selatan",
    "postalCode": "30129",
    "addressCountry": "ID"
  },
  "openingHoursSpecification": {
    "@type": "OpeningHoursSpecification",
    "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"],
    "opens": "08:00",
    "closes": "21:00"
  },
  "sameAs": [
    "https://instagram.com/pempekpalembang",
    "https://facebook.com/pempekpalembang",
    "https://tiktok.com/@pempekpalembang"
  ]
}
```

---

## 9. Favicon

> Ikon kecil di tab browser. Upload file `.ico`/`.png` via tombol upload, atau biarkan `/favicon.ico`.

---

## 💡 Tips

1. **Simpan & cek** — setelah klik *Simpan Optimasi SEO*, buka situsmu di tab incognito untuk memastikan judul & deskripsi berubah.
2. **Validasi schema** — tempel JSON-LD di [Rich Results Test](https://search.google.com/test/rich-results) Google.
3. **Ukur** — pantau performa di Google Search Console setelah beberapa minggu.
4. **Perbarui** — ganti konten ini kapan saja; pengaturan SEO hanya perlu disimpan ulang.

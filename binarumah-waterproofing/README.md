# Binarumah — Waterproofing Landing Page + Header/Services Update

Pakej kod siap pakai untuk:

1. Halaman baharu **`/waterproofing`** — "Pakar Waterproofing & Baiki Bocor Selangor".
2. **Header** dengan dropdown "Perkhidmatan" (desktop + accordion mobile).
3. **Seksyen Perkhidmatan Utama** dengan kad baharu "Pakar Waterproofing & Baiki Bocor".

Dibina menggunakan HTML5 semantik + CSS sedia ada `binarumah.site`
(Tailwind v3.4.17 yang telah dikompil) dan satu fail CSS tambahan.
**Tiada build step, tiada framework JavaScript, tiada CDN JS.**

> ## ✅ STATUS: SUMBER PRODUKSI TERKINI — SUDAH DI-DEPLOY
>
> - Folder **`deploy/`** ialah sumber produksi terkini (14 Nov 2026).
> - Live sudah mempunyai `/privacy`, `/terms` dan `/success` (semua HTTP 200).
> - Landing page live: **https://binarumah.site/waterproofing** (HTTP 200).
> - Hosting: Cloudflare Worker `binarumah-site` (static assets), custom domain `binarumah.site`.
> - Sumber produksi = folder **`deploy/`** — folder ini yang di-upload.
> - Auto-deploy: setiap push ke `main` membina dan deploy melalui `wrangler.jsonc` di root repo.
>
> `waterproofing.html` di root ialah salinan landing page lama. Demo homepage
> kekal di `index.html`; homepage produksi ada di `deploy/index.html`.

---

## 1. Struktur fail

```
binarumah-waterproofing/
├── deploy/                          ← SUMBER PRODUKSI (yang di-upload ke Cloudflare)
│   ├── index.html                   ← homepage produksi + dropdown & kad baharu
│   ├── waterproofing.html           ← landing page /waterproofing
│   ├── sitemap.xml                  ← sitemap produksi (7 URL)
│   ├── assets/
│   │   ├── css/site.css             ← CSS produksi binarumah.site
│   │   ├── css/waterproofing.css    ← CSS tambahan (dropdown, hero, kad, FAQ, footer)
│   │   ├── js/site.js               ← menu landing page + reveal-on-scroll
│   │   └── js/nav-dropdown.js       ← dropdown homepage
│   ├── images/                      ← semua imej produksi
│   └── blog/, privasi.html, 404.html, robots.txt, _headers
├── index.html                       ← demo homepage lama (rujukan UI)
├── waterproofing.html               ← salinan landing page terkini
├── assets/, images/                 ← salinan aset terkini
├── snippets/
│   ├── header.html                  ← contoh header penuh (alternatif)
│   ├── services-section.html        ← contoh seksyen servis
│   └── sitemap-entry.xml
└── README.md
```

---

## 2. Cara preview

Cara paling mudah (disyorkan): jalankan server kecil dari folder ini.

```powershell
cd C:\Users\lenovo\Desktop\binarumah-waterproofing
python -m http.server 8080
```

Kemudian buka:

- `http://localhost:8080/waterproofing.html`
- `http://localhost:8080/index.html` (demo homepage)

Buka terus melalui `file://` juga berfungsi kerana semua laluan adalah relatif.

---

## 3. Integrasi ke laman sebenar

### A. Fail yang perlu dimuat naik

| Fail | Letak di |
|---|---|
| `waterproofing.html` | `/waterproofing.html` (root) |
| `assets/css/waterproofing.css` | `/assets/css/waterproofing.css` |
| `assets/js/site.js` | `/assets/js/site.js` |
| `images/waterproofing-hero.jpg` | `/images/waterproofing-hero.jpg` |
| `images/waterproofing-siling-bocor.jpg` | `/images/waterproofing-siling-bocor.jpg` |

Jika hosting menyokong clean URL (Cloudflare Pages, Netlify, Vercel), fail
`waterproofing.html` di root akan boleh diakses sebagai `/waterproofing`.
Itu sepadan dengan tag canonical dan semua pautan dalam kod ini.

> Jika anda meletakkan halaman dalam folder `/waterproofing/index.html`,
> tukar `assets/...` → `/assets/...` dan `images/...` → `/images/...`
> di dalam `waterproofing.html`, atau salin aset ke folder tersebut.

### B. Kemas kini `<head>` homepage

Tambah selepas `site.css` sedia ada:

```html
<link rel="stylesheet" href="assets/css/waterproofing.css">
```

Tambah sebelum `</body>`:

```html
<script src="assets/js/site.js" defer></script>
```

> Jika homepage sudah ada fail JS sendiri, anda boleh gabungkan kandungan
> `site.js` ke dalam fail tersebut. Jangan muat dua kali.

### C. Ganti header

Salin kandungan `snippets/header.html` dan gantikan blok `<header>` sedia ada.
Pastikan top strip sedia ada dikekalkan di atas header jika mahu.

Header baharu mengandungi:

- Dropdown "Perkhidmatan" (hover + klik + keyboard + Escape).
- Hierarki: **Bina Rumah (badge "Utama")** → **Ubah Suai & Renovation** →
  **Waterproofing & Baiki Bocor**.
- Menu mobile berasingan dengan accordion "Perkhidmatan" — sasaran sentuh
  44px, mudah ditekan.
- Butang WhatsApp kekal di header desktop.

### D. Ganti seksyen Perkhidmatan Utama

Salin kandungan `snippets/services-section.html` dan gantikan seksyen
`#perkhidmatan` sedia ada.

Susun atur 4 kad dikekalkan (`sm:grid-cols-2 xl:grid-cols-4`):

1. Bina Rumah Atas Tanah Sendiri — badge **PERKHIDMATAN UTAMA**
2. Lukisan Pelan 3D & Urusan PBT
3. Ubah Suai & Renovation
4. **Pakar Waterproofing & Baiki Bocor** — kad diserlahkan, pautan ke
   `/waterproofing`

### E. Sitemap

Tambah entri daripada `snippets/sitemap-entry.xml` ke `sitemap.xml`:

```xml
<url>
  <loc>https://binarumah.site/waterproofing</loc>
  <lastmod>2026-11-12</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.9</priority>
</url>
```

Kemudian hantar semula sitemap di Google Search Console.

---

## 4. SEO yang telah disediakan

- **Title** tepat seperti spesifikasi:
  `Pakar Waterproofing & Baiki Bocor Selangor | Bermula RM500 | Binarumah`
- **Meta description** tepat seperti spesifikasi.
- **Canonical**, Open Graph, Twitter Card, `geo.region` (MY-10), `geo.placename`,
  `theme-color`, `robots`.
- **Satu `<h1>`**, hierarki H2/H3 yang logik, tag semantik
  `<header>`, `<main>`, `<section>`, `<article>`, `<nav>`, `<footer>`.
- **JSON-LD**:
  - `Service` + `Offer` (RM500) + `areaServed` (Selangor, KL dan bandar utama).
  - `FAQPage` — sepadan dengan 6 soalan pada halaman.
  - `BreadcrumbList`.
- **Alt text SEO** pada kedua-dua gambar contoh:
  - `Baiki bumbung bocor Selangor — pemeriksaan bumbung oleh pakar waterproofing Binarumah`
  - `Siling rumah bocor dan dinding berkulat akibat kebocoran di Selangor`
- **Kandungan lokal**: senarai kawasan liputan (Shah Alam, Klang, PJ, Subang Jaya,
  Puchong, Kajang, Bangi, Ampang, Gombak, Batu Caves, Rawang, Sungai Buloh,
  Sepang, Kuala Lumpur).
- **Pautan dalaman** ke homepage (bina rumah, ubah suai, pakej, portfolio).
- **FAQ** menggunakan `<details>` — kandungan sentiasa ada dalam DOM untuk crawler.

### Senarai semak sebelum publish

- [ ] Ganti 2 gambar placeholder dengan foto projek sebenar (kekalkan nama fail
      atau kemas kini `src` + `alt`).
- [ ] Pastikan harga "RM500" dan skop masih tepat.
- [ ] Semak semula tuntutan jaminan bertulis dengan pasukan operasi.
- [ ] Kemas kini `og:image` jika nama fail foto berubah.
- [ ] Uji di Google Rich Results Test (Service + FAQ + Breadcrumb).
- [ ] Uji Lighthouse (sasaran: Performance ≥ 90, Accessibility ≥ 95, SEO 100).
- [ ] Hantar sitemap di Search Console.

---

## 5. Nota teknikal

- **Mobile-first**: diuji pada 390px, 768px, 1024px dan 1440px.
- **Sticky mobile CTA**: WhatsApp + Telefon pada skrin kecil; floating WhatsApp
  pada desktop.
- **Aksesibiliti**:
  - Skip link, `aria-expanded`, `aria-controls`, `aria-haspopup`.
  - Dropdown boleh ditutup dengan `Esc`; fokus dipulangkan ke butang.
  - Menu mobile menutup automatik apabila link ditekan atau skrin dibesarkan.
  - Semua butang mempunyai sasaran sentuh ≥ 44px.
  - `prefers-reduced-motion` dihormati.
- **Prestasi**:
  - Tiada jQuery/React/Vue. Hanya ~5KB JS (belum minify).
  - CSS tambahan ~32KB (belum minify; boleh dimampatkan kepada ~8KB dengan
    minifier CSS).
  - Hero image dimuatkan dengan `fetchpriority="high"`; imej kedua `loading="lazy"`.
- **Tiada konflik Tailwind**: semua kelas utiliti yang digunakan sudah wujud
  dalam `site.css` produksi. Komponen baharu menggunakan kelas CSS sendiri
  (`wp-*`, `nav-dropdown__*`, `service-card__link`) supaya tidak bergantung
  pada proses purge Tailwind.

---

## 6. Nombor WhatsApp & kenalan

Kod menggunakan nombor sedia ada laman:

- WhatsApp: `https://wa.me/601155919344`
- Telefon: `+60 11-5591 9344`
- E-mel: `sales@nagasaribu.online`
- Alamat: No. 2-105, Jalan Prima SG 3/2, Prima Seri Gombak, 68100 Batu Caves, Selangor

Jika nombor bertukar, cari-ganti `601155919344` dan `+601155919344`
di kedua-dua fail HTML serta snippet.

---

## 7. Apa yang diubah pada homepage (ringkasan)

| Sebelum | Selepas |
|---|---|
| Menu "Perkhidmatan" satu pautan | Dropdown 3 item dengan badge "Utama" |
| Tiada submenu mobile | Accordion "Perkhidmatan" dalam menu mobile |
| Kad servis sedia ada | 4 kad dikekalkan; kad Waterproofing baharu dengan CTA ke `/waterproofing` |
| Tiada halaman khas waterproofing | Landing page penuh dengan hero, skop, proses, harga, FAQ dan schema |

Fokus utama homepage kekal **Bina Rumah Atas Tanah Sendiri**:
kad pertama, badge "PERKHIDMATAN UTAMA", hero homepage, dan CTA utama
semuanya masih menjurus kepada pembinaan rumah.

---

## 8. Cara deploy semula ke Cloudflare Worker

Produksi menggunakan **Cloudflare Worker static assets** (bukan Pages, bukan Git).
Fail yang di-upload ialah kandungan folder `deploy/`.

```powershell
$env:CLOUDFLARE_API_TOKEN = "<token-workers-scripts-edit>"
$env:CLOUDFLARE_ACCOUNT_ID = "3125856f917dc7d1d6407a79588cff42"

# 1. Upload versi baharu
npx --yes wrangler@4.160.1 versions upload `
  --config "C:\Users\lenovo\AppData\Local\Temp\opencode\wrangler-binarumah-current.jsonc"

# 2. Promosikan versi (ganti <VERSION_ID> dengan ID dari output di atas)
npx --yes wrangler@4.160.1 versions deploy <VERSION_ID>@100% `
  --config "C:\Users\lenovo\AppData\Local\Temp\opencode\wrangler-binarumah-current.jsonc" --yes
```

Nota:

- `/waterproofing.html` akan redirect 307 ke `/waterproofing` secara automatik
  (clean URL) — canonical dan pautan dalaman sudah menggunakan `/waterproofing`.
- `/waterproofing` disahkan HTTP 200 pada produksi.
- Token yang digunakan untuk deploy terakhir hanya ada kebenaran Workers Scripts:Edit;
  `purge_cache` tidak dibenarkan, tetapi HTML menggunakan
  `Cache-Control: max-age=0, must-revalidate` dan kemas kini tetap sampai ke edge.
- Jika kandungan `deploy/` berubah, upload semula dan deploy versi baharu.
- Ganti dua imej abstrak `images/waterproofing-hero.jpg` dan
  `images/waterproofing-siling-bocor.jpg` dengan foto projek sebenar bila tersedia
  (kekalkan nama fail atau kemas kini `src`, `og:image` dan `alt`).

# binarumah.site — Nagasaribu Consultancy (JR0190942-A)

Laman web rasmi **binarumah.site**, dikendalikan oleh **Nagasaribu Consultancy (JR0190942-A)**
(anak syarikat di bawah [nagasaribu.online](https://nagasaribu.online)).

## Sumber produksi

Sumber sebenar laman live ialah folder:

```
binarumah-waterproofing/deploy/
```

Folder itu yang dimuat naik ke **Cloudflare Worker `binarumah-site`** (static assets),
bukan root repo ini. Fail `index.html` di root ialah versi lama dan **bukan** laman live.

Struktur utama:

```
binarumah-waterproofing/
├── deploy/                    ← SUMBER PRODUKSI (upload folder ini)
│   ├── index.html             ← homepage
│   ├── waterproofing.html     ← /waterproofing
│   ├── success.html           ← /success (noindex, nofollow)
│   ├── privacy.html           ← /privacy
│   ├── terms.html             ← /terms
│   ├── 404.html
│   ├── blog/                  ← 7 panduan daerah
│   ├── assets/css|js/
│   ├── images/
│   ├── sitemap.xml
│   ├── robots.txt
│   ├── _headers
│   └── _redirects
├── README.md                  ← panduan deploy penuh
├── waterproofing.html         ← salinan rujukan landing page
└── ...
blog/*.md                      ← sumber kandungan blog (legacy)
tools/build-blog.js            ← penjana blog (legacy; semak template sebelum guna)
```

## Halaman & route

| Route | Fail |
|---|---|
| `/` | `deploy/index.html` |
| `/waterproofing` | `deploy/waterproofing.html` |
| `/success` | `deploy/success.html` |
| `/privacy` | `deploy/privacy.html` |
| `/terms` | `deploy/terms.html` |
| `/blog/...` | `deploy/blog/*.html` |

`/privasi.html` dan `/privasi` ialah redirect kekal (301) ke `/privacy`, ditetapkan dalam `deploy/_redirects`.

## Penjejakan (GTM sahaja)

Semua tag Google dikonfigurasi di dalam **Google Tag Manager**:

- Container: **`GTM-MSG537M5`**
- GA4 Measurement ID: **`G-RYK3F6GNT0`**
- Google Ads Conversion ID: **`AW-18567463725`**
- Label konversi: ditetapkan dalam tag Google Ads di dalam GTM

Tiada `gtag/js`, `gtag('config', ...)`, atau tag Google hardcoded dalam HTML.
Semua halaman produksi hanya memuatkan snippet GTM-MSG537M5 (head + noscript)
dan `assets/js/tracking.js` untuk menghantar event ke `dataLayer`.

> **Nota konfigurasi:** Pastikan tag GA4 `G-RYK3F6GNT0`, tag Google Ads
> `AW-18567463725`, dan trigger `whatsapp_click`/`generate_lead` telah
> dikonfigurasi serta diterbitkan dalam container `GTM-MSG537M5` sebelum
> menganggap penjejakan lengkap. Langkah penuh ada dalam
> [`TRACKING.md`](TRACKING.md). Jangan tambah `gtag.js` dalam HTML untuk
> "membaiki" konfigurasi GTM.

### Event dataLayer

| Event | Bila dicetuskan | Parameter |
|---|---|---|
| `whatsapp_click` | Klik mana-mana pautan WhatsApp atau butang `#waBtn` | `lead_source`, `section_id`, `page_path`, `link_text`, `link_url` |
| `generate_lead` | Borang sebut harga disahkan, **sebelum** redirect ke `/success` | `form_name`, `form_location`, `lead_source`, `page_path` |

Aliran konversi:

1. Borang sebut harga disahkan (nama, telefon, persetujuan PDPA).
2. `generate_lead` di-push ke `dataLayer` sebelum redirect.
3. Butiran dibuka dalam WhatsApp dengan mesej pra-isi.
4. Pelawat dialihkan ke `/success`.
5. `/success` **tidak** push `generate_lead`; lawatan terus, refresh atau
   crawler tidak dikira sebagai konversi.
6. Dalam GTM, trigger `generate_lead` digunakan untuk tag GA4 dan Google Ads
   (termasuk conversion label).
7. `whatsapp_click` ditangkap oleh `tracking.js` melalui event delegation;
   tiada handler inline berganda pada halaman yang sama.

> Jangan push `generate_lead` di `/success` dan jangan push `whatsapp_click`
> semasa submit borang. Satu interaksi = satu event. Jangan tambah tag
> gtag/GA4/Google Ads secara langsung dalam HTML.

## Deploy ke Cloudflare Worker

Produksi menggunakan Worker static assets. Folder yang di-upload ialah
`binarumah-waterproofing/deploy/`, ditetapkan dalam `wrangler.jsonc` di root repo.

### Auto-deploy (disyorkan)

Setiap push ke branch `main` mencetuskan **Cloudflare Workers Builds**:

1. Cloudflare clone repo ini.
2. Jalankan `npx wrangler deploy` menggunakan `wrangler.jsonc` di root.
3. Worker `binarumah-site` di-deploy dengan aset daripada
   `binarumah-waterproofing/deploy/`.

Tiada build step atau `npm install` diperlukan. Pastikan check
**Workers Builds: binarumah-site** pada commit hijau sebelum menganggap deploy berjaya.

### Deploy manual

Dari root repo:

```powershell
$env:CLOUDFLARE_API_TOKEN = "<token Workers Scripts:Edit>"
$env:CLOUDFLARE_ACCOUNT_ID = "3125856f917dc7d1d6407a79588cff42"

npx --yes wrangler@4.160.1 deploy
```

Nota: jangan deploy dari folder `binarumah-waterproofing/deploy/` secara berasingan;
`wrangler.jsonc` di root sudah menunjuk ke folder itu.

## Semakan sebelum publish

- [ ] Pastikan Google tag `AW-18567463725` wujud dalam GTM-MSG537M5 dan container sudah diterbitkan.
- [ ] Pastikan trigger Custom Event `whatsapp_click` dan `generate_lead` wujud dalam GTM.
- [ ] Uji hantar borang: tepat satu `generate_lead` di dataLayer sebelum redirect; `/success` tidak push event.
- [ ] Uji klik WhatsApp: `whatsapp_click` dihantar dengan `lead_source` dan `page_path` yang betul.
- [ ] Uji `/privacy`, `/terms`, `/success`, `/waterproofing` (HTTP 200, bukan 404).
- [ ] Uji galeri pada 390px, 768px, 1440px — kad 4:3, tinggi seragam.
- [ ] Uji poster promosi — `object-fit: contain`, teks tidak terpotong.
- [ ] Hantar semula sitemap di Google Search Console.
- [ ] Uji Google Rich Results (Service, FAQ, Breadcrumb).

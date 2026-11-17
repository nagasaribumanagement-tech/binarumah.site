# Penjejakan binarumah.site — Audit & Konfigurasi GTM

Dokumen ini ialah rujukan tunggal untuk penjejakan produksi. Sumber produksi
ialah `binarumah-waterproofing/deploy/`; fail di root dan `blog/*.html` adalah
legacy dan **tidak** di-deploy.

## 1. Seni bina

- **GTM-only.** HTML hanya memuatkan snippet `GTM-MSG537M5` (head + noscript)
  dan `assets/js/tracking.js`. Tiada `gtag.js`, `gtag('config', ...)`, GA4,
  atau Google Ads hardcoded dalam HTML.
- **Satu container:** `GTM-MSG537M5`
- **GA4:** `G-RYK3F6GNT0`
- **Google Ads:** `AW-18567463725`
- `tracking.js` hanya menulis ke `window.dataLayer`; GTM yang menghantar tag.

## 2. Hasil audit (17 Nov 2026)

| Semakan | Status |
|---|---|
| Snippet GTM dalam `<head>` pada semua 13 halaman produksi | ✅ |
| Noscript GTM selepas `<body>` pada semua halaman | ✅ |
| `gtag/js` atau `gtag('config', ...)` hardcoded | ✅ tiada |
| `tracking.js` dimuatkan pada halaman kandungan | ✅ |
| `window.dataLayer` diinisialisasi oleh snippet GTM sebelum `gtm.js` | ✅ |
| Tag dalam container `GTM-MSG537M5` yang diterbitkan | ⚠️ perlu disahkan dalam UI GTM |
| Tag `AW-18567463725` dalam container | ⚠️ perlu disahkan dalam UI GTM |
| Trigger `whatsapp_click` / `generate_lead` | ⚠️ perlu disahkan dalam UI GTM |

Audit kod ini hanya mengesahkan snippet dan event pada halaman. Konfigurasi
tag, trigger dan versi container `GTM-MSG537M5` mesti disemak dalam UI Google
Tag Manager sebelum diterbitkan. Tanpa tag GA4/Ads yang diterbitkan, tiada hit
GA4 atau Google Ads akan dihantar walaupun event `dataLayer` betul.

> Perubahan kod **tidak boleh** menambah tag Google Ads tanpa melanggar
> seni bina GTM-only. Tag mesti ditambah dalam GTM dan container diterbitkan.

## 3. Kontrak event

### `whatsapp_click`

Dicetuskan oleh `deploy/assets/js/tracking.js` apabila pengguna klik:

- pautan `https://wa.me/...`
- pautan `https://api.whatsapp.com/...` atau `https://web.whatsapp.com/...`
- pautan `whatsapp:...`
- butang `#waBtn` atau elemen `[data-whatsapp]`

Parameter:

| Parameter | Contoh | Sumber |
|---|---|---|
| `event` | `whatsapp_click` | tetap |
| `lead_source` | `hero_lawatan_tapak`, `header_cta`, `sticky_mobile_cta` | `data-lead-source`, `id`, id seksyen, atau teks pautan |
| `section_id` | `hero`, `pakej`, `faq`, `footer` | id `section`/`header`/`nav`/`footer` terdekat |
| `page_path` | `/`, `/waterproofing`, `/blog/panduan-bina-rumah-rawang` | `data-page-path` atau `location.pathname`, dinormalisasi |
| `link_text` | `Sebut Harga Percuma` | teks pautan (maks 80 aksara) |
| `link_url` | `https://wa.me/601155919344` | href tanpa query string |

Tiada handler inline global yang menduplikasi event ini. Jika menambah CTA
WhatsApp baharu, letak `data-lead-source="..."` untuk lokasi yang jelas.

### `generate_lead`

Dicetuskan oleh handler borang **sebelum** redirect ke `/success`:

| Halaman | `form_location` | Fail |
|---|---|---|
| `/` | `homepage_quote_form` | `deploy/index.html` |
| `/waterproofing` | `waterproofing_quote_form` | `deploy/waterproofing.html` |
| Blog panduan | `blog_quote_form` | 3 halaman blog yang ada borang |

Parameter: `event`, `form_name` (`binarumah_quote_form`), `form_location`,
`lead_source`, `page_path`.

`/success` **tidak** push `generate_lead`. Lawatan terus, refresh, atau crawler
tidak dikira sebagai konversi. Tanda lama `sessionStorage.binarumah_lead_pending`
hanya dibuang untuk mengelakkan konversi berganda daripada halaman cache lama.
Setiap borang juga dikunci dengan `data-submitting="1"` selepas submit supaya
klik berganda tidak mencetuskan dua `generate_lead`.

## 4. Konfigurasi GTM yang diperlukan

Semua langkah di bawah dibuat dalam UI Google Tag Manager, kemudian
**Submit → Publish**.

### 4.1 Google tag GA4 (asas)

1. **Tags → New → Google tag**.
2. **Tag ID:** `G-RYK3F6GNT0`.
3. **Triggering:** `Initialization - All Pages` (atau `All Pages`).
4. Simpan.

### 4.2 Google tag Google Ads

Pilihan A — tambah sebagai destination pada Google tag 4.1 (disyorkan):

1. Buka Google tag yang memuatkan `G-RYK3F6GNT0`.
2. **Configuration → Add destination** → `AW-18567463725`.
3. Simpan.

Pilihan B — tag Google Ads berasingan:

1. **Tags → New → Google tag**.
2. **Tag ID:** `AW-18567463725`.
3. **Triggering:** `Initialization - All Pages` (atau `All Pages`).
4. Simpan.

Jangan buat Pilihan A dan B serentak; pilih satu sahaja.

### 4.3 Tag GA4 untuk `whatsapp_click`

1. **Tags → New → Google Analytics: GA4 Event**.
2. Measurement ID: `G-RYK3F6GNT0`.
3. Event name: `whatsapp_click`.
4. Parameter: `lead_source`, `section_id`, `page_path`, `link_text`, `link_url`.
5. Trigger: **Custom Event** → `whatsapp_click`.
6. Simpan.

### 4.4 Tag GA4 untuk `generate_lead`

1. **Tags → New → Google Analytics: GA4 Event**.
2. Measurement ID: `G-RYK3F6GNT0`.
3. Event name: `generate_lead`.
4. Parameter: `form_name`, `form_location`, `lead_source`, `page_path`.
5. Trigger: **Custom Event** → `generate_lead`.
6. Tandakan event ini sebagai conversion dalam GA4 jika perlu.
7. Simpan.

### 4.5 Tag konversi Google Ads

1. **Tags → New → Google Ads Conversion Tracking**.
2. Conversion ID: `AW-18567463725`.
3. Conversion label: salin daripada Google Ads (setiap conversion action
   mempunyai label berbeza).
4. Trigger: **Custom Event** → `generate_lead`.
5. Jika mahu klik WhatsApp dikira sebagai konversi berasingan, cipta
   conversion action kedua di Google Ads dan trigger `whatsapp_click`.
6. Publish.

Pastikan **Conversion Linker** aktif (biasanya dimuatkan oleh Google tag).
Jangan tambah tag Ads yang sama dua kali.

## 5. Ujian

1. Buka GTM **Preview** dan sambung ke `https://binarumah.site/`.
2. Klik pautan WhatsApp: `whatsapp_click` mesti muncul **sekali** dengan
   `lead_source` dan `page_path` betul.
3. Hantar borang: `generate_lead` mesti muncul **sekali** sebelum navigasi ke
   `/success`.
4. Buka `/success` secara terus: **tiada** `generate_lead`.
5. Semak Tag Assistant: Google tag `AW-18567463725` mesti dimuatkan pada semua
   halaman.
6. Selepas 24–48 jam, semak semula amaran Google Ads.

## 6. Perkara yang tidak boleh dilakukan

- Jangan tambah `<script async src="https://www.googletagmanager.com/gtag/js?id=...">`
  atau `gtag('config', ...)` dalam HTML.
- Jangan push `generate_lead` di `/success`.
- Jangan push `whatsapp_click` semasa submit borang.
- Jangan tambah container GTM kedua.
- Jangan edit fail legacy di root dan anggap ia produksi.

## 7. Fail berkaitan

- `binarumah-waterproofing/deploy/assets/js/tracking.js` — WhatsApp click.
- `binarumah-waterproofing/deploy/index.html` — borang homepage.
- `binarumah-waterproofing/deploy/waterproofing.html` — borang waterproofing.
- `binarumah-waterproofing/deploy/blog/panduan-bina-rumah-{rawang,subang-jaya,kuala-lumpur}.html` — borang blog.
- `binarumah-waterproofing/deploy/success.html` — tiada event konversi.

# binarumah.site — Nagasaribu Consultancy (JR0190942-A)

Laman web rasmi **binarumah.site**, dikendalikan oleh **Nagasaribu Consultancy (JR0190942-A)**
(entiti di bawah portal induk [nagasaribu.online](https://nagasaribu.online)).

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
│   ├── blog/                  ← 4 panduan daerah
│   ├── assets/css|js/
│   ├── images/
│   ├── sitemap.xml
│   ├── robots.txt
│   └── _headers
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

`privasi.html` ialah redirect lama ke `/privacy`.

## Conversion tracking (GTM sahaja)

Semua tag Google dikonfigurasi di dalam **Google Tag Manager**:

- Container: **`GTM-MSG537M5`**
- GA4 Measurement ID: **`G-RYK3F6GNT0`**
- Google Ads Conversion ID: **`AW-18567463725`**
- Conversion label: ditetapkan dalam tag Google Ads di dalam GTM

Tiada lagi `gtag/js`, `gtag('config', ...)`, `window.BINARUMAH_TRACKING`,
atau `tracking.js` dimuatkan dalam mana-mana halaman HTML. Halaman utama
(index, waterproofing, success, privacy, terms) dan 4 halaman blog hanya
menggunakan snippet GTM.

Aliran konversi:

1. Borang `#leadForm` disahkan (nama, telefon, persetujuan PDPA).
2. Butiran dibuka dalam WhatsApp dengan mesej pra-isi.
3. `sessionStorage.binarumah_lead_pending = '1'` ditetapkan.
4. Pelawat dialihkan ke `/success`.
5. `success.html` hanya push event ini jika tanda pending wujud, kemudian memadamnya:

```js
window.dataLayer.push({ event: 'generate_lead', form_location: 'binarumah_quote_form' });
```

6. Dalam GTM, trigger `generate_lead` digunakan untuk tag GA4 dan Google Ads
   (termasuk conversion label).
7. Lawatan terus ke `/success`, refresh, atau crawler **tidak** push event.

> Jangan tambah tag gtag/GA4/Google Ads secara langsung dalam HTML. Semua
> pengukuran mesti melalui GTM supaya tiada page_view atau konversi berganda.

## Deploy ke Cloudflare Worker

Produksi menggunakan Worker static assets. Folder yang di-upload ialah
`binarumah-waterproofing/deploy/`.

```powershell
$env:CLOUDFLARE_API_TOKEN = "<token Workers Scripts:Edit>"
$env:CLOUDFLARE_ACCOUNT_ID = "3125856f917dc7d1d6407a79588cff42"

npx --yes wrangler@4.160.1 versions upload `
  --config "C:\Users\lenovo\AppData\Local\Temp\opencode\wrangler-binarumah-current.jsonc"

npx --yes wrangler@4.160.1 versions deploy <VERSION_ID>@100% `
  --config "C:\Users\lenovo\AppData\Local\Temp\opencode\wrangler-binarumah-current.jsonc" --yes
```

Nota: akaun Cloudflare yang sedang login pada mesin ini (`7940e483...`) **bukan**
akaun produksi (`3125856f...`). Token/akses untuk akaun produksi diperlukan sebelum deploy.

## Semakan sebelum publish

- [ ] Konfigurasi tag GA4 + Google Ads (termasuk conversion label) dalam GTM-MSG537M5.
- [ ] Uji hantar borang: `/success` mesti dibuka dan konversi hanya sekali.
- [ ] Uji `/privacy`, `/terms`, `/success`, `/waterproofing` (HTTP 200, bukan 404).
- [ ] Uji galeri pada 390px, 768px, 1440px — kad 4:3, tinggi seragam.
- [ ] Uji poster promosi — `object-fit: contain`, teks tidak terpotong.
- [ ] Hantar semula sitemap di Google Search Console.
- [ ] Uji Google Rich Results (Service, FAQ, Breadcrumb).

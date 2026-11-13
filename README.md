# binarumah.site — Nagasaribu Management

Laman web rasmi **binarumah.site**, dikendalikan oleh **Nagasaribu Management**
(anak syarikat portal [nagasaribu.online](https://nagasaribu.online)).

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

## Conversion tracking (Google Ads / GA4)

ID yang telah dipasang pada ketiga-tiga halaman:

```js
window.BINARUMAH_TRACKING = {
  googleAdsId: 'AW-18567463725',
  googleAdsConversionLabel: (window.BINARUMAH_TRACKING_CONFIG || {}).googleAdsConversionLabel || '',
  ga4MeasurementId: 'G-RYK3F6GNT0'
};
```

**Label konversi Google Ads** diisi di satu tempat sahaja:

```
deploy/assets/js/tracking-config.js
```

```js
window.BINARUMAH_TRACKING_CONFIG = {
  googleAdsConversionLabel: 'AbCdEfGhIj-KLMNOP'
};
```

Fail itu tidak di-cache lama (lihat `_headers`), jadi label boleh ditambah
kemudian tanpa mengubah kod halaman dan tanpa deploy penuh.

Jika label masih kosong:

- Google Ads conversion **tidak** dihantar (kerana tiada label).
- GA4 `generate_lead` **tetap** dihantar.
- Klik WhatsApp direkod sebagai `whatsapp_click` dalam GA4.

Aliran konversi:

1. Borang `#leadForm` disahkan (nama, telefon, persetujuan PDPA).
2. Butiran dibuka dalam WhatsApp dengan mesej pra-isi.
3. `sessionStorage.binarumah_lead_pending = '1'` ditetapkan.
4. Pelawat dialihkan ke `/success`.
5. `success.html` hanya memanggil `binarumahTrackConversion()` jika tanda
   `binarumah_lead_pending` wujud, kemudian memadamnya.
6. Lawatan terus ke `/success`, refresh, atau crawler **tidak** mengira konversi.

`tracking.js` juga merekod klik `wa.me` sebagai `whatsapp_click` dalam GA4.

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

- [ ] Isi Google Ads conversion label dalam `deploy/assets/js/tracking-config.js`.
- [ ] Uji hantar borang: `/success` mesti dibuka dan konversi hanya sekali.
- [ ] Uji `/privacy`, `/terms`, `/success`, `/waterproofing` (HTTP 200, bukan 404).
- [ ] Uji galeri pada 390px, 768px, 1440px — kad 4:3, tinggi seragam.
- [ ] Uji poster promosi — `object-fit: contain`, teks tidak terpotong.
- [ ] Hantar semula sitemap di Google Search Console.
- [ ] Uji Google Rich Results (Service, FAQ, Breadcrumb).

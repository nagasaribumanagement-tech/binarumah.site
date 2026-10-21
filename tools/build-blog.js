#!/usr/bin/env node
/*
  Penjana artikel blog binarumah.site
  -------------------------------
  Reads:   blog/<slug>.md   (front matter + Markdown)
  Writes:  blog/<slug>.html (halaman penuh, sedia untuk deploy)

  Guna:
    node tools/build-blog.js              -> pautan dalaman relatif (../index.html) untuk pratonton lokal
    node tools/build-blog.js --base=/     -> pautan absolute (/... ) untuk deploy ke binarumah.site

  Token dalam Markdown:
    {{home}}   -> asas pautan ke laman utama (tentu ../index.html atau /)
    {{wa}}     -> pautan WhatsApp penuh (tetapkan WA_NUMBER di bawah)
*/

'use strict';

const fs = require('fs');
const path = require('path');

/* ==== TETAPAN — tukar nilai ini ==== */
const SITE = 'https://binarumah.site';
const WA_NUMBER = '601155919344'; // 011-5591 9344
const WA_DISPLAY = '+60 11-5591 9344';
const FB = 'https://www.facebook.com/tukangrumahidaman';
const TIKTOK = 'https://www.tiktok.com/@nsm.rumah.idaman';
const COMPANY = 'Nagasaribu Management';
const EMAIL = 'sales@nagasaribu.online';
const ADDRESS = 'No. 2-105, Jalan Prima SG 3/2, Prima Seri Gombak, 68100 Batu Caves, Selangor';
const BRAND = 'binarumah.site';
const BASE_ARG = process.argv.find(a => a.startsWith('--base='));
const HOME = BASE_ARG ? BASE_ARG.split('=')[1].replace(/\/$/, '') + '/index.html' : '../index.html';
const WA = 'https://wa.me/' + WA_NUMBER.replace(/[^0-9]/g, '');
// Pangkalan path untuk aset (images/, styles-blog.css) mengikut mod lokal/deploy
const ASSET = HOME.replace(/index\.html$/, '');

const ROOT = path.resolve(__dirname, '..');
const BLOG = path.join(ROOT, 'blog');

/* ==================== Markdown ==================== */

function esc(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function inline(s) {
  return esc(s)
    .replace(/\{\{home\}\}/g, HOME)
    .replace(/\{\{wa\}\}/g, WA)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code>$1</code>');
}

function parseFrontMatter(src) {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(src);
  const fm = {};
  if (!m) return { fm, body: src };
  m[1].split(/\r?\n/).forEach(line => {
    const i = line.indexOf(':');
    if (i > 0) fm[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  });
  return { fm, body: src.slice(m[0].length) };
}

function mdToHtml(md) {
  const lines = md.replace(/\r/g, '').split('\n');
  const out = [];
  let i = 0, firstH1 = true;

  const isTableSep = l => /^\s*\|?[\s:|-]{3,}\|?\s*$/.test(l) && l.includes('-');

  while (i < lines.length) {
    let l = lines[i];

    if (!l.trim()) { i++; continue; }

    if (/^---\s*$/.test(l)) { out.push('<hr>'); i++; continue; }

    const h = /^(#{1,3})\s+(.*)$/.exec(l);
    if (h) {
      const lvl = h[1].length;
      const text = inline(h[2]);
      if (lvl === 1) {
        if (firstH1) { firstH1 = false; i++; continue; } // tajuk sudah dipaparkan pada hero
        out.push('<h1>' + text + '</h1>');
      } else if (lvl === 2) {
        const id = h[2].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
        out.push('<h2 id="' + id + '">' + text + '</h2>');
      } else {
        out.push('<h3>' + text + '</h3>');
      }
      i++; continue;
    }

    // jadual
    if (l.trim().startsWith('|') && lines[i + 1] && isTableSep(lines[i + 1])) {
      const head = l.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim());
      i += 2;
      const rows = [];
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        rows.push(lines[i].trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim()));
        i++;
      }
      out.push('<div class="table-wrap"><table><thead><tr>' +
        head.map(c => '<th scope="col">' + inline(c) + '</th>').join('') +
        '</tr></thead><tbody>' +
        rows.map(r => '<tr>' + r.map((c, ix) =>
          (ix === 0 ? '<th scope="row">' : '<td>') + inline(c) + (ix === 0 ? '</th>' : '</td>')).join('') +
          '</tr>').join('') +
        '</tbody></table></div>');
      continue;
    }

    // senarai
    if (/^\s*[-*]\s+/.test(l)) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
        items.push(inline(lines[i].replace(/^\s*[-*]\s+/, '')));
        i++;
      }
      out.push('<ul>' + items.map(t => '<li>' + t + '</li>').join('') + '</ul>');
      continue;
    }
    if (/^\s*\d+\.\s+/.test(l)) {
      const items = [];
      while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
        items.push(inline(lines[i].replace(/^\s*\d+\.\s+/, '')));
        i++;
      }
      out.push('<ol>' + items.map(t => '<li>' + t + '</li>').join('') + '</ol>');
      continue;
    }

    // petikan
    if (l.trim().startsWith('>')) {
      const q = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        q.push(inline(lines[i].trim().replace(/^>\s?/, '')));
        i++;
      }
      out.push('<blockquote><p>' + q.join(' ') + '</p></blockquote>');
      continue;
    }

    // perenggan (kandungi soalan FAQ: baris "**...?**" menjadi <h3>)
    const buf = [];
    while (i < lines.length && lines[i].trim() && !/^(#{1,3}\s|---|\||\s*[-*]\s|\s*\d+\.\s|>)/.test(lines[i])) {
      buf.push(lines[i].trim());
      i++;
    }
    if (buf.length) {
      if (buf.length > 1 && /^\*\*(.+)\?\*\*$/.test(buf[0])) {
        out.push('<h3>' + inline(buf[0].replace(/^\*\*|\*\*$/g, '')) + '</h3>');
        buf.shift();
      }
      out.push('<p>' + inline(buf.join(' ')) + '</p>');
    }
  }
  return out.join('\n');
}

/* Jana FAQPage JSON-LD daripada seksyen "Soalan Lazim"
   Format Markdown: baris soalan dimuatkan dalam **...** dan diakhiri "?",
   diikuti baris jawapan sehingga baris kosong atau soalan seterusnya. */
function faqSchema(md) {
  const start = md.search(/^##\s*Soalan Lazim/mi);
  if (start < 0) return null;
  const lines = md.slice(start).split(/\r?\n/).slice(1);
  const ent = [];
  let cur = null;
  for (const raw of lines) {
    const l = raw.trim();
    const q = /^\*\*(.+)\?\*\*$/.exec(l);
    if (q) {
      if (cur) ent.push(cur);
      cur = { '@type': 'Question', name: q[1].trim(), acceptedAnswer: { '@type': 'Answer', text: '' } };
      continue;
    }
    if (!l) continue;
    if (cur) cur.acceptedAnswer.text += (cur.acceptedAnswer.text ? ' ' : '') +
      l.replace(/\*\*/g, '').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
  }
  if (cur) ent.push(cur);
  ent.forEach(e => { e.acceptedAnswer.text = e.acceptedAnswer.text.replace(/\s+/g, ' ').trim(); });
  return ent.length ? { '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: ent } : null;
}

/* ==================== Templat ==================== */

const CSS = `
  body{margin:0;background:#fff;color:#12293F;font-family:Manrope,system-ui,sans-serif;-webkit-font-smoothing:antialiased}
  .wrap{max-width:1200px;margin-inline:auto;padding-inline:1.25rem}
  .article{max-width:760px;margin-inline:auto;padding:2.5rem 1.25rem 4rem}
  .article p{font-size:17px;line-height:1.75;margin:0 0 1.15rem}
  .article h2{font-family:"Plus Jakarta Sans",Manrope,sans-serif;font-size:clamp(1.45rem,3.6vw,2rem);font-weight:800;color:#0B1F33;margin:2.75rem 0 1rem;line-height:1.25}
  .article h3{font-family:"Plus Jakarta Sans",Manrope,sans-serif;font-size:1.22rem;font-weight:700;color:#0B1F33;margin:2rem 0 .6rem}
  .article ul,.article ol{margin:0 0 1.25rem;padding-left:1.35rem}
  .article li{font-size:16.5px;line-height:1.7;margin-bottom:.5rem}
  .article a{color:#B06B00;font-weight:700;text-decoration:underline;text-underline-offset:2px}
  .article a:hover{color:#0B1F33}
  .article strong{color:#0B1F33}
  .article hr{border:0;border-top:1px solid #E2E8F0;margin:2.5rem 0}
  .article blockquote{margin:1.5rem 0;padding:1rem 1.25rem;background:#F1F5F9;border-left:4px solid #F0A020;border-radius:0 12px 12px 0}
  .article blockquote p{margin:0;font-size:16.5px}
  .table-wrap{overflow-x:auto;border:1px solid #E2E8F0;border-radius:16px;margin:1.5rem 0 1.75rem;box-shadow:0 10px 30px rgba(11,31,51,.06)}
  table{width:100%;min-width:640px;border-collapse:collapse;font-size:15px}
  thead{background:#0B1F33;color:#fff}
  th,td{padding:.85rem 1rem;text-align:left}
  tbody tr:nth-child(even){background:#F8FAFC}
  tbody th{font-weight:800;color:#0B1F33;white-space:nowrap}
  code{background:#F1F5F9;padding:.1rem .35rem;border-radius:6px;font-size:.92em}
`;

function page(fm, bodyHtml, faq) {
  const url = SITE + '/blog/' + fm.slug + '.html';
  const art = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: fm.title,
    description: fm.description,
    inLanguage: 'ms-MY',
    datePublished: fm.date,
    dateModified: fm.date,
    author: { '@type': 'Organization', name: BRAND, url: SITE + '/', legalName: COMPANY, email: EMAIL },
    publisher: { '@type': 'Organization', name: BRAND, url: SITE + '/', legalName: COMPANY, email: EMAIL, sameAs: [FB, TIKTOK] },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url: url
  };
  const crumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Laman Utama', item: SITE + '/' },
      { '@type': 'ListItem', position: 2, name: fm.district + ' 2026', item: url }
    ]
  };

  return `<!DOCTYPE html>
<html lang="ms">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(fm.title)}</title>
<meta name="description" content="${esc(fm.description)}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index, follow, max-image-preview:large">
<meta name="keywords" content="${esc(fm.keywords || '')}">
<meta property="og:type" content="article">
<meta property="og:locale" content="ms_MY">
<meta property="og:title" content="${esc(fm.title)}">
<meta property="og:description" content="${esc(fm.description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE}/images/hero-banglo.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${HOME.replace('index.html', '')}styles-blog.css">
<link rel="icon" type="image/png" sizes="64x64" href="${ASSET}images/favicon-64.png">
<link rel="apple-touch-icon" href="${ASSET}images/apple-touch-icon.png">
<script type="application/ld+json">${JSON.stringify(art)}<\/script>
<script type="application/ld+json">${JSON.stringify(crumb)}<\/script>
${faq ? '<script type="application/ld+json">' + JSON.stringify(faq) + '<\/script>' : ''}
</head>
<body>

<header style="position:sticky;top:0;z-index:10;background:rgba(255,255,255,.92);backdrop-filter:blur(8px);border-bottom:1px solid #E2E8F0">
  <div class="wrap" style="height:64px;display:flex;align-items:center;justify-content:space-between;gap:1rem">
    <a href="${HOME}" style="display:flex;align-items:center;gap:.6rem;text-decoration:none">
      <img src="${ASSET}images/logo-mark.png" width="34" height="34" alt="Logo binarumah.site" style="width:34px;height:34px;display:block">
      <span style="font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;color:#0B1F33">binarumah<span style="color:#DB8601">.site</span></span>
    </a>
    <nav style="display:flex;align-items:center;gap:.5rem;font-weight:700;font-size:14.5px">
      <a href="${HOME}#kira-kos" style="color:#24506F;text-decoration:none;padding:.5rem .75rem">Pakej &amp; Harga</a>
      <a href="${HOME}#portfolio" style="color:#24506F;text-decoration:none;padding:.5rem .75rem">Portfolio</a>
      <a href="${WA}?text=Assalamualaikum%2C%20saya%20nak%20sebut%20harga%20bina%20rumah%20di%20${encodeURIComponent(fm.district)}" style="background:#1EA453;color:#fff;text-decoration:none;padding:.6rem 1rem;border-radius:12px;font-weight:800">Sebut Harga Percuma</a>
    </nav>
  </div>
</header>

<div style="background:#0B1F33;color:#fff">
  <div class="wrap" style="padding:2.5rem 1.25rem 2.75rem;max-width:860px">
    <p style="margin:0;font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;font-weight:700;color:#F5B544">Panduan Daerah · ${esc(fm.district)} · ${esc(fm.pbt)}</p>
    <h1 style="font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;font-size:clamp(1.7rem,4.6vw,2.6rem);line-height:1.15;margin:.75rem 0 0">${esc(fm.district ? fm.title.split(' — ')[0] : fm.title)}</h1>
    <p style="margin:1rem 0 0;color:#E2E8F0;font-size:16.5px;line-height:1.65;max-width:66ch">${esc(fm.description)}</p>
    <p style="margin:1.25rem 0 0;font-size:13.5px;color:#94A3B8">Dikemas kini: ${esc(fm.date)} · ${BRAND} · Anggaran pasaran Selangor 2026, bukan sebut harga mengikat.</p>
  </div>
</div>

<article class="article">
${bodyHtml}
</article>

<section style="background:#F1F5F9;border-top:1px solid #E2E8F0">
  <div class="wrap" style="padding:2.5rem 1.25rem;display:flex;flex-wrap:wrap;gap:1.25rem;align-items:center;justify-content:space-between;max-width:860px">
    <div>
      <h2 style="font-family:'Plus Jakarta Sans',sans-serif;font-weight:800;color:#0B1F33;font-size:1.35rem;margin:0">Tanah anda di ${esc(fm.district)}? Dapatkan anggaran bertulis dalam 48 jam.</h2>
      <p style="margin:.4rem 0 0;font-size:15px;color:#24506F">Lawatan tapak dan pelan 3D awal adalah percuma.</p>
    </div>
    <a href="${WA}?text=Assalamualaikum%2C%20saya%20baca%20panduan%20${encodeURIComponent(fm.district)}%20dan%20nak%20sebut%20harga." style="background:#1EA453;color:#fff;font-weight:800;text-decoration:none;padding:.9rem 1.4rem;border-radius:14px;white-space:nowrap">WhatsApp ${WA_DISPLAY}</a>
  </div>
  <div class="wrap" style="padding:0 1.25rem 2.5rem;max-width:860px;display:flex;flex-wrap:wrap;gap:.75rem;font-size:14px;font-weight:700">
    <span style="color:#64748B">Panduan daerah lain:</span>
    <a href="panduan-bina-rumah-klang.html" style="color:#B06B00">Klang</a>·
    <a href="panduan-bina-rumah-shah-alam.html" style="color:#B06B00">Shah Alam</a>·
    <a href="panduan-bina-rumah-bangi-kajang.html" style="color:#B06B00">Bangi / Kajang</a>·
    <a href="panduan-bina-rumah-sepang.html" style="color:#B06B00">Sepang</a>
  </div>
</section>

<footer style="background:#0B1F33;color:#94A3B8">
  <div class="wrap" style="padding:1.5rem 1.25rem;display:flex;flex-wrap:wrap;gap:.75rem;justify-content:space-between;font-size:13.5px">
    <p style="margin:0">© ${new Date().getFullYear()} ${BRAND} · ${COMPANY} · WhatsApp ${WA_DISPLAY}</p>
    <p style="margin:0"><a href="${FB}" target="_blank" rel="noopener" style="color:#E2E8F0">Facebook · Tukang Rumah Idaman</a></p>
    <p style="margin:0"><a href="${TIKTOK}" target="_blank" rel="noopener" style="color:#E2E8F0">TikTok · nsm.rumah.idaman</a></p>
    <p style="margin:0"><a href="${HOME}" style="color:#E2E8F0">Kembali ke laman utama</a></p>
  </div>
  <div class="wrap" style="padding:0 1.25rem 1.5rem;font-size:13px;color:#7C8B9C;max-width:860px">
    Pejabat: ${ADDRESS} · <a href="mailto:${EMAIL}" style="color:#9FB3C8">${EMAIL}</a>
  </div>
</footer>

</body>
</html>`;
}

/* ==================== Jalankan ==================== */

if (!fs.existsSync(BLOG)) {
  console.error('Folder blog/ tidak wujud.');
  process.exit(1);
}

// Fail CSS berasingan supaya semua artikel berkongsi satu muatan
fs.writeFileSync(path.join(ROOT, 'styles-blog.css'), CSS.trim() + '\n');

const mds = fs.readdirSync(BLOG).filter(f => f.endsWith('.md'));
let n = 0;
for (const f of mds) {
  const src = fs.readFileSync(path.join(BLOG, f), 'utf8');
  const { fm, body } = parseFrontMatter(src);
  if (!fm.slug || !fm.title) {
    console.warn('Langkau (front matter tidak lengkap):', f);
    continue;
  }
  const html = page(fm, mdToHtml(body), faqSchema(body));
  fs.writeFileSync(path.join(BLOG, fm.slug + '.html'), html);
  const words = body.split(/\s+/).filter(Boolean).length;
  console.log('✓ ' + fm.slug + '.html  (' + words + ' patah perkataan)');
  n++;
}
console.log('\n' + n + ' artikel dijana. Pautan dalaman: ' + HOME +
  (BASE_ARG ? '' : '  (tukar --base=/ untuk deploy)'));

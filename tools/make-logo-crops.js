/*
  tools/make-logo-crops.js
  Logo asal (images/logo-binarumah-site.png) ialah PNG 400x400 dengan latar PUTIH pekat,
  bukan telus. Skrip ini:
    1. decode PNG (zlib sahaja, tiada dependensi luar)
    2. kunci latar putih -> alpha (coverage), rupa bentuk satu warna
    3. pisahkan jalur ikon & jalur teks secara menegak
    4. jana aset siap pakai untuk laman

  Output (dalam images/):
    logo-mark.png          ikon rumah, warna slate  (header latar putih)
    logo-mark-white.png    ikon rumah, putih        (footer / latar gelap)
    logo-full.png          ikon + teks, slate
    logo-full-white.png    ikon + teks, putih
    logo-wordmark.png      teks "binarumah.site" sahaja, slate
    favicon-64.png         64x64 latar putih, ikon slate
    apple-touch-icon.png   180x180 latar putih untuk iOS
    logo-og.png            1200x630 kad sosial (logo putih atas latar brand)

  Guna: node tools/make-logo-crops.js
*/
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'images', 'logo-binarumah-site.png');
const OUT = f => path.join(ROOT, 'images', f);

const SLATE = [45, 59, 60];   // warna stroke logo asal
const BRAND = [11, 31, 51];   // brand-900 laman

/* ---------------- PNG decode / encode ---------------- */
const CRC_T = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  return t;
})();
function crc32(buf) {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) c = CRC_T[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function decodePng(file) {
  const buf = fs.readFileSync(file);
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('Bukan PNG: ' + file);
  let off = 8, w = 0, h = 0, idat = [];
  while (off < buf.length) {
    const len = buf.readUInt32BE(off), type = buf.toString('ascii', off + 4, off + 8);
    const data = buf.subarray(off + 8, off + 8 + len);
    if (type === 'IHDR') {
      w = data.readUInt32BE(0); h = data.readUInt32BE(4);
      if (data[8] !== 8 || data[9] !== 6) throw new Error('Perlu 8-bit RGBA, dapat ' + data[8] + '/' + data[9]);
    } else if (type === 'IDAT') idat.push(Buffer.from(data));
    else if (type === 'IEND') break;
    off += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(idat));
  const bpp = 4, stride = w * bpp, out = Buffer.alloc(h * stride);
  const paeth = (a, b, c) => { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); return pa <= pb && pa <= pc ? a : pb <= pc ? b : c; };
  let pos = 0;
  for (let y = 0; y < h; y++) {
    const f = raw[pos++];
    for (let x = 0; x < stride; x++) {
      const cur = raw[pos + x];
      const a = x >= bpp ? out[y * stride + x - bpp] : 0;
      const b = y > 0 ? out[(y - 1) * stride + x] : 0;
      const c = (x >= bpp && y > 0) ? out[(y - 1) * stride + x - bpp] : 0;
      let v;
      if (f === 0) v = cur; else if (f === 1) v = cur + a; else if (f === 2) v = cur + b;
      else if (f === 3) v = cur + ((a + b) >> 1); else if (f === 4) v = cur + paeth(a, b, c);
      else throw new Error('Filter tak diketahui: ' + f);
      out[y * stride + x] = v & 0xff;
    }
    pos += stride;
  }
  return { w, h, data: out };
}
function encodePng(w, h, rgba) {
  const stride = w * 4, raw = Buffer.alloc((stride + 1) * h);
  for (let y = 0; y < h; y++) { raw[y * (stride + 1)] = 0; rgba.copy(raw, y * (stride + 1) + 1, y * stride, (y + 1) * stride); }
  const chunk = (type, payload) => {
    const len = Buffer.alloc(4); len.writeUInt32BE(payload.length, 0);
    const body = Buffer.concat([Buffer.from(type, 'ascii'), payload]);
    const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(body), 0);
    return Buffer.concat([len, body, crc]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0); ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', zlib.deflateSync(raw, { level: 9 })),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

/* ---------------- helpers ---------------- */
const px = (im, x, y) => (y * im.w + x) * 4;
const cov = (im, x, y) => im.data[px(im, x, y) + 3] / 255;

function toCoverageAlpha(src) {
  // latar putih pekat -> alpha = kegelapan sesuatu piksel
  const out = Buffer.alloc(src.w * src.h * 4);
  const floor = 55; // luminans stroke paling gelap
  for (let i = 0; i < src.w * src.h; i++) {
    const L = (src.data[i * 4] + src.data[i * 4 + 1] + src.data[i * 4 + 2]) / 3;
    let a = (255 - L) / (255 - floor);
    a = Math.max(0, Math.min(1, a));
    out[i * 4 + 3] = Math.round(a * 255);
  }
  return { w: src.w, h: src.h, data: out };
}
function tint(im, rgb) {
  const out = Buffer.from(im.data);
  for (let i = 0; i < im.w * im.h; i++) { out[i * 4] = rgb[0]; out[i * 4 + 1] = rgb[1]; out[i * 4 + 2] = rgb[2]; }
  return { w: im.w, h: im.h, data: out };
}
function bands(im) {
  const list = []; let start = -1;
  for (let y = 0; y < im.h; y++) {
    let filled = false;
    for (let x = 0; x < im.w; x++) if (cov(im, x, y) > 0.05) { filled = true; break; }
    if (filled && start < 0) start = y;
    if (!filled && start >= 0) { list.push({ y0: start, y1: y - 1 }); start = -1; }
  }
  if (start >= 0) list.push({ y0: start, y1: im.h - 1 });
  return list;
}
function bbox(im, y0, y1) {
  let x0 = im.w, x1 = -1, top = y1, bot = y0;
  for (let y = y0; y <= y1; y++) for (let x = 0; x < im.w; x++) {
    if (cov(im, x, y) > 0.05) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < top) top = y; if (y > bot) bot = y; }
  }
  return { x0, x1, y0: top, y1: bot };
}
function crop(im, b) {
  const cw = b.x1 - b.x0 + 1, ch = b.y1 - b.y0 + 1, out = Buffer.alloc(cw * ch * 4);
  for (let y = 0; y < ch; y++) for (let x = 0; x < cw; x++) {
    const s = px(im, b.x0 + x, b.y0 + y), d = (y * cw + x) * 4;
    out[d] = im.data[s]; out[d + 1] = im.data[s + 1]; out[d + 2] = im.data[s + 2]; out[d + 3] = im.data[s + 3];
  }
  return { w: cw, h: ch, data: out };
}
function scale(src, tw, th) {
  const out = Buffer.alloc(tw * th * 4);
  for (let y = 0; y < th; y++) for (let x = 0; x < tw; x++) {
    const sx0 = Math.floor(x * src.w / tw), sx1 = Math.max(sx0 + 1, Math.floor((x + 1) * src.w / tw));
    const sy0 = Math.floor(y * src.h / th), sy1 = Math.max(sy0 + 1, Math.floor((y + 1) * src.h / th));
    let r = 0, g = 0, b = 0, a = 0, n = 0;
    for (let yy = sy0; yy < sy1; yy++) for (let xx = sx0; xx < sx1; xx++) {
      const i = (yy * src.w + xx) * 4, al = src.data[i + 3];
      r += src.data[i] * al; g += src.data[i + 1] * al; b += src.data[i + 2] * al; a += al; n++;
    }
    const o = (y * tw + x) * 4;
    if (a === 0) out[o + 3] = 0;
    else { out[o] = Math.round(r / a); out[o + 1] = Math.round(g / a); out[o + 2] = Math.round(b / a); out[o + 3] = Math.round(a / n); }
  }
  return { w: tw, h: th, data: out };
}
function onBackground(src, size, bg, padRatio) {
  const inner = Math.round(size * (1 - padRatio));
  const ratio = Math.min(inner / src.w, inner / src.h);
  const sw = Math.max(1, Math.round(src.w * ratio)), sh = Math.max(1, Math.round(src.h * ratio));
  const s = scale(src, sw, sh);
  const out = Buffer.alloc(size * size * 4);
  for (let i = 0; i < size * size; i++) {
    out[i * 4] = bg[0]; out[i * 4 + 1] = bg[1]; out[i * 4 + 2] = bg[2]; out[i * 4 + 3] = 255;
  }
  const ox = Math.floor((size - sw) / 2), oy = Math.floor((size - sh) / 2);
  for (let y = 0; y < sh; y++) for (let x = 0; x < sw; x++) {
    const si = (y * sw + x) * 4, d = ((oy + y) * size + (ox + x)) * 4;
    const a = s.data[si + 3] / 255;
    for (let k = 0; k < 3; k++) out[d + k] = Math.round(s.data[si + k] * a + out[d + k] * (1 - a));
  }
  return { w: size, h: size, data: out };
}

/* ---------------- jalankan ---------------- */
const src = decodePng(SRC);
const shape = toCoverageAlpha(src);           // alpha = bentuk, RGB masih asal
const dark = tint(shape, SLATE);              // slate telus
const white = tint(shape, [255, 255, 255]);   // putih telus

const bs = bands(shape);
console.log('Sumber ' + src.w + 'x' + src.h + ' · jalur kandungan: ' + bs.map(b => 'y' + b.y0 + '-' + b.y1).join(', '));
if (bs.length < 2) { console.error('!! Jangka 2 jalur (ikon + teks). Tukar ambang atau semak imej.'); process.exit(1); }

const iconBand = bs.reduce((a, b) => (b.y1 - b.y0) > (a.y1 - a.y0) ? b : a);
const textBand = bs.filter(b => b !== iconBand).sort((a, b) => a.y0 - b.y0)[0];
const iconBox = bbox(shape, iconBand.y0, iconBand.y1);
const textBox = bbox(shape, textBand.y0, textBand.y1);
const fullBox = bbox(shape, bs[0].y0, bs[bs.length - 1].y1);
console.log('Ikon x' + iconBox.x0 + '-' + iconBox.x1 + ' y' + iconBox.y0 + '-' + iconBox.y1 +
            '  ·  Teks x' + textBox.x0 + '-' + textBox.x1 + ' y' + textBox.y0 + '-' + textBox.y1);

const iconDark = crop(dark, iconBox), iconWhite = crop(white, iconBox);
const textDark = crop(dark, textBox);
const fullDark = crop(dark, fullBox), fullWhite = crop(white, fullBox);

// ikon pada kanvas segi sama (ruang tepi sekata supaya nampak seimbang dalam header)
function square(im) {
  const size = Math.max(im.w, im.h);
  const out = Buffer.alloc(size * size * 4);
  const ox = Math.floor((size - im.w) / 2), oy = Math.floor((size - im.h) / 2);
  for (let y = 0; y < im.h; y++) for (let x = 0; x < im.w; x++) {
    const s = (y * im.w + x) * 4, d = ((oy + y) * size + (ox + x)) * 4;
    out[d] = im.data[s]; out[d + 1] = im.data[s + 1]; out[d + 2] = im.data[s + 2]; out[d + 3] = im.data[s + 3];
  }
  return { w: size, h: size, data: out };
}
const iconDarkSq = square(iconDark), iconWhiteSq = square(iconWhite);

const files = {
  'logo-mark.png': iconDarkSq,
  'logo-mark-white.png': iconWhiteSq,
  'logo-full.png': fullDark,
  'logo-full-white.png': fullWhite,
  'logo-wordmark.png': textDark,
  'favicon-64.png': onBackground(iconDark, 64, [255, 255, 255], 0.16),
  'apple-touch-icon.png': onBackground(iconDark, 180, [255, 255, 255], 0.12)
};
for (const [name, im] of Object.entries(files)) fs.writeFileSync(OUT(name), encodePng(im.w, im.h, im.data));

// kad sosial 1200x630
const SW = 1200, SH = 630;
const og = onBackground(fullWhite, SH, BRAND, 0);
const ogFull = Buffer.alloc(SW * SH * 4);
for (let i = 0; i < SW * SH; i++) { ogFull[i * 4] = BRAND[0]; ogFull[i * 4 + 1] = BRAND[1]; ogFull[i * 4 + 2] = BRAND[2]; ogFull[i * 4 + 3] = 255; }
const ox0 = Math.floor((SW - SH) / 2);
for (let y = 0; y < SH; y++) for (let x = 0; x < SH; x++) {
  const s = (y * SH + x) * 4, d = (y * SW + ox0 + x) * 4;
  ogFull[d] = og.data[s]; ogFull[d + 1] = og.data[s + 1]; ogFull[d + 2] = og.data[s + 2];
}
fs.writeFileSync(OUT('logo-og.png'), encodePng(SW, SH, ogFull));
files['logo-og.png'] = { w: SW, h: SH, data: ogFull };

console.log('\nDijana ke images/:');
for (const [name, im] of Object.entries(files)) {
  console.log('  ' + name.padEnd(22) + im.w + 'x' + im.h + '  ' + (fs.statSync(OUT(name)).size / 1024).toFixed(1) + ' KB');
}

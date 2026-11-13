/* ============================================================
   KONFIGURASI TRACKING — satu tempat untuk label konversi.
   ------------------------------------------------------------
   Isi googleAdsConversionLabel apabila label tersedia.
   Contoh: googleAdsConversionLabel: 'AbCdEfGhIj-KLMNOP'

   Jika dibiarkan kosong:
   - Google Ads conversion TIDAK dihantar (tiada label).
   - GA4 generate_lead tetap dihantar jika GA4 ID dikonfigurasi.

   Fail ini dimuatkan sebelum tracking.js pada index.html,
   success.html dan waterproofing.html. Ia tidak di-cache lama
   (lihat _headers) supaya label boleh dikemas kini tanpa deploy
   semula keseluruhan laman.
   ============================================================ */
window.BINARUMAH_TRACKING_CONFIG = {
  googleAdsConversionLabel: ''
};

/* ============================================================
   binarumah.site — Google Ads / GA4 conversion tracking
   ------------------------------------------------------------
   Isi ID sebenar dalam <script>window.BINARUMAH_TRACKING</script>
   pada setiap halaman (index.html & success.html):

     googleAdsId:             "AW-XXXXXXXXXX"
     googleAdsConversionLabel:"AbCdEfGhIj-KLMNOP"
     ga4MeasurementId:        "G-XXXXXXXXXX"

   Jika ID dibiarkan kosong, tiada skrip Google dimuatkan dan
   tiada event dihantar. Ini mengelakkan data palsu semasa ujian.

   Konversi hanya dilepaskan pada halaman /success, iaitu selepas
   borang sah dihantar. index.html menetapkan binarumah_lead_pending
   dalam sessionStorage sebelum redirect; success.html hanya memanggil
   binarumahTrackConversion() jika tanda itu wujud. Ini mengelakkan
   konversi palsu daripada lawatan terus atau refresh halaman.
   Halaman /success juga noindex,nofollow dan no-store.
   ============================================================ */
(function () {
  'use strict';

  var cfg = window.BINARUMAH_TRACKING || {};
  var adsId = String(cfg.googleAdsId || '').trim();
  var adsLabel = String(cfg.googleAdsConversionLabel || '').trim();
  var ga4Id = String(cfg.ga4MeasurementId || '').trim();
  var primaryId = adsId || ga4Id;

  if (!primaryId) {
    // Tiada ID dikonfigurasi: fungsi kekal selamat dipanggil.
    window.binarumahTrackConversion = function () { return false; };
    return;
  }

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;

  gtag('js', new Date());
  if (adsId) gtag('config', adsId);
  if (ga4Id) gtag('config', ga4Id);

  var script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(primaryId);
  document.head.appendChild(script);

  /**
   * Lepaskan konversi Google Ads sekali sahaja bagi setiap penghantaran.
   * Borang memadam kunci ini sebelum redirect ke /success supaya
   * penghantaran seterusnya tetap dikira.
   */
  window.binarumahTrackConversion = function () {
    if (!adsId || !adsLabel) return false;

    try {
      if (window.sessionStorage.getItem('binarumah_conversion_fired') === '1') {
        return false;
      }
      window.sessionStorage.setItem('binarumah_conversion_fired', '1');
    } catch (err) {
      // sessionStorage mungkin disekat; event tetap dihantar sekali.
    }

    gtag('event', 'conversion', {
      send_to: adsId + '/' + adsLabel,
      event_category: 'lead',
      event_label: 'borang_sebut_harga'
    });

    if (ga4Id) {
      gtag('event', 'generate_lead', {
        form_name: 'sebut_harga',
        method: 'whatsapp'
      });
    }

    return true;
  };

  /* Klik WhatsApp boleh diukur sebagai mikro-konversi dalam GA4. */
  document.addEventListener('click', function (event) {
    var link = event.target.closest ? event.target.closest('a[href*="wa.me/"]') : null;
    if (!link || !ga4Id) return;
    gtag('event', 'whatsapp_click', {
      link_url: link.href,
      page_location: window.location.href
    });
  });
})();

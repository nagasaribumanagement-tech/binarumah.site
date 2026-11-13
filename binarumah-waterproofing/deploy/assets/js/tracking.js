/* ============================================================
   binarumah.site — Google Ads / GA4 conversion tracking
   ------------------------------------------------------------
   ID Google Ads dan GA4 ditetapkan dalam window.BINARUMAH_TRACKING
   pada index.html, success.html dan waterproofing.html.

   Label konversi Google Ads diisi dalam satu tempat sahaja:
   assets/js/tracking-config.js
     window.BINARUMAH_TRACKING_CONFIG.googleAdsConversionLabel

   Jika label kosong:
   - Google Ads conversion tidak dihantar (tiada label).
   - GA4 generate_lead tetap dihantar jika GA4 ID ada.

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

  function sendAdsConversion() {
    gtag('event', 'conversion', {
      send_to: adsId + '/' + adsLabel,
      event_category: 'lead',
      event_label: 'borang_sebut_harga'
    });
  }

  function sendGa4Lead() {
    gtag('event', 'generate_lead', {
      form_name: 'sebut_harga',
      method: 'whatsapp'
    });
  }

  /**
   * Lepaskan konversi sekali sahaja bagi setiap penghantaran.
   * Kunci Ads dan GA4 berasingan supaya label Ads boleh ditambah
   * kemudian tanpa menyekat event GA4 yang sudah berjalan.
   * Borang memadam kedua-dua kunci sebelum redirect ke /success.
   */
  window.binarumahTrackConversion = function () {
    var sent = false;

    if (adsId && adsLabel) {
      try {
        if (window.sessionStorage.getItem('binarumah_ads_conversion_fired') !== '1') {
          window.sessionStorage.setItem('binarumah_ads_conversion_fired', '1');
          sendAdsConversion();
          sent = true;
        }
      } catch (err) {
        // sessionStorage disekat: hantar sekali untuk page load ini.
        sendAdsConversion();
        sent = true;
      }
    }

    if (ga4Id) {
      try {
        if (window.sessionStorage.getItem('binarumah_ga4_lead_fired') !== '1') {
          window.sessionStorage.setItem('binarumah_ga4_lead_fired', '1');
          sendGa4Lead();
          sent = true;
        }
      } catch (err) {
        sendGa4Lead();
        sent = true;
      }
    }

    return sent;
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

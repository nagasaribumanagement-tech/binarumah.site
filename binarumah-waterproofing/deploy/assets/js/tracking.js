/* ============================================================
   BINARUMAH.SITE — WhatsApp click tracking (GTM-only)
   - Memantau semua pautan WhatsApp dan butang #waBtn.
   - Push `whatsapp_click` ke dataLayer tanpa menyekat navigasi.
   - Tiada gtag/GA4/Google Ads hardcoded di sini; GTM-MSG537M5
     yang menghantar tag berdasarkan event ini.
   ============================================================ */
(function () {
  "use strict";

  window.dataLayer = window.dataLayer || [];

  // Elak listener berganda jika skrip dimuatkan lebih daripada sekali.
  if (window.__binarumahWaTrackingBound) return;
  window.__binarumahWaTrackingBound = true;

  var WA_HOST_RE = /^(?:https?:)?\/\/(?:www\.)?(?:wa\.me|api\.whatsapp\.com|web\.whatsapp\.com)\//i;

  function trimText(value) {
    return (value || "").replace(/\s+/g, " ").trim();
  }

  // Satu format page_path untuk semua halaman:
  // /waterproofing.html -> /waterproofing
  // /blog/panduan-....html -> /blog/panduan-...
  // /index.html -> /
  function normalizePath(path) {
    var clean = (path || "/").split("?")[0].split("#")[0];
    if (!clean) return "/";

    clean = clean.replace(/\/index\.html$/i, "/");
    clean = clean.replace(/\.html$/i, "");
    if (clean.length > 1) clean = clean.replace(/\/+$/, "");

    return clean || "/";
  }

  function currentPagePath() {
    var explicit = document.body ? document.body.getAttribute("data-page-path") : "";
    return normalizePath(explicit && explicit.trim() ? explicit : window.location.pathname);
  }

  function findWhatsAppElement(eventTarget) {
    if (!eventTarget || typeof eventTarget.closest !== "function") return null;

    // Butang WhatsApp yang membuka pautan melalui JavaScript.
    var control = eventTarget.closest("#waBtn, [data-whatsapp]");
    if (control) return control;

    // Pautan WhatsApp biasa.
    var link = eventTarget.closest("a[href]");
    if (!link) return null;

    var href = (link.getAttribute("href") || "").trim();
    if (WA_HOST_RE.test(href) || /^whatsapp:/i.test(href)) return link;

    return null;
  }

  function sectionId(el) {
    var section = el.closest("section[id], header[id], footer[id], nav[id]");
    return section && section.id ? section.id : "";
  }

  function leadSource(el) {
    var explicit = el.getAttribute("data-lead-source");
    if (explicit && explicit.trim()) return explicit.trim();
    if (el.id) return el.id;

    // Fallback: guna id seksyen terdekat supaya lokasi butang masih jelas.
    var section = sectionId(el);
    if (section) return section;

    var text = trimText(el.textContent);
    return text ? text.slice(0, 80) : "whatsapp";
  }

  document.addEventListener(
    "click",
    function (event) {
      var el = findWhatsAppElement(event.target);
      if (!el) return;

      var link = el.closest("a[href]");
      var href = link ? (link.getAttribute("href") || "").trim() : "";
      var text = trimText(el.textContent);

      window.dataLayer.push({
        event: "whatsapp_click",
        lead_source: leadSource(el),
        section_id: sectionId(el),
        page_path: currentPagePath(),
        link_text: text ? text.slice(0, 80) : "",
        // Buang query (?text=...) supaya parameter event kekal ringkas.
        link_url: href ? href.split("?")[0] : ""
      });
    },
    false
  );
})();

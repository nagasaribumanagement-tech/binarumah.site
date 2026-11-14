/* ============================================================
   BINARUMAH.SITE — WhatsApp click tracking
   - Memantau semua pautan WhatsApp dan butang #waBtn.
   - Push ke dataLayer tanpa menyekat pembukaan WhatsApp.
   ============================================================ */
(function () {
  "use strict";

  window.dataLayer = window.dataLayer || [];

  // Elak listener berganda jika skrip dimuatkan lebih daripada sekali.
  if (window.__binarumahWaTrackingBound) return;
  window.__binarumahWaTrackingBound = true;

  function leadSource(el) {
    var explicit = el.getAttribute("data-lead-source");
    if (explicit && explicit.trim()) return explicit.trim();
    if (el.id) return el.id;

    var text = (el.textContent || "").replace(/\s+/g, " ").trim();
    return text ? text.slice(0, 80) : "whatsapp";
  }

  function currentPagePath() {
    var explicit = document.body ? document.body.getAttribute("data-page-path") : "";
    if (explicit && explicit.trim()) return explicit.trim();

    var path = window.location.pathname;
    if (/\/waterproofing(\.html)?$/.test(path)) return "/waterproofing";
    if (/\/success(\.html)?$/.test(path)) return "/success";
    return path;
  }

  document.addEventListener(
    "click",
    function (event) {
      var target = event.target;
      if (!target || typeof target.closest !== "function") return;

      var el = target.closest('a[href^="https://wa.me/"], #waBtn');
      if (!el) return;

      window.dataLayer.push({
        event: "whatsapp_click",
        lead_source: leadSource(el),
        page_path: currentPagePath()
      });
    },
    false
  );
})();

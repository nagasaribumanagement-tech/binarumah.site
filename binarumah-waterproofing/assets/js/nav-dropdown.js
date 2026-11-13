/* ============================================================
   BINARUMAH.SITE — dropdown "Perkhidmatan" (homepage)
   ============================================================ */
(function () {
  "use strict";

  var dropdowns = Array.prototype.slice.call(document.querySelectorAll("[data-nav-dd]"));

  function closeDropdown(dd) {
    var btn = dd.querySelector(".nav-dd__toggle");
    dd.classList.remove("is-open");
    if (btn) btn.setAttribute("aria-expanded", "false");
  }

  function closeAll(except) {
    dropdowns.forEach(function (dd) {
      if (dd !== except) closeDropdown(dd);
    });
  }

  dropdowns.forEach(function (dd) {
    var btn = dd.querySelector(".nav-dd__toggle");
    var panel = dd.querySelector(".nav-dd__panel");
    if (!btn || !panel) return;

    btn.addEventListener("click", function (event) {
      event.stopPropagation();
      var willOpen = !dd.classList.contains("is-open");
      closeAll(dd);
      dd.classList.toggle("is-open", willOpen);
      btn.setAttribute("aria-expanded", String(willOpen));
    });

    panel.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () {
        closeDropdown(dd);
      });
    });

    dd.addEventListener("focusout", function (event) {
      if (!dd.contains(event.relatedTarget)) closeDropdown(dd);
    });
  });

  document.addEventListener("click", function (event) {
    if (!event.target.closest("[data-nav-dd]")) closeAll(null);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;

    dropdowns.forEach(function (dd) {
      if (!dd.classList.contains("is-open")) return;
      var btn = dd.querySelector(".nav-dd__toggle");
      closeDropdown(dd);
      if (btn) btn.focus();
    });
  });
})();

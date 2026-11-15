/* ============================================================
   BINARUMAH.SITE — navigasi & interaksi
   - Dropdown "Perkhidmatan" (desktop)
   - Menu mobile + submenu accordion
   - Reveal-on-scroll (hormati prefers-reduced-motion)
   ============================================================ */
(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var mobileToggle = document.querySelector("[data-mobile-toggle]");
  var mobileNav = document.getElementById("mobileMenu");

  /* ---------- Shadow header ketika scroll ---------- */
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 8);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  /* ---------- Menu mobile ---------- */
  function closeMobileMenu() {
    if (!mobileNav || !mobileToggle) return;
    mobileNav.classList.remove("is-open");
    mobileToggle.setAttribute("aria-expanded", "false");
    mobileToggle.setAttribute("aria-label", "Buka menu navigasi");
    document.body.style.overflow = "";
  }

  if (mobileToggle && mobileNav) {
    mobileToggle.addEventListener("click", function () {
      var willOpen = !mobileNav.classList.contains("is-open");
      mobileNav.classList.toggle("is-open", willOpen);
      mobileToggle.setAttribute("aria-expanded", String(willOpen));
      mobileToggle.setAttribute("aria-label", willOpen ? "Tutup menu navigasi" : "Buka menu navigasi");
      if (willOpen) {
        document.body.style.overflow = "hidden";
      } else {
        document.body.style.overflow = "";
      }
    });

    mobileNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeMobileMenu);
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth >= 1024) closeMobileMenu();
    });
  }

  /* ---------- Accordion "Perkhidmatan" (mobile) ---------- */
  document.querySelectorAll("[data-mobile-sub]").forEach(function (sub) {
    var toggle = sub.querySelector(".mobile-sub__toggle");
    if (!toggle) return;

    toggle.addEventListener("click", function () {
      var willOpen = !sub.classList.contains("is-open");
      sub.classList.toggle("is-open", willOpen);
      toggle.setAttribute("aria-expanded", String(willOpen));
    });
  });

  /* ---------- Dropdown desktop ---------- */
  var dropdowns = Array.prototype.slice.call(document.querySelectorAll("[data-dropdown]"));

  function closeDropdown(dd) {
    var btn = dd.querySelector(".nav-dropdown__toggle");
    dd.classList.remove("is-open");
    if (btn) btn.setAttribute("aria-expanded", "false");
  }

  function closeAllDropdowns(except) {
    dropdowns.forEach(function (dd) {
      if (dd !== except) closeDropdown(dd);
    });
  }

  dropdowns.forEach(function (dd) {
    var btn = dd.querySelector(".nav-dropdown__toggle");
    var panel = dd.querySelector(".nav-dropdown__panel");
    if (!btn || !panel) return;

    btn.addEventListener("click", function (event) {
      event.stopPropagation();
      var willOpen = !dd.classList.contains("is-open");
      closeAllDropdowns(dd);
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
    if (!event.target.closest("[data-dropdown]")) closeAllDropdowns(null);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;

    var open = dropdowns.filter(function (dd) {
      return dd.classList.contains("is-open");
    });

    open.forEach(function (dd) {
      var btn = dd.querySelector(".nav-dropdown__toggle");
      closeDropdown(dd);
      if (btn) btn.focus();
    });

    if (mobileNav && mobileNav.classList.contains("is-open")) {
      closeMobileMenu();
      if (mobileToggle) mobileToggle.focus();
    }
  });

  /* ---------- Reveal on scroll ---------- */
  var revealItems = document.querySelectorAll(".reveal");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (!("IntersectionObserver" in window) || reduceMotion) {
    revealItems.forEach(function (el) {
      el.classList.add("in");
    });
  } else {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            observer.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 }
    );

    revealItems.forEach(function (el) {
      observer.observe(el);
    });
  }

  /* ---------- Borang sebut harga waterproofing ---------- */
  var wpLead = document.getElementById("wpLeadForm");
  if (wpLead) {
    wpLead.addEventListener("submit", function (event) {
      event.preventDefault();

      var nama = document.getElementById("wpNama");
      var tel = document.getElementById("wpTel");
      var consent = document.getElementById("wpConsent");
      var msgEl = document.getElementById("wpLeadMsg");
      var namaVal = nama ? nama.value.trim() : "";
      var telVal = tel ? tel.value.trim() : "";

      function showError(message) {
        if (!msgEl) return;
        msgEl.textContent = message;
        msgEl.classList.add("is-error");
      }

      if (!namaVal || !telVal) {
        showError("Sila isi nama dan nombor telefon supaya kami boleh menghubungi anda.");
        if (namaVal && tel) {
          tel.focus();
        } else if (nama) {
          nama.focus();
        }
        return;
      }

      if (!consent || !consent.checked) {
        showError("Sila tandakan persetujuan Dasar Privasi dan Terma & Syarat sebelum menghantar.");
        if (consent) consent.focus();
        return;
      }

      var kawasan = document.getElementById("wpKawasan");
      var jenis = document.getElementById("wpJenis");
      var mesej = document.getElementById("wpMesej");

      var text =
        "Hai Binarumah! Saya nak sebut harga Sistem Waterproofing.%0A%0A" +
        "Nama: " + encodeURIComponent(namaVal) + "%0A" +
        "Telefon: " + encodeURIComponent(telVal) + "%0A" +
        "Kawasan: " + encodeURIComponent(kawasan ? kawasan.value : "-") + "%0A" +
        "Jenis masalah: " + encodeURIComponent(jenis ? jenis.value : "-") + "%0A" +
        "Keterangan: " + encodeURIComponent((mesej && mesej.value.trim()) || "-") + "%0A%0A" +
        "Saya mohon lawatan tapak dan sebut harga bertulis.";

      if (msgEl) {
        msgEl.classList.remove("is-error");
        msgEl.textContent = "Berjaya! Membuka WhatsApp dan mengalihkan anda ke halaman terima kasih…";
      }

      // Konversi dihantar di sini, sebelum redirect. Halaman /success tidak
      // lagi push generate_lead supaya tiada double tracking.
      var pagePath = window.location.pathname.replace(/\/index\.html$/i, "/").replace(/\.html$/i, "");
      if (pagePath.length > 1) pagePath = pagePath.replace(/\/+$/, "");

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({
        event: "generate_lead",
        form_name: "binarumah_quote_form",
        form_location: "waterproofing_quote_form",
        lead_source: "wp_lead_form",
        page_path: pagePath || "/"
      });

      // Buang tanda lama (jika ada) supaya halaman /success versi cache
      // tidak mencetuskan konversi kedua.
      try {
        window.sessionStorage.removeItem("binarumah_lead_pending");
      } catch (err) {}

      // Buka WhatsApp dalam tab baharu, kemudian bawa tab ini ke /success.
      window.open("https://wa.me/601155919344?text=" + text, "_blank", "noopener");

      window.setTimeout(function () {
        window.location.assign("/success");
      }, 450);
    });
  }

  /* ---------- Tahun semasa di footer ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();

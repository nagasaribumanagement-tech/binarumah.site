/* Navigasi ringkas untuk halaman dalaman (privacy, terms, success). */
(function () {
  'use strict';

  var menuBtn = document.getElementById('menuBtn');
  var mobileMenu = document.getElementById('mobileMenu');

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () {
      var open = !mobileMenu.classList.toggle('hidden');
      menuBtn.setAttribute('aria-expanded', String(open));
      document.body.classList.toggle('mobile-menu-open', open);
    });

    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.classList.add('hidden');
        menuBtn.setAttribute('aria-expanded', 'false');
        document.body.classList.remove('mobile-menu-open');
      });
    });
  }

  var header = document.getElementById('siteHeader');
  if (header) {
    var onScroll = function () {
      header.classList.toggle('shadow-card', window.scrollY > 8);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  document.querySelectorAll('.tahunSemasa').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();

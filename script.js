/* ==========================================================
   IMD 318 | Personal website script (shared by every page)
   1. Live clock
   2. Greeting notification (shown once per visit)
   3. Back-to-top button
   4. Text size and high-contrast options
   5. Scroll reveal animation
   6. Responsive image map (home page)
   7. Sitemap search
   ========================================================== */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Storage helpers: they never crash the page if storage is blocked */
  function getSaved(key) { try { return window.localStorage.getItem(key); } catch (e) { return null; } }
  function save(key, value) { try { window.localStorage.setItem(key, value); } catch (e) { /* ignore */ } }

  /* ---------- 1. Live clock ---------- */
  var clock = document.getElementById('clock');
  if (clock) {
    var showTime = function () {
      var now = new Date();
      clock.textContent =
        now.toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }) +
        ' | ' + now.toLocaleTimeString('en-GB');
    };
    showTime();
    setInterval(showTime, 1000);
  }

  /* ---------- 2. Greeting notification ---------- */
  var toast = document.getElementById('toast');
  var greeted = false;
  try { greeted = window.sessionStorage.getItem('greeted') === 'yes'; } catch (e) { greeted = false; }

  if (toast && !greeted) {
    var hour = new Date().getHours();
    var greeting = hour < 12 ? 'Good morning' : (hour < 18 ? 'Good afternoon' : 'Good evening');

    var message = document.createElement('p');
    message.textContent = greeting + '! Welcome to my personal website.';

    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'toast-close';
    close.setAttribute('aria-label', 'Close notification');
    close.textContent = '\u00D7';

    var hideToast = function () { toast.hidden = true; };
    close.addEventListener('click', hideToast);

    toast.appendChild(message);
    toast.appendChild(close);
    toast.hidden = false;
    setTimeout(hideToast, 7000);

    try { window.sessionStorage.setItem('greeted', 'yes'); } catch (e) { /* ignore */ }
  }

  /* ---------- 3. Back-to-top button ---------- */
  var toTop = document.getElementById('to-top');
  if (toTop) {
    window.addEventListener('scroll', function () {
      toTop.hidden = window.scrollY < 400;
    }, { passive: true });

    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ---------- 4. Text size and high contrast ---------- */
  var size = parseInt(getSaved('fontPercent') || '100', 10);
  if (isNaN(size)) { size = 100; }

  function applySize() {
    root.style.fontSize = size + '%';
    save('fontPercent', String(size));
  }
  if (size !== 100) { applySize(); }

  var smaller = document.getElementById('text-smaller');
  var larger = document.getElementById('text-larger');
  if (smaller) { smaller.addEventListener('click', function () { size = Math.max(85, size - 10); applySize(); }); }
  if (larger)  { larger.addEventListener('click',  function () { size = Math.min(140, size + 10); applySize(); }); }

  var contrast = document.getElementById('contrast-toggle');
  function setContrast(on) {
    root.classList.toggle('hc', on);
    if (contrast) { contrast.setAttribute('aria-pressed', on ? 'true' : 'false'); }
    save('highContrast', on ? 'yes' : 'no');
  }
  if (getSaved('highContrast') === 'yes') { setContrast(true); }
  if (contrast) {
    contrast.addEventListener('click', function () { setContrast(!root.classList.contains('hc')); });
  }

  /* ---------- 5. Scroll reveal animation ---------- */
  var revealTargets = document.querySelectorAll(
    '.section-head, .about-grid, .exp-card, .ach-card, .skill, .timeline > li, .table-wrap, ' +
    '.explore-card, .two-col > div, .family-photo, .audio-box, .video-frame'
  );
  if ('IntersectionObserver' in window && !reduceMotion) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealTargets.forEach(function (el) {
      el.classList.add('reveal');
      observer.observe(el);
    });
  }

  /* ---------- 6. Responsive image map ---------- */
  var banner = document.querySelector('img[usemap="#bannermap"]');
  var map = document.getElementById('bannermap');
  if (banner && map) {
    var areas = map.querySelectorAll('area');
    var BASE_WIDTH = 1024;                      /* width the coordinates were written for */

    areas.forEach(function (area) {
      area.setAttribute('data-coords', area.getAttribute('coords'));
    });

    var scaleMap = function () {
      var ratio = banner.clientWidth / BASE_WIDTH;
      areas.forEach(function (area) {
        var scaled = area.getAttribute('data-coords').split(',').map(function (n) {
          return Math.round(Number(n) * ratio);
        });
        area.setAttribute('coords', scaled.join(','));
      });
    };

    banner.addEventListener('load', scaleMap);
    window.addEventListener('resize', scaleMap);
    scaleMap();
  }

  /* ---------- 7. Sitemap search ---------- */
  var searchBox = document.getElementById('sitemap-search');
  var status = document.getElementById('sitemap-status');
  if (searchBox) {
    var pages = document.querySelectorAll('.sitemap-page');

    searchBox.addEventListener('input', function () {
      var query = searchBox.value.trim().toLowerCase();
      var found = 0;

      pages.forEach(function (page) {
        var pageName = page.firstElementChild.textContent.toLowerCase();
        var pageMatches = pageName.indexOf(query) !== -1;
        var anySub = false;

        page.querySelectorAll('.sitemap-sub li').forEach(function (item) {
          var show = pageMatches || item.textContent.toLowerCase().indexOf(query) !== -1;
          item.hidden = !show;
          if (show) { anySub = true; }
        });

        page.hidden = !(pageMatches || anySub);
        if (!page.hidden) { found += 1; }
      });

      status.textContent = query ? found + ' page(s) found' : '';
    });
  }
})();

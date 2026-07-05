/* ==========================================================================
   Nunez & Sons Plumbing — script.js
   Vanilla JS. Loaded with `defer` on every page; each module bails out
   quietly when its elements aren't present on the current page.
   ========================================================================== */

(function () {
  'use strict';

  var REDUCED = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DESKTOP = 900; /* must match the CSS nav/bottom-bar breakpoint */

  /* ------------------------------------------------------------------
     Sticky header: solid background + shrink once the page scrolls
     ------------------------------------------------------------------ */
  function initHeader() {
    var header = document.querySelector('.site-header');
    if (!header) return;

    var ticking = false;

    function update() {
      header.classList.toggle('is-scrolled', window.scrollY > 8);
      ticking = false;
    }

    window.addEventListener('scroll', function () {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    }, { passive: true });

    update();
  }

  /* ------------------------------------------------------------------
     Mobile navigation (hamburger)
     ------------------------------------------------------------------ */
  function initMobileNav() {
    var header = document.querySelector('.site-header');
    var toggle = document.querySelector('.nav-toggle');
    var nav = document.getElementById('site-nav');
    if (!header || !toggle || !nav) return;

    function setOpen(open) {
      nav.classList.toggle('is-open', open);
      header.classList.toggle('nav-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    function isOpen() {
      return nav.classList.contains('is-open');
    }

    toggle.addEventListener('click', function () {
      setOpen(!isOpen());
    });

    nav.addEventListener('click', function (event) {
      if (event.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (event) {
      if (event.key === 'Escape' && isOpen()) {
        setOpen(false);
        toggle.focus();
      }
    });

    window.addEventListener('resize', function () {
      if (window.innerWidth >= DESKTOP && isOpen()) setOpen(false);
    });
  }

  /* ------------------------------------------------------------------
     Scroll reveal (fade / slide-up)
     ------------------------------------------------------------------ */
  function initScrollReveal() {
    var nodes = document.querySelectorAll('.reveal');
    if (!nodes.length) return;

    if (REDUCED || !('IntersectionObserver' in window)) {
      nodes.forEach(function (node) { node.classList.add('is-visible'); });
      return;
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -10% 0px' });

    nodes.forEach(function (node) { observer.observe(node); });
  }

  /* ------------------------------------------------------------------
     Animated stat counters
     ------------------------------------------------------------------ */
  function initCounters() {
    var counters = document.querySelectorAll('.stat-number[data-target]');
    if (!counters.length) return;

    function finalText(el) {
      return el.getAttribute('data-target') + (el.getAttribute('data-suffix') || '');
    }

    if (REDUCED || !('IntersectionObserver' in window)) {
      counters.forEach(function (el) { el.textContent = finalText(el); });
      return;
    }

    function animate(el) {
      var target = parseInt(el.getAttribute('data-target'), 10);
      var suffix = el.getAttribute('data-suffix') || '';
      var duration = 1200;
      var start = null;

      if (isNaN(target)) {
        el.textContent = finalText(el);
        return;
      }

      function step(timestamp) {
        if (start === null) start = timestamp;
        var progress = Math.min((timestamp - start) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target) + suffix;
        if (progress < 1) window.requestAnimationFrame(step);
      }

      window.requestAnimationFrame(step);
    }

    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          observer.unobserve(entry.target); /* fire once, never re-trigger */
          animate(entry.target);
        }
      });
    }, { threshold: 0.4 });

    counters.forEach(function (el) { observer.observe(el); });
  }

  /* ------------------------------------------------------------------
     Smooth scroll for same-page anchors (offset handled by CSS
     scroll-margin-top; focus moved for keyboard users)
     ------------------------------------------------------------------ */
  function initSmoothScroll() {
    var links = document.querySelectorAll('a[href^="#"]');
    if (!links.length) return;

    links.forEach(function (link) {
      link.addEventListener('click', function (event) {
        var hash = link.getAttribute('href');
        if (!hash || hash.length < 2) return;

        var target = document.getElementById(hash.slice(1));
        if (!target) return;

        event.preventDefault();
        target.scrollIntoView({ behavior: REDUCED ? 'auto' : 'smooth' });
        window.history.pushState(null, '', hash);
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      });
    });
  }

  /* ------------------------------------------------------------------
     Gallery lightbox (keyboard + tap to close)
     ------------------------------------------------------------------ */
  function initLightbox() {
    var items = Array.prototype.slice.call(document.querySelectorAll('.gallery-item'));
    var lightbox = document.getElementById('lightbox');
    if (!items.length || !lightbox) return;

    var image = document.getElementById('lightbox-image');
    var caption = document.getElementById('lightbox-caption');
    var closeBtn = lightbox.querySelector('.lightbox-close');
    var prevBtn = lightbox.querySelector('.lightbox-prev');
    var nextBtn = lightbox.querySelector('.lightbox-next');
    var current = 0;
    var lastFocused = null;

    function captionFor(item) {
      var title = item.querySelector('.cap-title');
      var meta = item.querySelector('.cap-meta');
      var parts = [];
      if (title) parts.push(title.textContent.trim());
      if (meta) parts.push(meta.textContent.trim());
      return parts.join(' — ');
    }

    function show(index) {
      current = (index + items.length) % items.length;
      var item = items[current];
      var thumb = item.querySelector('img');
      image.src = item.getAttribute('href');
      image.alt = thumb ? thumb.alt : '';
      caption.textContent = captionFor(item);
    }

    function open(index, opener) {
      lastFocused = opener || null;
      show(index);
      lightbox.hidden = false;
      document.body.classList.add('lightbox-open');
      closeBtn.focus();
    }

    function close() {
      lightbox.hidden = true;
      document.body.classList.remove('lightbox-open');
      image.removeAttribute('src');
      if (lastFocused) lastFocused.focus();
    }

    items.forEach(function (item, index) {
      item.addEventListener('click', function (event) {
        event.preventDefault();
        open(index, item);
      });
    });

    closeBtn.addEventListener('click', close);
    prevBtn.addEventListener('click', function () { show(current - 1); });
    nextBtn.addEventListener('click', function () { show(current + 1); });

    /* Tap/click on the dark backdrop (not the photo or buttons) closes */
    lightbox.addEventListener('click', function (event) {
      if (event.target === lightbox) close();
    });

    document.addEventListener('keydown', function (event) {
      if (lightbox.hidden) return;

      if (event.key === 'Escape') {
        close();
      } else if (event.key === 'ArrowRight') {
        show(current + 1);
      } else if (event.key === 'ArrowLeft') {
        show(current - 1);
      } else if (event.key === 'Tab') {
        /* Keep focus cycling inside the dialog */
        var focusables = [closeBtn, prevBtn, nextBtn];
        var index = focusables.indexOf(document.activeElement);
        if (event.shiftKey) {
          event.preventDefault();
          focusables[(index - 1 + focusables.length) % focusables.length].focus();
        } else {
          event.preventDefault();
          focusables[(index + 1) % focusables.length].focus();
        }
      }
    });
  }

  initHeader();
  initMobileNav();
  initScrollReveal();
  initCounters();
  initSmoothScroll();
  initLightbox();
})();

// Hero video: intentionally NOT autoplay/preload in HTML (see comment on the <video>
// tag itself) - it would compete with and beat the static hero <img> for Largest
// Contentful Paint. Started here, after the page has already loaded, as a progressive
// enhancement layered on top of the (already fully visible) static image.
const heroVideo = document.getElementById('heroVideo');
if (heroVideo && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const startHeroVideo = () => {
    // Source files attached here, not in the HTML - see the comment on the <video> tag
    // itself for why (poster stays eager, only the heavy video download is deferred).
    const webm = document.createElement('source');
    webm.src = heroVideo.dataset.webm;
    webm.type = 'video/webm';
    const mp4 = document.createElement('source');
    mp4.src = heroVideo.dataset.mp4;
    mp4.type = 'video/mp4';
    heroVideo.append(webm, mp4);
    heroVideo.load();
    heroVideo.play().catch(() => {});
  };
  let heroVideoStarted = false;
  const startHeroVideoOnce = () => { if (!heroVideoStarted) { heroVideoStarted = true; startHeroVideo(); } };
  if (document.readyState === 'complete') startHeroVideoOnce();
  else window.addEventListener('load', startHeroVideoOnce);
  // Hard fallback: a hung third-party script (e.g. the booking widget) can keep window
  // 'load' from ever firing (same issue the preloader below already guards against) -
  // don't let that also permanently block the hero video from ever starting.
  setTimeout(startHeroVideoOnce, 2500);
}

const preloader = document.getElementById('preloader');
if (preloader) {
  const preloaderStart = Date.now();
  let preloaderHidden = false;
  const hidePreloader = () => {
    if (preloaderHidden) return;
    preloaderHidden = true;
    const wait = Math.max(0, 550 - (Date.now() - preloaderStart));
    setTimeout(() => {
      preloader.classList.add('hide');
      setTimeout(() => preloader.remove(), 700);
    }, wait);
  };
  if (document.readyState === 'complete') hidePreloader();
  else window.addEventListener('load', hidePreloader);
  // Hard fallback: a hung third-party script (e.g. the booking widget) can keep
  // window 'load' from ever firing, which would otherwise spin the preloader
  // forever over a page that's actually fully rendered and usable underneath.
  setTimeout(hidePreloader, 4000);
}

document.querySelectorAll('.js-form-started').forEach(el => el.value = Date.now());

const lightbox = document.getElementById('lightbox');
if (lightbox) {
  const lbImg = document.getElementById('lightboxImg');
  const galleryLinks = Array.from(document.querySelectorAll('.gallery-grid a'));
  let lbIndex = 0;
  const openLightbox = (i) => {
    lbIndex = i;
    const link = galleryLinks[lbIndex];
    lbImg.src = link.getAttribute('href');
    lbImg.alt = link.querySelector('img')?.alt || '';
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
  };
  const closeLightbox = () => {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
  };
  const showRelative = (delta) => openLightbox((lbIndex + delta + galleryLinks.length) % galleryLinks.length);
  galleryLinks.forEach((link, i) => {
    link.addEventListener('click', (e) => { e.preventDefault(); openLightbox(i); });
  });
  document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
  document.getElementById('lightboxPrev').addEventListener('click', () => showRelative(-1));
  document.getElementById('lightboxNext').addEventListener('click', () => showRelative(1));
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    else if (e.key === 'ArrowLeft') showRelative(-1);
    else if (e.key === 'ArrowRight') showRelative(1);
  });
  const navBtns = document.querySelectorAll('.lightbox-nav');
  if (galleryLinks.length <= 1) navBtns.forEach(b => b.style.display = 'none');
}

const siteHeader = document.getElementById('siteHeader');
const updateHeaderScrolled = () => {
  if (window.scrollY > 60) siteHeader.classList.add('scrolled');
  else siteHeader.classList.remove('scrolled');
};
// Run once immediately, not just on the 'scroll' event - a page refresh while
// already scrolled down (browser scroll-restoration) leaves scrollY > 60 on load
// without ever firing a 'scroll' event, which left the header stuck transparent.
updateHeaderScrolled();
window.addEventListener('scroll', updateHeaderScrolled, { passive: true });

const burger = document.getElementById('burgerBtn');
const mmenu = document.getElementById('mobileMenu');
if (burger) {
  const setDrawer = (open) => {
    mmenu.classList.toggle('open', open);
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Zamknij menu' : 'Otwórz menu');
    // Full-screen drawer over content - lock body scroll while it's open, same as the lightbox.
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setDrawer(!mmenu.classList.contains('open')));
  mmenu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setDrawer(false)));
}
const mmOferta = document.getElementById('mmOferta');
if (mmOferta) {
  const mmToggleBtn = mmOferta.querySelector('.mm-toggle');
  mmToggleBtn.addEventListener('click', () => {
    const open = mmOferta.classList.toggle('open');
    mmToggleBtn.setAttribute('aria-expanded', String(open));
  });
}

const revealEls = document.querySelectorAll('.reveal');
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
revealEls.forEach(el => io.observe(el));

// Scrollspy for .article-toc-box (shared by blog-post TOC and menu category nav):
// highlights the sidebar link for whichever heading is currently near the top of
// the viewport, so a long single-column list (menu items, article body) still
// shows the reader where they are without scrolling back up to the sidebar.
const tocLinks = document.querySelectorAll('.article-toc-box a[href^="#"]');
if (tocLinks.length) {
  const tocTargets = Array.from(tocLinks)
    .map(a => document.getElementById(a.getAttribute('href').slice(1)))
    .filter(Boolean);
  const setActive = (id) => {
    tocLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + id));
  };
  const spy = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) setActive(entry.target.id);
    });
  }, { rootMargin: '-96px 0px -70% 0px', threshold: 0 });
  tocTargets.forEach(t => spy.observe(t));
}

// Promo modal - auto-show after 7s or 30% scroll, then 24h cooldown, then
// permanent dismiss once the visitor actually closes it. Same mechanic as
// magic-gym-bialystok's padel-modal.js; content/on-off comes from MODAL_CONFIG
// in build.py (see promo-modal markup in FOOTER_SCRIPT), this file only owns
// the show/hide behavior, never the copy.
(() => {
  const modal = document.querySelector('[data-promo-modal]');
  if (!modal) return; // MODAL_CONFIG.enabled = False -> markup isn't even rendered

  const STORAGE_KEY = 'kempen_promo_modal_seen_v1';
  const DISMISSED_KEY = 'kempen_promo_modal_dismissed';
  const COOLDOWN_MS = 24 * 60 * 60 * 1000;
  const TIME_TRIGGER_MS = 7000;
  const SCROLL_TRIGGER_PCT = 30;
  const EXIT_ANIM_MS = 300;
  // Don't show the "zarezerwuj" popup to someone already on the reservation
  // page, or mid-way through a form (kontakt) - redundant/annoying there.
  const BLACKLIST = ['/rezerwacja', '/kontakt'];

  const isLocalhost = /localhost|127\.0\.0\.1|\.local$/.test(window.location.hostname);
  const isBlacklistedPath = () => {
    const path = window.location.pathname.replace(/\/$/, '') || '/';
    return BLACKLIST.some(p => path === p || path.startsWith(p + '/'));
  };
  const safeGet = (k) => { try { return localStorage.getItem(k); } catch { return null; } };
  const safeSet = (k, v) => { try { localStorage.setItem(k, v); } catch {} };
  const isDismissedForever = () => safeGet(DISMISSED_KEY) === '1';
  const markDismissedForever = () => safeSet(DISMISSED_KEY, '1');
  const markSeen = () => safeSet(STORAGE_KEY, String(Date.now()));
  const isCooledDown = () => {
    if (isDismissedForever()) return false;
    if (isLocalhost) return true; // dev: skip the 24h wait, still respects a real dismiss
    const ts = Number(safeGet(STORAGE_KEY));
    if (!Number.isFinite(ts)) return true;
    return Date.now() - ts > COOLDOWN_MS;
  };
  const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (isBlacklistedPath() || !isCooledDown()) return;

  let shown = false, triggered = false, returnFocusTo = null;

  const show = () => {
    if (shown) return;
    shown = true;
    returnFocusTo = document.activeElement;
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    modal.querySelector('[data-promo-close]')?.focus();
  };
  const finalizeHide = () => {
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('is-closing');
    document.body.style.overflow = '';
    markSeen();
    markDismissedForever();
    returnFocusTo?.focus?.();
  };
  const hide = () => {
    if (!shown) return;
    shown = false;
    modal.classList.add('is-closing');
    if (prefersReducedMotion()) finalizeHide();
    else setTimeout(finalizeHide, EXIT_ANIM_MS);
  };

  modal.querySelectorAll('[data-promo-close], [data-promo-cta="dismiss"]').forEach(el => {
    el.addEventListener('click', hide);
  });
  modal.querySelectorAll('[data-promo-cta="primary"]').forEach(el => {
    el.addEventListener('click', markSeen);
  });
  modal.addEventListener('click', (e) => { if (e.target === modal) hide(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && shown) hide(); });

  const timeTimer = setTimeout(() => { if (!triggered) { triggered = true; show(); } }, TIME_TRIGGER_MS);

  let rafQueued = false;
  window.addEventListener('scroll', () => {
    if (triggered || rafQueued) return;
    rafQueued = true;
    requestAnimationFrame(() => {
      rafQueued = false;
      if (triggered) return;
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      if ((window.scrollY / max) * 100 >= SCROLL_TRIGGER_PCT) {
        triggered = true;
        clearTimeout(timeTimer);
        show();
      }
    });
  }, { passive: true });
})();

/* ============================================================
   AJO Savings — Landing Page JS  (landing.js)
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Navbar scroll shadow ───────────────────────────────── */
  const nav = document.getElementById('lpNav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  /* ── Mobile menu (hamburger / drawer) ───────────────────── */
  const hamburger  = document.getElementById('lpHamburger');
  const drawer     = document.getElementById('lpDrawer');
  const overlay    = document.getElementById('lpOverlay');
  const closeBtn   = document.getElementById('lpDrawerClose');

  function openDrawer() {
    drawer.classList.add('open');
    overlay.classList.add('visible');
    hamburger.setAttribute('aria-expanded', 'true');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeDrawer() {
    drawer.classList.remove('open');
    overlay.classList.remove('visible');
    hamburger.setAttribute('aria-expanded', 'false');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', openDrawer);
  closeBtn.addEventListener('click', closeDrawer);
  overlay.addEventListener('click', closeDrawer);

  // Close drawer when a link inside it is clicked
  drawer.querySelectorAll('a').forEach(a => a.addEventListener('click', closeDrawer));

  /* ── Smooth scroll for all in-page anchor links ─────────── */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', e => {
      const id = link.getAttribute('href');
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      const offset = nav.offsetHeight + 12;
      window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
    });
  });

  /* ── Stats counter animation ─────────────────────────────── */
  function animateCounter(el) {
    const target   = parseInt(el.dataset.target, 10);
    const prefix   = el.dataset.prefix || '';
    const suffix   = el.dataset.suffix || '';
    const duration = 1800;
    let start = null;

    function step(ts) {
      if (!start) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      const eased    = 1 - Math.pow(1 - progress, 3);
      el.textContent = prefix + Math.floor(eased * target).toLocaleString('en-NG') + suffix;
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = prefix + target.toLocaleString('en-NG') + suffix;
    }

    requestAnimationFrame(step);
  }

  const statEls = document.querySelectorAll('.lp-stat__num[data-target]');

  if ('IntersectionObserver' in window) {
    const statsObs = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          statsObs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });

    statEls.forEach(el => statsObs.observe(el));
  } else {
    statEls.forEach(el => {
      const t = el.dataset.target;
      const p = el.dataset.prefix || '';
      const s = el.dataset.suffix || '';
      el.textContent = p + parseInt(t, 10).toLocaleString('en-NG') + s;
    });
  }

});

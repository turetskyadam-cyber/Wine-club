/* ============================================================
   THE WINE ROOM — WINE CLUB
   main.js
   ============================================================ */

(function () {
  'use strict';

  /* ----------------------------------------------------------
     1. INTERSECTION OBSERVER — entrance animations
     ---------------------------------------------------------- */
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('[data-animate], [data-animate-stagger]').forEach((el) => {
    observer.observe(el);
  });

  /* ----------------------------------------------------------
     2. COUNTER ANIMATION — record strip numbers
     ---------------------------------------------------------- */
  const counterObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const target = entry.target;
        const end = parseInt(target.dataset.count, 10);
        if (isNaN(end)) return;
        animateCounter(target, end);
        counterObserver.unobserve(target);
      });
    },
    { threshold: 0.5 }
  );

  document.querySelectorAll('[data-count]').forEach((el) => counterObserver.observe(el));

  function animateCounter(el, end) {
    const duration = 1600;
    const startTime = performance.now();
    const easeOut = (t) => 1 - Math.pow(1 - t, 3);

    function update(now) {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.round(easeOut(progress) * end);
      el.textContent = current.toLocaleString();
      if (progress < 1) requestAnimationFrame(update);
    }
    requestAnimationFrame(update);
  }

  /* ----------------------------------------------------------
     3. STICKY NAV — transparent → solid on scroll
     ---------------------------------------------------------- */
  const nav = document.getElementById('site-nav');
  const hero = document.getElementById('hero');

  if (nav && hero) {
    const heroObserver = new IntersectionObserver(
      ([entry]) => {
        nav.classList.toggle('is-scrolled', !entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    heroObserver.observe(hero);
  }

  /* ----------------------------------------------------------
     4. PARALLAX — hero badge wrapper translateY only (spin lives in CSS)
        Badge spin is handled by CSS .badge-spin-wrap animation.
        JS only moves the wrapper vertically — no transform conflict.
     ---------------------------------------------------------- */
  const badgeWrap = document.querySelector('.hero-badge-wrap');
  const isDesktop = window.matchMedia('(min-width: 769px)');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  if (badgeWrap && isDesktop.matches && !prefersReducedMotion.matches) {
    let ticking = false;
    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          requestAnimationFrame(() => {
            const y = window.scrollY;
            if (y < window.innerHeight * 1.2) {
              badgeWrap.style.transform = `translateY(${y * 0.12}px)`;
            }
            ticking = false;
          });
          ticking = true;
        }
      },
      { passive: true }
    );
  }

  /* ----------------------------------------------------------
     5. 3D CARD TILT — wine card mockup follows cursor
     ---------------------------------------------------------- */
  const cardMockup = document.getElementById('cardMockup');
  if (cardMockup) {
    cardMockup.addEventListener('mousemove', (e) => {
      if (prefersReducedMotion.matches) return;
      const rect = cardMockup.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) / (rect.width / 2);
      const dy = (e.clientY - cy) / (rect.height / 2);
      const rotX = -dy * 10;
      const rotY = dx * 14;
      cardMockup.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale(1.03)`;
    });

    cardMockup.addEventListener('mouseleave', () => {
      cardMockup.style.transform = 'perspective(900px) rotateY(-12deg) rotateX(4deg)';
    });
  }

  /* ----------------------------------------------------------
     6. FORM — validation, loading state, success reveal
     ---------------------------------------------------------- */
  const form = document.getElementById('signup-form');
  const successEl = document.getElementById('form-success');
  const submitBtn = document.getElementById('submitBtn');

  if (form && successEl && submitBtn) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearErrors();

      const name = form.elements['name'].value.trim();
      const email = form.elements['email'].value.trim();
      let valid = true;

      if (!name) {
        showError('fname', 'Please enter your full name.');
        valid = false;
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError('femail', 'Please enter a valid email address.');
        valid = false;
      }

      if (!valid) {
        /* Shake the first errored field's label */
        const firstErr = form.querySelector('.error');
        if (firstErr) firstErr.focus();
        return;
      }

      /* Loading state */
      setLoading(true);

      try {
        /* -------------------------------------------------
           BACKEND HOOK — uncomment and replace URL to wire up
           e.g. Formspree: https://formspree.io/f/YOUR_FORM_ID
           e.g. Netlify Forms: add `netlify` attr to <form>

        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
        });
        if (!response.ok) throw new Error('Server error');
        ------------------------------------------------- */

        await new Promise((r) => setTimeout(r, 900)); /* simulate latency */

        /* Reveal success with a tiny flourish */
        form.style.opacity = '0';
        form.style.transform = 'scale(0.97)';
        form.style.transition = 'opacity 0.3s, transform 0.3s';

        setTimeout(() => {
          form.hidden = true;
          successEl.hidden = false;
          successEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }, 320);

      } catch {
        setLoading(false);
        showError('femail', 'Something went wrong — please try again.');
      }
    });
  }

  function setLoading(on) {
    const textEl = submitBtn.querySelector('.btn-text');
    const arrowEl = submitBtn.querySelector('.btn-arrow');
    const spinnerEl = submitBtn.querySelector('.btn-spinner');
    submitBtn.disabled = on;
    if (on) {
      textEl.textContent = 'Joining…';
      if (arrowEl) arrowEl.hidden = true;
      if (spinnerEl) spinnerEl.hidden = false;
    } else {
      textEl.textContent = 'Join the Wine Club';
      if (arrowEl) arrowEl.hidden = false;
      if (spinnerEl) spinnerEl.hidden = true;
    }
  }

  function showError(fieldId, msg) {
    const input = document.getElementById(fieldId);
    if (!input) return;
    input.classList.add('error');
    const err = document.createElement('p');
    err.className = 'error-msg';
    err.textContent = msg;
    input.closest('.field-group').appendChild(err);
  }

  function clearErrors() {
    form.querySelectorAll('.error').forEach((el) => el.classList.remove('error'));
    form.querySelectorAll('.error-msg').forEach((el) => el.remove());
  }

  /* ----------------------------------------------------------
     7. MICRO-INTERACTION — pricing card price hover pop
     ---------------------------------------------------------- */
  const priceAmount = document.querySelector('.price-amount');
  const pricingCard = document.querySelector('.pricing-card');
  if (priceAmount && pricingCard) {
    pricingCard.addEventListener('mouseenter', () => {
      priceAmount.style.transition = 'transform 0.35s cubic-bezier(0.175,0.885,0.32,1.275)';
    });
  }

  /* ----------------------------------------------------------
     8. SMOOTH ANCHOR SCROLL with offset
     ---------------------------------------------------------- */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (e) => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });

  /* ----------------------------------------------------------
     9. BENEFIT CARD — icon tilt micro-interaction
     ---------------------------------------------------------- */
  document.querySelectorAll('.benefit-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      if (prefersReducedMotion.matches) return;
      const rect = card.getBoundingClientRect();
      const dx = (e.clientX - rect.left) / rect.width - 0.5;
      const dy = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `translateY(-8px) perspective(600px) rotateX(${-dy * 4}deg) rotateY(${dx * 4}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  /* ----------------------------------------------------------
     10. ORNAMENT LINES — staggered width reveal
     ---------------------------------------------------------- */
  const ornamentObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const lines = entry.target.querySelectorAll('.ornament-line');
      lines.forEach((line, i) => {
        line.style.transition = `width 0.6s cubic-bezier(0.16,1,0.3,1) ${i * 120}ms`;
        line.style.width = '50px';
      });
      ornamentObserver.unobserve(entry.target);
    });
  }, { threshold: 0.8 });

  /* Pre-collapse ornament lines so they animate in */
  document.querySelectorAll('.hero-ornament').forEach((el) => {
    el.querySelectorAll('.ornament-line').forEach((line) => {
      line.style.width = '0';
    });
    ornamentObserver.observe(el);
  });

  /* ----------------------------------------------------------
     11. STRIP STAT — subtle entrance pop
     ---------------------------------------------------------- */
  const stripStatObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const stats = entry.target.querySelectorAll('.strip-stat');
      stats.forEach((stat, i) => {
        stat.style.opacity = '0';
        stat.style.transform = 'translateY(18px)';
        setTimeout(() => {
          stat.style.transition = 'opacity 0.55s cubic-bezier(0.16,1,0.3,1), transform 0.55s cubic-bezier(0.16,1,0.3,1)';
          stat.style.opacity = '1';
          stat.style.transform = 'translateY(0)';
        }, i * 120);
      });
      stripStatObserver.unobserve(entry.target);
    });
  }, { threshold: 0.3 });

  const strip = document.getElementById('record-strip');
  if (strip) stripStatObserver.observe(strip);

  /* ----------------------------------------------------------
     12. DYNAMIC COPYRIGHT YEAR
     ---------------------------------------------------------- */
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();

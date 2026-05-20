/* ============================================================
   THE WINE ROOM — WINE CLUB
   main.js
   ============================================================ */

(function () {
  'use strict';

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  /* ----------------------------------------------------------
     1. SCROLL PROGRESS BAR
     ---------------------------------------------------------- */
  const progressBar = document.getElementById('scroll-progress');
  if (progressBar) {
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      progressBar.style.width = total > 0 ? (scrolled / total * 100) + '%' : '0%';
    }, { passive: true });
  }

  /* ----------------------------------------------------------
     2. INTERSECTION OBSERVER — entrance animations
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
     3. COUNTER ANIMATION — record strip numbers
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
     4. STICKY NAV — transparent → solid on scroll
     ---------------------------------------------------------- */
  const nav = document.getElementById('site-nav');
  const hero = document.getElementById('hero');

  if (nav && hero) {
    const heroObserver = new IntersectionObserver(
      ([entry]) => nav.classList.toggle('is-scrolled', !entry.isIntersecting),
      { threshold: 0.05 }
    );
    heroObserver.observe(hero);
  }

  /* ----------------------------------------------------------
     5. ACTIVE NAV SECTION TRACKING
     ---------------------------------------------------------- */
  const navLinks = document.querySelectorAll('.nav-links a[data-section]');
  if (navLinks.length) {
    const sectionIds = Array.from(navLinks).map((a) => a.dataset.section);
    const sections = sectionIds.map((id) => document.getElementById(id)).filter(Boolean);

    const sectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const id = entry.target.id;
          navLinks.forEach((a) => {
            a.classList.toggle('is-active', a.dataset.section === id);
          });
        });
      },
      { threshold: 0.3, rootMargin: '-20% 0px -60% 0px' }
    );
    sections.forEach((s) => sectionObserver.observe(s));
  }

  /* ----------------------------------------------------------
     6. HAMBURGER MENU
     ---------------------------------------------------------- */
  const hamburger = document.getElementById('navHamburger');
  const overlay = document.getElementById('nav-overlay');
  const overlayClose = document.getElementById('navClose');

  function openMenu() {
    hamburger.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    overlay.classList.add('is-open');
    overlay.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    hamburger.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    overlay.classList.remove('is-open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  if (hamburger && overlay) {
    hamburger.addEventListener('click', openMenu);
    if (overlayClose) overlayClose.addEventListener('click', closeMenu);

    overlay.querySelectorAll('.nav-overlay__link, .nav-overlay__cta').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && overlay.classList.contains('is-open')) closeMenu();
    });
  }

  /* ----------------------------------------------------------
     7. PARALLAX — hero badge translateY
     ---------------------------------------------------------- */
  const badgeWrap = document.querySelector('.hero-badge-wrap');
  const isDesktop = window.matchMedia('(min-width: 769px)');

  if (badgeWrap && isDesktop.matches && !prefersReducedMotion.matches) {
    let ticking = false;
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const y = window.scrollY;
          if (y < window.innerHeight * 1.2) {
            badgeWrap.style.transform = `translateY(${y * 0.1}px)`;
          }
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  /* ----------------------------------------------------------
     8. 3D CARD TILT — wine card mockup follows cursor
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
      cardMockup.style.transform =
        `perspective(900px) rotateX(${-dy * 10}deg) rotateY(${dx * 14}deg) scale(1.03)`;
    });
    cardMockup.addEventListener('mouseleave', () => {
      cardMockup.style.transform = 'perspective(900px) rotateY(-12deg) rotateX(4deg)';
    });
  }

  /* ----------------------------------------------------------
     9. VALUE CALCULATOR
     ---------------------------------------------------------- */
  const calcMinus = document.getElementById('calcMinus');
  const calcPlus  = document.getElementById('calcPlus');
  const calcBottlesEl = document.getElementById('calcBottles');
  const calcValueEl   = document.getElementById('calcValue');
  const calcSavingsEl = document.getElementById('calcSavings');
  const calcAnnualEl  = document.getElementById('calcAnnual');
  const calcTrackFill = document.getElementById('calcTrackFill');

  const AVG_BOTTLE    = 28;
  const WINE_CARD_VAL = 20;
  const DISCOUNT      = 0.15;
  const MEMBERSHIP    = 29;
  const MIN_BOTTLES   = 1;
  const MAX_BOTTLES   = 12;

  let bottles = 2;

  function calcUpdate(animate) {
    const discountSavings = Math.max(0, (bottles - 1) * AVG_BOTTLE * DISCOUNT);
    const totalValue = Math.round(AVG_BOTTLE + WINE_CARD_VAL + discountSavings);
    const savings = totalValue - MEMBERSHIP;
    const annual  = totalValue * 12;

    calcBottlesEl.textContent = bottles;
    calcValueEl.textContent   = '$' + totalValue;
    calcSavingsEl.textContent = '$' + savings;
    calcAnnualEl.textContent  = '$' + annual.toLocaleString();

    const pct = ((bottles - MIN_BOTTLES) / (MAX_BOTTLES - MIN_BOTTLES)) * 100;
    if (calcTrackFill) calcTrackFill.style.width = Math.max(4, pct) + '%';

    if (animate && !prefersReducedMotion.matches) {
      [calcBottlesEl, calcValueEl, calcSavingsEl].forEach((el) => {
        el.classList.remove('is-changing');
        void el.offsetWidth;
        el.classList.add('is-changing');
        setTimeout(() => el.classList.remove('is-changing'), 350);
      });
    }

    if (calcMinus) calcMinus.disabled = bottles <= MIN_BOTTLES;
    if (calcPlus)  calcPlus.disabled  = bottles >= MAX_BOTTLES;
  }

  if (calcMinus && calcPlus && calcBottlesEl) {
    calcMinus.addEventListener('click', () => {
      if (bottles > MIN_BOTTLES) { bottles--; calcUpdate(true); }
    });
    calcPlus.addEventListener('click', () => {
      if (bottles < MAX_BOTTLES) { bottles++; calcUpdate(true); }
    });
    calcUpdate(false);
  }

  /* ----------------------------------------------------------
     10. FAQ ACCORDION
     ---------------------------------------------------------- */
  document.querySelectorAll('.faq-q').forEach((btn) => {
    btn.addEventListener('click', () => {
      const item   = btn.closest('.faq-item');
      const answer = item.querySelector('.faq-a');
      const isOpen = btn.getAttribute('aria-expanded') === 'true';

      /* Close all open items first */
      document.querySelectorAll('.faq-q[aria-expanded="true"]').forEach((openBtn) => {
        if (openBtn === btn) return;
        openBtn.setAttribute('aria-expanded', 'false');
        const openAnswer = openBtn.closest('.faq-item').querySelector('.faq-a');
        if (openAnswer) openAnswer.setAttribute('aria-hidden', 'true');
      });

      btn.setAttribute('aria-expanded', isOpen ? 'false' : 'true');
      if (answer) answer.setAttribute('aria-hidden', isOpen ? 'true' : 'false');
    });
  });

  /* ----------------------------------------------------------
     11. FORM — validation, loading state, success reveal
     ---------------------------------------------------------- */
  const form      = document.getElementById('signup-form');
  const successEl = document.getElementById('form-success');
  const submitBtn = document.getElementById('submitBtn');

  if (form && successEl && submitBtn) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      clearErrors();

      const name  = form.elements['name'].value.trim();
      const email = form.elements['email'].value.trim();
      let valid   = true;

      if (!name) {
        showError('fname', 'Please enter your full name.');
        valid = false;
      }
      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showError('femail', 'Please enter a valid email address.');
        valid = false;
      }

      if (!valid) {
        const firstErr = form.querySelector('.error');
        if (firstErr) firstErr.focus();
        return;
      }

      setLoading(true);

      try {
        /* -------------------------------------------------
           BACKEND HOOK — uncomment and replace URL:
           e.g. Formspree:  https://formspree.io/f/YOUR_ID
           e.g. Netlify:    add netlify attr to <form>

        const response = await fetch(form.action, {
          method: 'POST',
          body: new FormData(form),
          headers: { Accept: 'application/json' },
        });
        if (!response.ok) throw new Error('Server error');
        ------------------------------------------------- */

        await new Promise((r) => setTimeout(r, 900));

        form.style.opacity   = '0';
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
    const textEl    = submitBtn.querySelector('.btn-text');
    const arrowEl   = submitBtn.querySelector('.btn-arrow');
    const spinnerEl = submitBtn.querySelector('.btn-spinner');
    submitBtn.disabled = on;
    if (on) {
      textEl.textContent = 'Joining…';
      if (arrowEl)   arrowEl.hidden   = true;
      if (spinnerEl) spinnerEl.hidden = false;
    } else {
      textEl.textContent = 'Join the Wine Club';
      if (arrowEl)   arrowEl.hidden   = false;
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
     12. FLOATING MOBILE CTA — show after hero, hide at form
     ---------------------------------------------------------- */
  const mobileCta = document.getElementById('mobile-cta');
  const joinSection = document.getElementById('join');

  if (mobileCta && hero && joinSection) {
    const ctaObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.target === hero) {
            if (!entry.isIntersecting) mobileCta.classList.add('is-visible');
            else mobileCta.classList.remove('is-visible');
          }
          if (entry.target === joinSection) {
            if (entry.isIntersecting) mobileCta.classList.remove('is-visible');
          }
        });
      },
      { threshold: 0.1 }
    );
    ctaObserver.observe(hero);
    ctaObserver.observe(joinSection);
  }

  /* ----------------------------------------------------------
     13. BENEFIT CARD — tilt micro-interaction
     ---------------------------------------------------------- */
  document.querySelectorAll('.benefit-card').forEach((card) => {
    card.addEventListener('mousemove', (e) => {
      if (prefersReducedMotion.matches) return;
      const rect = card.getBoundingClientRect();
      const dx = (e.clientX - rect.left) / rect.width - 0.5;
      const dy = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform =
        `translateY(-8px) perspective(600px) rotateX(${-dy * 4}deg) rotateY(${dx * 4}deg)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });

  /* ----------------------------------------------------------
     14. PRICING CARD — price hover pop
     ---------------------------------------------------------- */
  const priceAmount = document.querySelector('.price-amount');
  const pricingCard = document.querySelector('.pricing-card');
  if (priceAmount && pricingCard) {
    pricingCard.addEventListener('mouseenter', () => {
      priceAmount.style.transition = 'transform 0.35s cubic-bezier(0.175,0.885,0.32,1.275)';
    });
  }

  /* ----------------------------------------------------------
     15. SMOOTH ANCHOR SCROLL with nav offset
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
     16. STRIP STAT — staggered entrance pop
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
     17. DYNAMIC COPYRIGHT YEAR
     ---------------------------------------------------------- */
  const yearEl = document.getElementById('footer-year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

})();

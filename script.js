/* ==========================================================================
   ANMOL — PORTFOLIO SCRIPT
   Vanilla JS only. Organized into small, independent modules that each
   guard themselves against prefers-reduced-motion and touch devices where
   relevant, so nothing here fights the user's own settings.
   ========================================================================== */
 
'use strict';
 
document.addEventListener('DOMContentLoaded', () => {
 
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouchDevice = window.matchMedia('(hover: none), (pointer: coarse)').matches;
 
  /* ------------------------------------------------------------------
     1. LOADING SCREEN
     Simulates a short, deterministic progress fill, then reveals the
     page and kicks off the hero's entrance sequence.
  ------------------------------------------------------------------ */
  function initLoader() {
    const loadingScreen = document.getElementById('loading-screen');
    const barFill = document.getElementById('loader-bar-fill');
    const percentLabel = document.getElementById('loader-percent');
 
    if (!loadingScreen || !barFill || !percentLabel) return;
 
    let progress = 0;
    const duration = prefersReducedMotion ? 200 : 1400;
    const stepTime = 16;
    const totalSteps = duration / stepTime;
    let currentStep = 0;
 
    const interval = setInterval(() => {
      currentStep++;
      // Ease-out curve so the bar feels like it's "arriving", not linear.
      const t = currentStep / totalSteps;
      progress = Math.min(100, Math.round(100 * (1 - Math.pow(1 - t, 3))));
      barFill.style.width = progress + '%';
      percentLabel.textContent = progress + '%';
 
      if (progress >= 100 || currentStep >= totalSteps) {
        clearInterval(interval);
        setTimeout(finishLoading, 250);
      }
    }, stepTime);
 
    function finishLoading() {
      loadingScreen.classList.add('loaded');
      document.body.classList.add('page-ready');
      runHeroEntrance();
      initRoleTyper();
      initEditorTyper();
    }
 
    // Safety net: never let the loader trap the user if something stalls.
    setTimeout(() => {
      if (!loadingScreen.classList.contains('loaded')) finishLoading();
    }, 4000);
  }
 
  /* ------------------------------------------------------------------
     2. HERO ENTRANCE SEQUENCE
     Staggers the .reveal-up / .reveal-scale elements inside the hero
     using their data-delay attribute, once the loader clears.
  ------------------------------------------------------------------ */
  function runHeroEntrance() {
    const heroReveals = document.querySelectorAll('.hero [data-delay]');
    heroReveals.forEach((el) => {
      const delay = parseInt(el.getAttribute('data-delay'), 10) || 0;
      el.style.setProperty('--reveal-delay', delay);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => el.classList.add('is-visible'));
      });
    });
  }
 
  /* ------------------------------------------------------------------
     3. ROLE TYPING ANIMATION (hero subhead)
     Cycles through the three roles from the brief, typing and
     deleting each in turn.
  ------------------------------------------------------------------ */
  function initRoleTyper() {
    const el = document.getElementById('role-typer');
    if (!el) return;
 
    const roles = ['Student', 'Aspiring Full Stack Developer', 'Hackathon Enthusiast'];
 
    if (prefersReducedMotion) {
      el.textContent = roles.join(' · ');
      return;
    }
 
    let roleIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
 
    function tick() {
      const current = roles[roleIndex];
 
      if (!isDeleting) {
        charIndex++;
        el.textContent = current.slice(0, charIndex);
        if (charIndex === current.length) {
          isDeleting = true;
          setTimeout(tick, 1400);
          return;
        }
        setTimeout(tick, 55);
      } else {
        charIndex--;
        el.textContent = current.slice(0, charIndex);
        if (charIndex === 0) {
          isDeleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
          setTimeout(tick, 300);
          return;
        }
        setTimeout(tick, 30);
      }
    }
 
    tick();
  }
 
  /* ------------------------------------------------------------------
     4. SIGNATURE EDITOR TYPING ANIMATION
     The hero's "anmol.js" card writes itself out token by token with
     lightweight syntax coloring. Built from a token array rather than
     raw HTML so partially-typed lines never leave a tag half-open.
  ------------------------------------------------------------------ */
  function initEditorTyper() {
    const codeEl = document.getElementById('editor-code');
    if (!codeEl) return;
 
    // Each token: { text, cls }. cls maps to a .tok-* class in CSS.
    const tokens = [
      { text: '// building things, one commit at a time\n', cls: 'tok-comment' },
      { text: 'const', cls: 'tok-kw' }, { text: ' ', cls: '' },
      { text: 'developer', cls: '' }, { text: ' = {\n', cls: 'tok-punct' },
      { text: '  name', cls: 'tok-key' }, { text: ': ', cls: 'tok-punct' },
      { text: "'Anmol'", cls: 'tok-string' }, { text: ',\n', cls: 'tok-punct' },
      { text: '  role', cls: 'tok-key' }, { text: ': ', cls: 'tok-punct' },
      { text: "'Student & Builder'", cls: 'tok-string' }, { text: ',\n', cls: 'tok-punct' },
      { text: '  stack', cls: 'tok-key' }, { text: ': [', cls: 'tok-punct' },
      { text: "'HTML'", cls: 'tok-string' }, { text: ', ', cls: 'tok-punct' },
      { text: "'CSS'", cls: 'tok-string' }, { text: ', ', cls: 'tok-punct' },
      { text: "'JS'", cls: 'tok-string' }, { text: '],\n', cls: 'tok-punct' },
      { text: '  learning', cls: 'tok-key' }, { text: ': ', cls: 'tok-punct' },
      { text: "'Full Stack + AI'", cls: 'tok-string' }, { text: ',\n', cls: 'tok-punct' },
      { text: '  mindset', cls: 'tok-key' }, { text: ': ', cls: 'tok-punct' },
      { text: "'consistency > talent'", cls: 'tok-string' }, { text: '\n};\n\n', cls: 'tok-punct' },
      { text: 'function ', cls: 'tok-kw' }, { text: 'ship', cls: 'tok-fn' }, { text: '(idea) {\n', cls: 'tok-punct' },
      { text: '  return ', cls: 'tok-kw' }, { text: 'idea', cls: '' }, { text: '.build().learn();\n}', cls: 'tok-punct' },
    ];
 
    if (prefersReducedMotion) {
      codeEl.innerHTML = tokens.map(t => `<span class="${t.cls}">${escapeHtml(t.text)}</span>`).join('');
      return;
    }
 
    let tIndex = 0;
    let cIndex = 0;
    codeEl.innerHTML = '';
 
    function typeNext() {
      if (tIndex >= tokens.length) {
        // Leave a blinking cursor once the "file" is fully written.
        const cursor = document.createElement('span');
        cursor.className = 'tok-cursor';
        codeEl.appendChild(cursor);
        return;
      }
 
      const token = tokens[tIndex];
      let span = codeEl.querySelector('span[data-active="true"]');
      if (!span) {
        span = document.createElement('span');
        span.className = token.cls;
        span.setAttribute('data-active', 'true');
        codeEl.appendChild(span);
      }
 
      cIndex++;
      span.textContent = token.text.slice(0, cIndex);
 
      if (cIndex >= token.text.length) {
        span.removeAttribute('data-active');
        tIndex++;
        cIndex = 0;
      }
 
      // Vary speed slightly so it doesn't feel like a metronome.
      const speed = 10 + Math.random() * 14;
      setTimeout(typeNext, speed);
    }
 
    // Small delay so it starts just after the hero card has floated in.
    setTimeout(typeNext, 500);
  }
 
  function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }
 
  /* ------------------------------------------------------------------
     5. SCROLL-TRIGGERED REVEALS (IntersectionObserver)
     Applies to every .reveal-up / .reveal-scale / .reveal-left element
     outside the hero (the hero handles its own entrance on load).
  ------------------------------------------------------------------ */
  function initScrollReveal() {
    const targets = document.querySelectorAll('.reveal-up, .reveal-scale, .reveal-left');
 
    if (prefersReducedMotion) {
      targets.forEach((el) => el.classList.add('is-visible'));
      return;
    }
 
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay = parseInt(el.getAttribute('data-delay'), 10) || 0;
        el.style.setProperty('--reveal-delay', delay);
        el.classList.add('is-visible');
        observer.unobserve(el);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });
 
    targets.forEach((el) => {
      // Hero elements already get revealed by runHeroEntrance() on load.
      if (el.closest('.hero')) return;
      observer.observe(el);
    });
  }
 
  /* ------------------------------------------------------------------
     6. ANIMATED SKILL BARS + COUNTERS (triggered on visibility)
  ------------------------------------------------------------------ */
  function initSkillBars() {
    const bars = document.querySelectorAll('.skill-bar-fill');
    if (!bars.length) return;
 
    if (prefersReducedMotion) {
      bars.forEach((bar) => bar.classList.add('is-filled'));
      return;
    }
 
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-filled');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
 
    bars.forEach((bar) => observer.observe(bar));
  }
 
  function initCounters() {
    const counters = document.querySelectorAll('.stat-number');
    if (!counters.length) return;
 
    function animateCounter(el) {
      const target = parseInt(el.getAttribute('data-count'), 10) || 0;
 
      if (prefersReducedMotion) {
        el.textContent = target;
        return;
      }
 
      const duration = 1400;
      const startTime = performance.now();
 
      function step(now) {
        const progress = Math.min(1, (now - startTime) / duration);
        // Ease-out cubic for a natural "settling" feel.
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.round(eased * target);
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }
 
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
 
    counters.forEach((el) => observer.observe(el));
  }
 
  /* ------------------------------------------------------------------
     7. CUSTOM CURSOR + MOUSE SPOTLIGHT
     Single rAF loop drives both the lagging ring and the background
     spotlight, so we only pay for one animation frame callback instead
     of three separate ones.
  ------------------------------------------------------------------ */
  function initCursorAndSpotlight() {
    if (isTouchDevice) return;
 
    const dot = document.getElementById('cursor-dot');
    const ring = document.getElementById('cursor-ring');
    const spotlight = document.getElementById('spotlight');
    if (!dot || !ring || !spotlight) return;
 
    document.body.classList.add('custom-cursor-active');
 
    let mouseX = window.innerWidth / 2;
    let mouseY = window.innerHeight / 2;
    let ringX = mouseX;
    let ringY = mouseY;
    let hasMoved = false;
 
    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
 
      if (!hasMoved) {
        hasMoved = true;
        document.body.classList.add('spotlight-active');
      }
 
      dot.style.left = mouseX + 'px';
      dot.style.top = mouseY + 'px';
 
      spotlight.style.left = mouseX + 'px';
      spotlight.style.top = mouseY + 'px';
    }, { passive: true });
 
    // Ring trails behind the raw cursor position for a smooth "lag" feel.
    function animateRing() {
      ringX += (mouseX - ringX) * 0.18;
      ringY += (mouseY - ringY) * 0.18;
      ring.style.left = ringX + 'px';
      ring.style.top = ringY + 'px';
      requestAnimationFrame(animateRing);
    }
    requestAnimationFrame(animateRing);
 
    // Enlarge the ring over interactive elements.
    const hoverTargets = document.querySelectorAll('a, button, .tilt-card, .magnetic');
    hoverTargets.forEach((el) => {
      el.addEventListener('mouseenter', () => ring.classList.add('is-hovering'));
      el.addEventListener('mouseleave', () => ring.classList.remove('is-hovering'));
    });
 
    window.addEventListener('mouseleave', () => {
      dot.style.opacity = '0';
      ring.style.opacity = '0';
    });
    window.addEventListener('mouseenter', () => {
      dot.style.opacity = '';
      ring.style.opacity = '';
    });
  }
 
  /* ------------------------------------------------------------------
     8. TILT CARDS (hover 3D tilt for editor + project cards)
  ------------------------------------------------------------------ */
  function initTiltCards() {
    if (isTouchDevice || prefersReducedMotion) return;
 
    const cards = document.querySelectorAll('.tilt-card');
 
    cards.forEach((card) => {
      let rafId = null;
 
      card.addEventListener('mousemove', (e) => {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
 
          // Small max angle keeps this feeling premium, not gimmicky.
          const rotateX = ((y - centerY) / centerY) * -5;
          const rotateY = ((x - centerX) / centerX) * 5;
 
          card.style.transform = `perspective(900px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.015, 1.015, 1.015)`;
        });
      }, { passive: true });
 
      card.addEventListener('mouseleave', () => {
        if (rafId) cancelAnimationFrame(rafId);
        card.style.transform = '';
      });
    });
  }
 
  /* ------------------------------------------------------------------
     9. MAGNETIC BUTTONS
     Nudges .magnetic elements toward the cursor within a small radius.
  ------------------------------------------------------------------ */
  function initMagneticButtons() {
    if (isTouchDevice || prefersReducedMotion) return;
 
    const buttons = document.querySelectorAll('.magnetic');
 
    buttons.forEach((btn) => {
      let rafId = null;
 
      btn.addEventListener('mousemove', (e) => {
        if (rafId) cancelAnimationFrame(rafId);
        rafId = requestAnimationFrame(() => {
          const rect = btn.getBoundingClientRect();
          const x = e.clientX - rect.left - rect.width / 2;
          const y = e.clientY - rect.top - rect.height / 2;
          btn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;
        });
      }, { passive: true });
 
      btn.addEventListener('mouseleave', () => {
        if (rafId) cancelAnimationFrame(rafId);
        btn.style.transform = '';
      });
    });
  }
 
  /* ------------------------------------------------------------------
     10. RIPPLE CLICK EFFECT (buttons)
  ------------------------------------------------------------------ */
  function initRippleEffect() {
    const rippleTargets = document.querySelectorAll('.btn');
 
    rippleTargets.forEach((btn) => {
      btn.addEventListener('click', (e) => {
        if (prefersReducedMotion) return;
 
        const rect = btn.getBoundingClientRect();
        const ripple = document.createElement('span');
        const size = Math.max(rect.width, rect.height);
 
        ripple.className = 'ripple';
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
 
        btn.appendChild(ripple);
        ripple.addEventListener('animationend', () => ripple.remove());
      });
    });
  }
 
  /* ------------------------------------------------------------------
     11. NAVBAR: scroll state, active-section highlight, smooth scroll
  ------------------------------------------------------------------ */
  function initNavbar() {
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('main section[id]');
    if (!navbar) return;
 
    function onScroll() {
      navbar.classList.toggle('is-scrolled', window.scrollY > 40);
    }
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
 
    if (!sections.length || !navLinks.length) return;
 
    const sectionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const id = entry.target.getAttribute('id');
        navLinks.forEach((link) => {
          link.classList.toggle('is-active', link.getAttribute('data-section') === id);
        });
      });
    }, { rootMargin: '-45% 0px -45% 0px', threshold: 0 });
 
    sections.forEach((section) => sectionObserver.observe(section));
  }
 
  /* ------------------------------------------------------------------
     12. SCROLL PROGRESS BAR
  ------------------------------------------------------------------ */
  function initScrollProgress() {
    const bar = document.getElementById('scroll-progress');
    if (!bar) return;
 
    function update() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const percent = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
      bar.style.width = percent + '%';
      bar.setAttribute('aria-valuenow', Math.round(percent));
    }
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
  }
 
  /* ------------------------------------------------------------------
     13. BACK TO TOP BUTTON
  ------------------------------------------------------------------ */
  function initBackToTop() {
    const btn = document.getElementById('back-to-top');
    if (!btn) return;
 
    function toggleVisibility() {
      btn.classList.toggle('is-visible', window.scrollY > 600);
    }
    toggleVisibility();
    window.addEventListener('scroll', toggleVisibility, { passive: true });
 
    btn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  }
 
  /* ------------------------------------------------------------------
     14. HAMBURGER / MOBILE MENU
  ------------------------------------------------------------------ */
  function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const menu = document.getElementById('mobile-menu');
    if (!hamburger || !menu) return;
 
    function closeMenu() {
      hamburger.classList.remove('is-open');
      menu.classList.remove('is-open');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-label', 'Open menu');
      menu.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
 
    function openMenu() {
      hamburger.classList.add('is-open');
      menu.classList.add('is-open');
      hamburger.setAttribute('aria-expanded', 'true');
      hamburger.setAttribute('aria-label', 'Close menu');
      menu.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
 
    hamburger.addEventListener('click', () => {
      const isOpen = menu.classList.contains('is-open');
      isOpen ? closeMenu() : openMenu();
    });
 
    menu.querySelectorAll('.mobile-link, .mobile-social-link').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });
 
    // Close on Escape for keyboard users.
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) closeMenu();
    });
  }
 
  /* ------------------------------------------------------------------
     15. DARK / LIGHT MODE TOGGLE (persists for the session)
  ------------------------------------------------------------------ */
  function initThemeToggle() {
    const toggle = document.getElementById('theme-toggle');
    if (!toggle) return;
 
    // Note: no localStorage — theme resets each visit by design in this
    // sandboxed context. It still fully re-themes the page instantly.
    function applyTheme(theme) {
      if (theme === 'light') {
        document.documentElement.setAttribute('data-theme', 'light');
        toggle.setAttribute('aria-pressed', 'true');
        toggle.setAttribute('aria-label', 'Switch to dark mode');
      } else {
        document.documentElement.removeAttribute('data-theme');
        toggle.setAttribute('aria-pressed', 'false');
        toggle.setAttribute('aria-label', 'Switch to light mode');
      }
    }
 
    toggle.addEventListener('click', () => {
      const isLight = document.documentElement.getAttribute('data-theme') === 'light';
      applyTheme(isLight ? 'dark' : 'light');
    });
  }
 
  /* ------------------------------------------------------------------
     16. FOOTER YEAR (auto-generated)
  ------------------------------------------------------------------ */
  function initFooterYear() {
    const el = document.getElementById('footer-year');
    if (el) el.textContent = new Date().getFullYear();
  }
 
  /* ------------------------------------------------------------------
     17. TOAST HELPER (used for placeholder demo/code links)
  ------------------------------------------------------------------ */
  function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
 
    toast.textContent = message;
    toast.classList.add('is-visible');
 
    clearTimeout(showToast._timer);
    showToast._timer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
  }
 
  function initPlaceholderLinks() {
    // Project card GitHub/Live Demo buttons are placeholders until Anmol
    // wires up real repo and deployment links — this keeps the UI honest
    // instead of silently 404-ing.
    const placeholders = document.querySelectorAll('.project-btn[data-action]');
 
    placeholders.forEach((link) => {
      link.addEventListener('click', (e) => {
        if (link.getAttribute('href') === '#') {
          e.preventDefault();
          const action = link.getAttribute('data-action');
          const label = action === 'github' ? 'Repository link coming soon' : 'Live demo link coming soon';
          showToast(label);
        }
      });
    });
  }
 
  /* ------------------------------------------------------------------
     18. INIT — run everything that doesn't depend on the loader,
     then let the loader kick off the hero-specific sequences once
     it finishes.
  ------------------------------------------------------------------ */
  initScrollReveal();
  initSkillBars();
  initCounters();
  initCursorAndSpotlight();
  initTiltCards();
  initMagneticButtons();
  initRippleEffect();
  initNavbar();
  initScrollProgress();
  initBackToTop();
  initMobileMenu();
  initThemeToggle();
  initFooterYear();
  initPlaceholderLinks();
  initLoader();
 
});
 
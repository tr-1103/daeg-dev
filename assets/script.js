/* ==========================================================================
   DAEG.DEV — interactions
   - Mobile nav toggle
   - Smooth-scroll active section highlight
   - Works filter chips
   - Reveal-on-scroll
   - Header shadow on scroll
   ========================================================================== */

(function () {
  'use strict';

  /* ----- Mobile nav toggle ----- */
  const toggle = document.getElementById('navToggle');
  const nav = document.querySelector('.site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      nav.classList.toggle('is-open');
    });
    nav.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', () => nav.classList.remove('is-open'));
    });
  }

  /* ----- Header shadow on scroll ----- */
  const header = document.getElementById('siteHeader');
  if (header) {
    const onScroll = () => {
      if (window.scrollY > 8) {
        header.style.boxShadow = '0 1px 0 rgba(15,20,24,0.04), 0 6px 18px rgba(15,20,24,0.04)';
      } else {
        header.style.boxShadow = 'none';
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* ----- Active nav highlight via IntersectionObserver ----- */
  const navLinks = document.querySelectorAll('.site-nav a[href^="#"]');
  const sectionIds = Array.from(navLinks)
    .map((a) => a.getAttribute('href'))
    .filter((h) => h && h.length > 1);
  const sections = sectionIds
    .map((id) => document.querySelector(id))
    .filter(Boolean);

  if ('IntersectionObserver' in window && sections.length) {
    const setActive = (id) => {
      navLinks.forEach((a) => {
        if (a.getAttribute('href') === id) {
          a.style.color = '#0a8f5c';
          a.style.borderBottomColor = '#0a8f5c';
        } else {
          a.style.color = '';
          a.style.borderBottomColor = '';
        }
      });
    };
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive('#' + entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    );
    sections.forEach((s) => io.observe(s));
  }

  /* ----- Works filter ----- */
  const filterChips = document.querySelectorAll('.filter-chip');
  const workCards = document.querySelectorAll('.work-card');
  filterChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      const filter = chip.getAttribute('data-filter');
      filterChips.forEach((c) => c.classList.remove('is-active'));
      chip.classList.add('is-active');
      workCards.forEach((card) => {
        const cat = card.getAttribute('data-category');
        const show = filter === 'all' || cat === filter;
        card.style.display = show ? '' : 'none';
      });
    });
  });

  /* ----- Reveal on scroll ----- */
  if ('IntersectionObserver' in window) {
    const targets = document.querySelectorAll(
      '.vision-inner, .now-working, .news-channel, .service-card, .work-card, .about-profile, .about-steps li, .about-creed, .contact-inner'
    );
    targets.forEach((el) => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(16px)';
      el.style.transition = 'opacity 0.6s ease, transform 0.6s cubic-bezier(0.2,0.7,0.2,1)';
    });
    const reveal = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            reveal.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    targets.forEach((el) => reveal.observe(el));
  }

  /* ==========================================================================
     COUNT-UP NUMBERS
     - Trigger when element enters viewport
     - Animates from 0 to data-count-end over ~1.6s with easeOutQuad
     ========================================================================== */
  const countNodes = document.querySelectorAll('[data-count-end]');
  if (countNodes.length && 'IntersectionObserver' in window) {
    const animateCount = (el) => {
      const end = parseFloat(el.getAttribute('data-count-end')) || 0;
      const duration = 1600;
      const start = performance.now();
      const tick = (now) => {
        const elapsed = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - elapsed, 3); // easeOutCubic
        const value = Math.round(end * eased * 10) / 10;
        // integer if end is integer
        el.textContent = Number.isInteger(end) ? Math.round(end * eased) : value.toFixed(1);
        if (elapsed < 1) requestAnimationFrame(tick);
        else el.textContent = end;
      };
      requestAnimationFrame(tick);
    };
    const countObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            animateCount(entry.target);
            countObs.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.5 }
    );
    countNodes.forEach((n) => countObs.observe(n));
  }

  /* ==========================================================================
     3D CARD TILT
     - Subtle mouse-follow tilt on .service-card and .work-card
     - Disabled on touch devices and reduced-motion
     ========================================================================== */
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (!reduce && !isTouch) {
    const tiltCards = document.querySelectorAll('.service-card, .work-card');
    tiltCards.forEach((card) => {
      const max = 6; // max degrees
      let raf = null;
      card.style.transformStyle = 'preserve-3d';
      card.style.willChange = 'transform';

      const handleMove = (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;  // 0..1
        const y = (e.clientY - rect.top) / rect.height;  // 0..1
        const rotY = (x - 0.5) * max * 2;
        const rotX = -(y - 0.5) * max * 2;
        if (raf) cancelAnimationFrame(raf);
        raf = requestAnimationFrame(() => {
          card.style.transform =
            `perspective(900px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) translateY(-4px)`;
        });
      };
      const handleLeave = () => {
        if (raf) cancelAnimationFrame(raf);
        card.style.transition = 'transform 0.5s cubic-bezier(0.2,0.7,0.2,1)';
        card.style.transform = '';
        // remove transition after settle so future hover is snappy
        setTimeout(() => { card.style.transition = ''; }, 520);
      };
      const handleEnter = () => {
        card.style.transition = 'transform 0.15s cubic-bezier(0.2,0.7,0.2,1)';
      };

      card.addEventListener('mouseenter', handleEnter);
      card.addEventListener('mousemove', handleMove);
      card.addEventListener('mouseleave', handleLeave);
    });
  }

  /* ==========================================================================
     NOW WORKING — rotating messages
     - Cycles through messages every 5s with a soft fade
     ========================================================================== */
  const nowText = document.querySelector('.now-working .now-text');
  if (nowText) {
    const messages = [
      '第3期 Uploom 設計中 ／ 中小企業3社 自動化伴走中',
      'Threadsで日次発信中 ／ 月次の越境ノート公開予定',
      'AI研修プログラム再設計中 ／ 教員向けCLASS拡張中',
    ];
    let i = 0;
    nowText.style.transition = 'opacity 0.5s ease';
    setInterval(() => {
      nowText.style.opacity = '0';
      setTimeout(() => {
        i = (i + 1) % messages.length;
        nowText.textContent = messages[i];
        nowText.style.opacity = '1';
      }, 500);
    }, 5000);
  }
})();

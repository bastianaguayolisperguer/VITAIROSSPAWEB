(() => {
  const doc = document;
  const root = doc.documentElement;
  const menuButton = doc.getElementById('menuToggle');
  const mobileMenu = doc.getElementById('mobileMenu');
  const progress = doc.getElementById('scrollProgress');
  const year = doc.getElementById('year');
  const form = doc.getElementById('diagnosticForm');
  const formSuccess = doc.getElementById('formSuccess');
  const contactIntent = doc.getElementById('contactIntent');
  const intentCopy = doc.getElementById('formIntentCopy');
  const challenge = doc.getElementById('challenge');

  if (year) year.textContent = new Date().getFullYear();

  const track = (event, detail = {}) => {
    if (!event) return;
    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push({ event, page_section: detail.section || 'agro_intelligence', ...detail });
    }
  };

  const closeMenu = () => {
    if (!menuButton || !mobileMenu) return;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Abrir menú');
    mobileMenu.hidden = true;
    doc.body.classList.remove('menu-open');
  };

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', () => {
      const willOpen = menuButton.getAttribute('aria-expanded') !== 'true';
      menuButton.setAttribute('aria-expanded', String(willOpen));
      menuButton.setAttribute('aria-label', willOpen ? 'Cerrar menú' : 'Abrir menú');
      mobileMenu.hidden = !willOpen;
      doc.body.classList.toggle('menu-open', willOpen);
    });

    mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') closeMenu();
    });
    window.addEventListener('resize', () => {
      if (window.innerWidth > 900) closeMenu();
    }, { passive: true });
  }

  const revealNodes = Array.from(doc.querySelectorAll('[data-reveal]'));
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if ('IntersectionObserver' in window && !reducedMotion) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealNodes.forEach((node) => revealObserver.observe(node));
  } else {
    revealNodes.forEach((node) => node.classList.add('is-visible'));
  }

  const scrollDepths = new Set();
  let scrollTicking = false;
  const updateScroll = () => {
    const scrollable = root.scrollHeight - window.innerHeight;
    const ratio = scrollable > 0 ? Math.min(1, Math.max(0, window.scrollY / scrollable)) : 0;
    if (progress) progress.style.width = `${ratio * 100}%`;
    [25, 50, 75, 90].forEach((depth) => {
      if (ratio * 100 >= depth && !scrollDepths.has(depth)) {
        scrollDepths.add(depth);
        track('scroll_depth', { depth_percent: depth });
      }
    });
    scrollTicking = false;
  };

  window.addEventListener('scroll', () => {
    if (scrollTicking) return;
    scrollTicking = true;
    window.requestAnimationFrame(updateScroll);
  }, { passive: true });
  updateScroll();

  doc.querySelectorAll('[data-analytics]').forEach((element) => {
    element.addEventListener('click', () => {
      track(element.dataset.analytics, { link_text: element.textContent.trim() });
    });
  });

  doc.querySelectorAll('a[href^="https://wa.me"], a[href*="api.whatsapp.com"]').forEach((link) => {
    link.addEventListener('click', () => track('whatsapp', { link_text: link.textContent.trim() }));
  });

  doc.querySelectorAll('[data-intent="integration"]').forEach((button) => {
    button.addEventListener('click', () => {
      if (contactIntent) contactIntent.value = 'Integración tecnológica para el agro';
      if (intentCopy) intentCopy.textContent = 'Conversemos sobre tus fuentes de datos y una posible integración tecnológica.';
      if (challenge) challenge.value = 'Explorar una integración tecnológica';
    });
  });

  if (form) {
    form.addEventListener('submit', () => {
      track('contact_submit', { contact_type: contactIntent ? contactIntent.value : 'Diagnóstico' });
    });
  }

  const query = new URLSearchParams(window.location.search);
  if (query.get('enviado') === '1' && formSuccess) {
    formSuccess.hidden = false;
    formSuccess.focus({ preventScroll: true });
    if (form) form.setAttribute('aria-describedby', 'formSuccess');
  }
})();

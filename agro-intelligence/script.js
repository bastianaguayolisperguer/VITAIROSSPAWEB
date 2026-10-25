(() => {
  const doc = document;
  const root = doc.documentElement;
  const body = doc.body;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const intro = doc.getElementById('agroIntro');
  const header = doc.getElementById('siteHeader');
  const progress = doc.getElementById('scrollProgress');
  const menuButton = doc.getElementById('menuToggle');
  const mobileMenu = doc.getElementById('mobileMenu');
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

  /* Intro: the original water and leaf converge once per session; reduced motion gets a short static hold. */
  const finishIntro = (immediate = false) => {
    root.classList.remove('intro-pending');
    body.classList.remove('intro-active');
    if (!intro) return;
    intro.classList.add('is-ending');
    window.setTimeout(() => intro.remove(), immediate ? 0 : 120);
  };

  if (intro && root.classList.contains('intro-pending')) {
    body.classList.add('intro-active');
    intro.classList.toggle('is-reduced', reducedMotion);
    try { sessionStorage.setItem('vitairosAgroIntroV22Seen', '1'); } catch (error) {}
    const introTimer = window.setTimeout(() => finishIntro(false), reducedMotion ? 760 : 2860);
    intro.addEventListener('pointerup', () => {
      window.clearTimeout(introTimer);
      finishIntro(true);
    }, { once: true });
  } else {
    finishIntro(true);
  }

  const closeMenu = () => {
    if (!menuButton || !mobileMenu) return;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Abrir menú');
    mobileMenu.hidden = true;
    body.classList.remove('menu-open');
  };

  if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', () => {
      const willOpen = menuButton.getAttribute('aria-expanded') !== 'true';
      menuButton.setAttribute('aria-expanded', String(willOpen));
      menuButton.setAttribute('aria-label', willOpen ? 'Cerrar menú' : 'Abrir menú');
      mobileMenu.hidden = !willOpen;
      body.classList.toggle('menu-open', willOpen);
    });
    mobileMenu.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
    window.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
    window.addEventListener('resize', () => { if (window.innerWidth > 900) closeMenu(); }, { passive: true });
  }

  /* Header state, reading progress, and measured scroll-depth events. */
  const scrollDepths = new Set();
  let scrollFrame = 0;
  const updateChrome = () => {
    scrollFrame = 0;
    const scrollable = Math.max(1, root.scrollHeight - window.innerHeight);
    const ratio = Math.min(1, Math.max(0, window.scrollY / scrollable));
    if (progress) progress.style.width = `${ratio * 100}%`;
    if (header) header.classList.toggle('is-scrolled', window.scrollY > 24);
    [25, 50, 75, 90].forEach((depth) => {
      if (ratio * 100 >= depth && !scrollDepths.has(depth)) {
        scrollDepths.add(depth);
        track('scroll_depth', { depth_percent: depth });
      }
    });
  };
  const scheduleChrome = () => {
    if (!scrollFrame) scrollFrame = window.requestAnimationFrame(updateChrome);
  };
  window.addEventListener('scroll', scheduleChrome, { passive: true });
  window.addEventListener('resize', scheduleChrome, { passive: true });
  updateChrome();

  /* Reveal content and suspend ambient loops outside the viewport. */
  const revealNodes = Array.from(doc.querySelectorAll('[data-reveal]'));
  const motionNodes = Array.from(doc.querySelectorAll('.hero, [data-loop], [data-system-flow], .product-experience'));
  if (reducedMotion || !('IntersectionObserver' in window)) {
    revealNodes.forEach((node) => node.classList.add('is-visible'));
    motionNodes.forEach((node) => node.classList.add('is-in-view'));
  } else {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '0px 0px -7% 0px', threshold: .07 });
    revealNodes.forEach((node) => revealObserver.observe(node));

    const motionObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => entry.target.classList.toggle('is-in-view', entry.isIntersecting && !doc.hidden));
    }, { rootMargin: '12% 0px 12% 0px', threshold: .02 });
    motionNodes.forEach((node) => motionObserver.observe(node));
    doc.addEventListener('visibilitychange', () => {
      if (doc.hidden) motionNodes.forEach((node) => node.classList.remove('is-in-view'));
    });
  }

  /* Hero product: lightweight pointer depth, kept out of touch/reduced-motion paths. */
  const productParallax = doc.querySelector('[data-product-parallax]');
  const heroProduct = productParallax?.querySelector('.product-window--hero');
  if (productParallax && heroProduct && finePointer && !reducedMotion) {
    productParallax.addEventListener('pointermove', (event) => {
      const box = productParallax.getBoundingClientRect();
      const x = (event.clientX - box.left) / Math.max(box.width, 1) - .5;
      const y = (event.clientY - box.top) / Math.max(box.height, 1) - .5;
      heroProduct.style.transform = `rotateY(${(-4 + x * 3).toFixed(2)}deg) rotateX(${(1.5 - y * 2).toFixed(2)}deg) translate3d(${(x * 5).toFixed(1)}px, ${(y * 5).toFixed(1)}px, 0)`;
    }, { passive: true });
    productParallax.addEventListener('pointerleave', () => { heroProduct.style.transform = ''; });
  }

  /* Product tour: one credible interface, three operational lenses. */
  const productModes = {
    visibility: {
      eyebrow: 'VISIBILIDAD OPERACIONAL',
      title: 'Estado de riego por sector',
      description: 'Una vista consolidada para revisar actividad, programación y eventos.',
      metricLabel: 'SECTORES EN VISTA',
      metricValue: '08',
      metricNote: '3 con actividad registrada',
      alert: 'Sector S1 presenta un evento fuera del rango configurado.',
      bars: [28, 42, 36, 64, 52, 78, 61, 86, 68]
    },
    alerts: {
      eyebrow: 'ALERTAS CON CONTEXTO',
      title: 'Eventos que requieren revisión',
      description: 'Prioriza desvíos configurados y conserva la decisión bajo control del equipo.',
      metricLabel: 'EVENTOS ABIERTOS',
      metricValue: '02',
      metricNote: 'en escenario demo',
      alert: 'Duración registrada fuera del rango definido para el sector S1.',
      bars: [22, 34, 31, 55, 48, 72, 45, 64, 51]
    },
    trace: {
      eyebrow: 'TRAZABILIDAD OPERACIONAL',
      title: 'Qué ocurrió, dónde y cuándo',
      description: 'Conecta registros, responsables y eventos para reconstruir el contexto operacional.',
      metricLabel: 'EVENTOS TRAZADOS',
      metricValue: '14',
      metricNote: 'ventana demo de 24 horas',
      alert: 'La secuencia del sector S1 conserva programación, inicio y evento asociado.',
      bars: [18, 28, 44, 38, 62, 55, 73, 69, 82]
    }
  };
  const productTabs = Array.from(doc.querySelectorAll('[data-product-tab]'));
  const productPanel = doc.getElementById('productPanel');
  const tourMap = doc.getElementById('tourMap');
  const tourBars = doc.getElementById('tourBars');
  const setText = (id, value) => { const node = doc.getElementById(id); if (node) node.textContent = value; };
  const activateProductMode = (key, focus = false) => {
    const mode = productModes[key];
    if (!mode || !productPanel || !tourMap) return;
    const activeTab = productTabs.find((tab) => tab.dataset.productTab === key);
    productTabs.forEach((tab) => {
      const active = tab === activeTab;
      tab.setAttribute('aria-selected', String(active));
      tab.tabIndex = active ? 0 : -1;
    });
    productPanel.setAttribute('aria-labelledby', activeTab?.id || 'tab-visibility');
    tourMap.classList.add('is-switching');
    window.setTimeout(() => {
      tourMap.dataset.mode = key;
      setText('tourEyebrow', mode.eyebrow);
      setText('tourTitle', mode.title);
      setText('tourDescription', mode.description);
      setText('tourMetricLabel', mode.metricLabel);
      setText('tourMetricValue', mode.metricValue);
      setText('tourMetricNote', mode.metricNote);
      const alert = doc.querySelector('#tourAlert strong');
      if (alert) alert.textContent = mode.alert;
      if (tourBars) {
        Array.from(tourBars.children).forEach((bar, index) => {
          bar.style.setProperty('--h', `${mode.bars[index]}%`);
          bar.animate([{ transform: 'scaleY(.15)', opacity: .25 }, { transform: 'scaleY(1)', opacity: 1 }], { duration: reducedMotion ? 1 : 450, easing: 'cubic-bezier(.2,.82,.2,1)', fill: 'both' });
        });
      }
      tourMap.classList.remove('is-switching');
    }, reducedMotion ? 0 : 130);
    if (focus) activeTab?.focus();
    track('product_view', { view: key });
  };

  productTabs.forEach((tab, index) => {
    tab.addEventListener('click', () => activateProductMode(tab.dataset.productTab));
    tab.addEventListener('keydown', (event) => {
      if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
      event.preventDefault();
      let next = index;
      if (event.key === 'ArrowRight') next = (index + 1) % productTabs.length;
      if (event.key === 'ArrowLeft') next = (index - 1 + productTabs.length) % productTabs.length;
      if (event.key === 'Home') next = 0;
      if (event.key === 'End') next = productTabs.length - 1;
      activateProductMode(productTabs[next].dataset.productTab, true);
    });
  });

  doc.querySelectorAll('[data-analytics]').forEach((element) => {
    element.addEventListener('click', () => track(element.dataset.analytics, { link_text: element.textContent.trim() }));
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

(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.add("js");
  var body = document.body;
  var menuButton = document.getElementById("menuToggle");
  var mobileMenu = document.getElementById("mobileMenu");
  var year = document.getElementById("year");
  var scrollProgress = document.getElementById("scrollProgress");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var intro = document.getElementById("conectaIntro");

  function removeIntro() {
    body.classList.remove("conecta-intro-active");
    root.classList.remove("conecta-intro-enabled");
    if (intro && intro.parentNode) intro.parentNode.removeChild(intro);
  }

  if (intro && root.classList.contains("conecta-intro-enabled") && !reduceMotion.matches) {
    body.classList.add("conecta-intro-active");

    var introFallback = window.setTimeout(removeIntro, 2600);

    intro.addEventListener("animationend", function (event) {
      if (event.target !== intro || (event.animationName !== "conecta-intro-leave" && event.animationName !== "conecta-intro-skip")) return;
      window.clearTimeout(introFallback);
      removeIntro();
    });

    intro.addEventListener("pointerup", function () {
      intro.classList.add("is-skipping");
    }, { once: true });
  } else if (intro) {
    removeIntro();
  }

  function updateScrollProgress() {
    if (!scrollProgress) return;
    var maximum = document.documentElement.scrollHeight - window.innerHeight;
    var progress = maximum > 0 ? Math.min(1, Math.max(0, window.scrollY / maximum)) : 0;
    scrollProgress.style.setProperty("--scroll-progress", progress.toFixed(4));
  }

  if (scrollProgress) {
    var progressFrame = 0;
    updateScrollProgress();
    window.addEventListener("scroll", function () {
      if (progressFrame) return;
      progressFrame = window.requestAnimationFrame(function () {
        updateScrollProgress();
        progressFrame = 0;
      });
    }, { passive: true });
    window.addEventListener("resize", updateScrollProgress, { passive: true });
  }

  var revealTargets = document.querySelectorAll([
    ".hero-copy",
    ".hero-visual",
    ".section-heading",
    ".purpose-copy",
    ".program-card",
    ".pillar-grid",
    ".method-steps",
    ".pilots-layout",
    ".organization-panel",
    ".impact-layout",
    ".support-heading",
    ".support-card",
    ".support-form-panel",
    ".alliance-grid",
    ".final-cta-content"
  ].join(","));

  revealTargets.forEach(function (element) {
    element.setAttribute("data-reveal", "");
  });

  if (reduceMotion.matches || !("IntersectionObserver" in window)) {
    revealTargets.forEach(function (element) { element.classList.add("is-visible"); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -10%", threshold: 0.08 });

    revealTargets.forEach(function (element) { revealObserver.observe(element); });
  }

  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  var hero = document.querySelector(".hero");
  var heroVisual = document.querySelector("[data-parallax]");

  if (hero && heroVisual && finePointer.matches && !reduceMotion.matches) {
    hero.addEventListener("pointermove", function (event) {
      var bounds = hero.getBoundingClientRect();
      var x = ((event.clientX - bounds.left) / bounds.width - 0.5) * 16;
      var y = ((event.clientY - bounds.top) / bounds.height - 0.5) * 12;
      heroVisual.style.setProperty("--parallax-x", x.toFixed(2) + "px");
      heroVisual.style.setProperty("--parallax-y", y.toFixed(2) + "px");
    }, { passive: true });

    hero.addEventListener("pointerleave", function () {
      heroVisual.style.setProperty("--parallax-x", "0px");
      heroVisual.style.setProperty("--parallax-y", "0px");
    });
  }

  if (finePointer.matches && !reduceMotion.matches) {
    document.querySelectorAll("[data-interactive-card]").forEach(function (card) {
      card.addEventListener("pointermove", function (event) {
        var bounds = card.getBoundingClientRect();
        card.style.setProperty("--pointer-x", (((event.clientX - bounds.left) / bounds.width) * 100).toFixed(1) + "%");
        card.style.setProperty("--pointer-y", (((event.clientY - bounds.top) / bounds.height) * 100).toFixed(1) + "%");
      }, { passive: true });

      card.addEventListener("pointerleave", function () {
        card.style.setProperty("--pointer-x", "50%");
        card.style.setProperty("--pointer-y", "50%");
      });
    });
  }

  if (year) {
    year.textContent = String(new Date().getFullYear());
  }

  var supportForm = document.getElementById("supportForm");
  var supportFormStatus = document.getElementById("supportFormStatus");
  var supportFormSuccess = document.getElementById("supportFormSuccess");
  var supportFormReset = document.getElementById("supportFormReset");

  function setSupportFormPending(isPending) {
    if (!supportForm) return;
    var submitButton = supportForm.querySelector('button[type="submit"]');
    supportForm.setAttribute("aria-busy", isPending ? "true" : "false");
    supportForm.classList.toggle("is-submitting", isPending);
    if (submitButton) submitButton.disabled = isPending;
  }

  function showSupportFormSuccess() {
    if (!supportForm || !supportFormSuccess) return;
    supportForm.reset();
    supportForm.hidden = true;
    supportFormSuccess.hidden = false;
    supportFormSuccess.focus({ preventScroll: true });
  }

  if (supportForm) {
    supportForm.addEventListener("submit", function (event) {
      if (!("fetch" in window) || !supportForm.dataset.endpoint) return;
      event.preventDefault();

      if (!supportForm.reportValidity()) return;
      if (supportFormStatus) supportFormStatus.textContent = "";
      setSupportFormPending(true);

      fetch(supportForm.dataset.endpoint, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(supportForm)
      })
        .then(function (response) {
          if (!response.ok) throw new Error("No fue posible enviar el formulario");
          return response.json();
        })
        .then(function (data) {
          if (data && (data.success === false || data.success === "false")) {
            throw new Error("El servicio no confirmó el envío");
          }
          showSupportFormSuccess();
        })
        .catch(function () {
          if (supportFormStatus) {
            supportFormStatus.innerHTML = 'No pudimos enviar el mensaje. Intenta nuevamente o escríbenos a <a href="mailto:contacto@vitairos.com">contacto@vitairos.com</a>.';
          }
        })
        .finally(function () {
          setSupportFormPending(false);
        });
    });
  }

  if (supportFormReset && supportForm && supportFormSuccess) {
    supportFormReset.addEventListener("click", function () {
      supportFormSuccess.hidden = true;
      supportForm.hidden = false;
      if (supportFormStatus) supportFormStatus.textContent = "";
      var firstField = supportForm.querySelector("input:not([type='hidden'])");
      if (firstField) firstField.focus({ preventScroll: true });
    });
  }

  function closeMenu(restoreFocus) {
    if (!menuButton || !mobileMenu) return;
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Abrir menú");
    mobileMenu.hidden = true;
    body.classList.remove("menu-open");
    if (restoreFocus) menuButton.focus();
  }

  function openMenu() {
    if (!menuButton || !mobileMenu) return;
    menuButton.setAttribute("aria-expanded", "true");
    menuButton.setAttribute("aria-label", "Cerrar menú");
    mobileMenu.hidden = false;
    body.classList.add("menu-open");
    var firstLink = mobileMenu.querySelector("a");
    if (firstLink) firstLink.focus();
  }

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      var isOpen = menuButton.getAttribute("aria-expanded") === "true";
      if (isOpen) closeMenu(false);
      else openMenu();
    });

    mobileMenu.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeMenu(false);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && menuButton.getAttribute("aria-expanded") === "true") {
        closeMenu(true);
      }
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 900 && menuButton.getAttribute("aria-expanded") === "true") {
        closeMenu(false);
      }
    }, { passive: true });
  }

  function renderMetrics(metrics) {
    var mount = document.getElementById("pilotMetrics");
    var template = document.getElementById("impactMetricTemplate");
    if (!mount || !template || !Array.isArray(metrics)) return;

    var realMetrics = metrics.filter(function (metric) {
      return metric && metric.verified === true && metric.value !== null && metric.value !== "" && metric.label;
    });

    if (!realMetrics.length) return;
    var fragment = document.createDocumentFragment();
    realMetrics.forEach(function (metric) {
      var card = template.content.firstElementChild.cloneNode(true);
      card.querySelector("[data-value]").textContent = String(metric.value);
      card.querySelector("[data-label]").textContent = metric.label;
      fragment.appendChild(card);
    });
    mount.appendChild(fragment);
    mount.hidden = false;
  }

  function renderAllies(allies) {
    var section = document.getElementById("alianzas");
    var mount = document.getElementById("allianceGrid");
    if (!section || !mount || !Array.isArray(allies)) return;

    var confirmed = allies.filter(function (ally) {
      return ally && ally.confirmed === true && ally.name && ally.logoUrl && ally.logoAlt;
    });

    if (!confirmed.length) return;
    confirmed.forEach(function (ally) {
      var item = document.createElement(ally.website ? "a" : "div");
      item.className = "alliance-item";
      if (ally.website) {
        item.href = ally.website;
        item.target = "_blank";
        item.rel = "noopener noreferrer";
      }
      var logo = document.createElement("img");
      logo.src = ally.logoUrl;
      logo.alt = ally.logoAlt;
      logo.loading = "lazy";
      logo.decoding = "async";
      logo.width = 180;
      logo.height = 80;
      item.appendChild(logo);
      mount.appendChild(item);
    });
    section.hidden = false;
  }

  if ("fetch" in window) {
    fetch("/data/conecta-impact.json", { headers: { Accept: "application/json" } })
      .then(function (response) {
        if (!response.ok) throw new Error("Impact data is unavailable");
        return response.json();
      })
      .then(function (data) {
        renderMetrics(data.metrics);
        renderAllies(data.allies);
      })
      .catch(function () {
        /* Empty or unavailable future data must never expose placeholders publicly. */
      });
  }
})();

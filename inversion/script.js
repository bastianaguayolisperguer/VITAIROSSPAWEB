(function () {
  "use strict";

  const root = document.documentElement;
  const body = document.body;
  const header = document.querySelector(".inv-header");
  const menuButton = document.querySelector(".inv-menu-toggle");
  const mobileMenu = document.getElementById("mobileMenu");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  function updateScrollState() {
    const scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
    const progress = Math.min(Math.max(window.scrollY / scrollable, 0), 1) * 100;
    root.style.setProperty("--scroll-progress", progress.toFixed(2) + "%");
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 24);
  }

  let scrollFrame = 0;
  window.addEventListener("scroll", function () {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(function () {
      updateScrollState();
      scrollFrame = 0;
    });
  }, { passive: true });
  updateScrollState();

  function setMenu(open) {
    if (!menuButton || !mobileMenu) return;
    menuButton.setAttribute("aria-expanded", String(open));
    menuButton.setAttribute("aria-label", open ? "Cerrar menú" : "Abrir menú");
    mobileMenu.setAttribute("aria-hidden", String(!open));
    mobileMenu.classList.toggle("is-open", open);
    body.classList.toggle("inv-menu-open", open);
  }

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      setMenu(menuButton.getAttribute("aria-expanded") !== "true");
    });
    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () { setMenu(false); });
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        setMenu(false);
        menuButton.focus();
      }
    });
    window.addEventListener("resize", function () {
      if (window.innerWidth > 1080) setMenu(false);
    }, { passive: true });
  }

  const revealItems = Array.from(document.querySelectorAll("[data-reveal]"));
  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    revealItems.forEach(function (item) { item.classList.add("is-visible"); });
  } else {
    const revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8%", threshold: 0.08 });
    revealItems.forEach(function (item) { revealObserver.observe(item); });
  }

  const heroVisual = document.querySelector(".inv-hero__visual");
  if (heroVisual) {
    if (reducedMotion.matches || !("IntersectionObserver" in window)) {
      heroVisual.classList.add("is-map-active");
    } else {
      const mapObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          entry.target.classList.toggle("is-map-active", entry.isIntersecting);
        });
      }, { threshold: 0.08 });
      mapObserver.observe(heroVisual);

      let mapFrame = 0;
      heroVisual.addEventListener("pointermove", function (event) {
        if (mapFrame || event.pointerType === "touch") return;
        mapFrame = window.requestAnimationFrame(function () {
          const bounds = heroVisual.getBoundingClientRect();
          const horizontal = ((event.clientX - bounds.left) / Math.max(bounds.width, 1) - 0.5) * 10;
          const vertical = ((event.clientY - bounds.top) / Math.max(bounds.height, 1) - 0.5) * 8;
          heroVisual.style.setProperty("--map-x", horizontal.toFixed(2) + "px");
          heroVisual.style.setProperty("--map-y", vertical.toFixed(2) + "px");
          mapFrame = 0;
        });
      }, { passive: true });
      heroVisual.addEventListener("pointerleave", function () {
        heroVisual.style.setProperty("--map-x", "0px");
        heroVisual.style.setProperty("--map-y", "0px");
      }, { passive: true });
    }
  }

  const desktopLinks = Array.from(document.querySelectorAll(".inv-nav a[href^='#']"));
  const trackedSections = desktopLinks.map(function (link) {
    return document.querySelector(link.getAttribute("href"));
  }).filter(Boolean);

  if ("IntersectionObserver" in window && trackedSections.length) {
    const activeObserver = new IntersectionObserver(function (entries) {
      const visible = entries.filter(function (entry) { return entry.isIntersecting; })
        .sort(function (a, b) { return b.intersectionRatio - a.intersectionRatio; })[0];
      if (!visible) return;
      desktopLinks.forEach(function (link) {
        const active = link.getAttribute("href") === "#" + visible.target.id;
        link.classList.toggle("is-active", active);
        if (active) link.setAttribute("aria-current", "location");
        else link.removeAttribute("aria-current");
      });
    }, { rootMargin: "-24% 0px -64%", threshold: [0, 0.15, 0.4] });
    trackedSections.forEach(function (section) { activeObserver.observe(section); });
  }

  document.querySelectorAll("[aria-disabled='true']").forEach(function (control) {
    control.addEventListener("click", function (event) { event.preventDefault(); });
    control.addEventListener("keydown", function (event) {
      if (event.key === "Enter" || event.key === " ") event.preventDefault();
    });
  });
}());

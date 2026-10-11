(function () {
  "use strict";

  var root = document.documentElement;
  var body = document.body;
  var header = document.querySelector(".site-header");
  var menuButton = document.getElementById("menuToggle");
  var mobileMenu = document.getElementById("mobileMenu");
  var progress = document.getElementById("scrollProgress");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  var finePointer = window.matchMedia("(hover: hover) and (pointer: fine)");
  var desktopNav = window.matchMedia("(min-width: 1081px)");

  function updateScrollState() {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 18);
    if (progress) {
      var max = root.scrollHeight - window.innerHeight;
      var value = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      progress.style.setProperty("--progress", value.toFixed(4));
    }
  }

  var scrollFrame = 0;
  window.addEventListener("scroll", function () {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(function () {
      updateScrollState();
      scrollFrame = 0;
    });
  }, { passive: true });
  updateScrollState();

  function closeMenu(restoreFocus) {
    if (!menuButton || !mobileMenu) return;
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Abrir menú");
    mobileMenu.hidden = true;
    body.classList.remove("menu-open");
    if (header) header.classList.remove("is-menu-open");
    if (restoreFocus) menuButton.focus();
  }

  function openMenu() {
    if (!menuButton || !mobileMenu) return;
    menuButton.setAttribute("aria-expanded", "true");
    menuButton.setAttribute("aria-label", "Cerrar menú");
    mobileMenu.hidden = false;
    body.classList.add("menu-open");
    if (header) header.classList.add("is-menu-open");
    var firstLink = mobileMenu.querySelector("a");
    if (firstLink) firstLink.focus();
  }

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      if (menuButton.getAttribute("aria-expanded") === "true") closeMenu(false);
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

    desktopNav.addEventListener("change", function (event) {
      if (event.matches) closeMenu(false);
    });
  }

  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  if (reduceMotion.matches || !("IntersectionObserver" in window)) {
    reveals.forEach(function (element) { element.classList.add("is-visible"); });
  } else {
    var revealObserver = new IntersectionObserver(function (entries, observer) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8%", threshold: 0.08 });
    reveals.forEach(function (element) { revealObserver.observe(element); });
  }

  var hero = document.querySelector(".hero");
  var system = document.querySelector("[data-parallax]");
  if (hero && system && finePointer.matches && !reduceMotion.matches && window.innerWidth > 1180) {
    var pointerFrame = 0;
    var targetX = 0;
    var targetY = 0;

    function paintPointer() {
      system.style.transform = "translate3d(" + targetX.toFixed(2) + "px," + targetY.toFixed(2) + "px,0)";
      pointerFrame = 0;
    }

    hero.addEventListener("pointermove", function (event) {
      var rect = hero.getBoundingClientRect();
      targetX = ((event.clientX - rect.left) / rect.width - 0.5) * 8;
      targetY = ((event.clientY - rect.top) / rect.height - 0.5) * 6;
      if (!pointerFrame) pointerFrame = window.requestAnimationFrame(paintPointer);
    });

    hero.addEventListener("pointerleave", function () {
      targetX = 0;
      targetY = 0;
      if (!pointerFrame) pointerFrame = window.requestAnimationFrame(paintPointer);
    });
  }

  document.querySelectorAll(".faq-list details").forEach(function (detail) {
    detail.addEventListener("toggle", function () {
      if (!detail.open) return;
      document.querySelectorAll(".faq-list details[open]").forEach(function (other) {
        if (other !== detail) other.open = false;
      });
    });
  });

  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
}());

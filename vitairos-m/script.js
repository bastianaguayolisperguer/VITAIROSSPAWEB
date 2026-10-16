(function () {
  "use strict";

  var reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var intro = document.querySelector("[data-site-intro]");
  var introPending = document.documentElement.classList.contains("intro-pending");
  var header = document.getElementById("siteHeader");
  var progress = document.getElementById("readingProgress");
  var frame = 0;

  function setSvgMotion(container, active) {
    container.querySelectorAll("svg[data-motion-svg]").forEach(function (svg) {
      try {
        if (active && !reducedMotion) svg.unpauseAnimations();
        else svg.pauseAnimations();
      } catch (error) {}
    });
  }

  function finishIntro() {
    document.documentElement.classList.remove("intro-pending");
    document.body.classList.remove("intro-active");
    if (intro) intro.hidden = true;
    document.querySelectorAll(".hero, .hero-orbit").forEach(function (item) {
      var bounds = item.getBoundingClientRect();
      if (bounds.bottom > 0 && bounds.top < window.innerHeight) {
        item.classList.add("is-in-view");
        setSvgMotion(item, true);
      }
    });
  }

  if (introPending && intro && !reducedMotion) {
    document.body.classList.add("intro-active");
    try { sessionStorage.setItem("vitairosMIntroSeen", "1"); } catch (error) {}
    window.setTimeout(finishIntro, 2360);
  } else {
    finishIntro();
  }

  function updateChrome() {
    frame = 0;
    var scrollTop = window.scrollY || document.documentElement.scrollTop;
    var maximum = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    if (header) header.classList.toggle("is-scrolled", scrollTop > 28);
    if (progress) progress.style.transform = "scaleX(" + Math.max(0, Math.min(1, scrollTop / maximum)) + ")";
  }

  function scheduleChrome() {
    if (!frame) frame = window.requestAnimationFrame(updateChrome);
  }

  window.addEventListener("scroll", scheduleChrome, { passive: true });
  window.addEventListener("resize", scheduleChrome, { passive: true });
  updateChrome();

  var focusableSelector = "a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex='-1'])";

  function trapFocus(event, container) {
    if (event.key !== "Tab") return;
    var items = Array.prototype.slice.call(container.querySelectorAll(focusableSelector)).filter(function (item) {
      return item.offsetParent !== null;
    });
    if (!items.length) return;
    var first = items[0];
    var last = items[items.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  /* Mobile navigation */
  var menuButton = document.querySelector(".menu-toggle");
  var mobileMenu = document.getElementById("mobileMenu");
  var menuReturnFocus = null;

  function closeMenu(restoreFocus) {
    if (!menuButton || !mobileMenu || mobileMenu.hidden) return;
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-label", "Abrir menú");
    mobileMenu.classList.remove("is-open");
    document.body.classList.remove("menu-open");
    window.setTimeout(function () { mobileMenu.hidden = true; }, reducedMotion ? 0 : 300);
    if (restoreFocus !== false && menuReturnFocus) menuReturnFocus.focus();
  }

  function openMenu() {
    if (!menuButton || !mobileMenu) return;
    menuReturnFocus = menuButton;
    mobileMenu.hidden = false;
    menuButton.setAttribute("aria-expanded", "true");
    menuButton.setAttribute("aria-label", "Cerrar menú");
    document.body.classList.add("menu-open");
    window.requestAnimationFrame(function () {
      mobileMenu.classList.add("is-open");
      var firstLink = mobileMenu.querySelector("a");
      if (firstLink) firstLink.focus({ preventScroll: true });
    });
  }

  if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", function () {
      if (menuButton.getAttribute("aria-expanded") === "true") closeMenu(true);
      else openMenu();
    });
    mobileMenu.addEventListener("keydown", function (event) { trapFocus(event, mobileMenu); });
    mobileMenu.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", function () { closeMenu(false); });
    });
  }

  /* Accessible legal dialogs */
  var modalReturnFocus = null;
  var activeModal = null;
  var demandPanel = document.querySelector("[data-demand-panel]");
  var demandTriggers = Array.prototype.slice.call(document.querySelectorAll("[data-lead-select]"));
  var demandViews = Array.prototype.slice.call(document.querySelectorAll("[data-lead-view]"));
  var activeDemandTrigger = null;
  var demandCloseTimer = 0;

  function closeModal(name) {
    var modal = document.getElementById("modal-" + name);
    if (!modal || modal.hidden) return;
    modal.setAttribute("aria-hidden", "true");
    modal.hidden = true;
    activeModal = null;
    document.body.classList.remove("modal-open");
    if (modalReturnFocus) modalReturnFocus.focus();
  }

  function openModal(name, trigger) {
    var modal = document.getElementById("modal-" + name);
    if (!modal) return;
    modalReturnFocus = trigger;
    activeModal = modal;
    modal.hidden = false;
    modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");
    var close = modal.querySelector(".modal__close");
    window.requestAnimationFrame(function () { if (close) close.focus({ preventScroll: true }); });
  }

  document.querySelectorAll("[data-modal-open]").forEach(function (button) {
    button.addEventListener("click", function () { openModal(button.getAttribute("data-modal-open"), button); });
  });

  document.querySelectorAll("[data-modal-close]").forEach(function (button) {
    button.addEventListener("click", function () { closeModal(button.getAttribute("data-modal-close")); });
  });

  document.querySelectorAll(".modal").forEach(function (modal) {
    modal.addEventListener("keydown", function (event) { trapFocus(event, modal); });
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    if (activeModal) {
      closeModal(activeModal.id.replace("modal-", ""));
      return;
    }
    if (menuButton && menuButton.getAttribute("aria-expanded") === "true") {
      closeMenu(true);
      return;
    }
    if (demandPanel && !demandPanel.hidden) closeDemand(true);
  });

  /* Keyboard-friendly perspective tabs */
  document.querySelectorAll("[data-tabs]").forEach(function (tabsRoot) {
    var tabs = Array.prototype.slice.call(tabsRoot.querySelectorAll('[role="tab"]'));
    var switchTimer = 0;

    function activateTab(tab, moveFocus) {
      var currentTab = tabs.find(function (item) { return item.getAttribute("aria-selected") === "true"; });
      var currentPanel = currentTab ? document.getElementById(currentTab.getAttribute("aria-controls")) : null;
      var nextPanel = document.getElementById(tab.getAttribute("aria-controls"));

      if (currentTab === tab) {
        if (moveFocus) tab.focus();
        return;
      }

      window.clearTimeout(switchTimer);
      tabsRoot.querySelectorAll(".perspective-panel.is-leaving").forEach(function (panel) {
        panel.hidden = true;
        panel.classList.remove("is-active", "is-leaving");
      });

      tabs.forEach(function (item) {
        var selected = item === tab;
        item.setAttribute("aria-selected", selected ? "true" : "false");
        item.tabIndex = selected ? 0 : -1;
      });

      if (!nextPanel) return;
      nextPanel.hidden = false;
      nextPanel.removeAttribute("aria-hidden");

      if (reducedMotion || !currentPanel) {
        tabsRoot.querySelectorAll(".perspective-panel").forEach(function (panel) {
          var selected = panel === nextPanel;
          panel.hidden = !selected;
          panel.classList.toggle("is-active", selected);
          if (!selected) panel.setAttribute("aria-hidden", "true");
        });
      } else {
        currentPanel.setAttribute("aria-hidden", "true");
        currentPanel.classList.add("is-leaving");
        nextPanel.classList.add("is-active", "is-entering");
        void nextPanel.offsetWidth;
        window.requestAnimationFrame(function () { nextPanel.classList.remove("is-entering"); });
        switchTimer = window.setTimeout(function () {
          currentPanel.hidden = true;
          currentPanel.classList.remove("is-active", "is-leaving");
        }, 380);
      }

      if (moveFocus) tab.focus();
    }

    tabs.forEach(function (tab, index) {
      tab.addEventListener("click", function () { activateTab(tab, false); });
      tab.addEventListener("keydown", function (event) {
        var next = index;
        if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % tabs.length;
        else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + tabs.length) % tabs.length;
        else if (event.key === "Home") next = 0;
        else if (event.key === "End") next = tabs.length - 1;
        else return;
        event.preventDefault();
        activateTab(tabs[next], true);
      });
    });
  });

  /* Reveal content and pause ambient motion offscreen */
  var revealItems = document.querySelectorAll("[data-reveal]");
  var movingItems = document.querySelectorAll(".hero, .hero-orbit, [data-loop]");

  movingItems.forEach(function (item) { setSvgMotion(item, false); });

  if (reducedMotion || !("IntersectionObserver" in window)) {
    revealItems.forEach(function (item) { item.classList.add("is-visible"); });
    movingItems.forEach(function (item) {
      item.classList.add("is-in-view");
      setSvgMotion(item, !reducedMotion);
    });
  } else {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08, rootMargin: "0px 0px -4% 0px" });

    revealItems.forEach(function (item) { revealObserver.observe(item); });

    var motionObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var active = entry.isIntersecting && !document.documentElement.classList.contains("intro-pending");
        entry.target.classList.toggle("is-in-view", active);
        setSvgMotion(entry.target, active);
      });
    }, { threshold: 0.03, rootMargin: "8% 0px 8% 0px" });

    movingItems.forEach(function (item) { motionObserver.observe(item); });

    window.setTimeout(function () {
      revealItems.forEach(function (item) {
        if (item.getBoundingClientRect().top < window.innerHeight * 1.1) item.classList.add("is-visible");
      });
    }, 1400);
  }

  /* Participation paths, lead routing and FormSubmit state */
  var params = new URLSearchParams(window.location.search);
  var validLeadTypes = ["person", "professional", "institution"];

  function openDemand(type, moveFocus) {
    if (!demandPanel || validLeadTypes.indexOf(type) === -1) return;
    window.clearTimeout(demandCloseTimer);
    activeDemandTrigger = demandTriggers.find(function (trigger) {
      return trigger.getAttribute("data-lead-select") === type;
    }) || activeDemandTrigger;
    demandTriggers.forEach(function (trigger) {
      var selected = trigger.getAttribute("data-lead-select") === type;
      trigger.classList.toggle("is-selected", selected);
      trigger.setAttribute("aria-expanded", selected ? "true" : "false");
    });
    demandViews.forEach(function (view) {
      view.hidden = view.getAttribute("data-lead-view") !== type;
    });
    demandPanel.setAttribute("data-active-lead", type);
    demandPanel.hidden = false;
    window.requestAnimationFrame(function () {
      demandPanel.classList.add("is-open");
      if (!moveFocus) return;
      var activeView = demandPanel.querySelector('[data-lead-view="' + type + '"]');
      var heading = activeView ? activeView.querySelector("h3[tabindex='-1']") : null;
      if (heading) heading.focus({ preventScroll: true });
      demandPanel.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
    });
  }

  function closeDemand(restoreFocus) {
    if (!demandPanel || demandPanel.hidden) return;
    demandPanel.classList.remove("is-open");
    demandTriggers.forEach(function (trigger) {
      trigger.classList.remove("is-selected");
      trigger.setAttribute("aria-expanded", "false");
    });
    demandCloseTimer = window.setTimeout(function () {
      demandPanel.hidden = true;
      demandPanel.setAttribute("data-active-lead", "");
      demandViews.forEach(function (view) { view.hidden = true; });
    }, reducedMotion ? 0 : 320);
    if (restoreFocus !== false && activeDemandTrigger) activeDemandTrigger.focus({ preventScroll: true });
  }

  demandTriggers.forEach(function (trigger, index) {
    trigger.addEventListener("click", function () {
      openDemand(trigger.getAttribute("data-lead-select"), true);
    });
    trigger.addEventListener("keydown", function (event) {
      var next = index;
      if (event.key === "ArrowRight" || event.key === "ArrowDown") next = (index + 1) % demandTriggers.length;
      else if (event.key === "ArrowLeft" || event.key === "ArrowUp") next = (index - 1 + demandTriggers.length) % demandTriggers.length;
      else if (event.key === "Home") next = 0;
      else if (event.key === "End") next = demandTriggers.length - 1;
      else return;
      event.preventDefault();
      demandTriggers[next].focus();
    });
  });

  document.querySelectorAll("[data-demand-close]").forEach(function (button) {
    button.addEventListener("click", function () { closeDemand(true); });
  });

  function setTrackingField(form, name, value) {
    var field = form.querySelector('input[name="' + name + '"]');
    if (!field) {
      field = document.createElement("input");
      field.type = "hidden";
      field.name = name;
      form.appendChild(field);
    }
    field.value = value || "";
  }

  document.querySelectorAll("[data-tracking-form]").forEach(function (form) {
    ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"].forEach(function (name) {
      setTrackingField(form, name, params.get(name) || "");
    });
    setTrackingField(form, "referrer", document.referrer || "direct");
    setTrackingField(form, "landing_path", window.location.pathname);

    form.addEventListener("invalid", function () {
      var error = form.querySelector("[data-form-error]");
      if (error) error.hidden = false;
    }, true);
    ["input", "change"].forEach(function (eventName) {
      form.addEventListener(eventName, function () {
        var error = form.querySelector("[data-form-error]");
        if (error && form.checkValidity()) error.hidden = true;
      });
    });
  });

  var confirmedLead = params.get("lead");
  if (params.get("enviado") === "1" && validLeadTypes.indexOf(confirmedLead) !== -1) {
    var confirmedView = document.querySelector('[data-lead-view="' + confirmedLead + '"]');
    var confirmedForm = confirmedView ? confirmedView.querySelector("[data-demand-form]") : null;
    var confirmedSuccess = confirmedView ? confirmedView.querySelector('[data-demand-success="' + confirmedLead + '"]') : null;
    if (confirmedForm && confirmedSuccess) {
      confirmedForm.hidden = true;
      confirmedSuccess.hidden = false;
      openDemand(confirmedLead, false);
      window.setTimeout(function () {
        confirmedSuccess.focus({ preventScroll: true });
        document.getElementById("participa").scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "start" });
      }, 80);
    }
  }

  var year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());
})();

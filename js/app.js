/* app.js — scroll reveals (ScrollOut), scramble triggers, nav, language, lightbox */
(function () {
  "use strict";
  const AM = window.AM;

  /* ---------------- lightbox ---------------- */
  AM.openLightbox = function (src, caption) {
    const lb = document.getElementById("lightbox");
    document.getElementById("lightbox-img").src = src;
    document.getElementById("lightbox-img").alt = caption || "";
    document.getElementById("lightbox-cap").textContent = caption || "";
    lb.hidden = false;
    document.body.classList.add("lb-open");
    if (AM.audio) AM.audio.whoosh();
  };
  function closeLightbox() {
    document.getElementById("lightbox").hidden = true;
    document.body.classList.remove("lb-open");
    document.getElementById("lightbox-img").src = "";
  }

  document.addEventListener("DOMContentLoaded", () => {
    document.querySelectorAll("[data-lightbox-close]").forEach((el) => el.addEventListener("click", closeLightbox));
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeLightbox(); });

    /* ---------------- ScrollOut reveals + scramble-on-show ---------------- */
    const reveals = AM.qsa("[data-scroll]");
    reveals.forEach((el, i) => el.style.setProperty("--so-delay", ((i % 3) * 0.09).toFixed(2) + "s"));
    const scrambles = AM.qsa("[data-scramble-in]").filter((el) => !el.closest("#hero"));

    if (window.ScrollOut) {
      ScrollOut({
        targets: "[data-scroll]",
        once: true,
        offset: 80
      });
      if (scrambles.length) {
        ScrollOut({
          targets: "[data-scramble-in]",
          once: true,
          offset: 60,
          onShown(el) {
            if (el.closest("#hero")) return;
            AM.scrambleIn(el);
          }
        });
      }
    } else {
      reveals.forEach((el) => el.setAttribute("data-scroll", "in"));
      scrambles.forEach((el) => { if (!el.closest("#hero")) AM.scrambleIn(el); });
    }

    /* ---------------- active nav highlighting ---------------- */
    const links = AM.qsa(".topnav a");
    const map = {};
    links.forEach((a) => { map[a.getAttribute("href").slice(1)] = a; });
    const io = new IntersectionObserver((entries) => {
      entries.forEach((en) => {
        if (en.isIntersecting) {
          links.forEach((a) => a.classList.remove("is-active"));
          const link = map[en.target.id];
          if (link) link.classList.add("is-active");
        }
      });
    }, { rootMargin: "-38% 0px -55% 0px" });
    ["about", "work", "photo", "illo", "contact"].forEach((id) => {
      const s = document.getElementById(id);
      if (s) io.observe(s);
    });

    /* ---------------- mobile nav ---------------- */
    const nav = document.getElementById("topnav");
    const toggle = document.getElementById("menu-toggle");
    toggle.addEventListener("click", () => {
      const open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", String(open));
    });
    links.forEach((a) => a.addEventListener("click", () => {
      nav.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }));

    /* ---------------- language buttons ---------------- */
    AM.qsa(".lang-btn").forEach((b) => b.addEventListener("click", () => {
      AM.i18n.set(b.dataset.lang);
      if (AM.audio) AM.audio.blip();
    }));

    /* ---------------- back to top ---------------- */
    document.getElementById("to-top").addEventListener("click", () => {
      scrollTo({ top: 0, behavior: AM.reduceMotion ? "auto" : "smooth" });
    });

    /* ---------------- random ambient glitch on section titles ---------------- */
    if (!AM.reduceMotion && window.gsap) {
      const titles = AM.qsa(".sec-title");
      const picker = AM.rng(424242);
      setInterval(() => {
        if (picker() < 0.4 || !titles.length) return;
        const t = titles[Math.floor(picker() * titles.length)];
        const r = t.getBoundingClientRect();
        if (r.top < innerHeight && r.bottom > 0) {
          t.style.textShadow = "3px 0 rgba(238,155,0,.55), -3px 0 rgba(0,229,255,.55)";
          t.style.transform = `translateX(${(picker() - 0.5) * 4}px)`;
          setTimeout(() => { t.style.textShadow = ""; t.style.transform = ""; }, 90 + picker() * 120);
        }
      }, 2600);
    }
  });
})();

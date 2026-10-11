/* hero.js — hero entrance, date chip, tickers, per-char flicker */
(function () {
  "use strict";
  const AM = window.AM;

  document.addEventListener("DOMContentLoaded", () => {
    /* date chip */
    const chip = document.getElementById("hero-date");
    if (chip) {
      const d = new Date();
      const p = (n) => String(n).padStart(2, "0");
      chip.textContent = `[·${d.getFullYear()}·${p(d.getMonth() + 1)}·${p(d.getDate())}·]`;
    }

    /* tickers */
    AM.buildMarquee(document.getElementById("ticker-mobile"));
    AM.buildMarquee(document.getElementById("ticker-desktop"));
    document.querySelectorAll(".mini-track").forEach(AM.buildMarquee);

    /* hover scramble on nav + buttons */
    AM.qsa("[data-scramble-hover]").forEach(AM.hoverScramble);

    /* entrance once boot is done */
    document.addEventListener("am:ready", () => {
      const name = document.getElementById("hero-name");
      const role = document.querySelector("#hero-role [data-scramble-in]");
      AM.scrambleIn(name, { duration: 1.4 });
      setTimeout(() => AM.scrambleIn(role, { duration: 1.1 }), 260);
      if (window.gsap && !AM.reduceMotion) {
        gsap.from(".hero-cta .btn-key", { y: 22, autoAlpha: 0, duration: 0.6, ease: "power3.out", stagger: 0.12, delay: 0.5, clearProps: "all" });
        gsap.from(".hero-meta > *", { y: 14, autoAlpha: 0, duration: 0.5, ease: "power3.out", stagger: 0.07, delay: 0.75, clearProps: "all" });
        gsap.from(".howto", { x: 30, autoAlpha: 0, duration: 0.7, ease: "power3.out", delay: 0.9, clearProps: "all" });
        /* after the name scramble settles: split into chars, add idle wave + per-char scramble */
        setTimeout(() => {
          if (!window.Splitting) return;
          Splitting({ target: name, by: "chars" });
          const chars = AM.qsa(".char", name);
          chars.forEach((c) => { c.dataset.o = c.textContent; });
          gsap.to(chars, {
            y: -5, duration: 1.1, ease: "sine.inOut",
            stagger: { each: 0.055 }, yoyo: true, repeat: -1
          });
          name.addEventListener("pointerover", (e) => {
            const pool = chars.filter((c) => c.dataset.o && c.dataset.o.trim() !== "" && c.dataset.o !== "·");
            if (!pool.length) return;
            const c = pool[Math.floor(Math.random() * pool.length)];
            if (AM.audio) AM.audio.glitchFx();
            gsap.to(c, {
              duration: 0.3,
              scrambleText: { text: c.dataset.o, chars: "01*#", speed: 0.8 },
              ease: "none", overwrite: true
            });
          });
        }, 1700);
      }
    });
  });
})();

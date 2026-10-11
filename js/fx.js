/* fx.js — shared helpers & FX primitives (namespace AM) */
(function () {
  "use strict";
  document.documentElement.classList.add("js");
  if (window.gsap && window.ScrambleTextPlugin) gsap.registerPlugin(ScrambleTextPlugin);

  const AM = (window.AM = window.AM || {});
  AM.qs = (s, c) => (c || document).querySelector(s);
  AM.qsa = (s, c) => Array.from((c || document).querySelectorAll(s));
  AM.reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* seeded rng — same family as mulberry32 */
  AM.rng = function (seed) {
    let a = seed >>> 0;
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  const SCRAMBLE_CHARS = "01<>[]·*#/\\|=+";
  AM.scrambleIn = function (el, opts) {
    if (!el || el.dataset.scrambled === "busy") return;
    const target = el.textContent;
    el.dataset.scrambled = "busy";
    if (AM.reduceMotion || !window.gsap || !window.ScrambleTextPlugin) {
      el.dataset.scrambled = "done";
      return;
    }
    gsap.to(el, Object.assign({
      duration: 1.15,
      scrambleText: { text: target, chars: SCRAMBLE_CHARS, speed: 0.4, revealDelay: 0.05 },
      ease: "none",
      onComplete: () => { el.dataset.scrambled = "done"; }
    }, opts || {}));
  };

  AM.hoverScramble = function (el) {
    if (!el || AM.reduceMotion || !window.gsap || !window.ScrambleTextPlugin) return;
    if (!el.dataset.origText) el.dataset.origText = el.textContent;
    el.addEventListener("pointerenter", () => {
      gsap.to(el, {
        duration: 0.42,
        scrambleText: { text: el.dataset.origText, chars: SCRAMBLE_CHARS, speed: 0.6 },
        ease: "none",
        overwrite: true
      });
    });
  };

  AM.typeInto = function (el, text, speed, done) {
    if (!el) return;
    if (AM.reduceMotion) { el.textContent = text; if (done) done(); return; }
    el.textContent = "";
    let i = 0;
    clearInterval(el._typeTimer);
    el._typeTimer = setInterval(() => {
      i++;
      el.textContent = text.slice(0, i);
      if (AM.audio && i % 2 === 0) AM.audio.key();
      if (i >= text.length) { clearInterval(el._typeTimer); if (done) done(); }
    }, speed || 16);
  };

  /* build a seamless marquee: repeat content until > viewport, then duplicate for -50% loop */
  AM.buildMarquee = function (track) {
    if (!track) return;
    const base = track.querySelector("span");
    if (!base) return;
    let half = "";
    let probe = "";
    let guard = 0;
    while (guard++ < 14) {
      half += base.outerHTML;
      probe = half + half;
      if (probe.length > 140 && guard >= 2) break;
    }
    track.innerHTML = half + half;
  };
})();

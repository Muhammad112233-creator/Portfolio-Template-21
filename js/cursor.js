/* cursor.js — custom dot + ring cursor with context states */
(function () {
  "use strict";
  const AM = window.AM;
  if ("ontouchstart" in window || !window.matchMedia("(hover:hover) and (pointer:fine)").matches) return;

  document.addEventListener("DOMContentLoaded", () => {
    const root = document.getElementById("cursor");
    const dot = root.querySelector(".cursor-dot");
    const ring = root.querySelector(".cursor-ring");
    const label = ring.querySelector(".cursor-label");
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;

    addEventListener("pointermove", (e) => {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = `translate(${mx}px,${my}px)` + (root.classList.contains("is-cross") ? " scale(2.4)" : root.classList.contains("is-action") ? " scale(0)" : "");
    }, { passive: true });

    (function loop() {
      rx += (mx - rx) * 0.18;
      ry += (my - ry) * 0.18;
      ring.style.transform = `translate(${rx}px,${ry}px)`;
      requestAnimationFrame(loop);
    })();

    const LABELS = { zoom: "view", mail: "mail", home: "top", reveal: "scan", link: "" };
    document.addEventListener("pointerover", (e) => {
      const ctx = e.target.closest("[data-cursor]");
      const link = e.target.closest("a,button,.cat-item,.pol-card,.illo-thumb,.work-table tbody tr,input,textarea,label");
      root.classList.remove("is-link", "is-action", "is-cross");
      if (ctx) {
        const kind = ctx.dataset.cursor;
        if (kind === "zoom" || kind === "mail" || kind === "home") {
          root.classList.add("is-action");
          label.textContent = LABELS[kind] || "";
        } else if (kind === "reveal") {
          root.classList.add("is-cross");
          label.textContent = "";
        } else {
          root.classList.add("is-link");
        }
      } else if (link) {
        root.classList.add("is-link");
      }
    }, { passive: true });

    document.addEventListener("mouseleave", () => root.style.opacity = "0");
    document.addEventListener("mouseenter", () => root.style.opacity = "1");
  });
})();

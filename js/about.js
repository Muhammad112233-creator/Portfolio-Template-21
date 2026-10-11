/* about.js — certificate slider, binary stream, ghost words */
(function () {
  "use strict";
  const AM = window.AM;

  document.addEventListener("DOMContentLoaded", () => {
    /* ------------- binary stream: encode original phrase to binary ------------- */
    const bin = document.getElementById("binary-1");
    if (bin) {
      const phrase = "SIGNAL OVER NOISE · ";
      const bits = phrase.split("").map((c) => c.charCodeAt(0).toString(2).padStart(8, "0")).join(" ");
      const decorated = bits.replace(/1/g, (m, i) => (i % 7 === 0 ? `<b>${m}</b>` : m));
      bin.innerHTML = decorated + "  " + decorated;
    }

    /* ------------- certificates slider ------------- */
    const certs = (window.SITE_DATA && SITE_DATA.certs) || [];
    const img = document.getElementById("cert-img");
    if (!certs.length || !img) return;
    const fig = img.closest(".cert-figure");
    const cap = document.getElementById("cert-cap");
    const counter = document.getElementById("cert-counter");
    let idx = 0;

    function render(i, silent) {
      idx = (i + certs.length) % certs.length;
      const c = certs[idx];
      const go = () => {
        img.src = `assets/img/certs/${c.file}.webp`;
        img.alt = c.alt;
        cap.textContent = `${c.title} — ${c.issuer}, ${c.year}`;
        counter.textContent = `${String(idx + 1).padStart(2, "0")} / ${String(certs.length).padStart(2, "0")}`;
      };
      if (silent || AM.reduceMotion) { go(); return; }
      fig.classList.remove("is-swap");
      void fig.offsetWidth;
      fig.classList.add("is-swap");
      if (AM.audio) AM.audio.glitchFx();
      setTimeout(go, 130);
    }

    document.getElementById("cert-prev").addEventListener("click", () => render(idx - 1));
    document.getElementById("cert-next").addEventListener("click", () => render(idx + 1));
    fig.addEventListener("click", () => AM.openLightbox(img.src, cap.textContent));
    document.addEventListener("keydown", (e) => {
      const r = fig.getBoundingClientRect();
      if (r.top < innerHeight && r.bottom > 0) {
        if (e.key === "ArrowLeft") render(idx - 1);
        if (e.key === "ArrowRight") render(idx + 1);
      }
    });
    render(0, true);
  });
})();

/* illo.js — contact sheet, holo-cube gallery (12 works on 4 rotating faces) */
(function () {
  "use strict";
  const AM = window.AM;

  document.addEventListener("DOMContentLoaded", () => {
    const data = window.SITE_DATA;
    if (!data) return;
    const works = data.illustrations;

    /* ============ contact sheet ============ */
    const sheet = document.getElementById("illo-sheet");
    works.forEach((w) => {
      const im = document.createElement("img");
      im.className = "illo-thumb";
      im.src = `assets/img/illustrations/${w.file}.webp`;
      im.alt = `${w.title} — ${w.medium}, ${w.year}`;
      im.loading = "lazy";
      im.width = 1100; im.height = 1375;
      im.addEventListener("click", () => enter(works.indexOf(w)));
      sheet.appendChild(im);
    });
    /* duplicate for seamless marquee */
    sheet.innerHTML += sheet.innerHTML;
    AM.qsa(".illo-thumb", sheet).forEach((im) => {
      if (!im.dataset.bound) { im.dataset.bound = "1"; im.addEventListener("click", () => enter(works.findIndex((w) => im.src.includes(w.file)))); }
    });

    /* ============ cube ============ */
    const hint = document.getElementById("cube-hint");
    const stage = document.getElementById("cube-stage");
    const cube = document.getElementById("cube");
    const ghost = document.getElementById("cube-ghost");
    const progress = document.getElementById("cube-progress");
    const btnEnter = document.getElementById("cube-enter");
    const btnBack = document.getElementById("cube-back");
    const btnNext = document.getElementById("cube-next");
    let idx = 0;
    let angle = 0;
    let started = false;

    /* build 4 faces once */
    const faces = [];
    for (let k = 0; k < 4; k++) {
      const f = document.createElement("div");
      f.className = "cube-face";
      f.dataset.face = k;
      f.innerHTML = `
        <div class="face-media" data-cursor="zoom"><img alt="" width="1100" height="1375" draggable="false"></div>
        <div class="face-info">
          <span class="face-year"></span>
          <h3></h3>
          <span class="face-medium"></span>
          <p></p>
          <div class="face-tags"></div>
        </div>`;
      cube.appendChild(f);
      faces.push(f);
    }
    function sizeFaces() {
      const s = cube.parentElement.getBoundingClientRect().width;
      faces.forEach((f, k) => {
        f.style.transform = `rotateY(${k * 90}deg) translateZ(${s / 2}px)`;
      });
    }
    addEventListener("resize", sizeFaces);

    function fillFace(k, wi) {
      const w = works[((wi % works.length) + works.length) % works.length];
      const f = faces[k];
      const media = f.querySelector(".face-media");
      const im = media.querySelector("img");
      im.src = `assets/img/illustrations/${w.file}.webp`;
      im.alt = `${w.title} — ${w.medium}, ${w.year}. ${w.desc}`;
      media.onclick = () => AM.openLightbox(im.src, `${w.title} — ${w.medium} · ${w.year}`);
      f.querySelector(".face-year").textContent = w.year;
      f.querySelector("h3").textContent = w.title;
      f.querySelector(".face-medium").textContent = w.medium;
      f.querySelector(".face-info p").textContent = w.desc;
      f.querySelector(".face-tags").textContent = `${w.tags} · © ${w.year} Alex Marlowe`;
      ghost.textContent = w.title.split(" ")[0].toUpperCase();
      progress.textContent = String(Math.round(((wi % works.length) + 1) / works.length * 100)).padStart(3, "0") + "%";
    }

    function render(initial) {
      if (initial) {
        for (let k = 0; k < 4; k++) fillFace(k, k);
        cube.style.transform = "rotateY(0deg)";
      } else {
        cube.classList.remove("is-glitch");
        void cube.offsetWidth;
        cube.classList.add("is-glitch");
        /* the incoming side face is edge-on: safe to refill it just after the spin starts */
        setTimeout(() => fillFace(((idx % 4) + 4) % 4, idx), 110);
        cube.style.transform = `rotateY(${angle}deg)`;
        if (AM.audio) AM.audio.whoosh();
      }
    }

    function enter(startIdx) {
      if (started) return;
      started = true;
      idx = startIdx && startIdx > 0 ? startIdx : 0;
      angle = -90 * idx;
      if (AM.audio) AM.audio.confirm();
      hint.style.transition = "opacity .35s, transform .35s";
      hint.style.opacity = "0";
      hint.style.transform = "scale(.96)";
      setTimeout(() => {
        hint.hidden = true;
        stage.hidden = false;
        sizeFaces();
        /* prefill all faces relative to the chosen start index so every side is valid */
        for (let off = -2; off <= 2; off++) fillFace(((idx + off) % 4 + 4) % 4, idx + off);
        fillFace(((idx % 4) + 4) % 4, idx);
        cube.style.transition = "none";
        cube.style.transform = `rotateY(${angle}deg)`;
        void cube.offsetWidth;
        cube.style.transition = "";
        if (window.gsap && !AM.reduceMotion) {
          gsap.from(stage, { autoAlpha: 0, duration: 0.5, ease: "power2.out", clearProps: "all" });
          requestAnimationFrame(() => { stage.style.visibility = "visible"; stage.style.opacity = "1"; });
        }
      }, 360);
    }

    function next() { idx = (idx + 1) % works.length; angle -= 90; render(false); }
    function back() { idx = (idx - 1 + works.length) % works.length; angle += 90; render(false); }

    btnEnter.addEventListener("click", () => enter(0));
    btnNext.addEventListener("click", next);
    btnBack.addEventListener("click", back);
    document.addEventListener("keydown", (e) => {
      if (!started || stage.hidden || e.target.matches("input,textarea")) return;
      const r = stage.getBoundingClientRect();
      if (r.top < innerHeight * 0.75 && r.bottom > innerHeight * 0.25) {
        if (e.key === "ArrowRight") next();
        if (e.key === "ArrowLeft") back();
      }
    });
  });
})();

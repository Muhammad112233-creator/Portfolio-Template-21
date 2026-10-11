/* photo.js — archive accordion, preview terminal, polaroid carousel, reveal.sys module */
(function () {
  "use strict";
  const AM = window.AM;

  document.addEventListener("DOMContentLoaded", () => {
    const data = window.SITE_DATA;
    if (!data) return;

    /* ============ category accordion + viewer ============ */
    const catsWrap = document.getElementById("photo-cats");
    const img = document.getElementById("photo-img");
    const figure = img.closest(".photo-figure");
    const idle = document.getElementById("photo-idle");
    const cap = document.getElementById("photo-cap");
    const meta = document.getElementById("photo-meta");
    const spaced = (s) => "· " + s.split("").join(" ") + " ·";

    Object.entries(data.photos).forEach(([cat, items]) => {
      const box = document.createElement("div");
      box.className = "cat";
      box.innerHTML = `
        <button class="cat-head" type="button" aria-expanded="false">
          <span>${spaced(cat)}</span>
          <span class="cat-count">${String(items.length).padStart(2, "0")} <span data-i18n="photo.frames">${AM.i18n ? AM.i18n.t("photo.frames") : "frames"}</span></span>
        </button>
        <ul class="cat-list"></ul>`;
      const list = box.querySelector(".cat-list");
      items.forEach((p, i) => {
        const li = document.createElement("li");
        li.className = "cat-item";
        li.tabIndex = 0;
        li.innerHTML = `<span>${p.title}</span><span class="loc">${p.location}</span>`;
        li.addEventListener("click", () => select(cat, p, i));
        li.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); select(cat, p, i); } });
        list.appendChild(li);
      });
      box.querySelector(".cat-head").addEventListener("click", () => {
        const open = box.classList.contains("is-open");
        AM.qsa(".cat", catsWrap).forEach((c) => {
          c.classList.remove("is-open");
          c.querySelector(".cat-head").setAttribute("aria-expanded", "false");
          c.querySelector(".cat-list").style.maxHeight = "";
        });
        if (!open) {
          box.classList.add("is-open");
          box.querySelector(".cat-head").setAttribute("aria-expanded", "true");
          const l = box.querySelector(".cat-list");
          l.style.maxHeight = l.scrollHeight + "px";
        }
      });
      catsWrap.appendChild(box);
    });

    let current = null;
    function select(cat, p, i) {
      current = { cat, p, i };
      AM.qsa(".cat-item", catsWrap).forEach((el) => el.classList.remove("is-active"));
      const items = AM.qsa(`.cat:nth-of-type(${Object.keys(data.photos).indexOf(cat) + 1}) .cat-item`, catsWrap);
      if (items[i]) items[i].classList.add("is-active");
      idle.style.display = "none";
      figure.classList.remove("is-loaded");
      img.hidden = false;
      cap.hidden = false;
      meta.hidden = false;
      img.onload = () => figure.classList.add("is-loaded");
      img.src = `assets/img/photos/${cat}/${p.file}.webp`;
      img.alt = `${p.title} — ${p.location}, ${p.year}`;
      img.dataset.cursor = "zoom";
      img.onclick = () => AM.openLightbox(img.src, `${p.title} — ${p.location} · ${p.camera} · ${p.year}`);
      const total = data.photos[cat].length;
      cap.innerHTML = `<span>${p.title} — ${p.location}</span><span class="idx">${String(i + 1).padStart(2, "0")} / ${String(total).padStart(2, "0")}</span>`;
      AM.typeInto(document.getElementById("pm-loc"), p.location, 12);
      AM.typeInto(document.getElementById("pm-cam"), p.camera, 12);
      AM.typeInto(document.getElementById("pm-lens"), p.lens, 10);
      AM.typeInto(document.getElementById("pm-year"), p.year, 40);
      if (AM.audio) AM.audio.whoosh();
    }
    /* open first chapter by default so the panel explains itself */
    const firstHead = catsWrap.querySelector(".cat-head");
    if (firstHead) firstHead.click();

    /* ============ polaroid carousel ============ */
    const pols = data.polaroids;
    const stack = document.getElementById("pol-stack");
    const counter = document.getElementById("pol-counter");
    let head = 0;
    pols.forEach((p, k) => {
      const card = document.createElement("div");
      card.className = "pol-card";
      card.dataset.k = k;
      card.innerHTML = `<img src="assets/img/polaroids/${p.file}.webp" alt="Polaroid — ${p.caption}" width="1000" height="1200" loading="lazy">`;
      card.addEventListener("click", () => {
        const pos = Number(card.dataset.pos);
        if (pos === 1) AM.openLightbox(card.querySelector("img").src, p.caption);
        else if (pos === 0) rotate(-1);
        else if (pos === 2) rotate(1);
      });
      stack.appendChild(card);
    });
    function layout() {
      AM.qsa(".pol-card", stack).forEach((card) => {
        const k = Number(card.dataset.k);
        let rel = (k - head + pols.length) % pols.length;
        let pos;
        if (rel === 0) pos = "1";
        else if (rel === pols.length - 1) pos = "0";
        else if (rel === 1) pos = "2";
        else if (rel === pols.length - 2 || rel < pols.length / 2 && rel !== 0) pos = "out-l";
        else pos = "out-r";
        card.dataset.pos = pos;
      });
      counter.textContent = `${String(head + 1).padStart(3, "0")} / ${String(pols.length).padStart(3, "0")}`;
    }
    function rotate(dir) {
      head = (head + dir + pols.length) % pols.length;
      layout();
      if (AM.audio) AM.audio.whoosh();
    }
    document.getElementById("pol-prev").addEventListener("click", () => rotate(-1));
    document.getElementById("pol-next").addEventListener("click", () => rotate(1));
    document.addEventListener("keydown", (e) => {
      if (e.target.matches("input,textarea")) return;
      const r = stack.getBoundingClientRect();
      if (r.top < innerHeight * 0.75 && r.bottom > innerHeight * 0.25) {
        if (e.key === "ArrowLeft") rotate(-1);
        if (e.key === "ArrowRight") rotate(1);
      }
    });
    layout();

    /* ============ reveal.sys ============ */
    const box = document.getElementById("reveal-box");
    const mask = document.getElementById("reveal-mask");
    if (box) {
      box.addEventListener("pointermove", (e) => {
        const r = box.getBoundingClientRect();
        const x = ((e.clientX - r.left) / r.width) * 100;
        const y = ((e.clientY - r.top) / r.height) * 100;
        box.style.setProperty("--mx", x + "%");
        box.style.setProperty("--my", y + "%");
        mask.style.left = (e.clientX - r.left) + "px";
        mask.style.top = (e.clientY - r.top) + "px";
      }, { passive: true });
      box.addEventListener("pointerenter", () => box.classList.add("is-hover"));
      box.addEventListener("pointerleave", () => box.classList.remove("is-hover"));
    }
  });
})();

/* work.js — art direction panel: discipline tabs, project table, preview stage, void easter egg */
(function () {
  "use strict";
  const AM = window.AM;

  /* files that intentionally fall into the black hole (404 easter egg) */
  const MISSING = new Set(["id-svale", "ed-undergrid", "web-sykkel"]);

  document.addEventListener("DOMContentLoaded", () => {
    const data = window.SITE_DATA;
    if (!data) return;
    const tabs = AM.qsa(".work-tab");
    const tbody = document.getElementById("work-tbody");
    const stage = document.getElementById("work-stage");
    const idle = document.getElementById("stage-idle");
    const figure = document.getElementById("stage-figure");
    const figImg = document.getElementById("stage-img");
    const figCap = document.getElementById("stage-cap");
    const voidEl = document.getElementById("stage-void");
    let currentTab = "identity";

    function setStage(mode) {
      idle.hidden = mode !== "idle";
      figure.hidden = mode !== "img";
      voidEl.hidden = mode !== "void";
      figure.classList.remove("is-loaded");
    }

    function selectRow(tr, p, animate) {
      AM.qsa("tr", tbody).forEach((r) => r.classList.remove("is-selected"));
      tr.classList.add("is-selected");
      if (MISSING.has(p.file)) {
        setStage("void");
        if (AM.audio) AM.audio.error();
        return;
      }
      setStage("img");
      if (AM.audio) AM.audio.whoosh();
      figImg.onload = () => figure.classList.add("is-loaded");
      figImg.src = `assets/img/projects/${p.file}.webp`;
      figImg.alt = `${p.name} — ${p.scope}`;
      figCap.textContent = `${p.name} — ${p.scope} · ${p.tools} · ${p.year}`;
      if (animate && window.gsap && !AM.reduceMotion) {
        gsap.fromTo(figure, { filter: "invert(12%)", x: 6 }, { filter: "invert(0%)", x: 0, duration: 0.4, ease: "power2.out", clearProps: "filter,x" });
      }
    }

    function renderTab(tab, autoFirst) {
      currentTab = tab;
      tabs.forEach((t) => {
        const on = t.dataset.tab === tab;
        t.classList.toggle("is-active", on);
        t.setAttribute("aria-selected", String(on));
      });
      tbody.innerHTML = "";
      data.projects[tab].forEach((p) => {
        const tr = document.createElement("tr");
        if (MISSING.has(p.file)) tr.classList.add("row-missing");
        tr.innerHTML = `<td>${p.name}</td><td>${p.scope}</td><td>${p.tools}</td><td>${p.year}</td>`;
        tr.addEventListener("click", () => selectRow(tr, p, true));
        tbody.appendChild(tr);
      });
      if (autoFirst && tbody.firstElementChild) {
        tbody.firstElementChild.dispatchEvent(new Event("click"));
      } else {
        setStage("idle");
      }
    }

    tabs.forEach((t) => t.addEventListener("click", () => renderTab(t.dataset.tab, true)));
    renderTab(currentTab, false);
  });
})();

/* preloader.js — terminal boot sequence with glitch bursts */
(function () {
  "use strict";
  const AM = window.AM;

  const LINES = [
    "init marlowe_kernel ............ <span class='ok'>OK</span>",
    "mount /dev/creativity .......... <span class='ok'>OK</span>",
    "loading palette: cyan·amber .... <span class='ok'>OK</span>",
    "spawning cursor.sys ............ <span class='ok'>OK</span>",
    "compiling 105 assets from seed . <span class='ok'>OK</span>",
    "checking black hole integrity .. <span class='warn'>WARN</span>",
    "tuning scramble engine ......... <span class='ok'>OK</span>",
    "oslo ⟶ worldwide uplink ........ <span class='ok'>OK</span>"
  ];

  document.addEventListener("DOMContentLoaded", () => {
    const boot = document.getElementById("boot");
    if (!boot) return;
    const log = document.getElementById("boot-log");
    const fill = document.getElementById("boot-fill");
    const pct = document.getElementById("boot-pct");
    const status = document.getElementById("boot-status");
    const skip = document.getElementById("boot-skip");
    const fast = sessionStorage.getItem("am-booted") === "1";

    let progress = 0;
    let li = 0;
    let doneFired = false;
    const lineDelay = fast ? 40 : 170;
    const totalSteps = 100;

    function finish() {
      if (doneFired) return;
      doneFired = true;
      sessionStorage.setItem("am-booted", "1");
      status.textContent = "READY";
      status.style.color = "var(--cyan)";
      setTimeout(() => {
        boot.classList.add("is-done");
        document.body.classList.add("is-ready");
        document.dispatchEvent(new CustomEvent("am:ready"));
        if (AM.audio) AM.audio.whoosh();
        setTimeout(() => boot.remove(), 700);
      }, AM.reduceMotion ? 0 : 320);
    }

    skip.addEventListener("click", finish);

    const lineTimer = setInterval(() => {
      if (li < LINES.length) {
        const el = document.createElement("li");
        el.innerHTML = "&gt; " + LINES[li];
        log.appendChild(el);
        li++;
      }
    }, lineDelay);

    const step = fast ? 2 : 1;
    const pctTimer = setInterval(() => {
      progress += step + Math.floor(Math.random() * 2);
      if (progress >= totalSteps) {
        progress = totalSteps;
        clearInterval(pctTimer);
        clearInterval(lineTimer);
        while (li < LINES.length) {
          const el = document.createElement("li");
          el.innerHTML = "&gt; " + LINES[li];
          log.appendChild(el);
          li++;
        }
        finish();
      }
      pct.textContent = String(progress).padStart(3, "0") + "%";
      fill.style.width = progress + "%";
      if (Math.random() < 0.05 && AM.audio) AM.audio.glitchFx();
    }, fast ? 16 : 34);

    /* glitch burst on the frame itself */
    if (!AM.reduceMotion) {
      const gTimer = setInterval(() => {
        if (doneFired || !document.getElementById("boot")) { clearInterval(gTimer); return; }
        if (Math.random() < 0.35) {
          boot.style.transform = `translate(${(Math.random() - 0.5) * 6}px,${(Math.random() - 0.5) * 3}px) skewX(${(Math.random() - 0.5) * 2}deg)`;
          boot.style.filter = Math.random() < 0.4 ? "invert(4%)" : "";
          setTimeout(() => { boot.style.transform = ""; boot.style.filter = ""; }, 60 + Math.random() * 90);
        }
      }, 260);
    }
  });
})();

/* contact.js — human hold-gate, terminal form, confetti, DNA capsule SVG build */
(function () {
  "use strict";
  const AM = window.AM;

  document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("contact-form");
    if (!form) return;

    /* ---------- hold-to-verify human gate ---------- */
    const verify = document.getElementById("ct-verify");
    const vBtn = document.getElementById("verify-btn");
    const vLabel = document.getElementById("verify-label");
    const vState = document.getElementById("verify-state");
    let holding = false, p = 0, raf = null, verified = false;

    function tickHold() {
      if (!holding) return;
      p += 1 / 55; /* ~0.9s at 60fps */
      p = Math.min(1, p);
      vBtn.style.setProperty("--p", p);
      if (AM.audio && Math.random() < 0.3) AM.audio.key();
      if (p >= 1) {
        verified = true;
        holding = false;
        verify.classList.add("is-verified");
        vState.textContent = AM.i18n.t("ct.verified");
        vLabel.textContent = "✓";
        if (AM.audio) AM.audio.confirm();
        return;
      }
      raf = requestAnimationFrame(tickHold);
    }
    function release() {
      if (verified) return;
      holding = false;
      cancelAnimationFrame(raf);
      if (p > 0 && p < 1 && AM.audio) AM.audio.error();
      const decay = () => {
        if (holding || verified) return;
        p = Math.max(0, p - 0.06);
        vBtn.style.setProperty("--p", p);
        if (p > 0) requestAnimationFrame(decay);
      };
      decay();
    }
    vBtn.addEventListener("pointerdown", (e) => {
      if (verified) return;
      holding = true;
      cancelAnimationFrame(raf);
      tickHold();
    });
    ["pointerup", "pointerleave", "pointercancel"].forEach((ev) => vBtn.addEventListener(ev, release));

    /* ---------- form state machine (demo mode) ---------- */
    const status = document.getElementById("ct-status");
    const success = document.getElementById("ct-success");
    const again = document.getElementById("ct-again");

    /*
     * DEMO MODE — this form intentionally simulates a send.
     * To make it real, create a free form endpoint (Formspree / Web3Forms / your API)
     * and replace sendReal() with a fetch() POST to your endpoint. See README.
     */
    function sendReal() { return new Promise((res) => setTimeout(res, 1400)); }

    form.addEventListener("submit", (e) => {
      e.preventDefault();
      /* note: form.name is the form's own name property — read inputs by id */
      const name = document.getElementById("ct-name").value.trim();
      const email = document.getElementById("ct-email").value.trim();
      const msg = document.getElementById("ct-msg").value.trim();
      const okMail = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email);
      if (!name || !msg || !okMail) {
        status.textContent = "\\> ERROR // FIELDS MISSING";
        status.style.color = "var(--rust)";
        if (AM.audio) AM.audio.error();
        form.animate(
          [{ transform: "translateX(0)" }, { transform: "translateX(-7px)" }, { transform: "translateX(6px)" }, { transform: "translateX(-3px)" }, { transform: "translateX(0)" }],
          { duration: 320, iterations: 1 }
        );
        return;
      }
      if (!verified) {
        status.textContent = "\\> ERROR // VERIFY HUMAN FIRST";
        status.style.color = "var(--rust)";
        if (AM.audio) AM.audio.error();
        verify.animate(
          [
            { boxShadow: "0 0 0 0 rgba(155,34,38,0)" },
            { boxShadow: "0 0 0 4px rgba(155,34,38,.55)" },
            { boxShadow: "0 0 0 0 rgba(155,34,38,0)" }
          ],
          { duration: 700, iterations: 1 }
        );
        return;
      }
      status.textContent = "\\> TRANSMITTING";
      status.style.color = "";
      status.classList.add("is-busy");
      const dotTimer = setInterval(() => { status.textContent = status.textContent.length < 18 ? status.textContent + "." : "\\> TRANSMITTING"; }, 220);
      sendReal().then(() => {
        clearInterval(dotTimer);
        status.classList.remove("is-busy");
        status.textContent = "\\> READY";
        success.hidden = false;
        confettiBurst();
        if (AM.audio) AM.audio.confirm();
      });
    });

    again.addEventListener("click", () => {
      success.hidden = true;
      form.reset();
      verified = false; p = 0;
      verify.classList.remove("is-verified");
      vBtn.style.setProperty("--p", 0);
      vLabel.textContent = AM.i18n.t("ct.hold");
      vState.textContent = AM.i18n.t("ct.unverified");
      status.textContent = "\\> READY";
      if (AM.audio) AM.audio.blip();
    });

    /* ---------- confetti (canvas, hand-rolled) ---------- */
    function confettiBurst() {
      if (AM.reduceMotion) return;
      let canvas = document.getElementById("confetti-canvas");
      if (!canvas) {
        canvas = document.createElement("canvas");
        canvas.id = "confetti-canvas";
        document.body.appendChild(canvas);
      }
      const ctx = canvas.getContext("2d");
      canvas.width = innerWidth;
      canvas.height = innerHeight;
      const colors = ["#00e5ff", "#ee9b00", "#94d2bd", "#e9d8a6", "#ca6702", "#ffffff"];
      const parts = [];
      const cx = innerWidth / 2, cy = innerHeight * 0.62;
      for (let i = 0; i < 150; i++) {
        const a = Math.random() * Math.PI * 2;
        const v = 4 + Math.random() * 10;
        parts.push({
          x: cx, y: cy,
          vx: Math.cos(a) * v * (0.4 + Math.random()),
          vy: Math.sin(a) * v - 6,
          s: 3 + Math.random() * 5,
          r: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.3,
          c: colors[i % colors.length],
          life: 1
        });
      }
      let frame;
      (function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        let alive = false;
        parts.forEach((pt) => {
          pt.vy += 0.32;
          pt.vx *= 0.985;
          pt.x += pt.vx; pt.y += pt.vy;
          pt.r += pt.vr;
          pt.life -= 0.008;
          if (pt.life > 0 && pt.y < innerHeight + 30) {
            alive = true;
            ctx.save();
            ctx.globalAlpha = Math.max(0, pt.life);
            ctx.translate(pt.x, pt.y);
            ctx.rotate(pt.r);
            ctx.fillStyle = pt.c;
            ctx.fillRect(-pt.s / 2, -pt.s / 2, pt.s, pt.s * 0.62);
            ctx.restore();
          }
        });
        if (alive) frame = requestAnimationFrame(draw);
        else ctx.clearRect(0, 0, canvas.width, canvas.height);
      })();
    }

    /* ---------- DNA capsule: build rungs + wave strands ---------- */
    const svg = document.getElementById("dna-svg");
    if (svg) {
      const NS = "http://www.w3.org/2000/svg";
      const rungs = document.getElementById("dna-rungs");
      const Y0 = 40, Y1 = 300, STEPS = 16;
      const wave = (phase) => {
        let d = "";
        for (let y = Y0; y <= Y1; y += 10) {
          const x = 80 + Math.sin((y / 260) * Math.PI * 4 + phase) * 44;
          d += (y === Y0 ? "M" : " L") + x.toFixed(1) + "," + y + " ";
        }
        return d;
      };
      document.getElementById("dna-wave-1").setAttribute("d", wave(0));
      document.getElementById("dna-wave-2").setAttribute("d", wave(Math.PI));
      for (let i = 0; i <= STEPS; i++) {
        const y = Y0 + (i * (Y1 - Y0)) / STEPS;
        const w = Math.abs(Math.cos((y / 260) * Math.PI * 4)) * 44;
        const l = document.createElementNS(NS, "line");
        l.setAttribute("x1", 80 - w);
        l.setAttribute("x2", 80 + w);
        l.setAttribute("y1", y);
        l.setAttribute("y2", y);
        l.setAttribute("class", `dna-rung c${(i % 4) + 1}`);
        l.style.animationDelay = (i * 0.14) + "s";
        rungs.appendChild(l);
      }
    }
    /* typing sounds in the form */
    form.addEventListener("keydown", (e) => {
      if (e.target.matches("input,textarea") && AM.audio) AM.audio.key();
    });
  });
})();

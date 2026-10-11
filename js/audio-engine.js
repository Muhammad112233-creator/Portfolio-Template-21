/* audio-engine.js — tiny WebAudio synth for UI feedback (no audio files) */
(function () {
  "use strict";
  const AM = window.AM;
  let ctx = null;
  let enabled = localStorage.getItem("am-sound") === "on";

  function ac() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function tone(freq, dur, type, gain, when, slide) {
    if (!enabled) return;
    const c = ac();
    if (!c) return;
    const t0 = c.currentTime + (when || 0);
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = type || "square";
    o.frequency.setValueAtTime(freq, t0);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t0 + dur);
    g.gain.setValueAtTime(gain || 0.04, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(c.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.02);
  }

  function noise(dur, gain) {
    if (!enabled) return;
    const c = ac();
    if (!c) return;
    const len = c.sampleRate * dur;
    const buf = c.createBuffer(1, len, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = c.createBufferSource();
    src.buffer = buf;
    const g = c.createGain();
    g.gain.value = gain || 0.05;
    src.connect(g).connect(c.destination);
    src.start();
  }

  AM.audio = {
    get enabled() { return enabled; },
    tick() { tone(1900, 0.03, "square", 0.018); },
    key() { tone(840 + Math.random() * 120, 0.02, "square", 0.012); },
    blip() { tone(420, 0.09, "square", 0.035, 0, 880); },
    confirm() { tone(520, 0.08, "square", 0.04); tone(780, 0.1, "square", 0.04, 0.09); tone(1040, 0.14, "square", 0.035, 0.19); },
    error() { tone(196, 0.16, "sawtooth", 0.05, 0, 130); },
    glitchFx() { noise(0.06, 0.03); },
    whoosh() { tone(300, 0.32, "sine", 0.03, 0, 1200); noise(0.25, 0.02); },
    set(on) {
      enabled = on;
      localStorage.setItem("am-sound", on ? "on" : "off");
      document.body.dataset.sound = on ? "on" : "off";
      const st = document.getElementById("sound-state");
      if (st) st.textContent = on ? "ON" : "OFF";
      const btn = document.getElementById("sound-toggle");
      if (btn) btn.setAttribute("aria-pressed", String(on));
      if (on) tone(660, 0.08, "square", 0.04, 0, 990);
    }
  };

  document.addEventListener("DOMContentLoaded", () => {
    AM.audio.set(enabled);
    const btn = document.getElementById("sound-toggle");
    if (btn) btn.addEventListener("click", () => AM.audio.set(!enabled));
    if ("ontouchstart" in window) return;
    document.addEventListener("pointerover", (e) => {
      if (e.target.closest(".btn-key,.btn-mini,a,.work-tab,.cat-item,.pol-arrow,.illo-thumb,.work-table tbody tr,label")) AM.audio.tick();
    });
    document.addEventListener("click", (e) => {
      if (e.target.closest(".btn-key,.work-tab,.pol-arrow,.cat-head")) AM.audio.blip();
    });
  });
})();

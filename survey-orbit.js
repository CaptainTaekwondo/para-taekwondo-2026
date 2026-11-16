/* لوجو كابتن تايكوندو حول لوجو البطولة (كالقمر حول الكوكب).
   - الوضع العادي: يدور بهدوء في مسار دائري، وخلفه ذيل شهاب ذهبي مائل للأزرق، بلا خطوط مدار.
   - حلقة لوجو البطولة السميكة يتحكم بها لوجو كابتن: الجزء الذي يكون عنده يتحول إلى ذهبي، وباقي الحلقة أزرق.
   - عند النقر على لوجو البطولة: ثلاث لفات سريعة وسلسة على مدار مائل بعمق (أمام اللوجو ثم خلفه) والتموّج والذيل أقوى،
     ثم يهدأ ويعود إلى الدوران الهادئ.
   - يمرّ لوجو كابتن تحت الكلام (النص فوقه) عندما ينزل لأسفل.
   - مع «تقليل الحركة» يثبت في مكانه ولا تعمل المؤثرات. */
(() => {
  "use strict";
  const stage = document.getElementById("stage");
  if (!stage) return;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const TAU = Math.PI * 2;
  const BASE_W = .39;                         // الدوران الهادئ (≈16 ثانية للفة)
  const PEAK_W = 6.2;                         // ذروة سرعة اللفات الثلاث (راد/ث)
  const LAPS = 3;
  const PHI0 = -24 * Math.PI / 180, PHI1 = 16 * Math.PI / 180;
  const weak = (navigator.hardwareConcurrency || 4) <= 2 || ((navigator.connection || {}).saveData);
  const SEG = weak ? 72 : 120;                // دقة حلقة التموّج
  const inst = new Set();

  const sstep = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const env = u => sstep(0, .16, u) * (1 - sstep(.72, 1, u));
  const mix = (a, b, t) => a + (b - a) * t;
  const BLUE = [47, 107, 255], SKY = [150, 190, 255], GOLD = [255, 214, 100], PALE = [255, 244, 200];

  function attach(el) {
    if (el.dataset.orb) return; el.dataset.orb = "1"; el.classList.add("orb");
    const planet = el.querySelector(".planet"), moon = el.querySelector(".moon");
    if (!planet || !moon) return;
    const mkc = cls => { const c = document.createElement("canvas"); c.className = cls; c.setAttribute("aria-hidden", "true"); return c; };
    const cv = mkc("otail"), rc = mkc("oring");
    el.insertBefore(rc, planet); el.insertBefore(cv, moon);
    const S = { el, planet, moon, cv, rc, g: cv.getContext("2d"), rg: rc.getContext("2d"), th: -0.9, act: null, k: 0, w: 0, a: 0, m: 44, hist: [], parts: [], spd: 0, t: 0, fr: 0, ang: 0 };
    S.layout = () => {
      const R = el.clientWidth; if (!R || R === S.w) return; S.w = R;
      const room = (el.parentElement ? el.parentElement.clientWidth : 320) / 2 - 34;
      S.a = Math.max(R * .5 + 14, Math.min(R * .5 + 44, room));
      S.m = moon.offsetWidth || 44;
      S.dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = Math.ceil(S.a * 2 + S.m * 2 + 10); S.W = W;
      cv.width = W * S.dpr; cv.height = W * S.dpr; cv.style.width = W + "px"; cv.style.height = W + "px"; cv.style.marginLeft = -W / 2 + "px"; cv.style.marginTop = -W / 2 + "px";
      S.g.setTransform(S.dpr, 0, 0, S.dpr, W / 2 * S.dpr, W / 2 * S.dpr); S.hist = [];
      const D = Math.ceil(R + 70); S.D = D;
      rc.width = D * S.dpr; rc.height = D * S.dpr; rc.style.width = D + "px"; rc.style.height = D + "px"; rc.style.marginLeft = -D / 2 + "px"; rc.style.marginTop = -D / 2 + "px";
      S.rg.setTransform(S.dpr, 0, 0, S.dpr, D / 2 * S.dpr, D / 2 * S.dpr);
    };
    const go = () => {
      planet.classList.remove("pulse"); void planet.offsetWidth; planet.classList.add("pulse");
      if (S.act) return;
      S.act = { prog: 0, total: LAPS * TAU };
      const w = document.createElement("span"); w.className = "wave"; planet.parentNode.append(w); setTimeout(() => w.remove(), 1000);
    };
    if (!reduce) {
      planet.addEventListener("click", go);
      planet.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); go(); } });
    }
    S.layout(); place(S, 0); ring(S);
    inst.add(S);
    if (!reduce) start();
  }

  function place(S, u) {
    const k = S.k, A = S.a;
    const sw = .5 - .5 * Math.cos(TAU * 1.5 * u);
    const phi = k * (PHI0 + (PHI1 - PHI0) * sw);
    const B = A * (1 - (1 - (.30 - .08 * sw)) * k);
    const c = Math.cos(S.th), s = Math.sin(S.th);
    const x = A * c * Math.cos(phi) - B * s * Math.sin(phi), y = A * c * Math.sin(phi) + B * s * Math.cos(phi);
    const z = s * k;
    S.x = x; S.y = y; S.z = z; S.ang = Math.atan2(y, x);
    S.moon.style.transform = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0) scale(${(1 + .34 * z).toFixed(3)})`;
    S.moon.style.zIndex = z >= -0.02 ? 3 : 0;
    S.moon.style.opacity = (1 - .22 * Math.max(0, -z)).toFixed(2);
    S.moon.style.setProperty("--fx", k.toFixed(2));
    S.cv.style.zIndex = z >= -0.02 ? 2 : 0;
    S.el.classList.toggle("hot", k > .04);
  }

  /* حلقة لوجو البطولة السميكة: ذهبية عند لوجو كابتن (تتحرك معه) وزرقاء في باقي الأماكن، بتدرّج ناعم بلا تموّج */
  function ring(S) {
    const g = S.rg, D = S.D; if (!D) return;
    g.clearRect(-D / 2, -D / 2, D, D);
    const Rp = S.w / 2, r0 = Rp + 6, k = S.k;
    const sigma = mix(1.1, 1.35, k);
    g.lineCap = "round";
    const gl = phi => { const d = Math.abs(((phi - S.ang + Math.PI) % TAU + TAU) % TAU - Math.PI); return Math.exp(-(d * d) / (2 * sigma * sigma * .35)); };
    let prev = null;
    for (let i = 0; i <= SEG; i++) {
      const phi = i / SEG * TAU, gg = gl(phi), p = [Math.cos(phi) * r0, Math.sin(phi) * r0];
      if (prev) {
        const c = [0, 1, 2].map(j => Math.round(mix(mix(BLUE[j], SKY[j], .12), mix(GOLD[j], PALE[j], .12), Math.min(1, gg * 1.25))));
        g.strokeStyle = `rgb(${c[0]},${c[1]},${c[2]})`;
        g.lineWidth = 7 + 2 * gg;
        g.beginPath(); g.moveTo(prev[0], prev[1]); g.lineTo(p[0], p[1]); g.stroke();
      }
      prev = p;
    }
  }

  /* ذيل شهاب: رأس أبيض ذهبي وذيل يتلاشى نحو الأزرق، وشرارات صغيرة */
  function tail(S, dt) {
    const g = S.g, W = S.W; if (!W) return;
    g.globalCompositeOperation = "source-over";
    g.clearRect(-W / 2, -W / 2, W, W);
    const H = S.hist; H.push([S.x, S.y]); if (H.length > 90) H.shift();
    const L = 85 + 150 * S.k + 14 * Math.min(1, S.spd / 2);          // طول الذيل بالبكسل
    let acc = 0, from = H.length - 1;
    for (let i = H.length - 1; i > 0; i--) { acc += Math.hypot(H[i][0] - H[i - 1][0], H[i][1] - H[i - 1][1]); if (acc > L) { from = i; break; } from = 0; }
    const pts = H.slice(from), n = pts.length;
    g.globalCompositeOperation = "lighter"; g.lineCap = "round";
    if (n > 2) {
      const A = .8 + .2 * S.k;
      for (let i = 1; i < n; i++) {
        const f = i / n;                                                // 0 = طرف الذيل، 1 = الرأس
        const col = f > .55 ? [mix(GOLD[0], PALE[0], (f - .55) / .45), mix(GOLD[1], PALE[1], (f - .55) / .45), mix(GOLD[2], PALE[2], (f - .55) / .45)]
                            : [mix(BLUE[0], GOLD[0], f / .55), mix(BLUE[1], GOLD[1], f / .55), mix(BLUE[2], GOLD[2], f / .55)];
        g.strokeStyle = `rgba(${col[0] | 0},${col[1] | 0},${col[2] | 0},${(A * Math.pow(f, 1.25)).toFixed(3)})`;
        g.lineWidth = Math.max(.5, S.m * .15 * Math.pow(f, 1.1));
        g.beginPath(); g.moveTo(pts[i - 1][0], pts[i - 1][1]); g.lineTo(pts[i][0], pts[i][1]); g.stroke();
      }
    }
    /* شرارات */
    if (!weak && Math.random() < .5 + .4 * S.k) S.parts.push({ x: S.x, y: S.y, vx: (Math.random() - .5) * 26, vy: (Math.random() - .5) * 26, life: .55 + Math.random() * .4, max: 1, r: .6 + Math.random() * 1.0 });
    S.parts = S.parts.filter(p => (p.life -= dt) > 0);
    for (const p of S.parts) {
      p.x += p.vx * dt; p.y += p.vy * dt;
      g.fillStyle = `rgba(255,${(214 + Math.random() * 30) | 0},120,${Math.min(1, p.life * 1.6).toFixed(2)})`;
      g.beginPath(); g.arc(p.x, p.y, p.r, 0, TAU); g.fill();
    }
    g.globalCompositeOperation = "source-over";
  }

  let raf = 0, last = 0;
  function loop(t) {
    raf = requestAnimationFrame(loop);
    if (document.hidden) { last = t; return; }
    const dt = Math.min((t - last) / 1000 || 0, .06); last = t;
    for (const S of inst) {
      if (!S.el.isConnected) { inst.delete(S); continue; }
      S.layout();
      let w = BASE_W, u = 0;
      if (S.act) {
        u = Math.min(1, S.act.prog / S.act.total);
        w = BASE_W + (PEAK_W - BASE_W) * Math.pow(Math.sin(Math.PI * u), .85);
        S.k = env(u);
      }
      const d = w * dt;
      S.th += d; S.spd = w; S.t += dt * (1 + 1.5 * S.k);
      if (S.act) { S.act.prog += d; if (S.act.prog >= S.act.total) { S.act = null; S.k = 0; } }
      place(S, u);
      tail(S, dt);
      if ((S.fr++ & 1) === 0 || !weak) ring(S);
    }
    if (!inst.size) { cancelAnimationFrame(raf); raf = 0; }
  }
  function start() { if (!raf) { last = performance.now(); raf = requestAnimationFrame(loop); } }

  const scan = () => stage.querySelectorAll(".logo3d").forEach(attach);
  new MutationObserver(scan).observe(stage, { childList: true });
  scan();
})();

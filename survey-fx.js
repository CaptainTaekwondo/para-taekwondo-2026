/* مؤثرات الاستبيان: خلفية ذهبية متحركة + ميل ثلاثي الأبعاد للبطاقات + احتفال عند الإرسال.
   تتعطّل تلقائيًا مع «تقليل الحركة» أو الأجهزة الضعيفة/توفير البيانات. */
(() => {
  "use strict";
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const nc = navigator.connection || {};
  const weak = nc.saveData || /(^|-)(2|3)g/.test(nc.effectiveType || "") || (navigator.hardwareConcurrency || 4) <= 2 || (navigator.deviceMemory || 4) <= 2;
  if (reduce || weak) { document.documentElement.classList.add("nofx"); return; }   // لا مؤثرات ثقيلة مع الحركة المقلّلة أو النت البطيء/الأجهزة الضعيفة

  /* ---- ميل البطاقة (الماوس فقط) ---- */
  if (matchMedia("(hover:hover) and (pointer:fine)").matches) {
    const stage = document.getElementById("stage");
    let raf = 0, cur = null;
    const reset = () => { if (cur) { cur.style.setProperty("--rx", "0deg"); cur.style.setProperty("--ry", "0deg"); cur.classList.remove("tilting"); } cur = null; };
    stage.addEventListener("pointermove", e => {
      const c = e.target.closest && e.target.closest(".card");
      if (!c) return reset();
      cur = c;
      /* فوق الأزرار والحقول والاختيارات تثبت البطاقة كي لا يتحرك الهدف تحت المؤشر فيضيع النقر */
      if (e.target.closest("button,a,input,select,textarea,label")) { c.style.setProperty("--rx", "0deg"); c.style.setProperty("--ry", "0deg"); c.classList.remove("tilting"); c.classList.add("calm"); if (raf) { cancelAnimationFrame(raf); raf = 0; } return; }
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        const big = r.height > 560 ? .55 : 1;                    // البطاقات الطويلة تميل أقل
        c.style.setProperty("--rx", ((.5 - y) * 6 * big).toFixed(2) + "deg");
        c.style.setProperty("--ry", ((x - .5) * 8 * big).toFixed(2) + "deg");
        c.style.setProperty("--mx", (x * 100).toFixed(1) + "%");
        c.style.setProperty("--my", (y * 100).toFixed(1) + "%");
        c.classList.add("tilting"); c.classList.remove("calm");
      });
    });
    stage.addEventListener("pointerleave", reset);
  }

  /* ---- لوحة الرسم: جسيمات ذهبية + احتفال ---- */
  const cv = document.createElement("canvas");
  cv.id = "fx"; cv.setAttribute("aria-hidden", "true");
  document.body.prepend(cv);
  const g = cv.getContext("2d");
  let W = 0, H = 0, dpr = 1;
  const size = () => { dpr = Math.min(devicePixelRatio || 1, 1.5); W = innerWidth; H = innerHeight; cv.width = W * dpr; cv.height = H * dpr; g.setTransform(dpr, 0, 0, dpr, 0, 0); };
  size(); addEventListener("resize", size);

  const rnd = (a, b) => a + Math.random() * (b - a);
  const N = weak ? 0 : Math.min(48, Math.round((innerWidth * innerHeight) / 26000));
  const dust = Array.from({ length: N }, () => ({ x: rnd(0, W), y: rnd(0, H), r: rnd(.6, 2.6), vy: rnd(.08, .35), vx: rnd(-.08, .08), ph: rnd(0, 6.28), big: Math.random() < .12 }));
  let conf = [];
  const COL = ["#fff4bd", "#f4cb55", "#c58a18", "#2f6bff", "#9cc0ff", "#ffffff", "#d9202f"];

  let last = 0;
  function frame(t) {
    requestAnimationFrame(frame);
    if (document.hidden || t - last < 30) return;           // ≈30fps كافية وأخف
    const dt = Math.min((t - last) / 16.7, 3); last = t;
    g.clearRect(0, 0, W, H);
    for (const p of dust) {
      p.y -= p.vy * dt; p.x += p.vx * dt + Math.sin(t / 2400 + p.ph) * .12; p.ph += .01;
      if (p.y < -10) { p.y = H + 10; p.x = rnd(0, W); }
      const a = .25 + .45 * (.5 + .5 * Math.sin(t / 900 + p.ph));
      if (p.big) { const gr = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 9); gr.addColorStop(0, `rgba(244,203,85,${a * .5})`); gr.addColorStop(1, "rgba(244,203,85,0)"); g.fillStyle = gr; g.beginPath(); g.arc(p.x, p.y, p.r * 9, 0, 6.283); g.fill(); }
      else { g.fillStyle = `rgba(255,236,160,${a})`; g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.283); g.fill(); }
    }
    conf = conf.filter(c => c.y < H + 30 && c.life > 0);
    for (const c of conf) {
      c.vy += .16 * dt; c.vx *= .992; c.x += c.vx * dt; c.y += c.vy * dt; c.rot += c.vr * dt; c.life -= dt;
      g.save(); g.translate(c.x, c.y); g.rotate(c.rot); g.scale(1, Math.cos(c.rot * 1.7));
      g.globalAlpha = Math.min(1, c.life / 40); g.fillStyle = c.col; g.fillRect(-c.w / 2, -c.h / 2, c.w, c.h); g.restore();
    }
  }
  requestAnimationFrame(frame);

  window.SurveyFX = {
    burst() {
      const n = weak ? 60 : 150;
      for (let i = 0; i < n; i++) {
        const side = i % 2 ? 1 : -1;
        const sp = rnd(7, 17);
        conf.push({ x: W / 2 + side * rnd(0, W * .12), y: H * .3, vx: Math.cos(side > 0 ? rnd(-1.3, -.6) : rnd(-2.55, -1.85)) * sp, vy: Math.sin(rnd(-1.3, -.5)) * sp,
          w: rnd(6, 12), h: rnd(8, 16), rot: rnd(0, 6.28), vr: rnd(-.25, .25), col: COL[(Math.random() * COL.length) | 0], life: rnd(90, 170) });
      }
    }
  };
})();

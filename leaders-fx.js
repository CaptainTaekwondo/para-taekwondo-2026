/* مؤثرات صفحات القيادات: عملة 3D تُقذف عند الضغط، جسيمات ذهبية، ميل البطاقات، دخول 3D عند التمرير.
   تتعطّل مع «تقليل الحركة» (تبقى العملة تنقلب بدون دوران)، ومع النت الضعيف/الأجهزة الضعيفة تتعطل الجسيمات فقط. */
(() => {
  "use strict";
  const html = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const nc = navigator.connection || {};
  const weak = nc.saveData || /(^|-)2g/.test(nc.effectiveType || "") || (navigator.hardwareConcurrency || 4) <= 2 || (navigator.deviceMemory || 4) <= 2;
  const rnd = (a, b) => a + Math.random() * (b - a);
  const LF = window.LeadersFX = { burst() {} };

  /* ================= العملة ================= */
  /* الدوران حول المحور الرأسي يُحسب بالـ JS: الوجه يُضغط أفقيًا بمقدار cos(θ) والسمك شرائح ذهبية مزاحة بمقدار sin(θ).
     ثابت على كل المتصفحات ولا يعتمد على ترتيب طبقات 3D. */
  const THICK = { lg: 0, sm: 0 };                               // سُمك العملة (نسبة من العرض): 0 = قرص مسطّح. جرّب .1 للسمك الخفيف أو .18 للسميك
  LF.coin = function (small) {
    const en = html.lang === "en";
    const wrap = document.createElement("div");
    wrap.className = "coin" + (small ? " sm" : "");
    wrap.setAttribute("role", "button"); wrap.tabIndex = 0;
    wrap.setAttribute("aria-label", en ? "Championship logo. Press to flip the coin" : "شعار البطولة. اضغط لقذف العملة وتدويرها");
    const shadow = document.createElement("span"); shadow.className = "cshadow";
    const inn = document.createElement("div"); inn.className = "coin-in";
    const pt = document.createElement("div"); pt.className = "coin-pt";
    const SL = 24, slabs = [];
    for (let i = 0; i < ((small ? THICK.sm : THICK.lg) > 0 ? SL : 0); i++) { const e = document.createElement("span"); e.className = "slab"; e.style.filter = "brightness(" + (0.62 + 0.38 * i / (SL - 1)).toFixed(2) + ")"; pt.appendChild(e); slabs.push(e); }
    const mk = (src, cls) => { const im = new Image(); if (cls === "front") im.setAttribute("fetchpriority", "high"); im.src = src; im.alt = ""; im.className = "face " + cls; im.width = 420; im.height = 420; im.decoding = "async"; im.draggable = false; return im; };
    const front = mk("assets/champion.webp", "front"), back = mk("assets/captain.webp", "back"), sh = document.createElement("span"); sh.className = "shine";
    pt.append(front, back, sh); inn.appendChild(pt); wrap.append(shadow, inn);

    let th = 0, mode = "idle", backFace = false, hold = 0, resumeAt = 0, last = 0, visible = true, raf = 0;
    const OM = 40;                                              // سرعة الدوران الهادئ (درجة/ثانية)
    function draw() {
      const r = th * Math.PI / 180, c = Math.cos(r), s = Math.sin(r), T = wrap.offsetWidth * (small ? THICK.sm : THICK.lg);   // سُمك العملة بالبكسل
      const w = Math.abs(c);
      if (T > 0) slabs.forEach((e, i) => { const z = (i / (SL - 1) - .5) * T; e.style.transform = "translateX(" + (z * s).toFixed(2) + "px) scaleX(" + Math.max(w, .004).toFixed(4) + ")"; });
      const fr = c >= 0, off = (fr ? .5 : -.5) * T * s, tf = "translateX(" + off.toFixed(2) + "px) scaleX(" + Math.max(w, .004).toFixed(4) + ")";
      front.style.visibility = fr ? "visible" : "hidden"; back.style.visibility = fr ? "hidden" : "visible";
      (fr ? front : back).style.transform = tf; sh.style.transform = tf;
      /* إضاءة: الوجه يُظلَّل قليلًا كلما اقترب من الجانب */
      const sh2 = (0.72 + 0.28 * w).toFixed(3); front.style.filter = back.style.filter = "brightness(" + sh2 + ")";
    }
    function loop(t) {
      raf = visible && !document.hidden && !reduce ? requestAnimationFrame(loop) : 0;
      const dt = Math.min((t - (last || t)) / 1000, .1); last = t;
      if (mode === "idle") { const k = Math.min(1, Math.max(0, (t - resumeAt) / 1400)); th = (th + OM * k * dt) % 360; draw(); }
    }
    const kick = () => { if (!raf && !reduce) { last = 0; raf = requestAnimationFrame(loop); } };
    new IntersectionObserver(es => { visible = es[0].isIntersecting; if (visible) kick(); }).observe(wrap);
    document.addEventListener("visibilitychange", kick);
    draw(); kick();

    function toss() {
      if (mode === "toss") return;
      clearTimeout(hold);
      if (reduce) { backFace = !backFace; th = backFace ? 180 : 0; draw(); return; }
      mode = "toss"; wrap.classList.add("tossing");
      const from = th, face = backFace ? 0 : 180;                              // كل نقرة تُظهر الشعار الآخر
      const to = Math.ceil((from + 360 * 7 - face) / 360) * 360 + face;
      const D = 2600, rect = wrap.getBoundingClientRect(), H = Math.round(Math.min(96, rect.width * .26));
      LF.burst(rect.left + rect.width / 2, rect.top + rect.height / 2, 26);
      inn.style.animation = "none";
      const jump = inn.animate([
        { translate: "0 0", scale: "1", offset: 0, easing: "cubic-bezier(.2,.8,.3,1)" },
        { translate: "0 " + -H + "px", scale: "1.18", offset: .36, easing: "cubic-bezier(.6,0,.9,.4)" },
        { translate: "0 0", scale: "1", offset: .66, easing: "ease-out" },
        { translate: "0 " + -H * .1 + "px", offset: .76, easing: "ease-in" },
        { translate: "0 0", offset: .84, easing: "ease-out" },
        { translate: "0 " + -H * .03 + "px", offset: .91, easing: "ease-in" },
        { translate: "0 0", scale: "1", offset: 1 }], { duration: D });
      inn.animate([{ rotate: "0deg" }, { rotate: "-5deg", offset: .2 }, { rotate: "4deg", offset: .45 }, { rotate: "-2deg", offset: .7 }, { rotate: "0deg" }], { duration: D, easing: "ease-in-out" });
      shadow.animate([{ transform: "scale(1)", opacity: .9 }, { transform: "scale(.45)", opacity: .35, offset: .36 }, { transform: "scale(1)", opacity: .9, offset: .66 }, { transform: "scale(.9)", offset: .76 }, { transform: "scale(1)", opacity: .9 }], { duration: D });
      const t0 = performance.now();
      (function step(now) {
        const u = Math.min(1, (now - t0) / D), e = 1 - Math.pow(1 - u, 3.6);   // يبدأ سريعًا ثم يهدأ
        th = from + (to - from) * e; draw();
        if (u < 1) return requestAnimationFrame(step);
        th = face; backFace = face === 180; draw();
        const r = wrap.getBoundingClientRect(); LF.burst(r.left + r.width / 2, r.top + r.height / 2, 44);
        mode = "hold";
        hold = setTimeout(() => { inn.style.animation = ""; wrap.classList.remove("tossing"); resumeAt = performance.now(); mode = "idle"; kick(); }, 2800);   // ثم يعود لدورانه الهادئ
      })(t0);
    }
    wrap.addEventListener("click", toss);
    wrap.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toss(); } });
    wrap.addEventListener("pointerdown", () => wrap.classList.add("press"));
    ["pointerup", "pointerleave", "pointercancel"].forEach(ev => wrap.addEventListener(ev, () => wrap.classList.remove("press")));
    return wrap;
  };
  const mount = () => document.querySelectorAll("[data-coin]").forEach(h => { if (!h.firstChild) h.appendChild(LF.coin(h.dataset.coin === "sm")); });
  mount();
  if (reduce) { html.classList.add("nofx"); return; }
  if (weak) html.classList.add("weakfx");
  html.classList.add("fx");

  /* ---- ميل ثلاثي الأبعاد للبطاقات (الماوس فقط) ---- */
  const SEL = ".lcard,.feat li,.pillars li,.stat-grid li,.lr .card,.reach .btn";
  if (matchMedia("(hover:hover) and (pointer:fine)").matches) {
    let cur = null, raf = 0;
    const reset = el => { if (!el) return; el.style.transform = ""; el.classList.remove("tilting"); };
    document.addEventListener("pointermove", e => {
      const c = e.target.closest && e.target.closest(SEL);
      if (cur && cur !== c) { reset(cur); cur = null; }
      if (!c) return;
      cur = c; c.classList.add("tilt");
      if (e.target.closest("input,select,textarea,label,button")) { reset(c); return; }
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
        const big = r.height > 900 ? .05 : r.height > 520 ? .35 : 1;      // البطاقات الطويلة (نموذج التسجيل) شبه ثابتة كي لا تعطّل الكتابة
        c.style.transform = "perspective(900px) rotateX(" + ((.5 - y) * 12 * big).toFixed(2) + "deg) rotateY(" + ((x - .5) * 14 * big).toFixed(2) + "deg) translateZ(" + (big < 1 ? 0 : 10) + "px)";
        c.style.setProperty("--mx", (x * 100).toFixed(1) + "%"); c.style.setProperty("--my", (y * 100).toFixed(1) + "%");
        c.classList.add("tilting");
      });
    }, { passive: true });
    document.addEventListener("pointerleave", () => { reset(cur); cur = null; });
  }

  /* ---- حافة ذهبية دوّارة ---- */
  const rim = () => document.querySelectorAll(".lcard,.stat-grid li,.lr .card").forEach(el => el.classList.add("rim"));
  rim(); new MutationObserver(rim).observe(document.body, { childList: true, subtree: true });

  /* ---- تأخير تدريجي للظهور ---- */
  const stagger = () => document.querySelectorAll(".rv:not([data-st])").forEach(el => {
    const sib = el.parentElement ? Array.prototype.indexOf.call(el.parentElement.children, el) : 0;
    el.style.transitionDelay = Math.min(sib, 8) * 70 + "ms"; el.dataset.st = "1";
    setTimeout(() => { el.style.transitionDelay = ""; }, 1600);
  });
  stagger(); new MutationObserver(stagger).observe(document.body, { childList: true, subtree: true });

  /* ---- بارالاكس خفيف للهيرو ---- */
  const art = document.querySelector(".lh-art");
  if (art) addEventListener("scroll", () => { const y = Math.min(scrollY, 600); art.style.transform = "translateY(" + (y * .12).toFixed(1) + "px)"; }, { passive: true });

  /* ---- لوحة الجسيمات + شرر العملة ---- */
  const cv = document.createElement("canvas"); cv.id = "fx"; cv.setAttribute("aria-hidden", "true"); document.body.prepend(cv);
  const g = cv.getContext("2d"); let W = 0, H = 0;
  const size = () => { const d = Math.min(devicePixelRatio || 1, 1.5); W = innerWidth; H = innerHeight; cv.width = W * d; cv.height = H * d; g.setTransform(d, 0, 0, d, 0, 0); };
  size(); addEventListener("resize", size);
  const N = weak ? 0 : Math.min(46, Math.round((innerWidth * innerHeight) / 26000));
  const dust = Array.from({ length: N }, () => ({ x: rnd(0, W), y: rnd(0, H), r: rnd(.6, 2.6), vy: rnd(.08, .35), vx: rnd(-.08, .08), ph: rnd(0, 6.28), big: Math.random() < .12 }));
  let sparks = [], last = 0;
  LF.burst = (x, y, n) => { n = weak ? Math.round(n / 3) : n; for (let i = 0; i < n; i++) { const a = rnd(0, 6.283), s = rnd(2, 9); sparks.push({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1.5, r: rnd(1, 3), life: rnd(28, 60) }); } };
  (function frame(t) {
    requestAnimationFrame(frame);
    if (document.hidden || t - last < 30) return;
    const dt = Math.min((t - last) / 16.7, 3); last = t;
    g.clearRect(0, 0, W, H);
    for (const p of dust) {
      p.y -= p.vy * dt; p.x += p.vx * dt + Math.sin(t / 2400 + p.ph) * .12; p.ph += .01;
      if (p.y < -10) { p.y = H + 10; p.x = rnd(0, W); }
      const a = .25 + .45 * (.5 + .5 * Math.sin(t / 900 + p.ph));
      if (p.big) { const gr = g.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 9); gr.addColorStop(0, "rgba(244,203,85," + (a * .5) + ")"); gr.addColorStop(1, "rgba(244,203,85,0)"); g.fillStyle = gr; g.beginPath(); g.arc(p.x, p.y, p.r * 9, 0, 6.283); g.fill(); }
      else { g.fillStyle = "rgba(255,236,160," + a + ")"; g.beginPath(); g.arc(p.x, p.y, p.r, 0, 6.283); g.fill(); }
    }
    sparks = sparks.filter(s => s.life > 0);
    for (const s of sparks) {
      s.vy += .18 * dt; s.vx *= .985; s.x += s.vx * dt; s.y += s.vy * dt; s.life -= dt;
      g.fillStyle = "rgba(255,226,130," + Math.min(1, s.life / 30) + ")"; g.beginPath(); g.arc(s.x, s.y, s.r, 0, 6.283); g.fill();
    }
  })(0);
})();

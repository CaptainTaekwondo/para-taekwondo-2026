(() => {
  "use strict";
  const C = (typeof CONFIG !== "undefined" && CONFIG) || {};
  const J = C.judges || {};
  if (location.protocol === "file:") {   // معاينة محلية: انظر judges.css (.is-file) و assets/judges/local.css
    document.documentElement.classList.add("is-file");
    const l = document.createElement("link"); l.rel = "stylesheet"; l.href = "assets/judges/local.css?v=1"; document.head.appendChild(l);
  }
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  /* كود الحكم = PTJ-2026- + آخر 4 أرقام من رقم الحكم (id) (PT = البطولة، J = حكم). لو مفيش رقم: p.code يدويًا، وإلا شرطة */
  const codeOf = p => {
    const d = String(p.id == null ? "" : p.id).replace(/\D/g, "");
    return d.length ? "PTJ-2026-" + d.slice(-4).padStart(4, "0") : (p.code || "—");
  };
  const items = [];                       // بيانات كل كرت (للتحميل)

  /* نمط الكود المكرّر (SVG) يظهر على حواف الكرت تحت ضوء الماوس */
  const patUrl = code => {
    const t = (x, rot) => `<text x="${x}" y="280" text-anchor="middle" textLength="500" lengthAdjust="spacingAndGlyphs" transform="rotate(${rot} ${x} 280)" font-family="Arial, Helvetica, sans-serif" font-weight="900" font-size="78" letter-spacing="5" fill="#ffe9a0" stroke="#7a4a05" stroke-width="2.6" paint-order="stroke">${code.replace(/[<&>]/g, "")}</text>`;
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="978" height="560">${t(86, -90)}${t(892, 90)}</svg>`;
    return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  };
  /* p: { name, code?, role?, photo?, fit?: "contain" (للصور الدائرية المؤطرة) } */
  /* وضع النت الضعيف: نسخة -lite من الصور الكبيرة للعرض فقط (التحميل PNG/JPG/PDF يفضل بالجودة الكاملة) */
  const LITE = document.documentElement.classList.contains("lite");
  const L = src => LITE && src ? String(src).replace(/\.webp(\?|$)/, "-lite.webp$1") : src;
  /* صور الكروت للعرض: النت البطيء = -lite (الأخف)، النت الكويس = -md (800px بدل 978، بنفس الجودة على الشاشة). التحميل PNG/JPG/PDF بيستخدم الأصل الكامل */
  const M = src => src ? String(src).replace(/\.webp(\?|$)/, (LITE ? "-lite" : "-md") + ".webp$1") : src;
  function tplCard(p, cls, k) {
    const inner = p.photo ? `<img src="${esc(L(p.photo))}"${LITE ? ` onerror="this.onerror=null;this.src='${esc(p.photo)}'"` : ""} alt="${esc(p.name)}" loading="lazy">` : `<span class="ini foil" aria-hidden="true">★</span>`;
    const chief = /chief/.test(cls || "");
    const bg = chief && C.judgeCardChief ? C.judgeCardChief : C.judgeCardBg;
    const live = !/slot/.test(cls || "");
    const front = `<div class="tcard" style="--bg:url('${esc(M(bg))}')">` +
      `<i class="sp s1">✦</i><i class="sp s2">✦</i><i class="sp s3">✦</i><i class="sp s4">✦</i><i class="sp s5">✦</i>` +
      `<div class="tph${p.fit === "contain" ? " contain" : ""}">${inner}<span class="wmt"><i style="--wmt:url('${esc(L(C.watermarkTile || "assets/judges/watermark-tile.webp"))}')"></i></span></div>` +
      (codeOf(p) !== "—" ? `<div class="rcode" style="--pat:${patUrl(codeOf(p)).replace(/"/g, "&quot;")}"></div>` : "") +
      `<h3 class="tnm">${esc(p.name)}</h3>` +
      `<div class="tcode"><b class="ltr">${esc(codeOf(p))}</b></div></div>`;
    const back = live ? `<div class="back"${C.judgeCardBack ? ` style="--bk:url('${esc(M(C.judgeCardBack))}')"` : ""}><div class="bin">
        <div class="g1">
          <img class="b1" src="${L("assets/champion.webp")}" alt="" width="72" height="72">
          <div class="bt">بطولة أساسيات البارا تايكوندو 2026</div>
          <div class="bn">${esc(p.name)}</div>
        </div>
        <div class="g2">
          <div class="bd">حمّل البطاقة</div>
          <div class="bb">
            <button type="button" data-fmt="png" aria-label="تحميل PNG"><img src="assets/judges/dl-png.webp?v=2" alt="PNG" draggable="false"></button><button type="button" data-fmt="jpg" aria-label="تحميل JPG"><img src="assets/judges/dl-jpg.webp?v=2" alt="JPG" draggable="false"></button><button type="button" data-fmt="pdf" aria-label="تحميل PDF"><img src="assets/judges/dl-pdf.webp?v=2" alt="PDF" draggable="false"></button>
          </div>
          <button type="button" class="bk">رجوع للبطاقة</button>
        </div>
        <div class="g3 bf"><span class="bfm"><img src="assets/judges/captain-medal.webp?v=2" alt="" width="30" height="30"></span><div class="bfr"><span>Captain Taekwondo</span></div></div>
      </div><i class="sp s1">✦</i><i class="sp s2">✦</i><i class="sp s3">✦</i><i class="sp s4">✦</i><i class="sp s5">✦</i></div>` : "";
    return `<article class="jc tpl ${cls || ""}${live ? " flippable" : ""}" data-k="${k}"${live ? ' tabindex="0" role="button" aria-label="اضغط لقلب البطاقة"' : ""}>` +
      `<div class="flip">${front}${back}</div><div class="role">${esc(p.role || "حكم")}</div></article>`;
  }

  function card(p, cls) {
    const k = items.push({ p, chief: /chief/.test(cls || "") }) - 1;
    if (C.judgeCardBg) return tplCard(p, cls, k);
    const inner = p.photo
      ? `<img src="${esc(p.photo)}" alt="${esc(p.name)}" loading="lazy">`
      : `<span class="ini foil" aria-hidden="true">★</span>`;
    return `<article class="jc ${cls || ""}"><div class="frame"><div class="glass${p.fit === "contain" ? " contain" : ""}">${inner}</div></div>` +
      `<div class="role">${esc(p.role || "حكم")}</div>` +
      `<div class="plate"><h3 class="nm">${esc(p.name)}</h3></div>` +
      `<div class="code"><b class="ltr">${esc(codeOf(p))}</b></div></article>`;
  }

  function render() {
    items.length = 0;
    const head = J.head || { name: "يُعلن لاحقًا" };
    $("#jHead").innerHTML = card(head, "chief");
    const list = J.referees || [];
    $("#jGrid").innerHTML = list.length
      ? list.map(p => card(p)).join("")
      : Array.from({ length: 10 }, () => card({ name: "يُعلن لاحقًا" }, "slot")).join("");
    document.querySelectorAll(".jc").forEach((e, i) => e.style.setProperty("--i", i));
    if (window.I18N) I18N.apply(document.body);
  }
  render();

  /* لوجو البطولة: ضغطة = يلف عموديًا (rotateX) في مكانه ويظهر لوجو Captain Taekwondo، وضغطة تانية ترجّعه. مع تقليل الحركة: تلاشي بدل اللف */
  (function () {
    const btn = $("#jCoin"); if (!btn) return;
    const coin = btn.querySelector(".coin"), ring = btn.querySelector(".jring"), RM = matchMedia("(prefers-reduced-motion:reduce)");
    let angle = 0, busy = false;
    /* مؤثرات الحركة: توهج ذهبي بيزيد في نص اللفة، لمعة بتعدّي على الوجه، وموجة حلقية بتنتشر في الآخر */
    function fx(d) {
      btn.animate([{ filter: "brightness(1) blur(0) drop-shadow(0 0 0 rgba(255,214,90,0))" }, { filter: "brightness(1.2) blur(1.6px) drop-shadow(0 0 22px rgba(255,214,90,.8))", offset: .5 }, { filter: "brightness(1) blur(0) drop-shadow(0 0 0 rgba(255,214,90,0))" }], { duration: d, easing: "ease-in-out" });
      ring.animate([{ transform: "scale(1)", opacity: 0 }, { opacity: .9, offset: .12 }, { transform: "scale(2)", opacity: 0 }], { duration: 750, delay: d * .85, easing: "cubic-bezier(.2,.7,.3,1)" });
    }
    btn.addEventListener("click", async () => {
      if (busy) return;
      const on = !btn.classList.contains("flipped");
      if (RM.matches || !coin.animate) { btn.classList.add("rm"); btn.classList.toggle("flipped", on); btn.setAttribute("aria-pressed", on); return; }
      busy = true; const from = angle; angle += 540;
      try {
        fx(1200);
        const an = coin.animate([{ transform: `rotateX(${from}deg)` }, { transform: `rotateX(${angle}deg)` }], { duration: 1200, easing: "cubic-bezier(.65,0,.25,1)", fill: "forwards" });
        btn.classList.toggle("flipped", on); btn.setAttribute("aria-pressed", on);
        await an.finished; coin.style.transform = `rotateX(${angle}deg)`; an.cancel();
      } catch (e) { /* تم إلغاء الحركة */ }
      busy = false;
    });
    /* أول ما الصفحة تفتح: يلف لفتين بسرعة ويرجع زي ما كان، عشان الزائر يعرف إنه بيلف */
    if (!RM.matches && coin.animate) setTimeout(async () => {
      if (busy || angle) return; busy = true;
      try { fx(1500); const an = coin.animate([{ transform: "rotateX(0deg)" }, { transform: "rotateX(720deg)" }], { duration: 1500, easing: "cubic-bezier(.7,0,.25,1)" }); await an.finished; } catch (e) { /* ملغاة */ }
      busy = false;
    }, 900);
  })();

  /* لوجو كابتن تايكوندو العايم: نقرة = ينزل يلمس منتصف دوائر الأرضية ويعمل موجة زي قطرة الماء ثم يرجع يطفو */
  (function () {
    const stage = $("#jStage"), cw = $("#jcw"), btn = $("#jCrys"), pool = $("#jPool"), floor = document.querySelector(".jfloor"), page = document.querySelector(".jpage");
    if (!stage || !btn || !floor) return;
    const RM = matchMedia("(prefers-reduced-motion:reduce)"), rp = [...pool.querySelectorAll(".rp")], rg = pool.querySelector(".rg");
    let busy = false, D = 110;
    /* مركز دوائر الأرضية (.jfloor): x = 50%، y = 90% من ارتفاعها. نظبط الموجة على نفس الشكل البيضاوي */
    function place() {
      const fr = floor.getBoundingClientRect(), sr = stage.getBoundingClientRect(), W = fr.width, cy = fr.top + fr.height * .9 - sr.top;
      const rx = W * .52 * .62, ry = fr.height * .17 * .62;                 // أقصى نصف قطر للموجة، بنفس نسبة بيضاوي الأرضية
      pool.style.top = cy + "px"; pool.style.setProperty("--pw", rx * 2 + "px"); pool.style.setProperty("--ph", ry * 2 + "px");
      D = Math.max(40, cy - (cw.offsetTop + cw.offsetHeight - 14));
    }
    place(); addEventListener("resize", place); if (window.ResizeObserver) new ResizeObserver(place).observe(page); addEventListener("load", place);
    function ripples(delay) {
      rp.forEach((el, i) => el.animate([{ transform: "scale(.04)", opacity: 0 }, { opacity: .95, offset: .12 }, { transform: "scale(1)", opacity: 0 }], { duration: 1900, delay: delay + i * 260, easing: "cubic-bezier(.15,.6,.3,1)" }));
      rg.animate([{ transform: "scale(.3)", opacity: 0 }, { opacity: 1, offset: .15 }, { transform: "scale(1.6)", opacity: 0 }], { duration: 900, delay, easing: "ease-out" });
    }
    btn.addEventListener("click", async () => {
      if (busy) return; busy = true; place();
      try {
        if (RM.matches || !cw.animate) { ripples(0); await new Promise(r => setTimeout(r, 900)); }
        else {
          const t = 2000, drop = .3;
          const an = cw.animate([{ transform: "translateY(0) scale(1,1)", easing: "cubic-bezier(.5,0,.9,.6)" }, { transform: `translateY(${D}px) scale(1,1)`, offset: drop }, { transform: `translateY(${D + 6}px) scale(1.06,.92)`, offset: drop + .06, easing: "ease-out" }, { transform: `translateY(${D * .25}px) scale(1,1)`, offset: .72, easing: "cubic-bezier(.3,.6,.3,1)" }, { transform: "translateY(0) scale(1,1)" }], { duration: t });
          ripples(t * drop - 40); await an.finished;
        }
      } catch (e) { /* ملغاة */ }
      busy = false;
    });
  })();

  /* نجوم صغيرة بتظهر وتختفي في خلفية الصفحة */
  (function () {
    const page = document.querySelector(".jpage");
    if (!page || LITE || (!matchMedia("(hover:hover)").matches && matchMedia("(prefers-reduced-motion:reduce)").matches)) return;
    let sd = 11; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    const n = innerWidth < 700 ? 8 : 16, fr = document.createDocumentFragment();
    for (let i = 0; i < n; i++) {
      const s = document.createElement("i"); s.className = "jtw"; s.textContent = "✦"; s.setAttribute("aria-hidden", "true");
      s.style.cssText = `left:${(rnd() * 96 + 2).toFixed(1)}%;top:${(rnd() * 96 + 1).toFixed(1)}%;font-size:${(8 + rnd() * 16).toFixed(0)}px;animation-delay:${(rnd() * 6).toFixed(2)}s;animation-duration:${(2.6 + rnd() * 3).toFixed(2)}s`;
      fr.appendChild(s);
    }
    page.appendChild(fr);
  })();

  /* ميلان ثلاثي الأبعاد مع حركة الماوس */
  const TOUCH = matchMedia("(hover:none),(pointer:coarse)").matches;
  if (!TOUCH && matchMedia("(hover:hover)").matches && !matchMedia("(prefers-reduced-motion:reduce)").matches) {
    document.querySelectorAll(".jc.tpl").forEach(el => {
      const box = el.querySelector(".tcard");
      let ev = null, tk = 0;
      const apply = () => {
        tk = 0; const e = ev; if (!e || el.classList.contains("flipped")) return;
        const r = el.getBoundingClientRect(), x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
        box.style.setProperty("--ry", (x * 16).toFixed(2) + "deg"); box.style.setProperty("--rx", (-y * 14).toFixed(2) + "deg");
        box.style.setProperty("--mx", (x + .5) * 100 + "%"); box.style.setProperty("--my", (y + .5) * 100 + "%");
        const ph = box.querySelector(".tph"); if (ph) { const q = ph.getBoundingClientRect(); ph.style.setProperty("--px", (e.clientX - q.left) + "px"); ph.style.setProperty("--py", (e.clientY - q.top) + "px"); el.classList.toggle("onph", e.clientX >= q.left && e.clientX <= q.right && e.clientY >= q.top && e.clientY <= q.bottom); }
      };
      el.addEventListener("pointermove", e => { ev = e; if (!tk) tk = requestAnimationFrame(apply); });
      el.addEventListener("pointerleave", () => { el.classList.remove("onph"); box.style.setProperty("--ry", "0deg"); box.style.setProperty("--rx", "0deg"); });
    });
  }

  /* الموبايل (بدون ماوس): كشّاف بيتحرك لوحده على الكرت اللي قدام العين، عشان العلامة المائية (الكود ولوجو كابتن تايكوندو الملوّن) تبان */
  if (TOUCH) {
    const cards = [...document.querySelectorAll(".jc.tpl")], vis = new Set(), RM = matchMedia("(prefers-reduced-motion:reduce)").matches, STATIC = LITE || RM;
    let raf = 0, TILT = false;
    const paint = t => {
      if (TILT) return;
      vis.forEach(el => {
        if (el.classList.contains("flipped")) return;
        const box = el.querySelector(".tcard"), ph = el.querySelector(".tph"); if (!box || !ph) return;
        const k = STATIC ? 0 : t / 1000, i = +el.dataset.k || 0, x = .5 + .38 * Math.sin(k * .9 + i * 1.7), y = .5 + .36 * Math.sin(k * .65 + 1.3 + i);
        box.style.setProperty("--mx", (x * 100).toFixed(1) + "%"); box.style.setProperty("--my", (y * 100).toFixed(1) + "%");
        ph.style.setProperty("--px", (x * ph.offsetWidth).toFixed(0) + "px"); ph.style.setProperty("--py", (y * ph.offsetHeight).toFixed(0) + "px");
      });
    };
    const loop = t => { paint(t); raf = vis.size && !document.hidden && !STATIC ? requestAnimationFrame(loop) : 0; };
    const kick = () => { if (STATIC) paint(0); else if (!raf) raf = requestAnimationFrame(loop); };
    const io = new IntersectionObserver(es => {
      es.forEach(e => { if (e.isIntersecting) { vis.add(e.target); e.target.classList.add("auto", "onph"); } else { vis.delete(e.target); e.target.classList.remove("auto", "onph"); } });
      kick();
    }, { threshold: .25 });
    cards.forEach(c => io.observe(c));
    document.addEventListener("visibilitychange", () => { if (!document.hidden) kick(); });
    /* ميلان الموبايل: فوق/تحت = الكود، يمين/شمال = لوجو كابتن تايكوندو */
    if (!RM) {
      /* ميلان في كل الاتجاهات (360°): الاتجاه بيحدد مين يظهر (الكود/اللوجو بيتمزجوا بالتدريج)، وقوة الميلان بتحدد الإضاءة وزاوية الكرت.
         القيم بتتنعّم في rAF عشان الحركة تبقى سلسة ومتزامنة مع إيد المستخدم */
      let b0 = null, on = false, oraf = 0;
      const cl = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
      const S = { dB: 0, dG: 0 }, T = { dB: 0, dG: 0 }, R = 60;
      const wrap = a => a > 180 ? a - 360 : a < -180 ? a + 360 : a;
      const render = () => {
        S.dB += (T.dB - S.dB) * .35; S.dG += (T.dG - S.dG) * .35;
        const dB = S.dB, dG = S.dG, m = Math.hypot(dB, dG), s = cl((m - 3) / 12, 0, 1), wc = m ? dB * dB / (dB * dB + dG * dG) : .5;
        const co = s * cl(wc * 1.6, 0, 1), lo = s * cl((1 - wc) * 1.6, 0, 1), x = .5 + cl(dG / R, -1, 1) * .45, y = .5 + cl(dB / R, -1, 1) * .45;
        vis.forEach(el => {
          if (el.classList.contains("flipped")) return;
          const box = el.querySelector(".tcard"), ph = el.querySelector(".tph"); if (!box || !ph) return;
          el.classList.add("tilt");
          el.style.setProperty("--co", co.toFixed(2)); el.style.setProperty("--lo", lo.toFixed(2));
          box.style.setProperty("--mx", (x * 100).toFixed(1) + "%"); box.style.setProperty("--my", (y * 100).toFixed(1) + "%");
          box.style.setProperty("--ry", (cl(dG, -R, R) * .55).toFixed(1) + "deg"); box.style.setProperty("--rx", (-cl(dB, -R, R) * .5).toFixed(1) + "deg"); /* الكرت نفسه بيميل مع الموبايل */
          ph.style.setProperty("--px", (x * ph.offsetWidth).toFixed(0) + "px"); ph.style.setProperty("--py", (y * ph.offsetHeight).toFixed(0) + "px");
        });
        oraf = Math.abs(T.dB - S.dB) + Math.abs(T.dG - S.dG) > .05 && !document.hidden ? requestAnimationFrame(render) : 0;
      };
      const G = { dB: 0, dG: 0 }; let finger = false;
      const go = () => { if (!on) { on = TILT = true; document.body.classList.add("tiltwm"); } if (!oraf) oraf = requestAnimationFrame(render); };
      const onOri = e => {
        if (e.beta == null || e.gamma == null) return;
        if (b0 == null) b0 = e.beta;
        G.dB = cl(wrap(e.beta - b0), -R, R); G.dG = cl(e.gamma, -R, R);
        b0 += wrap(e.beta - b0) * .003; /* خط الأساس بيتأقلم ببطء مع وضع الإمساك */
        if (!finger) { T.dB = G.dB; T.dG = G.dG; go(); }
      };
      /* حركة الإصبع: موضع الإصبع على الكرت بيميله في أي اتجاه (دايرة كاملة)، ولما يسيبه يرجع لميلان الموبايل */
      const touchAt = e => {
        const t = e.touches[0], el = e.currentTarget; if (!t || el.classList.contains("flipped")) return;
        const r = el.getBoundingClientRect(); finger = true;
        T.dG = cl(((t.clientX - r.left) / r.width - .5) * 2 * R, -R, R); T.dB = cl(((t.clientY - r.top) / r.height - .5) * 2 * R, -R, R); go();
      };
      const release = () => { finger = false; T.dB = G.dB; T.dG = G.dG; if (oraf === 0) oraf = requestAnimationFrame(render); };
      cards.forEach(c => { c.addEventListener("touchstart", touchAt, { passive: true }); c.addEventListener("touchmove", touchAt, { passive: true }); c.addEventListener("touchend", release, { passive: true }); c.addEventListener("touchcancel", release, { passive: true }); });
      const start = () => addEventListener("deviceorientation", onOri);
      const DO = window.DeviceOrientationEvent;
      if (!DO) { /* بدون جيروسكوب: الإصبع بس */ }
      else if (typeof DO.requestPermission === "function") {
        const ask = () => { document.removeEventListener("touchend", ask); DO.requestPermission().then(r => { if (r === "granted") start(); }).catch(() => {}); };
        document.addEventListener("touchend", ask);
      } else start();
    }
  }

  /* ---------- قلب الكرت ---------- */
  /* قلب الكرت: بطيء (1.6 ثانية) مع رفع الكرت لقدام ولمعة بتعدّي وفلاش ذهبي في نص القلبة وتوهج حواليه. مع تقليل الحركة أو الوضع الخفيف: قلب بسيط */
  const FLIP_MS = 1600;
  function flip(el, on) {
    if (el._flipping) return;
    const box = el.querySelector(".tcard"); if (box) { box.style.setProperty("--ry", "0deg"); box.style.setProperty("--rx", "0deg"); }
    const was = el.classList.contains("flipped"), to = on === undefined ? !was : on; if (to === was) return;
    const fl = el.querySelector(".flip"), simple = LITE || matchMedia("(prefers-reduced-motion:reduce)").matches || !fl || !fl.animate;
    el.classList.toggle("flipped", to); el.setAttribute("aria-pressed", to);
    if (simple) return;
    el._flipping = true; fl.classList.add("anim");
    const mk = c => { let n = el.querySelector("." + c); if (!n) { n = document.createElement("i"); n.className = c; n.setAttribute("aria-hidden", "true"); el.appendChild(n); } return n; };
    const flash = mk("jfxo"), sheen = mk("jfxs"), from = was ? 180 : 0, end = to ? 180 : 0, mid = (from + end) / 2;
    const ease = "cubic-bezier(.45,.05,.25,1)";
    const an = fl.animate([{ transform: `rotateY(${from}deg) translateZ(0) scale(1)` }, { transform: `rotateY(${mid}deg) translateZ(130px) scale(1.06)`, offset: .5 }, { transform: `rotateY(${end}deg) translateZ(0) scale(1)` }], { duration: FLIP_MS, easing: ease });
    flash.animate([{ opacity: 0 }, { opacity: .85, offset: .5 }, { opacity: 0 }], { duration: FLIP_MS, easing: "ease-in-out" });
    sheen.animate([{ opacity: 1, backgroundPosition: "130% 0" }, { opacity: 1, backgroundPosition: "-130% 0" }], { duration: FLIP_MS * .9, delay: FLIP_MS * .1, easing: "ease-in-out", fill: "backwards" });
    el.animate([{ filter: "drop-shadow(0 0 0 rgba(255,214,90,0))" }, { filter: "drop-shadow(0 0 34px rgba(255,214,90,.85))", offset: .5 }, { filter: "drop-shadow(0 0 0 rgba(255,214,90,0))" }], { duration: FLIP_MS, easing: "ease-in-out" });
    an.finished.catch(() => {}).then(() => { fl.classList.remove("anim"); el._flipping = false; });
  }
  document.addEventListener("click", e => {
    const el = e.target.closest(".jc.flippable"); if (!el) return;
    const fmt = e.target.closest("[data-fmt]");
    if (fmt) { e.stopPropagation(); download(items[+el.dataset.k], fmt.dataset.fmt); return; }
    if (e.target.closest(".bk")) { flip(el, false); return; }
    flip(el);
  });
  document.addEventListener("keydown", e => {
    if ((e.key === "Enter" || e.key === " ") && e.target.classList && e.target.classList.contains("flippable")) { e.preventDefault(); flip(e.target); }
    if (e.key === "Escape") { closeModal(); document.querySelectorAll(".jc.flipped").forEach(x => flip(x, false)); }
  });

  /* ---------- كلمة المرور (أول تحميل لكل بطاقة) ----------
     كلمة مرور كل بطاقة = CAPTKD + آخر 4 أرقام من رقم الحكم (نفس أرقام كود البطاقة). */
  const KEY = "ptk_judge_dl_ok2";
  const pwOf = p => { const d = String(p.id == null ? "" : p.id).replace(/\D/g, ""); return d ? "CAPTKD" + d.slice(-4).padStart(4, "0") : ""; };
  const okList = () => { try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch (e) { return []; } };
  const unlocked = it => okList().includes(pwOf(it.p));
  const modal = $("#pwModal"), pwIn = $("#pwIn"), pwErr = $("#pwErr");
  let pending = null;                                        // { it, go }
  function openModal() { pwErr.hidden = true; pwIn.value = ""; modal.hidden = false; setTimeout(() => pwIn.focus(), 30); }
  function closeModal() { if (modal) modal.hidden = true; pending = null; }
  if (modal) {
    $("#pwCancel").addEventListener("click", closeModal);
    modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });
    $("#pwForm").addEventListener("submit", e => {
      e.preventDefault();
      const want = pending ? pwOf(pending.it.p) : "", box = modal.querySelector(".pwbox");
      if (!want || pwIn.value.trim().toUpperCase() !== want) { pwErr.hidden = false; pwIn.select(); box.classList.remove("shake"); void box.offsetWidth; box.classList.add("shake"); return; }
      try { localStorage.setItem(KEY, JSON.stringify([...new Set([...okList(), want])])); } catch (err) { /* بدون تخزين: يُطلب مرة أخرى */ }
      const job = pending; closeModal(); if (job) job.go();
    });
  }
  function download(it, fmt) {
    const go = () => makeFile(it, fmt);
    if (unlocked(it)) return go();
    pending = { it, go }; openModal();
  }

  /* ---------- رسم البطاقة وتصديرها ---------- */
  const load = src => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
  function fitText(ctx, text, maxW, size, weight) {
    let s = size; ctx.font = `${weight} ${s}px Cairo, sans-serif`;
    while (ctx.measureText(text).width > maxW && s > 14) { s -= 2; ctx.font = `${weight} ${s}px Cairo, sans-serif`; }
    return s;
  }
  /* خلفية نافذة الصورة: أزرق ملكي بإضاءة وأشعة ونقط شبكية وغبار ذهبي وأرضية متوهجة (بدل الكحلي الساده) */
  function paintWin(ctx, x, y, w, h, S) {
    ctx.save(); ctx.beginPath(); ctx.rect(x, y, w, h); ctx.clip();
    const g = ctx.createRadialGradient(x + w / 2, y + h * .38, 10, x + w / 2, y + h * .38, w * 1.05);
    g.addColorStop(0, "#2c64d8"); g.addColorStop(.45, "#123a99"); g.addColorStop(1, "#081c63");
    ctx.fillStyle = g; ctx.fillRect(x, y, w, h);
    const hl = ctx.createRadialGradient(x + w / 2, y + h * .45, 0, x + w / 2, y + h * .45, w * .58);                    // هالة خلف الحلقة
    hl.addColorStop(0, "rgba(120,175,255,.5)"); hl.addColorStop(.55, "rgba(60,120,255,.2)"); hl.addColorStop(1, "rgba(60,120,255,0)");
    ctx.fillStyle = hl; ctx.fillRect(x, y, w, h);
    const dk = ctx.createLinearGradient(0, y + h * .5, 0, y + h);                                                       // تدرّج للغامق من تحت (هيبة)
    dk.addColorStop(0, "rgba(3,9,34,0)"); dk.addColorStop(.52, "rgba(3,9,34,.55)"); dk.addColorStop(1, "rgba(2,6,24,.95)");
    ctx.fillStyle = dk; ctx.fillRect(x, y + h * .5, w, h * .5);
    ctx.restore();
  }
  /* لمعة مائلة (زي اللمعة المتحركة في الصفحة) ونجوم ✦ في نفس أماكنها: ثابتة في الصورة المحمّلة */
  function sparkle4(ctx, x, y, r) {
    ctx.save(); ctx.translate(x, y); ctx.fillStyle = "#fff6c9"; ctx.shadowColor = "#ffd45c"; ctx.shadowBlur = r * 1.4;
    ctx.beginPath(); [[0, -1], [.14, -.14], [1, 0], [.14, .14], [0, 1], [-.14, .14], [-1, 0], [-.14, -.14]].forEach(([a, b], i) => i ? ctx.lineTo(a * r, b * r) : ctx.moveTo(a * r, b * r)); ctx.closePath(); ctx.fill(); ctx.restore();
  }
  function glintFx(ctx, W, H, stars) {
    const a = 112 * Math.PI / 180, dx = Math.sin(a), dy = -Math.cos(a), cx = W * .4, cy = H * .46, L = W * .2;
    ctx.save(); ctx.globalCompositeOperation = "screen";
    const g = ctx.createLinearGradient(cx - dx * L, cy - dy * L, cx + dx * L, cy + dy * L);
    g.addColorStop(0, "rgba(255,255,255,0)"); g.addColorStop(.5, "rgba(255,255,255,.26)"); g.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); ctx.restore();
    if (stars) [[.085, .255, .075], [.9, .15, .1], [.115, .62, .075], [.9, .545, .06], [.5, .945, .065]].forEach(([x, y, k]) => sparkle4(ctx, x * W, y * H, k * W * .5));
  }
  /* قص الصورة بنفس زوايا وش البطاقة (شفافة)، وبعدها لون الخلفية لو JPG/PDF */
  async function finish(cv, bgColor, chief) {
    const W = cv.width, H = cv.height, ctx = cv.getContext("2d");
    try {
      const m = await load(chief && C.judgeCardChief ? C.judgeCardChief : C.judgeCardBg);
      ctx.save(); ctx.globalCompositeOperation = "destination-in"; ctx.drawImage(m, 0, 0, W, H); ctx.restore();
    } catch (e) { /* بدون قص */ }
    if (!bgColor) return cv;
    const out = document.createElement("canvas"); out.width = W; out.height = H;
    const o = out.getContext("2d"); o.fillStyle = bgColor; o.fillRect(0, 0, W, H); o.drawImage(cv, 0, 0); return out;
  }
  async function drawCard(it, bgColor) { return finish(await drawCardRaw(it), bgColor, it.chief); }
  async function drawBack(it, bgColor) { return finish(await drawBackRaw(it), bgColor, it.chief); }
  async function drawCardRaw(it) {
    const S = 2, W = 978 * S, H = 1355 * S, p = it.p;
    const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    const ctx = cv.getContext("2d");
    try { await document.fonts.load("800 40px Cairo"); await document.fonts.load("700 40px Cairo"); } catch (e) { /* الخط الافتراضي */ }
    const tpl = await load(it.chief && C.judgeCardChief ? C.judgeCardChief : C.judgeCardBg);
    ctx.drawImage(tpl, 0, 0, W, H);       // القالب أولًا ثم الصورة داخل النافذة (مثل الصفحة)
    // نافذة الصورة
    const wx = W * .20, wy = H * .134, ww = W * .60, wh = H * .544, r = 44 * S;
    ctx.save(); ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(wx, wy, ww, wh, r); else ctx.rect(wx, wy, ww, wh);
    ctx.clip();
    paintWin(ctx, wx, wy, ww, wh, S);
    if (p.photo) {
      try {
        const ph = await load(p.photo), contain = p.fit === "contain", pad = contain ? ww * .02 : 0;
        const k = contain ? Math.min((ww - pad * 2) / ph.width, (wh - pad * 2) / ph.height) : Math.max(ww / ph.width, wh / ph.height);
        const dw = ph.width * k, dh = ph.height * k;
        const dx = wx + (ww - dw) / 2, dy = contain ? wy + (wh - dh) * .45 : wy + (wh - dh) * .2;
        ctx.drawImage(ph, dx, dy, dw, dh);
      } catch (e) { /* بدون صورة */ }
    }
    ctx.restore();
    ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.direction = "rtl";
    // الاسم على الشريط الذهبي
    const nx = W * (.14 + .72 / 2), ny = H * (.759 + .086 / 2), nw = W * .70;
    fitText(ctx, p.name, nw, 74 * S * .8, 800);
    ctx.fillStyle = "#2a1700"; ctx.shadowColor = "rgba(255,255,255,.65)"; ctx.shadowOffsetY = 1 * S; ctx.shadowBlur = 0;
    ctx.fillText(p.name, nx, ny); ctx.shadowColor = "transparent";
    // الكود
    const code = codeOf(p);
    fitText(ctx, code, W * .44, 36 * S * .8, 700);
    ctx.fillStyle = "#fff4bd"; ctx.fillText(code, W * .5, H * (.876 + .048 / 2));
    glintFx(ctx, W, H, true);
    return cv;
  }
  const fname = it => "judge-" + String(codeOf(it.p) !== "—" ? codeOf(it.p) : it.p.name).replace(/[^\w؀-ۿ-]+/g, "-").replace(/^-+|-+$/g, "");
  function save(blob, name) {
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  }
  /* ظهر البطاقة للتحميل: نفس الخلفية، ولوجو كابتن تايكوندو بدل أزرار التحميل */
  function rrect(ctx, x, y, w, h, r) { ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h); }
  /* مؤثرات خلفية الظهر: هالة، أشعة، شرائط ضوء، غبار ونجوم متلألئة، هالة حوالين اللوحة */
  function backFx(ctx, W, H, S) {
    let sd = 7; const rnd = () => (sd = (sd * 16807) % 2147483647) / 2147483647;
    const cx = W / 2, cy = 898 * S, add = "lighter";
    ctx.save(); ctx.globalCompositeOperation = add;
    // هالة ذهبية كبيرة خلف اللوجو + هالة زرقاء في الأعلى
    let g = ctx.createRadialGradient(cx, cy, 0, cx, cy, 760 * S); g.addColorStop(0, "rgba(255,196,60,.5)"); g.addColorStop(.35, "rgba(255,160,30,.16)"); g.addColorStop(1, "rgba(255,160,30,0)"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    g = ctx.createRadialGradient(cx, 255 * S, 0, cx, 255 * S, 520 * S); g.addColorStop(0, "rgba(90,150,255,.5)"); g.addColorStop(1, "rgba(60,110,255,0)"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // أشعة طويلة على الكرت كله
    for (let i = 0; i < 44; i++) {
      const a0 = i / 44 * 6.283 + .02, w = .05 + (i % 3) * .018, R = 1700 * S, warm = i % 2 === 0;
      const rg = ctx.createRadialGradient(cx, cy, 80 * S, cx, cy, R); rg.addColorStop(0, warm ? "rgba(255,200,70,.26)" : "rgba(110,160,255,.22)"); rg.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = rg; ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(a0) * R, cy + Math.sin(a0) * R); ctx.lineTo(cx + Math.cos(a0 + w) * R, cy + Math.sin(a0 + w) * R); ctx.closePath(); ctx.fill();
    }
    // شرائط ضوء ذهبية منحنية بتعدّي من الأركان
    const sw = (x0, y0, c1x, c1y, c2x, c2y, x1, y1, wd, al) => {
      const lg = ctx.createLinearGradient(x0, y0, x1, y1); lg.addColorStop(0, "rgba(255,210,90,0)"); lg.addColorStop(.5, `rgba(255,226,130,${al})`); lg.addColorStop(1, "rgba(255,210,90,0)");
      ctx.strokeStyle = lg; ctx.lineWidth = wd * S; ctx.shadowColor = "rgba(255,200,70,.9)"; ctx.shadowBlur = 24 * S; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.bezierCurveTo(c1x, c1y, c2x, c2y, x1, y1); ctx.stroke();
    };
    sw(0, 240 * S, 300 * S, 120 * S, 640 * S, 520 * S, W, 380 * S, 5, .85);
    sw(0, 1180 * S, 340 * S, 980 * S, 640 * S, 1300 * S, W, 1020 * S, 4, .8);
    sw(0, 640 * S, 260 * S, 760 * S, 700 * S, 540 * S, W, 720 * S, 3, .55);
    ctx.shadowBlur = 0;
    // غبار ذهبي
    for (let i = 0; i < 320; i++) {
      const x = rnd() * W, y = rnd() * H, r = (.8 + rnd() * 2.6) * S, al = .25 + rnd() * .65;
      ctx.fillStyle = rnd() > .3 ? `rgba(255,214,110,${al})` : `rgba(190,215,255,${al})`; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.fill();
    }
    ctx.restore();
    // نجوم متلألئة رباعية
    const star = (x, y, r) => { ctx.save(); ctx.translate(x, y); ctx.fillStyle = "#fff8d6"; ctx.shadowColor = "#ffd45c"; ctx.shadowBlur = r * 1.6;
      ctx.beginPath(); [[0, -1], [.14, -.14], [1, 0], [.14, .14], [0, 1], [-.14, .14], [-1, 0], [-.14, -.14]].forEach(([a, b], i) => i ? ctx.lineTo(a * r, b * r) : ctx.moveTo(a * r, b * r)); ctx.closePath(); ctx.fill(); ctx.restore(); };
    [[.07, .1, 30], [.93, .12, 40], [.05, .45, 24], [.95, .5, 30], [.08, .8, 34], [.93, .82, 26], [.2, .04, 18], [.8, .05, 20], [.15, .95, 22], [.85, .94, 24], [.5, .035, 16], [.1, .27, 16], [.9, .3, 18], [.12, .62, 14], [.88, .66, 16]].forEach(([fx, fy, r]) => star(W * fx, H * fy, r * S));
  }
  async function drawBackRaw(it) {
    const S = 2, W = 978 * S, H = 1355 * S, p = it.p, cx = W / 2;
    const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    const ctx = cv.getContext("2d");
    try { await document.fonts.load("800 40px Cairo"); await document.fonts.load("700 40px Cairo"); } catch (e) { /* الخط الافتراضي */ }
    if (C.judgeCardBack) { try { ctx.drawImage(await load(C.judgeCardBack), 0, 0, W, H); } catch (e) { /* بدون خلفية */ } }
    else { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#12378f"); g.addColorStop(1, "#030a24"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
    backFx(ctx, W, H, S);
    const [champ, cap] = await Promise.all([load("assets/champion.webp").catch(() => null), load("assets/judges/captain-medal.webp?v=2").catch(() => null)]);
    const gold = (y0, y1) => { const g = ctx.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, "#fff6c9"); g.addColorStop(.45, "#f4cb55"); g.addColorStop(1, "#c58a18"); return g; };
    const goldH = (x0, x1) => { const g = ctx.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, "#fff4bd"); g.addColorStop(.5, "#e0a929"); g.addColorStop(1, "#8a5806"); return g; };
    const rr = (x, y, w, h, r) => { ctx.beginPath(); if (ctx.roundRect) ctx.roundRect(x, y, w, h, r); else ctx.rect(x, y, w, h); };
    const diamond = (x, y, r, col) => { ctx.save(); ctx.translate(x, y); ctx.rotate(Math.PI / 4); ctx.fillStyle = col || gold(-r, r); ctx.shadowColor = "rgba(244,203,85,.8)"; ctx.shadowBlur = 8 * S; ctx.fillRect(-r, -r, r * 2, r * 2); ctx.restore(); };
    const divider = (y, half) => {                                       // خط ذهبي بماسة في النص، بيتلاشى للأطراف
      y *= S;
      for (const d of [-1, 1]) {
        const x0 = cx + d * 26 * S, x1 = cx + d * half * S, lg = ctx.createLinearGradient(x0, 0, x1, 0);
        lg.addColorStop(0, "rgba(244,203,85,.95)"); lg.addColorStop(1, "rgba(244,203,85,0)");
        ctx.fillStyle = lg; ctx.fillRect(Math.min(x0, x1), y - 1.2 * S, Math.abs(x1 - x0), 2.4 * S);
      }
      diamond(cx, y, 6 * S);
    };
    const ring = (x, y, r) => {                                          // حلقة ذهبية بتوهج حوالين اللوجو
      ctx.save(); ctx.shadowColor = "rgba(244,203,85,.75)"; ctx.shadowBlur = 26 * S;
      ctx.lineWidth = 7 * S; const g = ctx.createLinearGradient(x - r, y - r, x + r, y + r); g.addColorStop(0, "#fff8cf"); g.addColorStop(.3, "#e0a929"); g.addColorStop(.55, "#fff1a6"); g.addColorStop(.8, "#a06a0b"); g.addColorStop(1, "#f9d65f");
      ctx.strokeStyle = g; ctx.beginPath(); ctx.arc(x, y, r, 0, 6.283); ctx.stroke(); ctx.restore();
      ctx.lineWidth = 1.5 * S; ctx.strokeStyle = "rgba(244,203,85,.5)"; ctx.beginPath(); ctx.arc(x, y, r + 13 * S, 0, 6.283); ctx.stroke();
    };
    // لوحة زجاجية داكنة بإطار ذهبي مزدوج: تفصل المحتوى عن زحمة الخلفية
    const px = 118 * S, py = 128 * S, pw = 742 * S, ph = 990 * S;
    ctx.save(); ctx.shadowColor = "rgba(0,0,0,.6)"; ctx.shadowBlur = 40 * S; rr(px, py, pw, ph, 44 * S);
    const pg = ctx.createLinearGradient(0, py, 0, py + ph); pg.addColorStop(0, "rgba(6,22,70,.62)"); pg.addColorStop(.5, "rgba(3,12,44,.74)"); pg.addColorStop(1, "rgba(2,8,30,.8)"); ctx.fillStyle = pg; ctx.fill(); ctx.restore();
    ctx.save(); ctx.shadowColor = "rgba(255,200,70,.85)"; ctx.shadowBlur = 30 * S; rr(px, py, pw, ph, 44 * S); ctx.lineWidth = 4.5 * S; ctx.strokeStyle = goldH(px, px + pw); ctx.stroke(); ctx.restore();
    rr(px + 14 * S, py + 14 * S, pw - 28 * S, ph - 28 * S, 32 * S); ctx.lineWidth = 1.6 * S; ctx.strokeStyle = "rgba(244,203,85,.55)"; ctx.stroke();
    [[px, py], [px + pw, py], [px, py + ph], [px + pw, py + ph]].forEach(([x, y]) => diamond(x, y, 7 * S));
    ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.direction = "rtl";
    // 1) لوجو البطولة في حلقة
    if (champ) { ctx.save(); ctx.beginPath(); ctx.arc(cx, 271 * S, 86 * S, 0, 6.283); ctx.clip(); ctx.drawImage(champ, cx - 86 * S, 185 * S, 172 * S, 172 * S); ctx.restore(); }
    ring(cx, 271 * S, 92 * S);
    // 2) اسم البطولة + فاصل
    const title = "بطولة أساسيات البارا تايكوندو 2026";
    try { await document.fonts.load('700 40px "Reem Kufi"'); } catch (e) { /* خط افتراضي */ }
    if ("wordSpacing" in ctx) ctx.wordSpacing = `${12 * S}px`;
    let tsz = 50 * S; const tf = s => `700 ${s}px "Reem Kufi", Cairo, sans-serif`;
    ctx.font = tf(tsz); while (ctx.measureText(title).width > pw * .86 && tsz > 24 * S) { tsz -= 2; ctx.font = tf(tsz); }
    const tgd = ctx.createLinearGradient(0, 404 * S, 0, 452 * S); tgd.addColorStop(0, "#fff0a8"); tgd.addColorStop(.42, "#ffcf3f"); tgd.addColorStop(.7, "#e29a12"); tgd.addColorStop(1, "#ffd96a");
    ctx.save(); ctx.lineJoin = "round"; ctx.lineWidth = 7 * S; ctx.strokeStyle = "rgba(35,16,0,.95)"; ctx.strokeText(title, cx, 428 * S);
    ctx.shadowColor = "rgba(255,190,60,.55)"; ctx.shadowBlur = 16 * S; ctx.fillStyle = tgd; ctx.fillText(title, cx, 428 * S); ctx.restore();
    if ("wordSpacing" in ctx) ctx.wordSpacing = `${8 * S}px`;
    divider(490, 250);
    // 4) الاسم بذهبي لامع
    fitText(ctx, p.name, pw * .8, 64 * S, 800);
    ctx.fillStyle = gold(524 * S, 598 * S); ctx.shadowColor = "rgba(0,0,0,.85)"; ctx.shadowBlur = 10 * S; ctx.shadowOffsetY = 3 * S; ctx.fillText(p.name, cx, 562 * S); ctx.shadowBlur = 0; ctx.shadowOffsetY = 0;
    if ("wordSpacing" in ctx) ctx.wordSpacing = "0px";
    divider(634, 250);
    // 5) لوجو كابتن تايكوندو: أشعة ذهبية + توهج + أغصان غار + حلقة
    const my = 898 * S, mr = 125 * S;
    ctx.save(); rr(px + 16 * S, py + 16 * S, pw - 32 * S, ph - 32 * S, 30 * S); ctx.clip();
    for (let i = 0; i < 28; i++) {                                         // أشعة تخرج من اللوجو
      const a0 = i / 28 * 6.283, a1 = a0 + .085, R = 340 * S, rg2 = ctx.createRadialGradient(cx, my, mr, cx, my, R);
      rg2.addColorStop(0, "rgba(255,206,70,.55)"); rg2.addColorStop(.6, "rgba(255,190,50,.16)"); rg2.addColorStop(1, "rgba(255,190,50,0)");
      ctx.fillStyle = rg2; ctx.beginPath(); ctx.moveTo(cx, my); ctx.lineTo(cx + Math.cos(a0) * R, my + Math.sin(a0) * R); ctx.lineTo(cx + Math.cos(a1) * R, my + Math.sin(a1) * R); ctx.closePath(); ctx.fill();
    }
    const gl = ctx.createRadialGradient(cx, my, mr * .8, cx, my, mr * 2.1); gl.addColorStop(0, "rgba(255,236,170,.95)"); gl.addColorStop(.42, "rgba(255,206,80,.38)"); gl.addColorStop(1, "rgba(244,203,85,0)");
    ctx.fillStyle = gl; ctx.fillRect(px, my - mr * 2.2, pw, mr * 4.4);
    ctx.restore();
    const leaf = (x, y, ang, len) => {                                     // ورقة غار ذهبية
      ctx.save(); ctx.translate(x, y); ctx.rotate(ang); ctx.beginPath(); ctx.moveTo(0, 0);
      ctx.bezierCurveTo(len * .3, -len * .34, len * .78, -len * .3, len, 0); ctx.bezierCurveTo(len * .78, len * .3, len * .3, len * .34, 0, 0); ctx.closePath();
      const lg = ctx.createLinearGradient(0, -len * .3, 0, len * .3); lg.addColorStop(0, "#fff6c9"); lg.addColorStop(.5, "#f4cb55"); lg.addColorStop(1, "#a06a0b");
      ctx.fillStyle = lg; ctx.shadowColor = "rgba(0,0,0,.6)"; ctx.shadowBlur = 5 * S; ctx.fill(); ctx.lineWidth = 1.2 * S; ctx.strokeStyle = "rgba(90,55,5,.9)"; ctx.stroke(); ctx.restore();
    };
    for (const s of [-1, 1]) for (let i = 0; i < 8; i++) {                 // غصنا غار متناظران حوالين الحلقة
      const phi = .62 + i * .27, R = mr + 36 * S;
      const x = cx + s * R * Math.sin(phi), y = my + R * Math.cos(phi);
      const tang = Math.atan2(-R * Math.sin(phi), s * R * Math.cos(phi));    // اتجاه المماس لفوق
      leaf(x, y, tang + s * .62, 46 * S - i * 1.2 * S);
      leaf(x, y, tang - s * .55, 34 * S - i * .9 * S);
    }
    if (cap) {
      ctx.save(); ctx.beginPath(); ctx.arc(cx, my, mr, 0, 6.283); ctx.clip(); ctx.drawImage(cap, cx - mr, my - mr, mr * 2, mr * 2);
      ctx.globalCompositeOperation = "screen";                                 // يرفع الأسود لأزرق ملكي مضيء فيبان اللوجو منوّر
      const lift = ctx.createRadialGradient(cx, my - mr * .3, 0, cx, my, mr); lift.addColorStop(0, "rgba(70,120,255,.55)"); lift.addColorStop(1, "rgba(20,50,170,.28)");
      ctx.fillStyle = lift; ctx.fillRect(cx - mr, my - mr, mr * 2, mr * 2); ctx.restore();
    }
    ring(cx, my, mr + 7 * S); ring(cx, my, mr + 7 * S);
    // 6) اسم كابتن تايكوندو: أكبر وأوضح، بحد غامق وتدرّج ذهبي ولمعة وخطين بماسة
    const ty = 696 * S;
    ctx.direction = "ltr"; ctx.font = `900 ${46 * S}px Cairo, sans-serif`; if ("letterSpacing" in ctx) ctx.letterSpacing = `${6 * S}px`;
    const txt = "CAPTAIN TAEKWONDO", tw = ctx.measureText(txt).width;
    const tg = ctx.createLinearGradient(0, ty - 26 * S, 0, ty + 26 * S); tg.addColorStop(0, "#fffbe0"); tg.addColorStop(.38, "#ffd75e"); tg.addColorStop(.62, "#e0a020"); tg.addColorStop(1, "#ffe9a0");
    ctx.save(); ctx.lineJoin = "round"; ctx.lineWidth = 6 * S; ctx.strokeStyle = "rgba(40,20,0,.95)"; ctx.strokeText(txt, cx + 3 * S, ty);
    ctx.shadowColor = "rgba(255,200,70,.7)"; ctx.shadowBlur = 14 * S; ctx.fillStyle = tg; ctx.fillText(txt, cx + 3 * S, ty); ctx.restore();
    if ("letterSpacing" in ctx) ctx.letterSpacing = "0px";
    for (const d of [-1, 1]) {
      const x0 = cx + d * (tw / 2 + 30 * S), x1 = cx + d * (tw / 2 + 120 * S), lg = ctx.createLinearGradient(x0, 0, x1, 0);
      lg.addColorStop(0, "rgba(255,214,90,1)"); lg.addColorStop(1, "rgba(244,203,85,0)"); ctx.fillStyle = lg; ctx.fillRect(Math.min(x0, x1), ty - 1.8 * S, Math.abs(x1 - x0), 3.6 * S);
      diamond(cx + d * (tw / 2 + 20 * S), ty, 4.5 * S);
    }
    glintFx(ctx, W, H, false);
    return cv;
  }
  function pdfFromJpegs(pages) {                           // PDF: صفحة لكل صورة JPEG ({bytes,w,h})
    const enc = new TextEncoder(), parts = [], off = []; let len = 0;
    const push = d => { const u = typeof d === "string" ? enc.encode(d) : d; parts.push(u); len += u.length; };
    const N = pages.length, total = 2 + N * 3;
    push("%PDF-1.4\n");
    const obj = (n, body) => { off[n] = len; push(`${n} 0 obj\n`); body(); push("\nendobj\n"); };
    obj(1, () => push("<< /Type /Catalog /Pages 2 0 R >>"));
    obj(2, () => push(`<< /Type /Pages /Kids [${pages.map((_, i) => `${3 + i * 3} 0 R`).join(" ")}] /Count ${N} >>`));
    pages.forEach((pg, i) => {
      const pn = 3 + i * 3, im = pn + 1, ct = pn + 2, pw = (pg.w * .75).toFixed(2), ph = (pg.h * .75).toFixed(2);
      obj(pn, () => push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pw} ${ph}] /Resources << /XObject << /Im0 ${im} 0 R >> >> /Contents ${ct} 0 R >>`));
      obj(im, () => { push(`<< /Type /XObject /Subtype /Image /Width ${pg.w} /Height ${pg.h} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${pg.bytes.length} >>\nstream\n`); push(pg.bytes); push("\nendstream"); });
      const cs = `q ${pw} 0 0 ${ph} 0 0 cm /Im0 Do Q`;
      obj(ct, () => push(`<< /Length ${cs.length} >>\nstream\n${cs}\nendstream`));
    });
    const x = len; push(`xref\n0 ${total + 1}\n0000000000 65535 f \n`);
    for (let i = 1; i <= total; i++) push(String(off[i]).padStart(10, "0") + " 00000 n \n");
    push(`trailer\n<< /Size ${total + 1} /Root 1 0 R >>\nstartxref\n${x}\n%%EOF`);
    const out = new Uint8Array(len); let o = 0; parts.forEach(u => { out.set(u, o); o += u.length; });
    return new Blob([out], { type: "application/pdf" });
  }
  const blobOf = (cv, type, q) => new Promise(res => cv.toBlob(res, type, q));
  const wait = ms => new Promise(r => setTimeout(r, ms));
  async function makeFile(it, fmt) {
    const btns = document.querySelectorAll(`.jc[data-k="${items.indexOf(it)}"] [data-fmt]`);
    btns.forEach(b => b.disabled = true);
    try {
      const name = fname(it);
      if (fmt === "png") {                                  // صورتان: الوجه ثم الظهر
        save(await blobOf(await drawCard(it), "image/png"), name + "-front.png"); await wait(450);
        save(await blobOf(await drawBack(it), "image/png"), name + "-back.png");
      } else {
        const front = await drawCard(it, "#02060f"), back = await drawBack(it, "#02060f");
        if (fmt === "jpg") {
          save(await blobOf(front, "image/jpeg", .95), name + "-front.jpg"); await wait(450);
          save(await blobOf(back, "image/jpeg", .95), name + "-back.jpg");
        } else {
          const pages = [front, back].map(cv => {
            const bin = atob(cv.toDataURL("image/jpeg", .95).split(",")[1]), u = new Uint8Array(bin.length);
            for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i);
            return { bytes: u, w: cv.width, h: cv.height };
          });
          save(pdfFromJpegs(pages), name + ".pdf");
        }
      }
    } catch (e) { alert(window.I18N && I18N.lang === "en" ? "Could not create the file. Please try again." : "تعذّر إنشاء الملف، جرّب مرة أخرى."); }
    finally { setTimeout(() => btns.forEach(b => b.disabled = false), 900); }
  }


  /* ---------- خلفية الصفحة: غبار ذهبي عائم وفقاعات ضوء ---------- */
  (function bg() {
    const cv = $("#jfx"); if (!cv) return;
    const page = cv.parentElement, ctx = cv.getContext("2d"), reduce = LITE || matchMedia("(prefers-reduced-motion:reduce)").matches;
    let W = 0, H = 0, P = [], B = [], raf = 0, last = 0, onScreen = true;
    const rnd = (a, b) => a + Math.random() * (b - a);
    /* سبرايتات جاهزة مرة واحدة بدل gradient وshadowBlur في كل فريم */
    const mk = (n, fn) => { const c = document.createElement("canvas"); c.width = c.height = n; fn(c.getContext("2d"), n / 2); return c; };
    const bub = mk(64, (g, r) => { const q = g.createRadialGradient(r, r, 0, r, r, r); q.addColorStop(0, "rgba(255,226,130,1)"); q.addColorStop(1, "rgba(255,226,130,0)"); g.fillStyle = q; g.fillRect(0, 0, r * 2, r * 2); });
    const dot = (col) => mk(32, (g, r) => { const q = g.createRadialGradient(r, r, 0, r, r, r); q.addColorStop(0, col); q.addColorStop(.3, col); q.addColorStop(1, "rgba(255,212,92,0)"); g.fillStyle = q; g.fillRect(0, 0, r * 2, r * 2); });
    const dA = dot("#fff4bd"), dB = dot("#f4cb55");
    function size() {
      W = page.clientWidth; H = page.clientHeight;
      cv.width = W; cv.height = H;
      const n = Math.min(45, Math.round(W * H / 30000));
      P = Array.from({ length: n }, () => ({ x: rnd(0, W), y: rnd(0, H), r: rnd(.7, 2.4), v: rnd(.12, .42), ph: rnd(0, 6.28), s: rnd(.8, 2) }));
      B = Array.from({ length: Math.round(n / 4) }, () => ({ x: rnd(0, W), y: rnd(0, H), r: rnd(12, 36), v: rnd(.08, .24), ph: rnd(0, 6.28), a: rnd(.1, .22) }));
    }
    function frame(t) {
      raf = 0;
      if (!reduce && (!onScreen || document.hidden)) return;
      if (!reduce && t - last < 33) { raf = requestAnimationFrame(frame); return; }  /* ~30fps */
      last = t;
      ctx.clearRect(0, 0, W, H);
      const top = Math.max(0, scrollY - page.offsetTop - 80), bot = top + innerHeight + 160;
      B.forEach(b => {
        b.y -= b.v; if (b.y < -30) { b.y = H + 30; b.x = rnd(0, W); }
        if (b.y < top - 40 || b.y > bot + 40) return;
        ctx.globalAlpha = b.a * 4.2 > 1 ? 1 : b.a * 4.2; const d = b.r * 2; ctx.drawImage(bub, b.x - b.r, b.y - b.r, d, d);
      });
      P.forEach(p => {
        p.y -= p.v; p.x += Math.sin(t / 1800 * p.s + p.ph) * .12; if (p.y < -6) { p.y = H + 6; p.x = rnd(0, W); }
        if (p.y < top || p.y > bot) return;
        ctx.globalAlpha = .25 + .65 * (.5 + .5 * Math.sin(t / 700 * p.s + p.ph));
        const d = p.r * 5; ctx.drawImage(p.r > 1.7 ? dA : dB, p.x - d / 2, p.y - d / 2, d, d);
      });
      ctx.globalAlpha = 1;
      if (!reduce) raf = requestAnimationFrame(frame);
    }
    function go() { if (!raf && !reduce && onScreen && !document.hidden) raf = requestAnimationFrame(frame); }
    size(); frame(0);
    if (window.ResizeObserver) { let rt = 0; new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(() => { size(); if (reduce) frame(0); }, 150); }).observe(page); }
    if (window.IntersectionObserver) new IntersectionObserver(e => { onScreen = e[0].isIntersecting; go(); }).observe(page);
    document.addEventListener("visibilitychange", go);
    go();
  })();

  const btn = $("#langBtn");
  function lb() {
    if (!btn || !window.I18N) return;
    btn.textContent = I18N.lang === "en" ? "عربي" : "English";
  }
  if (btn && window.I18N) {
    btn.addEventListener("click", () => { I18N.setLang(I18N.lang === "en" ? "ar" : "en"); lb(); });
    I18N.setLang(I18N.lang, true); lb();
  }
})();

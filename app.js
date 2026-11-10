/* =====================================================================
   سلوك الموقع. لا حاجة لتعديله لإضافة الروابط والصور: استخدم config.js
   ===================================================================== */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const C = (typeof CONFIG !== "undefined" ? CONFIG : {});
  const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
  const fine = matchMedia("(pointer:fine)").matches;
  const esc = s => String(s ?? "").replace(/[&<>"']/g, m => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m]));
  const T = s => (window.I18N ? I18N.t(s) : s);
  const ytId = u => { const m = (u || "").match(/(?:youtu\.be\/|v=|shorts\/|embed\/|live\/)([\w-]{11})/); return m && m[1]; };

  /* ---------- النافذة المنبثقة ---------- */
  const vm = $("#vm"), vmv = $("#vmv"), vmt = $("#vmt"), mx = $(".mx", vm);
  let lastFocus = null;
  /* التحكم في مستوى الصوت (مشغّل Shorts المضمَّن فيه كتم/تشغيل فقط) عبر YouTube IFrame API بالرسائل */
  const vvol = document.createElement("div");
  vvol.className = "vvol"; vvol.hidden = true;
  vvol.innerHTML = '<button type="button" data-d="-10" aria-label="خفض الصوت">🔉</button>' +
    '<input type="range" min="0" max="100" step="5" value="100" aria-label="مستوى الصوت">' +
    '<button type="button" data-d="10" aria-label="رفع الصوت">🔊</button><output>100%</output>';
  vmv.after(vvol);
  const volIn = $("input", vvol), volOut = $("output", vvol);
  const ytCmd = (func, args) => { const f = $("iframe", vmv); if (f && f.contentWindow) f.contentWindow.postMessage(JSON.stringify({ event: "command", func, args: args || [] }), "*"); };
  const setVol = v => { v = Math.max(0, Math.min(100, +v)); volIn.value = v; volOut.textContent = v + "%"; if (v > 0) ytCmd("unMute"); ytCmd("setVolume", [v]); if (v === 0) ytCmd("mute"); };
  volIn.addEventListener("input", () => setVol(volIn.value));
  $$("button", vvol).forEach(b => b.addEventListener("click", () => setVol(+volIn.value + +b.dataset.d)));
  function openModal(title, node, auto) {
    lastFocus = document.activeElement;
    vmt.textContent = title;
    vmv.className = "mv" + (auto === true ? " auto" : auto === "tall" ? " tall" : "");
    vmv.replaceChildren(node);
    const isYt = node.tagName === "IFRAME" && /youtube/.test(node.src);
    vvol.hidden = !isYt;
    if (isYt) { volIn.value = 100; volOut.textContent = "100%"; node.addEventListener("load", () => { node.contentWindow.postMessage(JSON.stringify({ event: "listening" }), "*"); }); }
    vm.hidden = false;
    if (window.I18N) I18N.apply(vm);
    document.body.style.overflow = "hidden";
    mx.focus();
  }
  function closeModal() {
    vm.hidden = true;
    vmv.replaceChildren();
    document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  mx.addEventListener("click", closeModal);
  vm.addEventListener("click", e => { if (e.target === vm) closeModal(); });
  addEventListener("keydown", e => {
    if (vm.hidden) return;
    if (e.key === "Escape") closeModal();
    if (e.key === "Tab") { // إبقاء التركيز داخل النافذة
      const f = [mx, ...$$("iframe", vm), ...(vvol.hidden ? [] : $$("button, input", vvol))];
      const i = f.indexOf(document.activeElement);
      e.preventDefault();
      f[(i + (e.shiftKey ? f.length - 1 : 1)) % f.length].focus();
    }
  });

  /* ---------- الفيديوهات ---------- */
  const vgrid = $("#vgrid");
  (C.videos || []).forEach(v => {
    const id = ytId(v.url);
    const c = document.createElement("article");
    c.className = "card vcard";
    c.innerHTML = `<div class="belts">${(v.colors || []).map(col => `<div class="bl${col === "#0b0b0f" ? " k" : ""}" style="background:${esc(col)}"></div>`).join("")}</div>` +
      `<h3>${esc(v.title)}</h3><p class="sub">${esc(v.belts)}</p>`;
    const b = document.createElement("button");
    b.type = "button"; b.className = "player";
    b.setAttribute("aria-label", "شاهد الفيديو: " + v.title);
    if (id) { b.dataset.thumb = "1"; b.style.backgroundImage = `url(https://i.ytimg.com/vi/${id}/hqdefault.jpg)`; }
    b.innerHTML = '<span class="play"></span><span class="watch">شاهد الفيديو</span>';
    b.addEventListener("click", () => {
      let node;
      if (id) {
        node = document.createElement("iframe");
        node.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0&enablejsapi=1&origin=${encodeURIComponent(location.origin)}`;
        node.title = v.title;
        node.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
        node.allowFullscreen = true;
      } else {
        node = document.createElement("div");
        node.className = "soon";
        node.innerHTML = "<span>سيتم رفع الفيديو قريبًا</span><small>سيظهر هنا فيديو شرح حركات هذا المستوى</small>";
      }
      openModal(v.title + " — " + v.belts, node, id && /shorts\//.test(v.url) ? "tall" : false);   // فيديو Shorts طولي
    });
    c.append(b);
    vgrid.append(c);
  });

  /* ---------- الروابط والـQR ---------- */
  $$("[data-link]").forEach(a => {
    const u = (C.links || {})[a.dataset.link];
    if (u) {
      a.href = u; a.target = "_blank"; a.rel = "noopener noreferrer"; a.hidden = false;
    } else if (a.dataset.link === "whatsapp") {
      a.hidden = true;
    } else if (a.id === "regBtn") {
      a.classList.add("pending"); a.removeAttribute("href"); a.setAttribute("aria-disabled", "true"); a.tabIndex = -1;
      a.textContent = "الرابط يُضاف قريبًا";
    } else {
      a.textContent = "خطوات التسجيل"; // رابط التسجيل غير متاح بعد: نقود للقسم
    }
  });
  const setQr = (sel, src, alt) => { const el = $(sel); if (el && src) el.innerHTML = `<img src="${esc(src)}" alt="${esc(alt)}" loading="lazy">`; };
  setQr("#regQr", (C.qr || {}).registration, "رمز QR للتسجيل");
  setQr("#waQr", (C.qr || {}).whatsapp, "رمز QR للانضمام إلى جروب الواتساب");

  /* ---------- نافذة تفاصيل المنظم ---------- */
  const dm = $("#detModal"), dmBox = $(".mbox", dm);
  let dmFrom = null;
  const dmClose = () => { dm.hidden = true; document.body.style.overflow = ""; if (dmFrom) dmFrom.focus(); };
  function openDetails(p, avEl) {
    const en = I18N.lang === "en" && p.details && p.details.en ? p.details.en : null;
    const d = en || p.details || {};
    const bio = (d.bio || "").split(/\n+/).filter(Boolean), facts = d.facts || [];
    $("#detAv").innerHTML = avEl ? avEl.outerHTML : "";
    $("#detName").textContent = T(p.name); $("#detRole").textContent = T(p.role);
    $("#detBody").innerHTML = (bio.length || facts.length)
      ? bio.map(t => `<p>${esc(t)}</p>`).join("") + (facts.length ? `<ul class="facts">${facts.map(f => `<li><span>${esc(f)}</span></li>`).join("")}</ul>` : "")
        + (d.tags || (p.details && p.details.tags) ? `<p class="dtags" dir="ltr">${(d.tags || p.details.tags).split("|").map(t => `<bdi>${esc(t.trim())}</bdi>`).join(" | ")}</p>` : "")
      : `<p class="soon">${esc(T("تُضاف التفاصيل قريبًا."))}</p>`;
    const num = p.phone || "", tel = num.replace(/[^\d+]/g, ""), wa = tel.replace("+", "");
    $("#detActs").innerHTML = num ? `<a class="btn sm" href="tel:${esc(tel)}"><svg aria-hidden="true"><use href="#i-ph"/></svg>${esc(T("اتصال"))}</a><a class="btn sm wa" href="https://wa.me/${esc(wa)}" target="_blank" rel="noopener noreferrer"><svg aria-hidden="true"><use href="#i-wa"/></svg>${esc(T("واتساب"))}</a>` : "";
    dmFrom = document.activeElement; dm.hidden = false; document.body.style.overflow = "hidden"; dmBox.scrollTop = 0;
    $(".mx", dm).focus();
  }
  $(".mx", dm).addEventListener("click", dmClose);
  dm.addEventListener("click", e => { if (e.target === dm) dmClose(); });
  addEventListener("keydown", e => { if (e.key === "Escape" && !dm.hidden) dmClose(); });

  /* ---------- المنظمون ---------- */
  const teamGrid = $("#teamGrid");
  (C.team || []).forEach(p => {
    const num = p.phone || "", tel = num.replace(/[^\d+]/g, ""), wa = tel.replace("+", "");
    const el = document.createElement("article");
    el.className = "card tc";
    let av;
    if (p.photo) av = `<div class="av"><img src="${esc(p.photo)}" alt="صورة ${esc(p.name)}" loading="lazy"></div>`;
    else if (p.logo) av = `<div class="av logo${p.darkLogo ? " dark" : ""}"><img src="${esc(p.logo)}" alt="شعار ${esc(p.name)}" loading="lazy"></div>`;
    else av = `<div class="av" role="img" aria-label="مكان صورة ${esc(p.name)}"><span class="ini foil">${esc(p.initial || (p.name || "؟")[0])}</span></div>`;
    el.innerHTML = av + `<h3>${esc(p.name)}</h3><span class="role">${esc(p.role)}</span><p class="about">${esc(p.about)}</p>` +
      (num ? `<div class="num">${esc(num)}</div><div class="acts">` +
        `<a class="btn sm" href="tel:${esc(tel)}"><svg aria-hidden="true"><use href="#i-ph"/></svg>اتصال</a>` +
        `<a class="btn sm wa" href="https://wa.me/${esc(wa)}" target="_blank" rel="noopener noreferrer"><svg aria-hidden="true"><use href="#i-wa"/></svg>واتساب</a></div>` : "") +
      `<button type="button" class="btn fill sm det-btn">عرض التفاصيل</button>`;
    el.querySelector(".det-btn").addEventListener("click", () => openDetails(p, el.querySelector(".av")));
    teamGrid.append(el);
  });
  const sp = C.sponsor || {};
  const slot = document.createElement("article");
  slot.className = "card tc" + (sp.name ? "" : " slot");
  slot.innerHTML = (sp.logo ? `<div class="av logo"><img src="${esc(sp.logo)}" alt="شعار ${esc(sp.name)}" loading="lazy"></div>` : `<div class="av" aria-hidden="true"><span class="ini foil">★</span></div>`) +
    `<h3>${sp.name ? esc(sp.name) : "الراعي الرسمي للبطولة"}</h3><span class="role">الراعي الرسمي</span>` +
    (sp.name ? (C.links && C.links.sponsor ? `<a class="btn sm" href="${esc(C.links.sponsor)}" target="_blank" rel="noopener noreferrer">زيارة الراعي</a>` : "")
      : `<p class="about">يُضاف الاسم بعد الاعتماد الرسمي<span class="tag">قيد الاعتماد</span></p>`);
  teamGrid.append(slot);

  /* ---------- المواعيد ---------- */
  const D = C.dates || {};
  $("#tl").innerHTML = [["announce", "الإعلان الرسمي"], ["open", "فتح التسجيل"], ["deadline", "آخر موعد للتسجيل"],
    ["videos", "موعد إرسال الفيديوهات"], ["judging", "موعد التحكيم"], ["results", "موعد إعلان النتائج"]]
    .map(([k, l]) => `<li class="${D[k] ? "done" : ""}"><span class="k">${l}</span><span class="v">${D[k] ? esc(D[k]) : "يُعلن لاحقًا"}</span></li>`).join("");

  /* ---------- الشهادة وبطاقة المدرب ---------- */
  if (C.certificate) $("#cert").innerHTML = `<img src="${esc(C.certificate)}" alt="شهادة التقدير لكل الأبطال المشاركين" loading="lazy">`;
  if (C.supportCert) $("#cert2").innerHTML = `<img src="${esc(C.supportCert)}" alt="شهادة دعم أصحاب الهمم" loading="lazy">`;
  if (C.coachCard) { const cc = $("#cc"); cc.style.padding = "0"; cc.innerHTML = `<img class="ccbg" src="${esc(C.coachCard)}" alt="" aria-hidden="true" loading="lazy"><img class="ccfg" src="${esc(C.coachCard)}" alt="بطاقة المدرب" loading="lazy">`
    cc.setAttribute("role", "button"); cc.tabIndex = 0; cc.style.cursor = "zoom-in"; cc.setAttribute("aria-label", "تكبير بطاقة المدرب");
    const openLb = () => {
      if (document.getElementById("ccLb")) return;
      const lb = document.createElement("div"); lb.id = "ccLb"; lb.setAttribute("role", "dialog"); lb.setAttribute("aria-modal", "true");
      lb.innerHTML = `<img src="${esc(C.coachCard)}" alt="بطاقة المدرب"><button type="button" aria-label="إغلاق">✕</button>`;
      const close = () => { lb.remove(); document.removeEventListener("keydown", onKey); cc.focus(); };
      const onKey = (e) => { if (e.key === "Escape") close(); };
      lb.addEventListener("click", close); document.addEventListener("keydown", onKey); document.body.appendChild(lb);
    };
    cc.addEventListener("click", openLb); cc.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); openLb(); } }); }

  /* ---------- الدائرة البيانية للتقييم ---------- */
  const donut = $("#donut");
  const segs = [[7, "#f4cb55"], [1, "#ff5a66"], [1, "#4f86ff"], [1, "#eef2fb"]];
  const R = 80, CIRC = 2 * Math.PI * R, GAP = 3;
  let cum = 0;
  const arcs = segs.map(([v, c]) => { const a = { len: v / 10 * CIRC - GAP, off: -cum / 10 * CIRC, c }; cum += v; return a; });
  donut.innerHTML = `<svg viewBox="0 0 200 200" aria-hidden="true"><circle class="bgc" cx="100" cy="100" r="${R}"/>` +
    arcs.map(a => `<circle cx="100" cy="100" r="${R}" stroke="${a.c}" stroke-dasharray="${reduce ? a.len : 0} ${CIRC}" stroke-dashoffset="${a.off}"/>`).join("") +
    `</svg><div class="mid"><b class="foil">10</b><span>الدرجة النهائية</span></div>`;
  const drawDonut = () => $$("circle:not(.bgc)", donut).forEach((c, i) => {
    c.style.transitionDelay = i * 0.18 + "s";
    c.setAttribute("stroke-dasharray", `${arcs[i].len} ${CIRC}`);
  });

  /* ---------- ظهور العناصر عند التمرير ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.classList.add("in");
    if (e.target === donut) drawDonut();
    io.unobserve(e.target);
  }), { threshold: .3 });
  $$(".orn").forEach(o => io.observe(o));
  io.observe(donut);

  /* ---------- شريط التنقل والتقدم ---------- */
  const links = $$("#links a"), ul = $("#links");
  const menuBtn = $("#menuBtn");
  const menuSet = on => { ul.classList.toggle("open", on); menuBtn.setAttribute("aria-expanded", String(on)); };
  menuBtn.addEventListener("click", e => { e.stopPropagation(); menuSet(!ul.classList.contains("open")); });
  ul.addEventListener("click", e => { if (e.target.closest("a")) menuSet(false); });
  document.addEventListener("click", e => { if (!e.target.closest("#nav")) menuSet(false); });
  addEventListener("keydown", e => { if (e.key === "Escape") menuSet(false); });
  addEventListener("resize", () => { if (innerWidth > 1120) menuSet(false); });
  const so = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    links.forEach(l => {
      const on = l.getAttribute("href") === "#" + e.target.id;
      l.classList.toggle("on", on);
      if (on && ul.scrollWidth > ul.clientWidth) l.scrollIntoView({ inline: "center", block: "nearest", behavior: reduce ? "auto" : "smooth" });
    });
  }), { rootMargin: "-45% 0px -50% 0px" });
  links.forEach(l => { const s = $(l.getAttribute("href")); if (s) so.observe(s); });
  let scrT; addEventListener("scroll", () => { document.documentElement.classList.add("scrolling"); clearTimeout(scrT); scrT = setTimeout(() => document.documentElement.classList.remove("scrolling"), 180); }, { passive: true });
  const prog = $("#prog"); let tick = false;
  addEventListener("scroll", () => {
    if (tick) return; tick = true;
    requestAnimationFrame(() => {
      const h = document.documentElement;
      prog.style.transform = `scaleX(${h.scrollTop / ((h.scrollHeight - h.clientHeight) || 1)})`;
      tick = false;
    });
  }, { passive: true });

  /* ---------- الواجهة: الجمل، الغبار الذهبي، الضوء المتتبع ---------- */
  const hero = $(".hero");
  new IntersectionObserver(([e]) => hero.classList.toggle("off", !e.isIntersecting)).observe(hero);
  const Q = ["«الأبطال لا يعرفون حدودًا»", "«إرادتكم هي أقوى من أي تحدٍّ»", "«أنتم أبطال الإصرار والتحدي»", "«أنا بطل»"], qe = $("#quote");
  let qi = 0;
  if (!reduce) setInterval(() => {
    if (hero.classList.contains("off")) return;
    qe.style.opacity = 0;
    setTimeout(() => { qi = (qi + 1) % Q.length; qe.textContent = T(Q[qi]); qe.style.opacity = 1; }, 450);
  }, 4500);
  if (!reduce && fine) {
    let raf = 0;
    hero.addEventListener("pointermove", ev => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const r = hero.getBoundingClientRect();
        hero.style.setProperty("--mx", (ev.clientX - r.left) / r.width * 100 + "%");
        hero.style.setProperty("--my", (ev.clientY - r.top) / r.height * 100 + "%");
      });
    }, { passive: true });
  }

  (() => {
    if (reduce) return;
    const c = $("#dust"), x = c.getContext("2d");
    const dpr = Math.min(devicePixelRatio || 1, 2);
    let w, h, P = [], on = true, t = 0, rt;
    const seed = () => {
      w = c.clientWidth; h = c.clientHeight; c.width = w * dpr; c.height = h * dpr;
      x.setTransform(dpr, 0, 0, dpr, 0, 0);
      P = Array.from({ length: Math.min(70, Math.round(w / 16)) }, () => ({ x: Math.random() * w, y: Math.random() * h, r: Math.random() * 1.6 + .4, v: Math.random() * .35 + .08, p: Math.random() * 6.28, g: Math.random() < .7 }));
    };
    seed();
    addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(seed, 200); });
    new IntersectionObserver(([e]) => { on = e.isIntersecting; }).observe(c);
    (function f() {
      if (on && !document.hidden) {
        t += .02; x.clearRect(0, 0, w, h);
        for (const s of P) {
          s.y -= s.v; s.x += Math.sin(t + s.p) * .15;
          if (s.y < -5) { s.y = h + 5; s.x = Math.random() * w; }
          x.globalAlpha = .25 + .75 * Math.abs(Math.sin(t * 1.3 + s.p));
          x.fillStyle = s.g ? "#f4cb55" : "#9cc0ff";
          x.beginPath(); x.arc(s.x, s.y, s.r, 0, 6.283); x.fill();
        }
      }
      requestAnimationFrame(f);
    })();
  })();

  /* ---------- الملصق ثلاثي الأبعاد + تكبير الصور ---------- */
  const poster = $("#poster");
  if (!reduce) {
    const pReset = () => { poster.style.transform = ""; poster.classList.remove("shine"); };
    poster.addEventListener("pointerdown", e => { if (e.pointerType !== "mouse") poster.classList.add("shine"); });
    ["pointerup", "pointercancel"].forEach(t => poster.addEventListener(t, e => { if (e.pointerType !== "mouse") setTimeout(pReset, 350); }));
    poster.addEventListener("pointermove", e => {
      const r = poster.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      poster.style.transform = `rotateY(${x * -14}deg) rotateX(${y * 10}deg)`;
    });
    poster.addEventListener("pointerleave", pReset);
  }
  const ccEl = $("#cc");
  if (ccEl && !reduce) {
    const ccReset = () => { ccEl.style.transform = ""; ccEl.classList.remove("shine"); };
    ccEl.addEventListener("pointerdown", e => { if (e.pointerType !== "mouse") ccEl.classList.add("shine"); });
    ["pointerup", "pointercancel"].forEach(t => ccEl.addEventListener(t, e => { if (e.pointerType !== "mouse") setTimeout(ccReset, 350); }));
    ccEl.addEventListener("pointermove", e => {
      const r = ccEl.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - .5, y = (e.clientY - r.top) / r.height - .5;
      ccEl.style.transform = `perspective(1100px) rotateY(${x * -14}deg) rotateX(${y * 10}deg)`;
    });
    ccEl.addEventListener("pointerleave", ccReset);
  }
  const zoomImg = (src, alt, title) => () => { const im = new Image(); im.src = src; im.alt = alt; openModal(title, im, true); };
  poster.addEventListener("click", zoomImg("assets/poster.webp", "ملصق بطولة أساسيات البارا تايكوندو 2026", "ملصق البطولة"));
  const guideSrc = () => (window.I18N && I18N.lang === "en" ? "assets/filming-guide-en.webp" : "assets/filming-guide.webp");
  $("#guideZoom").addEventListener("click", () => zoomImg(guideSrc(), "تعليمات تصوير فيديو المشاركة", "تعليمات تصوير فيديو المشاركة")());

  /* ---------- قائمة جاهزية التصوير ---------- */
  const tips = $$(".tip"), bar = $("#readyBar"), txt = $("#readyTxt"), rd = $("#ready");
  const refresh = () => {
    const n = tips.filter(t => t.getAttribute("aria-checked") === "true").length;
    bar.style.width = n / tips.length * 100 + "%";
    rd.classList.toggle("done", n === tips.length);
    txt.textContent = n === tips.length ? T("كل شيء جاهز! ابدأ التصوير الآن") : (I18N.lang === "en" ? `${n} of ${tips.length} steps ready` : `${n} من ${tips.length} خطوات جاهزة`);
  };
  tips.forEach(t => t.addEventListener("click", () => { t.setAttribute("aria-checked", t.getAttribute("aria-checked") !== "true"); refresh(); }));

  /* ---------- شهادة المدرب ---------- */
  if (C.coachCert) $("#certCoach").innerHTML = `<img src="${esc(C.coachCert)}" alt="شهادة المدرب" loading="lazy">`;

  /* ---------- استطلاع الدعم (يُرسل عبر واتساب) ---------- */
  const supToggle = $("#supToggle"), supModal = $("#supModal");
  const supClose = () => { supModal.hidden = true; document.body.style.overflow = ""; supToggle.setAttribute("aria-expanded", "false"); supToggle.focus(); };
  supToggle.addEventListener("click", () => {
    supModal.hidden = false; document.body.style.overflow = "hidden";
    supToggle.setAttribute("aria-expanded", "true");
    supModal.querySelector(".mbox").scrollTop = 0;
    setTimeout(() => $("#supName").focus({ preventScroll: true }), 120);
  });
  $(".mx", supModal).addEventListener("click", supClose);
  supModal.addEventListener("click", e => { if (e.target === supModal) supClose(); });
  addEventListener("keydown", e => { if (e.key === "Escape" && !supModal.hidden) supClose(); });
  const supWays = $("#supWays"), supName = $("#supName"), supOrg = $("#supOrg"), supNote = $("#supNote"), supSend = $("#supSend"), supHint = $("#supHint");
  (C.supportWays || []).forEach(w => {
    const li = document.createElement("li");
    li.innerHTML = `<button type="button" class="tip" role="checkbox" aria-checked="false"><span class="ck"></span><div><b>${esc(w)}</b></div></button>`;
    supWays.append(li);
  });
  const waDigits = String(C.supportWhatsapp || "").replace(/\D/g, "");
  const chosen = () => $$(".tip", supWays).filter(b => b.getAttribute("aria-checked") === "true").map(b => $("b", b).textContent);
  function supUpdate() {
    const picks = chosen(), name = supName.value.trim();
    const ok = !!name && picks.length > 0 && !!waDigits;
    const L = [T("مرحبًا، أودّ دعم بطولة أساسيات البارا تايكوندو 2026."), "", `${T("الاسم:")} ${name}`];
    if (supOrg.value.trim()) L.push(`${T("الدولة أو الجهة:")} ${supOrg.value.trim()}`);
    L.push("", T("طرق الدعم التي اخترتها:"), ...picks.map((p, i) => `${i + 1}. ${p}`));
    if (supNote.value.trim()) L.push("", `${T("ملاحظات:")} ${supNote.value.trim()}`);
    L.push("", T("أرجو التواصل معي لإصدار شهادة دعم أصحاب الهمم."));
    supSend.href = ok ? `https://wa.me/${waDigits}?text=${encodeURIComponent(L.join("\n"))}` : "#";
    supSend.setAttribute("aria-disabled", ok ? "false" : "true");
    supHint.textContent = T(ok ? "جاهز! اضغط الزر لفتح واتساب برسالة جاهزة." : "اكتب اسمك واختر طريقة واحدة على الأقل.");
  }
  supWays.addEventListener("click", e => {
    const b = e.target.closest(".tip"); if (!b) return;
    b.setAttribute("aria-checked", b.getAttribute("aria-checked") !== "true"); supUpdate();
  });
  [supName, supOrg, supNote].forEach(el => el.addEventListener("input", supUpdate));
  supSend.addEventListener("click", e => { if (supSend.getAttribute("aria-disabled") === "true") e.preventDefault(); });
  document.addEventListener("langchange", () => setTimeout(supUpdate, 0));
  supUpdate();

  /* ---------- اللغة (عربي / English) ---------- */
  const langBtn = $("#langBtn");
  const syncLang = () => {
    langBtn.textContent = I18N.lang === "en" ? "عربي" : "English";
    langBtn.setAttribute("aria-label", I18N.lang === "en" ? "التبديل إلى العربية" : "Switch to English");
    langBtn.lang = I18N.lang === "en" ? "ar" : "en";
    qe.textContent = T(Q[qi]);
    const gi = $("#guideZoom img"); if (gi) gi.src = guideSrc();
    $$("a[data-en]").forEach(l => { l.href = I18N.lang === "en" ? l.dataset.en : l.dataset.ar; });
    refresh();
  };
  langBtn.addEventListener("click", () => I18N.setLang(I18N.lang === "en" ? "ar" : "en"));
  document.addEventListener("langchange", syncLang);
  I18N.setLang(I18N.lang, true);
  syncLang();

  /* ---------- مشاركة الموقع ---------- */
  const shp = $("#sharePop"), grid = $("#shGrid"), spx = $(".mx", shp);
  const ic = {
    wa: '<svg viewBox="0 0 24 24"><use href="#i-wa"/></svg>',
    cp: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M16 1H4a2 2 0 0 0-2 2v14h2V3h12V1zm3 4H8a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2zm0 16H8V7h11v14z"/></svg>',
    sh: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M18 16.1c-.8 0-1.5.3-2 .8l-7.1-4.2c.1-.2.1-.5.1-.7s0-.5-.1-.7L16 7.2c.5.5 1.2.8 2 .8 1.7 0 3-1.3 3-3s-1.3-3-3-3-3 1.3-3 3c0 .2 0 .5.1.7L8 9.8C7.5 9.3 6.8 9 6 9c-1.7 0-3 1.3-3 3s1.3 3 3 3c.8 0 1.5-.3 2-.8l7.1 4.2c-.1.2-.1.4-.1.6 0 1.6 1.3 2.9 2.9 2.9s2.9-1.3 2.9-2.9-1.2-2.9-2.8-2.9z"/></svg>',
    fb: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M22 12a10 10 0 1 0-11.6 9.9v-7H7.9V12h2.5V9.800c0-2.500 1.500-3.900 3.800-3.900 1.100 0 2.200.2 2.200.2v2.500h-1.300c-1.200 0-1.600.8-1.600 1.600V12h2.800l-.4 2.900h-2.300v7A10 10 0 0 0 22 12z"/></svg>',
    x: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M18.2 2.2h3.300l-7.200 8.300 8.500 11.300h-6.700l-5.200-6.800-6 6.800H1.600l7.700-8.800L1.200 2.200H8l4.700 6.200 5.500-6.200zm-1.200 17.600h1.800L7 4.100H5.100l11.900 15.700z"/></svg>',
    tg: '<svg viewBox="0 0 24 24"><path fill="currentColor" d="M21.900 4.300 2.900 11.600c-1.300.5-1.300 1.300-.2 1.600l4.800 1.500 1.900 5.800c.2.600.4.800.9.800s.7-.2 1-.5l2.300-2.200 4.800 3.500c.9.500 1.500.2 1.700-.8L22.900 5.800c.3-1.300-.5-1.900-1-1.500zM8.600 14l9.700-6.100c.5-.3.9-.1.5.2l-8.100 7.300-.3 3.500L8.600 14z"/></svg>'
  };
  const pageUrl = () => (C.siteUrl || location.href.split("#")[0]);
  const msg = () => T("بطولة أساسيات البارا تايكوندو 2026: مبادرة رياضية مجانية عبر الإنترنت. شاهد الفيديوهات الإرشادية وسجّل مشاركتك.");
  function buildShare() {
    const u = encodeURIComponent(pageUrl()), m = encodeURIComponent(msg());
    const items = [
      ["wa", "واتساب ", "https://wa.me/?text=" + m + "%20" + u],
      ["fb", "فيسبوك", "https://www.facebook.com/sharer/sharer.php?u=" + u],
      ["x", "إكس (تويتر)", "https://twitter.com/intent/tweet?text=" + m + "&url=" + u],
      ["tg", "تيليجرام", "https://t.me/share/url?url=" + u + "&text=" + m]
    ];
    grid.innerHTML = items.map(([k, l, href]) => `<a class="shb" href="${esc(href)}" target="_blank" rel="noopener noreferrer">${ic[k]}<span>${l}</span></a>`).join("") +
      (navigator.share ? `<button type="button" class="shb wide" data-native>${ic.sh}<span>مشاركة عبر الجهاز</span></button>` : "") +
      `<button type="button" class="shb wide" data-copy>${ic.cp}<span>نسخ الرابط</span></button><div class="shnote" id="shNote" aria-live="polite"></div>`;
    I18N.apply(grid);
    const note = $("#shNote");
    const copy = $("[data-copy]", grid);
    copy.addEventListener("click", async () => {
      try { await navigator.clipboard.writeText(pageUrl()); note.textContent = T("تم نسخ الرابط"); }
      catch (e) { note.textContent = T("تعذّر النسخ، انسخ الرابط من شريط العنوان"); }
    });
    const nat = $("[data-native]", grid);
    if (nat) nat.addEventListener("click", () => navigator.share({ title: document.title, text: msg(), url: pageUrl() }).catch(() => {}));
  }
  let shFocus = null;
  const closeShare = () => { shp.hidden = true; document.body.style.overflow = ""; if (shFocus && shFocus.focus) shFocus.focus(); };
  $$("[data-share]").forEach(b => b.addEventListener("click", () => {
    shFocus = b; buildShare(); shp.hidden = false; document.body.style.overflow = "hidden"; spx.focus();
  }));
  spx.addEventListener("click", closeShare);
  shp.addEventListener("click", e => { if (e.target === shp) closeShare(); });
  addEventListener("keydown", e => { if (e.key === "Escape" && !shp.hidden) closeShare(); });

  /* ---------- نتائج البطولة (من نظام التحكيم: تظهر فقط بعد أن ينشرها رئيس الحكام) ---------- */
  (async () => {
    if (!C.judgingApi) return;
    let r;
    try {
      const res = await fetch(C.judgingApi, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify({ action: "publicResults" }) });
      r = await res.json();
    } catch (e) { return; }
    if (!r || !r.ok || !r.published || !Array.isArray(r.rows) || !r.rows.length) return;
    const box = $("#resBox"), sec = $("#results");
    if (!box || !sec) return;
    const groups = new Map();
    r.rows.forEach(x => {
      const k = [x.section, x.groupName, x.classCode].join("|");
      if (!groups.has(k)) groups.set(k, { x, rows: [] });
      groups.get(k).rows.push(x);
    });
    box.innerHTML = [...groups.values()].map(g => {
      const sub = [g.x.groupName, g.x.classCode].filter(Boolean).map(esc).join(" · ");
      const rows = g.rows.map(x => {
        const n = /^\d+$/.test(String(x.place)) ? +x.place : 0;
        return `<tr><td class="pl"><span class="pl"><b class="${n === 2 ? "p2" : n === 3 ? "p3" : ""}">${esc(x.place)}</b></span></td><td>${esc(x.name)}</td>` +
          (x.band ? `<td class="bd">${esc(x.band)}</td>` : "<td></td>") +
          (r.showScore && x.total !== undefined ? `<td class="sc">${Number(x.total).toFixed(2)}</td>` : "") + "</tr>";
      }).join("");
      return `<article class="res-card"><h3>${esc(g.x.section)}${sub ? `<small>${sub}</small>` : ""}</h3><table class="rtable"><tbody>${rows}</tbody></table></article>`;
    }).join("");
    sec.hidden = false;
    const link = $("#resLink"); if (link) link.hidden = false;
    const cert = $("#resCert"); if (cert) cert.hidden = !r.certificatesOpen;
    if (window.I18N) I18N.apply(sec);
  })();
})();

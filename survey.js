/* استبيان المدربين — صفحة المشاركة (عربي/إنجليزي) */
(() => {
  "use strict";
  const D = SURVEY_DATA;
  const API = (typeof SURVEY_CONFIG !== "undefined" && SURVEY_CONFIG.api) || "";
  const Q = D.questions, NQ = Q.length;
  const DRAFT = "pta_survey_draft_" + D.version, DONE = "pta_survey_done_" + D.version;
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;

  const UI = {
    ar: {
      brand: "أساسيات البارا تايكوندو 2026", back: "العودة للموقع", langBtn: "English", langAria: "Switch to English",
      kicker: "استبيان المدربين الرسمي", title: "بطولة الأساسيات العربية للبارا تايكوندو 2026",
      chips: ["١٠ أسئلة قصيرة", "نحو ٣ دقائق", "رأيك يصنع الفرق"], start: "ابدأ الاستبيان",
      qOf: (n, t) => `السؤال ${n} من ${t}`, contactStep: "بيانات التواصل", next: "التالي", prev: "السابق", submit: "إرسال الاستبيان", sending: "جارٍ الإرسال…",
      need: "اختر إجابة للمتابعة.", needMulti: "اختر إجابة واحدة على الأقل للمتابعة.", optional: "اختياري",
      progress: (n, t) => `${n} من ${t}`, contactPrivacy: "بياناتك تُحفظ منفصلة عن إجاباتك، ولا يطّلع عليها إلا المسؤولون المخوّلون.",
      consentNeed: "أضف موافقتك على استخدام البيانات للتواصل لإتمام الإرسال.", nameNeed: "اكتب اسم المدرب (حرفان على الأقل).", dialNeed: "اختر رمز الدولة لرقم الهاتف.", phoneBad: "رقم الهاتف غير صحيح.", dialPick: "رمز الدولة", orbitAria: "اضغط لتغيير اتجاه وسرعة دوران لوجو كابتن تايكوندو", emailBad: "البريد الإلكتروني غير صحيح.",
      errNet: "تعذّر الإرسال. تحقق من اتصالك ثم أعد المحاولة، إجاباتك محفوظة على جهازك.", errGeneric: "حدث خطأ أثناء الحفظ. أعد المحاولة بعد قليل.",
      demo: "وضع المعاينة: لم يُربط الحفظ بعد، لذلك لن تُسجَّل الإجابات.",
      doneTitle: "تم استلام مشاركتك", home: "العودة إلى موقع البطولة", again: "مدرب آخر على هذا الجهاز؟ ابدأ مشاركة جديدة",
      share: "شارك الاستبيان مع مدرب", copied: "تم نسخ الرابط", shareTxt: "شاركنا رأيك في بطولة الأساسيات العربية للبارا تايكوندو 2026",
      textPh: "اكتب هنا…", chars: "حرف"
    },
    en: {
      brand: "Para Taekwondo Basics 2026", back: "Back to website", langBtn: "العربية", langAria: "التبديل إلى العربية",
      kicker: "Official Coaches Survey", title: "Arab Para Taekwondo Basics Championship 2026",
      chips: ["10 short questions", "About 3 minutes", "Your opinion matters"], start: "Start the survey",
      qOf: (n, t) => `Question ${n} of ${t}`, contactStep: "Contact details", next: "Next", prev: "Back", submit: "Submit survey", sending: "Sending…",
      need: "Choose an answer to continue.", needMulti: "Choose at least one answer to continue.", optional: "Optional",
      progress: (n, t) => `${n} of ${t}`, contactPrivacy: "Your details are stored separately from your answers and are visible only to authorized administrators.",
      consentNeed: "Please confirm your consent to use these details for contact so we can submit.", nameNeed: "Please enter the coach name (at least 2 characters).", dialNeed: "Please choose the country code for the phone number.", phoneBad: "The phone number is not valid.", dialPick: "Country code", orbitAria: "Press to change the direction and speed of the Captain Taekwondo logo orbit", emailBad: "The email address is not valid.",
      errNet: "Could not send. Check your connection and try again; your answers are saved on this device.", errGeneric: "Something went wrong while saving. Please try again shortly.",
      demo: "Preview mode: saving is not connected yet, so answers will not be recorded.",
      doneTitle: "Your response has been received", home: "Back to the championship website", again: "Another coach on this device? Start a new response",
      share: "Share the survey with a coach", copied: "Link copied", shareTxt: "Share your opinion on the Arab Para Taekwondo Basics Championship 2026",
      textPh: "Type here…", chars: "chars"
    }
  };

  /* ---------- الحالة ---------- */
  let lang = "ar";
  try { const l = localStorage.getItem("lang"); if (l === "en" || l === "ar") lang = l; } catch (e) {}
  const rid = () => {
    const a = new Uint8Array(12), c = window.crypto || window.msCrypto;
    if (c && c.getRandomValues) c.getRandomValues(a); else for (let i = 0; i < 12; i++) a[i] = Math.floor(Math.random() * 256);
    return Array.from(a, b => ("0" + b.toString(16)).slice(-2)).join("");
  };
  const newC = () => ({ name: "", email: "", phone: "", dial: "", code: "", consent: false });
  let S = { step: 0, a: {}, c: newC(), rid: rid(), t0: 0, sending: false, err: "", done: false, dir: 1 };
  try { const d = JSON.parse(localStorage.getItem(DRAFT) || "null"); if (d && d.a) { S.a = d.a; S.c = Object.assign(S.c, d.c || {}); S.step = Math.min(d.step || 0, NQ + 1); S.rid = d.rid || S.rid; } } catch (e) {}
  try { if (localStorage.getItem(DONE)) S.done = true; } catch (e) {}
  const save = () => { try { localStorage.setItem(DRAFT, JSON.stringify({ a: S.a, c: { name: S.c.name, email: S.c.email, phone: S.c.phone, dial: S.c.dial, code: S.c.code }, step: S.step, rid: S.rid })); } catch (e) {} };
  const T = () => UI[lang];
  const L = o => (o && o[lang]) || (o && o.ar) || "";

  /* ---------- أدوات DOM ---------- */
  const h = (tag, attrs, ...kids) => {
    const el = document.createElement(tag);
    for (const k in (attrs || {})) {
      const v = attrs[k];
      if (v === false || v == null) continue;
      if (k === "class") el.className = v;
      else if (k === "text") el.textContent = v;
      else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
      else if (v === true) el.setAttribute(k, "");
      else el.setAttribute(k, v);
    }
    kids.flat().forEach(c => { if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(c)); });
    return el;
  };
  const stage = document.getElementById("stage");

  /* ---------- منطق الأسئلة ---------- */
  const q = i => Q[i - 1];
  const wantsContact = () => true;   // خطوة الاسم والتواصل تظهر لكل مدرب (الاسم مطلوب، والبريد والهاتف اختياريان)
  const totalSteps = () => NQ + (wantsContact() ? 1 : 0);
  const isLastStep = () => (S.step === NQ && !wantsContact()) || S.step === NQ + 1;
  const answered = qq => qq.type === "multi" ? (S.a[qq.id] || []).length > 0 : !!S.a[qq.id];
  const answeredCount = () => Q.filter(answered).length;

  function setLangUI() {
    const html = document.documentElement;
    html.lang = lang; html.dir = lang === "en" ? "ltr" : "rtl";
    document.body.dir = html.dir;
    document.title = lang === "en" ? "Coaches Survey — Arab Para Taekwondo Basics Championship 2026" : "استبيان المدربين — بطولة الأساسيات العربية للبارا تايكوندو 2026";
    const b = document.getElementById("langBtn");
    b.textContent = T().langBtn; b.setAttribute("aria-label", T().langAria); b.lang = lang === "en" ? "ar" : "en";
    document.getElementById("brandTxt").textContent = T().brand;
    document.getElementById("backLnk").textContent = T().back;
    const demo = document.getElementById("demoBanner");
    demo.hidden = !!API; demo.textContent = T().demo;
  }

  /* ---------- العرض ---------- */
  function render(focus) {
    setLangUI();
    stage.textContent = "";
    let root;
    if (S.done) root = viewDone();
    else if (S.step === 0) root = viewIntro();
    else if (S.step <= NQ) root = viewQuestion(S.step);
    else root = viewContact();
    root.classList.add(S.dir < 0 ? "back" : "fwd");
    stage.append(root);
    if (focus) {
      const f = stage.querySelector("[data-focus]");
      if (f) { f.setAttribute("tabindex", "-1"); f.focus({ preventScroll: true }); }
      window.scrollTo({ top: 0, left: 0, behavior: reduce ? "auto" : "smooth" });
    }
  }

  function logo() {
    const t = T();
    return h("div", { class: "logo3d" },
      h("i", { class: "ring", "aria-hidden": "true" }),
      h("div", { class: "planet", role: "button", tabindex: "0", "aria-label": t.orbitAria, title: t.orbitAria },
        h("img", { class: "svlogo", src: "assets/champion-lite.webp", srcset: "assets/champion-lite.webp 240w, assets/champion.webp 560w", sizes: "150px", alt: "", width: 150, height: 150, decoding: "async", draggable: "false" }),
        h("i", { class: "lit", "aria-hidden": "true" })),
      h("div", { class: "moon", "aria-hidden": "true" }, h("i", { class: "rays" }), h("i", { class: "glow" }),
        h("img", { src: "assets/captain-orbit.webp", alt: "", width: 48, height: 48, decoding: "async", draggable: "false" })));
  }

  function viewIntro() {
    const t = T();
    return h("article", { class: "card intro" },
      logo(),
      h("p", { class: "kicker", text: t.kicker }),
      h("h1", { class: "foil", "data-focus": true, text: t.title }),
      h("div", { class: "orn" }, h("i"), h("b"), h("i")),
      h("div", { class: "introtxt" }, D.intro[lang].map((p, i) => h("p", { class: i === 0 ? "salute" : (i === D.intro[lang].length - 1 ? "closing" : "") , text: p }))),
      h("ul", { class: "chips" }, t.chips.map(c => h("li", { text: c }))),
      h("div", { class: "acts" }, h("button", { class: "btn fill big", type: "button", text: t.start, onclick: () => { if (S.step === 0) S.t0 = Date.now(); goto(S.step > 0 ? S.step : 1); } })));
  }

  function progressBar() {
    const t = T(), tot = totalSteps();
    const pct = Math.round((answeredCount() / NQ) * 100);
    return h("div", { class: "prog" },
      h("div", { class: "progtop" }, h("span", { text: t.qOf(Math.min(S.step, NQ), NQ) }), h("span", { class: "pct", text: pct + "%" })),
      h("div", { class: "bar", role: "progressbar", "aria-valuemin": 0, "aria-valuemax": 100, "aria-valuenow": pct, "aria-label": t.progress(answeredCount(), NQ) }, h("i", { style: `width:${pct}%` })),
      h("ol", { class: "dots", "aria-hidden": "true" }, Array.from({ length: tot }, (_, i) => h("li", { class: (i + 1 === S.step ? "cur " : "") + (i < NQ && answered(Q[i]) ? "ok" : "") }))));
  }

  function viewQuestion(n) {
    const t = T(), qq = q(n), multi = qq.type === "multi";
    const name = qq.id;
    const err = h("p", { class: "err", role: "alert", hidden: true });
    const next = h("button", { class: "btn fill", type: "button", onclick: onNext });
    const extras = h("div", { class: "extras" });

    const opts = h("div", { class: "opts", role: multi ? "group" : "radiogroup", "aria-labelledby": "qt" + n }, qq.options.map((o, oi) => {
      const inp = h("input", { type: multi ? "checkbox" : "radio", name, value: o.k });
      inp.checked = multi ? (S.a[name] || []).includes(o.k) : S.a[name] === o.k;
      inp.addEventListener("change", () => onPick(qq, o, inp));
      return h("label", { class: "opt" + (inp.checked ? " on" : ""), style: "--i:" + oi }, inp, h("span", { class: "mark", "aria-hidden": "true" }), h("span", { class: "otxt", text: L(o) }));
    }));

    function syncExtras() {
      extras.textContent = "";
      const tx = qq.text;
      if (!tx) return;
      const sel = S.a[name];
      const show = tx.showForOther ? (S.a[name] || []).includes(qq.options.find(o => o.other).k)
        : tx.showFor ? tx.showFor.includes(sel) : !!sel;
      if (!show) return;
      const ta = h("textarea", { id: "x_" + tx.id, rows: 3, maxlength: tx.max, placeholder: t.textPh, "aria-labelledby": "xl_" + tx.id });
      ta.value = S.a[tx.id] || "";
      ta.addEventListener("input", () => { S.a[tx.id] = ta.value; save(); });
      extras.append(h("div", { class: "xfld" },
        h("label", { id: "xl_" + tx.id, for: "x_" + tx.id }, L(tx), h("em", { text: " (" + t.optional + ")" })), ta));
    }
    function syncNext() {
      const ok = answered(qq);
      next.textContent = isLastStep() ? (S.sending ? t.sending : t.submit) : t.next;
      next.disabled = S.sending;
      next.setAttribute("aria-disabled", ok ? "false" : "true");
      next.classList.toggle("dim", !ok);
    }
    function onPick(qd, o, inp) {
      if (multi) {
        let arr = (S.a[name] || []).slice();
        const all = qd.options.find(x => x.all).k;
        const set = (k, on) => { arr = arr.filter(x => x !== k); if (on) arr.push(k); };
        if (o.all) { arr = inp.checked ? qd.options.map(x => x.k).filter(k => k !== qd.options.find(x => x.other).k || arr.includes(k)) : []; if (inp.checked && !arr.includes(all)) arr.push(all); }
        else { set(o.k, inp.checked); if (!inp.checked) arr = arr.filter(x => x !== all); }
        S.a[name] = arr;
        opts.querySelectorAll("input").forEach(i => { i.checked = arr.includes(i.value); i.closest("label").classList.toggle("on", i.checked); });
      } else {
        S.a[name] = o.k;
        opts.querySelectorAll("label").forEach(l => l.classList.toggle("on", l.querySelector("input").checked));
      }
      err.hidden = true; save(); syncExtras(); syncNext(); refreshProgress();
    }
    function onNext() {
      if (!answered(qq)) { err.textContent = multi ? t.needMulti : t.need; err.hidden = false; opts.querySelector("input").focus(); return; }
      if (isLastStep()) return submit();
      goto(S.step + 1);
    }
    const progHolder = h("div", { class: "proghold" });
    function refreshProgress() { progHolder.textContent = ""; progHolder.append(progressBar()); }
    refreshProgress(); syncExtras(); syncNext();

    return h("article", { class: "card qcard" }, progHolder,
      h("p", { class: "qtag" }, h("b", { text: String(n) }), h("span", { text: L(qq.tag) })),
      qq.lead ? h("p", { class: "qlead", text: L(qq.lead) }) : null,
      h("h2", { id: "qt" + n, "data-focus": true, text: L(qq) }),
      qq.hint ? h("p", { class: "hint", text: L(qq.hint) }) : null,
      opts, extras, err, S.err ? h("p", { class: "err big", role: "alert", text: S.err }) : null,
      h("div", { class: "nav2" },
        h("button", { class: "btn", type: "button", text: t.prev, onclick: () => goto(S.step - 1) }), next));
  }

  const phoneDigits = () => (S.c.phone || "").replace(/\D/g, "").replace(/^0+/, "");
  const fullPhone = () => { const d = phoneDigits(); return d ? "(+" + (S.c.dial || "") + ") " + d : ""; };

  function viewContact() {
    const t = T(), C = D.contact;
    const err = h("p", { class: "err big", role: "alert", hidden: !S.err, text: S.err });
    const inputs = {};
    const fail = (m, el) => { err.textContent = m; err.hidden = false; if (el) el.focus(); };
    const flds = C.fields.map(f => {
      const inp = h("input", { id: "c_" + f.id, type: f.type, autocomplete: f.ac, maxlength: f.id === "email" ? 120 : 80, dir: f.id === "name" ? "auto" : "ltr", placeholder: f.ph || "", required: !!f.required });
      if (f.type === "tel") { inp.setAttribute("inputmode", "tel"); inp.maxLength = 18; }
      if (f.type === "email") inp.setAttribute("inputmode", "email");
      inp.value = S.c[f.id] || "";
      inp.addEventListener("input", () => { S.c[f.id] = inp.value; save(); });
      inputs[f.id] = inp;
      const lab = h("label", { for: "c_" + f.id }, L(f), f.required ? h("b", { class: "req", text: " *" }) : h("em", { text: " (" + t.optional + ")" }));
      if (!f.dial) return h("div", { class: "fld", style: "--i:" + C.fields.indexOf(f) }, lab, inp);
      const sel = h("select", { id: "c_dial", "aria-label": t.dialPick, autocomplete: "tel-country-code" }, h("option", { value: "", text: t.dialPick }),
        C.dials.map(d => h("option", { value: d[2], text: "+" + d[2] + "  " + (lang === "en" ? d[1] : d[0]) })));
      sel.value = S.c.dial || "";
      sel.addEventListener("change", () => { S.c.dial = sel.value; save(); });
      inputs.dial = sel;
      return h("div", { class: "fld", style: "--i:" + C.fields.indexOf(f) }, lab, h("div", { class: "phonewrap" }, sel, inp));
    });
    const consent = h("input", { type: "checkbox", id: "c_consent" });
    consent.checked = !!S.c.consent;
    consent.addEventListener("change", () => { S.c.consent = consent.checked; });
    const btn = h("button", { class: "btn fill", type: "button", text: S.sending ? t.sending : t.submit, disabled: S.sending, onclick: () => {
      if ((S.c.name || "").trim().length < 2) return fail(t.nameNeed, inputs.name);
      if ((S.c.email || "").trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(S.c.email.trim())) return fail(t.emailBad, inputs.email);
      if (phoneDigits()) {
        if (!S.c.dial) return fail(t.dialNeed, inputs.dial);
        if (phoneDigits().length < 5 || phoneDigits().length > 13) return fail(t.phoneBad, inputs.phone);
      }
      if (!S.c.consent) return fail(t.consentNeed, consent);
      submit();
    } });
    return h("article", { class: "card qcard" },
      h("div", { class: "proghold" }, progressBar()),
      h("p", { class: "qtag" }, h("b", { text: "✉" }), h("span", { text: t.contactStep })),
      h("h2", { "data-focus": true, text: L(C.title) }),
      h("p", { class: "hint", text: L(C.lead) }),
      h("div", { class: "cfields" }, flds),
      h("label", { class: "consent" }, consent, h("span", { text: L(C.consent) })),
      h("p", { class: "privacy", text: t.contactPrivacy }),
      err,
      h("div", { class: "nav2" }, h("button", { class: "btn", type: "button", text: t.prev, onclick: () => goto(NQ) }), btn));
  }

  function viewDone() {
    const t = T();
    const share = h("button", { class: "btn", type: "button", text: t.share, onclick: async () => {
      const url = location.href.split("#")[0].split("?")[0];
      try { if (navigator.share) { await navigator.share({ title: document.title, text: t.shareTxt, url }); return; } } catch (e) { return; }
      try { await navigator.clipboard.writeText(url); share.textContent = t.copied; setTimeout(() => (share.textContent = t.share), 2200); } catch (e) { prompt(url, url); }
    } });
    return h("article", { class: "card done" },
      logo(),
      h("h2", { class: "foil", "data-focus": true, text: t.doneTitle }),
      h("div", { class: "orn" }, h("i"), h("b"), h("i")),
      h("div", { class: "introtxt" }, D.thanks[lang].map((p, i) => h("p", { class: i === 0 ? "salute" : "", text: p }))),
      h("div", { class: "acts" }, h("a", { class: "btn fill", href: "index.html", text: t.home }), share),
      h("button", { class: "linkbtn", type: "button", text: t.again, onclick: () => {
        try { localStorage.removeItem(DONE); localStorage.removeItem(DRAFT); } catch (e) {}
        S = { step: 0, a: {}, c: newC(), rid: rid(), t0: 0, sending: false, err: "", done: false, dir: 1 };
        render(true);
      } }));
  }

  function goto(n) { S.dir = n >= S.step ? 1 : -1; S.step = Math.max(0, n); S.err = ""; save(); render(true); }

  /* ---------- الإرسال ---------- */
  async function post(body, ms = 30000) {
    const ctl = new AbortController(), tm = setTimeout(() => ctl.abort(), ms);
    try {
      const r = await fetch(API, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(body), signal: ctl.signal, redirect: "follow" });
      return JSON.parse(await r.text());
    } finally { clearTimeout(tm); }
  }
  async function submit() {
    if (S.sending) return;                       // منع الإرسال المزدوج
    if (!Q.every(answered)) { S.err = T().need; return render(); }
    S.sending = true; S.err = ""; render();
    const a = {};
    Q.forEach(qq => { a[qq.id] = S.a[qq.id]; if (qq.text && S.a[qq.text.id]) a[qq.text.id] = S.a[qq.text.id].trim(); });
    const contact = { name: S.c.name.trim(), email: S.c.email.trim(), phone: fullPhone(), code: S.c.code.trim(), consent: !!S.c.consent };
    let ok = false;
    if (!API) { await new Promise(r => setTimeout(r, 500)); ok = true; }       // معاينة فقط: لا يُحفظ شيء
    else {
      try {
        const body = { action: "submit", requestId: S.rid, lang, version: D.version, elapsed: Date.now() - (S.t0 || Date.now() - 60000), answers: a, contact, website: "" };
        let res = null, netFail = false;
        for (let i = 0; i < 3 && !res; i++) {                 // إنترنت بطيء: 3 محاولات بنفس معرّف الطلب (آمنة ضد التكرار)
          try { res = await post(body, 25000); netFail = false; } catch (e) { netFail = true; await new Promise(r => setTimeout(r, 1500 * (i + 1))); }
        }
        if (res && res.ok) ok = true; else S.err = netFail || !res ? T().errNet : T().errGeneric;
      } catch (e) { S.err = T().errNet; }
    }
    S.sending = false;
    if (ok) {
      S.done = true; S.err = "";
      try { if (API) localStorage.setItem(DONE, String(Date.now())); localStorage.removeItem(DRAFT); } catch (e) {}
    }
    render(true);
    if (ok && window.SurveyFX) SurveyFX.burst();
  }

  /* ---------- اللغة والبدء ---------- */
  document.getElementById("langBtn").addEventListener("click", () => {
    lang = lang === "en" ? "ar" : "en";
    try { localStorage.setItem("lang", lang); } catch (e) {}
    render(false);
  });
  render(false);
})();

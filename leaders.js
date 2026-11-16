/* صفحة القيادات العربية للبارا تايكوندو — بدون أي اعتماد خارجي (الأعلام فقط من flagcdn مع بديل نصي).
   كل النصوص تُبنى بـ textContent (لا innerHTML بالبيانات) لمنع حقن الشيفرة. */
(function () {
  "use strict";

  const UI = {
    ar: {
      brand: "أساسيات البارا تايكوندو 2026", back: "الموقع الرئيسي", langBtn: "English", langAria: "Switch to English", menu: "القائمة", close: "إغلاق", skip: "تخطَّ إلى المحتوى",
      title: "القيادات العربية للبارا تايكوندو — بطولة الأساسيات 2026", sub: "ARAB PARA TAEKWONDO LEADERS",
      nAbout: "عن المبادرة", nLeaders: "القيادات", nFeatures: "المميزات", nVision: "الرؤية",
      heroEyebrow: "بطولة أساسيات البارا تايكوندو 2026", heroT: "القيادات العربية للبارا تايكوندو",
      heroLead: "مساحة رقمية رسمية للتعريف بقيادات لجان البارا تايكوندو العربية، وإبراز جهودهم ومساهماتهم، وتعزيز التواصل والتعاون بينهم ودعم أبطالنا.",
      heroBtn1: "تصفّح القيادات", heroBtn2: "التعريف بالمبادرة",
      lEye: "الصفحة الرسمية", lT: "القيادات العربية", lSub: "قيادات لجان البارا تايكوندو المعتمدة من إدارة البطولة.",
      search: "بحث", searchPh: "ابحث بالاسم...", country: "الدولة", position: "المنصب", allC: "كل الدول", allP: "كل المناصب",
      view: "عرض الملف الشخصي", results: n => n + " قيادة", noRes: "لا توجد نتائج مطابقة", phName: "سيتم الإعلان قريبًا", phNote: "بانتظار تسجيل رئيس البارا تايكوندو في هذه الدولة.", counts: (r, p) => (r ? r + " قيادة معتمدة" : "لا قيادات معتمدة بعد") + (p ? " · " + p + " دولة بانتظار التسجيل" : ""), noResP: "جرّب تغيير كلمة البحث أو إزالة التصفية.",
      emptyT: "سيتم إضافة القيادات المعتمدة قريبًا", emptyP: "لا توجد ملفات معتمدة للعرض حاليًا. تظهر القيادات هنا بعد مراجعة بياناتها واعتمادها من إدارة البطولة.",
      aEye: "عن المبادرة", aT: "مساحة رقمية للقيادات العربية",
      aP: "نهدف إلى إنشاء مساحة رقمية رسمية للتعريف بقيادات لجان البارا تايكوندو العربية، وإبراز جهودهم ومساهماتهم، وتعزيز التواصل والتعاون بينهم، ودعم أبطال البارا تايكوندو في الوطن العربي.",
      p1T: "التعريف", p1: "ملفات تعريفية موثّقة للقيادات.", p2T: "الإبراز", p2: "إبراز الجهود والمساهمات والخبرات.", p3T: "التواصل", p3: "تعزيز التعاون بين اللجان العربية.", p4T: "الدعم", p4: "دعم أبطال البارا تايكوندو.",
      fEye: "المميزات", fT: "مميزات الصفحة",
      vEye: "الرؤية والأهداف", vT: "رؤيتنا", vSub: "مجتمع رياضي عربي أكثر ترابطًا واحترافية.",
      fName: "بطولة أساسيات البارا تايكوندو 2026", fHome: "الموقع الرسمي للبطولة", fTeam: "المنظمون", fSurvey: "استبيان المدربين", fSup: "بدعم إعلامي وتسويقي من", fCopy: "© 2026 بطولة أساسيات البارا تايكوندو. جميع الحقوق محفوظة.",
      st_leaders: "قيادة معتمدة", st_countries: "دولة مشاركة", st_positions: "منصب ولجنة",
      mBio: "نبذة تعريفية", mAch: "الخبرات والإنجازات", mContact: "التواصل", email: "البريد الإلكتروني", phone: "الهاتف", wa: "واتساب", web: "الموقع",
      features: [
        ["ملفات تعريفية احترافية", "ملف مفصّل لكل قيادة يضم الصورة والمنصب والنبذة والإنجازات."],
        ["إرسال البيانات وتحديثها", "تُرسل البيانات إلى إدارة البطولة وتُحدَّث عند الحاجة."],
        ["مراجعة واعتماد الإدارة", "لا يظهر أي ملف قبل مراجعته واعتماده من الإدارة."],
        ["عرض عام للقيادات المعتمدة", "صفحة عامة تعرض القيادات المعتمدة فقط."],
        ["دعم التواصل والتعاون العربي", "ربط القيادات العربية وتسهيل التعاون بين اللجان."],
        ["تجربة سهلة على كل الأجهزة", "تصميم متجاوب يعمل بسلاسة على الهاتف والحاسوب."]
      ],
      goals: ["توثيق الجهود العربية", "إبراز القيادات والخبرات", "تعزيز التعاون بين اللجان العربية", "دعم أبطال البارا تايكوندو", "بناء مجتمع رياضي عربي أكثر ترابطًا"]
    },
    en: {
      brand: "Para Taekwondo Basics 2026", back: "Main site", langBtn: "العربية", langAria: "التبديل إلى العربية", menu: "Menu", close: "Close", skip: "Skip to content",
      title: "Arab Para Taekwondo Leaders — Basics Championship 2026", sub: "القيادات العربية للبارا تايكوندو",
      nAbout: "About", nLeaders: "Leaders", nFeatures: "Features", nVision: "Vision",
      heroEyebrow: "Arab Para Taekwondo Basics Championship 2026", heroT: "ARAB PARA TAEKWONDO LEADERS",
      heroLead: "An official digital space introducing the leaders of Arab Para Taekwondo committees, highlighting their efforts, and strengthening cooperation to support our champions.",
      heroBtn1: "Browse leaders", heroBtn2: "About the initiative",
      lEye: "Official page", lT: "Arab Leaders", lSub: "Para Taekwondo committee leaders approved by the championship management.",
      search: "Search", searchPh: "Search by name...", country: "Country", position: "Position", allC: "All countries", allP: "All positions",
      view: "View profile", results: n => n + (n === 1 ? " leader" : " leaders"), noRes: "No matching results", phName: "To be announced", phNote: "Awaiting registration of this country's Para Taekwondo president.", counts: (r, p) => (r ? r + (r === 1 ? " approved leader" : " approved leaders") : "No approved leaders yet") + (p ? " · " + p + (p === 1 ? " country awaiting registration" : " countries awaiting registration") : ""), noResP: "Try a different search or clear the filters.",
      emptyT: "Approved leaders will be added soon", emptyP: "There are no approved profiles to show yet. Leaders appear here once their details are reviewed and approved by the championship management.",
      aEye: "About the initiative", aT: "A digital space for Arab leaders",
      aP: "We aim to create an official digital space introducing the leaders of Arab Para Taekwondo committees, highlighting their efforts and contributions, strengthening communication and cooperation among them, and supporting Para Taekwondo champions across the Arab world.",
      p1T: "Introduce", p1: "Verified profiles for each leader.", p2T: "Highlight", p2: "Showcase efforts, contributions and expertise.", p3T: "Connect", p3: "Strengthen cooperation among Arab committees.", p4T: "Support", p4: "Support Para Taekwondo champions.",
      fEye: "Features", fT: "Page features",
      vEye: "Vision & goals", vT: "Our vision", vSub: "A more connected and professional Arab sports community.",
      fName: "Arab Para Taekwondo Basics Championship 2026", fHome: "Official championship site", fTeam: "Organizers", fSurvey: "Coaches survey", fSup: "Media & marketing support by", fCopy: "© 2026 Para Taekwondo Basics Championship. All rights reserved.",
      st_leaders: "Approved leaders", st_countries: "Participating countries", st_positions: "Positions & committees",
      mBio: "Biography", mAch: "Experience & achievements", mContact: "Contact", email: "Email", phone: "Phone", wa: "WhatsApp", web: "Website",
      features: [
        ["Professional profiles", "A detailed profile for each leader: photo, position, bio and achievements."],
        ["Submit and update data", "Details are sent to the championship management and updated when needed."],
        ["Admin review & approval", "No profile appears before it is reviewed and approved."],
        ["Public view of approved leaders", "A public page showing approved leaders only."],
        ["Arab cooperation", "Connecting Arab leaders and easing cooperation between committees."],
        ["Easy on every device", "A responsive design that works smoothly on phones and computers."]
      ],
      goals: ["Documenting Arab efforts", "Highlighting leaders and expertise", "Strengthening cooperation between Arab committees", "Supporting Para Taekwondo champions", "Building a more connected Arab sports community"]
    }
  };
  const ICONS = [
    "M12 2l2.9 6 6.6.8-4.9 4.5 1.3 6.5L12 16.5 6.1 19.8l1.3-6.5L2.5 8.8 9.1 8z",
    "M12 3v12m0 0l-4-4m4 4l4-4M4 19h16",
    "M9 12l2 2 4-4M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z",
    "M12 5C6 5 2 12 2 12s4 7 10 7 10-7 10-7-4-7-10-7zm0 4a3 3 0 100 6 3 3 0 000-6z",
    "M8 11a3 3 0 100-6 3 3 0 000 6zm8 0a3 3 0 100-6 3 3 0 000 6zM2 20a6 6 0 0112 0m0 0a6 6 0 018 0",
    "M7 2h10a2 2 0 012 2v16a2 2 0 01-2 2H7a2 2 0 01-2-2V4a2 2 0 012-2zm5 16h.01"
  ];

  let lang = "ar";
  try { const l = localStorage.getItem("lang"); if (l === "en" || l === "ar") lang = l; } catch (e) {}
  const T = () => UI[lang];
  const $ = s => document.querySelector(s);
  const NS = "http://www.w3.org/2000/svg";

  function h(tag, attrs, kids) {
    const e = document.createElement(tag);
    for (const k in (attrs || {})) {
      const v = attrs[k];
      if (v == null || v === false) continue;
      if (k === "text") e.textContent = v; else if (k === "class") e.className = v; else e.setAttribute(k, v);
    }
    (kids || []).forEach(c => c && e.appendChild(typeof c === "string" ? document.createTextNode(c) : c));
    return e;
  }
  function svgPath(d) { const s = document.createElementNS(NS, "svg"); s.setAttribute("viewBox", "0 0 24 24"); s.setAttribute("aria-hidden", "true"); const p = document.createElementNS(NS, "path"); p.setAttribute("d", d); s.appendChild(p); return s; }

  /* ---------- البيانات ---------- */
  const isLocal = /^(localhost|127\.0\.0\.1|\[::1\]|)$/.test(location.hostname);
  const DEMO = isLocal && /[?&]demo=1\b/.test(location.search);
  function demoData() { /* بيانات شكلية للمعاينة المحلية فقط — لا تظهر على الموقع المنشور */
    const mk = (i, c, ca, ce) => ({ id: "demo" + i, approved: true, nameAr: "قيادة تجريبية " + i, nameEn: "Demo Leader " + i, countryCode: c, countryAr: ca, countryEn: ce, positionAr: i % 2 ? "رئيس اللجنة" : "عضو اللجنة", positionEn: i % 2 ? "Committee Chair" : "Committee Member", bioAr: "بيانات معاينة شكلية لاختبار التصميم فقط.\nليست بيانات حقيقية.", bioEn: "Placeholder preview data for design testing only.\nNot real data.", achievements: { ar: ["إنجاز تجريبي"], en: ["Sample achievement"] }, contact: i === 1 ? { email: "demo@example.com" } : {} });
    return [mk(1, "eg", "مصر", "Egypt"), mk(2, "ps", "فلسطين", "Palestine"), mk(3, "tn", "تونس", "Tunisia"), mk(4, "sa", "السعودية", "Saudi Arabia"), mk(5, "jo", "الأردن", "Jordan")];
  }
  const raw = (window.LEADERS_DATA && Array.isArray(window.LEADERS_DATA.leaders)) ? window.LEADERS_DATA.leaders : [];
  const staticReal = raw.filter(x => x && x.approved === true && x.nameAr);

  /* ---- بطاقة افتراضية لرئيس البارا في كل دولة عربية (تُستبدل عند النشر من صفحة الإدارة) ---- */
  const COUNTRIES = [["jo", "الأردن", "Jordan"], ["ae", "الإمارات", "UAE"], ["bh", "البحرين", "Bahrain"], ["tn", "تونس", "Tunisia"], ["dz", "الجزائر", "Algeria"], ["dj", "جيبوتي", "Djibouti"], ["sa", "السعودية", "Saudi Arabia"], ["sd", "السودان", "Sudan"], ["sy", "سوريا", "Syria"], ["so", "الصومال", "Somalia"], ["iq", "العراق", "Iraq"], ["om", "عُمان", "Oman"], ["ps", "فلسطين", "Palestine"], ["qa", "قطر", "Qatar"], ["km", "جزر القمر", "Comoros"], ["kw", "الكويت", "Kuwait"], ["lb", "لبنان", "Lebanon"], ["ly", "ليبيا", "Libya"], ["eg", "مصر", "Egypt"], ["ma", "المغرب", "Morocco"], ["mr", "موريتانيا", "Mauritania"], ["ye", "اليمن", "Yemen"]];
  const ORDER = COUNTRIES.map(c => c[0]);
  const PH = COUNTRIES.map(c => ({ id: "ph-" + c[0], placeholder: true, approved: true, nameAr: "سيتم الإعلان قريبًا", nameEn: "To be announced", countryCode: c[0], countryAr: c[1], countryEn: c[2], positionAr: "رئيس البارا تايكوندو", positionEn: "President of Para Taekwondo" }));

  const API = ((isLocal && /[?&]api=([^&]+)/.exec(location.search)) ? decodeURIComponent(RegExp.$1) : "") || ((typeof LEADERS_CONFIG !== "undefined" && LEADERS_CONFIG.api) || "");
  const CK = "ld_pub_v1";
  let REMOTE = [], ALL = [], REAL = [];
  const okPhoto = u => /^https:\/\/(lh3\.googleusercontent\.com|drive\.google\.com)\//.test(u || "") ? u : "";
  const clean = x => (x && x.approved === true && x.nameAr) ? Object.assign({}, x, { photo: okPhoto(x.photo) || (/^assets\//.test(x.photo || "") ? x.photo : ""), achievements: (x.achievements && typeof x.achievements === "object") ? x.achievements : { ar: [], en: [] }, contact: (x.contact && typeof x.contact === "object") ? x.contact : {} }) : null;
  /* يبني القائمة المعروضة: الافتراضيات + المنشور، مع تطبيق «استبدال بطاقة» حسب ترتيب النشر */
  function rebuild() {
    const real = (DEMO ? demoData() : staticReal.concat(REMOTE)).map(clean).filter(Boolean);
    real.sort((a, b) => String(a.updated || "").localeCompare(String(b.updated || "")));
    let list = PH.slice();
    real.forEach(x => { const rep = String(x.replaces || "").split(",").filter(Boolean); list = list.filter(y => y.id !== x.id && rep.indexOf(y.id) < 0); list.push(x); });
    const idx = c => { const i = ORDER.indexOf(c.countryCode); return i < 0 ? 99 : i; };
    list.sort((a, b) => idx(a) - idx(b) || (a.placeholder ? 1 : 0) - (b.placeholder ? 1 : 0) || String(a.nameAr).localeCompare(String(b.nameAr), "ar"));
    ALL = list; REAL = list.filter(x => !x.placeholder);
  }
  rebuild();
  function loadCache() {                                        // آخر قائمة منشورة محفوظة على الجهاز: عرض فوري بدون انتظار الشبكة
    if (!API || DEMO) return;
    try { const c = JSON.parse(localStorage.getItem(CK) || "null"); if (c && Array.isArray(c)) { REMOTE = c; rebuild(); } } catch (e) {}
  }
  function loadRemote() {                                       // يحدّث القائمة في الخلفية، ويعيد true فقط لو تغيّرت
    if (!API || DEMO) return Promise.resolve(false);
    const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 25000);
    return fetch(API + (API.indexOf("?") < 0 ? "?" : "&") + "action=public", { signal: ctl.signal, cache: "no-store" })
      .then(r => r.json()).then(j => {
        clearTimeout(to);
        if (!(j && j.ok && Array.isArray(j.leaders))) return false;
        const changed = JSON.stringify(REMOTE) !== JSON.stringify(j.leaders);
        REMOTE = j.leaders; rebuild(); try { localStorage.setItem(CK, JSON.stringify(REMOTE)); } catch (e) {}
        return changed;
      })
      .catch(() => { clearTimeout(to); return false; });
  }

  const L = (o, k) => (lang === "en" ? (o[k + "En"] || o[k + "Ar"]) : (o[k + "Ar"] || o[k + "En"])) || "";
  const safeUrl = u => /^https?:\/\//i.test(u || "") ? u : "";
  const initial = n => (n || "?").trim().charAt(0).toUpperCase();

  /* ---------- العلم ---------- */
  function flag(x) {
    const cc = /^[a-z]{2}$/i.test(x.countryCode || "") ? x.countryCode.toLowerCase() : "";
    const wrap = h("span", { class: "ctry" });
    if (cc) {
      const img = h("img", { class: "flag", src: "https://flagcdn.com/w40/" + cc + ".png", alt: "", width: 24, height: 18, loading: "lazy" });
      img.addEventListener("error", () => { img.replaceWith(h("span", { class: "flagcode", text: cc.toUpperCase() })); });
      wrap.appendChild(img);
    }
    wrap.appendChild(h("span", { text: L(x, "country") }));
    return wrap;
  }
  function avatar(x, big) {
    const box = h("div", { class: "pav" + (big ? " lg" : "") });
    const ph = h("img", { class: "dflt", src: "assets/leaders/avatar-default.webp", alt: "", loading: "lazy", width: 160, height: 155 });   // أيقونة افتراضية عند عدم وجود صورة
    if (x.photo) {
      const img = h("img", { src: x.photo, alt: L(x, "name"), loading: "lazy", width: 160, height: 160 });
      img.addEventListener("error", () => img.replaceWith(ph));
      box.appendChild(img);
    } else box.appendChild(ph);
    return box;
  }

  /* ---------- البطاقات ---------- */
  let F = { q: "", c: "", p: "" };
  const norm = s => (s || "").toString().toLowerCase().normalize("NFKD").replace(/[ً-ٰٟ]/g, "").replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه");

  function matches(x) {
    if (F.c && (x.countryCode || x.countryAr) !== F.c) return false;
    if (F.p && (x.positionAr || x.positionEn) !== F.p) return false;
    if (F.q) { const hay = norm([x.nameAr, x.nameEn, x.placeholder ? x.countryAr + " " + x.countryEn : ""].join(" ")); if (hay.indexOf(norm(F.q)) < 0) return false; }
    return true;
  }
  function phCard(x) {                                          // بطاقة افتراضية: لا نافذة ولا اسم مُختلَق
    const a = h("article", { class: "lcard ph rv", "aria-label": L(x, "country") + ": " + T().phName }, [
      avatar(x),
      h("h3", { text: T().phName }),
      flag(x),
      h("span", { class: "prole", text: L(x, "position") }),
      h("p", { class: "bio", text: T().phNote })
    ]);
    return a;
  }
  function card(x) {
    if (x.placeholder) return phCard(x);
    const a = h("article", { class: "lcard rv", tabindex: "0", role: "button", "aria-label": T().view + ": " + L(x, "name") }, [
      avatar(x),
      h("h3", { text: x.nameAr }),
      x.nameEn ? h("p", { class: "nen", text: x.nameEn, lang: "en" }) : null,
      flag(x),
      L(x, "position") ? h("span", { class: "prole", text: L(x, "position") }) : null,
      L(x, "bio") ? h("p", { class: "bio", text: L(x, "bio").replace(/\n+/g, " ") }) : null,
      h("span", { class: "btn sm fill", text: T().view })
    ]);
    if (lang === "en") a.querySelector("h3").textContent = x.nameEn || x.nameAr;
    const open = () => openModal(x, a);
    a.addEventListener("click", open);
    a.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); } });
    return a;
  }
  function renderGrid() {
    const grid = $("#grid"), empty = $("#empty"), count = $("#count");
    grid.textContent = ""; grid.setAttribute("aria-busy", "false");
    const list = ALL.filter(matches);
    empty.hidden = true; count.hidden = !ALL.length;
    if (!ALL.length) { fillEmpty(empty, T().emptyT, T().emptyP); empty.hidden = false; return; }
    const nr = list.filter(x => !x.placeholder).length;
    count.textContent = T().counts(nr, list.length - nr);
    if (!list.length) { fillEmpty(empty, T().noRes, T().noResP); empty.hidden = false; return; }
    list.forEach(x => grid.appendChild(card(x)));
    observe();
  }
  function fillEmpty(box, t, p) {
    box.textContent = "";
    const s = document.createElementNS(NS, "svg"); s.setAttribute("viewBox", "0 0 24 24"); s.setAttribute("aria-hidden", "true");
    const pa = document.createElementNS(NS, "path"); pa.setAttribute("d", "M16 11a4 4 0 10-8 0 4 4 0 008 0zM4 20a8 8 0 0116 0"); s.appendChild(pa);
    box.append(s, h("h3", { text: t }), h("p", { text: p }));
  }

  function setupFilters() {
    const form = $("#filters");
    const countries = new Map(), poss = new Map();
    ALL.forEach(x => { const k = x.countryCode || x.countryAr; if (k) countries.set(k, x); const p = x.positionAr || x.positionEn; if (p) poss.set(p, x); });
    form.hidden = ALL.length < 2;
    const fill = (sel, map, all, key) => {
      const cur = sel.value; sel.textContent = ""; sel.appendChild(h("option", { value: "", text: all }));
      [...map.entries()].forEach(([k, x]) => sel.appendChild(h("option", { value: k, text: L(x, key) })));
      sel.value = cur;
    };
    fill($("#fCountry"), countries, T().allC, "country");
    fill($("#fPos"), poss, T().allP, "position");
    $("#fCountry").parentElement.hidden = countries.size < 2;
    $("#fPos").parentElement.hidden = poss.size < 2;
  }

  /* ---------- الإحصائيات (من البيانات فقط، وتُخفى إن لم توجد) ---------- */
  function renderStats() {
    const sec = $("#stats"), grid = $("#statGrid");
    const stats = [
      ["st_leaders", REAL.length],
      ["st_countries", new Set(REAL.map(x => x.countryCode || x.countryAr).filter(Boolean)).size],
      ["st_positions", new Set(REAL.map(x => x.positionAr || x.positionEn).filter(Boolean)).size]
    ].filter(s => s[1] > 0);
    grid.textContent = ""; sec.hidden = !stats.length;
    stats.forEach(([k, n]) => grid.appendChild(h("li", { class: "rv" }, [h("b", { "data-n": n, text: "0" }), h("span", { text: T()[k] })])));
    observe();
  }
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function count(el) {
    const n = +el.dataset.n; if (reduce || n < 2) { el.textContent = n; return; }
    const t0 = performance.now(), D = 1100;
    (function step(t) { const p = Math.min(1, (t - t0) / D); el.textContent = Math.round(n * (1 - Math.pow(1 - p, 3))); if (p < 1) requestAnimationFrame(step); })(t0);
  }

  /* ---------- النافذة ---------- */
  let lastFocus = null;
  function openModal(x, from) {
    lastFocus = from || document.activeElement;
    const body = $("#mBody"); body.textContent = "";
    const c = x.contact || {};
    const ach = (x.achievements && (x.achievements[lang] && x.achievements[lang].length ? x.achievements[lang] : x.achievements.ar)) || [];
    const bio = (L(x, "bio") || "").split(/\n+/).filter(Boolean);
    const links = [];
    if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(c.email || "")) links.push(["email", "mailto:" + c.email, c.email]);
    if (/^\+?[\d\s()-]{6,20}$/.test(c.phone || "")) links.push(["phone", "tel:" + c.phone.replace(/[^\d+]/g, ""), c.phone]);
    if (/^\+?\d{6,16}$/.test(c.whatsapp || "")) links.push(["wa", "https://wa.me/" + c.whatsapp.replace(/\D/g, ""), c.whatsapp]);
    if (safeUrl(c.website)) links.push(["web", c.website, c.website.replace(/^https?:\/\//i, "")]);
    body.append(
      h("div", { class: "mhead" }, [avatar(x, true), h("h2", { id: "mName", text: lang === "en" ? (x.nameEn || x.nameAr) : x.nameAr }), (lang === "ar" && x.nameEn) ? h("p", { class: "nen", lang: "en", text: x.nameEn }) : null, flag(x), L(x, "position") ? h("span", { class: "prole", text: L(x, "position") }) : null]),
      bio.length ? h("div", { class: "msec" }, [h("h3", { text: T().mBio })].concat(bio.map(p => h("p", { text: p })))) : null,
      ach.length ? h("div", { class: "msec" }, [h("h3", { text: T().mAch }), h("ul", {}, ach.map(a => h("li", { text: a })))]) : null,
      links.length ? h("div", { class: "msec" }, [h("h3", { text: T().mContact }), h("div", { class: "mcontact" }, links.map(l => h("a", { class: "btn sm", href: l[1], rel: "noopener noreferrer", target: l[0] === "web" || l[0] === "wa" ? "_blank" : null, text: T()[l[0]] + ": " + l[2], dir: "ltr" })))]) : null
    );
    const m = $("#modal"); m.hidden = false; document.body.style.overflow = "hidden";
    $("#mClose").setAttribute("aria-label", T().close);
    $("#mbox").focus();
  }
  function closeModal() {
    $("#modal").hidden = true; document.body.style.overflow = "";
    if (lastFocus && lastFocus.focus) lastFocus.focus();
  }
  document.addEventListener("keydown", e => {
    const m = $("#modal"); if (m.hidden) return;
    if (e.key === "Escape") { closeModal(); return; }
    if (e.key === "Tab") {
      const f = [...m.querySelectorAll("a[href],button")].filter(el => !el.disabled);
      if (!f.length) return;
      const first = f[0], last = f[f.length - 1];
      if (e.shiftKey && (document.activeElement === first || document.activeElement === $("#mbox"))) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });
  $("#mClose").addEventListener("click", closeModal);
  $("#modal").addEventListener("click", e => { if (e.target.id === "modal") closeModal(); });

  /* ---------- كشف عند التمرير ---------- */
  let io = null;
  function observe() {
    const els = document.querySelectorAll(".rv:not(.in)");
    if (reduce || !("IntersectionObserver" in window)) { els.forEach(el => { el.classList.add("in"); }); document.querySelectorAll("[data-n]").forEach(count); return; }
    if (!io) io = new IntersectionObserver(es => es.forEach(en => {
      if (!en.isIntersecting) return; en.target.classList.add("in"); io.unobserve(en.target);
      en.target.querySelectorAll("[data-n]").forEach(count);
    }), { threshold: .12 });
    els.forEach(el => io.observe(el));
  }

  /* ---------- النصوص الثابتة واللغة ---------- */
  function renderStatic() {
    const t = T(), html = document.documentElement;
    html.lang = lang; html.dir = lang === "en" ? "ltr" : "rtl"; document.body.dir = html.dir;
    document.title = t.title;
    document.querySelectorAll("[data-i]").forEach(el => { const v = t[el.dataset.i]; if (typeof v === "string") el.textContent = v; });
    document.querySelectorAll("[data-iph]").forEach(el => el.placeholder = t[el.dataset.iph]);
    $("#heroSub").textContent = t.sub; $("#heroSub").lang = lang === "en" ? "ar" : "en"; $("#heroSub").style.direction = lang === "en" ? "rtl" : "ltr";
    $("#brandTxt").textContent = t.brand; $("#backLnk").textContent = t.back; $("#skipLnk").textContent = t.skip;
    const b = $("#langBtn"); b.textContent = t.langBtn; b.setAttribute("aria-label", t.langAria); b.lang = lang === "en" ? "ar" : "en";
    $("#menuBtn").setAttribute("aria-label", t.menu);
    $("#featList").textContent = "";
    t.features.forEach((f, i) => $("#featList").appendChild(h("li", { class: "rv" }, [h("span", { class: "ic" }, [svgPath(ICONS[i])]), h("div", {}, [h("h3", { text: f[0] }), h("p", { text: f[1] })])])));
    $("#goalList").textContent = "";
    t.goals.forEach(g => $("#goalList").appendChild(h("li", { class: "rv", text: g })));
  }
  function renderAll() { renderStatic(); setupFilters(); renderStats(); renderGrid(); observe(); }

  $("#langBtn").addEventListener("click", () => {
    lang = lang === "en" ? "ar" : "en";
    try { localStorage.setItem("lang", lang); } catch (e) {}
    renderAll();
  });
  $("#q").addEventListener("input", e => { F.q = e.target.value.trim(); renderGrid(); });
  $("#fCountry").addEventListener("change", e => { F.c = e.target.value; renderGrid(); });
  $("#fPos").addEventListener("change", e => { F.p = e.target.value; renderGrid(); });
  const menuBtn = $("#menuBtn"), nav = $("#lnav");
  menuBtn.addEventListener("click", () => { const o = nav.classList.toggle("open"); menuBtn.setAttribute("aria-expanded", String(o)); });
  nav.addEventListener("click", e => { if (e.target.closest("a")) { nav.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); } });

  // حالة التحميل (هياكل عظمية) ثم العرض
  const grid = $("#grid");
  if (API && !DEMO) {
    /* عرض فوري (من آخر نسخة محفوظة أو الافتراضيات)، ثم تحديث هادئ عند وصول القائمة المنشورة */
    loadCache(); renderAll();
    loadRemote().then(changed => { if (changed) { setupFilters(); renderStats(); renderGrid(); } });
  } else requestAnimationFrame(() => setTimeout(renderAll, DEMO ? 250 : 0));
})();

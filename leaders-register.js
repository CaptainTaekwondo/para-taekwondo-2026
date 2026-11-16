/* نموذج تسجيل القيادات — يرسل إلى Google Apps Script (backend/leaders.gs). بدون API = وضع معاينة لا يحفظ شيئًا. */
(function () {
  "use strict";
  const API = ((/^(localhost|127\.0\.0\.1|\[::1\]|)$/.test(location.hostname) && /[?&]api=([^&]+)/.exec(location.search)) ? decodeURIComponent(RegExp.$1) : "") || (typeof LEADERS_CONFIG !== "undefined" && LEADERS_CONFIG.api) || "";
  const COUNTRIES = [["dz", "الجزائر", "Algeria"], ["bh", "البحرين", "Bahrain"], ["km", "جزر القمر", "Comoros"], ["dj", "جيبوتي", "Djibouti"], ["eg", "مصر", "Egypt"], ["iq", "العراق", "Iraq"], ["jo", "الأردن", "Jordan"], ["kw", "الكويت", "Kuwait"], ["lb", "لبنان", "Lebanon"], ["ly", "ليبيا", "Libya"], ["mr", "موريتانيا", "Mauritania"], ["ma", "المغرب", "Morocco"], ["om", "عُمان", "Oman"], ["ps", "فلسطين", "Palestine"], ["qa", "قطر", "Qatar"], ["sa", "السعودية", "Saudi Arabia"], ["so", "الصومال", "Somalia"], ["sd", "السودان", "Sudan"], ["sy", "سوريا", "Syria"], ["tn", "تونس", "Tunisia"], ["ae", "الإمارات", "UAE"], ["ye", "اليمن", "Yemen"]];
  const UI = {
    ar: {
      brand: "أساسيات البارا تايكوندو 2026", back: "صفحة القيادات", langBtn: "English", langAria: "Switch to English",
      title: "تسجيل رؤساء البارا تايكوندو — بطولة الأساسيات 2026", h1: "تسجيل رؤساء البارا تايكوندو", intro: "هذا النموذج مخصّص لرؤساء البارا تايكوندو في الدول العربية فقط. سجّل بياناتك لتظهر في صفحة «القيادات العربية للبارا تايكوندو». تُراجع البيانات من إدارة البطولة قبل النشر، ولا يظهر أي ملف قبل اعتماده.",
      demo: "وضع المعاينة: النموذج غير مربوط بقاعدة بيانات بعد، ولن يُحفظ أي شيء.",
      g1: "البيانات الأساسية", nameAr: "الاسم بالعربية", nameEn: "الاسم بالإنجليزية", country: "الدولة", pick: "اختر الدولة", other: "دولة أخرى", countryOther: "اسم الدولة", positionAr: "المنصب بالعربية", positionEn: "المنصب بالإنجليزية", positionPh: "مثال: رئيس البارا تايكوندو في مصر",
      g2: "الملف التعريفي", bio: "نبذة تعريفية", bioHint: "حتى 800 حرف. فقرة جديدة = سطر جديد.", bioEn: "النبذة بالإنجليزية (اختياري)", ach: "الخبرات والإنجازات", achHint: "إنجاز في كل سطر (حتى 10 أسطر).", photo: "الصورة الشخصية (اختياري)", photoHint: "صورة واضحة للوجه. تُصغَّر تلقائيًا قبل الإرسال.", choosePhoto: "اختر صورة", noFile: "لم يتم اختيار صورة",
      welcome: ["السلام عليكم ورحمة الله وبركاته،", "يسعدنا ويشرّفنا، باسم بطولة أساسيات البارا تايكوندو 2026، وباسم الكابتن إبراهيم الحاج صاحب المبادرة ومدير البطولة، وباسم منصات كابتن تايكوندو (المسؤول التقني، وصاحب تصميم الموقع التسويقي للبطولة والتنظيم الرقمي)، أن نرحّب بكم، بصفتكم رؤساء البارا تايكوندو في الدول العربية، في صفحة القيادات العربية للبارا تايكوندو.", "نتشرف بانضمامكم، ونتطلع إلى التعاون معكم لدعم أبطالنا في الوطن العربي."],
      g4: "المشاركة والدعم (اختياري)", participants: "عدد المشاركين من جهتكم", participantsH: "العدد التقريبي للاعبين الذين تتوقعون مشاركتهم.", publish: "هل سيتم نشر البطولة عبر القنوات والوسائل الرسمية لديكم؟", fed: "هل لديكم الرغبة في دعم البطولة من خلال الاتحاد الخاص ببلدكم؟", yes: "نعم", no: "لا", unsure: "لم يُحدَّد بعد", noAns: "— بدون إجابة —",
      g3: "بيانات التواصل", g3h: "رقم الهاتف مطلوب للتحقق من هويتك ومراسلتك. لا تُعرض بيانات التواصل علنًا إلا إذا وافقت أدناه.", phoneReq: "اختر رمز الدولة وأدخل رقم هاتف صحيحًا.", dialPick: "رمز الدولة", phoneHint: "يُختار رمز الدولة تلقائيًا عند اختيار الدولة. اكتب الرقم بدون الصفر الأول.", contactT: "للتواصل المباشر مع إدارة البطولة", ibrahim: "الكابتن إبراهيم الحاج — مدير البطولة", captain: "كابتن تايكوندو — المسؤول التقني", waMsg: (n, c, who) => "السلام عليكم، أنا " + (n || "إحدى القيادات") + (c ? " من " + c : "") + "، أتواصل معكم بخصوص صفحة القيادات العربية للبارا تايكوندو (بطولة الأساسيات 2026).", email: "البريد الإلكتروني (اختياري)", phone: "رقم الهاتف", whatsapp: "واتساب (مع رمز الدولة)", website: "موقع أو حساب رسمي (اختياري)", showContact: "أوافق على عرض بيانات التواصل أعلاه علنًا في ملفي الشخصي.",
      consent: "أقر بأن البيانات صحيحة، وأوافق على نشر اسمي ومنصبي ودولتي ونبذتي وصورتي في صفحة القيادات بعد اعتمادها من إدارة البطولة.",
      send: "إرسال البيانات", sending: "جارٍ الإرسال...", again: "تسجيل قيادة أخرى",
      req: "هذا الحقل مطلوب.", bad: "تحقق من القيمة المدخلة.", needContact: "أدخل بريدًا إلكترونيًا أو رقم واتساب على الأقل.", needConsent: "الموافقة مطلوبة.", imgBad: "تعذّر قراءة الصورة.",
      fail: "تعذّر الإرسال، حاول مرة أخرى بعد قليل.", tooFast: "من فضلك راجع البيانات ثم أعد المحاولة.", throttled: "حاول بعد قليل.",
      doneT: "تم استلام بياناتك", doneP: "شكرًا لك. ستراجع إدارة البطولة بياناتك وتعتمدها قبل ظهورها في صفحة القيادات.", doneDemo: "(وضع المعاينة: لم يُحفظ شيء.)"
    },
    en: {
      brand: "Para Taekwondo Basics 2026", back: "Leaders page", langBtn: "العربية", langAria: "التبديل إلى العربية",
      title: "Para Taekwondo Presidents registration — Basics Championship 2026", h1: "Para Taekwondo Presidents registration", intro: "This form is for the presidents of Para Taekwondo in the Arab countries only. Register your details to appear on the “Arab Para Taekwondo Leaders” page. The championship management reviews all data before publishing; nothing appears before approval.",
      demo: "Preview mode: the form is not connected to a database yet, nothing will be saved.",
      g1: "Basic details", nameAr: "Name (Arabic)", nameEn: "Name (English)", country: "Country", pick: "Select country", other: "Other country", countryOther: "Country name", positionAr: "Position (Arabic)", positionEn: "Position (English)", positionPh: "e.g. President of Para Taekwondo in Egypt",
      g2: "Profile", bio: "Biography", bioHint: "Up to 800 characters. New paragraph = new line.", bioEn: "Biography in English (optional)", ach: "Experience & achievements", achHint: "One achievement per line (up to 10 lines).", photo: "Profile photo (optional)", photoHint: "A clear face photo. It is resized automatically before sending.", choosePhoto: "Choose photo", noFile: "No photo chosen",
      welcome: ["Peace be upon you,", "On behalf of the Para Taekwondo Basics Championship 2026, Captain Ibrahim Al-Haj (originator of the initiative and championship director), and the Captain Taekwondo platform (technical lead, creator of the championship's marketing website and its digital organization), we warmly welcome you, as presidents of Para Taekwondo in the Arab countries, to the Arab Para Taekwondo Leaders page.", "We are honored by your participation and look forward to working with you to support our champions across the Arab world."],
      g4: "Participation & support (optional)", participants: "Number of participants from your side", participantsH: "The approximate number of athletes you expect to take part.", publish: "Will the championship be published on your official channels and media?", fed: "Would you like to support the championship through your country's federation?", yes: "Yes", no: "No", unsure: "Not decided yet", noAns: "— No answer —",
      g3: "Contact details", g3h: "A phone number is required to verify and contact you. Contact details are not shown publicly unless you agree below.", phoneReq: "Choose the country code and enter a valid phone number.", dialPick: "Country code", phoneHint: "The country code is picked automatically when you choose the country. Enter the number without the leading zero.", contactT: "Contact the championship management directly", ibrahim: "Captain Ibrahim Al-Haj — Championship Director", captain: "Captain Taekwondo — Technical lead", waMsg: (n, c) => "Hello, I am " + (n || "one of the leaders") + (c ? " from " + c : "") + ", contacting you about the Arab Para Taekwondo Leaders page (Basics Championship 2026).", email: "Email (optional)", phone: "Phone number", whatsapp: "WhatsApp (with country code)", website: "Official website or account (optional)", showContact: "I agree to show the contact details above publicly on my profile.",
      consent: "I confirm the details are correct and agree to publish my name, position, country, biography and photo on the leaders page after approval by the championship management.",
      send: "Submit", sending: "Sending...", again: "Register another leader",
      req: "This field is required.", bad: "Please check the value.", needContact: "Enter an email or a WhatsApp number at least.", needConsent: "Consent is required.", imgBad: "Could not read the image.",
      fail: "Could not send, please try again shortly.", tooFast: "Please review the details and try again.", throttled: "Please try again shortly.",
      doneT: "Your details were received", doneP: "Thank you. The championship management will review and approve your details before they appear on the leaders page.", doneDemo: "(Preview mode: nothing was saved.)"
    }
  };
  let lang = "ar";
  try { const l = localStorage.getItem("lang"); if (l === "en" || l === "ar") lang = l; } catch (e) {}
  const T = () => UI[lang];
  const $ = s => document.querySelector(s);
  const rid = () => { const a = new Uint8Array(12); crypto.getRandomValues(a); return "L" + Array.from(a, b => b.toString(16).padStart(2, "0")).join(""); };
  let S = { t0: Date.now(), rid: rid(), photo: null, vals: {}, done: false };

  function h(tag, attrs, kids) {
    const e = document.createElement(tag);
    for (const k in (attrs || {})) { const v = attrs[k]; if (v == null || v === false) continue; if (k === "text") e.textContent = v; else if (k === "class") e.className = v; else e.setAttribute(k, v === true ? "" : v); }
    (kids || []).forEach(c => c && e.appendChild(typeof c === "string" ? document.createTextNode(c) : c));
    return e;
  }
  function field(id, label, el, opts) {
    opts = opts || {};
    return h("div", { class: "f", id: "f_" + id }, [h("label", { for: opts.for || el.id }, [h("span", { text: label }), opts.req ? h("i", { text: " *", "aria-hidden": "true" }) : null]), el, opts.hint ? h("small", { id: id + "_h", text: opts.hint }) : null, h("span", { class: "err", id: id + "_e", role: "alert" })]);
  }
  const inp = (id, type, extra) => h("input", Object.assign({ id, name: id, type, autocomplete: "off", maxlength: 120 }, extra || {}));

  const DIAL = { dz: "213", bh: "973", km: "269", dj: "253", eg: "20", iq: "964", jo: "962", kw: "965", lb: "961", ly: "218", mr: "222", ma: "212", om: "968", ps: "970", qa: "974", sa: "966", so: "252", sd: "249", sy: "963", tn: "216", ae: "971", ye: "967" };
  const OTHER_DIALS = [["تركيا", "Turkey", "90"], ["إيران", "Iran", "98"], ["باكستان", "Pakistan", "92"], ["بريطانيا", "United Kingdom", "44"], ["فرنسا", "France", "33"], ["ألمانيا", "Germany", "49"], ["الولايات المتحدة وكندا", "USA / Canada", "1"], ["كوريا الجنوبية", "South Korea", "82"], ["ماليزيا", "Malaysia", "60"], ["إندونيسيا", "Indonesia", "62"]];
  function dialSel() {
    const opts = [h("option", { value: "", text: T().dialPick })];
    COUNTRIES.forEach(c => opts.push(h("option", { value: DIAL[c[0]], text: "+" + DIAL[c[0]] + "  " + (lang === "en" ? c[2] : c[1]) })));
    OTHER_DIALS.forEach(d => opts.push(h("option", { value: d[2], text: "+" + d[2] + "  " + (lang === "en" ? d[1] : d[0]) })));
    return h("select", { id: "dial", name: "dial", "aria-label": T().dialPick, autocomplete: "tel-country-code", required: "" }, opts);
  }
  const localPhone = () => ((document.getElementById("phone") || {}).value || "").replace(/\D/g, "").replace(/^0+/, "");
  const qsel = id => h("select", { id, name: id }, [["", "noAns"], ["yes", "yes"], ["no", "no"], ["unsure", "unsure"]].map(o => h("option", { value: o[0], text: T()[o[1]] })));
  /* أرقام التواصل المعتمدة (منشورة بالفعل في الموقع الرئيسي) */
  const CONTACTS = [{ key: "ibrahim", tel: "+972 599 370 269", wa: "972599370269" }, { key: "captain", tel: "+20 103 144 1064", wa: "201031441064" }];
  function waHref(c) {
    const cc = (document.getElementById("country") || {}).value, cr = COUNTRIES.find(x => x[0] === cc);
    const country = cr ? (lang === "en" ? cr[2] : cr[1]) : ((document.getElementById("countryOther") || {}).value || "").trim();
    const name = ((document.getElementById(lang === "en" && val0("nameEn") ? "nameEn" : "nameAr") || {}).value || "").trim();
    return "https://wa.me/" + c.wa + "?text=" + encodeURIComponent(T().waMsg(name, country));
  }
  const val0 = id => ((document.getElementById(id) || {}).value || "").trim();
  function contactBlock() {
    const t = T();
    return h("div", { class: "reach" }, [h("h2", { text: t.contactT }), h("div", { class: "reach-in" }, CONTACTS.map(c => {
      const a = h("a", { class: "btn wa", href: waHref(c), target: "_blank", rel: "noopener noreferrer" }, [h("span", { text: t[c.key] }), h("bdi", { dir: "ltr", text: c.tel })]);
      const upd = () => { a.href = waHref(c); };
      a.addEventListener("click", upd); a.addEventListener("focus", upd); a.addEventListener("pointerdown", upd);
      return a;
    }))]);
  }
  function render() {
    const t = T(), html = document.documentElement;
    html.lang = lang; html.dir = lang === "en" ? "ltr" : "rtl"; document.body.dir = html.dir; document.title = t.title;
    $("#brandTxt").textContent = t.brand; $("#backLnk").textContent = t.back;
    const b = $("#langBtn"); b.textContent = t.langBtn; b.setAttribute("aria-label", t.langAria); b.lang = lang === "en" ? "ar" : "en";
    const dm = $("#demoBanner"); dm.hidden = !!API; dm.textContent = t.demo;
    const st = $("#stage"); st.textContent = "";
    if (S.done) return renderDone(st);
    const sel = h("select", { id: "country", name: "country", required: "" }, [h("option", { value: "", text: t.pick })].concat(COUNTRIES.map(c => h("option", { value: c[0], text: lang === "en" ? c[2] : c[1] })), [h("option", { value: "other", text: t.other })]));
    const photoIn = h("input", { id: "photo", name: "photo", type: "file", class: "sr", accept: "image/jpeg,image/png,image/webp" });
    const pick = h("label", { class: "filepick" }, [photoIn, h("span", { class: "btn sm", text: t.choosePhoto }), h("span", { class: "fname", id: "fname", text: t.noFile })]);
    const prev = h("div", { class: "phv" }, [h("div", { class: "pav", id: "pvBox" }, [h("img", { class: "dflt", src: "assets/leaders/avatar-default.webp", alt: "", width: 84, height: 82 })]), pick]);
    const form = h("form", { id: "form", novalidate: "" }, [
      h("fieldset", { class: "fs" }, [h("legend", { text: t.g1 }),
        h("div", { class: "row" }, [field("nameAr", t.nameAr, inp("nameAr", "text", { required: "", autocomplete: "name" }), { req: 1 }), field("nameEn", t.nameEn, inp("nameEn", "text", { dir: "ltr" }))]),
        h("div", { class: "row" }, [field("country", t.country, sel, { req: 1 }), field("countryOther", t.countryOther, inp("countryOther", "text"))]),
        h("div", { class: "row" }, [field("positionAr", t.positionAr, inp("positionAr", "text", { required: "", placeholder: t.positionPh }), { req: 1 }), field("positionEn", t.positionEn, inp("positionEn", "text", { dir: "ltr" }))])]),
      h("fieldset", { class: "fs" }, [h("legend", { text: t.g2 }),
        field("bio", t.bio, h("textarea", { id: "bio", name: "bio", maxlength: 800, "aria-describedby": "bio_h" }), { hint: t.bioHint }),
        field("bioEn", t.bioEn, h("textarea", { id: "bioEn", name: "bioEn", maxlength: 800, dir: "ltr" })),
        field("ach", t.ach, h("textarea", { id: "ach", name: "ach", maxlength: 1500 }), { hint: t.achHint }),
        h("div", { class: "f", id: "f_photo" }, [h("span", { text: t.photo }), prev, h("small", { text: t.photoHint }), h("span", { class: "err", id: "photo_e", role: "alert" })])]),
      h("fieldset", { class: "fs" }, [h("legend", { text: t.g3 }), h("p", { class: "intro", style: "margin:0 0 .8rem;text-align:start", text: t.g3h }),
        field("phone", t.phone, h("div", { class: "phonewrap" }, [dialSel(), inp("phone", "tel", { dir: "ltr", autocomplete: "tel-national", maxlength: 16, required: "", inputmode: "tel", placeholder: "1X XXXX XXXX" })]), { req: 1, for: "phone", hint: t.phoneHint }),
        field("email", t.email, inp("email", "email", { dir: "ltr", autocomplete: "email" })),
        h("div", { class: "row" }, [field("whatsapp", t.whatsapp, inp("whatsapp", "tel", { dir: "ltr", maxlength: 30, inputmode: "tel" })), field("website", t.website, inp("website_url", "url", { dir: "ltr", maxlength: 200 }))]),
        h("label", { class: "chk" }, [h("input", { type: "checkbox", id: "showContact" }), h("span", { text: t.showContact })])]),
      h("fieldset", { class: "fs" }, [h("legend", { text: t.g4 }),
        field("participants", t.participants, inp("participants", "number", { min: "0", max: "99999", inputmode: "numeric", dir: "ltr", maxlength: 5 }), { hint: t.participantsH }),
        field("publish", t.publish, qsel("publish")), field("fed", t.fed, qsel("fed"))]),
      h("div", { class: "f", id: "f_consent" }, [h("label", { class: "chk" }, [h("input", { type: "checkbox", id: "consent", required: "" }), h("span", { text: t.consent })]), h("span", { class: "err", id: "consent_e", role: "alert" })]),
      h("div", { class: "hp", "aria-hidden": "true" }, [h("label", { text: "Website" }), h("input", { type: "text", id: "hp", tabindex: "-1", autocomplete: "off" })]),
      h("div", { class: "sendrow" }, [h("button", { class: "btn fill big", type: "submit", id: "sendBtn", text: t.send })]),
      h("p", { class: "formerr", id: "formErr", role: "alert" })
    ]);
    st.append(
      window.LeadersFX.coin(true),
      h("h1", { text: t.h1 }), h("div", { class: "welcome" }, t.welcome.map((p, i) => h("p", { class: i === 0 ? "salute" : "", text: p }))), h("p", { class: "intro", text: t.intro }), form, contactBlock());
    // restore values
    Object.keys(S.vals).forEach(k => { const el = document.getElementById(k); if (!el) return; if (el.type === "checkbox") el.checked = !!S.vals[k]; else el.value = S.vals[k]; });
    syncOther(); paintPhoto();
    sel.addEventListener("change", () => { syncOther(); const d = DIAL[sel.value]; const ds = $("#dial"); if (d && ds && !S.dialManual) { ds.value = d; save(); } });
    $("#dial").addEventListener("change", () => { S.dialManual = true; });
    photoIn.addEventListener("change", onPhoto);
    form.addEventListener("submit", onSubmit);
    form.addEventListener("input", save); form.addEventListener("change", save);
  }
  const FIELDS = ["nameAr", "nameEn", "country", "countryOther", "positionAr", "positionEn", "bio", "bioEn", "ach", "email", "dial", "phone", "whatsapp", "website_url", "showContact", "consent", "participants", "publish", "fed"];
  function save() { FIELDS.forEach(k => { const el = document.getElementById(k); if (el) S.vals[k] = el.type === "checkbox" ? el.checked : el.value; }); }
  function syncOther() { const f = $("#f_countryOther"); if (f) f.hidden = $("#country").value !== "other"; }
  function paintPhoto() { const box = $("#pvBox"); if (!box || !S.photo) return; box.textContent = ""; box.appendChild(h("img", { src: S.photo.url, alt: "", width: 84, height: 84 })); }

  function onPhoto(e) {
    const f = e.target.files && e.target.files[0]; $("#photo_e").textContent = ""; $("#fname").textContent = f ? f.name : T().noFile;
    if (!f) { S.photo = null; return; }
    if (!/^image\/(jpeg|png|webp)$/.test(f.type) || f.size > 12e6) { $("#photo_e").textContent = T().imgBad; e.target.value = ""; return; }
    const img = new Image(), u = URL.createObjectURL(f);
    img.onload = () => {
      const max = 720, k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement("canvas"); c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height); URL.revokeObjectURL(u);
      let q = .85, d = c.toDataURL("image/jpeg", q);
      while (d.length > 480000 && q > .4) { q -= .1; d = c.toDataURL("image/jpeg", q); }
      S.photo = { url: d, b64: d.split(",")[1] }; paintPhoto();
    };
    img.onerror = () => { $("#photo_e").textContent = T().imgBad; URL.revokeObjectURL(u); };
    img.src = u;
  }

  const val = id => (document.getElementById(id).value || "").trim();
  function setErr(id, msg) { const f = document.getElementById("f_" + id), e = document.getElementById(id + "_e"); if (f) f.classList.toggle("bad", !!msg); if (e) e.textContent = msg || ""; return !msg; }
  function validate() {
    const t = T(); let first = null, ok = true;
    const chk = (id, bad, msg) => { const m = bad ? msg : ""; setErr(id, m); if (m) { ok = false; first = first || id; } };
    chk("nameAr", !val("nameAr"), t.req); chk("country", !val("country"), t.req);
    chk("countryOther", val("country") === "other" && !val("countryOther"), t.req);
    chk("positionAr", !val("positionAr"), t.req);
    const em = val("email"), wa = val("whatsapp").replace(/[\s()-]/g, "");
    chk("email", em && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em), t.bad);
    chk("whatsapp", wa && !/^\+?\d{6,16}$/.test(wa), t.bad);
    chk("website", val("website_url") && !/^https?:\/\/\S+$/i.test(val("website_url")), t.bad);
    const ph = val("phone").replace(/[\s()-]/g, "");
    chk("phone", !val("dial") || localPhone().length < 6 || localPhone().length > 12, t.phoneReq);
    const pn = val("participants"); chk("participants", pn && !/^\d{1,5}$/.test(pn), t.bad);
    if (!$("#consent").checked) { setErr("consent", t.needConsent); ok = false; first = first || "consent"; } else setErr("consent", "");
    if (first) { const el = document.getElementById(first); el && el.focus(); }
    return ok;
  }

  async function onSubmit(e) {
    e.preventDefault(); $("#formErr").textContent = "";
    if (!validate()) return;
    const btn = $("#sendBtn"); btn.disabled = true; btn.textContent = T().sending;
    const cc = val("country"), cr = COUNTRIES.find(c => c[0] === cc);
    const body = {
      action: "submit", requestId: S.rid, lang, elapsed: Date.now() - S.t0, website: $("#hp").value,
      data: {
        nameAr: val("nameAr"), nameEn: val("nameEn"), countryCode: cc === "other" ? "" : cc, countryAr: cr ? cr[1] : val("countryOther"), countryEn: cr ? cr[2] : val("countryOther"),
        positionAr: val("positionAr"), positionEn: val("positionEn"), bio: val("bio"), bioEn: val("bioEn"), achievements: val("ach"),
        email: val("email"), phone: "+" + val("dial") + localPhone(), whatsapp: val("whatsapp").replace(/[\s()-]/g, ""), website: val("website_url"), showContact: $("#showContact").checked, consent: true,
        participants: val("participants"), publish: val("publish"), federation: val("fed")
      },
      photo: S.photo ? { mime: "image/jpeg", b64: S.photo.b64 } : null
    };
    try {
      if (API) {
        const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 45000);
        const r = await fetch(API, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(body), signal: ctl.signal, redirect: "follow" });
        clearTimeout(to);
        const j = await r.json();
        if (!j.ok) throw new Error(j.error || "fail");
      } else await new Promise(r => setTimeout(r, 500));
      S.done = true; S.vals = {}; S.photo = null; render();
    } catch (err) {
      const m = String(err && err.message);
      $("#formErr").textContent = m === "too_fast" ? T().tooFast : m === "locked" ? T().throttled : T().fail;
      btn.disabled = false; btn.textContent = T().send;
    }
  }
  function renderDone(st) {
    const t = T();
    st.append(h("div", { class: "done" }, [window.LeadersFX.coin(true), h("h1", { text: t.doneT, tabindex: "-1", id: "doneH" }), h("p", { text: t.doneP }), API ? null : h("p", { text: t.doneDemo }),
      h("div", { class: "sendrow" }, [h("button", { class: "btn", type: "button", id: "againBtn", text: t.again }), h("a", { class: "btn fill", href: "leaders.html", text: t.back })]), contactBlock()]));
    $("#againBtn").addEventListener("click", () => { S = { t0: Date.now(), rid: rid(), photo: null, vals: {}, done: false }; render(); });
    $("#doneH").focus();
  }
  $("#langBtn").addEventListener("click", () => { save(); lang = lang === "en" ? "ar" : "en"; try { localStorage.setItem("lang", lang); } catch (e) {} render(); });
  render();
})();

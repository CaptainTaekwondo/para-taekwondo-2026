/* لوحة نتائج استبيان المدربين — محمية بمفتاح تتحقق منه الخلفية (Apps Script)، والمفتاح لا يُحفظ في الموقع */
(() => {
  "use strict";
  const D = SURVEY_DATA, Q = D.questions;
  const API = (typeof SURVEY_CONFIG !== "undefined" && SURVEY_CONFIG.api) || "";
  const root = document.getElementById("root");
  let lang = "ar";
  try { const l = localStorage.getItem("lang"); if (l === "en" || l === "ar") lang = l; } catch (e) {}
  let key = ""; try { key = sessionStorage.getItem("pta_adm_key") || ""; } catch (e) {}
  let token = "", remember = true;                              // رمز الجلسة: يُحفظ 30 يومًا على هذا الجهاز عند «تذكّر هذا الجهاز»
  try { token = localStorage.getItem("pta_adm_tok") || ""; if (!token) { token = sessionStorage.getItem("pta_adm_tok") || ""; if (token) remember = false; } } catch (e) {}
  let mail = "", step = "email", sending = false;          // دخول بالبريد: email ← code ، أو بالمفتاح: key
  const authBody = () => (token ? { token } : { key });
  const clearAuth = () => { key = ""; token = ""; try { sessionStorage.removeItem("pta_adm_key"); sessionStorage.removeItem("pta_adm_tok"); localStorage.removeItem("pta_adm_tok"); } catch (e) {} };
  let data = null, contacts = null, tab = "sum", busy = false, msg = "", onlyInterested = false;

  const X = {
    ar: { title: "لوحة نتائج استبيان المدربين", sub: "بطولة الأساسيات العربية للبارا تايكوندو 2026", pass: "مفتاح الإدارة", emailLbl: "بريد كابتن تايكوندو", sendCode: "أرسل كود التأكيد", codeLbl: "كود التأكيد (6 أرقام)", codeSent: "إن كان البريد معتمدًا فقد أرسلنا إليه كودًا صالحًا 10 دقائق (تفقّد البريد المزعج أيضًا).", verify: "تأكيد ودخول", rememberLbl: "تذكّر هذا الجهاز 30 يومًا (لن يُطلب كود جديد)", badCode: "الكود غير صحيح أو انتهت صلاحيته.", badMail: "اكتب بريدًا صحيحًا.", useKey: "الدخول بالمفتاح بدلًا من ذلك", useMail: "الدخول بكود البريد", changeMail: "تغيير البريد", mailFail: "تعذّر إرسال البريد، أعد المحاولة.", enter: "دخول", out: "خروج", lang: "English", langAria: "Switch to English",
      loading: "جارٍ التحميل…", noApi: "لم يُربط الحفظ بعد (survey-config.js فارغ)، لذلك لا توجد بيانات لعرضها.", auth: "المفتاح غير صحيح.", locked: "تم قفل الدخول مؤقتًا بعد محاولات خاطئة. أعد المحاولة بعد 15 دقيقة.",
      notSetup: "الخلفية لم تُجهَّز بعد (شغّل setup في Apps Script).", net: "تعذّر الاتصال بالخلفية.", other: "حدث خطأ غير متوقع.",
      tabs: { sum: "النتائج والرسوم", txt: "المقترحات النصية", col: "بيانات التواصل", raw: "الإجابات", exp: "التصدير" },
      total: "إجمالي المشاركات", wantsActive: "يرغبون في مشاركة فعّالة أو تعاون", knowCT: "يعرفون منظومة Captain Taekwondo", hasContact: "تركوا بيانات تواصل بموافقتهم", top2: "تقييم إيجابي للبطولة (الخياران الأولان)",
      answers: "إجابة", of: "من", noText: "لا توجد مقترحات نصية بعد.", noRows: "لا توجد بيانات بعد.", reload: "تحديث", load: "عرض البيانات", onlyInt: "المهتمون بالتعاون فقط (إجابات السؤال 10 الأربع الأولى)",
      colLead: "بيانات التواصل مفصولة عن الإجابات ولا تُجلب إلا عند الطلب، وبعد موافقة صاحبها فقط.", date: "التاريخ", name: "الاسم", email: "البريد", phone: "الهاتف / واتساب", code: "كود المدرب", interest: "درجة الرغبة",
      expAns: "تصدير الإجابات (CSV لـ Excel)", expCon: "تصدير الراغبين في التعاون (CSV)", expNote: "ملفات CSV بترميز UTF-8 تُفتح مباشرة في Excel بالعربية. الإجابات بدون أي بيانات تواصل.", multiNote: "اختيار متعدد: النسب من إجمالي المشاركين", lg: "اللغة", improve: "ما أكثر نقطة يتمنون تحسينها", know: "ما يعرفونه عن المنظومة", ideas: "أفكار أخرى للتطوير" },
    en: { title: "Coaches Survey Results", sub: "Arab Para Taekwondo Basics Championship 2026", pass: "Admin key", emailLbl: "Captain Taekwondo email", sendCode: "Send verification code", codeLbl: "Verification code (6 digits)", codeSent: "If the email is authorized, we sent it a code valid for 10 minutes (check spam too).", verify: "Verify & sign in", rememberLbl: "Remember this device for 30 days (no new code needed)", badCode: "The code is incorrect or has expired.", badMail: "Enter a valid email.", useKey: "Use the admin key instead", useMail: "Sign in with an email code", changeMail: "Change email", mailFail: "Could not send the email, please retry.", enter: "Sign in", out: "Sign out", lang: "العربية", langAria: "التبديل إلى العربية",
      loading: "Loading…", noApi: "Saving is not connected yet (survey-config.js is empty), so there is no data to show.", auth: "Incorrect key.", locked: "Sign-in is temporarily locked after failed attempts. Try again in 15 minutes.",
      notSetup: "The backend is not set up yet (run setup in Apps Script).", net: "Could not reach the backend.", other: "Unexpected error.",
      tabs: { sum: "Results & charts", txt: "Written suggestions", col: "Contacts", raw: "Responses", exp: "Export" },
      total: "Total responses", wantsActive: "Want active participation or collaboration", knowCT: "Know the Captain Taekwondo platform", hasContact: "Left contact details with consent", top2: "Positive view of the championship (top two options)",
      answers: "answers", of: "of", noText: "No written suggestions yet.", noRows: "No data yet.", reload: "Refresh", load: "Load data", onlyInt: "Interested in collaborating only (first four Q10 answers)",
      colLead: "Contact details are kept apart from answers, fetched only on request, and only with the owner's consent.", date: "Date", name: "Name", email: "Email", phone: "Phone / WhatsApp", code: "Coach code", interest: "Interest",
      expAns: "Export answers (CSV for Excel)", expCon: "Export collaboration leads (CSV)", expNote: "UTF-8 CSV files open directly in Excel, Arabic included. The answers file contains no contact details.", multiNote: "Multiple choice: percentages are of all respondents", lg: "Language", improve: "Main area they want improved", know: "What they know about the platform", ideas: "Other development ideas" }
  };
  const t = () => X[lang];
  const L = o => (o && o[lang]) || "";
  const H = {};
  const h = (tag, a, ...k) => { const e = document.createElement(tag); for (const n in (a || {})) { const v = a[n]; if (v === false || v == null) continue; if (n === "class") e.className = v; else if (n === "text") e.textContent = v; else if (n.startsWith("on")) e.addEventListener(n.slice(2), v); else if (v === true) e.setAttribute(n, ""); else e.setAttribute(n, v); } k.flat().forEach(c => { if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(c)); }); return e; };

  /* أعمدة الشيت */
  const IDX = { ts: 0, rid: 1, lang: 2, q1: 3, q2: 4, q3: 5, q4: 6, q5: 7, q6: 8, q6t: 9, q7: 10, q7t: 11, q8: 12, q9: 13, q9t: 14, q10: 15, hc: 16 };
  const val = (r, k) => r[IDX[k]] || "";
  const optLabel = (qq, k) => { const o = qq.options.find(o => o.k === k); return o ? L(o) : k; };

  async function post(body) {
    const ctl = new AbortController(), tm = setTimeout(() => ctl.abort(), 40000);
    try { const r = await fetch(API, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(body), signal: ctl.signal, redirect: "follow" }); return JSON.parse(await r.text()); }
    finally { clearTimeout(tm); }
  }
  async function fetchData(which) {
    if (!API) { msg = t().noApi; return null; }
    try {
      const r = await post(Object.assign({ action: which }, authBody()));
      if (r && r.ok) return r;
      msg = r && r.error === "auth" ? t().auth : r && r.error === "locked" ? t().locked : r && r.error === "not_setup" ? t().notSetup : t().other;
      if (r && (r.error === "auth" || r.error === "locked")) clearAuth();
    } catch (e) { msg = t().net; }
    return null;
  }
  async function load() {
    busy = true; msg = ""; view();
    const r = await fetchData("admin_data");
    busy = false;
    if (r) { data = r.rows; try { if (token) (remember ? localStorage : sessionStorage).setItem("pta_adm_tok", token); else sessionStorage.setItem("pta_adm_key", key); } catch (e) {} }
    view();
  }
  async function loadContacts() {
    busy = true; view();
    const r = await fetchData("admin_contacts");
    busy = false;
    if (r) contacts = r.rows;
    view();
  }

  /* ---------- الحساب ---------- */
  const count = (qq, rows) => {
    const c = {}; qq.options.forEach(o => c[o.k] = 0);
    rows.forEach(r => { const v = val(r, qq.id); (qq.type === "multi" ? v.split(",") : [v]).forEach(k => { if (k in c) c[k]++; }); });
    return c;
  };
  const pct = (n, tot) => tot ? Math.round((n / tot) * 1000) / 10 : 0;

  /* ---------- العرض ---------- */
  function view() {
    document.documentElement.lang = lang; document.documentElement.dir = lang === "en" ? "ltr" : "rtl"; document.body.dir = document.documentElement.dir;
    document.title = t().title;
    const lb = document.getElementById("langBtn"); lb.textContent = t().lang; lb.setAttribute("aria-label", t().langAria);
    const ob = document.getElementById("outBtn"); ob.textContent = t().out; ob.hidden = !data;
    document.getElementById("brandTxt").textContent = t().title;
    root.textContent = "";
    if (!data) return root.append(login());
    root.append(h("h1", { class: "foil", text: t().title }), h("p", { class: "hint", text: t().sub }), kpis(), tabsBar(), panel());
  }
  function login() {
    const errP = h("p", { class: "err", role: "alert", hidden: !msg, text: msg });
    const head = [h("img", { class: "svlogo", src: "assets/champion-lite.webp", alt: "", width: 100, height: 100 }), h("h1", { class: "foil", text: t().title }), h("p", { class: "hint", text: t().sub })];
    const btn = (txt, fn, fill) => h("button", { class: "btn" + (fill ? " fill" : ""), type: "button", disabled: busy || sending, text: (busy || sending) ? t().loading : txt, onclick: fn });
    if (step === "key") {
      const inp = h("input", { type: "password", id: "k", autocomplete: "current-password", "aria-label": t().pass, placeholder: t().pass });
      inp.value = key;
      const go = () => { key = inp.value.trim(); token = ""; if (key) load(); };
      inp.addEventListener("keydown", e => { if (e.key === "Enter") go(); });
      return h("div", { class: "card login" }, ...head, inp, errP, h("div", { class: "acts" }, btn(t().enter, go, true)),
        h("button", { class: "lnk", type: "button", text: t().useMail, onclick: () => { step = "email"; msg = ""; view(); } }));
    }
    if (step === "code") {
      const inp = h("input", { type: "text", id: "c", class: "code", inputmode: "numeric", maxlength: 6, autocomplete: "one-time-code", dir: "ltr", "aria-label": t().codeLbl, placeholder: "······" });
      const go = async () => {
        const code = inp.value.trim(); if (code.length < 6) { msg = t().badCode; return view(); }
        sending = true; msg = ""; view();
        try {
          const r = await post({ action: "admin_verify", email: mail, code, remember });
          if (r && r.ok && r.token) { token = r.token; key = ""; sending = false; return load(); }
          msg = r && r.error === "locked" ? t().locked : t().badCode;
        } catch (e) { msg = t().net; }
        sending = false; view();
      };
      inp.addEventListener("keydown", e => { if (e.key === "Enter") go(); });
      return h("div", { class: "card login" }, ...head, h("p", { class: "hint", text: t().codeSent }), h("label", { for: "c", class: "hint", text: t().codeLbl }), inp,
        (() => { const cb = h("input", { type: "checkbox", id: "rem" }); cb.checked = remember; cb.addEventListener("change", () => { remember = cb.checked; }); return h("label", { class: "consent", for: "rem" }, cb, h("span", { text: t().rememberLbl })); })(), errP,
        h("div", { class: "acts" }, btn(t().verify, go, true)),
        h("button", { class: "lnk", type: "button", text: t().changeMail, onclick: () => { step = "email"; msg = ""; view(); } }));
    }
    const inp = h("input", { type: "email", id: "m", autocomplete: "email", dir: "ltr", "aria-label": t().emailLbl, placeholder: t().emailLbl });
    inp.value = mail;
    const go = async () => {
      const v = inp.value.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) { msg = t().badMail; mail = v; return view(); }
      if (!API) { msg = t().noApi; return view(); }
      mail = v; sending = true; msg = ""; view();
      try {
        const r = await post({ action: "admin_sendcode", email: mail });
        if (r && r.ok) { step = "code"; msg = ""; } else msg = r && r.error === "mail_failed" ? t().mailFail : t().other;
      } catch (e) { msg = t().net; }
      sending = false; view();
    };
    inp.addEventListener("keydown", e => { if (e.key === "Enter") go(); });
    return h("div", { class: "card login" }, ...head, inp, errP, h("div", { class: "acts" }, btn(t().sendCode, go, true)),
      h("button", { class: "lnk", type: "button", text: t().useKey, onclick: () => { step = "key"; msg = ""; view(); } }));
  }
  function kpis() {
    const n = data.length;
    const q1 = Q[0], q7 = Q[6], q10 = Q[9];
    const top2 = data.filter(r => ["1", "2"].includes(val(r, "q1"))).length;
    const active = data.filter(r => ["1", "2", "3"].includes(val(r, "q10"))).length;
    const know = data.filter(r => ["1", "2"].includes(val(r, "q7"))).length;
    const hc = data.filter(r => val(r, "hc") === "yes").length;
    const k = (b, s) => h("div", { class: "kpi" }, h("b", { text: b }), h("span", { text: s }));
    return h("div", { class: "kpis" }, k(String(n), t().total), k(pct(top2, n) + "%", t().top2), k(pct(active, n) + "%", t().wantsActive), k(pct(know, n) + "%", t().knowCT), k(String(hc), t().hasContact));
  }
  function tabsBar() {
    return h("div", { class: "tabs", role: "tablist" }, Object.keys(t().tabs).map(id => h("button", { type: "button", role: "tab", "aria-selected": String(tab === id), text: t().tabs[id], onclick: () => { tab = id; view(); if (id === "col" && !contacts) loadContacts(); } })));
  }
  function panel() {
    const reload = h("button", { class: "btn sm", type: "button", text: t().reload, onclick: () => { contacts = null; load(); } });
    const wrap = h("div", { role: "tabpanel" }, h("div", { class: "toolbar" }, reload));
    if (tab === "sum") wrap.append(...Q.map(chart));
    else if (tab === "txt") wrap.append(texts());
    else if (tab === "col") wrap.append(collab());
    else if (tab === "raw") wrap.append(rawTable());
    else wrap.append(exportBox());
    return wrap;
  }
  function chart(qq, i) {
    const c = count(qq, data), n = data.length;
    const rows = qq.options.map(o => h("div", { class: "row" },
      h("span", { class: "lbl", text: L(o) }),
      h("span", { class: "track", "aria-hidden": "true" }, h("i", { style: `width:${pct(c[o.k], n)}%` })),
      h("span", { class: "val" }, String(c[o.k]), " ", h("small", { text: pct(c[o.k], n) + "%" }))));
    return h("section", { class: "qbox" },
      h("h3", {}, h("span", { class: "n", text: (i + 1) + ". " }), L(qq)),
      h("p", { class: "tot", text: n + " " + t().answers + (qq.type === "multi" ? " — " + t().multiNote : "") }), rows);
  }
  function texts() {
    const defs = [["q6t", t().improve], ["q7t", t().know], ["q9t", t().ideas]];
    const box = h("div");
    let any = false;
    defs.forEach(([k, title]) => {
      const items = data.filter(r => val(r, k)).map(r => h("li", {}, val(r, k), h("small", { text: val(r, "ts") + " · " + val(r, "lang") })));
      if (!items.length) return; any = true;
      box.append(h("section", { class: "qbox" }, h("h3", { text: title + " (" + items.length + ")" }), h("ul", { class: "txts" }, items)));
    });
    if (!any) box.append(h("p", { class: "empty", text: t().noText }));
    return box;
  }
  function collab() {
    const box = h("div", {}, h("p", { class: "hint", text: t().colLead }));
    if (busy && !contacts) return box.appendChild(h("p", { class: "empty", text: t().loading })), box;
    if (!contacts) { box.append(h("p", { class: "err", hidden: !msg, text: msg }), h("button", { class: "btn fill", type: "button", text: t().load, onclick: loadContacts })); return box; }
    if (!contacts.length) { box.append(h("p", { class: "empty", text: t().noRows })); return box; }
    const q10 = Q[9];
    const cb = h("input", { type: "checkbox", id: "onlyInt" }); cb.checked = onlyInterested;
    cb.addEventListener("change", () => { onlyInterested = cb.checked; view(); });
    box.append(h("label", { class: "consent", for: "onlyInt" }, cb, h("span", { text: t().onlyInt })));
    const list = onlyInterested ? contacts.filter(r => ["1", "2", "3", "4"].includes(r[7])) : contacts;
    const body = list.map(r => h("tr", {}, h("td", { text: r[0] }), h("td", { text: r[2] }), h("td", { class: "ltr", text: r[3] }), h("td", { class: "ltr", text: r[4] }), h("td", { class: "ltr", text: r[5] }), h("td", { text: optLabel(q10, r[7]) })));
    box.append(h("div", { class: "tw" }, h("table", {}, h("thead", {}, h("tr", {}, [t().date, t().name, t().email, t().phone, t().code, t().interest].map(x => h("th", { text: x })))), h("tbody", {}, body))));
    return box;
  }
  function rawTable() {
    if (!data.length) return h("p", { class: "empty", text: t().noRows });
    const head = [t().date, t().lg, ...Q.map((qq, i) => "Q" + (i + 1))];
    const body = data.slice().reverse().map(r => h("tr", {}, h("td", { text: val(r, "ts") }), h("td", { text: val(r, "lang") }),
      Q.map(qq => h("td", { text: qq.type === "multi" ? val(r, qq.id).split(",").filter(Boolean).map(k => k).join("، ") : val(r, qq.id) }))));
    return h("div", {}, h("p", { class: "hint", text: "Q1–Q10: رقم الاختيار / choice number" }), h("div", { class: "tw" }, h("table", {}, h("thead", {}, h("tr", {}, head.map(x => h("th", { text: x })))), h("tbody", {}, body))));
  }

  /* ---------- التصدير ---------- */
  const csvCell = v => { let s = String(v == null ? "" : v); if (/^[=+\-@]/.test(s)) s = "'" + s; return /[",\n\r]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };
  function download(name, rows) {
    const text = "﻿" + rows.map(r => r.map(csvCell).join(",")).join("\r\n");
    const a = h("a", { href: URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" })), download: name });
    document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  }
  const stamp = () => new Date().toISOString().slice(0, 10);
  /* التصدير بلغة الواجهة الحالية (العربية افتراضيًا): العناوين ونصوص الإجابات */
  const EXP = {
    ar: { ts: "التاريخ", rid: "معرّف الإجابة", lang: "لغة التعبئة", code: "رقم الاختيار", ans: "الإجابة", txt: "نص إضافي", q: "س", langV: { ar: "عربي", en: "English" },
      name: "الاسم", email: "البريد الإلكتروني", phone: "الهاتف / واتساب", coach: "كود المدرب", q10: "إجابة السؤال 10 (الرغبة في المشاركة)", fa: "survey-answers-ar-", fc: "survey-contacts-ar-" },
    en: { ts: "Timestamp", rid: "Response ID", lang: "Language", code: "choice no.", ans: "answer", txt: "text", q: "Q", langV: { ar: "Arabic", en: "English" },
      name: "Name", email: "Email", phone: "Phone / WhatsApp", coach: "Coach Code", q10: "Q10 answer", fa: "survey-answers-", fc: "survey-contacts-" }
  };
  function exportAnswers() {
    const E = EXP[lang];
    const head = [E.ts, E.rid, E.lang];
    Q.forEach((qq, i) => { const n = E.q + (i + 1) + " — " + L(qq.tag); head.push(n + " (" + E.code + ")", n + " (" + E.ans + ")"); if (qq.text) head.push(n + " (" + E.txt + ")"); });
    const rows = data.map(r => {
      const o = [val(r, "ts"), val(r, "rid"), E.langV[val(r, "lang")] || val(r, "lang")];
      Q.forEach(qq => {
        const v = val(r, qq.id);
        o.push(v, qq.type === "multi" ? v.split(",").filter(Boolean).map(k => optLabel(qq, k)).join(" | ") : optLabel(qq, v));
        if (qq.text) o.push(val(r, qq.text.id));
      });
      return o;
    });
    download(E.fa + stamp() + ".csv", [head, ...rows]);
  }
  function exportContacts() {
    if (!contacts) return loadContacts().then(() => contacts && exportContacts());
    const E = EXP[lang];
    const rows = contacts.map(r => [r[0], r[1], r[2], r[3], r[4], r[5], optLabel(Q[9], r[7])]);
    download(E.fc + stamp() + ".csv", [[E.ts, E.rid, E.name, E.email, E.phone, E.coach, E.q10], ...rows]);
  }
  function exportBox() {
    return h("section", { class: "qbox" }, h("p", { class: "hint", text: t().expNote }),
      h("div", { class: "acts" }, h("button", { class: "btn fill", type: "button", text: t().expAns, onclick: exportAnswers }), h("button", { class: "btn", type: "button", text: t().expCon, onclick: exportContacts })));
  }

  document.getElementById("langBtn").addEventListener("click", () => { lang = lang === "en" ? "ar" : "en"; try { localStorage.setItem("lang", lang); } catch (e) {} view(); });
  document.getElementById("outBtn").addEventListener("click", () => { data = contacts = null; clearAuth(); step = "email"; view(); });
  if ((key || token) && API) load(); else view();
})();

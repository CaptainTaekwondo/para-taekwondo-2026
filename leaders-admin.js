/* إدارة القيادات: مراجعة التسجيلات، تعديل البيانات، ضبط الصورة، واختيار «استبدال بطاقة» أو «بطاقة جديدة» ثم النشر.
   كل النصوص تُكتب بـ textContent (لا innerHTML) لمنع حقن الشيفرة من بيانات المسجّلين. */
(function () {
  "use strict";
  const COUNTRIES = [["dz", "الجزائر", "Algeria"], ["bh", "البحرين", "Bahrain"], ["km", "جزر القمر", "Comoros"], ["dj", "جيبوتي", "Djibouti"], ["eg", "مصر", "Egypt"], ["iq", "العراق", "Iraq"], ["jo", "الأردن", "Jordan"], ["kw", "الكويت", "Kuwait"], ["lb", "لبنان", "Lebanon"], ["ly", "ليبيا", "Libya"], ["mr", "موريتانيا", "Mauritania"], ["ma", "المغرب", "Morocco"], ["om", "عُمان", "Oman"], ["ps", "فلسطين", "Palestine"], ["qa", "قطر", "Qatar"], ["sa", "السعودية", "Saudi Arabia"], ["so", "الصومال", "Somalia"], ["sd", "السودان", "Sudan"], ["sy", "سوريا", "Syria"], ["tn", "تونس", "Tunisia"], ["ae", "الإمارات", "UAE"], ["ye", "اليمن", "Yemen"]];
  const CN = c => COUNTRIES.find(x => x[0] === c);
  const isLocal = /^(localhost|127\.0\.0\.1|\[::1\]|)$/.test(location.hostname);
  const API = ((isLocal && /[?&]api=([^&]+)/.exec(location.search)) ? decodeURIComponent(RegExp.$1) : "") || ((typeof LEADERS_CONFIG !== "undefined" && LEADERS_CONFIG.api) || "");
  const $ = s => document.querySelector(s);
  const S = { token: "", email: "", subs: [], pub: [], saved: [], orderIds: null, orderDirty: false, tab: "pending", ed: null };
  const ERR = { auth: "الكود غير صحيح أو انتهت صلاحيته.", bad_email: "اكتب بريدًا صحيحًا.", mail: "تعذّر إرسال البريد، حاول بعد قليل.", locked: "محاولات كثيرة، حاول بعد 15 دقيقة.", not_setup: "الباك إند غير مُجهّز (شغّل setup).", missing: "أكمل الاسم والمنصب والدولة.", bad_photo: "تعذّر قبول الصورة.", forbidden: "ملف غير مسموح." };

  function h(tag, attrs, kids) {
    const e = document.createElement(tag);
    for (const k in (attrs || {})) { const v = attrs[k]; if (v == null || v === false) continue; if (k === "text") e.textContent = v; else if (k === "class") e.className = v; else e.setAttribute(k, v === true ? "" : v); }
    (kids || []).forEach(c => c && e.appendChild(typeof c === "string" ? document.createTextNode(c) : c));
    return e;
  }
  function toast(msg, bad) { const t = $("#toast"); t.textContent = msg; t.className = "toast" + (bad ? " err" : ""); t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => { t.hidden = true; }, bad ? 6000 : 3800); }

  async function call(action, extra) {
    const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 45000);
    try {
      const r = await fetch(API, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(Object.assign({ action, token: S.token }, extra || {})), signal: ctl.signal, redirect: "follow" });
      const j = await r.json();
      if (!j.ok) { if (j.error === "auth" && S.token) expire(); throw new Error(j.error || "fail"); }
      return j;
    } finally { clearTimeout(to); }
  }
  const errText = e => ERR[String(e && e.message)] || "تعذّر الاتصال، حاول مرة أخرى.";

  /* ---------- الدخول ---------- */
  if (!API) { const d = $("#demoBanner"); d.hidden = false; d.textContent = "لا يوجد رابط API في leaders-config.js، لذلك لا تعمل لوحة الإدارة بعد."; $("#sendCodeBtn").disabled = true; }
  const loginErr = m => { $("#loginErr").textContent = m || ""; };
  let cool = 0;
  function startCooldown() {
    const b = $("#resendBtn"); clearInterval(cool); let n = 45; b.disabled = true;
    const tick = () => { b.textContent = n > 0 ? "إعادة إرسال الكود (" + n + ")" : "إعادة إرسال الكود"; if (n-- <= 0) { clearInterval(cool); b.disabled = false; } };
    tick(); cool = setInterval(tick, 1000);
  }
  async function sendCode(em) {
    const b = $("#sendCodeBtn"), t0 = b.textContent; b.disabled = true; b.textContent = "جارٍ الإرسال... (قد يستغرق عدة ثوانٍ)"; loginErr("");
    try {
      await call("admin_code_request", { email: em }); S.email = em;
      $("#emailForm").hidden = true; $("#codeForm").hidden = false; $("#code").value = ""; $("#code").focus();
      $("#loginIntro").textContent = "إن كان البريد مسجَّلًا لدينا فقد أرسلنا كود تأكيد من 6 أرقام. أدخله هنا (صالح 10 دقائق).";
      startCooldown();
    } catch (err) { loginErr(errText(err)); }
    b.disabled = false; b.textContent = t0;
  }
  $("#emailForm").addEventListener("submit", e => { e.preventDefault(); const em = $("#adminEmail").value.trim().toLowerCase(); if (em) sendCode(em); });
  $("#resendBtn").addEventListener("click", () => { if (S.email) sendCode(S.email); });
  $("#changeEmailBtn").addEventListener("click", () => { clearInterval(cool); $("#codeForm").hidden = true; $("#emailForm").hidden = false; loginErr(""); $("#loginIntro").textContent = "سجّل بريد كابتن تايكوندو وسيصله كود تأكيد للدخول."; $("#adminEmail").focus(); });
  $("#codeForm").addEventListener("submit", async e => {
    e.preventDefault(); const c = $("#code").value.replace(/\D/g, ""); if (c.length !== 6) { loginErr("اكتب الكود المكوَّن من 6 أرقام."); return; }
    const b = $("#loginBtn"), t0 = b.textContent; b.disabled = true; b.textContent = "جارٍ التحقق..."; loginErr("");
    try {
      const rem = $("#remember").checked, j = await call("admin_code_verify", { email: S.email, code: c, remember: rem });
      S.token = j.token; try { (rem ? localStorage : sessionStorage).setItem("ld_t", j.token); (rem ? sessionStorage : localStorage).removeItem("ld_t"); } catch (x) {}
      await load(); showPanel();
    } catch (err) { S.token = ""; loginErr(errText(err)); }
    b.disabled = false; b.textContent = t0;
  });
  function showPanel() { $("#login").hidden = true; $("#panel").hidden = false; $("#outBtn").hidden = false; }
  function expire() {                                           // انتهت الجلسة أو أُبطلت: ارجع لشاشة الدخول
    S.token = ""; clearToken();
    $("#editor").hidden = true; $("#editor").textContent = ""; $("#panel").hidden = true; $("#login").hidden = false; $("#outBtn").hidden = true; $("#pendBadge").hidden = true; document.title = "إدارة القيادات — بطولة الأساسيات 2026";
    $("#emailForm").hidden = false; $("#codeForm").hidden = true; $("#loginIntro").textContent = "انتهت الجلسة. سجّل بريد كابتن تايكوندو لاستلام كود جديد.";
  }
  function clearToken() { try { sessionStorage.removeItem("ld_t"); localStorage.removeItem("ld_t"); } catch (x) {} }
  $("#outBtn").addEventListener("click", async () => { try { await call("admin_logout"); } catch (x) {} clearToken(); location.reload(); });
  $("#refreshBtn").addEventListener("click", async () => { try { await load(); toast("تم التحديث"); } catch (e) { toast(errText(e), true); } });
  (function auto() { try { const t = localStorage.getItem("ld_t") || sessionStorage.getItem("ld_t"); if (t && API) { S.token = t; load().then(showPanel).catch(() => { S.token = ""; }); } } catch (e) {} })();

  /* ---------- الروابط (للنسخ والمشاركة) ---------- */
  (function links() {
    const abs = f => new URL(f, location.href.split("?")[0].split("#")[0]).href;
    const items = [["نموذج التسجيل (أرسله لرؤساء البارا)", abs("leaders-register.html")], ["صفحة القيادات العامة", abs("leaders.html")], ["صفحة الإدارة (لا تشاركها)", abs("leaders-admin.html")]];
    const ul = $("#linkList"); if (!ul) return;
    items.forEach(it => {
      const copy = h("button", { class: "btn sm", type: "button", text: "نسخ الرابط" });
      copy.addEventListener("click", async () => {
        try { await navigator.clipboard.writeText(it[1]); toast("تم نسخ الرابط"); }
        catch (e) { const t = h("textarea", { style: "position:fixed;opacity:0" }); t.value = it[1]; document.body.appendChild(t); t.select(); try { document.execCommand("copy"); toast("تم نسخ الرابط"); } catch (x) { toast(it[1], true); } t.remove(); }
      });
      const open = h("a", { class: "btn sm", href: it[1], target: "_blank", rel: "noopener noreferrer", text: "فتح" });
      ul.appendChild(h("li", {}, [h("div", {}, [h("b", { text: it[0] }), h("code", { dir: "ltr", text: it[1] })]), h("div", { class: "prow" }, [copy, open])]));
    });
  })();
  async function load() { const j = await call("admin_list"); S.subs = j.submissions || []; S.pub = j.published || []; S.saved = Array.isArray(j.order) ? j.order : []; renderLists(); }

  /* ---------- القوائم ---------- */
  const pending = () => S.subs.filter(s => s.status === "pending");
  const doneSubs = () => S.subs.filter(s => s.status !== "pending");
  const flagImg = cc => { const i = h("img", { class: "flag", src: "https://flagcdn.com/w40/" + cc + ".png", alt: "", width: 24, height: 18, loading: "lazy" }); i.addEventListener("error", () => i.replaceWith(h("span", { class: "flagcode", text: cc.toUpperCase() }))); return i; };
  const dflt = () => h("img", { class: "dflt", src: "assets/leaders/avatar-default.webp", alt: "", width: 64, height: 62 });
  const ago = ts => String(ts || "").replace("T", " ").slice(0, 16);
  const stLabel = { pending: "بانتظار المراجعة", approved: "نُشرت", rejected: "مرفوضة" };

  function renderLists() {
    const p = pending(), d = doneSubs(), live = S.pub.filter(x => x.active);
    $("#nPend").textContent = p.length; $("#nPub").textContent = S.pub.length; $("#nDone").textContent = d.length;
    const bd = $("#pendBadge"); bd.hidden = !p.length; bd.textContent = p.length; document.title = (p.length ? "(" + p.length + ") " : "") + "إدارة القيادات — بطولة الأساسيات 2026";
    document.querySelectorAll("#tabs [role=tab]").forEach(b => b.setAttribute("aria-selected", String(b.dataset.tab === S.tab)));
    const box = $("#list"); box.textContent = "";
    if (S.tab === "order") { $("#listEmpty").hidden = true; renderOrder(box); return; }
    const rows = S.tab === "pending" ? p : S.tab === "done" ? d : S.pub;
    $("#listEmpty").hidden = rows.length > 0; $("#listEmpty").textContent = S.tab === "pending" ? "لا توجد تسجيلات بانتظار المراجعة." : S.tab === "done" ? "لا توجد تسجيلات معالجة بعد." : "لا توجد بطاقات منشورة بعد.";
    rows.forEach(x => box.appendChild(S.tab === "published" ? pubRow(x) : subRow(x)));
    void live;
  }
  function subRow(s) {
    const meta = h("div", { class: "meta" }, [h("span", { class: "ctry" }, [flagImg(s.countryCode || "un"), h("span", { text: s.countryAr })]), h("span", { text: s.positionAr }), h("span", { text: ago(s.ts) }), h("span", { class: "tag " + s.status, text: stLabel[s.status] || s.status })]);
    const acts = h("div", { class: "acts" }, [h("button", { class: "btn sm fill", type: "button", text: s.status === "pending" ? "مراجعة واتخاذ قرار" : "فتح" })]);
    acts.firstChild.addEventListener("click", () => openSub(s));
    acts.appendChild(delBtn("sub", s.rid, s.nameAr));
    return h("article", { class: "arow" }, [h("div", { class: "pav" }, [dflt()]), h("div", {}, [h("h3", { text: s.nameAr }), meta]), acts]);
  }
  /* حذف نهائي (للتجارب أو الطلبات غير المرغوبة): يحذف الصف وصورته نهائيًا من الشيت */
  function delBtn(kind, id, name) {
    const b = h("button", { class: "btn sm danger", type: "button", text: "حذف نهائي" });
    b.addEventListener("click", async () => {
      if (!confirm("حذف «" + name + "» نهائيًا؟ لا يمكن التراجع، وسيُحذف الصف وصورته من الشيت.")) return;
      try { await call("admin_delete", { kind, id }); await load(); toast("تم الحذف نهائيًا"); } catch (e) { toast(errText(e), true); }
    });
    return b;
  }
  function pubRow(x) {
    const meta = h("div", { class: "meta" }, [h("span", { class: "ctry" }, [flagImg(x.countryCode || "un"), h("span", { text: x.countryAr })]), h("span", { text: x.positionAr }), h("span", { text: ago(x.updated) }), h("span", { class: "tag " + (x.active ? "live" : "off"), text: x.active ? "منشورة" : "غير منشورة" })]);
    const ed = h("button", { class: "btn sm fill", type: "button", text: "تعديل وإعادة النشر" }); ed.addEventListener("click", () => openPub(x));
    const acts = h("div", { class: "acts" }, [ed]);
    if (x.active) { const un = h("button", { class: "btn sm danger", type: "button", text: "إلغاء النشر" }); un.addEventListener("click", async () => { if (!confirm("إلغاء نشر بطاقة «" + x.nameAr + "»؟ ستعود البطاقة الافتراضية للدولة إن كانت قد استُبدلت.")) return; try { await call("admin_unpublish", { id: x.id }); await load(); toast("تم إلغاء النشر"); } catch (e) { toast(errText(e), true); } }); acts.appendChild(un); }
    acts.appendChild(delBtn("pub", x.id, x.nameAr));
    const av = h("div", { class: "pav" }, [x.photo ? h("img", { src: x.photo, alt: "", width: 64, height: 64, loading: "lazy" }) : dflt()]);
    return h("article", { class: "arow" }, [av, h("div", {}, [h("h3", { text: x.nameAr }), meta]), acts]);
  }
  $("#tabs").addEventListener("click", e => { const b = e.target.closest("[data-tab]"); if (!b) return; S.tab = b.dataset.tab; renderLists(); });

  /* ---------- ترتيب البطاقات ---------- */
  const visibleCards = () => LeadersCore.merge(S.pub.filter(x => x.active), S.saved);
  function orderIds(cards) {                                    // يبقي ترتيبك غير المحفوظ ويضيف ما استجدّ في النهاية
    const ids = cards.map(c => c.id);
    if (!S.orderDirty || !S.orderIds) return ids;
    const keep = S.orderIds.filter(i => ids.indexOf(i) >= 0);
    return keep.concat(ids.filter(i => keep.indexOf(i) < 0));
  }
  function renderOrder(box) {
    const cards = visibleCards(), byId = new Map(cards.map(c => [c.id, c]));
    S.orderIds = orderIds(cards);
    const bar = h("div", { class: "orderbar" }, []);
    const save = h("button", { class: "btn fill", type: "button", text: S.orderDirty ? "حفظ الترتيب" : "الترتيب محفوظ" }); save.disabled = !S.orderDirty;
    const reset = h("button", { class: "btn", type: "button", text: "الترتيب الافتراضي (حسب الدولة)" });
    bar.append(h("p", { class: "muted", text: "اكتب رقم الترتيب في المربع (مثلًا 1 لتصير البطاقة الأولى ثم Enter)، أو اضغط ⤒ للأول، أو اسحب المقبض ⠿ بالماوس، أو استخدم الأسهم. ثم اضغط «حفظ الترتيب» ليظهر في صفحة القيادات." }), h("div", { class: "prow" }, [save, reset]));
    save.addEventListener("click", async () => {
      save.disabled = true; save.textContent = "جارٍ الحفظ...";
      try { await call("admin_order_save", { order: S.orderIds }); S.saved = S.orderIds.slice(); S.orderDirty = false; toast("تم حفظ الترتيب ✓"); renderLists(); }
      catch (e) { toast(errText(e), true); save.disabled = false; save.textContent = "حفظ الترتيب"; }
    });
    reset.addEventListener("click", async () => {
      if (!confirm("العودة للترتيب الافتراضي (حسب الدولة)؟ سيُمسح الترتيب المحفوظ.")) return;
      try { await call("admin_order_save", { order: [] }); S.saved = []; S.orderIds = null; S.orderDirty = false; toast("رجع الترتيب الافتراضي"); renderLists(); } catch (e) { toast(errText(e), true); }
    });
    box.appendChild(bar);
    const list = h("ol", { class: "ordlist" }, []);
    /* نقل بطاقة من موضع i إلى موضع j (يبدأ العدّ من 0) */
    const moveTo = (i, j, focus) => {
      const a = S.orderIds; j = Math.max(0, Math.min(a.length - 1, j)); if (j === i || i < 0) { renderLists(); return; }
      const t = a.splice(i, 1)[0]; a.splice(j, 0, t); S.orderDirty = true; S.focus = Object.assign({ id: t }, focus); renderLists();
    };
    let dragFrom = -1;
    S.orderIds.forEach((id, i) => {
      const c = byId.get(id); if (!c) return;
      const n = S.orderIds.length;
      const pos = h("input", { class: "ordpos", type: "number", min: "1", max: String(n), value: String(i + 1), inputmode: "numeric", "aria-label": "ترتيب " + (c.placeholder ? c.countryAr : c.nameAr) + " (اكتب رقمًا ثم Enter)" });
      pos.dataset.id = id; pos.dataset.k = "pos";
      const commit = () => { const v = parseInt(pos.value, 10); if (!isNaN(v) && v !== i + 1) moveTo(i, v - 1, { k: "pos" }); else pos.value = String(i + 1); };
      pos.addEventListener("change", commit); pos.addEventListener("keydown", e => { if (e.key === "Enter") { e.preventDefault(); commit(); } });
      pos.addEventListener("focus", () => pos.select());
      const top = h("button", { class: "btn sm", type: "button", "aria-label": "نقل " + c.nameAr + " إلى الأول", title: "إلى الأول", text: "⤒" });
      const up = h("button", { class: "btn sm", type: "button", "aria-label": "تحريك " + c.nameAr + " للأعلى", text: "▲" }), dn = h("button", { class: "btn sm", type: "button", "aria-label": "تحريك " + c.nameAr + " للأسفل", text: "▼" });
      top.disabled = up.disabled = i === 0; dn.disabled = i === n - 1;
      top.addEventListener("click", () => moveTo(i, 0, { d: -2 })); up.addEventListener("click", () => moveTo(i, i - 1, { d: -1 })); dn.addEventListener("click", () => moveTo(i, i + 1, { d: 1 }));
      top.dataset.id = up.dataset.id = dn.dataset.id = id; top.dataset.d = "-2"; up.dataset.d = "-1"; dn.dataset.d = "1";
      const grip = h("span", { class: "grip", draggable: "true", title: "اسحب لتغيير الترتيب", "aria-hidden": "true", text: "⠿" });
      const row = h("li", { class: "ordrow" + (c.placeholder ? " ph" : "") }, [pos,
        h("span", { class: "ctry" }, [flagImg(c.countryCode || "un"), h("span", { text: c.countryAr })]),
        h("span", { class: "ordname", text: c.placeholder ? "بطاقة افتراضية" : c.nameAr }),
        h("span", { class: "tag " + (c.placeholder ? "off" : "live"), text: c.placeholder ? "افتراضية" : "منشورة" }),
        h("span", { class: "prow" }, [grip, top, up, dn])]);
      /* سحب وإفلات (بالماوس): اسحب المقبض ⠿ وأفلت على البطاقة المطلوبة */
      grip.addEventListener("dragstart", e => { dragFrom = i; row.classList.add("dragging"); try { e.dataTransfer.setData("text/plain", id); e.dataTransfer.effectAllowed = "move"; e.dataTransfer.setDragImage(row, 30, 20); } catch (x) {} });
      grip.addEventListener("dragend", () => { dragFrom = -1; row.classList.remove("dragging"); list.querySelectorAll(".over").forEach(x => x.classList.remove("over")); });
      row.addEventListener("dragover", e => { if (dragFrom < 0) return; e.preventDefault(); list.querySelectorAll(".over").forEach(x => x.classList.remove("over")); row.classList.add("over"); });
      row.addEventListener("drop", e => { if (dragFrom < 0) return; e.preventDefault(); const from = dragFrom; dragFrom = -1; moveTo(from, i, { k: "pos" }); });
      list.appendChild(row);
    });    box.appendChild(list);
    if (S.focus) {
      const sel = S.focus.k === "pos" ? 'input[data-id="' + S.focus.id + '"]' : 'button[data-id="' + S.focus.id + '"][data-d="' + S.focus.d + '"]:not(:disabled)';
      const t = list.querySelector(sel) || list.querySelector('button[data-id="' + S.focus.id + '"]:not(:disabled)') || list.querySelector('input[data-id="' + S.focus.id + '"]');
      if (t) { t.focus({ preventScroll: false }); if (t.tagName === "INPUT") t.select(); } S.focus = null;
    }
  }
  /* ---------- المحرّر ---------- */
  const newPhoto = () => ({ img: null, z: 1, ox: 0, oy: 0, dirty: false, clear: false, orig: null });
  function targets(cc, editId) {
    const live = S.pub.filter(x => x.active && x.id !== editId);
    const taken = new Set(); live.forEach(x => String(x.replaces || "").split(",").forEach(r => r && taken.add(r)));
    const out = [{ v: "", t: "إنشاء بطاقة جديدة (تُضاف بجانب بقية البطاقات)" }];
    const cn = CN(cc);
    if (cn && !taken.has("ph-" + cc)) out.push({ v: "ph-" + cc, t: "استبدال بطاقة «سيتم الإعلان قريبًا» — " + cn[1] });
    live.forEach(x => out.push({ v: x.id, t: "استبدال بطاقة: " + x.nameAr + " — " + x.countryAr }));
    return out;
  }
  function openSub(s) {
    const cc = s.countryCode, tg = targets(cc, "");
    S.ed = { mode: "new", rid: s.rid, id: "", replaces: "", src: s, photo: newPhoto(), target: tg.length > 1 && tg[1].v === "ph-" + cc ? "ph-" + cc : "",
      d: { nameAr: s.nameAr, nameEn: s.nameEn, countryCode: cc, positionAr: s.positionAr, positionEn: s.positionEn, bioAr: s.bioAr, bioEn: s.bioEn, achAr: s.achievements, achEn: "", email: s.email, phone: s.phone, whatsapp: s.whatsapp, website: s.website, showContact: !!s.showContact } };
    renderEditor();
    if (s.hasPhoto) loadPhoto(s.photoId, true);
  }
  function openPub(x) {
    S.ed = { mode: "edit", rid: "", id: x.id, replaces: x.replaces || "", src: null, photo: newPhoto(), target: "",
      d: { nameAr: x.nameAr, nameEn: x.nameEn, countryCode: x.countryCode, positionAr: x.positionAr, positionEn: x.positionEn, bioAr: x.bioAr, bioEn: x.bioEn, achAr: (x.achievements.ar || []).join("\n"), achEn: (x.achievements.en || []).join("\n"),
        email: (x.contact || {}).email || "", phone: (x.contact || {}).phone || "", whatsapp: (x.contact || {}).whatsapp || "", website: (x.contact || {}).website || "", showContact: !!Object.keys(x.contact || {}).length } };
    renderEditor();
    if (x.photoId) loadPhoto(x.photoId, false);
  }
  async function loadPhoto(fileId, dirtyAfter) {
    const ed = S.ed; if (!ed) return;
    try {
      const j = await call("admin_photo", { fileId });
      if (S.ed !== ed) return;
      const im = new Image();
      im.onload = () => { ed.photo.img = im; ed.photo.orig = im; ed.photo.dirty = !!dirtyAfter; drawAll(); };
      im.src = "data:image/jpeg;base64," + j.b64;
    } catch (e) { toast("تعذّر تحميل الصورة: " + errText(e), true); }
  }

  const val = id => ($("#" + id) ? $("#" + id).value.trim() : "");
  const lines = v => String(v || "").split(/\n+/).map(s => s.trim()).filter(Boolean);
  function readForm() {
    const cn = CN(val("e_country")) || ["", "", ""];
    return { nameAr: val("e_nameAr"), nameEn: val("e_nameEn"), countryCode: cn[0], countryAr: cn[1], countryEn: cn[2], positionAr: val("e_posAr"), positionEn: val("e_posEn"), bioAr: val("e_bioAr"), bioEn: val("e_bioEn"), achAr: val("e_achAr"), achEn: val("e_achEn"),
      email: val("e_email"), phone: val("e_phone"), whatsapp: val("e_wa").replace(/[\s()-]/g, ""), website: val("e_web"), showContact: $("#e_show").checked };
  }
  function fld(id, label, el, hint) { return h("div", { class: "f" }, [h("label", { for: id, text: label }), el, hint ? h("small", { text: hint }) : null]); }
  const inp = (id, v, extra) => { const e = h("input", Object.assign({ id, type: "text", maxlength: 160 }, extra || {})); e.value = v || ""; return e; };
  const ta = (id, v, rows) => { const e = h("textarea", { id, rows: rows || 4, maxlength: 1500 }); e.value = v || ""; return e; };

  function renderEditor() {
    const ed = S.ed, d = ed.d, s = ed.src, box = $("#editor");
    box.hidden = false; box.textContent = "";
    $("#panel").hidden = true;
    const sel = h("select", { id: "e_country" }, COUNTRIES.map(c => h("option", { value: c[0], text: c[1] }))); sel.value = d.countryCode;
    const priv = s ? h("div", { class: "privbox" }, [
      h("div", {}, [h("b", { text: "بيانات خاصة (لا تُنشر): " }), document.createTextNode("الهاتف " + (s.phone || "—") + " · البريد " + (s.email || "—") + " · واتساب " + (s.whatsapp || "—"))]),
      h("div", { text: "عدد المشاركين: " + (s.participants || "—") + " · نشر البطولة على قنواتهم: " + ({ yes: "نعم", no: "لا", unsure: "لم يُحدَّد" }[s.publish] || "—") + " · دعم الاتحاد: " + ({ yes: "نعم", no: "لا", unsure: "لم يُحدَّد" }[s.federation] || "—") }),
      h("div", { text: "وصل في: " + ago(s.ts) })]) : null;
    const show = h("input", { id: "e_show", type: "checkbox" }); show.checked = !!d.showContact;
    const tg = ed.mode === "new" ? targets(d.countryCode, "") : null;
    const target = ed.mode === "new" ? h("div", { class: "target" }, [h("label", { for: "target", text: "ماذا نفعل بهذا التسجيل؟" }), h("select", { id: "target" }, tg.map(o => h("option", { value: o.v, text: o.t })))]) :
      h("div", { class: "target" }, [h("b", { text: "تعديل بطاقة منشورة. " }), document.createTextNode(ed.replaces ? "هذه البطاقة تحل محل: " + (ed.replaces.indexOf("ph-") === 0 ? "بطاقة «سيتم الإعلان قريبًا»" : "بطاقة أخرى") + "." : "بطاقة مستقلة.")]);
    const form = h("div", {}, [
      h("h2", { id: "edT", text: ed.mode === "new" ? "مراجعة التسجيل: " + s.nameAr : "تعديل البطاقة: " + d.nameAr }), priv,
      h("div", { class: "row" }, [fld("e_nameAr", "الاسم بالعربية *", inp("e_nameAr", d.nameAr)), fld("e_nameEn", "الاسم بالإنجليزية", inp("e_nameEn", d.nameEn, { dir: "ltr" }))]),
      h("div", { class: "row" }, [fld("e_country", "الدولة *", sel), fld("e_posAr", "المنصب بالعربية *", inp("e_posAr", d.positionAr))]),
      fld("e_posEn", "المنصب بالإنجليزية", inp("e_posEn", d.positionEn, { dir: "ltr" })),
      fld("e_bioAr", "النبذة بالعربية", ta("e_bioAr", d.bioAr, 5)), fld("e_bioEn", "النبذة بالإنجليزية", ta("e_bioEn", d.bioEn, 4)),
      h("div", { class: "row" }, [fld("e_achAr", "الإنجازات بالعربية (سطر لكل إنجاز)", ta("e_achAr", d.achAr, 4)), fld("e_achEn", "الإنجازات بالإنجليزية", ta("e_achEn", d.achEn, 4))]),
      h("div", { class: "row" }, [fld("e_email", "البريد (للنشر إن وافقت)", inp("e_email", d.email, { dir: "ltr" })), fld("e_phone", "الهاتف", inp("e_phone", d.phone, { dir: "ltr" }))]),
      h("div", { class: "row" }, [fld("e_wa", "واتساب", inp("e_wa", d.whatsapp, { dir: "ltr" })), fld("e_web", "موقع / حساب رسمي", inp("e_web", d.website, { dir: "ltr" }))]),
      h("label", { class: "chk" }, [show, h("span", { text: "نشر بيانات التواصل أعلاه علنًا في البطاقة (اتركها فارغة إن لم يوافق صاحبها)" })])
    ]);
    const cw = h("div", { class: "pcw", id: "pcw" }, [h("canvas", { id: "pc", width: 320, height: 320, "aria-label": "معاينة الصورة، اسحب لتحريكها" })]);
    const zoom = h("input", { id: "zoom", type: "range", min: "1", max: "3", step: "0.01", value: "1", "aria-label": "تكبير الصورة" });
    const up = h("input", { id: "upl", type: "file", accept: "image/jpeg,image/png,image/webp", class: "sr" });
    const upBtn = h("label", { class: "btn sm", text: "رفع صورة بديلة" }, [up]);
    const clr = h("button", { class: "btn sm", type: "button", text: "إزالة الصورة" });
    const rst = h("button", { class: "btn sm", type: "button", text: "استعادة الأصلية" });
    const side = h("div", { class: "sticky" }, [
      h("h2", { text: "الصورة" }), h("div", { class: "photoed" }, [cw, zoom, h("div", { class: "prow" }, [upBtn, rst, clr])]),
      target, h("h2", { text: "معاينة البطاقة" }), h("div", { class: "preview", id: "pv" })]);
    const pub = h("button", { class: "btn fill big", type: "button", id: "pubBtn", text: ed.mode === "new" ? "اعتماد ونشر" : "حفظ وإعادة النشر" });
    const cancel = h("button", { class: "btn", type: "button", text: "إغلاق دون حفظ" });
    const acts = h("div", { class: "edactions" }, [pub, cancel]);
    if (ed.mode === "new" && s.status === "pending") { const rej = h("button", { class: "btn danger", type: "button", text: "رفض التسجيل" }); rej.addEventListener("click", reject); acts.appendChild(rej); }
    box.append(h("div", { class: "edgrid" }, [form, side]), acts, h("p", { class: "formerr", id: "edErr", role: "alert" }));
    if (ed.mode === "new" && $("#target")) $("#target").value = ed.target;
    // الأحداث
    box.oninput = box.onchange = schedulePreview;
    sel.addEventListener("change", () => { if (ed.mode !== "new") return; const t = targets(sel.value, ""); const ts = $("#target"); ts.textContent = ""; t.forEach(o => ts.appendChild(h("option", { value: o.v, text: o.t }))); ts.value = t.length > 1 && t[1].v === "ph-" + sel.value ? t[1].v : ""; schedulePreview(); });
    zoom.addEventListener("input", () => { ed.photo.z = +zoom.value; clampPhoto(); drawAll(); });
    up.addEventListener("change", () => { const f = up.files && up.files[0]; if (!f) return; if (!/^image\/(jpeg|png|webp)$/.test(f.type) || f.size > 12e6) { toast("صيغة الصورة غير مدعومة", true); return; } const im = new Image(), u = URL.createObjectURL(f); im.onload = () => { URL.revokeObjectURL(u); Object.assign(ed.photo, { img: im, z: 1, ox: 0, oy: 0, dirty: true, clear: false }); zoom.value = 1; drawAll(); }; im.src = u; });
    clr.addEventListener("click", () => { Object.assign(ed.photo, { img: null, dirty: true, clear: true }); drawAll(); });
    rst.addEventListener("click", () => { if (!ed.photo.orig) { toast("لا توجد صورة أصلية", true); return; } Object.assign(ed.photo, { img: ed.photo.orig, z: 1, ox: 0, oy: 0, dirty: ed.mode === "new", clear: false }); zoom.value = 1; drawAll(); });
    let drag = null;
    cw.addEventListener("pointerdown", e => { if (!ed.photo.img) return; drag = { x: e.clientX, y: e.clientY, ox: ed.photo.ox, oy: ed.photo.oy }; cw.setPointerCapture(e.pointerId); cw.classList.add("drag"); });
    cw.addEventListener("pointermove", e => { if (!drag) return; const k = 320 / cw.getBoundingClientRect().width; ed.photo.ox = drag.ox + (e.clientX - drag.x) * k; ed.photo.oy = drag.oy + (e.clientY - drag.y) * k; ed.photo.dirty = true; clampPhoto(); drawAll(); });
    ["pointerup", "pointercancel"].forEach(t => cw.addEventListener(t, () => { drag = null; cw.classList.remove("drag"); }));
    cancel.addEventListener("click", closeEditor);
    pub.addEventListener("click", publish);
    drawAll(); window.scrollTo(0, 0);
  }
  function closeEditor() { S.ed = null; $("#editor").hidden = true; $("#editor").textContent = ""; $("#panel").hidden = false; }

  function clampPhoto() {
    const P = S.ed.photo; if (!P.img) return;
    const base = Math.max(320 / P.img.naturalWidth, 320 / P.img.naturalHeight) * P.z, mx = Math.max(0, (P.img.naturalWidth * base - 320) / 2), my = Math.max(0, (P.img.naturalHeight * base - 320) / 2);
    P.ox = Math.min(mx, Math.max(-mx, P.ox)); P.oy = Math.min(my, Math.max(-my, P.oy));
  }
  function paint(cv, size) {
    const P = S.ed.photo, g = cv.getContext("2d"); g.fillStyle = "#050505"; g.fillRect(0, 0, size, size);
    if (!P.img) return false;
    const k = size / 320, base = Math.max(320 / P.img.naturalWidth, 320 / P.img.naturalHeight) * P.z, w = P.img.naturalWidth * base * k, hh = P.img.naturalHeight * base * k;
    g.drawImage(P.img, size / 2 - w / 2 + P.ox * k, size / 2 - hh / 2 + P.oy * k, w, hh); return true;
  }
  function drawAll() { const cv = $("#pc"); if (cv) { const has = paint(cv, 320); if (!has) { const g = cv.getContext("2d"); g.fillStyle = "#9aa8c8"; g.font = "700 18px Cairo, sans-serif"; g.textAlign = "center"; g.fillText("لا توجد صورة", 160, 165); } } schedulePreview(); }
  let pvT = 0; function schedulePreview() { clearTimeout(pvT); pvT = setTimeout(renderPreview, 120); }
  function renderPreview() {
    const box = $("#pv"); if (!box || !S.ed) return;
    const d = readForm(), P = S.ed.photo, cn = CN(d.countryCode);
    let av;
    if (P.img) { const c = document.createElement("canvas"); c.width = c.height = 160; paint(c, 160); av = h("img", { src: c.toDataURL("image/jpeg", .8), alt: "", width: 160, height: 160 }); } else av = h("img", { class: "dflt", src: "assets/leaders/avatar-default.webp", alt: "", width: 160, height: 155 });
    box.textContent = "";
    box.appendChild(h("article", { class: "lcard in" }, [h("div", { class: "pav" }, [av]), h("h3", { text: d.nameAr || "—" }), d.nameEn ? h("p", { class: "nen", text: d.nameEn, lang: "en" }) : null,
      h("span", { class: "ctry" }, [cn ? flagImg(cn[0]) : null, h("span", { text: cn ? cn[1] : "" })]), d.positionAr ? h("span", { class: "prole", text: d.positionAr }) : null,
      d.bioAr ? h("p", { class: "bio", text: d.bioAr.replace(/\n+/g, " ") }) : null, h("span", { class: "btn sm fill", text: "عرض الملف الشخصي" })]));
  }
  function exportB64() { const c = document.createElement("canvas"); c.width = c.height = 400; paint(c, 400); return c.toDataURL("image/jpeg", .86).split(",")[1]; }

  async function publish() {
    const ed = S.ed, d = readForm(), err = $("#edErr"); err.textContent = "";
    if (!d.nameAr || !d.positionAr || !d.countryCode) { err.textContent = ERR.missing; return; }
    const contact = d.showContact ? { email: d.email, phone: d.phone, whatsapp: d.whatsapp, website: d.website } : {};
    const tv = ed.mode === "edit" ? ed.replaces : ($("#target") ? $("#target").value : ""), tp = S.pub.find(x => x.id === tv), chain = tp && tp.replaces ? tv + "," + tp.replaces : tv;      // استبدال بطاقة حلّت محل افتراضية = يرث استبدالها
    const payload = { rid: ed.rid || "", id: ed.id || "", replaces: chain,
      data: { nameAr: d.nameAr, nameEn: d.nameEn, countryCode: d.countryCode, countryAr: d.countryAr, countryEn: d.countryEn, positionAr: d.positionAr, positionEn: d.positionEn, bioAr: d.bioAr, bioEn: d.bioEn, achievementsAr: lines(d.achAr), achievementsEn: lines(d.achEn), contact } };
    if (ed.photo.img && ed.photo.dirty) payload.photo = { b64: exportB64() };
    if (ed.photo.clear) payload.photoClear = true;
    const b = $("#pubBtn"); b.disabled = true; b.textContent = "جارٍ النشر...";
    try { const j = await call("admin_publish", payload); toast("تم النشر ✓ — ظهرت البطاقة في صفحة القيادات"); closeEditor(); await load(); S.tab = "published"; renderLists(); void j; }
    catch (e) { err.textContent = errText(e); b.disabled = false; b.textContent = ed.mode === "new" ? "اعتماد ونشر" : "حفظ وإعادة النشر"; }
  }
  async function reject() {
    const ed = S.ed; const note = prompt("سبب الرفض (اختياري، للمراجعة الداخلية فقط):"); if (note === null) return;
    try { await call("admin_reject", { rid: ed.rid, note }); toast("تم رفض التسجيل"); closeEditor(); await load(); } catch (e) { $("#edErr").textContent = errText(e); }
  }
})();

/* إدارة لجنة التحكيم من داخل لوحة القيادات: قائمة، إضافة/تعديل، صورة، ترتيب.
   دخول موحّد مع القيادات (توكن ld_t) على JUDGES_CONFIG.api. كل النصوص بـ textContent (لا innerHTML). */
(function () {
  "use strict";
  const isLocal = /^(localhost|127\.0\.0\.1|\[::1\]|)$/.test(location.hostname);
  const tok = () => { try { return localStorage.getItem("ld_t") || sessionStorage.getItem("ld_t") || ""; } catch (e) { return ""; } };
  const API = ((isLocal && /[?&]japi=([^&]+)/.exec(location.search)) ? decodeURIComponent(RegExp.$1) : "") || ((typeof JUDGES_CONFIG !== "undefined" && JUDGES_CONFIG.api) || "");
  const $ = s => document.querySelector(s);
  const J = { judges: [], order: [], tab: "list", edit: null, sec: "leaders", ids: null, dirty: false };
  const ERR = { auth: "انتهت الجلسة، سجّل الدخول من جديد.", missing: "أكمل الاسم والرقم.", dup_num: "هذا الرقم مستخدم لحَكَم آخر.", bad_photo: "تعذّر قبول الصورة.", forbidden: "ملف غير مسموح." };
  const errText = e => ERR[String(e && e.message)] || "تعذّر الاتصال، حاول مرة أخرى.";

  function h(tag, attrs, kids) {
    const e = document.createElement(tag);
    for (const k in (attrs || {})) { const v = attrs[k]; if (v == null || v === false) continue; if (k === "text") e.textContent = v; else if (k === "class") e.className = v; else e.setAttribute(k, v === true ? "" : v); }
    (kids || []).forEach(c => c && e.appendChild(typeof c === "string" ? document.createTextNode(c) : c));
    return e;
  }
  function toast(msg, bad) { const t = $("#toast"); t.textContent = msg; t.className = "toast" + (bad ? " err" : ""); t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => { t.hidden = true; }, bad ? 6000 : 3800); }
  async function callJ(action, extra) {
    const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 45000);
    try {
      const r = await fetch(API, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(Object.assign({ action, token: tok() }, extra || {})), signal: ctl.signal, redirect: "follow" });
      const j = await r.json();
      if (!j.ok) { if (j.error === "auth") jExpire(); throw new Error(j.error || "fail"); }
      return j;
    } finally { clearTimeout(to); }
  }

  /* ---------- الهيكل (يُبنى هنا ويُدرج بعد #panel) ---------- */
  const main = $("#main"), panel = $("#panel");
  if (!main || !panel) return;
  const sw = h("div", { class: "tabs secsw", id: "secSw", role: "tablist", hidden: true }, [
    h("button", { type: "button", role: "tab", "data-sec": "leaders", "aria-selected": "true", text: "القيادات" }),
    h("button", { type: "button", role: "tab", "data-sec": "judges", "aria-selected": "false", text: "لجنة التحكيم" })]);
  const jpanel = h("section", { id: "jpanel", hidden: true }, []);
  const jeditor = h("section", { id: "jeditor", class: "card", hidden: true }, []);
  main.insertBefore(sw, panel); panel.after(jpanel); jpanel.after(jeditor);

  const jbody = h("div", { id: "jbody", hidden: true }, []);
  jpanel.append(h("p", { class: "demo", id: "jBanner", hidden: true }), jbody);

  if (!API) { const b = $("#jBanner"); b.hidden = false; b.textContent = "لا يوجد رابط API في judges-config.js، لذلك لا تعمل إدارة لجنة التحكيم بعد."; }

  /* ---------- مزامنة الأقسام ---------- */
  function sync() {
    const lead = $("#login").hidden && !$("#login").parentElement.closest("[hidden]");     // دخول القيادات تم
    const edOpen = !$("#editor").hidden;
    sw.hidden = !lead || edOpen || !!J.edit;
    sw.querySelectorAll("[data-sec]").forEach(b => b.setAttribute("aria-selected", String(b.dataset.sec === J.sec)));
    const showJ = lead && !edOpen && J.sec === "judges";
    jpanel.hidden = !showJ || !!J.edit; jeditor.hidden = !(J.edit && lead);
    if (showJ || (lead && J.edit)) panel.hidden = true; else if (lead && !edOpen) panel.hidden = false;
    if (!lead) { jpanel.hidden = true; jeditor.hidden = true; }
  }
  sw.addEventListener("click", e => { const b = e.target.closest("[data-sec]"); if (!b) return; J.sec = b.dataset.sec; sync(); if (J.sec === "judges" && API && !J.judges.length) loadJ().catch(() => {}); });
  const mo = new MutationObserver(sync);
  ["#login", "#editor"].forEach(s => mo.observe($(s), { attributes: true, attributeFilter: ["hidden"] }));

  /* الدخول موحّد: نستخدم توكن لوحة القيادات (ld_t) */
  function jExpire() { J.edit = null; jbody.hidden = true; jbody.textContent = ""; toast("انتهت الجلسة. سجّل الدخول من جديد.", true); setTimeout(() => location.reload(), 1500); }

  async function loadJ() {
    const j = await callJ("admin_list");
    J.judges = j.judges || []; J.order = Array.isArray(j.order) ? j.order : [];
    jbody.hidden = false; renderJ();
  }

  /* ---------- القوائم ---------- */
  const roleLbl = r => r === "chief" ? "رئيس اللجنة" : "حَكَم";
  function ordered() {                                           // رئيس اللجنة أولًا ثم حسب الترتيب المحفوظ ثم الرقم
    const pos = id => { const i = J.order.indexOf(id); return i < 0 ? 1e6 : i; };
    return J.judges.slice().sort((a, b) => (a.role === "chief" ? 0 : 1) - (b.role === "chief" ? 0 : 1) || pos(a.id) - pos(b.id) || (+a.num) - (+b.num));
  }
  function renderJ() {
    jbody.textContent = "";
    const tabs = h("div", { class: "tabs", role: "tablist" }, [
      h("button", { type: "button", role: "tab", "data-jt": "list", "aria-selected": String(J.tab === "list"), text: "الحكام " }, [h("b", { text: String(J.judges.length) })]),
      h("button", { type: "button", role: "tab", "data-jt": "order", "aria-selected": String(J.tab === "order"), text: "ترتيب البطاقات" })]);
    const add = h("button", { class: "btn fill sm", type: "button", text: "+ إضافة حَكَم" }), ref = h("button", { class: "tbtn", type: "button", text: "تحديث" });
    add.addEventListener("click", () => openEd(null));
    ref.addEventListener("click", async () => { try { await loadJ(); toast("تم التحديث"); } catch (e) { toast(errText(e), true); } });
    tabs.append(add, ref);
    tabs.addEventListener("click", e => { const b = e.target.closest("[data-jt]"); if (!b) return; J.tab = b.dataset.jt; renderJ(); });
    jbody.appendChild(tabs);
    if (J.tab === "order") return renderJOrder();
    const box = h("div", { class: "alist", "aria-live": "polite" }, []);
    if (!J.judges.length) box.appendChild(h("p", { class: "muted", text: "لا يوجد حكام بعد. اضغط «إضافة حَكَم»." }));
    ordered().forEach(x => box.appendChild(jRow(x)));
    jbody.appendChild(box);
  }
  function jRow(x) {
    const av = h("div", { class: "pav" }, [x.photo ? h("img", { src: x.photo, alt: "", width: 64, height: 64, loading: "lazy" }) : h("img", { class: "dflt", src: "assets/leaders/avatar-default.webp", alt: "", width: 64, height: 62 })]);
    const meta = h("div", { class: "meta" }, [h("span", { text: roleLbl(x.role) }), h("span", { text: "رقم " + x.num }), h("span", { class: "tag " + (x.active ? "live" : "off"), text: x.active ? "منشور" : "غير منشور" })]);
    const ed = h("button", { class: "btn sm fill", type: "button", text: "تعديل" }); ed.addEventListener("click", () => openEd(x));
    const acts = h("div", { class: "acts" }, [ed]);
    const tg = h("button", { class: "btn sm" + (x.active ? " danger" : ""), type: "button", text: x.active ? "إلغاء النشر" : "إعادة النشر" });
    tg.addEventListener("click", async () => { if (x.active && !confirm("إلغاء نشر «" + x.name + "»؟")) return; try { await callJ(x.active ? "admin_unpublish" : "admin_publish_again", { id: x.id }); await loadJ(); toast("تم"); } catch (e) { toast(errText(e), true); } });
    const del = h("button", { class: "btn sm danger", type: "button", text: "حذف نهائي" });
    del.addEventListener("click", async () => { if (!confirm("حذف «" + x.name + "» نهائيًا؟ لا يمكن التراجع.")) return; try { await callJ("admin_delete", { id: x.id }); await loadJ(); toast("تم الحذف نهائيًا"); } catch (e) { toast(errText(e), true); } });
    acts.append(tg, del);
    return h("article", { class: "arow" }, [av, h("div", {}, [h("h3", { text: x.name }), meta]), acts]);
  }

  /* ---------- الترتيب ---------- */
  function renderJOrder() {
    const all = ordered(), idsNow = all.map(x => x.id);
    if (!J.dirty || !J.ids) J.ids = idsNow; else { const keep = J.ids.filter(i => idsNow.indexOf(i) >= 0); J.ids = keep.concat(idsNow.filter(i => keep.indexOf(i) < 0)); }
    const byId = new Map(all.map(x => [x.id, x]));
    const save = h("button", { class: "btn fill", type: "button", text: J.dirty ? "حفظ الترتيب" : "الترتيب محفوظ" }); save.disabled = !J.dirty;
    save.addEventListener("click", async () => { save.disabled = true; try { await callJ("admin_order_save", { order: J.ids }); J.order = J.ids.slice(); J.dirty = false; toast("تم حفظ الترتيب ✓"); renderJ(); } catch (e) { toast(errText(e), true); save.disabled = false; } });
    jbody.append(h("p", { class: "muted", text: "رئيس اللجنة يظهر دائمًا أولًا في الصفحة العامة؛ الترتيب هنا يخص الحكام. حرّك بالأسهم ثم اضغط «حفظ الترتيب»." }), h("div", { class: "prow" }, [save]));
    const list = h("ol", { class: "ordlist" }, []);
    const move = (i, j) => { const a = J.ids; j = Math.max(0, Math.min(a.length - 1, j)); if (i === j) return; a.splice(j, 0, a.splice(i, 1)[0]); J.dirty = true; renderJ(); };
    J.ids.forEach((id, i) => {
      const x = byId.get(id); if (!x) return;
      const top = h("button", { class: "btn sm", type: "button", title: "إلى الأول", "aria-label": "نقل " + x.name + " إلى الأول", text: "⤒" }), up = h("button", { class: "btn sm", type: "button", "aria-label": "للأعلى", text: "▲" }), dn = h("button", { class: "btn sm", type: "button", "aria-label": "للأسفل", text: "▼" });
      top.disabled = up.disabled = i === 0; dn.disabled = i === J.ids.length - 1;
      top.addEventListener("click", () => move(i, 0)); up.addEventListener("click", () => move(i, i - 1)); dn.addEventListener("click", () => move(i, i + 1));
      list.appendChild(h("li", { class: "ordrow" }, [h("span", { class: "ordpos", text: String(i + 1) }), h("span", { class: "ordname", text: x.name }), h("span", { class: "tag " + (x.role === "chief" ? "live" : "off"), text: roleLbl(x.role) }), h("span", { class: "prow" }, [top, up, dn])]));
    });
    jbody.appendChild(list);
  }

  /* ---------- المحرر ---------- */
  const newPhoto = () => ({ img: null, z: 1, ox: 0, oy: 0, dirty: false, clear: false, orig: null });
  function openEd(x) {
    J.edit = { id: x ? x.id : "", photo: newPhoto(), d: x ? { name: x.name, nameEn: x.nameEn, role: x.role, num: x.num, fit: x.fit, notes: x.notes || "" } : { name: "", nameEn: "", role: "judge", num: "", fit: "cover", notes: "" } };
    renderEd(); sync(); window.scrollTo(0, 0);
    if (x && x.photo) loadPhoto(x.id);
  }
  function closeEd() { J.edit = null; jeditor.textContent = ""; sync(); }
  async function loadPhoto(id) {
    const ed = J.edit; if (!ed) return;
    try {
      const j = await callJ("admin_photo", { id });
      if (J.edit !== ed) return;
      const im = new Image(); im.onload = () => { ed.photo.img = im; ed.photo.orig = im; draw(); }; im.src = "data:image/jpeg;base64," + j.b64;
    } catch (e) { toast("تعذّر تحميل الصورة: " + errText(e), true); }
  }
  const jv = id => ($("#" + id) ? $("#" + id).value.trim() : "");
  function fld(id, label, el, hint) { return h("div", { class: "f" }, [h("label", { for: id, text: label }), el, hint ? h("small", { text: hint }) : null]); }
  const inp = (id, v, extra) => { const e = h("input", Object.assign({ id, type: "text", maxlength: 80 }, extra || {})); e.value = v || ""; return e; };
  function sel(id, opts, v) { const s = h("select", { id }, opts.map(o => h("option", { value: o[0], text: o[1] }))); s.value = v; return s; }

  function renderEd() {
    const ed = J.edit, d = ed.d; jeditor.textContent = "";
    const notes = h("textarea", { id: "j_notes", rows: 3, maxlength: 300 }); notes.value = d.notes;
    const form = h("div", {}, [
      h("h2", { text: ed.id ? "تعديل: " + d.name : "إضافة حَكَم" }),
      h("div", { class: "row" }, [fld("j_name", "الاسم بالعربية *", inp("j_name", d.name)), fld("j_nameEn", "الاسم بالإنجليزية", inp("j_nameEn", d.nameEn, { dir: "ltr" }))]),
      h("div", { class: "row" }, [fld("j_role", "الدور", sel("j_role", [["judge", "حَكَم"], ["chief", "رئيس اللجنة"]], d.role)), fld("j_num", "الرقم * (أرقام فقط، حتى 4)", inp("j_num", d.num, { inputmode: "numeric", maxlength: 4, dir: "ltr" }), "فريد لكل حَكَم")]),
      fld("j_fit", "عرض الصورة في البطاقة", sel("j_fit", [["cover", "ملء البطاقة (cover)"], ["contain", "الصورة كاملة (contain)"]], d.fit)),
      fld("j_notes", "ملاحظات خاصة (لا تُنشر)", notes)]);
    const cw = h("div", { class: "pcw", id: "jpcw" }, [h("canvas", { id: "jpc", width: 320, height: 320, "aria-label": "معاينة الصورة، اسحب لتحريكها" })]);
    const zoom = h("input", { id: "jzoom", type: "range", min: "1", max: "3", step: "0.01", value: "1", "aria-label": "تكبير الصورة" });
    const up = h("input", { type: "file", accept: "image/jpeg,image/png,image/webp", class: "sr" });
    const upBtn = h("label", { class: "btn sm", text: "رفع صورة" }, [up]);
    const clr = h("button", { class: "btn sm", type: "button", text: "إزالة الصورة" }), rst = h("button", { class: "btn sm", type: "button", text: "استعادة الأصلية" });
    const side = h("div", { class: "sticky" }, [h("h2", { text: "الصورة" }), h("div", { class: "photoed" }, [cw, zoom, h("div", { class: "prow" }, [upBtn, rst, clr])])]);
    const save = h("button", { class: "btn fill big", type: "button", text: ed.id ? "حفظ" : "إضافة ونشر" }), cancel = h("button", { class: "btn", type: "button", text: "إغلاق دون حفظ" });
    jeditor.append(h("div", { class: "edgrid" }, [form, side]), h("div", { class: "edactions" }, [save, cancel]), h("p", { class: "formerr", id: "jEdErr", role: "alert" }));
    $("#j_num").addEventListener("input", e => { e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4); });
    zoom.addEventListener("input", () => { ed.photo.z = +zoom.value; ed.photo.dirty = true; clamp(); draw(); });
    up.addEventListener("change", () => { const f = up.files && up.files[0]; if (!f) return; if (!/^image\/(jpeg|png|webp)$/.test(f.type) || f.size > 12e6) { toast("صيغة الصورة غير مدعومة", true); return; } const im = new Image(), u = URL.createObjectURL(f); im.onload = () => { URL.revokeObjectURL(u); Object.assign(ed.photo, { img: im, z: 1, ox: 0, oy: 0, dirty: true, clear: false }); zoom.value = 1; draw(); }; im.src = u; });
    clr.addEventListener("click", () => { Object.assign(ed.photo, { img: null, dirty: true, clear: true }); draw(); });
    rst.addEventListener("click", () => { if (!ed.photo.orig) { toast("لا توجد صورة أصلية", true); return; } Object.assign(ed.photo, { img: ed.photo.orig, z: 1, ox: 0, oy: 0, dirty: false, clear: false }); zoom.value = 1; draw(); });
    let drag = null;
    cw.addEventListener("pointerdown", e => { if (!ed.photo.img) return; drag = { x: e.clientX, y: e.clientY, ox: ed.photo.ox, oy: ed.photo.oy }; cw.setPointerCapture(e.pointerId); });
    cw.addEventListener("pointermove", e => { if (!drag) return; const k = 320 / cw.getBoundingClientRect().width; ed.photo.ox = drag.ox + (e.clientX - drag.x) * k; ed.photo.oy = drag.oy + (e.clientY - drag.y) * k; ed.photo.dirty = true; clamp(); draw(); });
    ["pointerup", "pointercancel"].forEach(t => cw.addEventListener(t, () => { drag = null; }));
    cancel.addEventListener("click", closeEd); save.addEventListener("click", doSave);
    draw();
  }
  function clamp() {
    const P = J.edit.photo; if (!P.img) return;
    const base = Math.max(320 / P.img.naturalWidth, 320 / P.img.naturalHeight) * P.z, mx = Math.max(0, (P.img.naturalWidth * base - 320) / 2), my = Math.max(0, (P.img.naturalHeight * base - 320) / 2);
    P.ox = Math.min(mx, Math.max(-mx, P.ox)); P.oy = Math.min(my, Math.max(-my, P.oy));
  }
  function paint(cv, size) {
    const P = J.edit.photo, g = cv.getContext("2d"); g.fillStyle = "#050505"; g.fillRect(0, 0, size, size);
    if (!P.img) return false;
    const k = size / 320, base = Math.max(320 / P.img.naturalWidth, 320 / P.img.naturalHeight) * P.z, w = P.img.naturalWidth * base * k, hh = P.img.naturalHeight * base * k;
    g.drawImage(P.img, size / 2 - w / 2 + P.ox * k, size / 2 - hh / 2 + P.oy * k, w, hh); return true;
  }
  function draw() { const cv = $("#jpc"); if (!cv || !J.edit) return; if (!paint(cv, 320)) { const g = cv.getContext("2d"); g.fillStyle = "#9aa8c8"; g.font = "700 18px Cairo, sans-serif"; g.textAlign = "center"; g.fillText("لا توجد صورة", 160, 165); } }
  function exportB64() { const c = document.createElement("canvas"); c.width = c.height = 400; paint(c, 400); return c.toDataURL("image/jpeg", .86).split(",")[1]; }

  async function doSave() {
    const ed = J.edit, err = $("#jEdErr"); err.textContent = "";
    const data = { name: jv("j_name"), nameEn: jv("j_nameEn"), role: jv("j_role"), num: jv("j_num").replace(/\D/g, "").slice(0, 4), fit: jv("j_fit"), notes: jv("j_notes") };
    if (!data.name || !data.num) { err.textContent = ERR.missing; return; }
    const payload = { id: ed.id, data };
    if (ed.photo.img && ed.photo.dirty) payload.photo = { b64: exportB64() };
    if (ed.photo.clear) payload.photoClear = true;
    const b = jeditor.querySelector(".edactions .fill"), t0 = b.textContent; b.disabled = true; b.textContent = "جارٍ الحفظ...";
    try { await callJ("admin_publish", payload); toast("تم الحفظ ✓"); closeEd(); await loadJ(); }
    catch (e) { err.textContent = errText(e); b.disabled = false; b.textContent = t0; }
  }
  sync();
})();

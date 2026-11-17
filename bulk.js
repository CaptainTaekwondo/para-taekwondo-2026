/* تسجيل بالجملة (Excel) + إرسال روابط الفيديو بالجملة، للمدربين اللي عندهم أعداد كبيرة.
   بيشتغل فوق player.js عن طريق window.PTK_X. المكتبة ExcelJS بتتحمّل عند أول ضغطة بس.
   - التسجيل: مقفول بـ CONFIG.bulkOpen (وضع التجربة ?demo=1 على localhost بيفتحه).
   - الفيديو: بيتبع videoOpen زي باقي إرسال الفيديو. */
(() => {
  "use strict";
  const X = window.PTK_X; if (!X) return;
  const C = (typeof CONFIG !== "undefined" && CONFIG) || {};
  const REG_OPEN = X.DEMO || C.bulkOpen === true;
  const $ = X.$;
  const EXJS = "https://cdnjs.cloudflare.com/ajax/libs/exceljs/4.4.0/exceljs.min.js";
  const PWD = "CAPTKD2026", MAXROWS = 200, FIRST = 3, VER = 2;
  const AGE_DATE = (C.ageDate && /^\d{4}-\d{2}-\d{2}$/.test(C.ageDate) ? C.ageDate : "2026-12-31").split("-").map(Number);
  const AR = /[؀-ۿ]/, EN = /[A-Za-z]/;

  /* ---------- النصوص ---------- */
  const S = {
    ar: {
      regTitle: "تسجيل بالجملة بملف Excel", regHint: "للأعداد الكبيرة: حمّل النموذج، املأه، ارفعه، راجع الأخطاء وأضف الصور، ثم أكّد التسجيل.",
      dlPara: "تحميل نموذج لاعبي البارا", dlSup: "تحميل نموذج اللاعبين الداعمين", upload: "رفع النموذج",
      vidTitle: "إرسال الروابط بملف Excel", vidHint: "النموذج فيه كود كل لاعب واسمه ومكان الرابط فقط.", dlVid: "تحميل نموذج الروابط",
      loading: "جاري تجهيز الملف…", libFail: "تعذّر تحميل مكتبة Excel. تأكد من الاتصال وجرّب مرة أخرى.",
      badFile: "الملف مش نموذج صحيح. حمّل النموذج من الموقع واستخدمه كما هو.", badType: "النموذج ده لنوع تاني. حمّل النموذج المناسب.",
      badCoach: "النموذج ده متحمّل لمدرب تاني. حمّل نموذجك من حسابك.", oldVer: "نسخة النموذج قديمة. حمّل نموذجًا جديدًا.",
      empty: "الملف فاضي: مفيش بيانات تحت العناوين.", tooMany: "عدد الصفوف أكبر من المسموح ({n}).", needLogin: "ادخل بكود المدرب أولًا.",
      hN: "م", hAr: "الاسم بالعربي", hEn: "الاسم بالإنجليزي", hGender: "النوع", hBirth: "تاريخ الميلاد", hBelt: "الحزام", hPara: "تصنيف البارا", hClub: "النادي", hGuard: "ولي الأمر (تحت 18 سنة)", hNote: "ملاحظات الموقع", photosPrep: "جاري تجهيز الصور", photosDone: "تم تجهيز {n} صورة", checkedAll: "تم التأكد من الروابط", hAge: "السن (يتحسب)", hCat: "الفئة العمرية (تتحسب)", hLevel: "المستوى (يتحسب)", hDial: "مفتاح الدولة", hPhone: "رقم التليفون (اختياري)",
      hCode: "كود اللاعب", hName: "الاسم", hLink: "رابط الفيديو (يوتيوب)",
      male: "ذكر | Male", female: "أنثى | Female",
      eReq: "مطلوب", eName: "الاسم قصير جدًا", eAr: "اكتب الاسم بحروف عربية", eEn: "اكتب الاسم بحروف إنجليزية", eGender: "اختر النوع", eBirth: "تاريخ الميلاد غير صحيح (سنة-شهر-يوم)",
      eBelt: "اختر الحزام من القائمة", ePara: "اختر تصنيف البارا من القائمة", eClub: "اختر النادي من القائمة", eGuard: "اسم ولي الأمر مطلوب لمن هو تحت 18 سنة", ePhone: "رقم التليفون غير صحيح (اختر مفتاح الدولة واكتب الرقم)", eDial: "اختر مفتاح الدولة", lvlNote: "الأعمدة الرمادية بتتحسب لوحدها، ماتكتبش فيها.", phNote: "التليفون: لو سبته فاضي هيتسجّل برقم المدرب.",
      eDupFile: "مكرر في الملف (صف {r})", eDupSaved: "مسجّل بالفعل بكود {c}", ePhoto: "الصورة مطلوبة", eImg: "تعذّر قراءة الصورة",
      eCode: "الكود مش من لاعبيك", eLink: "رابط يوتيوب غير صحيح", eMissing: "الفيديو غير موجود أو خاص", eNetLink: "تعذّر التأكد من الرابط (النت)",
      stOk: "سليم", stErr: "فيه خطأ", stPhoto: "ينقصه صورة", stDone: "تم", stSend: "جاري الإرسال…", stWait: "جاري التأكد…", stSkip: "بدون رابط",
      title: "مراجعة النموذج", sumOk: "سليم", sumErr: "فيه أخطاء", sumPhoto: "بدون صورة", sumRows: "الصفوف",
      reDl: "تحميل الملف بعد التصحيح", another: "رفع ملف آخر", close: "إغلاق", confirm: "تأكيد التسجيل ({n})", confirmVid: "حفظ الروابط ({n})", multiPh: "رفع صور متعددة (بالترتيب)",
      multiNote: "الصور بتتوزّع بالترتيب (حسب اسم الملف) على اللاعبين اللي بدون صورة. راجع الصور بعد التوزيع.",
      pickPhoto: "اختر صورة", needAll: "أكمل الصور وصحّح الأخطاء الأول", progress: "تم {a} من {b}", doneTitle: "تم التسجيل", failedN: "تعذّر {n}",
      zip: "تحميل كل البطاقات (ZIP)", csv: "تحميل قائمة الأكواد (CSV)", retry: "إعادة محاولة المتعثر", cardSave: "جاري حفظ البطاقات على السيرفر…", cardOk: "تم حفظ البطاقات.", cardFail: "بعض البطاقات ما اتحفظتش على السيرفر، لكن تقدر تحمّلها من هنا.",
      saved: "تم حفظ {n} رابط", notChanged: "بدون تغيير", expired: "انتهت صلاحية الدخول. ادخل بكود المدرب من جديد.", srvErr: "تعذّر الحفظ، جرّب تاني.", netErr: "مشكلة في الاتصال.",
      leaveWarn: "فيه عملية شغّالة، متأكد؟", reload: "حدّث قائمتك", note: "بعد الانتهاء اضغط «خروج» ثم ادخل لاعبيني من جديد لتحديث القائمة.",
      instr: "تعليمات", i1: "املأ الصفوف الملوّنة فقط (حتى {n} لاعب). كل صف = لاعب.", i2: "اختر من القوائم المنسدلة (النوع، الحزام، التصنيف، النادي).", i3: "تاريخ الميلاد بصيغة: 2015-03-27.", i4: "الصور بتتضاف بعد رفع الملف في الموقع.", i5: "ما تغيّرش العناوين ولا الصفوف المقفولة.", i6: "مثال", dateHint: "سنة-شهر-يوم",
    },
    en: {
      regTitle: "Bulk registration with Excel", regHint: "For large numbers: download the template, fill it, upload it, review errors and add photos, then confirm.",
      dlPara: "Download Para players template", dlSup: "Download Supporting players template", upload: "Upload the template",
      vidTitle: "Send links with Excel", vidHint: "The template has each player's code, name and a place for the link only.", dlVid: "Download links template",
      loading: "Preparing the file…", libFail: "Could not load the Excel library. Check your connection and try again.",
      badFile: "This is not a valid template. Download it from the site and use it as is.", badType: "This template is for another type. Download the right one.",
      badCoach: "This template belongs to another coach. Download yours from your account.", oldVer: "Old template version. Download a new one.",
      empty: "The file is empty: no data under the headers.", tooMany: "Too many rows (max {n}).", needLogin: "Sign in with the coach code first.",
      hN: "#", hAr: "Name (Arabic)", hEn: "Name (English)", hGender: "Gender", hBirth: "Date of birth", hBelt: "Belt", hPara: "Para class", hClub: "Club", hGuard: "Guardian (under 18)", hNote: "Site notes", photosPrep: "Preparing photos", photosDone: "{n} photos ready", checkedAll: "Links checked", hAge: "Age (auto)", hCat: "Age category (auto)", hLevel: "Level (auto)", hDial: "Country code", hPhone: "Phone number (optional)",
      hCode: "Player code", hName: "Name", hLink: "Video link (YouTube)",
      male: "ذكر | Male", female: "أنثى | Female",
      eReq: "Required", eName: "Name is too short", eAr: "Write the name in Arabic letters", eEn: "Write the name in English letters", eGender: "Choose the gender", eBirth: "Invalid date of birth (year-month-day)",
      eBelt: "Choose the belt from the list", ePara: "Choose the para class from the list", eClub: "Choose the club from the list", eGuard: "Guardian name is required under 18", ePhone: "Invalid phone number (choose the country code and type the number)", eDial: "Choose the country code", lvlNote: "Grey columns are calculated, do not type in them.", phNote: "Phone: if left empty the coach number is used.",
      eDupFile: "Duplicate in the file (row {r})", eDupSaved: "Already registered with code {c}", ePhoto: "Photo is required", eImg: "Could not read the image",
      eCode: "This code is not one of your players", eLink: "Invalid YouTube link", eMissing: "Video not found or private", eNetLink: "Could not verify the link (network)",
      stOk: "OK", stErr: "Has errors", stPhoto: "Needs photo", stDone: "Done", stSend: "Sending…", stWait: "Checking…", stSkip: "No link",
      title: "Review the template", sumOk: "OK", sumErr: "With errors", sumPhoto: "No photo", sumRows: "Rows",
      reDl: "Download the corrected file", another: "Upload another file", close: "Close", confirm: "Confirm registration ({n})", confirmVid: "Save links ({n})", multiPh: "Upload many photos (in order)",
      multiNote: "Photos are assigned in order (by file name) to players without a photo. Check them afterwards.",
      pickPhoto: "Choose photo", needAll: "Add all photos and fix the errors first", progress: "{a} of {b} done", doneTitle: "Registered", failedN: "{n} failed",
      zip: "Download all cards (ZIP)", csv: "Download codes list (CSV)", retry: "Retry the failed", cardSave: "Saving cards to the server…", cardOk: "Cards saved.", cardFail: "Some cards were not saved on the server, but you can download them here.",
      saved: "{n} links saved", notChanged: "Unchanged", expired: "Your sign-in expired. Sign in with the coach code again.", srvErr: "Could not save, try again.", netErr: "Connection problem.",
      leaveWarn: "A task is running, are you sure?", reload: "Refresh your list", note: "When done press “Exit”, then open My Players again to refresh the list.",
      instr: "Instructions", i1: "Fill only the coloured rows (up to {n} players). One row = one player.", i2: "Use the dropdown lists (gender, belt, class, club).", i3: "Date of birth format: 2015-03-27.", i4: "Photos are added on the site after uploading the file.", i5: "Do not change the headers or the locked cells.", i6: "Example", dateHint: "year-month-day",
    },
  };
  const s = (k, o) => { let v = (S[X.lang] || S.ar)[k] || S.ar[k] || k; if (o) Object.keys(o).forEach((a) => (v = v.replace("{" + a + "}", o[a]))); return v; };
  const both = (k) => S.ar[k] + " / " + S.en[k];   // عناوين النموذج ثنائية اللغة
  const esc = (v) => String(v == null ? "" : v).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const el = (tag, cls, html) => { const e = document.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  /* ---------- ExcelJS ---------- */
  let exP = null;
  const loadEx = () => exP || (exP = new Promise((res, rej) => {
    if (window.ExcelJS) return res(window.ExcelJS);
    const sc = document.createElement("script"); sc.src = EXJS; sc.onload = () => res(window.ExcelJS); sc.onerror = () => { exP = null; rej(new Error("lib")); }; document.head.appendChild(sc);
  }));
  const cellVal = (c) => {
    let v = c ? c.value : null;
    if (v && typeof v === "object" && !(v instanceof Date)) { if (v.richText) v = v.richText.map((r) => r.text).join(""); else if (v.result !== undefined) v = v.result; else if (v.text !== undefined) v = v.text; else if (v.hyperlink) v = v.text || v.hyperlink; }
    return v == null ? "" : v;
  };
  const txt = (v) => (v instanceof Date ? "" : String(v == null ? "" : v)).replace(/\s+/g, " ").trim();
  const dig = (v) => String(v).replace(/[٠-٩]/g, (c) => "٠١٢٣٤٥٦٧٨٩".indexOf(c)).replace(/[۰-۹]/g, (c) => "۰۱۲۳۴۵۶۷۸۹".indexOf(c));
  const pad = (n) => String(n).padStart(2, "0");
  function dateStr(v) {
    if (v instanceof Date) return isNaN(v) ? "" : v.getUTCFullYear() + "-" + pad(v.getUTCMonth() + 1) + "-" + pad(v.getUTCDate());
    if (typeof v === "number" && v > 1000 && v < 80000) return dateStr(new Date(Math.round((v - 25569) * 86400000)));
    const x = dig(txt(v)); let m;
    const okD = (y, mo, d) => { const t2 = new Date(Date.UTC(+y, +mo - 1, +d)); return t2.getUTCFullYear() === +y && t2.getUTCMonth() === +mo - 1 && t2.getUTCDate() === +d; };
    if ((m = x.match(/^(\d{4})[-\/.](\d{1,2})[-\/.](\d{1,2})$/)) && okD(m[1], m[2], m[3])) return m[1] + "-" + pad(m[2]) + "-" + pad(m[3]);
    if ((m = x.match(/^(\d{1,2})[-\/.](\d{1,2})[-\/.](\d{4})$/)) && okD(m[3], m[2], m[1])) return m[3] + "-" + pad(m[2]) + "-" + pad(m[1]);
    return "";
  }
  const norm = (v) => String(v || "").replace(/[أإآ]/g, "ا").replace(/ى/g, "ي").replace(/ة/g, "ه").replace(/[ً-ْـ]/g, "").toLowerCase().trim();
  const genderOf = (v) => { const x = norm(txt(v)); if (!x) return ""; if (/انثى|female|^f$|^2$/.test(x)) return "f"; if (/ذكر|male|^m$|^1$/.test(x)) return "m"; return ""; };
  const beltOf = (v) => { const x = norm(txt(v)).replace(/^الحزام\s*/, ""); if (!x) return ""; const b = X.BELTS.find((b) => x.includes(norm(b[1]).replace(/^ال/, "")) || x.includes(b[2].toLowerCase())); return b ? b[0] : ""; };
  const paraOf = (v) => { const x = txt(v).toUpperCase(); const m = x.match(/P\s?(10|20|31|32|33|34|40|50|60|70)/); if (m) return "P" + m[1]; return /\bNA\b/.test(x) ? "NA" : ""; };
  const clubOf = (v, clubs) => { const x = norm(txt(v)); if (!x) return -1; return clubs.findIndex((c) => norm(c.ar) === x || norm(c.en) === x || x === norm(c.ar + " | " + c.en)); };
  const beltLbl = (b) => b[1] + " | " + b[2];
  const paraLbl = (p) => p[0] + " | " + p[1];
  const clubLbl = (c) => (c.ar && c.en ? c.ar + " | " + c.en : c.ar || c.en);
  const genderLbl = (g) => (g === "m" ? S.ar.male : g === "f" ? S.ar.female : "");

  /* ---------- أدوات واجهة مشتركة ---------- */
  let task = 0;
  window.addEventListener("beforeunload", (e) => { if (task > 0) { e.preventDefault(); e.returnValue = ""; } });
  function download(blob, name) { const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 8000); }
  const xlsxBlob = async (wb) => new Blob([await wb.xlsx.writeBuffer()], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
  function modal(title) {
    const bg = el("div", "bk-bg"), box = el("div", "bk-box"); box.setAttribute("role", "dialog"); box.setAttribute("aria-modal", "true");
    const hd = el("div", "bk-hd"), h = el("h2", "", esc(title)), x = el("button", "bk-x", "×"); x.type = "button"; x.setAttribute("aria-label", s("close"));
    hd.append(h, x); const body = el("div", "bk-body"); box.append(hd, body); bg.appendChild(box); document.body.appendChild(bg); document.documentElement.classList.add("guide-lock");
    const close = () => { if (task > 0 && !confirm(s("leaveWarn"))) return; bg.remove(); document.documentElement.classList.remove("guide-lock"); };
    x.addEventListener("click", close); bg.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); }); x.focus();
    return { bg, box, body, h, close };
  }
  function toast(host, msg, bad, spin) {
    let n = host.querySelector(".bk-msg"); if (!n) { n = el("p", "bk-msg"); host.prepend(n); }
    n.textContent = ""; if (spin && msg) { const i = el("i", "bk-spin"); i.setAttribute("aria-hidden", "true"); n.appendChild(i); n.dataset.spin = "1"; } else delete n.dataset.spin;
    n.appendChild(document.createTextNode(msg || "")); n.className = "bk-msg" + (bad ? " bad" : ""); n.hidden = !msg; n.setAttribute("role", "status");
  }
  /* مؤشر تحميل: دوّارة + نص + شريط تقدّم */
  function progress(host) {
    const w = el("div", "bk-pg"); w.setAttribute("role", "status");
    w.innerHTML = '<i class="bk-spin" aria-hidden="true"></i><div class="bk-pgt"><span></span><div class="bk-pbar"><b></b></div></div>'; host.prepend(w);
    const tx = w.querySelector("span"), fl = w.querySelector("b"), sp = w.querySelector(".bk-spin");
    return {
      set(txt, fr) { const p = Math.round(Math.max(0, Math.min(1, fr || 0)) * 100); tx.textContent = txt + (fr != null ? " — " + p + "%" : ""); fl.style.width = p + "%"; },
      end(txt, keep) { tx.textContent = txt; fl.style.width = "100%"; sp.hidden = true; w.classList.add("done"); if (!keep) setTimeout(() => w.remove(), 3000); },
      remove() { w.remove(); },
    };
  }
  async function pickFile(accept) { return new Promise((res) => { const i = document.createElement("input"); i.type = "file"; i.accept = accept; i.onchange = () => res(i.files && i.files[0]); i.click(); }); }
  async function readWb(file) {
    const ExcelJS = await loadEx(); const wb = new ExcelJS.Workbook(); await wb.xlsx.load(await file.arrayBuffer()); return wb;
  }
  function readMeta(wb) {
    const ws = wb.getWorksheet("_meta"); if (!ws) return null;
    try { return JSON.parse(String(cellVal(ws.getCell("A1")))); } catch (e) { return null; }
  }

  /* =====================================================================
     1) التسجيل بالجملة
     ===================================================================== */
  const REGCOLS = (type, nclubs) => [
    { k: "n", h: "hN", w: 5 }, { k: "nameAr", h: "hAr", w: 26, in: 1 }, { k: "nameEn", h: "hEn", w: 26, in: 1 }, { k: "gender", h: "hGender", w: 14, in: 1 },
    { k: "birth", h: "hBirth", w: 16, in: 1 }, { k: "age", h: "hAge", w: 12, calc: 1 }, { k: "cat", h: "hCat", w: 14, calc: 1 },
    { k: "belt", h: "hBelt", w: 16, in: 1 }, { k: "level", h: "hLevel", w: 14, calc: 1 },
    ...(type === "para" ? [{ k: "para", h: "hPara", w: 30, in: 1 }] : []),
    ...(nclubs > 1 ? [{ k: "club", h: "hClub", w: 28, in: 1 }] : []),
    { k: "dial", h: "hDial", w: 24, in: 1 }, { k: "phone", h: "hPhone", w: 20, in: 1 },
    { k: "guardian", h: "hGuard", w: 24, in: 1 },
  ];
  const HDR = (c) => both(c.h);
  const NAVY = "FF0B1F5C", GOLD = "FFF4CB55", INK = "FF1B1B1B", CREAM = "FFFFF6D6", GREY = "FFE9ECF5";

  const LV = ["", "الأول | 1", "الثاني | 2", "الثالث | 3"];
  const dialList = () => { const seen = new Set(), out = []; X.COUNTRIES.forEach(([ar, en]) => { const d = X.DIAL[String(en).toLowerCase()]; if (d && !seen.has(d + ar)) { seen.add(d + ar); out.push({ code: d, label: "+" + d + " | " + ar + " | " + en }); } }); return out; };
  const dialOf = (v) => { const m = txt(v).match(/^\+?\s*(\d{1,4})/); return m ? m[1] : ""; };
  function fullPhone(r) {
    const p = String(r.phoneRaw || ""); if (!p) return "";
    if (p.startsWith("+")) return "+" + p.slice(1).replace(/\D/g, "");
    if (p.startsWith("00")) return "+" + p.slice(2).replace(/\D/g, "");
    if (!r.dial) return "";
    const local = p.replace(/\D/g, "").replace(/^0+/, "");
    return "+" + (local.startsWith(r.dial) && local.length >= r.dial.length + 8 ? local : r.dial + local);
  }
  const catOf = (birth) => { const a = birth ? X.ageOf(birth) : null; const c = a == null ? null : X.ageCat(a); return c ? c[1] : ""; };
  async function buildRegTemplate(type, rows, notes) {
    const ExcelJS = await loadEx(), { cred, coach } = X.mine(), clubs = (coach && coach.clubs) || [];
    const cols = REGCOLS(type, clubs.length), wb = new ExcelJS.Workbook(); wb.creator = "Captain Taekwondo";
    const ws = wb.addWorksheet("Players", { views: [{ rightToLeft: true, state: "frozen", ySplit: 2 }], properties: { tabColor: { argb: GOLD } } });
    const lists = wb.addWorksheet("lists", { state: "veryHidden" }), meta = wb.addWorksheet("_meta", { state: "veryHidden" });
    X.PARA.forEach((p, i) => (lists.getCell(i + 1, 1).value = paraLbl(p))); clubs.forEach((c, i) => (lists.getCell(i + 1, 2).value = clubLbl(c)));
    const dials = dialList(); X.BELTS.forEach((bb, i) => { lists.getCell(i + 1, 4).value = beltLbl(bb); lists.getCell(i + 1, 5).value = LV[bb[4]] || ""; }); dials.forEach((d, i) => (lists.getCell(i + 1, 6).value = d.label));
    const LT = {}; cols.forEach((c, i) => (LT[c.k] = String.fromCharCode(65 + i)));
    const hasNote = !!notes;
    meta.getCell("A1").value = JSON.stringify({ v: VER, t: "reg", type, coach: cred.code, cols: cols.map((c) => c.k), hdr: cols.map(HDR), clubs: clubs.length });
    ws.mergeCells(1, 1, 1, cols.length + (hasNote ? 1 : 0));
    const t1 = ws.getCell(1, 1); t1.value = (type === "para" ? both("dlPara") : both("dlSup")).replace(/Download |تحميل /g, "") + "  —  " + cred.code;
    t1.font = { bold: true, size: 13, color: { argb: "FFFFFFFF" } }; t1.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY } }; t1.alignment = { horizontal: "center", vertical: "middle" }; ws.getRow(1).height = 26;
    cols.forEach((c, i) => {
      const cell = ws.getCell(2, i + 1); cell.value = HDR(c); cell.font = { bold: true, color: { argb: INK } }; cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GOLD } };
      cell.alignment = { horizontal: "center", vertical: "middle", wrapText: true }; cell.border = { bottom: { style: "medium" } }; ws.getColumn(i + 1).width = c.w;
    });
    if (hasNote) { const nc = ws.getCell(2, cols.length + 1); nc.value = both("hNote"); nc.font = { bold: true }; nc.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GREY } }; ws.getColumn(cols.length + 1).width = 44; }
    ws.getRow(2).height = 34;
    for (let r = 0; r < MAXROWS; r++) {
      const rn = FIRST + r, row = rows && rows[r];
      cols.forEach((c, i) => {
        const cell = ws.getCell(rn, i + 1); cell.border = { top: { style: "hair" }, bottom: { style: "hair" }, left: { style: "hair" }, right: { style: "hair" } };
        if (c.k === "n") { cell.value = r + 1; cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GREY } }; cell.alignment = { horizontal: "center" }; return; }
        if (c.calc) {   /* أعمدة بتتحسب لوحدها بصيغ Excel (مقفولة) */
          const bc = LT.birth + rn, ac = LT.age + rn; let f;
          if (c.k === "age") f = `IF(${bc}="","",IFERROR(DATEDIF(${bc},DATE(${AGE_DATE.join(",")}),"Y"),""))`;
          else if (c.k === "cat") f = `IF(${ac}="","",` + X.AGES.map((a, ix) => (ix === X.AGES.length - 1 ? `"${a[1]}"` : `IF(${ac}<${a[0]},"${a[1]}",`)).join("") + ")".repeat(X.AGES.length - 1) + ")";
          else f = `IF(${LT.belt}${rn}="","",IFERROR(VLOOKUP(${LT.belt}${rn},lists!$D$1:$E$${X.BELTS.length},2,FALSE),""))`;
          cell.value = { formula: f }; cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GREY } }; cell.alignment = { horizontal: "center", vertical: "middle" }; cell.font = { bold: true }; return;
        }
        cell.protection = { locked: false }; cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: CREAM } }; cell.alignment = { horizontal: "center", vertical: "middle" };
        if (c.k === "birth") cell.numFmt = "yyyy-mm-dd";
        if (c.k === "phone") cell.numFmt = "@";
        if (!row) return;
        if (c.k === "gender") cell.value = genderLbl(row.gender);
        else if (c.k === "belt") { const b = X.BELTS.find((b) => b[0] === row.belt); cell.value = b ? beltLbl(b) : row.beltRaw || ""; }
        else if (c.k === "para") { const p = X.PARA.find((p) => p[0] === row.para); cell.value = p ? paraLbl(p) : row.paraRaw || ""; }
        else if (c.k === "dial") { const d = dials.find((x) => x.code === row.dial); cell.value = d ? d.label : row.dialRaw || ""; }
        else if (c.k === "phone") cell.value = row.phoneRaw || "";
        else if (c.k === "club") cell.value = row.club >= 0 && clubs[row.club] ? clubLbl(clubs[row.club]) : row.clubRaw || "";
        else if (c.k === "birth") { const m = (row.birth || "").match(/^(\d{4})-(\d{2})-(\d{2})$/); cell.value = m ? new Date(Date.UTC(+m[1], +m[2] - 1, +m[3])) : row.birthRaw || ""; }
        else cell.value = row[c.k] || "";
      });
      if (hasNote && row && notes[r]) { const nc = ws.getCell(rn, cols.length + 1); nc.value = notes[r]; nc.font = { color: { argb: "FFB00020" } }; nc.alignment = { wrapText: true }; }
    }
    /* قوائم منسدلة صارمة */
    const rng = (i) => { const L = String.fromCharCode(65 + i); return L + FIRST + ":" + L + (FIRST + MAXROWS - 1); };
    const dv = (i, def) => { try { ws.dataValidations.add(rng(i), def); } catch (e) { for (let r = FIRST; r < FIRST + MAXROWS; r++) ws.getCell(r, i + 1).dataValidation = def; } };
    const bad = (t2) => ({ showErrorMessage: true, errorStyle: "stop", errorTitle: "!", error: t2 });
    cols.forEach((c, i) => {
      if (c.k === "gender") dv(i, Object.assign({ type: "list", allowBlank: true, formulae: ['"' + S.ar.male + "," + S.ar.female + '"'] }, bad(both("eGender"))));
      if (c.k === "belt") dv(i, Object.assign({ type: "list", allowBlank: true, formulae: ['"' + X.BELTS.map(beltLbl).join(",") + '"'] }, bad(both("eBelt"))));
      if (c.k === "para") dv(i, Object.assign({ type: "list", allowBlank: true, formulae: ["lists!$A$1:$A$" + X.PARA.length] }, bad(both("ePara"))));
      if (c.k === "club") dv(i, Object.assign({ type: "list", allowBlank: true, formulae: ["lists!$B$1:$B$" + Math.max(1, clubs.length)] }, bad(both("eClub"))));
      if (c.k === "dial") dv(i, Object.assign({ type: "list", allowBlank: true, formulae: ["lists!$F$1:$F$" + Math.max(1, dials.length)] }, bad(both("eDial"))));
      if (c.k === "birth") dv(i, Object.assign({ type: "date", operator: "between", allowBlank: true, formulae: [new Date(Date.UTC(1940, 0, 1)), new Date(Date.UTC(2026, 11, 31))] }, bad(both("eBirth")), { showInputMessage: true, promptTitle: S.ar.hBirth, prompt: "2015-03-27" }));
    });
    await ws.protect(PWD, { selectLockedCells: true, selectUnlockedCells: true });
    /* ورقة التعليمات + مثال */
    const ins = wb.addWorksheet("Help", { views: [{ rightToLeft: true }] }); ins.getColumn(1).width = 90;
    const lines = [both("instr"), "1) " + S.ar.i1.replace("{n}", MAXROWS) + "  /  " + S.en.i1.replace("{n}", MAXROWS), "2) " + S.ar.i2 + "  /  " + S.en.i2, "3) " + S.ar.i3 + "  /  " + S.en.i3, "4) " + S.ar.i4 + "  /  " + S.en.i4, "• " + S.ar.lvlNote + "  /  " + S.en.lvlNote, "• " + S.ar.phNote + "  /  " + S.en.phNote, "5) " + S.ar.i5 + "  /  " + S.en.i5,
      "", both("i6") + ":  " + ["محمد أحمد", "Mohamed Ahmed", S.ar.male, "2015-03-27", beltLbl(X.BELTS[1])].concat(type === "para" ? [paraLbl(X.PARA[0])] : []).join("  |  ")];
    lines.forEach((l, i) => { const c = ins.getCell(i + 1, 1); c.value = l; c.alignment = { wrapText: true, vertical: "top" }; if (i === 0) c.font = { bold: true, size: 14 }; });
    await ins.protect(PWD, { selectLockedCells: true });
    return xlsxBlob(wb);
  }

  /* ---------- قراءة وفحص ---------- */
  function newRow(n) { return { n, nameAr: "", nameEn: "", gender: "", birth: "", belt: "", para: "", club: -1, guardian: "", dial: "", phoneRaw: "", photo: null, photoUrl: "", errs: {}, done: false, code: "", rid: X.newRid(), sendErr: "" }; }
  async function parseReg(file) {
    const wb = await readWb(file), meta = readMeta(wb), { cred, coach } = X.mine(), clubs = (coach && coach.clubs) || [];
    if (!meta || meta.t !== "reg") throw new Error("badFile");
    if (meta.v !== VER) throw new Error("oldVer");
    if (String(meta.coach) !== String(cred.code)) throw new Error("badCoach");
    if (meta.type === "sup" && !X.SUP_OPEN) throw new Error("badType");
    const ws = wb.worksheets.find((w) => w.name !== "lists" && w.name !== "_meta" && w.name !== "Help"); if (!ws) throw new Error("badFile");
    meta.hdr.forEach((h, i) => { if (txt(cellVal(ws.getCell(2, i + 1))) !== txt(h)) throw new Error("badFile"); });
    const rows = [];
    for (let r = FIRST; r < FIRST + MAXROWS + 50; r++) {
      const g = (k) => { const i = meta.cols.indexOf(k); return i < 0 ? "" : cellVal(ws.getCell(r, i + 1)); };
      const raw = { nameAr: g("nameAr"), nameEn: g("nameEn"), gender: g("gender"), birth: g("birth"), belt: g("belt"), para: g("para"), club: g("club"), guardian: g("guardian"), dial: g("dial"), phone: g("phone") };
      if (Object.values(raw).every((v) => txt(v) === "")) continue;
      if (r >= FIRST + MAXROWS) throw new Error("tooMany");
      const row = newRow(r);
      row.nameAr = txt(raw.nameAr); row.nameEn = txt(raw.nameEn); row.gender = genderOf(raw.gender); row.birth = dateStr(raw.birth); row.belt = beltOf(raw.belt);
      row.para = meta.type === "para" ? paraOf(raw.para) : ""; row.guardian = txt(raw.guardian);
      row.dial = dialOf(raw.dial); row.dialRaw = row.dial ? "" : txt(raw.dial); row.phoneRaw = dig(txt(raw.phone)).replace(/[\s\-().]/g, "");
      row.club = meta.clubs > 1 ? clubOf(raw.club, clubs) : clubs.length ? 0 : -1;
      row.birthRaw = row.birth ? "" : txt(raw.birth); row.beltRaw = row.belt ? "" : txt(raw.belt); row.paraRaw = row.para ? "" : txt(raw.para); row.clubRaw = row.club >= 0 ? "" : txt(raw.club);
      rows.push(row);
    }
    if (!rows.length) throw new Error("empty");
    return { type: meta.type, rows };
  }
  const normName = (a, e) => (norm(a) + "|" + norm(e));
  function validateAll(sess) {
    const { players } = X.mine(), clubs = (X.mine().coach || {}).clubs || [], seen = new Map();
    const saved = (players || []).map((p) => ({ b: String(p.birth || "").slice(0, 10), a: norm(p.nameAr), e: norm(p.nameEn), c: p.code }));
    sess.rows.forEach((r) => {
      const E = {}; r.errs = E;
      if (!r.nameAr) E.nameAr = s("eReq"); else if (r.nameAr.length < 2) E.nameAr = s("eName"); else if (!AR.test(r.nameAr)) E.nameAr = s("eAr");
      if (!r.nameEn) E.nameEn = s("eReq"); else if (r.nameEn.length < 2) E.nameEn = s("eName"); else if (!EN.test(r.nameEn)) E.nameEn = s("eEn");
      if (!r.gender) E.gender = s("eGender");
      const age = r.birth ? X.ageOf(r.birth) : null; if (age == null || age < 3 || age > 90) E.birth = s("eBirth");
      if (!r.belt) E.belt = s("eBelt");
      if (sess.type === "para" && !r.para) E.para = s("ePara");
      if (clubs.length > 1 && r.club < 0) E.club = s("eClub");
      if (age != null && age < 18 && r.guardian.length < 2) E.guardian = s("eGuard");
      if (r.phoneRaw) { const fp = fullPhone(r); if (!fp) E.dial = s("eDial"); else if (!/^\+\d{8,15}$/.test(fp)) E.phone = s("ePhone"); }
      if (r.birth && (r.nameAr || r.nameEn)) {
        const k = r.birth + "|" + norm(r.nameAr), k2 = r.birth + "|" + norm(r.nameEn);
        const prev = seen.get(k) || seen.get(k2);
        if (prev && prev !== r) E.dup = s("eDupFile", { r: prev.n - FIRST + 1 }); else { seen.set(k, r); seen.set(k2, r); }
        const hit = saved.find((p) => p.b === r.birth && ((r.nameAr && p.a === norm(r.nameAr)) || (r.nameEn && p.e === norm(r.nameEn))));
        if (hit && !r.done) E.dup = s("eDupSaved", { c: hit.c });
      }
    });
  }
  const rowStatus = (r) => (r.done ? "done" : Object.keys(r.errs).length ? "err" : r.photo ? "ok" : "photo");

  /* ---------- الصور ---------- */
  async function shrinkPhoto(file) {
    const url = URL.createObjectURL(file);
    try {
      const img = await X.loadImg(url), k = Math.min(1, 1500 / Math.max(img.width, img.height)), c = document.createElement("canvas");
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k); c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      const blob = await X.blobOf(c, "image/jpeg", 0.92), u2 = URL.createObjectURL(blob), out = await X.loadImg(u2);
      return { img: out, url: u2 };
    } finally { URL.revokeObjectURL(url); }
  }

  /* ---------- شاشة المراجعة ---------- */
  async function openRegReview(parsed) {
    const sess = { type: parsed.type, rows: parsed.rows }, m = modal(s("title") + " — " + (parsed.type === "para" ? S.ar.dlPara.replace("تحميل نموذج ", "") : S.ar.dlSup.replace("تحميل نموذج ", "")));
    const { cred, coach } = X.mine(), clubs = (coach && coach.clubs) || [];
    const cols = REGCOLS(parsed.type, clubs.length).filter((c) => c.in);
    const sum = el("div", "bk-sum"), bar = el("div", "bk-bar2"), host = el("div", "bk-tw"), foot = el("div", "bk-foot");
    m.body.append(sum, bar, host, foot);
    const bDl = el("button", "btn", s("reDl")), bAnother = el("button", "btn", s("another")), bMulti = el("button", "btn", s("multiPh")), bGo = el("button", "btn fill", "");
    [bDl, bAnother, bMulti, bGo].forEach((b) => (b.type = "button")); bar.append(bDl, bMulti, bAnother); foot.append(el("p", "hint", esc(s("multiNote"))), bGo);
    const tb = el("table", "bk-t"); host.appendChild(tb);
    tb.innerHTML = `<thead><tr><th>${esc(s("hN"))}</th><th></th><th></th><th>${esc(s("hCat"))} / ${esc(s("hLevel"))}</th>${cols.map((c) => `<th>${esc(s(c.h))}</th>`).join("")}<th>${esc(s("pickPhoto"))}</th></tr></thead><tbody></tbody>`;
    const tbody = tb.querySelector("tbody");
    const sel = (opts, val) => { const e = el("select", ""); e.add(new Option("—", "")); opts.forEach(([v, t2]) => e.add(new Option(t2, v))); e.value = val; return e; };
    const L2 = X.lang === "en" ? 2 : 1;
    function refresh() {
      validateAll(sess); const c = { ok: 0, err: 0, photo: 0, done: 0 };
      sess.rows.forEach((r) => {
        c[rowStatus(r)]++; const tr = r.tr; if (!tr) return; const st = rowStatus(r);
        tr.className = "bk-r " + st; tr.querySelector(".bk-st").textContent = st === "done" ? "✓✓" : st === "ok" ? "✓" : st === "err" ? "✗" : "📷"; { const cat = catOf(r.birth), bl = X.BELTS.find((x) => x[0] === r.belt); tr.querySelector(".bk-c").textContent = [cat, bl ? "L" + bl[4] : ""].filter(Boolean).join(" · "); }
        tr.querySelector(".bk-st").title = s(st === "done" ? "stDone" : st === "ok" ? "stOk" : st === "err" ? "stErr" : "stPhoto");
        tr.querySelectorAll("[data-f]").forEach((f) => { const msg = r.errs[f.dataset.f]; f.classList.toggle("bad", !!msg); f.title = msg || ""; f.disabled = r.done; });
        const msgs = Object.values(r.errs); if (r.sendErr) msgs.push(r.sendErr); tr.querySelector(".bk-m").innerHTML = msgs.map((x) => `<span>${esc(x)}</span>`).join("") + (r.done ? `<b dir="ltr">${esc(r.code)}</b>` : "");
        const pi = tr.querySelector(".bk-ph img"); if (r.photoUrl) { pi.src = r.photoUrl; pi.hidden = false; } else pi.hidden = true;
      });
      const total = sess.rows.length, todo = sess.rows.filter((r) => !r.done);
      sum.innerHTML = `<span>${esc(s("sumRows"))}: <b>${total}</b></span><span class="ok">${esc(s("sumOk"))}: <b>${c.ok + c.done}</b></span><span class="err">${esc(s("sumErr"))}: <b>${c.err}</b></span><span class="ph">${esc(s("sumPhoto"))}: <b>${c.photo}</b></span>`;
      const ready = todo.length > 0 && todo.every((r) => rowStatus(r) === "ok");
      bGo.disabled = !ready || task > 0; bGo.textContent = s("confirm", { n: todo.length }); bGo.title = ready ? "" : s("needAll");
    }
    sess.rows.forEach((r) => {
      const tr = el("tr", "bk-r"); r.tr = tr;
      const cellFor = (c) => {
        const td = el("td", ""); let inp;
        if (c.k === "gender") inp = sel([["m", S.ar.male.split(" | ")[L2 - 1]], ["f", S.ar.female.split(" | ")[L2 - 1]]], r.gender);
        else if (c.k === "belt") inp = sel(X.BELTS.map((b) => [b[0], b[L2]]), r.belt);
        else if (c.k === "para") inp = sel(X.PARA.map((p) => [p[0], p[0] + " — " + p[L2]]), r.para);
        else if (c.k === "dial") inp = sel(dialList().map((d) => [d.code, "+" + d.code + " — " + d.label.split(" | ")[X.lang === "en" ? 2 : 1]]), r.dial);
        else if (c.k === "club") inp = sel(clubs.map((cl, i) => [String(i), cl[L2 === 1 ? "ar" : "en"] || cl.ar || cl.en]), r.club >= 0 ? String(r.club) : "");
        else { inp = el("input", ""); inp.type = c.k === "birth" ? "date" : c.k === "phone" ? "tel" : "text"; inp.value = (c.k === "phone" ? r.phoneRaw : r[c.k]) || ""; inp.maxLength = 60; if (c.k === "phone") inp.dir = "ltr"; if (c.k === "birth") { inp.min = "1940-01-01"; inp.dir = "ltr"; } if (c.k === "nameAr") inp.dir = "rtl"; if (c.k === "nameEn") inp.dir = "ltr"; }
        inp.dataset.f = c.k; inp.addEventListener("input", () => { if (c.k === "phone") r.phoneRaw = inp.value.replace(/[\s\-().]/g, ""); else r[c.k] = c.k === "club" ? (inp.value === "" ? -1 : +inp.value) : inp.value.trim(); if (c.k === "birth" || c.k === "club" || c.k === "gender" || c.k === "belt" || c.k === "para") { /* القوائم */ } refresh(); });
        td.appendChild(inp); return td;
      };
      tr.append(el("td", "bk-n", String(r.n - FIRST + 1)), el("td", "bk-st", ""), el("td", "bk-m", ""), el("td", "bk-c", ""));
      cols.forEach((c) => tr.appendChild(cellFor(c)));
      const tdp = el("td", "bk-ph"); const img = el("img"); img.alt = ""; img.hidden = true; const fi = el("input"); fi.type = "file"; fi.accept = "image/*"; fi.setAttribute("aria-label", s("pickPhoto"));
      fi.addEventListener("change", async () => { const f = fi.files && fi.files[0]; if (f) await setPhoto(r, f); });
      tdp.append(img, fi); tr.appendChild(tdp); tbody.appendChild(tr);
    });
    async function setPhoto(r, f) {
      try { const p = await shrinkPhoto(f); r.photo = p.img; r.photoUrl = p.url; r.errs.photo = ""; } catch (e) { r.photo = null; r.photoUrl = ""; r.sendErr = s("eImg"); }
      refresh();
    }
    bMulti.addEventListener("click", async () => {
      const i = document.createElement("input"); i.type = "file"; i.accept = "image/*"; i.multiple = true;
      i.onchange = async () => {
        const files = [...i.files].sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })), need = sess.rows.filter((r) => !r.photo && !r.done), n = Math.min(files.length, need.length);
        if (!n) return; const P = progress(m.body); bMulti.disabled = true; task++;
        for (let k = 0; k < n; k++) { P.set(s("photosPrep") + " " + (k + 1) + "/" + n, k / n); await setPhoto(need[k], files[k]); }
        task--; bMulti.disabled = false; P.end(s("photosDone", { n })); refresh();
      }; i.click();
    });
    bDl.addEventListener("click", async () => {
      bDl.disabled = true; toast(m.body, s("loading"), false, true);
      try {
        validateAll(sess); const notes = {}; sess.rows.forEach((r, i) => { const x = Object.values(r.errs).filter(Boolean).join(" • "); if (x) notes[i] = x; });
        const any = Object.keys(notes).length, blob = await buildRegTemplate(sess.type, sess.rows, any ? notes : null); download(blob, "players-" + sess.type + "-corrected.xlsx"); toast(m.body, "");
      } catch (e) { toast(m.body, s("libFail"), true); }
      bDl.disabled = false;
    });
    bAnother.addEventListener("click", async () => { const f = await pickFile(".xlsx"); if (!f) return; try { const p = await parseReg(f); m.bg.remove(); document.documentElement.classList.remove("guide-lock"); openRegReview(p); } catch (e) { toast(m.body, s(e.message in S.ar ? e.message : "badFile", { n: MAXROWS }), true); } });
    bGo.addEventListener("click", () => runRegister(sess, m, refresh));
    refresh();
  }

  /* ---------- التسجيل الفعلي + البطاقات ---------- */
  async function runRegister(sess, m, refresh) {
    const mine = X.mine(), cred = mine.cred, coach = mine.coach || {}, clubs = coach.clubs || [];
    const todo = sess.rows.filter((r) => !r.done); if (!todo.length) return;
    task++; refresh(); const goBtn = m.body.querySelector(".bk-foot .btn.fill"); const prog = progress(m.body); prog.set(s("progress", { a: 0, b: todo.length }), 0);
    let token = mine.token, done = 0, fatal = "";
    const phone = X.phoneFor(cred.phone, coach.countryEn);
    await Promise.all([X.assetsReady, X.fontsReady]);
    const payload = (r) => {
      const club = r.club >= 0 ? clubs[r.club] : null, belt = X.BELTS.find((b) => b[0] === r.belt), age = X.ageOf(r.birth), cat = X.ageCat(age);
      return {
        action: "register", rid: r.rid, lang: X.lang, ptype: sess.type, role: "player", addedBy: "", nameAr: r.nameAr, nameEn: r.nameEn, gender: r.gender, birth: r.birth, ageCat: (cat || [])[1] || "",
        countryAr: coach.countryAr || "", countryEn: coach.countryEn || "", coachClubs: clubs.map((c) => ({ ar: c.ar, en: c.en })), clubAr: club ? club.ar : "", clubEn: club ? club.en : "",
        belt: r.belt, level: (belt || [])[4] || "", para: sess.type === "sup" ? "" : r.para, coachCode: "PTA-2026-" + cred.code, guardian: r.guardian, coachName: (coach.nameAr || "") + " / " + (coach.nameEn || ""),
        promo: "no", whatsapp: "", coachInVideo: "no", email: cred.email, phone: fullPhone(r) || phone, photo: X.photoJpeg({ photo: r.photo, zoom: 1, ox: 0, oy: 0 }), vcode: "", token,
      };
    };
    const one = async (r) => {
      r.sendErr = "";
      try {
        let res; try { res = await X.post(payload(r)); } catch (e) { await sleep(1500); res = await X.post(payload(r)); }
        if (res && res.ok) { r.done = true; r.code = res.code; if (res.token) token = res.token; }
        else { const e = res && res.error; if (e === "bad_vcode" || e === "vcode_expired") { fatal = s("expired"); r.sendErr = fatal; } else r.sendErr = e === "player_exists" ? s("eDupSaved", { c: (res && res.code) || "" }) : e === "bad_phone" ? s("srvErr") : s("srvErr"); }
      } catch (e) { r.sendErr = s("netErr"); }
      done++; prog.set(s("progress", { a: done, b: todo.length }), done / todo.length * 0.5); refresh();
    };
    const q = todo.slice(); const worker = async () => { while (q.length && !fatal) await one(q.shift()); };
    await Promise.all([worker(), worker(), worker()]);
    task--; refresh();
    const okRows = sess.rows.filter((r) => r.done && !r.card);
    if (okRows.length) await finishCards(sess, okRows, m, prog);
    else prog.end(fatal || s("failedN", { n: todo.length }), true);
  }
  async function finishCards(sess, okRows, m, prog) {
    const coach = X.mine().coach || {}, clubs = coach.clubs || [], files = [], csv = ["code,name_ar,name_en,birth"]; task++;
    let saveFail = 0, i = 0;
    for (const r of okRows) {
      prog.set(s("cardSave") + " " + (++i) + "/" + okRows.length, 0.5 + 0.5 * (i - 1) / okRows.length);
      const club = r.club >= 0 ? clubs[r.club] : null, age = X.ageOf(r.birth), cat = X.ageCat(age);
      const sub = { kind: "view", data: { type: sess.type, nameAr: r.nameAr, nameEn: r.nameEn, gender: r.gender, birth: r.birth, belt: r.belt, para: sess.type === "sup" ? "" : r.para, clubAr: club ? club.ar : "", clubEn: club ? club.en : "", countryAr: coach.countryAr || "", countryEn: coach.countryEn || "", ageCat: (cat || [])[1] || "" }, code: r.code, final: true, photo: r.photo, zoom: 1, ox: 0, oy: 0 };
      const cv = X.renderCanvas(sub), jpg = await X.blobOf(cv, "image/jpeg", 0.92); r.card = true;
      files.push({ name: "Player-ID-" + r.code + "-" + (r.nameEn || "player").replace(/[^A-Za-z0-9]+/g, "_").replace(/^_|_$/g, "") + ".jpg", blob: jpg });
      csv.push([r.code, r.nameAr, r.nameEn, r.birth].map((x) => '"' + String(x).replace(/"/g, '""') + '"').join(","));
      if (X.API) {
        const send = () => new Promise((rs) => { const fr = new FileReader(); fr.onload = () => rs(fr.result); fr.readAsDataURL(jpg); }).then((card) => X.post({ action: "card", rid: r.rid, code: r.code, card }, 90000));
        try { let rr; try { rr = await send(); } catch (e) { rr = await send(); } if (!(rr && rr.ok)) saveFail++; } catch (e) { saveFail++; }
      }
    }
    task--; prog.end(saveFail ? s("cardFail") : s("cardOk"), true);
    const wrap = m.body.querySelector(".bk-foot"), z = el("button", "btn fill", s("zip")), c = el("button", "btn", s("csv")); z.type = c.type = "button";
    z.addEventListener("click", async () => { z.disabled = true; try { download(await X.makeZip(files), "Champion-Cards-" + files.length + ".zip"); } finally { z.disabled = false; } });
    c.addEventListener("click", () => download(new Blob(["﻿" + csv.join("\n")], { type: "text/csv;charset=utf-8" }), "player-codes.csv"));
    wrap.append(z, c, el("p", "hint", esc(s("note"))));
  }

  /* =====================================================================
     2) روابط الفيديو بالجملة
     ===================================================================== */
  async function buildVidTemplate(rows, notes) {
    const ExcelJS = await loadEx(), vc = X.vcoach(), players = vc.players.slice().sort((a, b) => (a.code < b.code ? -1 : 1));
    const wb = new ExcelJS.Workbook(); wb.creator = "Captain Taekwondo";
    const ws = wb.addWorksheet("Videos", { views: [{ rightToLeft: true, state: "frozen", ySplit: 2 }], properties: { tabColor: { argb: GOLD } } });
    const meta = wb.addWorksheet("_meta", { state: "veryHidden" }); const hdr = [both("hCode"), both("hName"), both("hLink")];
    meta.getCell("A1").value = JSON.stringify({ v: VER, t: "vid", coach: vc.cred.code, hdr });
    ws.mergeCells(1, 1, 1, notes ? 4 : 3); const t1 = ws.getCell(1, 1); t1.value = both("dlVid").replace(/Download |تحميل /g, "") + "  —  " + vc.cred.code;
    t1.font = { bold: true, size: 13, color: { argb: "FFFFFFFF" } }; t1.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY } }; t1.alignment = { horizontal: "center", vertical: "middle" }; ws.getRow(1).height = 26;
    hdr.forEach((h, i) => { const c = ws.getCell(2, i + 1); c.value = h; c.font = { bold: true }; c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GOLD } }; c.alignment = { horizontal: "center", vertical: "middle", wrapText: true }; c.border = { bottom: { style: "medium" } }; });
    ws.getColumn(1).width = 18; ws.getColumn(2).width = 34; ws.getColumn(3).width = 52; ws.getRow(2).height = 34;
    if (notes) { const c = ws.getCell(2, 4); c.value = both("hNote"); c.font = { bold: true }; c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GREY } }; ws.getColumn(4).width = 40; }
    players.forEach((p, i) => {
      const rn = FIRST + i, ln = rows ? rows.get(p.code) : p.video || "";
      const c1 = ws.getCell(rn, 1), c2 = ws.getCell(rn, 2), c3 = ws.getCell(rn, 3);
      c1.value = p.code; c2.value = (X.lang === "en" ? p.nameEn || p.nameAr : p.nameAr || p.nameEn) || ""; c3.value = ln || "";
      [c1, c2].forEach((c) => { c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: GREY } }; c.alignment = { horizontal: "center" }; });
      c3.protection = { locked: false }; c3.fill = { type: "pattern", pattern: "solid", fgColor: { argb: CREAM } }; c3.alignment = { horizontal: "left" };
      [c1, c2, c3].forEach((c) => (c.border = { top: { style: "hair" }, bottom: { style: "hair" }, left: { style: "hair" }, right: { style: "hair" } }));
      if (notes && notes.get(p.code)) { const n = ws.getCell(rn, 4); n.value = notes.get(p.code); n.font = { color: { argb: "FFB00020" } }; }
    });
    await ws.protect(PWD, { selectLockedCells: true, selectUnlockedCells: true });
    return xlsxBlob(wb);
  }
  async function parseVid(file) {
    const wb = await readWb(file), meta = readMeta(wb), vc = X.vcoach();
    if (!meta || meta.t !== "vid") throw new Error("badFile"); if (meta.v !== VER) throw new Error("oldVer"); if (String(meta.coach) !== String(vc.cred.code)) throw new Error("badCoach");
    const ws = wb.worksheets.find((w) => w.name !== "_meta"); if (!ws) throw new Error("badFile");
    meta.hdr.forEach((h, i) => { if (txt(cellVal(ws.getCell(2, i + 1))) !== txt(h)) throw new Error("badFile"); });
    const rows = [], byCode = new Map(vc.players.map((p) => [p.code, p]));
    for (let r = FIRST; r < FIRST + vc.players.length + 400; r++) {
      const code = txt(cellVal(ws.getCell(r, 1))), name = txt(cellVal(ws.getCell(r, 2))), link = txt(cellVal(ws.getCell(r, 3)));
      if (!code && !link) continue;
      rows.push({ n: r, code, name, link, saved: (byCode.get(code) || {}).video || "", known: byCode.has(code), err: "", st: "", id: "", done: false });
    }
    if (!rows.length) throw new Error("empty");
    return { rows };
  }
  async function openVidReview(parsed) {
    const vc = X.vcoach(), sess = { rows: parsed.rows }, m = modal(s("title") + " — " + s("vidTitle"));
    const sum = el("div", "bk-sum"), bar = el("div", "bk-bar2"), host = el("div", "bk-tw"), foot = el("div", "bk-foot"); m.body.append(sum, bar, host, foot);
    const bDl = el("button", "btn", s("reDl")), bAnother = el("button", "btn", s("another")), bGo = el("button", "btn fill", ""); [bDl, bAnother, bGo].forEach((b) => (b.type = "button")); bar.append(bDl, bAnother); foot.append(bGo);
    const tb = el("table", "bk-t"); tb.innerHTML = `<thead><tr><th>${esc(s("hN"))}</th><th></th><th></th><th>${esc(s("hCode"))}</th><th>${esc(s("hName"))}</th><th>${esc(s("hLink"))}</th><th></th></tr></thead><tbody></tbody>`; host.appendChild(tb);
    const tbody = tb.querySelector("tbody"); let seq = 0;
    const stOf = (r) => (r.done ? "done" : !r.known ? "skip" : r.err ? "err" : !r.link ? "skip" : r.st === "wait" ? "wait" : r.link === r.saved ? "same" : "ok");
    function refresh() {
      const c = { ok: 0, err: 0, skip: 0, same: 0, done: 0, wait: 0 };
      sess.rows.forEach((r) => {
        const st = stOf(r); c[st]++; const tr = r.tr; tr.className = "bk-r " + (st === "same" || st === "done" ? "ok" : st === "skip" || st === "wait" ? "photo" : st);
        tr.querySelector(".bk-st").textContent = st === "done" ? "✓✓" : st === "ok" || st === "same" ? "✓" : st === "err" ? "✗" : "…"; tr.querySelector(".bk-m").innerHTML = r.err ? `<span>${esc(r.err)}</span>` : !r.known ? `<span class="w">${esc(r.warn || s("eCode"))} — ${esc(s("stSkip"))}</span>` : st === "same" ? esc(s("notChanged")) : st === "skip" ? esc(s("stSkip")) : "";
        const inp = tr.querySelector("input"); inp.classList.toggle("bad", !!r.err); inp.disabled = r.done; const im = tr.querySelector("img"); if (r.id && !r.err) { im.src = "https://i.ytimg.com/vi/" + r.id + "/default.jpg"; im.hidden = false; } else im.hidden = true;
      });
      const send = sess.rows.filter((r) => r.known && !r.done && !r.err && r.link && r.link !== r.saved && r.st !== "wait");
      sum.innerHTML = `<span>${esc(s("sumRows"))}: <b>${sess.rows.length}</b></span><span class="ok">${esc(s("sumOk"))}: <b>${c.ok + c.same + c.done}</b></span><span class="err">${esc(s("sumErr"))}: <b>${c.err}</b></span>`;
      bGo.disabled = !send.length || c.err > 0 || c.wait > 0 || task > 0; bGo.textContent = s("confirmVid", { n: send.length }); bGo.title = c.err ? s("needAll") : "";
    }
    async function check(r) {
      r.err = ""; r.id = ""; const my = ++seq; r._s = my;
      if (!r.known) { r.err = ""; r.warn = s("eCode"); return refresh(); }
      if (!r.link) { r.st = ""; return refresh(); }
      const id = X.ytId(r.link); if (!id) { r.err = s("eLink"); r.st = ""; return refresh(); }
      r.id = id; r.link = X.ytUrl(id); r.tr.querySelector("input").value = r.link; r.st = "wait"; refresh();
      const v = await X.thumbOk(id); if (r._s !== my) return; r.st = "";
      if (v === "missing") r.err = s("eMissing"); else if (v === "net") r.err = s("eNetLink");
      refresh();
    }
    sess.rows.forEach((r) => {
      const tr = el("tr", "bk-r"); r.tr = tr;
      tr.append(el("td", "bk-n", String(r.n - FIRST + 1)), el("td", "bk-st", ""), el("td", "bk-m", ""), el("td", "", `<b dir="ltr">${esc(r.code)}</b>`), el("td", "", esc(r.name)));
      const td = el("td", ""); const inp = el("input"); inp.type = "url"; inp.dir = "ltr"; inp.value = r.link; inp.maxLength = 200; inp.placeholder = "https://youtu.be/…"; let tm = 0;
      inp.addEventListener("input", () => { r.link = inp.value.trim(); clearTimeout(tm); tm = setTimeout(() => check(r), 450); }); td.appendChild(inp); tr.appendChild(td);
      const tp = el("td", "bk-ph"); const im = el("img"); im.alt = ""; im.hidden = true; tp.appendChild(im); tr.appendChild(tp); tbody.appendChild(tr);
    });
    /* فحص الروابط (6 في نفس الوقت) */
    const qq = sess.rows.slice(), P0 = progress(m.body); let cn = 0; task++;
    await Promise.all([1, 2, 3, 4, 5, 6].map(async () => { while (qq.length) { await check(qq.shift()); cn++; P0.set(s("stWait") + " " + cn + "/" + sess.rows.length, cn / sess.rows.length); } }));
    task--; P0.end(s("checkedAll"));
    bDl.addEventListener("click", async () => {
      bDl.disabled = true; toast(m.body, s("loading"), false, true);
      try { const links = new Map(sess.rows.map((r) => [r.code, r.link])), notes = new Map(sess.rows.filter((r) => r.err).map((r) => [r.code, r.err])); download(await buildVidTemplate(links, notes.size ? notes : null), "video-links-corrected.xlsx"); toast(m.body, ""); }
      catch (e) { toast(m.body, s("libFail"), true); }
      bDl.disabled = false;
    });
    bAnother.addEventListener("click", async () => { const f = await pickFile(".xlsx"); if (!f) return; try { const p = await parseVid(f); m.bg.remove(); document.documentElement.classList.remove("guide-lock"); openVidReview(p); } catch (e) { toast(m.body, s(e.message in S.ar ? e.message : "badFile"), true); } });
    bGo.addEventListener("click", async () => {
      const send = sess.rows.filter((r) => r.known && !r.done && !r.err && r.link && r.link !== r.saved); if (!send.length) return;
      task++; refresh(); const prog = progress(m.body); prog.set(s("progress", { a: 0, b: send.length }), 0); let done = 0, fatal = false;
      const one = async (r) => {
        r.err = "";
        try {
          const res = await X.post({ action: "setvideo", video: r.link, player: r.code, code: vc.cred.code, phone: vc.cred.phone, email: vc.cred.email });
          if (res && res.ok) { r.done = true; r.saved = r.link; const p = vc.players.find((x) => x.code === r.code); if (p) p.video = r.link; }
          else { const e = res && res.error; r.err = e === "closed" ? (X.lang === "en" ? "Video submission is closed" : "باب إرسال الفيديو اتقفل") : e === "bad_vcode" || e === "not_found" ? s("eCode") : s("srvErr"); if (e === "closed") fatal = true; }
        } catch (e) { r.err = s("netErr"); }
        done++; prog.set(s("progress", { a: done, b: send.length }), done / send.length); refresh();
      };
      const q2 = send.slice(); const worker = async () => { while (q2.length && !fatal) await one(q2.shift()); };
      await Promise.all([worker(), worker(), worker()]); task--; refresh();
      const okN = send.filter((r) => r.done).length; prog.end(s("saved", { n: okN }) + (okN < send.length ? " — " + s("failedN", { n: send.length - okN }) : ""), true); X.refreshVideoList();
    });
    refresh();
  }

  /* ---------- الأزرار في الصفحة ---------- */
  const errText = (e) => s(e && e.message && e.message in S.ar ? e.message : e && e.message === "lib" ? "libFail" : "badFile", { n: MAXROWS });
  function mkBar(id, title, hint, buttons) {
    const b = el("div", "bk-bar"); b.id = id; b.hidden = true; b.innerHTML = `<h3>${esc(title)}</h3><p class="hint">${esc(hint)}</p>`;
    const row = el("div", "bk-btns"); buttons.forEach(([label, fn, cls, spin]) => { const x = el("button", "btn" + (cls ? " " + cls : ""), esc(label)); x.type = "button"; x.addEventListener("click", async () => { x.disabled = true; if (spin) toast(b, s("loading"), false, true); try { await fn(); if (spin) toast(b, ""); } catch (e) { toast(b, errText(e), true); } x.disabled = false; }); row.appendChild(x); });
    b.append(row); return b;
  }
  function mountReg() {
    if (!REG_OPEN) return;
    const host = $("#mineAdd"); if (!host || $("#bkReg")) return;
    const para = () => buildRegTemplate("para").then((b) => download(b, "players-para-template.xlsx")), sup = () => buildRegTemplate("sup").then((b) => download(b, "players-supporters-template.xlsx"));
    const up = async () => { const f = await pickFile(".xlsx"); if (!f) return; toast($("#bkReg"), s("loading"), false, true); try { const p = await parseReg(f); toast($("#bkReg"), ""); await openRegReview(p); } catch (e) { toast($("#bkReg"), errText(e).replace("{n}", MAXROWS), true); } };
    const bar = mkBar("bkReg", s("regTitle"), s("regHint"), [[s("dlPara"), para, "fill", 1], ...(X.SUP_OPEN ? [[s("dlSup"), sup, "", 1]] : []), [s("upload"), up]]);
    host.after(bar);
  }
  function mountVid() {
    if (!X.VIDEO_OPEN || $("#bkVid")) return;
    const host = $("#vListBox .acts"); if (!host) return;
    const dl = () => buildVidTemplate().then((b) => download(b, "video-links-template.xlsx"));
    const up = async () => { const f = await pickFile(".xlsx"); if (!f) return; toast($("#bkVid"), s("loading"), false, true); try { const p = await parseVid(f); toast($("#bkVid"), ""); await openVidReview(p); } catch (e) { toast($("#bkVid"), errText(e), true); } };
    host.before(mkBar("bkVid", s("vidTitle"), s("vidHint"), [[s("dlVid"), dl, "fill", 1], [s("upload"), up]]));
  }
  const sync = () => {
    mountReg(); mountVid();
    const r = $("#bkReg"); if (r) r.hidden = !$("#mineAdd") || $("#mineAdd").hidden || !X.mine().cred;
    const v = $("#bkVid"); if (v) v.hidden = !$("#vListBox") || $("#vListBox").hidden || !X.vcoach();
  };
  ["ptk:mine", "ptk:vlist"].forEach((n) => document.addEventListener(n, sync));
  document.addEventListener("ptk:lang", () => { ["bkReg", "bkVid"].forEach((id) => { const b = $("#" + id); if (b) b.remove(); }); sync(); });
  /* الأزرار تظهر وتختفي مع الشاشة اللي فيها (بعد دخول المدرب) */
  const mo = new MutationObserver(sync);
  ["#mineAdd", "#vListBox"].forEach((q) => { const n = $(q); if (n) mo.observe(n, { attributes: true, attributeFilter: ["hidden"] }); });
  sync();
})();

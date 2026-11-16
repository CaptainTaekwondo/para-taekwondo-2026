/* وضع التجربة لصفحة اللاعب: player.html?demo=1
   سيرفر وهمي داخل المتصفح بدل Apps Script. لا شيء يُرسل للشيت أو Drive.
   البيانات تبقى في نفس التبويب فقط (sessionStorage)، والصور في الذاكرة لحد ما الصفحة تتقفل. */
(() => {
  "use strict";
  if (!/[?&]demo=1(&|$)/.test(location.search)) return;
  /* وضع التجربة محلي فقط (localhost أو ملف على الجهاز): على الموقع المنشور مغلق لحد ما يُعلن عن اللاعب الداعم */
  if (!/^(localhost|127\.0\.0\.1|\[::1\])?$/.test(location.hostname)) return;
  const KEY = "ptk_demo_v1";
  const seed = () => {
    const P = (code, nameAr, nameEn, clubAr, clubEn, birth, belt, para, gender, phone, guardian) => ({
      code, role: "player", nameAr, nameEn, clubAr, clubEn, countryAr: "مصر", countryEn: "Egypt", birth, belt, para, gender, phone, guardian,
      coachCode: "PTA-2026-0000", email: "demo@example.com", fake: true, promo: "no", whatsapp: "", coachInVideo: "no", video: "",
    });
    return {
      next: { PTP: 9006, PTS: 9006 },
      players: [
        P("PTP-2026-9001", "يوسف تجريبي", "Youssef Demo", "نادي الاختبار", "Demo Club", "2016-03-12", "yellow", "P40", "m", "+201111111111", "أحمد تجريبي"),
        P("PTP-2026-9002", "مريم تجريبية", "Mariam Demo", "نادي الاختبار", "Demo Club", "2013-07-20", "green", "P20", "f", "+201222222222", "محمود تجريبي"),
        P("PTP-2026-9003", "عمر تجريبي", "Omar Demo", "نادي التجربة", "Trial Club", "2019-01-05", "white", "P10", "m", "+201000000000", "سعيد تجريبي"),
        P("PTS-2026-9004", "سارة داعمة", "Sara Demo", "نادي الاختبار", "Demo Club", "2014-09-01", "blue", "", "f", "+201333333333", "خالد تجريبي"),
        P("PTS-2026-9005", "آدم داعم", "Adam Demo", "نادي التجربة", "Trial Club", "2017-02-15", "yellow", "", "m", "+201000000000", "حسن تجريبي"),
      ],
    };
  };
  let db;
  try { db = JSON.parse(sessionStorage.getItem(KEY) || "null"); } catch (e) {}
  if (!db || !Array.isArray(db.players)) db = seed();
  const save = () => { try { sessionStorage.setItem(KEY, JSON.stringify(db)); } catch (e) {} };
  const photos = {}, cards = {};   // صور وبطاقات: في الذاكرة فقط
  /* صورة بديلة للاعبين الوهميين: خلفية ملونة وأول حرف من الاسم */
  const fakePhoto = (x) => {
    try {
      const c = document.createElement("canvas"); c.width = 400; c.height = 500;
      const g = c.getContext("2d"), hue = [...x.code].reduce((s, ch) => s + ch.charCodeAt(0), 0) % 360;
      g.fillStyle = "hsl(" + hue + ",45%,38%)"; g.fillRect(0, 0, 400, 500);
      g.fillStyle = "rgba(255,255,255,.85)"; g.beginPath(); g.arc(200, 190, 85, 0, Math.PI * 2); g.fill();
      g.beginPath(); g.ellipse(200, 470, 150, 160, 0, Math.PI, 0); g.fill();
      g.fillStyle = "hsl(" + hue + ",45%,30%)"; g.font = "bold 90px Cairo, sans-serif"; g.textAlign = "center"; g.textBaseline = "middle";
      g.fillText(String(x.nameEn || "?").charAt(0).toUpperCase(), 200, 195);
      return c.toDataURL("image/jpeg", 0.85);
    } catch (e) { return ""; }
  };
  const photoOf = (x) => photos[x.code] || (x.fake ? (photos[x.code] = fakePhoto(x)) : "");
  const typ = (c) => (/^PTS-/.test(String(c || "")) ? "sup" : "para");
  const find = (c) => db.players.find((x) => x.code === c);
  /* الفئة العمرية: نفس حساب الصفحة تقريبًا (العمر في 31/12/2026) */
  const ageCat = (birth) => {
    const b = new Date(birth), ref = new Date("2026-12-31");
    if (isNaN(b)) return "";
    let a = ref.getFullYear() - b.getFullYear(); if (ref < new Date(ref.getFullYear(), b.getMonth(), b.getDate())) a--;
    const cut = [[8, "U8"], [11, "U11"], [14, "U14"], [17, "U17"], [30, "U30"], [40, "U40"], [50, "U50"]].find((c) => a < c[0]);
    return cut ? cut[1] : "O50";
  };
  const FIELDS = ["role", "nameAr", "nameEn", "gender", "birth", "countryAr", "countryEn", "clubAr", "clubEn", "belt", "para", "coachCode", "guardian", "email", "phone", "promo", "whatsapp", "coachInVideo", "video"];
  const pick = (b) => { const o = {}; FIELDS.forEach((k) => { if (b[k] !== undefined) o[k] = b[k]; }); return o; };
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));

  window.PTK_DEMO = async function (b) {
    await wait(350);   // إحساس بسيط بالانتظار زي السيرفر الحقيقي
    switch (b.action) {
      case "sendcode": return { ok: true };
      case "myplayers":
        return { ok: true, token: "demo", coach: { nameAr: "مدرب تجريبي", nameEn: "Demo Coach", countryAr: "مصر", countryEn: "Egypt", clubs: [{ ar: "نادي الاختبار", en: "Demo Club" }, { ar: "نادي التجربة", en: "Trial Club" }] },
          players: db.players.filter((x) => x.role === "player").map((x) => ({ code: x.code, nameAr: x.nameAr, nameEn: x.nameEn, clubAr: x.clubAr, clubEn: x.clubEn, countryAr: x.countryAr, countryEn: x.countryEn,
            birth: x.birth, belt: x.belt, ageCat: ageCat(x.birth), para: x.para, type: typ(x.code), hasCard: !!cards[x.code], hasPhoto: !!photos[x.code] || !!x.fake })) };
      case "lookup": {
        const x = find(b.player || b.code);
        if (!x) return { ok: false, error: "not_found" };
        return { ok: true, code: x.code, token: "demo", data: Object.assign({}, x, { photo: photoOf(x), phone: b.player ? x.phone : (b.phone || x.phone), email: b.player ? x.email : (b.email || x.email) }) };
      }
      case "register": {
        const k = b.ptype === "sup" ? "PTS" : "PTP", code = k + "-2026-" + db.next[k]++;
        const o = Object.assign(pick(b), { code });
        if (k === "PTS") o.para = "";
        db.players.push(o); if (b.photo) photos[code] = b.photo; save();
        return { ok: true, code, token: "demo" };
      }
      case "update": {
        const x = find(b.code);
        if (!x) return { ok: false, error: "not_found" };
        Object.assign(x, pick(b), { code: x.code, role: x.role }); if (b.photo) photos[x.code] = b.photo; save();
        return { ok: true, code: x.code };
      }
      case "card": if (b.code && b.card) cards[b.code] = b.card; return { ok: true };
      case "playerphoto": { const x = find(b.player), ph = x && photoOf(x); return ph ? { ok: true, photo: ph } : { ok: false, error: "not_found" }; }
      case "playercard": return cards[b.player] ? { ok: true, name: b.player + "-card.jpg", card: cards[b.player] } : { ok: false, error: "not_found" };
      case "deleteplayer": {
        const i = db.players.findIndex((x) => x.code === b.player);
        if (i < 0) return { ok: false, error: "not_found" };
        db.players.splice(i, 1); save(); return { ok: true };
      }
      default: return { ok: false, error: "bad_action" };
    }
  };

  /* شريط ثابت فوق الصفحة يوضح إنها تجربة */
  const bar = () => {
    if (document.getElementById("demoBar")) return;
    const en = document.documentElement.lang === "en";
    const d = document.createElement("div"); d.id = "demoBar"; d.setAttribute("role", "status");
    d.style.cssText = "position:sticky;top:0;z-index:999;background:#f2c91b;color:#111;font:700 14px/1.5 Cairo,system-ui,sans-serif;text-align:center;padding:8px 16px";
    d.innerHTML = en
      ? "Demo version: nothing is saved. Any verification code works, and to open «My Players» enter any 4 digits, phone and email. <a href='player.html' style='color:#111'>Real page</a>"
      : "نسخة تجريبية: لا يتم حفظ أي بيانات. أي كود تأكيد يشتغل، ولفتح «لاعبيني» اكتب أي 4 أرقام وأي هاتف وبريد. <a href='player.html' style='color:#111'>الصفحة الحقيقية</a>";
    document.body.prepend(d);
  };
  if (document.body) bar(); else document.addEventListener("DOMContentLoaded", bar);
})();

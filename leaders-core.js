/* منطق مشترك بين صفحة القيادات العامة ولوحة الإدارة:
   بطاقة افتراضية لكل دولة عربية + دمج البطاقات المنشورة (مع «استبدال بطاقة») + الترتيب المحفوظ من الإدارة. */
(function () {
  "use strict";
  const COUNTRIES = [["jo", "الأردن", "Jordan"], ["ae", "الإمارات", "UAE"], ["bh", "البحرين", "Bahrain"], ["tn", "تونس", "Tunisia"], ["dz", "الجزائر", "Algeria"], ["dj", "جيبوتي", "Djibouti"], ["sa", "السعودية", "Saudi Arabia"], ["sd", "السودان", "Sudan"], ["sy", "سوريا", "Syria"], ["so", "الصومال", "Somalia"], ["iq", "العراق", "Iraq"], ["om", "عُمان", "Oman"], ["ps", "فلسطين", "Palestine"], ["qa", "قطر", "Qatar"], ["km", "جزر القمر", "Comoros"], ["kw", "الكويت", "Kuwait"], ["lb", "لبنان", "Lebanon"], ["ly", "ليبيا", "Libya"], ["eg", "مصر", "Egypt"], ["ma", "المغرب", "Morocco"], ["mr", "موريتانيا", "Mauritania"], ["ye", "اليمن", "Yemen"]];
  const cIdx = c => { const i = COUNTRIES.findIndex(x => x[0] === c.countryCode); return i < 0 ? 99 : i; };
  const placeholders = () => COUNTRIES.map(c => ({ id: "ph-" + c[0], placeholder: true, approved: true, nameAr: "سيتم الإعلان قريبًا", nameEn: "To be announced", countryCode: c[0], countryAr: c[1], countryEn: c[2], positionAr: "رئيس البارا تايكوندو", positionEn: "President of Para Taekwondo" }));
  const okPhoto = u => /^https:\/\/(lh3\.googleusercontent\.com|drive\.google\.com)\//.test(u || "") ? u : "";
  const clean = x => (x && x.approved === true && x.nameAr) ? Object.assign({}, x, { photo: okPhoto(x.photo) || (/^assets\//.test(x.photo || "") ? x.photo : ""), achievements: (x.achievements && typeof x.achievements === "object") ? x.achievements : { ar: [], en: [] }, contact: (x.contact && typeof x.contact === "object") ? x.contact : {} }) : null;
  const split = s => String(s || "").split(",").filter(Boolean);

  /* cards: البطاقات المنشورة الفعّالة (بأي مصدر). saved: ترتيب محفوظ (قائمة معرّفات) أو فارغ للترتيب الافتراضي. */
  function merge(cards, saved) {
    const real = (cards || []).map(clean).filter(Boolean).sort((a, b) => String(a.updated || "").localeCompare(String(b.updated || "")));
    let list = placeholders();
    real.forEach(x => { const rep = split(x.replaces); list = list.filter(y => y.id !== x.id && rep.indexOf(y.id) < 0); list.push(x); });
    const so = Array.isArray(saved) ? saved : [];
    /* موضع البطاقة في الترتيب المحفوظ؛ والبطاقة التي حلّت محل أخرى ترث موضعها */
    const pos = x => {
      const i = so.indexOf(x.id); if (i >= 0) return i;
      if (!x.placeholder) { const r = split(x.replaces); for (let k = 0; k < r.length; k++) { const j = so.indexOf(r[k]); if (j >= 0) return j + 0.5; } }
      return -1;
    };
    const dk = x => cIdx(x) * 1000 + (x.placeholder ? 500 : 0);
    const rows = list.map(x => ({ x, p: pos(x), d: dk(x) }));
    rows.sort((a, b) => {
      if (a.p >= 0 && b.p >= 0) return a.p - b.p || a.d - b.d;
      if (a.p >= 0) return -1;
      if (b.p >= 0) return 1;
      return a.d - b.d || String(a.x.nameAr).localeCompare(String(b.x.nameAr), "ar");
    });
    return rows.map(r => r.x);
  }
  window.LeadersCore = { COUNTRIES, placeholders, clean, merge };
})();

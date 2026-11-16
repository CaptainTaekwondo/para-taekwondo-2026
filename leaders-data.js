/* =====================================================================
   بيانات القيادات العربية للبارا تايكوندو — الملف الوحيد الذي يُعدَّل لإضافة قيادة.
   المستودع عام: لا تضع هنا إلا بيانات معتمدة ومصرّحًا بنشرها (الاسم، المنصب، الدولة، النبذة).
   لا تضع أرقام هواتف أو بريدًا شخصيًا إلا بموافقة صاحبه.

   شكل العنصر (كل الحقول اختيارية عدا nameAr و approved):
   {
     id: "unique-slug",
     approved: true,                  // false أو غيابها = لا تظهر في الصفحة
     nameAr: "الاسم بالعربية", nameEn: "Name in English",
     countryCode: "eg",               // رمز ISO من حرفين (لعرض العلم)
     countryAr: "مصر", countryEn: "Egypt",
     positionAr: "رئيس اللجنة", positionEn: "Committee Chair",
     bioAr: "نبذة...\nفقرة جديدة = سطر جديد", bioEn: "Bio...",
     achievements: { ar: ["إنجاز 1"], en: ["Achievement 1"] },
     photo: "assets/leaders/name.webp",   // صورة حقيقية فقط؛ الفارغ = حرف أول الاسم
     contact: { email: "", phone: "", whatsapp: "", website: "" }
   }
   ===================================================================== */
window.LEADERS_DATA = {
  leaders: []
};

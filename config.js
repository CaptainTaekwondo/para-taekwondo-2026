/* =====================================================================
   ملف الإعدادات: هنا فقط تُضاف الروابط والصور والمواعيد لاحقًا.
   لا تحتاج لتعديل أي ملف آخر. احفظ الملف وارفعه على GitHub.
   ===================================================================== */
const CONFIG = {

  /* رابط الموقع النهائي بعد الرفع على GitHub Pages (يُستخدم في زر المشاركة). الفارغ = الرابط الحالي للصفحة */
  siteUrl: "https://captaintaekwondo.github.io/para-taekwondo-2026/",

  /* ---- 1) فيديوهات يوتيوب (تظهر داخل نافذة منبثقة عند الضغط على «شاهد الفيديو»)
          ضع الرابط بين علامتي التنصيص. يقبل: youtube.com/watch?v=...  أو  youtu.be/...  أو  shorts/...
          وأثناء ترك الرابط فارغًا تظهر رسالة «سيتم رفع الفيديو قريبًا». ---- */
  videos: [
    { title: "المستوى الأول",  belts: "الحزام الأبيض والأصفر",  colors: ["#ffffff", "#f2c91b"], url: "" },
    { title: "المستوى الثاني", belts: "الحزام الأخضر والأزرق", colors: ["#1e8e3e", "#1f4fb4"], url: "" },
    { title: "المستوى الثالث", belts: "الحزام الأحمر والأسود", colors: ["#c41e2a", "#0b0b0f"], url: "" }
  ],

  /* ---- 2) الروابط الرسمية ---- */
  links: {
    registration: "",                                  // رابط التسجيل على منصة SportLand (فارغ = زر معطّل «قريبًا»)
    whatsapp: "https://www.canvaqr.com/RGWlQWBNuw",    // رابط جروب الواتساب (مقروء من QR الغلاف، تأكد أنه الرابط الصحيح)
    sponsor: ""                                        // رابط الراعي (اختياري)
  },

  /* ---- 3) صور رموز QR (ضع الصورة في مجلد assets ثم اكتب مسارها) ---- */
  qr: {
    registration: "",                                  // مثال: "assets/qr-registration.png"
    whatsapp: "assets/qr-whatsapp.webp"
  },

  /* ---- 4) المنظمون: ضع صورة كل شخص في assets/team/ ثم اكتب مسارها في photo
          مثال: photo: "assets/team/ibrahim.jpg"   (يُفضّل صورة مربعة واضحة الوجه) ---- */
  team: [
    { name: "الكابتن الفلسطيني إبراهيم الحاج", role: "مدير البطولة وصاحب المبادرة",
      about: "صاحب المبادرة والمدير التنفيذي", phone: "+972 599 370 269", initial: "إ", photo: "assets/team/ibrahim-alhaj.webp" },
    { name: "الحكم الدولي علي نور", role: "المسؤول عن التحكيم والتنظيم الفني",
      about: "رئيس لجنة الحكام والمسؤول عن الإشراف التحكيمي", phone: "+20 11 51221662", initial: "ع", photo: "assets/team/ali-nour.webp" },
    { name: "Captain Taekwondo", role: "المنصة الإعلامية",
      about: "المسؤول الدعائي والتسويقي للبطولة والتصميم الفني والتقني", phone: "+20 103 144 1064", initial: "C",
      photo: "", logo: "assets/captain.webp", darkLogo: true,
      details: {
        bio: "منصة رياضية لدعم وتطوير رياضة التايكوندو\nكابتن تايكوندو منصة رياضية تسعى إلى دعم وتطوير رياضة التايكوندو، من خلال تقديم محتوى تعليمي وإعلامي متميز، ودعم المدربين واللاعبين، وتسليط الضوء على المواهب والإنجازات والمبادرات الرياضية.\nتجمع المنصة مجتمعًا من المهتمين والخبراء والمتخصصين في التايكوندو من مختلف دول العالم، بما يتيح فرصًا لتبادل الخبرات، وتعزيز التواصل، ونشر المعرفة، وفتح آفاق جديدة للتعاون والتطوير.\nكما تهتم المنصة بدعم البطولات والمبادرات الرياضية، وتوظيف الإعلام والتصميم والتقنيات الرقمية في خدمة اللعبة، والمساهمة في تقديم أفكار جديدة تسهم في توسيع فرص المشاركة والارتقاء بالمستوى الرياضي.\nوتؤمن كابتن تايكوندو بأن تطوير الرياضة مسؤولية مشتركة، لذلك تمد يد التعاون لكل مدرب أو مؤسسة أو جهة تسعى إلى تقديم إضافة حقيقية وترك بصمة إيجابية في عالم التايكوندو.\nهدفنا أن نكون جزءًا من كل خطوة تسهم في تطوير اللعبة، ودعم أبطالها، وصناعة مستقبل أفضل للتايكوندو.",
        en: { bio: "A sports platform supporting and developing Taekwondo\nCaptain Taekwondo is a sports platform that works to support and develop Taekwondo by offering outstanding educational and media content, supporting coaches and athletes, and highlighting talents, achievements and sports initiatives.\nThe platform brings together a community of enthusiasts, experts and specialists in Taekwondo from around the world, creating opportunities to exchange experience, strengthen connections, share knowledge, and open new horizons for cooperation and development.\nThe platform also supports tournaments and sports initiatives, and uses media, design and digital technologies in the service of the sport, contributing new ideas that widen participation and raise the level of play.\nCaptain Taekwondo believes that developing the sport is a shared responsibility, so it extends a hand of cooperation to every coach, institution or entity seeking to make a real contribution and leave a positive mark on the world of Taekwondo.\nOur goal is to be part of every step that helps develop the game, support its champions, and build a better future for Taekwondo." }
      } },
    { name: "منصة الكابتن عادل SportLand", role: "منصة التسجيل",
      about: "المسؤولة عن تسجيل البيانات والتحكيم", phone: "+216 44 162 995", initial: "ع",
      photo: "", logo: "assets/sportland.webp" }
  ],

  /* تفاصيل كل منظم: أضف داخل كل عنصر في team الحقل التالي (الفارغ = «تُضاف التفاصيل قريبًا»):
     details: { bio: "نبذة عن الشخص أو المنصة. فقرة جديدة = سطر جديد.", facts: ["نقطة 1", "نقطة 2"],
                en: { bio: "English bio", facts: ["Point 1"] } }   // en اختياري للنسخة الإنجليزية */

  /* ---- 5) الراعي الرسمي: اكتب الاسم وضع الشعار عند اعتماده ---- */
  sponsor: { name: "", logo: "" },

  /* ---- 6) المواعيد: اكتب النص عند اعتماده (مثال: "15 ديسمبر 2026")، والفارغ = «يُعلن لاحقًا» ---- */
  dates: {
    announce: "1 نوفمبر 2026",
    open: "",
    deadline: "",
    videos: "",
    judging: "",
    results: ""
  },

  /* ---- 7) الشهادة وبطاقة المدرب: ضع تصميم الصورة عند جاهزيته (الفارغ = إطار فارغ) ---- */
  certificate: "",     // مثال: "assets/certificate.png"
  supportCert: "",     // تصميم شهادة دعم أصحاب الهمم بعد تجهيزه، مثال: "assets/support-certificate.png" (يملأ الإطار الفارغ)
  coachCert: "",       // تصميم شهادة المدرب بعد تجهيزه، مثال: "assets/coach-certificate.png"
  coachCard: "",       // تصميم بطاقة المدرب بعد تجهيزه، مثال: "assets/coach-card.png" (يملأ الإطار الفارغ)

  /* ---- 8) استطلاع «كيف تريد أن تدعمنا؟»: رقم واتساب استقبال الاختيارات، وقائمة طرق المساعدة (عدّلها كما تشاء) ---- */
  supportWhatsapp: "+20 103 144 1064",
  supportWays: [
    "نشر رابط الموقع وملصق البطولة على حساباتي ومجموعاتي",
    "عمل فيديو عن البطولة ونشره عندي للترويج لها",
    "تصميم محتوى للترويج (منشورات أو صور أو فيديوهات قصيرة)",
    "الترويج للبطولة بين الأندية والأكاديميات والمدربين",
    "التواصل مع لاعبين وأندية في بلدي لدعوتهم للمشاركة",
    "دعم معنوي (رسائل تشجيع وتحفيز للمشاركين)",
    "دعم مالي أو عيني للأبطال أصحاب المراكز",
    "رعاية أو دعم مادي أو عيني للبطولة نفسها",
    "تقديم هدايا أو جوائز تذكارية للمشاركين",
    "الدعم الإعلامي بالتواصل مع جهات إعلامية",
    "تغطية البطولة إعلاميًا (موقع أو قناة أو صحيفة أو بودكاست)",
    "ترجمة مواد البطولة إلى لغة أخرى",
    "ترشيح مدربين أو لاعبين أو جهات يمكنها المشاركة أو الدعم",
    "طريقة أخرى (أكتبها في الملاحظات)"
  ]
};

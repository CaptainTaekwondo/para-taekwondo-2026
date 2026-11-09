/* صفحة تسجيل المدرب وإصدار بطاقة الهوية — معاينة فورية + حفظ في Google Sheet/Drive عبر Apps Script */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const API = (typeof CONFIG !== "undefined" && CONFIG.cardApi) || "";
  const W = 1584, H = 993;
  const GOLD = "#f4cb55";

  /* ---------- نصوص الواجهة ---------- */
  const T = {
    ar: {
      title: "تسجيل بيانات المدرب وإصدار بطاقة الهوية",
      lead: "املأ بياناتك وستظهر بطاقتك أمامك فورًا. بعد الحفظ تحصل على كودك الفريد وتحمّل البطاقة بصورة عالية الجودة.",
      back: "العودة للموقع", lang: "English",
      g1: "بيانات المدرب", g2: "الصورة الشخصية", g3: "المشاركة في الفيديو الترويجي (اختياري)", g4: "الإقرار والحفظ",
      nameAr: "الاسم الكامل بالعربية", nameEn: "الاسم الكامل بالإنجليزية",
      countryAr: "الدولة بالعربية", countryEn: "الدولة بالإنجليزية",
      clubAr: "النادي أو الأكاديمية بالعربية", clubEn: "النادي أو الأكاديمية بالإنجليزية",
      champions: "عدد الأبطال المشاركين معك", championsHint: "للإدارة فقط ولا يظهر على البطاقة. اختياري.",
      photo: "اختر صورة شخصية واضحة", photoHint: "صورة بوجه واضح وخلفية بسيطة. اسحب الصورة داخل الإطار بإصبعك أو بالماوس لضبطها، وكبّرها بإصبعين أو بعجلة الماوس.",
      zoom: "تكبير الصورة",
      oneCard: "⚠️ تنبيه: يُمنع إصدار أكثر من بطاقة لنفس المدرب. يُسجَّل كل مدرب مرة واحدة فقط (بريد إلكتروني ورقم هاتف واحد)، وأي تسجيل مكرر يُرفض. لتغيير بياناتك استخدم «تعديل بطاقتي».", phone: "رقم الهاتف (إجباري، مع رمز الدولة)", ePhone: "اختر رمز الدولة وأدخل رقم هاتف صحيحًا.", dialPick: "رمز الدولة", dialHint: "الرمز يتحدد حسب الدولة، ولو رقمك من دولة أخرى غيّره من القائمة.", lkPhone: "رقم الهاتف المسجَّل",
      modeT: "ماذا تريد أن تفعل؟", newId: "إصدار بطاقة جديدة", newHint: "سجّل بياناتك لأول مرة واحصل على كودك وبطاقتك.", editId: "تعديل بطاقتي", editHint: "لديك كود؟ عدّل بياناتك أو صورتك وأصدر بطاقتك من جديد.",
      lkT: "تعديل بطاقتي", lkHint: "أدخل رقم هاتفك والبريد الإلكتروني المسجَّلين والكود القديم الظاهر على بطاقتك. وبعد التأكد من البيانات تُفتح صفحة تعديلها.", lkEmail: "البريد الإلكتروني", lkCode: "كودك القديم (آخر 4 أرقام فقط)", lkBtn: "عرض بياناتي", lkBack: "رجوع",
      eNotFound: "لم نجد تسجيلًا بهذا البريد والكود. تأكد من كتابتهما كما سجّلت.", eLk: "أدخل رقم الهاتف والبريد الإلكتروني والكود.", editBadge: "وضع التعديل: عدّل ما تريد ثم احفظ لإصدار بطاقتك من جديد.", submitEdit: "احفظ التعديلات وأصدر البطاقة", doneEditT: "تم تحديث بياناتك",
      email: "البريد الإلكتروني (إجباري)", emailHint: "يُسجَّل كل بريد إلكتروني مرة واحدة فقط وبكود واحد.", eEmail: "أدخل بريدًا إلكترونيًا صحيحًا.", vLbl: "كود تأكيد البريد (6 أرقام)", vSend: "أرسل الكود", vResend: "إعادة الإرسال", vHint: "اضغط «أرسل الكود» وسيصلك كود على بريدك (تفقّد البريد المزعج أيضًا).", vSent: "تم إرسال الكود إلى بريدك. أدخله هنا (صالح 10 دقائق).", vReq: "أدخل كود التأكيد المرسل إلى بريدك.", vBad: "الكود غير صحيح.", vExp: "انتهت صلاحية الكود. اطلب كودًا جديدًا.", vWait: "انتظر دقيقة قبل طلب كود جديد.", vQuota: "تعذّر الإرسال حاليًا بسبب كثرة الطلبات. حاول لاحقًا.", vMail: "تعذّر إرسال الكود لهذا البريد. تأكد من صحته.", eDup: "هذا البريد الإلكتروني مسجّل مسبقًا بالكود {code}. يُمنع إصدار أكثر من بطاقة لنفس المدرب. استخدم «تعديل بطاقتي».", eDupPhone: "رقم الهاتف هذا مسجّل مسبقًا بالكود {code}. يُمنع إصدار أكثر من بطاقة لنفس المدرب. استخدم «تعديل بطاقتي».",
      promo: "هل تريد مشاركة لاعبك في الفيديو الترويجي للبطولة؟",
      promoYes: "نعم", promoNo: "لا",
      wa: "رقم واتساب للتواصل (إلزامي عند اختيار نعم)",
      coachVid: "أرغب أن أشارك أنا أيضًا في الفيديو بصفتي المدرب",
      consent: "أقرّ بصحة البيانات، وأوافق على استخدام صورتي وبياناتي لإصدار بطاقة المدرب وفي تنظيم البطولة.",
      submit: "احفظ بياناتي وأصدر البطاقة", saving: "جاري الحفظ…",
      previewNote: "هذه معاينة حيّة. يظهر الكود الفريد بعد الحفظ.",
      aiBtn: "اصنع صورة مدرب احترافية من خلال AI ChatGPT", aiHint: "انسخ الأمر التالي، ثم الصقه في ChatGPT وأرفق صورتك.",
      aiPrompt: "سيُضاف الأمر الجاهز هنا قريبًا.", aiCopy: "نسخ الأمر الاحترافي", aiGo: "انسخ واذهب مباشرة إلى ChatGPT", aiCopied: "تم النسخ ✓",
      demo: "وضع المعاينة: لم يُربط الحفظ بعد، لذلك لن تُسجَّل البيانات. البطاقة قابلة للتحميل للتجربة فقط.",
      doneT: "تم تسجيل بياناتك", doneCode: "كودك الفريد", dlPng: "تحميل البطاقة PNG", dlJpg: "تحميل JPG",
      another: "تسجيل مدرب آخر", keep: "احتفظ بالكود، فهو رقم هويتك في البطولة.",
      driveOk: "تم حفظ نسخة من بطاقتك لدى الإدارة.", driveWait: "جاري حفظ نسخة من البطاقة…", driveFail: "تعذّر حفظ نسخة البطاقة تلقائيًا، لكن بياناتك سُجّلت.",
      eName: "اكتب الاسم الكامل (حرفان على الأقل).", eNameAr: "اكتب الاسم بالحروف العربية.", eNameEn: "اكتب الاسم بالحروف الإنجليزية.",
      eReq: "هذا الحقل مطلوب.", ePhoto: "أضف صورتك الشخصية.", eWa: "أدخل رقم واتساب صحيحًا مع رمز الدولة.", eConsent: "يلزم الإقرار للمتابعة.",
      eNet: "تعذّر الاتصال بالخادم. تحقق من الإنترنت وحاول مرة أخرى.", eSrv: "حدث خطأ أثناء الحفظ. حاول مرة أخرى بعد قليل.",
      eImg: "تعذّر قراءة هذه الصورة. جرّب صورة JPG أو PNG.",
      phName: "الاسم الكامل للمدرب", phCountry: "الدولة", phClub: "اسم النادي أو الأكاديمية",
    },
    en: {
      title: "Coach Registration & ID Card",
      lead: "Fill in your details and your card appears live. After saving you get your unique code and a high-quality card to download.",
      back: "Back to site", lang: "عربي",
      g1: "Coach details", g2: "Profile photo", g3: "Promo video participation (optional)", g4: "Declaration & save",
      nameAr: "Full name (Arabic)", nameEn: "Full name (English)",
      countryAr: "Country (Arabic)", countryEn: "Country (English)",
      clubAr: "Club / Academy (Arabic)", clubEn: "Club / Academy (English)",
      champions: "Number of champions participating with you", championsHint: "For the organisers only; not printed on the card. Optional.",
      photo: "Choose a clear profile photo", photoHint: "Clear face, simple background. Drag the photo inside the frame with your finger or mouse to adjust it; pinch or scroll to zoom.",
      zoom: "Zoom",
      oneCard: "⚠️ Notice: issuing more than one card for the same coach is not allowed. Each coach registers once only (one email and one phone number); any duplicate registration is rejected. To change your details use “Edit my card”.", phone: "Phone number (required, with country code)", ePhone: "Choose the country code and enter a valid phone number.", dialPick: "Country code", dialHint: "The code follows your country. If your number is from another country, change it in the list.", lkPhone: "Registered phone number",
      modeT: "What would you like to do?", newId: "Issue a new card", newHint: "Register for the first time and get your code and card.", editId: "Edit my card", editHint: "Already have a code? Update your details or photo and re-issue your card.",
      lkT: "Edit my card", lkHint: "Enter your registered phone number, email and the old code shown on your card. Once verified, the edit page opens.", lkEmail: "Email", lkCode: "Your old code (last 4 digits only)", lkBtn: "Show my details", lkBack: "Back",
      eNotFound: "No registration found for this email and code. Check them as you registered.", eLk: "Enter your phone number, email and code.", editBadge: "Edit mode: change what you need, then save to re-issue your card.", submitEdit: "Save changes & re-issue the card", doneEditT: "Your details are updated",
      email: "Email (required)", emailHint: "Each email can be registered once, with a single code.", eEmail: "Enter a valid email address.", vLbl: "Email verification code (6 digits)", vSend: "Send code", vResend: "Resend", vHint: "Press “Send code” and we will email you a code (check spam too).", vSent: "Code sent to your email. Enter it here (valid 10 minutes).", vReq: "Enter the verification code sent to your email.", vBad: "Incorrect code.", vExp: "The code has expired. Request a new one.", vWait: "Please wait a minute before requesting another code.", vQuota: "Sending is temporarily unavailable. Try again later.", vMail: "Could not send a code to this email. Check that it is correct.", eDup: "This email is already registered with code {code}. Issuing more than one card for the same coach is not allowed. Use “Edit my card”.", eDupPhone: "This phone number is already registered with code {code}. Issuing more than one card for the same coach is not allowed. Use “Edit my card”.",
      promo: "Would you like your athlete to appear in the promo video?",
      promoYes: "Yes", promoNo: "No",
      wa: "WhatsApp number (required if Yes)",
      coachVid: "I would also like to appear in the video as the coach",
      consent: "I confirm the data is correct and agree to the use of my photo and details to issue the coach card and run the championship.",
      submit: "Save my details & issue the card", saving: "Saving…",
      previewNote: "Live preview. Your unique code appears after saving.",
      aiBtn: "Create a professional coach photo with ChatGPT AI", aiHint: "Copy the prompt below, paste it into ChatGPT and attach your photo.",
      aiPrompt: "The ready-made prompt will be added here soon.", aiCopy: "Copy the professional prompt", aiGo: "Copy & go to ChatGPT", aiCopied: "Copied ✓",
      demo: "Preview mode: saving is not connected yet, so nothing is recorded. The card can be downloaded for testing only.",
      doneT: "Your details are registered", doneCode: "Your unique code", dlPng: "Download card (PNG)", dlJpg: "Download JPG",
      another: "Register another coach", keep: "Keep this code — it is your championship ID number.",
      driveOk: "A copy of your card was saved with the organisers.", driveWait: "Saving a copy of the card…", driveFail: "Could not store the card copy automatically, but your details are registered.",
      eName: "Enter the full name (2+ characters).", eNameAr: "Write the name in Arabic letters.", eNameEn: "Write the name in English letters.",
      eReq: "This field is required.", ePhoto: "Add your profile photo.", eWa: "Enter a valid WhatsApp number with country code.", eConsent: "Please accept to continue.",
      eNet: "Could not reach the server. Check your connection and retry.", eSrv: "Something went wrong while saving. Please try again shortly.",
      eImg: "This image could not be read. Try a JPG or PNG.",
      phName: "Coach Full Name", phCountry: "Country", phClub: "Club / Academy Name",
    },
  };
  let lang = "ar";
  try { lang = localStorage.getItem("lang") === "en" ? "en" : "ar"; } catch (e) {}
  const t = (k) => T[lang][k] || k;

  /* ---------- الدول (عربي ↔ إنجليزي) ---------- */
  const COUNTRIES = [
    ["مصر","Egypt"],["السعودية","Saudi Arabia"],["الإمارات","United Arab Emirates"],["الكويت","Kuwait"],["قطر","Qatar"],["البحرين","Bahrain"],["عُمان","Oman"],["اليمن","Yemen"],
    ["العراق","Iraq"],["سوريا","Syria"],["لبنان","Lebanon"],["الأردن","Jordan"],["فلسطين","Palestine"],["ليبيا","Libya"],["تونس","Tunisia"],["الجزائر","Algeria"],
    ["المغرب","Morocco"],["موريتانيا","Mauritania"],["السودان","Sudan"],["جنوب السودان","South Sudan"],["الصومال","Somalia"],["جيبوتي","Djibouti"],["جزر القمر","Comoros"],
    ["تركيا","Turkey"],["إيران","Iran"],["باكستان","Pakistan"],["أفغانستان","Afghanistan"],["الهند","India"],["بنغلاديش","Bangladesh"],["إندونيسيا","Indonesia"],["ماليزيا","Malaysia"],
    ["كوريا الجنوبية","South Korea"],["اليابان","Japan"],["الصين","China"],["الفلبين","Philippines"],["تايلاند","Thailand"],["فيتنام","Vietnam"],["أوزبكستان","Uzbekistan"],["كازاخستان","Kazakhstan"],
    ["روسيا","Russia"],["أوكرانيا","Ukraine"],["ألمانيا","Germany"],["فرنسا","France"],["إيطاليا","Italy"],["إسبانيا","Spain"],["المملكة المتحدة","United Kingdom"],["هولندا","Netherlands"],
    ["السويد","Sweden"],["تركمانستان","Turkmenistan"],["أذربيجان","Azerbaijan"],["نيجيريا","Nigeria"],["السنغال","Senegal"],["كينيا","Kenya"],["إثيوبيا","Ethiopia"],["جنوب أفريقيا","South Africa"],
    ["الولايات المتحدة","United States"],["كندا","Canada"],["البرازيل","Brazil"],["المكسيك","Mexico"],["أستراليا","Australia"],
  ];
  const byAr = new Map(COUNTRIES.map(([a, e]) => [a, e])), byEn = new Map(COUNTRIES.map(([a, e]) => [e.toLowerCase(), a]));
  const DIAL = { "egypt": "20", "saudi arabia": "966", "united arab emirates": "971", "kuwait": "965", "qatar": "974", "bahrain": "973", "oman": "968", "yemen": "967",
    "iraq": "964", "syria": "963", "lebanon": "961", "jordan": "962", "palestine": "970", "libya": "218", "tunisia": "216", "algeria": "213",
    "morocco": "212", "mauritania": "222", "sudan": "249", "south sudan": "211", "somalia": "252", "djibouti": "253", "comoros": "269",
    "turkey": "90", "iran": "98", "pakistan": "92", "afghanistan": "93", "india": "91", "bangladesh": "880", "indonesia": "62", "malaysia": "60",
    "south korea": "82", "japan": "81", "china": "86", "philippines": "63", "thailand": "66", "vietnam": "84", "uzbekistan": "998", "kazakhstan": "7",
    "russia": "7", "ukraine": "380", "germany": "49", "france": "33", "italy": "39", "spain": "34", "united kingdom": "44", "netherlands": "31",
    "sweden": "46", "turkmenistan": "993", "azerbaijan": "994", "nigeria": "234", "senegal": "221", "kenya": "254", "ethiopia": "251", "south africa": "27",
    "united states": "1", "canada": "1", "brazil": "55", "mexico": "52", "australia": "61" };

  /* ---------- الأصول ---------- */
  const IMG = {};
  const loadImg1 = (src) => new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = src; });
  const loadImg = (src) => loadImg1(src).catch(() => loadImg1(src + (src.startsWith("data:") || src.startsWith("blob:") ? "" : "?r=" + Date.now())));
  const assetsReady = Promise.all([
    loadImg("assets/card/frame.webp").then((i) => (IMG.frame = i)),
    loadImg("assets/card/logo.webp").then((i) => (IMG.logo = i)),
    loadImg("assets/card/plaque.webp").then((i) => (IMG.plaque = i)),
    loadImg("assets/card/slogan.webp").then((i) => (IMG.slogan = i)),
    loadImg("assets/card/divider.webp").then((i) => (IMG.divider = i)),
  ]);
  const fontsReady = Promise.all(["800 48px Cairo", "700 28px Cairo", "600 20px Cairo"].map((f) => document.fonts.load(f, "أAa").catch(() => {}))).then(() => document.fonts.ready);

  /* ---------- حالة النموذج ---------- */
  const st = { photo: null, zoom: 1, ox: 0, oy: 0, code: "", final: false };
  const F = {};
  ["nameAr", "nameEn", "countryAr", "countryEn", "clubAr", "clubEn"].forEach((k) => (F[k] = $("#f_" + k)));
  const canvas = $("#card"), ctx = canvas.getContext("2d");
  canvas.width = W; canvas.height = H;

  /* ---------- أدوات الرسم ---------- */
  const PH = { x: 124, y: 302, w: 402, h: 508 }; // فتحة الصورة (قوس)
  function archPath(c, x, y, w, h) {
    const rt = w * 0.30, rb = w * 0.06;
    c.beginPath();
    c.moveTo(x + rt, y); c.lineTo(x + w - rt, y); c.arcTo(x + w, y, x + w, y + rt, rt);
    c.lineTo(x + w, y + h - rb); c.arcTo(x + w, y + h, x + w - rb, y + h, rb);
    c.lineTo(x + rb, y + h); c.arcTo(x, y + h, x, y + h - rb, rb);
    c.lineTo(x, y + rt); c.arcTo(x, y, x + rt, y, rt); c.closePath();
  }
  function fitFont(c, text, weight, size, maxW, family = "Cairo") {
    let s = size; c.font = `${weight} ${s}px ${family}`;
    while (c.measureText(text).width > maxW && s > 4) { s -= 1; c.font = `${weight} ${s}px ${family}`; }
    return s;
  }
  function line(c, text, x, y, o) {
    c.save();
    c.direction = o.dir || "ltr"; c.textAlign = "center"; c.textBaseline = "middle";
    if ("letterSpacing" in c) c.letterSpacing = o.ls || "0px";
    if (o.maxW) fitFont(c, text, o.w, o.s, o.maxW); else c.font = `${o.w} ${o.s}px Cairo`;
    if (o.shadow) { c.shadowColor = "rgba(0,0,0,.95)"; c.shadowBlur = 14; c.shadowOffsetY = 3; }
    c.globalAlpha = o.a == null ? 1 : o.a; if (o.st) { c.lineJoin = "round"; c.lineWidth = o.st; c.strokeStyle = "#000"; c.strokeText(text, x, y); } c.fillStyle = o.c; c.fillText(text, x, y); c.restore();
  }
  // أجزاء متجاورة من اليسار لليمين (للأسطر المختلطة عربي/إنجليزي)
  function parts(c, arr, cx, y, gap, maxW) {
    c.save(); c.textBaseline = "middle"; c.textAlign = "left";
    const meas = (k) => { arr.forEach((p) => { c.font = `${p.w} ${Math.round(p.s * k)}px Cairo`; if ("letterSpacing" in c) c.letterSpacing = p.ls || "0px"; p.W = c.measureText(p.t).width; }); return arr.reduce((a, p) => a + p.W, 0) + gap * (arr.length - 1); };
    let k = 1, total = meas(k);
    if (maxW && total > maxW) { k = Math.max(0.25, maxW / total); total = meas(k); }
    let x = cx - total / 2;
    arr.forEach((p) => { c.font = `${p.w} ${Math.round(p.s * k)}px Cairo`; if ("letterSpacing" in c) c.letterSpacing = p.ls || "0px"; c.direction = p.dir || "ltr"; c.globalAlpha = p.a == null ? 1 : p.a; if (p.st) { c.lineJoin = "round"; c.lineWidth = p.st; c.strokeStyle = "#000"; c.strokeText(p.t, x, y); } c.fillStyle = p.c; c.fillText(p.t, x, y); x += p.W + gap; });
    c.restore();
  }
  function vgrad(c, x, y0, y1, a, b, w = 2) {
    const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(x, y0, w, y1 - y0);
  }
  function hgrad(c, x0, x1, y, w = 2) {
    const g = c.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, "rgba(244,203,85,0)"); g.addColorStop(.5, GOLD); g.addColorStop(1, "rgba(244,203,85,0)"); c.fillStyle = g; c.fillRect(x0, y, x1 - x0, w);
  }
  function coverRect(img) {
    const base = Math.max(PH.w / img.width, PH.h / img.height), sc = base * st.zoom;
    const dw = img.width * sc, dh = img.height * sc;
    const maxX = Math.max(0, (dw - PH.w) / 2), maxY = Math.max(0, (dh - PH.h) / 2);
    st.ox = Math.max(-maxX, Math.min(maxX, st.ox)); st.oy = Math.max(-maxY, Math.min(maxY, st.oy));
    return { x: PH.x + (PH.w - dw) / 2 + st.ox, y: PH.y + (PH.h - dh) / 2 + st.oy, w: dw, h: dh };
  }
  function placeholderPhoto(c) {
    const g = c.createLinearGradient(0, PH.y, 0, PH.y + PH.h); g.addColorStop(0, "#c4cede"); g.addColorStop(1, "#aab6cc"); c.fillStyle = g; c.fillRect(PH.x, PH.y, PH.w, PH.h);
    c.fillStyle = "#7886a0"; c.beginPath(); c.arc(PH.x + PH.w / 2, PH.y + 190, 72, 0, 7); c.fill();
    c.beginPath(); c.moveTo(PH.x + 30, PH.y + PH.h); c.quadraticCurveTo(PH.x + 40, PH.y + 330, PH.x + PH.w / 2, PH.y + 318); c.quadraticCurveTo(PH.x + PH.w - 40, PH.y + 330, PH.x + PH.w - 30, PH.y + PH.h); c.fill();
  }

  /* ---------- رسم البطاقة ---------- */
  const safe = (fn) => { try { fn(); } catch (e) { try { console.error("card draw:", e); } catch (x) {} } };
  const dimg = (c, im, ...a) => safe(() => { if (im && im.naturalWidth) c.drawImage(im, ...a); });
  { const _line = line, _parts = parts; line = (...a) => safe(() => _line(...a)); parts = (...a) => safe(() => _parts(...a)); }
  function draw() {
    const c = ctx, v = (k, ph) => (F[k].value.trim() ? { s: F[k].value.trim(), a: 1 } : { s: ph, a: 0.5 });
    c.clearRect(0, 0, W, H); c.fillStyle = "#030a24"; c.fillRect(0, 0, W, H);
    // الصورة خلف الإطار
    c.save(); archPath(c, PH.x - 6, PH.y - 6, PH.w + 12, PH.h + 12); c.clip();
    if (st.photo) { const r = coverRect(st.photo); c.drawImage(st.photo, r.x, r.y, r.w, r.h); } else placeholderPhoto(c);
    c.restore();
    dimg(c, IMG.frame, 0, 0, W, H);
    // اللوجو
    c.save(); c.beginPath(); c.arc(332.5, 168.5, 117.5, 0, 7); c.clip(); dimg(c, IMG.logo, 215, 51, 235, 235); c.restore();
    dimg(c, IMG.plaque, 132, 746, 386, 140);
    dimg(c, IMG.slogan, 685, 828, 760, 140);

    const CX = 937;
    const nAr = v("nameAr", t("phName")), nEn = v("nameEn", "Coach Full Name");
    line(c, nAr.s, CX, 421, { w: 800, s: 48, c: "#fff", dir: "rtl", maxW: 470, a: nAr.a, st: 2 });
    line(c, nEn.s, CX, 482, { w: 700, s: 28, c: GOLD, maxW: 470, a: nEn.a, st: 2 });
    dimg(c, IMG.divider, 707, 512, 460, 17);
    const lab = (cy, e, a) => parts(c, [{ t: e, w: 700, s: 21, c: GOLD, ls: "0.9px", st: 1.6 }, { t: "|", w: 700, s: 21, c: "#9fb3e6", st: 1.6 }, { t: a, w: 700, s: 21, c: GOLD, dir: "rtl", st: 1.6 }], CX, cy, 9, 470);
    lab(551, "Country", "الدولة");
    const cAr = v("countryAr", "الدولة"), cEn = v("countryEn", "Country");
    parts(c, [{ t: cEn.s, w: 800, s: 25, c: "#e4ecff", a: cEn.a, st: 2 }, { t: "•", w: 800, s: 29, c: GOLD, st: 2 }, { t: cAr.s, w: 800, s: 29, c: "#fff", dir: "rtl", a: cAr.a, st: 2 }], CX, 586, 10, 470);
    dimg(c, IMG.divider, 707, 612, 460, 17);
    lab(650, "Club / Academy", "النادي أو الأكاديمية");
    const kAr = v("clubAr", t("phClub")), kEn = v("clubEn", "Club / Academy Name");
    line(c, kAr.s, CX, 695, { w: 800, s: 27, c: "#fff", dir: "rtl", maxW: 470, a: kAr.a, st: 2 });
    line(c, kEn.s, CX, 731, { w: 700, s: 24, c: GOLD, maxW: 470, a: kEn.a, st: 2 });

    // عمود الكود بجانب الصورة
    vgrad(c, 644, 308, 415, "rgba(244,203,85,0)", GOLD);
    line(c, "ID NUMBER", 645, 442, { w: 700, s: 15, c: GOLD, ls: "4px", shadow: true, st: 1.2 });
    const code = st.code || "PTA-2026-0000", seg = code.split("-"), cc = st.code ? 1 : 0.5;
    [seg[0], seg[1], seg[2]].forEach((s, i) => line(c, s, 645, 496 + i * 78, { w: 800, s: 46, c: "#ffd75e", ls: "2px", shadow: true, a: cc, st: 2 }));
    hgrad(c, 615, 675, 535); hgrad(c, 615, 675, 613);
    vgrad(c, 644, 696, 803, GOLD, "rgba(244,203,85,0)");
  }
  let raf = 0; const redraw = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); };

  /* ---------- الصورة: اختيار وتحريك ---------- */
  $("#f_photo").addEventListener("change", async (e) => {
    const f = e.target.files && e.target.files[0]; if (!f) return; setErr("photo", "");
    try {
      const url = URL.createObjectURL(f), img = await loadImg(url);
      st.photo = img; st.zoom = 1; st.ox = st.oy = 0; $("#f_zoom").value = 1; $("#zoomRow").hidden = false; canvas.style.touchAction = "none"; redraw();
    } catch (err) { st.photo = null; setErr("photo", t("eImg")); redraw(); }
  });
  $("#f_zoom").addEventListener("input", (e) => { st.zoom = parseFloat(e.target.value); redraw(); });
  /* سحب الصورة داخل الإطار (ماوس أو لمس) + تكبير بالعجلة أو بإصبعين */
  const ptrs = new Map(); let drag = null, pinch = null;
  const toCanvas = (ev) => { const r = canvas.getBoundingClientRect(); return { x: (ev.clientX - r.left) * W / r.width, y: (ev.clientY - r.top) * H / r.height }; };
  const inWin = (p) => p.x >= PH.x && p.x <= PH.x + PH.w && p.y >= PH.y && p.y <= PH.y + PH.h;
  const setZoom = (z) => { st.zoom = Math.max(1, Math.min(3, z)); $("#f_zoom").value = st.zoom; redraw(); };
  canvas.addEventListener("pointerdown", (ev) => {
    if (!st.photo || st.final) return; const p = toCanvas(ev); if (!inWin(p)) return;
    ptrs.set(ev.pointerId, p); canvas.setPointerCapture(ev.pointerId); canvas.classList.add("drag");
    if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), z: st.zoom }; drag = null; }
    else drag = { p, ox: st.ox, oy: st.oy };
    ev.preventDefault();
  });
  canvas.addEventListener("pointermove", (ev) => {
    if (!ptrs.has(ev.pointerId)) return; const p = toCanvas(ev); ptrs.set(ev.pointerId, p);
    if (pinch && ptrs.size >= 2) { const [a, b] = [...ptrs.values()]; setZoom(pinch.z * Math.hypot(a.x - b.x, a.y - b.y) / (pinch.d || 1)); return; }
    if (drag) { st.ox = drag.ox + (p.x - drag.p.x); st.oy = drag.oy + (p.y - drag.p.y); redraw(); }
  });
  const endPtr = (ev) => { ptrs.delete(ev.pointerId); pinch = null; if (ptrs.size === 1) { const p = [...ptrs.values()][0]; drag = { p, ox: st.ox, oy: st.oy }; } else { drag = null; canvas.classList.remove("drag"); } };
  ["pointerup", "pointercancel"].forEach((n) => canvas.addEventListener(n, endPtr));
  canvas.addEventListener("wheel", (ev) => { if (!st.photo || st.final || !inWin(toCanvas(ev))) return; ev.preventDefault(); setZoom(st.zoom * (ev.deltaY < 0 ? 1.06 : 1 / 1.06)); }, { passive: false });

  /* ---------- الدول: تعبئة تلقائية للترجمة ---------- */
  $("#countries").innerHTML = COUNTRIES.map(([a]) => `<option value="${a}">`).join("");
  $("#countriesEn").innerHTML = COUNTRIES.map(([, e]) => `<option value="${e}">`).join("");
  F.countryAr.addEventListener("change", () => { const e = byAr.get(F.countryAr.value.trim()); if (e && (!F.countryEn.value.trim() || byEn.has(F.countryEn.value.trim().toLowerCase()))) { F.countryEn.value = e; redraw(); } });   // يتحدث لو الخانة فاضية أو فيها دولة من القائمة، ولا يمس ما كُتب يدويًا
  F.countryEn.addEventListener("change", () => { const a = byEn.get(F.countryEn.value.trim().toLowerCase()); if (a && (!F.countryAr.value.trim() || byAr.has(F.countryAr.value.trim()))) { F.countryAr.value = a; redraw(); } });
  Object.values(F).forEach((el) => el.addEventListener("input", redraw));
  /* قائمة رمز الدولة: تتبع دولة المدرب تلقائيًا، ويمكن تغييرها لو الرقم من دولة أخرى */
  const dialSels = [$("#f_phoneDial"), $("#f_waDial")];
  const dialShown = dialSels.map((s) => { const c = document.createElement("span"); c.className = "dialcode"; c.setAttribute("aria-hidden", "true"); s.after(c); return c; });
  function showDial() { dialSels.forEach((s, i) => { const d = DIAL[s.value]; dialShown[i].textContent = d ? "+" + d : t("dialPick"); dialShown[i].classList.toggle("empty", !d); }); }
  function fillDialOpts() {
    dialSels.forEach((s) => {
      const cur = s.value;
      s.innerHTML = `<option value="">${t("dialPick")}</option>` + COUNTRIES.map(([a, e]) => `<option value="${e.toLowerCase()}">+${DIAL[e.toLowerCase()]} ${lang === "en" ? e : a}</option>`).join("");
      s.value = cur;
    });
    showDial();
  }
  function syncDial(ev) {
    const fromAr = (byAr.get(F.countryAr.value.trim()) || "").toLowerCase(), fromEn = F.countryEn.value.trim().toLowerCase();
    const en = ev && ev.target === F.countryAr ? fromAr : fromEn || fromAr;   // الأولوية للخانة اللي اتغيرت
    if (DIAL[en]) dialSels.forEach((s) => { if (!s.dataset.touched) s.value = en; });
    showDial();
  }
  dialSels.forEach((s) => s.addEventListener("change", () => { s.dataset.touched = "1"; showDial(); }));
  ["change", "input"].forEach((ev) => [F.countryAr, F.countryEn].forEach((i) => i.addEventListener(ev, syncDial)));
  fillDialOpts();

  /* ---------- التحقق ---------- */
  const AR = /[؀-ۿ]/, EN = /[A-Za-z]/;
  const phoneOk = (v) => /^\+\d{8,15}$/.test(v);   // لازم بكود الدولة
  /* يوحّد الرقم بصيغة +رمز_الدولة والرقم حسب القائمة المختارة بجانبه، ويحذف صفر البداية */
  function normPhone(v, sel) {
    const s = String(v || "").replace(/[٠-٩]/g, (c) => "٠١٢٣٤٥٦٧٨٩".indexOf(c)).replace(/[۰-۹]/g, (c) => "۰۱۲۳۴۵۶۷۸۹".indexOf(c)).trim();
    const all = s.replace(/\D/g, ""), dial = DIAL[sel.value] || "";
    let d;
    if (s.startsWith("+") || all.startsWith("00")) {   // كتب الرمز بنفسه: يُعتمد ما كتبه
      d = s.startsWith("+") ? all : all.slice(2);
      const m = Object.values(DIAL).find((x) => d.startsWith(x + "0"));
      if (m) d = m + d.slice(m.length).replace(/^0+/, "");
    } else {
      if (!dial) return s;   // لم يختر رمز الدولة: يرفضه التحقق
      const local = all.replace(/^0+/, "");
      const full = local.startsWith(dial) && local.length >= dial.length + 8 && (dial.length > 1 || local.length === 11);
      d = full ? local : dial + local;
    }
    return "+" + d;
  }
  function setErr(k, m) { const e = $("#e_" + k); if (e) { e.textContent = m; e.hidden = !m; } const inp = $("#f_" + k); if (inp) inp.setAttribute("aria-invalid", m ? "true" : "false"); }
  function validate() {
    let ok = true; const bad = (k, m) => { setErr(k, m); ok = false; };
    const chk = (k, re, msgRe) => { const v = F[k].value.trim(); if (!v) return bad(k, t("eReq")); if (v.length < 2) return bad(k, t("eName")); if (re && !re.test(v)) return bad(k, msgRe); setErr(k, ""); };
    chk("nameAr", AR, t("eNameAr")); chk("nameEn", EN, t("eNameEn"));
    chk("countryAr", AR, t("eNameAr")); chk("countryEn", EN, t("eNameEn"));
    chk("clubAr", AR, t("eNameAr")); chk("clubEn", EN, t("eNameEn"));
    const em = $("#f_email").value.trim(); if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) bad("email", t("eEmail")); else setErr("email", "");
    if (API && mode !== "edit" && !/^\d{6}$/.test($("#f_vcode").value.trim())) bad("vcode", t("vReq")); else setErr("vcode", "");
    if (mode !== "edit" && !phoneOk(normPhone($("#f_phone").value, dialSels[0]))) bad("phone", t("ePhone")); else setErr("phone", "");   // في التعديل الرقم تم التحقق منه بالفعل
    if (!st.photo) bad("photo", t("ePhoto")); else setErr("photo", "");
    const promo = ($("input[name=promo]:checked") || {}).value === "yes";
    if (promo && !phoneOk(normPhone($("#f_wa").value, dialSels[1]))) bad("wa", t("eWa")); else setErr("wa", "");
    if (!$("#f_consent").checked) bad("consent", t("eConsent")); else setErr("consent", "");
    return ok;
  }

  /* ---------- الحفظ ---------- */
  const rid = (() => { try { return crypto.randomUUID(); } catch (e) { return "r" + Date.now() + Math.random().toString(16).slice(2); } })();
  function photoJpeg() {
    const c = document.createElement("canvas"); c.width = PH.w * 2; c.height = PH.h * 2; const x = c.getContext("2d");
    const r = coverRect(st.photo); x.drawImage(st.photo, (r.x - PH.x) * 2, (r.y - PH.y) * 2, r.w * 2, r.h * 2);
    return c.toDataURL("image/jpeg", 0.88);
  }
  async function post(body, ms = 60000) {
    const ctl = new AbortController(), tm = setTimeout(() => ctl.abort(), ms);
    try {
      const r = await fetch(API, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(body), signal: ctl.signal, redirect: "follow" });
      return JSON.parse(await r.text());
    } finally { clearTimeout(tm); }
  }
  const toBlob = (type, q) => new Promise((res) => canvas.toBlob(res, type, q));
  let busy = false;
  /* ---------- تأكيد البريد ---------- */
  (function () {
    const b = $("#btnSendCode"); if (!b) return; let cd = 0, tm = null;
    const msg = (k, bad) => { const m = $("#vMsg"); m.textContent = t(k); m.style.color = bad ? "#c0392b" : ""; };
    const tick = () => { if (cd > 0) { b.textContent = t("vResend") + " (" + cd + ")"; b.disabled = true; cd--; tm = setTimeout(tick, 1000); } else { b.textContent = t("vResend"); b.disabled = false; } };
    b.addEventListener("click", async () => {
      const em = $("#f_email").value.trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(em)) { setErr("email", t("eEmail")); $("#f_email").focus(); return; }
      setErr("email", ""); b.disabled = true;
      try {
        const r = await post({ action: "sendcode", email: em }, 30000);
        if (r && r.ok) { msg("vSent"); cd = 60; clearTimeout(tm); tick(); $("#f_vcode").focus(); return; }
        const e = r && r.error;
        if (e === "email_exists") { setErr("email", t("eDup").replace("{code}", r.code || "")); }
        else msg(e === "wait" ? "vWait" : e === "quota" ? "vQuota" : e === "mail_failed" ? "vMail" : e === "bad_email" ? "eEmail" : "eSrv", true);
      } catch (x) { msg("eNet", true); }
      b.disabled = false;
    });
  })();

  $("#regForm").addEventListener("submit", async (ev) => {
    ev.preventDefault(); if (busy) return;
    if ($("#f_website").value) return; // honeypot
    if (!validate()) { const first = $("[aria-invalid=true]"); if (first) first.focus(); return; }
    busy = true; const btn = $("#submitBtn"); btn.disabled = true; btn.textContent = t("saving"); $("#formErr").hidden = true;
    const promo = ($("input[name=promo]:checked") || {}).value === "yes";
    const data = {
      action: "register", rid, lang,
      nameAr: F.nameAr.value.trim(), nameEn: F.nameEn.value.trim(), countryAr: F.countryAr.value.trim(), countryEn: F.countryEn.value.trim(),
      clubAr: F.clubAr.value.trim(), clubEn: F.clubEn.value.trim(), email: $("#f_email").value.trim().toLowerCase(), phone: mode === "edit" ? $("#f_phone").value.trim() : normPhone($("#f_phone").value, dialSels[0]), champions: $("#f_champions").value.trim(),
      promo: promo ? "yes" : "no", whatsapp: promo ? normPhone($("#f_wa").value, dialSels[1]) : "", coachInVideo: promo && $("#f_coachVid").checked ? "yes" : "no",
      photo: photoJpeg(), vcode: $("#f_vcode").value.trim(),
    };
    if (mode === "edit") { data.action = "update"; data.code = editCode; }
    try {
      let res;
      if (API) { res = await post(data); if (!res || !res.ok) { const e = new Error((res && res.error) || "srv"); e.code = res && res.code; throw e; } }
      else res = mode === "edit" ? { ok: false, error: "srv" } : { ok: true, code: "PTA-2026-0000", demo: true };
      st.code = res.code; st.final = true; draw(); await finish(res);
    } catch (err) {
      const m = $("#formErr"); m.textContent = err && /^(bad_vcode|vcode_expired)$/.test(err.message) ? (setErr("vcode", t(err.message === "bad_vcode" ? "vBad" : "vExp")), t(err.message === "bad_vcode" ? "vBad" : "vExp")) : err && err.message === "email_exists" ? t("eDup").replace("{code}", err.code || "") : err && err.message === "bad_phone" ? t("ePhone") : err && err.message === "phone_exists" ? t("eDupPhone").replace("{code}", err.code || "") : (err && err.name === "AbortError") || err instanceof TypeError ? t("eNet") : err && err.message === "not_found" ? t("eNotFound") : t("eSrv"); m.hidden = false;
      btn.disabled = false; btn.textContent = t($("#submitBtn").dataset.t);
    } finally { busy = false; }
  });

  async function finish(res) {
    $("#regForm").hidden = true; $("#result").hidden = false; $("#doneCode").textContent = res.code;
    if (mode === "edit") { const dt = $("#doneTitle"); dt.dataset.t = "doneEditT"; dt.textContent = t("doneEditT"); }
    $("#demoNote").hidden = !res.demo; const ds = $("#driveSt"); ds.hidden = !!res.demo;
    const png = await toBlob("image/png"), jpg = await toBlob("image/jpeg", 0.95);
    const pu = URL.createObjectURL(png), ju = URL.createObjectURL(jpg);
    const a1 = $("#dlPng"), a2 = $("#dlJpg"); a1.href = pu; a1.download = `Coach-ID-${res.code}.png`; a2.href = ju; a2.download = `Coach-ID-${res.code}.jpg`;
    $("#result").scrollIntoView({ behavior: "smooth", block: "start" });
    if (!res.demo && API) {
      ds.textContent = t("driveWait"); ds.dataset.s = "wait";
      const send = () => new Promise((r) => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(jpg); }).then((card) => post({ action: "card", rid, code: res.code, card }, 90000));
      try { let r; try { r = await send(); } catch (e) { r = await send(); } if (r && r.ok) { ds.textContent = t("driveOk"); ds.dataset.s = "ok"; } else throw 0; }
      catch (e) { ds.textContent = t("driveFail"); ds.dataset.s = "bad"; }
    }
  }
  $("#againBtn").addEventListener("click", () => { location.reload(); });

  /* ---------- اللغة والواجهة ---------- */

  /* ---------- اختيار: بطاقة جديدة أو تعديل بطاقتي ---------- */
  let mode = "new", editCode = "";
  const grid = $("#cgrid"), modeBox = $("#modeBox"), lkBox = $("#lookupBox");
  function showForm(m) {
    mode = m; modeBox.hidden = true; lkBox.hidden = true; grid.hidden = false;
    const sb = $("#submitBtn"); sb.dataset.t = m === "edit" ? "submitEdit" : "submit"; sb.textContent = t(sb.dataset.t);
    $("#editBadge").hidden = m !== "edit"; $("#f_email").readOnly = m === "edit"; $("#f_phone").readOnly = m === "edit"; dialSels[0].disabled = m === "edit"; $("#vbox").hidden = m === "edit" || !API;
    redraw();
  }
  $("#btnNew").addEventListener("click", () => showForm("new"));
  $("#f_lkCode").addEventListener("input", (e) => { e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4); });
  $("#btnEdit").addEventListener("click", () => { modeBox.hidden = true; lkBox.hidden = false; $("#f_lkEmail").focus(); });
  $("#lkBack").addEventListener("click", () => { lkBox.hidden = true; modeBox.hidden = false; $("#lkErr").hidden = true; });
  let lkBusy = false;
  $("#lkBtn").addEventListener("click", async () => {
    if (lkBusy) return; const err = $("#lkErr"); err.hidden = true;
    const email = $("#f_lkEmail").value.trim().toLowerCase(), dg = $("#f_lkCode").value.replace(/\D/g, ""), code = dg ? "PTA-2026-" + ("0000" + dg).slice(-4) : "", phone = $("#f_lkPhone").value.trim();
    if (!email || !code || !phone) { err.textContent = t("eLk"); err.hidden = false; return; }
    if (!API) { err.textContent = t("eSrv"); err.hidden = false; return; }
    lkBusy = true; const b = $("#lkBtn"); b.disabled = true; b.textContent = t("saving");
    try {
      const res = await post({ action: "lookup", email, phone, code });
      if (!res || !res.ok) throw new Error((res && res.error) || "srv");
      const d = res.data; editCode = res.code;
      ["nameAr", "nameEn", "countryAr", "countryEn", "clubAr", "clubEn"].forEach((k) => { F[k].value = d[k] || ""; });
      $("#f_email").value = email; $("#f_phone").value = phone; $("#f_champions").value = d.champions || "";
      const pr = $("input[name=promo][value=" + (d.promo === "yes" ? "yes" : "no") + "]"); if (pr) pr.checked = true;
      $("#promoMore").hidden = d.promo !== "yes"; $("#f_wa").value = d.whatsapp || ""; syncDial(); $("#f_coachVid").checked = d.coachInVideo === "yes"; $("#coachImg").hidden = d.coachInVideo !== "yes";
      if (d.photo) { try { const img = await loadImg(d.photo); st.photo = img; st.zoom = 1; st.ox = st.oy = 0; $("#f_zoom").value = 1; $("#zoomRow").hidden = false; canvas.style.touchAction = "none"; } catch (e) {} }
      st.code = editCode; $("#f_consent").checked = false;
      showForm("edit");
    } catch (e) {
      err.textContent = e && e.message === "not_found" ? t("eNotFound") : (e && e.name === "AbortError") || e instanceof TypeError ? t("eNet") : t("eSrv"); err.hidden = false;
    } finally { lkBusy = false; b.disabled = false; b.textContent = t("lkBtn"); }
  });

  /* ---------- أمر ChatGPT الجاهز لصنع صورة مدرب احترافية ---------- */
  (function () {
    const btn = $("#aiBtn"), box = $("#aiBox"), ta = $("#aiText");
    if (!btn) return;
    ta.value = window.AI_PROMPT || "";
    btn.addEventListener("click", () => { const open = box.hidden; box.hidden = !open; btn.setAttribute("aria-expanded", String(open)); });
    const copy = async () => {
      const txt = ta.value;
      try { await navigator.clipboard.writeText(txt); }
      catch (e) { ta.removeAttribute("readonly"); ta.select(); try { document.execCommand("copy"); } catch (x) {} ta.setAttribute("readonly", ""); }
    };
    const flash = (el, key) => { el.textContent = t("aiCopied"); setTimeout(() => { el.textContent = t(key); }, 1800); };
    $("#aiCopy").addEventListener("click", async () => { await copy(); flash($("#aiCopy"), "aiCopy"); });
    $("#aiGo").addEventListener("click", async () => { await copy(); flash($("#aiGo"), "aiGo"); window.open("https://chatgpt.com/", "_blank", "noopener"); });
  })();

  function applyLang() {
    document.documentElement.lang = lang; document.documentElement.dir = lang === "en" ? "ltr" : "rtl";
    document.querySelectorAll("[data-t]").forEach((el) => { const k = el.dataset.t; if (T[lang][k]) el.textContent = T[lang][k]; });
    document.title = t("title") + " — " + (lang === "en" ? "Arab Para Taekwondo Basics 2026" : "أساسيات البارا تايكوندو 2026");
    const sb = $("#submitBtn"); if (!busy) sb.textContent = t(sb.dataset.t);
    $("#langBtn").textContent = t("lang"); $("#demoBanner").hidden = !!API; fillDialOpts(); draw();
  }
  $("#langBtn").addEventListener("click", () => { lang = lang === "en" ? "ar" : "en"; try { localStorage.setItem("lang", lang); } catch (e) {} applyLang(); });
  $("#promoBox").addEventListener("change", () => { const y = ($("input[name=promo]:checked") || {}).value === "yes"; $("#promoMore").hidden = !y; });
  $("#f_coachVid").addEventListener("change", (e) => { $("#coachImg").hidden = !e.target.checked; });

  Promise.all([assetsReady, fontsReady]).then(() => { applyLang(); $("#card").classList.add("ready"); });
})();

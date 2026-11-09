/* صفحة تسجيل اللاعب وإصدار بطاقة البطل — معاينة فورية + حفظ في Google Sheet/Drive عبر Apps Script (backend/players.gs)
   لاعب: يسجّل بياناته فقط. مدرب يشارك كلاعب: يسجّل بياناته ثم يضيف لاعبيه، ولكل لاعب كود وبطاقة. */
(() => {
  "use strict";
  const $ = (s, r = document) => r.querySelector(s);
  const API = (typeof CONFIG !== "undefined" && CONFIG.playerApi) || "";
  const AGE_DATE = (typeof CONFIG !== "undefined" && CONFIG.ageDate) || "2026-12-31";
  const PREFIX = "PTP-2026-";
  const W = 1584, H = 993, GOLD = "#f4cb55";

  /* ---------- بيانات ثابتة ---------- */
  const BELTS = [ // [id, عربي, English, لون, المستوى]
    ["white", "الأبيض", "White", "#ffffff", 1], ["yellow", "الأصفر", "Yellow", "#f2c91b", 1],
    ["green", "الأخضر", "Green", "#1e8e3e", 2], ["blue", "الأزرق", "Blue", "#1f4fb4", 2],
    ["red", "الأحمر", "Red", "#c41e2a", 3], ["black", "الأسود", "Black", "#0b0b0f", 3],
  ];
  const PARA = [
    ["P10", "الإعاقة البصرية", "Visual impairment"], ["P20", "الإعاقة الذهنية", "Intellectual impairment"],
    ["P31", "فئة عصبية أو حركية", "Neurological / motor"], ["P32", "فئة عصبية أو حركية", "Neurological / motor"],
    ["P33", "فئة عصبية أو حركية", "Neurological / motor"], ["P34", "فئة عصبية أو حركية", "Neurological / motor"],
    ["P40", "الإعاقة في الأطراف أو محدودية الحركة", "Limb impairment / limited movement"], ["P50", "مستخدمو الكراسي المتحركة", "Wheelchair users"],
    ["P60", "الصم أو الإعاقة السمعية", "Deaf / hearing impairment"], ["P70", "قِصار القامة", "Short stature"],
    ["NA", "لا أعرف / لم يُصنَّف بعد", "Not sure / not classified yet"],
  ];
  const AGES = [[8, "U8", "أقل من 8 سنوات", "Under 8"], [11, "U11", "أقل من 11 سنة", "Under 11"], [14, "U14", "أقل من 14 سنة", "Under 14"],
    [17, "U17", "أقل من 17 سنة", "Under 17"], [30, "U30", "أقل من 30 سنة", "Under 30"], [40, "U40", "أقل من 40 سنة", "Under 40"],
    [50, "U50", "أقل من 50 سنة", "Under 50"], [999, "O50", "أكثر من 50 سنة", "Over 50"]];
  const LVL_AR = ["", "الأول", "الثاني", "الثالث"];

  /* ---------- نصوص الواجهة ---------- */
  const T = {
    ar: {
      title: "تسجيل اللاعب وإصدار بطاقة البطل",
      lead: "املأ بيانات اللاعب وستظهر بطاقته أمامك فورًا. بعد الحفظ يحصل اللاعب على كوده الفريد وتحمّل البطاقة بصورة عالية الجودة.",
      sportland: "هذا تسجيل مبدئي لبيانات اللاعب وإصدار بطاقته. رفع فيديو المشاركة والتحكيم يتمّان عبر منصة SportLand بعد فتح رابطها رسميًا.",
      guideBtn: "شاهد شرح التسجيل مع مريم", guideT: "شرح التسجيل مع مريم", guideClose: "إغلاق", guideMin: "تصغير الفيديو", guideMax: "تكبير", guideBack: "رجوع 10 ثوانٍ ⏪", guideFwd: "⏩ تقديم 10 ثوانٍ", guideBackS: "10 ⏪", guideFwdS: "⏩ 10", guideWide: "↔ بالعرض", guideTall: "↕ بالطول",
      back: "العودة للموقع", lang: "English", choose: "اختر",
      modeT: "ماذا تريد أن تفعل؟", newId: "تسجيل جديد", newHint: "سجّل بيانات اللاعب لأول مرة واحصل على كوده وبطاقته.", editId: "تعديل بطاقة لاعب", editHint: "لديك كود اللاعب؟ عدّل بياناته أو صورته وأصدر بطاقته من جديد.",
      oneCard: "⚠️ تنبيه: يُسجَّل كل لاعب مرة واحدة فقط وببطاقة واحدة، وأي تسجيل مكرر لنفس اللاعب يُرفض. لتغيير بيانات اللاعب استخدم «تعديل بطاقة لاعب».",
      roleT: "مَن يسجّل؟", roleQ: "اختر صفتك في البطولة", rolePlayer: "لاعب", rolePlayerHint: "أسجّل بياناتي أنا فقط.", roleCoach: "مدرب", roleCoachHint: "أسجّل لاعبيّ، ويمكنني المشاركة أنا أيضًا كلاعب.", competeQ: "هل ستشارك أنت أيضًا كلاعب في البطولة؟", competeNo: "لا، سأسجّل لاعبيّ فقط", competeYes: "نعم، سأشارك كلاعب", g1coachOnly: "بياناتك كمدرب", eNoPlayers: "أضف لاعبًا واحدًا على الأقل.", doneCoachOnlyT: "تم تسجيل لاعبيك",
      gVideo: "فيديو المشاركة", video: "رابط فيديو المشاركة (يمكن إضافته لاحقًا)", videoHint: "ارفع الفيديو على قناتك في يوتيوب واجعله «عام» ليشاهده الجميع وتنتشر البطولة، ثم ضع رابطه هنا. يمكنك تركه الآن وإضافته لاحقًا من «تعديل بطاقة لاعب».",
      zAll: "تحديد الكل", zDl: "تحميل المحدد ({n}) ZIP", zMaking: "جاري تجهيز الملف…", zHint: "علّم على البطاقات اللي عايزها وحمّلها مرة واحدة، أو حمّل كل بطاقة لوحدها من PNG أو JPG.",
      aiBtn: "اصنع صورة لاعب احترافية من خلال AI ChatGPT", aiHint: "انسخ الأمر التالي، ثم الصقه في ChatGPT وأرسل صورة اللاعب عندما يطلبها.", aiCopy: "نسخ الأمر الاحترافي", aiGo: "انسخ واذهب مباشرة إلى ChatGPT", aiCopied: "تم النسخ ✓",
      gPromo: "المشاركة في الفيديو الترويجي (اختياري)", promoQ: "هل تريد المشاركة في الفيديو الترويجي للبطولة؟", promoQCoach: "هل تريد مشاركة لاعبيك في الفيديو الترويجي للبطولة؟", promoYes: "نعم", promoNo: "لا",
      promoHow: "صوّر اللاعب طوليًا ببدلة التايكوندو، وهو يقول شعار البطولة بصوت واضح: «أنا بطل… والأبطال لا يعرفون حدودًا». من غير كتابة أو ملصقات على الفيديو.",
      wa: "رقم واتساب للتواصل (إلزامي عند اختيار نعم)", eWa: "أدخل رقم واتساب صحيحًا مع رمز الدولة.", coachVid: "أرغب أن أشارك أنا أيضًا في الفيديو بصفتي المدرب",
      certNote: "🎓 بعد انتهاء البطولة وتجهيز تصميم شهادة المشاركة، يحصل كل لاعب مسجَّل على شهادة مشاركة بالكود الخاص به. احتفظ بالكود.",
      vClosed: "🔒 الخانة مغلقة مؤقتًا: لم يُفتح موعد إرسال الفيديوهات بعد. عند فتحه تضيف الرابط من «تعديل بطاقة لاعب» بالكود الخاص باللاعب.", vClosedPh: "تُفتح عند بدء موعد إرسال الفيديوهات",
      vChecking: "جاري التأكد من الرابط…", vOk: "✓ الرابط صالح. اضغط على الصورة لمشاهدة الفيديو والتأكد أنه الفيديو الصحيح.", vBadUrl: "هذا ليس رابط فيديو يوتيوب صحيحًا. انسخ الرابط من زر «مشاركة» في يوتيوب.", vMissing: "لم نجد هذا الفيديو. تأكد أنه منشور وأنه «عام» وليس «خاص» أو «مجدول».", vNet: "تعذّر التأكد من الرابط الآن. تحقق من الإنترنت.", eVideo: "صحّح رابط الفيديو أو امسحه واتركه لوقت لاحق.",
      consentCO: "أقرّ بصحة بيانات لاعبيّ، وبأنني مدربهم وحصلت على موافقتهم أو موافقة أولياء أمورهم على التسجيل واستخدام صورهم وبياناتهم لإصدار بطاقات البطل وفي تنظيم البطولة.",
      g1: "بيانات اللاعب", g1coach: "بياناتك كمدرب مشارك", g1added: "بيانات اللاعب الذي تضيفه", g2: "الحزام والتصنيف", g3: "التواصل وولي الأمر", g4: "صورة اللاعب", g4coach: "صورتك", g5: "الإقرار والحفظ",
      nameAr: "اسم اللاعب الكامل بالعربية", nameEn: "اسم اللاعب الكامل بالإنجليزية", nameArC: "اسمك الكامل بالعربية", nameEnC: "اسمك الكامل بالإنجليزية",
      gender: "الجنس", male: "ذكر", female: "أنثى", birth: "تاريخ الميلاد",
      ageCat: "الفئة العمرية (مبدئيًا): {c}", ageNote: "تُحسب الفئة حسب العمر في {d}، والحدود النهائية يعتمدها المنظمون.",
      countryAr: "الدولة بالعربية", countryEn: "الدولة بالإنجليزية",
      clubAr: "النادي أو الأكاديمية بالعربية (اختياري)", clubEn: "النادي أو الأكاديمية بالإنجليزية (اختياري)",
      belt: "لون الحزام", beltHint: "اختر لون الحزام الأساسي، ويشمل جميع درجاته. يُحدَّد المستوى تلقائيًا.", levelInfo: "المستوى {l}: فيديو المستوى {l}",
      para: "رمز تصنيف البارا", paraHint: "إن لم تكن تعرف الرمز اختر «لا أعرف / لم يُصنَّف بعد».",
      coach: "كود المدرب (اختياري)", coachHint: "آخر 4 أرقام من كود المدرب الظاهر على بطاقة المدرب، إن وُجد.", coachC: "كود بطاقتك كمدرب (اختياري)", coachHintC: "إن كانت لديك بطاقة مدرب، اكتب آخر 4 أرقام من كودها.",
      guardian: "اسم ولي الأمر", guardianHint: "مطلوب إذا كان عمر اللاعب أقل من 18 سنة.",
      email: "البريد الإلكتروني (إجباري)", emailHint: "يمكن استخدام نفس البريد لتسجيل أكثر من لاعب (مثل الإخوة).", eEmail: "أدخل بريدًا إلكترونيًا صحيحًا.",
      vLbl: "كود تأكيد البريد (6 أرقام)", vSend: "أرسل الكود", vResend: "إعادة الإرسال", vHint: "اضغط «أرسل الكود» وسيصلك كود على بريدك (تفقّد البريد المزعج أيضًا).", vSent: "تم إرسال الكود إلى بريدك. أدخله هنا (صالح 10 دقائق).", vReq: "أدخل كود التأكيد المرسل إلى بريدك.", vBad: "الكود غير صحيح.", vExp: "انتهت صلاحية الكود. اطلب كودًا جديدًا.", vWait: "انتظر دقيقة قبل طلب كود جديد.", vQuota: "تعذّر الإرسال حاليًا بسبب كثرة الطلبات. حاول لاحقًا.", vMail: "تعذّر إرسال الكود لهذا البريد. تأكد من صحته.",
      phone: "رقم الهاتف (إجباري، مع رمز الدولة)", ePhone: "اختر رمز الدولة وأدخل رقم هاتف صحيحًا.", dialPick: "رمز الدولة", dialHint: "الرمز يتحدد حسب الدولة، ولو رقمك من دولة أخرى غيّره من القائمة.",
      photo: "اختر صورة واضحة للاعب", photoC: "اختر صورة شخصية واضحة", photoHint: "صورة بوجه واضح وخلفية بسيطة. اسحب الصورة داخل الإطار بإصبعك أو بالماوس لضبطها، وكبّرها بإصبعين أو بعجلة الماوس.", zoom: "تكبير الصورة",
      consent: "أقرّ بصحة البيانات، وبأنني اللاعب أو ولي أمره، وأوافق على استخدام صورة اللاعب وبياناته لإصدار بطاقة البطل وفي تنظيم البطولة.",
      consentC: "أقرّ بصحة بياناتي وبيانات لاعبيّ، وأوافق على استخدام صورتي وبياناتي لإصدار بطاقة البطل وفي تنظيم البطولة، وأقرّ بأنني حصلت على موافقة لاعبيّ أو أولياء أمورهم على تسجيلهم واستخدام صورهم وبياناتهم.",
      consentA: "أقرّ بصحة بيانات هذا اللاعب، وبأنني مدربه وحصلت على موافقته أو موافقة ولي أمره على التسجيل واستخدام صورته وبياناته لإصدار بطاقة البطل وفي تنظيم البطولة.",
      submit: "احفظ البيانات وأصدر البطاقة", submitEdit: "احفظ التعديلات وأصدر البطاقة", saving: "جاري الحفظ…",
      previewNote: "هذه معاينة حيّة. يظهر الكود الفريد بعد الحفظ.",
      demo: "وضع المعاينة: لم يُربط الحفظ بعد، لذلك لن تُسجَّل البيانات. البطاقة قابلة للتحميل للتجربة فقط.",
      doneT: "تم تسجيل اللاعب", doneEditT: "تم تحديث البيانات", doneCode: "كود اللاعب", keep: "احتفظ بالكود، فهو رقم اللاعب في البطولة.",
      dlPng: "تحميل البطاقة PNG", dlJpg: "تحميل JPG", another: "تسجيل جديد",
      gPlayers: "لاعبوك", playersHint: "أضف بيانات كل لاعب تدرّبه، ويحصل كل لاعب على كوده وبطاقته عند الحفظ. الدولة والنادي والبريد والهاتف تؤخذ من بياناتك.", addP: "أضف لاعب", remove: "حذف", showCard: "عرض البطاقة", playerN: "لاعب {n}", tabMe: "بطاقتك", addedT: "بطاقات لاعبيك", doneCoachT: "تم تسجيلك وتسجيل لاعبيك", savedOf: "تم حفظ {a} من {b} لاعبين.",
      driveOk: "تم حفظ نسخة من البطاقة لدى الإدارة.", driveWait: "جاري حفظ نسخة من البطاقة…", driveFail: "تعذّر حفظ نسخة البطاقة تلقائيًا، لكن البيانات سُجّلت.",
      lkT: "تعديل بطاقة لاعب", lkHint: "أدخل رقم الهاتف والبريد الإلكتروني المسجَّلين وكود اللاعب الظاهر على بطاقته. وبعد التأكد من البيانات تُفتح صفحة تعديلها.", lkPhone: "رقم الهاتف المسجَّل", lkEmail: "البريد الإلكتروني", lkCode: "كود اللاعب (آخر 4 أرقام فقط)", lkBtn: "عرض البيانات", lkBack: "رجوع",
      eNotFound: "لم نجد تسجيلًا بهذه البيانات. تأكد من كتابتها كما سجّلت.", eLk: "أدخل رقم الهاتف والبريد الإلكتروني والكود.", editBadge: "وضع التعديل: عدّل ما تريد ثم احفظ لإصدار البطاقة من جديد.",
      eName: "اكتب الاسم الكامل (حرفان على الأقل).", eNameAr: "اكتب الاسم بالحروف العربية.", eNameEn: "اكتب الاسم بالحروف الإنجليزية.",
      eReq: "هذا الحقل مطلوب.", eBirth: "أدخل تاريخ ميلاد صحيحًا.", eCoach: "اكتب 4 أرقام فقط.", eGuardian: "اكتب اسم ولي الأمر لأن عمر اللاعب أقل من 18 سنة.",
      ePhoto: "أضف صورة اللاعب.", eConsent: "يلزم الإقرار للمتابعة.", eDup: "هذا اللاعب مسجّل مسبقًا بالكود {code}. استخدم «تعديل بطاقة لاعب».",
      eNet: "تعذّر الاتصال بالخادم. تحقق من الإنترنت وحاول مرة أخرى.", eSrv: "حدث خطأ أثناء الحفظ. حاول مرة أخرى بعد قليل.", eImg: "تعذّر قراءة هذه الصورة. جرّب صورة JPG أو PNG.",
      phName: "اسم اللاعب الكامل", phClub: "اسم النادي أو الأكاديمية",
      lblLevel: "المستوى", lblAge: "الفئة", lblPara: "التصنيف", lblCountry: "الدولة", lblClub: "النادي",
    },
    en: {
      title: "Player Registration & Champion Card",
      lead: "Fill in the player's details and the card appears live. After saving, the player gets a unique code and a high-quality card to download.",
      sportland: "This is the initial registration of the player's details and card. Uploading the performance video and judging take place on the SportLand platform once its link is officially opened.",
      guideBtn: "Watch the registration guide (Arabic)", guideT: "Registration guide with Mariam", guideClose: "Close", guideMin: "Minimize video", guideMax: "Enlarge", guideBack: "⏪ Back 10 seconds", guideFwd: "Forward 10 seconds ⏩", guideBackS: "⏪ 10", guideFwdS: "10 ⏩", guideWide: "↔ Landscape", guideTall: "↕ Portrait",
      back: "Back to site", lang: "عربي", choose: "Choose",
      modeT: "What would you like to do?", newId: "New registration", newHint: "Register the player for the first time and get the code and card.", editId: "Edit a player card", editHint: "Have the player's code? Update the details or photo and re-issue the card.",
      oneCard: "⚠️ Notice: each player registers once only, with one card; any duplicate registration of the same player is rejected. To change a player's details use “Edit a player card”.",
      roleT: "Who is registering?", roleQ: "Choose your role in the championship", rolePlayer: "Player", rolePlayerHint: "I register my own details only.", roleCoach: "Coach", roleCoachHint: "I register my players, and I can compete as a player too.", competeQ: "Will you also compete as a player?", competeNo: "No, I only register my players", competeYes: "Yes, I will compete as a player", g1coachOnly: "Your details as the coach", eNoPlayers: "Add at least one player.", doneCoachOnlyT: "Your players are registered",
      gVideo: "Performance video", video: "Performance video link (can be added later)", videoHint: "Upload the video to your YouTube channel and set it to “Public” so everyone can watch it and the championship spreads, then paste its link here. You can leave it for now and add it later from “Edit a player card”.",
      zAll: "Select all", zDl: "Download selected ({n}) ZIP", zMaking: "Preparing the file…", zHint: "Tick the cards you want and download them in one file, or download each card on its own as PNG or JPG.",
      aiBtn: "Create a professional athlete photo with ChatGPT AI", aiHint: "Copy the prompt below, paste it into ChatGPT and send the athlete's photo when asked.", aiCopy: "Copy the professional prompt", aiGo: "Copy & go to ChatGPT", aiCopied: "Copied ✓",
      gPromo: "Promo video participation (optional)", promoQ: "Would you like to appear in the championship promo video?", promoQCoach: "Would you like your players to appear in the championship promo video?", promoYes: "Yes", promoNo: "No",
      promoHow: "Film the athlete vertically in the Taekwondo uniform, clearly saying the championship slogan: “I am a champion… and champions know no limits”. No text or stickers on the video.",
      wa: "WhatsApp number (required if Yes)", eWa: "Enter a valid WhatsApp number with country code.", coachVid: "I would also like to appear in the video as the coach",
      certNote: "🎓 After the championship, once the participation certificate design is ready, every registered player gets a participation certificate with their code. Keep the code.",
      vClosed: "🔒 Temporarily closed: video submission has not opened yet. When it opens, add the link from “Edit a player card” using the player's code.", vClosedPh: "Opens when video submission starts",
      vChecking: "Checking the link…", vOk: "✓ The link works. Click the image to watch the video and make sure it is the right one.", vBadUrl: "This is not a valid YouTube video link. Copy it from the “Share” button on YouTube.", vMissing: "We could not find this video. Make sure it is published as “Public”, not “Private” or “Scheduled”.", vNet: "Could not check the link right now. Check your connection.", eVideo: "Fix the video link, or clear it and add it later.",
      consentCO: "I confirm my players' details are correct, that I am their coach, and that I have their or their guardians' consent to register them and to use their photos and details for the champion cards and the championship.",
      g1: "Player details", g1coach: "Your details as a competing coach", g1added: "Details of the player you are adding", g2: "Belt & classification", g3: "Contact & guardian", g4: "Player photo", g4coach: "Your photo", g5: "Declaration & save",
      nameAr: "Player full name (Arabic)", nameEn: "Player full name (English)", nameArC: "Your full name (Arabic)", nameEnC: "Your full name (English)",
      gender: "Gender", male: "Male", female: "Female", birth: "Date of birth",
      ageCat: "Age category (provisional): {c}", ageNote: "Calculated from the age on {d}; the final limits are set by the organisers.",
      countryAr: "Country (Arabic)", countryEn: "Country (English)",
      clubAr: "Club / Academy (Arabic, optional)", clubEn: "Club / Academy (English, optional)",
      belt: "Belt colour", beltHint: "Choose the main belt colour (all its grades). The level is set automatically.", levelInfo: "Level {l}: level {l} video",
      para: "Para classification code", paraHint: "If you don't know the code, choose “Not sure / not classified yet”.",
      coach: "Coach code (optional)", coachHint: "The last 4 digits of the code on the coach's ID card, if any.", coachC: "Your coach card code (optional)", coachHintC: "If you have a coach ID card, enter the last 4 digits of its code.",
      guardian: "Guardian's name", guardianHint: "Required if the player is under 18.",
      email: "Email (required)", emailHint: "The same email can register more than one player (e.g. siblings).", eEmail: "Enter a valid email address.",
      vLbl: "Email verification code (6 digits)", vSend: "Send code", vResend: "Resend", vHint: "Press “Send code” and we will email you a code (check spam too).", vSent: "Code sent to your email. Enter it here (valid 10 minutes).", vReq: "Enter the verification code sent to your email.", vBad: "Incorrect code.", vExp: "The code has expired. Request a new one.", vWait: "Please wait a minute before requesting another code.", vQuota: "Sending is temporarily unavailable. Try again later.", vMail: "Could not send a code to this email. Check that it is correct.",
      phone: "Phone number (required, with country code)", ePhone: "Choose the country code and enter a valid phone number.", dialPick: "Country code", dialHint: "The code follows your country. If your number is from another country, change it in the list.",
      photo: "Choose a clear photo of the player", photoC: "Choose a clear profile photo", photoHint: "Clear face, simple background. Drag the photo inside the frame with your finger or mouse to adjust it; pinch or scroll to zoom.", zoom: "Zoom",
      consent: "I confirm the data is correct, that I am the player or the player's guardian, and agree to the use of the player's photo and details to issue the champion card and run the championship.",
      consentC: "I confirm my details and my players' details are correct, agree to the use of my photo and details for the champion card and the championship, and confirm I have my players' or their guardians' consent to register them and use their photos and details.",
      consentA: "I confirm this player's data is correct, that I am the player's coach, and that I have the player's or guardian's consent to register and to use the player's photo and details for the champion card and the championship.",
      submit: "Save & issue the card", submitEdit: "Save changes & re-issue the card", saving: "Saving…",
      previewNote: "Live preview. The unique code appears after saving.",
      demo: "Preview mode: saving is not connected yet, so nothing is recorded. The card can be downloaded for testing only.",
      doneT: "The player is registered", doneEditT: "The details are updated", doneCode: "Player code", keep: "Keep this code — it is the player's championship number.",
      dlPng: "Download card (PNG)", dlJpg: "Download JPG", another: "New registration",
      gPlayers: "Your players", playersHint: "Add the details of each player you coach; every player gets a code and a card when you save. Country, club, email and phone are taken from your details.", addP: "Add player", remove: "Remove", showCard: "Show card", playerN: "Player {n}", tabMe: "Your card", addedT: "Your players' cards", doneCoachT: "You and your players are registered", savedOf: "{a} of {b} players saved.",
      driveOk: "A copy of the card was saved with the organisers.", driveWait: "Saving a copy of the card…", driveFail: "Could not store the card copy automatically, but the details are registered.",
      lkT: "Edit a player card", lkHint: "Enter the registered phone number, email and the player's code shown on the card. Once verified, the edit page opens.", lkPhone: "Registered phone number", lkEmail: "Email", lkCode: "Player code (last 4 digits only)", lkBtn: "Show details", lkBack: "Back",
      eNotFound: "No registration found with these details. Check them as you registered.", eLk: "Enter the phone number, email and code.", editBadge: "Edit mode: change what you need, then save to re-issue the card.",
      eName: "Enter the full name (2+ characters).", eNameAr: "Write the name in Arabic letters.", eNameEn: "Write the name in English letters.",
      eReq: "This field is required.", eBirth: "Enter a valid date of birth.", eCoach: "Enter 4 digits only.", eGuardian: "Enter the guardian's name, as the player is under 18.",
      ePhoto: "Add the player's photo.", eConsent: "Please accept to continue.", eDup: "This player is already registered with code {code}. Use “Edit a player card”.",
      eNet: "Could not reach the server. Check your connection and retry.", eSrv: "Something went wrong while saving. Please try again shortly.", eImg: "This image could not be read. Try a JPG or PNG.",
      phName: "Player Full Name", phClub: "Club / Academy Name",
      lblLevel: "Level", lblAge: "Category", lblPara: "Class", lblCountry: "Country", lblClub: "Club",
    },
  };
  let lang = "ar";
  try { lang = localStorage.getItem("lang") === "en" ? "en" : "ar"; } catch (e) {}
  const t = (k) => T[lang][k] || T.ar[k] || k;

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
    loadImg("assets/card/plaque-champion.webp").then((i) => (IMG.plaque = i)),
    loadImg("assets/card/slogan.webp").then((i) => (IMG.slogan = i)),
    loadImg("assets/card/divider.webp").then((i) => (IMG.divider = i)),
  ].map((p) => p.catch(() => {})));
  const fontsReady = Promise.all(["800 48px Cairo", "700 28px Cairo", "600 20px Cairo"].map((f) => document.fonts.load(f, "أAa").catch(() => {}))).then(() => document.fonts.ready);

  /* ---------- حالة الصفحة ----------
     subject = صاحب بطاقة: main (الحقول الأساسية) أو block (لاعب يضيفه المدرب) */
  const newRid = () => { try { return crypto.randomUUID(); } catch (e) { return "r" + Date.now() + Math.random().toString(16).slice(2); } };
  const mkSub = (kind, el) => ({ kind, el, photo: null, zoom: 1, ox: 0, oy: 0, code: "", rid: newRid(), final: false, err: "" });
  const main = mkSub("main", null);
  const blocks = [];
  let active = main, mode = "new", editCode = "", role = "player", compete = false;
  const coachOnly = () => role === "coach" && !compete && mode !== "edit";   // مدرب لا يشارك: يسجّل لاعبيه فقط
  const sess = { token: "", email: "" };
  const F = {};
  ["nameAr", "nameEn", "countryAr", "countryEn", "clubAr", "clubEn", "birth", "belt", "para", "coach", "guardian", "email", "phone", "vcode"].forEach((k) => (F[k] = $("#f_" + k)));
  const canvas = $("#card"), ctx = canvas.getContext("2d");
  canvas.width = W; canvas.height = H;
  const INHERIT = ["countryAr", "countryEn", "clubAr", "clubEn"];

  /* ---------- حسابات ---------- */
  function ageOf(birth) {
    if (!birth) return null;
    const b = new Date(birth + "T00:00:00"), d = new Date(AGE_DATE + "T00:00:00");
    if (isNaN(b) || b > new Date()) return null;
    let a = d.getFullYear() - b.getFullYear(); if (d.getMonth() < b.getMonth() || (d.getMonth() === b.getMonth() && d.getDate() < b.getDate())) a--;
    return a;
  }
  const ageCat = (age) => (age == null ? null : AGES.find((x) => age < x[0]));
  const beltOf = (id) => BELTS.find((b) => b[0] === id);
  const q = (sub, k) => sub.el.querySelector(`[data-k="${k}"]`);
  function val(sub, k) {
    if (sub.kind === "main" || INHERIT.includes(k)) {
      if (k === "gender") return ($("input[name=gender]:checked") || {}).value || "";
      return F[k] ? F[k].value.trim() : "";
    }
    if (k === "gender") return (sub.el.querySelector("input[data-k=gender]:checked") || {}).value || "";
    const e = q(sub, k); return e ? e.value.trim() : "";
  }

  /* ---------- أدوات الرسم ---------- */
  const PH = { x: 124, y: 302, w: 402, h: 508 };
  function archPath(c, x, y, w, h) {
    const rt = w * 0.30, rb = w * 0.06;
    c.beginPath();
    c.moveTo(x + rt, y); c.lineTo(x + w - rt, y); c.arcTo(x + w, y, x + w, y + rt, rt);
    c.lineTo(x + w, y + h - rb); c.arcTo(x + w, y + h, x + w - rb, y + h, rb);
    c.lineTo(x + rb, y + h); c.arcTo(x, y + h, x, y + h - rb, rb);
    c.lineTo(x, y + rt); c.arcTo(x, y, x + rt, y, rt); c.closePath();
  }
  function fitFont(c, text, weight, size, maxW) {
    let s = size; c.font = `${weight} ${s}px Cairo`;
    while (c.measureText(text).width > maxW && s > 4) { s -= 1; c.font = `${weight} ${s}px Cairo`; }
    return s;
  }
  function line(c, text, x, y, o) {
    c.save();
    c.direction = o.dir || "ltr"; c.textAlign = "center"; c.textBaseline = "middle";
    if ("letterSpacing" in c) c.letterSpacing = o.ls || "0px";
    if (o.maxW) fitFont(c, text, o.w, o.s, o.maxW); else c.font = `${o.w} ${o.s}px Cairo`;
    if (o.shadow) { c.shadowColor = "rgba(0,0,0,.95)"; c.shadowBlur = 14; c.shadowOffsetY = 3; }
    c.globalAlpha = o.a == null ? 1 : o.a; if (o.st) { c.lineJoin = "round"; c.lineWidth = o.st; c.strokeStyle = "#000"; c.strokeText(text, x, y); } c.fillStyle = o.c; c.fillText(text, x, y);
    c.restore();
  }
  function parts(c, arr, cx, y, gap, maxW) {
    c.save(); c.textBaseline = "middle"; c.textAlign = "left";
    const meas = (k) => { arr.forEach((p) => { c.font = `${p.w} ${Math.round(p.s * k)}px Cairo`; if ("letterSpacing" in c) c.letterSpacing = p.ls || "0px"; p.W = c.measureText(p.t).width; }); return arr.reduce((a, p) => a + p.W, 0) + gap * (arr.length - 1); };
    let k = 1, total = meas(k);
    if (maxW && total > maxW) { k = Math.max(0.25, maxW / total); total = meas(k); }
    let x = cx - total / 2;
    arr.forEach((p) => { c.font = `${p.w} ${Math.round(p.s * k)}px Cairo`; if ("letterSpacing" in c) c.letterSpacing = p.ls || "0px"; c.direction = p.dir || "ltr"; c.globalAlpha = p.a == null ? 1 : p.a; if (p.st) { c.lineJoin = "round"; c.lineWidth = p.st; c.strokeStyle = "#000"; c.strokeText(p.t, x, y); } c.fillStyle = p.c; c.fillText(p.t, x, y); x += p.W + gap; });
    c.restore();
  }
  function vgrad(c, x, y0, y1, a, b, w = 2) { const g = c.createLinearGradient(0, y0, 0, y1); g.addColorStop(0, a); g.addColorStop(1, b); c.fillStyle = g; c.fillRect(x, y0, w, y1 - y0); }
  function hgrad(c, x0, x1, y, w = 2) { const g = c.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, "rgba(244,203,85,0)"); g.addColorStop(.5, GOLD); g.addColorStop(1, "rgba(244,203,85,0)"); c.fillStyle = g; c.fillRect(x0, y, x1 - x0, w); }
  function coverRect(sub) {
    const img = sub.photo, base = Math.max(PH.w / img.width, PH.h / img.height), sc = base * sub.zoom;
    const dw = img.width * sc, dh = img.height * sc;
    const maxX = Math.max(0, (dw - PH.w) / 2), maxY = Math.max(0, (dh - PH.h) / 2);
    sub.ox = Math.max(-maxX, Math.min(maxX, sub.ox)); sub.oy = Math.max(-maxY, Math.min(maxY, sub.oy));
    return { x: PH.x + (PH.w - dw) / 2 + sub.ox, y: PH.y + (PH.h - dh) / 2 + sub.oy, w: dw, h: dh };
  }
  function placeholderPhoto(c) {
    const g = c.createLinearGradient(0, PH.y, 0, PH.y + PH.h); g.addColorStop(0, "#c4cede"); g.addColorStop(1, "#aab6cc"); c.fillStyle = g; c.fillRect(PH.x, PH.y, PH.w, PH.h);
    c.fillStyle = "#7886a0"; c.beginPath(); c.arc(PH.x + PH.w / 2, PH.y + 190, 72, 0, 7); c.fill();
    c.beginPath(); c.moveTo(PH.x + 30, PH.y + PH.h); c.quadraticCurveTo(PH.x + 40, PH.y + 330, PH.x + PH.w / 2, PH.y + 318); c.quadraticCurveTo(PH.x + PH.w - 40, PH.y + 330, PH.x + PH.w - 30, PH.y + PH.h); c.fill();
  }
  const safe = (fn) => { try { return fn(); } catch (e) { try { console.error("card draw:", e); } catch (x) {} } };
  const dimg = (c, im, ...a) => safe(() => { if (im && im.naturalWidth) c.drawImage(im, ...a); });

  /* ---------- رسم البطاقة ---------- */
  function drawCard(c, sub) {
    const v = (k, ph) => (val(sub, k) ? { s: val(sub, k), a: 1 } : { s: ph, a: 0.5 });
    c.clearRect(0, 0, W, H); c.fillStyle = "#030a24"; c.fillRect(0, 0, W, H);
    c.save(); archPath(c, PH.x - 6, PH.y - 6, PH.w + 12, PH.h + 12); c.clip();
    if (sub.photo) { const r = coverRect(sub); c.drawImage(sub.photo, r.x, r.y, r.w, r.h); } else placeholderPhoto(c);
    c.restore();
    dimg(c, IMG.frame, 0, 0, W, H);
    c.save(); c.beginPath(); c.arc(332.5, 168.5, 117.5, 0, 7); c.clip(); dimg(c, IMG.logo, 215, 51, 235, 235); c.restore();
    dimg(c, IMG.plaque, 132, 746, 386, 140);
    dimg(c, IMG.slogan, 685, 828, 760, 140);

    const CX = 937;
    const nAr = v("nameAr", "اسم اللاعب الكامل"), nEn = v("nameEn", "Player Full Name");
    line(c, nAr.s, CX, 421, { w: 800, s: 48, c: "#fff", dir: "rtl", maxW: 470, a: nAr.a, st: 2 });
    line(c, nEn.s, CX, 482, { w: 700, s: 28, c: GOLD, maxW: 470, a: nEn.a, st: 2 });
    dimg(c, IMG.divider, 707, 512, 460, 17);

    const lab = (x, y, e, a) => parts(c, [{ t: e, w: 700, s: 17, c: GOLD, ls: "0.8px", st: 1.4 }, { t: "|", w: 700, s: 17, c: "#9fb3e6", st: 1.4 }, { t: a, w: 700, s: 17, c: GOLD, dir: "rtl", st: 1.4 }], x, y, 6, 150);
    const XS = [CX + 160, CX, CX - 160];
    lab(XS[0], 550, "LEVEL", "المستوى"); lab(XS[1], 550, "CATEGORY", "الفئة"); lab(XS[2], 550, "CLASS", "التصنيف");
    vgrad(c, CX + 80, 540, 625, "rgba(244,203,85,0)", "rgba(244,203,85,.55)"); vgrad(c, CX - 80, 540, 625, "rgba(244,203,85,0)", "rgba(244,203,85,.55)");
    const b = beltOf(val(sub, "belt"));
    if (b) {
      c.save(); c.font = "800 30px Cairo"; const tw = Math.min(120, c.measureText(b[1]).width); c.restore();
      const x0 = XS[0] - (tw + 34) / 2;
      c.save(); c.beginPath(); c.arc(x0 + 12, 588, 12, 0, 7); c.fillStyle = b[3]; c.fill(); c.lineWidth = 3; c.strokeStyle = GOLD; c.stroke(); c.restore();
      line(c, b[1], x0 + 34 + tw / 2, 588, { w: 800, s: 30, c: "#fff", dir: "rtl", maxW: 120, st: 2 });
      parts(c, [{ t: "LEVEL " + b[4], w: 700, s: 17, c: "#e4ecff", st: 1.4 }, { t: "•", w: 700, s: 17, c: GOLD, st: 1.4 }, { t: "المستوى " + LVL_AR[b[4]], w: 700, s: 17, c: "#e4ecff", dir: "rtl", st: 1.4 }], XS[0], 624, 6, 150);
    } else line(c, "—", XS[0], 588, { w: 800, s: 30, c: "#fff", a: 0.5 });
    const ac = ageCat(ageOf(val(sub, "birth")));
    line(c, ac ? ac[1] : "U—", XS[1], 588, { w: 800, s: 34, c: "#ffd75e", a: ac ? 1 : 0.5, st: 2 });
    if (ac) line(c, lang === "en" ? ac[3] : ac[2], XS[1], 624, { w: 700, s: 17, c: "#e4ecff", dir: lang === "en" ? "ltr" : "rtl", maxW: 150, st: 1.4 });
    const pc = val(sub, "para");
    line(c, pc && pc !== "NA" ? pc : "P—", XS[2], 588, { w: 800, s: 34, c: "#ffd75e", a: pc ? 1 : 0.5, st: 2 });
    line(c, "PARA TAEKWONDO", XS[2], 624, { w: 700, s: 14, c: "#e4ecff", ls: "1px", maxW: 150, st: 1.2 });
    dimg(c, IMG.divider, 707, 646, 460, 17);

    const cAr = v("countryAr", "الدولة"), cEn = v("countryEn", "Country");
    parts(c, [{ t: cEn.s, w: 800, s: 24, c: "#e4ecff", a: cEn.a, st: 2 }, { t: "•", w: 800, s: 27, c: GOLD, st: 2 }, { t: cAr.s, w: 800, s: 27, c: "#fff", dir: "rtl", a: cAr.a, st: 2 }], CX, 690, 10, 470);
    const kAr = val(sub, "clubAr"), kEn = val(sub, "clubEn");
    if (kAr || kEn) parts(c, [kEn && { t: kEn, w: 700, s: 21, c: GOLD, st: 1.8 }, kEn && kAr && { t: "|", w: 700, s: 21, c: "#9fb3e6", st: 1.8 }, kAr && { t: kAr, w: 800, s: 23, c: "#fff", dir: "rtl", st: 1.8 }].filter(Boolean), CX, 732, 8, 470);
    else if (!sub.final) line(c, t("phClub"), CX, 732, { w: 700, s: 21, c: "#fff", a: 0.35, dir: lang === "en" ? "ltr" : "rtl" });

    vgrad(c, 644, 308, 415, "rgba(244,203,85,0)", GOLD);
    line(c, "ID NUMBER", 645, 442, { w: 700, s: 15, c: GOLD, ls: "4px", shadow: true, st: 1.2 });
    const code = sub.code || PREFIX + "0000", seg = code.split("-"), cc = sub.code ? 1 : 0.5;
    [seg[0], seg[1], seg[2]].forEach((s, i) => line(c, s, 645, 496 + i * 78, { w: 800, s: 46, c: "#ffd75e", ls: "2px", shadow: true, a: cc, st: 2 }));
    hgrad(c, 615, 675, 535); hgrad(c, 615, 675, 613);
    vgrad(c, 644, 696, 803, GOLD, "rgba(244,203,85,0)");
  }
  const draw = () => safe(() => drawCard(ctx, active));
  let raf = 0; const redraw = () => { cancelAnimationFrame(raf); raf = requestAnimationFrame(draw); };
  function renderCanvas(sub) { const cv = document.createElement("canvas"); cv.width = W; cv.height = H; safe(() => drawCard(cv.getContext("2d"), sub)); return cv; }

  /* ---------- القوائم والمعلومات ---------- */
  const beltOpts = () => `<option value="">${t("choose")}</option>` + BELTS.map((b) => `<option value="${b[0]}">${lang === "en" ? b[2] + " belt — Level " + b[4] : "الحزام " + b[1] + " — المستوى " + LVL_AR[b[4]]}</option>`).join("");
  const paraOpts = () => `<option value="">${t("choose")}</option>` + PARA.map((p) => `<option value="${p[0]}">${p[0] === "NA" ? (lang === "en" ? p[2] : p[1]) : p[0] + " — " + (lang === "en" ? p[2] : p[1])}</option>`).join("");
  function fillSelects() {
    document.querySelectorAll("#f_belt, select[data-k=belt]").forEach((s) => { const v = s.value; s.innerHTML = beltOpts(); s.value = v; });
    document.querySelectorAll("#f_para, select[data-k=para]").forEach((s) => { const v = s.value; s.innerHTML = paraOpts(); s.value = v; });
  }
  function infoFor(sub) {
    const age = ageOf(val(sub, "birth")), ac = ageCat(age), b = beltOf(val(sub, "belt"));
    const ageTxt = ac ? t("ageCat").replace("{c}", (lang === "en" ? ac[3] : ac[2]) + " (" + ac[1] + ")") + " — " + t("ageNote").replace("{d}", AGE_DATE) : "";
    const lvlTxt = b ? t("levelInfo").replaceAll("{l}", lang === "en" ? String(b[4]) : LVL_AR[b[4]]) : "";
    const minor = age != null && age < 18;
    if (sub.kind === "main") { $("#ageInfo").textContent = ageTxt; $("#levelInfo").textContent = lvlTxt; $("#guardianRow").hidden = !(minor || F.guardian.value.trim()); }
    else { sub.el.querySelector(".bAge").textContent = ageTxt; sub.el.querySelector(".bLevel").textContent = lvlTxt; sub.el.querySelector(".pguard").hidden = !(minor || val(sub, "guardian")); }
  }
  const infoAll = () => { infoFor(main); blocks.forEach(infoFor); };

  /* ---------- اختيار صاحب البطاقة في المعاينة ---------- */
  function subName(sub, i) { return val(sub, "nameAr") || val(sub, "nameEn") || (sub.kind === "main" ? t("tabMe") : t("playerN").replace("{n}", i)); }
  function renderTabs() {
    const box = $("#ptabs"), show = role === "coach" && blocks.length > 0 && mode !== "edit";
    box.hidden = !show; if (!show) return;
    const subs = tabSubs();
    box.innerHTML = subs.map((s, i) => `<button type="button" role="tab" aria-selected="${s === active}" data-i="${i}">${subName(s, i).replace(/[<>&"]/g, "")}</button>`).join("");
  }
  const tabSubs = () => (coachOnly() ? blocks.slice() : [main, ...blocks]);
  $("#ptabs").addEventListener("click", (e) => { const b = e.target.closest("button[data-i]"); if (b) setActive(tabSubs()[+b.dataset.i]); });
  function setActive(sub) {
    if (sub === main && coachOnly() && blocks.length) sub = blocks[0];
    active = sub; blocks.forEach((b) => b.el.classList.toggle("on", b === sub));
    renderTabs(); redraw();
  }

  /* ---------- الصورة ---------- */
  async function pickPhoto(sub, file, errKey) {
    if (!file) return; setErrS(sub, "photo", "");
    try {
      const img = await loadImg(URL.createObjectURL(file)); sub.photo = img; sub.zoom = 1; sub.ox = sub.oy = 0;
      const z = sub.kind === "main" ? $("#f_zoom") : sub.el.querySelector(".pzoomIn"); z.value = 1;
      (sub.kind === "main" ? $("#zoomRow") : sub.el.querySelector(".pzoom")).hidden = false;
      canvas.style.touchAction = "none"; setActive(sub);
    } catch (err) { sub.photo = null; setErrS(sub, "photo", t("eImg")); redraw(); }
  }
  $("#f_photo").addEventListener("change", (e) => pickPhoto(main, e.target.files && e.target.files[0]));
  $("#f_zoom").addEventListener("input", (e) => { main.zoom = parseFloat(e.target.value); setActive(main); });
  const ptrs = new Map(); let drag = null, pinch = null;
  const toCanvas = (ev) => { const r = canvas.getBoundingClientRect(); return { x: (ev.clientX - r.left) * W / r.width, y: (ev.clientY - r.top) * H / r.height }; };
  const inWin = (p) => p.x >= PH.x && p.x <= PH.x + PH.w && p.y >= PH.y && p.y <= PH.y + PH.h;
  const setZoom = (z) => { active.zoom = Math.max(1, Math.min(3, z)); const s = active.kind === "main" ? $("#f_zoom") : active.el.querySelector(".pzoomIn"); s.value = active.zoom; redraw(); };
  canvas.addEventListener("pointerdown", (ev) => {
    if (!active.photo || active.final) return; const p = toCanvas(ev); if (!inWin(p)) return;
    ptrs.set(ev.pointerId, p); canvas.setPointerCapture(ev.pointerId); canvas.classList.add("drag");
    if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), z: active.zoom }; drag = null; } else drag = { p, ox: active.ox, oy: active.oy };
    ev.preventDefault();
  });
  canvas.addEventListener("pointermove", (ev) => {
    if (!ptrs.has(ev.pointerId)) return; const p = toCanvas(ev); ptrs.set(ev.pointerId, p);
    if (pinch && ptrs.size >= 2) { const [a, b] = [...ptrs.values()]; setZoom(pinch.z * Math.hypot(a.x - b.x, a.y - b.y) / (pinch.d || 1)); return; }
    if (drag) { active.ox = drag.ox + (p.x - drag.p.x); active.oy = drag.oy + (p.y - drag.p.y); redraw(); }
  });
  const endPtr = (ev) => { ptrs.delete(ev.pointerId); pinch = null; if (ptrs.size === 1) { const p = [...ptrs.values()][0]; drag = { p, ox: active.ox, oy: active.oy }; } else { drag = null; canvas.classList.remove("drag"); } };
  ["pointerup", "pointercancel"].forEach((n) => canvas.addEventListener(n, endPtr));
  canvas.addEventListener("wheel", (ev) => { if (!active.photo || active.final || !inWin(toCanvas(ev))) return; ev.preventDefault(); setZoom(active.zoom * (ev.deltaY < 0 ? 1.06 : 1 / 1.06)); }, { passive: false });

  /* ---------- الحقول الأساسية ---------- */
  $("#countries").innerHTML = COUNTRIES.map(([a]) => `<option value="${a}">`).join("");
  $("#countriesEn").innerHTML = COUNTRIES.map(([, e]) => `<option value="${e}">`).join("");
  F.countryAr.addEventListener("change", () => { const e = byAr.get(F.countryAr.value.trim()); if (e && !F.countryEn.value.trim()) { F.countryEn.value = e; redraw(); } });
  F.countryEn.addEventListener("change", () => { const a = byEn.get(F.countryEn.value.trim().toLowerCase()); if (a && !F.countryAr.value.trim()) { F.countryAr.value = a; redraw(); } });
  /* قائمة رمز الدولة: تتبع دولة اللاعب تلقائيًا، ويمكن تغييرها لو الرقم من دولة أخرى */
  const dialSels = [$("#f_phoneDial"), $("#f_waDial")];
  function fillDialOpts() {
    dialSels.forEach((s) => {
      const cur = s.value;
      s.innerHTML = `<option value="">${t("dialPick")}</option>` + COUNTRIES.map(([a, e]) => `<option value="${e.toLowerCase()}">+${DIAL[e.toLowerCase()]} ${lang === "en" ? e : a}</option>`).join("");
      s.value = cur;
    });
  }
  function syncDial(ev) {
    const fromAr = (byAr.get(F.countryAr.value.trim()) || "").toLowerCase(), fromEn = F.countryEn.value.trim().toLowerCase();
    const en = ev && ev.target === F.countryAr ? fromAr : fromEn || fromAr;   // الأولوية للخانة اللي اتغيرت
    if (DIAL[en]) dialSels.forEach((s) => { if (!s.dataset.touched) s.value = en; });
  }
  dialSels.forEach((s) => s.addEventListener("change", () => { s.dataset.touched = "1"; }));
  ["change", "input"].forEach((ev) => [F.countryAr, F.countryEn].forEach((i) => i.addEventListener(ev, syncDial)));
  fillDialOpts();
  const mainFields = $("#regForm");
  mainFields.addEventListener("focusin", (e) => { if (!coachOnly() && !e.target.closest(".pblock") && !e.target.closest("#playersBox") && active !== main && (INHERIT.includes((e.target.id || "").slice(2)) ? false : true)) setActive(main); });
  Object.values(F).forEach((el) => ["input", "change"].forEach((n) => el.addEventListener(n, () => { infoAll(); renderTabs(); redraw(); })));
  $("#genderBox").addEventListener("change", redraw);
  ["#f_coach", "#f_lkCode"].forEach((s) => $(s).addEventListener("input", (e) => { e.target.value = e.target.value.replace(/\D/g, "").slice(0, 4); }));

  /* ---------- رابط فيديو المشاركة: يوتيوب فقط، ونتأكد أن الفيديو موجود من صورته المصغّرة ---------- */
  function ytId(u) {
    const m = String(u || "").trim().match(/^(?:https?:\/\/)?(?:www\.|m\.|music\.)?(?:youtube\.com\/(?:watch\?(?:.*&)?v=|shorts\/|embed\/|live\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})(?:[?&#\/].*)?$/);
    return m ? m[1] : "";
  }
  const ytUrl = (id) => "https://youtu.be/" + id;
  function thumbOk(id) {
    return new Promise((res) => {
      const i = new Image(); let done = false; const fin = (v) => { if (!done) { done = true; res(v); } };
      i.onload = () => fin(i.naturalWidth > 120 ? "ok" : "missing");   // الفيديو غير الموجود يرجع صورة 120×90 أو خطأ 404
      i.onerror = () => fin("missing"); setTimeout(() => fin("net"), 12000);
      i.src = `https://i.ytimg.com/vi/${id}/mqdefault.jpg?t=${Date.now()}`;
    });
  }
  // inp = حقل الرابط، msg = سطر الحالة، prev = مكان المعاينة. النتيجة في inp.dataset.v: "" فارغ | ok | bad
  async function checkVideo(inp, msg, prev) {
    const v = inp.value.trim(); prev.innerHTML = ""; msg.className = "vmsg";
    if (!v) { inp.dataset.v = ""; msg.textContent = ""; return; }
    const id = ytId(v);
    if (!id) { inp.dataset.v = "bad"; msg.textContent = t("vBadUrl"); msg.classList.add("bad"); return; }
    inp.dataset.v = "checking"; msg.textContent = t("vChecking"); const mine = (inp._seq = (inp._seq || 0) + 1);
    const r = await thumbOk(id); if (mine !== inp._seq) return;
    if (r === "ok") {
      inp.dataset.v = "ok"; inp.dataset.id = id; msg.textContent = t("vOk"); msg.classList.add("ok");
      prev.innerHTML = `<button type="button" class="vthumb" aria-label="Play"><img src="https://i.ytimg.com/vi/${id}/mqdefault.jpg" alt="" width="320" height="180"><span aria-hidden="true">▶</span></button>`;
      prev.querySelector("button").addEventListener("click", () => { prev.innerHTML = `<iframe src="https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0" title="YouTube" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`; });
    } else { inp.dataset.v = r === "net" ? "net" : "bad"; msg.textContent = t(r === "net" ? "vNet" : "vMissing"); msg.classList.add("bad"); }
  }
  function wireVideo(inp, msg, prev) {
    let tm = 0; const go = () => { clearTimeout(tm); tm = setTimeout(() => { if (inp.value.trim() === inp._last) return; inp._last = inp.value.trim(); checkVideo(inp, msg, prev); }, 500); };
    inp.addEventListener("input", go); inp.addEventListener("change", go); inp.addEventListener("paste", go);
  }
  const VIDEO_OPEN = typeof CONFIG !== "undefined" && CONFIG.videoOpen === true;
  // قبل موعد إرسال الفيديوهات: الخانة مقفولة مع توضيح
  function lockVideo(inp, msg) {
    if (VIDEO_OPEN || !inp) return;
    inp.disabled = true; inp.value = ""; inp.placeholder = t("vClosedPh"); inp.dir = lang === "en" ? "ltr" : "rtl";
    msg.dataset.t = "vClosed"; msg.textContent = t("vClosed"); msg.className = "vmsg closed";
  }
  wireVideo($("#f_video"), $("#videoMsg"), $("#videoPrev")); lockVideo($("#f_video"), $("#videoMsg"));
  const videoInp = (sub) => (sub.kind === "main" ? $("#f_video") : sub.el.querySelector("[data-k=video]"));
  const videoVal = (sub) => { const i = videoInp(sub); return i && i.dataset.v === "ok" ? ytUrl(i.dataset.id) : ""; };

  /* ---------- لاعبو المدرب (+ أضف لاعب) ---------- */
  let bid = 0;
  function addBlock() {
    const id = ++bid, el = document.createElement("div"); el.className = "pblock";
    el.innerHTML = `
      <div class="phead"><b class="pt"></b><span><button type="button" class="pshow" data-t="showCard">${t("showCard")}</button> <button type="button" class="prem" data-t="remove">${t("remove")}</button></span></div>
      <div class="fld"><label for="b${id}_nameAr" data-t="nameAr">${t("nameAr")}</label><input id="b${id}_nameAr" data-k="nameAr" type="text" maxlength="60" dir="rtl" lang="ar"><p class="err" data-e="nameAr" hidden></p></div>
      <div class="fld"><label for="b${id}_nameEn" data-t="nameEn">${t("nameEn")}</label><input id="b${id}_nameEn" data-k="nameEn" type="text" maxlength="60" dir="ltr" lang="en"><p class="err" data-e="nameEn" hidden></p></div>
      <div class="fld"><span class="q" data-t="gender">${t("gender")}</span><div class="radios"><label><input type="radio" name="g${id}" data-k="gender" value="m"> <span data-t="male">${t("male")}</span></label><label><input type="radio" name="g${id}" data-k="gender" value="f"> <span data-t="female">${t("female")}</span></label></div><p class="err" data-e="gender" hidden></p></div>
      <div class="fld"><label for="b${id}_birth" data-t="birth">${t("birth")}</label><input id="b${id}_birth" data-k="birth" type="date" dir="ltr" min="1940-01-01"><p class="hint bAge"></p><p class="err" data-e="birth" hidden></p></div>
      <div class="fld"><label for="b${id}_belt" data-t="belt">${t("belt")}</label><select id="b${id}_belt" data-k="belt">${beltOpts()}</select><p class="hint bLevel"></p><p class="err" data-e="belt" hidden></p></div>
      <div class="fld"><label for="b${id}_para" data-t="para">${t("para")}</label><select id="b${id}_para" data-k="para">${paraOpts()}</select><p class="err" data-e="para" hidden></p></div>
      <div class="fld pguard" hidden><label for="b${id}_guardian" data-t="guardian">${t("guardian")}</label><input id="b${id}_guardian" data-k="guardian" type="text" maxlength="60"><p class="hint" data-t="guardianHint">${t("guardianHint")}</p><p class="err" data-e="guardian" hidden></p></div>
      <div class="fld"><label for="b${id}_photo" data-t="photo">${t("photo")}</label><input id="b${id}_photo" data-k="photo" type="file" accept="image/*"><p class="err" data-e="photo" hidden></p></div>
      <div class="fld pzoom" hidden><label data-t="zoom">${t("zoom")}</label><input class="pzoomIn" type="range" min="1" max="3" step="0.02" value="1"></div>
      <div class="fld"><label for="b${id}_video" data-t="video">${t("video")}</label><input id="b${id}_video" data-k="video" type="url" inputmode="url" dir="ltr" maxlength="200" placeholder="https://youtu.be/..." autocomplete="off"><p class="vmsg"></p><div class="vprev"></div><p class="err" data-e="video" hidden></p></div>`;
    $("#plist").appendChild(el);
    const sub = mkSub("block", el); blocks.push(sub);
    wireVideo(el.querySelector("[data-k=video]"), el.querySelector(".vmsg"), el.querySelector(".vprev")); lockVideo(el.querySelector("[data-k=video]"), el.querySelector(".vmsg"));
    el.addEventListener("focusin", () => { if (active !== sub) setActive(sub); });
    el.addEventListener("input", () => { infoFor(sub); renderTabs(); if (active === sub) redraw(); });
    el.addEventListener("change", (e) => { if (e.target.dataset.k === "photo") pickPhoto(sub, e.target.files && e.target.files[0]); infoFor(sub); renderTabs(); if (active === sub) redraw(); });
    el.querySelector(".pzoomIn").addEventListener("input", (e) => { sub.zoom = parseFloat(e.target.value); setActive(sub); });
    el.querySelector(".pshow").addEventListener("click", () => { setActive(sub); canvas.scrollIntoView({ behavior: "smooth", block: "center" }); });
    el.querySelector(".prem").addEventListener("click", () => { blocks.splice(blocks.indexOf(sub), 1); el.remove(); numberBlocks(); setActive(active === sub ? (blocks[0] || main) : active); });
    numberBlocks(); setActive(sub); el.querySelector("input").focus();
  }
  function numberBlocks() { blocks.forEach((b, i) => { b.el.querySelector(".pt").textContent = t("playerN").replace("{n}", i + 1); }); }
  $("#addP").addEventListener("click", addBlock);

  /* ---------- التحقق ---------- */
  const AR = /[؀-ۿ]/, EN = /[A-Za-z]/, EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
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
  function setErrS(sub, k, m) {
    if (sub.kind === "main") return setErr(k, m);
    const e = sub.el.querySelector(`[data-e="${k}"]`); if (e) { e.textContent = m; e.hidden = !m; }
    const inp = q(sub, k); if (inp) inp.setAttribute("aria-invalid", m ? "true" : "false");
  }
  function checkPerson(sub) {
    let ok = true; const bad = (k, m) => { setErrS(sub, k, m); ok = false; };
    const chk = (k, re, msgRe) => { const v = val(sub, k); if (!v) return bad(k, t("eReq")); if (v.length < 2) return bad(k, t("eName")); if (!re.test(v)) return bad(k, msgRe); setErrS(sub, k, ""); };
    chk("nameAr", AR, t("eNameAr")); chk("nameEn", EN, t("eNameEn"));
    if (!val(sub, "gender")) bad("gender", t("eReq")); else setErrS(sub, "gender", "");
    const age = ageOf(val(sub, "birth")); if (age == null || age < 3 || age > 90) bad("birth", t("eBirth")); else setErrS(sub, "birth", "");
    if (!val(sub, "belt")) bad("belt", t("eReq")); else setErrS(sub, "belt", "");
    if (!val(sub, "para")) bad("para", t("eReq")); else setErrS(sub, "para", "");
    if (age != null && age < 18 && val(sub, "guardian").length < 2) bad("guardian", t("eGuardian")); else setErrS(sub, "guardian", "");
    if (!sub.photo) bad("photo", t("ePhoto")); else setErrS(sub, "photo", "");
    const vi = videoInp(sub); if (vi && vi.value.trim() && vi.dataset.v !== "ok") bad("video", t("eVideo")); else setErrS(sub, "video", "");
    return ok;
  }
  function validate() {
    let ok = true; const bad = (k, m) => { setErr(k, m); ok = false; };
    if (coachOnly()) {   // المدرب الذي لا يشارك: الاسم وبيانات التواصل فقط
      const chkN = (k, re, msgRe) => { const v = F[k].value.trim(); if (!v) return bad(k, t("eReq")); if (v.length < 2) return bad(k, t("eName")); if (!re.test(v)) return bad(k, msgRe); setErr(k, ""); };
      chkN("nameAr", AR, t("eNameAr")); chkN("nameEn", EN, t("eNameEn"));
    } else ok = checkPerson(main);
    const chk = (k, re, msgRe, opt) => { const v = F[k].value.trim(); if (!v) return opt ? setErr(k, "") : bad(k, t("eReq")); if (v.length < 2) return bad(k, t("eName")); if (!re.test(v)) return bad(k, msgRe); setErr(k, ""); };
    chk("countryAr", AR, t("eNameAr")); chk("countryEn", EN, t("eNameEn"));
    chk("clubAr", AR, t("eNameAr"), true); chk("clubEn", EN, t("eNameEn"), true);
    if (F.coach.value && !/^\d{4}$/.test(F.coach.value)) bad("coach", t("eCoach")); else setErr("coach", "");
    if (!EMAIL.test(F.email.value.trim())) bad("email", t("eEmail")); else setErr("email", "");
    if (needCode() && !/^\d{6}$/.test(F.vcode.value.trim())) bad("vcode", t("vReq")); else setErr("vcode", "");
    if (mode !== "edit" && !phoneOk(normPhone(F.phone.value, dialSels[0]))) bad("phone", t("ePhone")); else setErr("phone", "");   // في التعديل الرقم تم التحقق منه بالفعل
    if (!$("#f_consent").checked) bad("consent", t("eConsent")); else setErr("consent", "");
    if (promoYes() && !phoneOk(normPhone($("#f_wa").value, dialSels[1]))) bad("wa", t("eWa")); else setErr("wa", "");
    let firstBad = ok ? null : main;
    if (withPlayers()) blocks.forEach((b) => { if (!checkPerson(b)) { ok = false; firstBad = firstBad || b; } });
    if (coachOnly() && !blocks.length) { ok = false; const m = $("#formErr"); m.textContent = t("eNoPlayers"); m.hidden = false; }
    return { ok, firstBad: firstBad || main };
  }
  const withPlayers = () => role === "coach" && mode !== "edit";
  const needCode = () => !!API && mode !== "edit" && !(sess.token && F.email.value.trim().toLowerCase() === sess.email);

  /* ---------- الاتصال بالخادم ---------- */
  function photoJpeg(sub) {
    const c = document.createElement("canvas"); c.width = PH.w * 2; c.height = PH.h * 2; const x = c.getContext("2d");
    const r = coverRect(sub); x.drawImage(sub.photo, (r.x - PH.x) * 2, (r.y - PH.y) * 2, r.w * 2, r.h * 2);
    return c.toDataURL("image/jpeg", 0.88);
  }
  async function post(body, ms = 60000) {
    const ctl = new AbortController(), tm = setTimeout(() => ctl.abort(), ms);
    try { const r = await fetch(API, { method: "POST", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(body), signal: ctl.signal, redirect: "follow" }); return JSON.parse(await r.text()); }
    finally { clearTimeout(tm); }
  }
  const blobOf = (cv, type, q2) => new Promise((res) => cv.toBlob(res, type, q2));
  let busy = false;

  (function () { // كود تأكيد البريد
    const b = $("#btnSendCode"); let cd = 0, tm = null;
    const msg = (k, bad) => { const m = $("#vMsg"); m.textContent = t(k); m.style.color = bad ? "#ff9aa3" : ""; };
    const tick = () => { if (cd > 0) { b.textContent = t("vResend") + " (" + cd + ")"; b.disabled = true; cd--; tm = setTimeout(tick, 1000); } else { b.textContent = t("vResend"); b.disabled = false; } };
    b.addEventListener("click", async () => {
      const em = F.email.value.trim().toLowerCase();
      if (!EMAIL.test(em)) { setErr("email", t("eEmail")); F.email.focus(); return; }
      setErr("email", ""); b.disabled = true;
      try {
        const r = await post({ action: "sendcode", email: em, lang }, 30000);
        if (r && r.ok) { msg("vSent"); cd = 60; clearTimeout(tm); tick(); F.vcode.focus(); return; }
        const e = r && r.error; msg(e === "wait" ? "vWait" : e === "quota" ? "vQuota" : e === "mail_failed" ? "vMail" : e === "bad_email" ? "eEmail" : "eSrv", true);
      } catch (x) { msg("eNet", true); }
      b.disabled = false;
    });
  })();

  function collect(sub, addedBy) {
    const birth = val(sub, "birth");
    return {
      rid: sub.rid, lang, role: sub.kind === "main" && role === "coach" ? "coach" : "player", addedBy: addedBy || "",
      nameAr: val(sub, "nameAr"), nameEn: val(sub, "nameEn"), gender: val(sub, "gender"), birth,
      ageCat: (ageCat(ageOf(birth)) || [])[1] || "", countryAr: F.countryAr.value.trim(), countryEn: F.countryEn.value.trim(),
      clubAr: F.clubAr.value.trim(), clubEn: F.clubEn.value.trim(), belt: val(sub, "belt"), level: (beltOf(val(sub, "belt")) || [])[4] || "",
      para: val(sub, "para"), coachCode: F.coach.value && (sub.kind === "main" || role === "coach") ? "PTA-2026-" + F.coach.value : "", guardian: val(sub, "guardian"),
      coachName: sub.kind === "block" ? F.nameAr.value.trim() + " / " + F.nameEn.value.trim() : "", video: VIDEO_OPEN ? videoVal(sub) : undefined,
      promo: promoYes() ? "yes" : "no", whatsapp: promoYes() ? normPhone($("#f_wa").value, dialSels[1]) : "",
      coachInVideo: promoYes() && role === "coach" && sub.kind === "main" && $("#f_coachVid").checked ? "yes" : "no",   // undefined = لا يُرسل، فلا يُمسح رابط محفوظ
      email: F.email.value.trim().toLowerCase(), phone: mode === "edit" ? F.phone.value.trim() : normPhone(F.phone.value, dialSels[0]), photo: photoJpeg(sub), vcode: F.vcode.value.trim(), token: sess.token,
    };
  }
  const errText = (e, code) => e === "player_exists" ? t("eDup").replace("{code}", code || "") : e === "bad_phone" ? t("ePhone") : e === "bad_vcode" ? t("vBad") : e === "vcode_expired" ? t("vExp") : e === "not_found" ? t("eNotFound") : e === "net" ? t("eNet") : t("eSrv");

  $("#regForm").addEventListener("submit", async (ev) => {
    ev.preventDefault(); if (busy) return;
    if ($("#f_website").value) return; // honeypot
    const v = validate();
    if (!v.ok) { setActive(v.firstBad); const first = (v.firstBad.kind === "main" ? $("#regForm") : v.firstBad.el).querySelector("[aria-invalid=true]") || $("[aria-invalid=true]"); if (first) first.focus(); return; }
    busy = true; const btn = $("#submitBtn"); btn.disabled = true; btn.textContent = t("saving"); $("#formErr").hidden = true;
    let demo = !API;
    if (coachOnly()) return saveCoachOnly(btn);
    try {
      // 1) صاحب الحساب
      const data = collect(main); data.action = mode === "edit" ? "update" : "register"; if (mode === "edit") data.code = editCode;
      let res;
      if (API) { res = await post(data); if (!res || !res.ok) { const e = new Error((res && res.error) || "srv"); e.code = res && res.code; throw e; } }
      else res = mode === "edit" ? { ok: false, error: "srv" } : { ok: true, code: PREFIX + "0000", demo: true };
      if (res.token) { sess.token = res.token; sess.email = data.email; }
      main.code = res.code; main.final = true;
      // 2) لاعبو المدرب، واحدًا تلو الآخر
      if (withPlayers()) for (const b of blocks) {
        b.err = "";
        try {
          if (!API) { b.code = PREFIX + "0000"; b.final = true; continue; }
          const d = collect(b, main.code); d.action = "register"; d.token = sess.token;
          const r = await post(d);
          if (r && r.ok) { b.code = r.code; b.final = true; } else b.err = errText(r && r.error, r && r.code);
        } catch (x) { b.err = errText("net"); }
      }
      busy = false; await finish(demo);
    } catch (err) {
      const e = err && err.message, m = $("#formErr");
      if (e === "bad_vcode" || e === "vcode_expired") { setErr("vcode", errText(e)); sess.token = ""; $("#vbox").hidden = false; }
      m.textContent = (err && err.name === "AbortError") || err instanceof TypeError ? t("eNet") : errText(e, err && err.code); m.hidden = false;
      btn.disabled = false; btn.textContent = t(btn.dataset.t);
    } finally { busy = false; }
  });

  /* ---------- تحميل عدة بطاقات: تحديد يدوي أو تحديد الكل ثم ملف ZIP واحد ---------- */
  const zipState = { items: [] };
  const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
  const crc32 = (u) => { let c = 0xFFFFFFFF; for (let i = 0; i < u.length; i++) c = CRC[(c ^ u[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
  async function makeZip(files) {   // ZIP بدون ضغط (الصور مضغوطة أصلًا)
    const enc = new TextEncoder(), parts = [], central = []; let off = 0;
    for (const f of files) {
      const data = new Uint8Array(await f.blob.arrayBuffer()), name = enc.encode(f.name), crc = crc32(data);
      const h = new DataView(new ArrayBuffer(30)); [[0, 0x04034b50, 4], [4, 20, 2], [6, 0x0800, 2], [8, 0, 2], [10, 0, 2], [12, 0x21, 2], [14, crc, 4], [18, data.length, 4], [22, data.length, 4], [26, name.length, 2], [28, 0, 2]].forEach(([o, v, s]) => (s === 4 ? h.setUint32(o, v, true) : h.setUint16(o, v, true)));
      const c = new DataView(new ArrayBuffer(46)); [[0, 0x02014b50, 4], [4, 20, 2], [6, 20, 2], [8, 0x0800, 2], [10, 0, 2], [12, 0, 2], [14, 0x21, 2], [16, crc, 4], [20, data.length, 4], [24, data.length, 4], [28, name.length, 2], [30, 0, 2], [32, 0, 2], [34, 0, 2], [36, 0, 2], [38, 0, 4], [42, off, 4]].forEach(([o, v, s]) => (s === 4 ? c.setUint32(o, v, true) : c.setUint16(o, v, true)));
      parts.push(h, name, data); central.push(c, name); off += 30 + name.length + data.length;
    }
    const size = central.reduce((a, x) => a + x.byteLength, 0), e = new DataView(new ArrayBuffer(22));
    [[0, 0x06054b50, 4], [4, 0, 2], [6, 0, 2], [8, files.length, 2], [10, files.length, 2], [12, size, 4], [16, off, 4], [20, 0, 2]].forEach(([o, v, s]) => (s === 4 ? e.setUint32(o, v, true) : e.setUint16(o, v, true)));
    return new Blob([...parts, ...central, e], { type: "application/zip" });
  }
  const zsel = () => [...document.querySelectorAll("#addedList .zsel")];
  function syncZip() {
    const all = zsel(), on = all.filter((x) => x.checked).length, za = $("#zAll");
    za.checked = on === all.length && on > 0; za.indeterminate = on > 0 && on < all.length;
    const b = $("#zDl"); b.disabled = !on; b.textContent = t("zDl").replace("{n}", on);
  }
  $("#addedList").addEventListener("change", (e) => { if (e.target.classList.contains("zsel")) syncZip(); });
  $("#zAll").addEventListener("change", (e) => { zsel().forEach((x) => (x.checked = e.target.checked)); syncZip(); });
  $("#zDl").addEventListener("click", async () => {
    const pick = zsel().filter((x) => x.checked).map((x) => zipState.items[+x.dataset.z]).filter(Boolean); if (!pick.length) return;
    const b = $("#zDl"); b.disabled = true; b.textContent = t("zMaking");
    try { const z = await makeZip(pick), a = document.createElement("a"); a.href = URL.createObjectURL(z); a.download = `Champion-Cards-${pick.length}.zip`; document.body.appendChild(a); a.click(); a.remove(); }
    finally { syncZip(); }
  });

  /* مدرب لا يشارك: يُحفظ اللاعبون فقط، أولهم بكود تأكيد البريد والباقون بالـ token */
  async function saveCoachOnly(btn) {
    try {
      for (const b of blocks) {
        b.err = "";
        if (!API) { b.code = PREFIX + "0000"; b.final = true; continue; }
        const d = collect(b, ""); d.action = "register";
        let r;
        try { r = await post(d); } catch (x) { b.err = errText("net"); continue; }
        if (r && r.ok) { b.code = r.code; b.final = true; if (r.token) { sess.token = r.token; sess.email = d.email; } }
        else if (r && (r.error === "bad_vcode" || r.error === "vcode_expired") && !sess.token) throw new Error(r.error);
        else b.err = errText(r && r.error, r && r.code);
      }
      busy = false; await finish(!API);
    } catch (err) {
      const e = err && err.message; setErr("vcode", errText(e)); $("#vbox").hidden = false;
      const m = $("#formErr"); m.textContent = errText(e); m.hidden = false; btn.disabled = false; btn.textContent = t(btn.dataset.t);
    } finally { busy = false; }
  }

  async function finish(demo) {
    const co = coachOnly();
    $("#regForm").hidden = true; $("#result").hidden = false; $("#doneCode").textContent = main.code; $("#mainRes").hidden = co;
    const dt = $("#doneTitle"); dt.dataset.t = mode === "edit" ? "doneEditT" : co ? "doneCoachOnlyT" : withPlayers() && blocks.length ? "doneCoachT" : "doneT"; dt.textContent = t(dt.dataset.t);
    $("#demoNote").hidden = !demo; const ds = $("#driveSt"); ds.hidden = demo;
    setActive(co ? (blocks.find((b) => b.final) || main) : main);
    const outs = [];   // [sub, jpgBlob]
    const links = async (sub) => {
      const cv = renderCanvas(sub), png = await blobOf(cv, "image/png"), jpg = await blobOf(cv, "image/jpeg", 0.95);
      return { png: URL.createObjectURL(png), jpg: URL.createObjectURL(jpg), jpgBlob: jpg, pngBlob: png };
    };
    const fileBase = (sub, i) => `Player-ID-${sub.code}-${(val(sub, "nameEn") || "player" + i).replace(/[^A-Za-z0-9]+/g, "_").replace(/^_|_$/g, "")}`;
    const zipItems = [];   // البطاقات المتاحة للتحميل الجماعي
    let m = null;
    if (!co) {
      m = await links(main); outs.push([main, m.jpgBlob]);
      const a1 = $("#dlPng"), a2 = $("#dlJpg"); a1.href = m.png; a1.download = fileBase(main, 0) + ".png"; a2.href = m.jpg; a2.download = fileBase(main, 0) + ".jpg";
    }
    const esc = (s) => String(s).replace(/[<>&"]/g, "");
    if (withPlayers() && blocks.length) {
      const rows = [];
      if (m) { zipItems.push({ name: fileBase(main, 0) + ".png", blob: m.pngBlob }); rows.push(`<li><label class="pick"><input type="checkbox" class="zsel" data-z="0" checked> <b dir="ltr">${main.code}</b> — ${esc(val(main, "nameAr"))} (${esc(t("tabMe"))})</label><span class="dl"><a href="${m.png}" download="${fileBase(main, 0)}.png">PNG</a><a href="${m.jpg}" download="${fileBase(main, 0)}.jpg">JPG</a></span></li>`); }
      for (const [i, b] of blocks.entries()) {
        const nm = esc(val(b, "nameAr") || t("playerN").replace("{n}", i + 1));
        if (b.err) { rows.push(`<li><span class="bad">${nm}: ${esc(b.err)}</span></li>`); continue; }
        const l = await links(b); outs.push([b, l.jpgBlob]);
        const base = fileBase(b, i + 1), z = zipItems.push({ name: base + ".png", blob: l.pngBlob }) - 1;
        rows.push(`<li><label class="pick"><input type="checkbox" class="zsel" data-z="${z}" checked> <b dir="ltr">${b.code}</b> — ${nm}</label><span class="dl"><a href="${l.png}" download="${base}.png">PNG</a><a href="${l.jpg}" download="${base}.jpg">JPG</a></span></li>`);
      }
      $("#addedList").innerHTML = rows.join(""); $("#addedBox").hidden = false;
      $("#zBar").hidden = zipItems.length < 2; zipState.items = zipItems; syncZip();
    } else $("#addedBox").hidden = true;
    renderTabs();
    $("#result").scrollIntoView({ behavior: "smooth", block: "start" });
    if (!demo && API) {
      ds.textContent = t("driveWait"); ds.dataset.s = "wait"; let okAll = true;
      for (const [sub, jpg] of outs) {
        const send = () => new Promise((r) => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(jpg); }).then((card) => post({ action: "card", rid: sub.rid, code: sub.code, card }, 90000));
        try { let r; try { r = await send(); } catch (e) { r = await send(); } if (!(r && r.ok)) okAll = false; } catch (e) { okAll = false; }
      }
      ds.textContent = t(okAll ? "driveOk" : "driveFail"); ds.dataset.s = okAll ? "ok" : "bad";
    }
  }
  $("#againBtn").addEventListener("click", () => { location.reload(); });

  /* ---------- اختيار الصفة (لاعب / مدرب) ---------- */
  function applyRole() {
    const coach = role === "coach";
    $("#roleBox").hidden = mode === "edit";
    const set = (sel, k) => { const el = $(sel); el.dataset.t = k; el.textContent = t(k); };
    set("#lg1", coach ? "g1coach" : "g1");
    set("#l_nameAr", coach ? "nameArC" : "nameAr"); set("#l_nameEn", coach ? "nameEnC" : "nameEn");
    set("#lg4", coach ? "g4coach" : "g4"); set("#l_photo", coach ? "photoC" : "photo");
    set("#l_coach", coach ? "coachC" : "coach"); set("#h_coach", coach ? "coachHintC" : "coachHint");
    const co = coachOnly();
    set("#t_consent", co ? "consentCO" : coach ? "consentC" : "consent");
    if (co) set("#lg1", "g1coachOnly");
    $("#competeRow").hidden = !coach || mode === "edit";
    ["#genderRow", "#birthRow", "#beltSet", "#photoSet", "#videoSet"].forEach((x) => ($(x).hidden = co));
    if (co) $("#guardianRow").hidden = true;
    $("#playersBox").hidden = !withPlayers();
    if (co && active === main && blocks.length) setActive(blocks[0]);
    set("#promoQ", coach && withPlayers() ? "promoQCoach" : "promoQ");
    $("#coachVidRow").hidden = !coach || mode === "edit";
    if (!withPlayers() && active !== main) setActive(main);
    $("#vbox").hidden = !needCode(); renderTabs();
  }
  document.querySelectorAll("input[name=role]").forEach((r) => r.addEventListener("change", () => { role = r.value; applyRole(); if (role === "coach" && !blocks.length) addBlock(); }));
  document.querySelectorAll("input[name=compete]").forEach((r) => r.addEventListener("change", () => { compete = r.value === "yes"; applyRole(); infoAll(); redraw(); }));
  F.email.addEventListener("input", () => { $("#vbox").hidden = !needCode(); });

  /* ---------- تسجيل جديد أو تعديل ---------- */
  const grid = $("#cgrid"), modeBox = $("#modeBox"), lkBox = $("#lookupBox");
  function showForm(m) {
    mode = m; modeBox.hidden = true; lkBox.hidden = true; grid.hidden = false;
    const sb = $("#submitBtn"); sb.dataset.t = m === "edit" ? "submitEdit" : "submit"; sb.textContent = t(sb.dataset.t);
    $("#editBadge").hidden = m !== "edit"; F.email.readOnly = m === "edit"; F.phone.readOnly = m === "edit"; dialSels[0].disabled = m === "edit";
    applyRole(); infoAll(); redraw();
  }
  $("#btnNew").addEventListener("click", () => showForm("new"));
  $("#btnEdit").addEventListener("click", () => { modeBox.hidden = true; lkBox.hidden = false; $("#f_lkPhone").focus(); });
  $("#lkBack").addEventListener("click", () => { lkBox.hidden = true; modeBox.hidden = false; $("#lkErr").hidden = true; });
  let lkBusy = false;
  $("#lkBtn").addEventListener("click", async () => {
    if (lkBusy) return; const err = $("#lkErr"); err.hidden = true;
    const email = $("#f_lkEmail").value.trim().toLowerCase(), dg = $("#f_lkCode").value.replace(/\D/g, ""), code = dg ? PREFIX + ("0000" + dg).slice(-4) : "", phone = $("#f_lkPhone").value.trim();
    if (!email || !code || !phone) { err.textContent = t("eLk"); err.hidden = false; return; }
    if (!API) { err.textContent = t("eSrv"); err.hidden = false; return; }
    lkBusy = true; const b = $("#lkBtn"); b.disabled = true; b.textContent = t("saving");
    try {
      const res = await post({ action: "lookup", email, phone, code });
      if (!res || !res.ok) throw new Error((res && res.error) || "srv");
      const d = res.data; editCode = res.code;
      ["nameAr", "nameEn", "countryAr", "countryEn", "clubAr", "clubEn", "birth", "guardian"].forEach((k) => { F[k].value = d[k] || ""; });
      F.email.value = email; F.phone.value = phone; F.coach.value = (d.coachCode || "").slice(-4);
      if (VIDEO_OPEN) { $("#f_video").value = d.video || ""; checkVideo($("#f_video"), $("#videoMsg"), $("#videoPrev")); }
      const pr = $("input[name=promo][value=" + (d.promo === "yes" ? "yes" : "no") + "]"); if (pr) pr.checked = true;
      $("#promoMore").hidden = d.promo !== "yes"; $("#f_wa").value = d.whatsapp || ""; syncDial(); $("#f_coachVid").checked = d.coachInVideo === "yes"; $("#coachImg").hidden = d.coachInVideo !== "yes";
      fillSelects(); F.belt.value = d.belt || ""; F.para.value = d.para || "";
      const g = $("input[name=gender][value=" + (d.gender === "f" ? "f" : "m") + "]"); if (g && d.gender) g.checked = true;
      role = d.role === "coach" ? "coach" : "player";
      if (res.token) { sess.token = res.token; sess.email = email; }
      if (d.photo) { try { const img = await loadImg(d.photo); main.photo = img; main.zoom = 1; main.ox = main.oy = 0; $("#f_zoom").value = 1; $("#zoomRow").hidden = false; canvas.style.touchAction = "none"; } catch (e) {} }
      main.code = editCode; $("#f_consent").checked = false;
      showForm("edit");
    } catch (e) {
      err.textContent = e && e.message === "not_found" ? t("eNotFound") : (e && e.name === "AbortError") || e instanceof TypeError ? t("eNet") : t("eSrv"); err.hidden = false;
    } finally { lkBusy = false; b.disabled = false; b.textContent = t("lkBtn"); }
  });

  /* ---------- الفيديو الترويجي ---------- */
  const promoYes = () => ($("input[name=promo]:checked") || {}).value === "yes";
  $("#promoBox").addEventListener("change", () => { $("#promoMore").hidden = !promoYes(); });
  $("#f_coachVid").addEventListener("change", (e) => { $("#coachImg").hidden = !e.target.checked; });

  /* ---------- أمر ChatGPT الجاهز لصورة لاعب احترافية ---------- */
  (function () {
    const btn = $("#aiBtn"), box = $("#aiBox"), ta = $("#aiText"); if (!btn) return;
    ta.value = window.AI_PROMPT_PLAYER || "";
    btn.addEventListener("click", () => { const open = box.hidden; box.hidden = !open; btn.setAttribute("aria-expanded", String(open)); });
    const copy = async () => { try { await navigator.clipboard.writeText(ta.value); } catch (e) { ta.removeAttribute("readonly"); ta.select(); try { document.execCommand("copy"); } catch (x) {} ta.setAttribute("readonly", ""); } };
    const flash = (el, key) => { el.textContent = t("aiCopied"); setTimeout(() => { el.textContent = t(key); }, 1800); };
    $("#aiCopy").addEventListener("click", async () => { await copy(); flash($("#aiCopy"), "aiCopy"); });
    $("#aiGo").addEventListener("click", async () => { await copy(); flash($("#aiGo"), "aiGo"); window.open("https://chatgpt.com/", "_blank", "noopener"); });
  })();

  /* ---------- اللغة ---------- */
  function applyLang() {
    document.documentElement.lang = lang; document.documentElement.dir = lang === "en" ? "ltr" : "rtl";
    document.querySelectorAll("[data-t]").forEach((el) => { const k = el.dataset.t; if (T[lang][k]) el.textContent = T[lang][k]; });
    document.title = t("title") + " — " + (lang === "en" ? "Arab Para Taekwondo Basics 2026" : "أساسيات البارا تايكوندو 2026");
    const sb = $("#submitBtn"); if (!busy) sb.textContent = t(sb.dataset.t);
    $("#langBtn").textContent = t("lang"); $("#demoBanner").hidden = !!API;
    fillSelects(); fillDialOpts(); numberBlocks(); applyRole(); infoAll(); draw();
    document.querySelectorAll("#f_video, [data-k=video]").forEach((i) => { if (!VIDEO_OPEN) { i.placeholder = t("vClosedPh"); i.dir = lang === "en" ? "ltr" : "rtl"; } });
  }
  $("#langBtn").addEventListener("click", () => { lang = lang === "en" ? "ar" : "en"; try { localStorage.setItem("lang", lang); } catch (e) {} applyLang(); });

  /* ---------- فيديو شرح التسجيل ---------- */
  (() => {
    const m = /(?:youtu\.be\/|v=|shorts\/|embed\/|live\/)([\w-]{11})/.exec((typeof CONFIG !== "undefined" && CONFIG.guideVideo) || "");
    if (!m) return;
    const btn = $("#guideBtn"), dlg = $("#guideDlg"), bg = $("#guideBg"), hd = $("#guideHd"), mv = $("#guideMv"), vol = $("#guideVol"), volIn = $("input", vol), volOut = $("output", vol), minB = $("#guideMin"), xB = $("#guideX"), wideB = $("#guideWide"), backB = $("#guideBack"), fwdB = $("#guideFwd");
    btn.hidden = false;
    let curT = 0, dur = 0, hello = 0;
    const cmd =(func, args) => { const f = $("iframe", mv); if (f && f.contentWindow) f.contentWindow.postMessage(JSON.stringify({ event: "command", func, args: args || [] }), "*"); };
    const setVol = (v) => { v = Math.max(0, Math.min(100, +v)); volIn.value = v; volOut.textContent = v + "%"; if (v > 0) cmd("unMute"); cmd("setVolume", [v]); if (v === 0) cmd("mute"); };
    volIn.addEventListener("input", () => setVol(volIn.value));
    vol.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => setVol(+volIn.value + +b.dataset.d)));
    btn.addEventListener("click", () => {
      const f = document.createElement("iframe");
      f.title = t("guideT"); f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen"; f.allowFullscreen = true;
      f.src = `https://www.youtube-nocookie.com/embed/${m[1]}?autoplay=1&rel=0&enablejsapi=1&origin=${encodeURIComponent(location.origin)}`;
      f.addEventListener("load", () => { clearInterval(hello); listen(); hello = setInterval(listen, 1000); });
      curT = 0; volIn.value = 100; volOut.textContent = "100%";
      xB.setAttribute("aria-label", t("guideClose"));
      dlg.hidden = false; setMini(false); setWide(false); mv.replaceChildren(f); xB.focus();
    });
    const listen = () => { const f = $("iframe", mv); if (f && f.contentWindow) f.contentWindow.postMessage(JSON.stringify({ event: "listening" }), "*"); };
    window.addEventListener("message", (e) => { // الوقت الحالي للفيديو من مشغّل يوتيوب
      const f = $("iframe", mv); if (!f || e.source !== f.contentWindow) return;
      let d; try { d = JSON.parse(e.data); } catch (x) { return; }
      if (d && d.info && d.info.duration) dur = d.info.duration;
      if (d && d.info && typeof d.info.currentTime === "number") { curT = d.info.currentTime; clearInterval(hello); }
    });
    function setMini(on) { // لا نحرّك الإطار في الصفحة حتى لا يُعاد تحميل الفيديو
      dlg.classList.toggle("mini", on); bg.hidden = on;
      document.documentElement.classList.toggle("guide-lock", !on);
      dlg.toggleAttribute("aria-modal", false); if (!on) dlg.setAttribute("aria-modal", "true");
      dlg.style.left = dlg.style.top = dlg.style.bottom = "";
      minB.dataset.t = on ? "guideMax" : "guideMin"; minB.textContent = t(minB.dataset.t);
      backB.dataset.t = on ? "guideBackS" : "guideBack"; backB.textContent = t(backB.dataset.t); backB.setAttribute("aria-label", t("guideBack"));
      fwdB.dataset.t = on ? "guideFwdS" : "guideFwd"; fwdB.textContent = t(fwdB.dataset.t); fwdB.setAttribute("aria-label", t("guideFwd"));
    }
    function setWide(on) {
      dlg.classList.toggle("wide", on);
      wideB.dataset.t = on ? "guideTall" : "guideWide"; wideB.textContent = t(wideB.dataset.t);
      if (dlg.style.top) { const r = dlg.getBoundingClientRect(); moveTo(r.left, r.top); } // تبقى النافذة المسحوبة داخل الشاشة
    }
    wideB.addEventListener("click", () => setWide(!dlg.classList.contains("wide")));
    function closeGuide() {
      clearInterval(hello); mv.replaceChildren(); dlg.hidden = bg.hidden = true; // يوقف الفيديو والصوت
      document.documentElement.classList.remove("guide-lock"); btn.focus();
    }
    minB.addEventListener("click", () => setMini(!dlg.classList.contains("mini")));
    xB.addEventListener("click", closeGuide); bg.addEventListener("click", closeGuide);
    const seekBy = (s) => { curT = Math.max(0, curT + s); if (dur) curT = Math.min(curT, Math.max(0, dur - 1)); cmd("seekTo", [curT, true]); };
    backB.addEventListener("click", () => seekBy(-10));
    fwdB.addEventListener("click", () => seekBy(10));
    dlg.addEventListener("keydown", (e) => { // Esc وحصر التنقل بالتاب في العرض الكبير فقط
      if (dlg.classList.contains("mini")) return;
      if (e.key === "Escape") { closeGuide(); return; }
      if (e.key !== "Tab") return;
      const all = [...dlg.querySelectorAll("button, input, iframe")], first = all[0], last = all[all.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
    /* سحب النافذة الصغيرة من شريطها العلوي */
    const clamp = (x, y) => [Math.max(0, Math.min(x, innerWidth - dlg.offsetWidth)), Math.max(0, Math.min(y, innerHeight - dlg.offsetHeight))];
    const moveTo = (x, y) => { [x, y] = clamp(x, y); dlg.style.left = x + "px"; dlg.style.top = y + "px"; dlg.style.bottom = "auto"; };
    let drag = null;
    hd.addEventListener("pointerdown", (e) => {
      if (!dlg.classList.contains("mini") || e.target.closest("button")) return;
      const r = dlg.getBoundingClientRect(); drag = { dx: e.clientX - r.left, dy: e.clientY - r.top };
      hd.setPointerCapture(e.pointerId);
    });
    hd.addEventListener("pointermove", (e) => { if (drag) moveTo(e.clientX - drag.dx, e.clientY - drag.dy); });
    const endDrag = () => { drag = null; };
    hd.addEventListener("pointerup", endDrag); hd.addEventListener("pointercancel", endDrag);
    window.addEventListener("resize", () => { if (!dlg.hidden && dlg.classList.contains("mini") && dlg.style.top) { const r = dlg.getBoundingClientRect(); moveTo(r.left, r.top); } });
  })();

  fillSelects(); applyRole(); infoAll();
  Promise.all([assetsReady, fontsReady]).then(() => { applyLang(); canvas.classList.add("ready"); });
})();

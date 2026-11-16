/* استبيان المدربين — بطولة الأساسيات العربية للبارا تايكوندو 2026
   مصدر واحد للأسئلة والاختيارات (عربي/إنجليزي) تستخدمه صفحة الاستبيان ولوحة الإدارة.
   المفاتيح (id / k) ثابتة وتُحفظ في قاعدة البيانات؛ لا تغيّرها بعد بدء جمع الإجابات. */
const SURVEY_DATA = {
  version: "2026-1",
  intro: {
    ar: ["السادة المدربين الأفاضل،",
      "انطلاقًا من إيماننا بأن نجاح البطولات لا يتحقق بالتنظيم وحده، بل بالرؤية الواضحة والتطوير المستمر والاستماع إلى أصحاب الخبرة، نحرص على معرفة آرائكم وانطباعاتكم حول بطولة الأساسيات العربية للبارا تايكوندو 2026.",
      "نسعى إلى تقديم تجربة رياضية وتنظيمية ورقمية متطورة، تليق بأبطالنا ومدربينا، وتفتح آفاقًا جديدة لدعم رياضة البارا تايكوندو وتعزيز حضورها عربيًا وعالميًا.",
      "رأيكم محل اهتمامنا، ومشاركتكم جزء من رحلة التطوير."],
    en: ["Dear Coaches,",
      "We believe that successful championships are built not only through organization, but also through a clear vision, continuous development, and listening to experienced professionals.",
      "We value your opinions and feedback regarding the Arab Para Taekwondo Basics Championship 2026.",
      "Our ambition is to deliver an advanced sporting, organizational, and digital experience that honors our athletes and coaches while creating new opportunities to support Para Taekwondo and strengthen its presence regionally and internationally.",
      "Your opinion matters, and your participation is an important part of our development journey."]
  },
  thanks: {
    ar: ["شكرًا لوقتكم ومشاركتكم.",
      "أنتم لستم مجرد مشاركين في البطولة، بل شركاء في تطويرها وصناعة نجاحها.",
      "نؤمن أن أفضل الأفكار تأتي من أصحاب الخبرة، وأن التطوير الحقيقي يبدأ بالاستماع والتعاون والعمل المؤسسي.",
      "معًا لدعم أبطالنا وصناعة مستقبل أكثر احترافية لرياضة التايكوندو."],
    en: ["Thank you for your time and participation.",
      "You are not just participants in this championship; you are partners in its development and success.",
      "We believe that the best ideas come from experience, and that real progress begins with listening, collaboration, and professional teamwork.",
      "Together, let's support our champions and build a more professional future for Taekwondo."]
  },
  questions: [
    { id: "q1", type: "single", tag: { ar: "الرؤية والرسالة", en: "Vision & Mission" },
      ar: "إلى أي مدى ترون أن بطولة الأساسيات العربية للبارا تايكوندو تمثل خطوة مؤثرة في دعم أبطالنا وإبراز قدراتهم وفتح آفاق جديدة أمامهم؟",
      en: "To what extent do you believe the Arab Para Taekwondo Basics Championship represents a meaningful step in supporting our champions, showcasing their abilities, and creating new opportunities for them?",
      options: [
        { k: "1", ar: "استثنائية وتمثل نقلة نوعية.", en: "Exceptional and represents a major breakthrough." },
        { k: "2", ar: "ممتازة وتستحق التوسع.", en: "Excellent and deserves expansion." },
        { k: "3", ar: "جيدة وتحتاج إلى مزيد من التطوير.", en: "Good, with room for further development." },
        { k: "4", ar: "تحتاج إلى تحسين بعض الجوانب.", en: "Some aspects need improvement." }] },
    { id: "q2", type: "single", tag: { ar: "فكرة موسوعة غينيس", en: "Guinness World Records" },
      ar: "ما مدى إعجابكم بفكرة السعي إلى دخول موسوعة غينيس للأرقام القياسية من خلال بطولة الأساسيات العربية للبارا تايكوندو؟",
      en: "How impressed are you by the idea of pursuing a Guinness World Records achievement through the Arab Para Taekwondo Basics Championship?",
      options: [
        { k: "1", ar: "فكرة استثنائية ومبهرة.", en: "An exceptional and inspiring idea." },
        { k: "2", ar: "فكرة رائعة ومميزة.", en: "A wonderful and distinctive idea." },
        { k: "3", ar: "فكرة جيدة ومثيرة للاهتمام.", en: "A good and interesting idea." },
        { k: "4", ar: "فكرة مقبولة.", en: "An acceptable idea." },
        { k: "5", ar: "لم تلفت انتباهي بالشكل الكافي.", en: "Not particularly impressive to me." }] },
    { id: "q3", type: "single", tag: { ar: "جودة التنظيم والاحترافية", en: "Organization & Professionalism" },
      ar: "كيف تقيّمون مستوى التنظيم والإعداد والتجربة العامة التي تقدمها البطولة للمشاركين والمدربين؟",
      en: "How would you evaluate the organization, preparation, and overall experience provided by the championship for athletes and coaches?",
      options: [
        { k: "1", ar: "مستوى احترافي ومتميز.", en: "Highly professional and outstanding." },
        { k: "2", ar: "جيد جدًا ويعكس اهتمامًا واضحًا بالتفاصيل.", en: "Very good, reflecting clear attention to detail." },
        { k: "3", ar: "جيد مع وجود فرص للتحسين.", en: "Good, with opportunities for improvement." },
        { k: "4", ar: "يحتاج إلى مزيد من التطوير.", en: "Requires further development." }] },
    { id: "q4", type: "single", tag: { ar: "الدمج الرياضي ودعم اللاعبين", en: "Sports Inclusion & Athlete Support" },
      ar: "ما مدى إعجابكم بفكرة إتاحة الفرصة للاعبين من مختلف الفئات للمشاركة في البطولة، ومنح اللاعبين الأسوياء فرصة دعم زملائهم من أبطال البارا تايكوندو ومشاركتهم التجربة الرياضية؟",
      en: "How do you feel about allowing athletes from different categories to participate in the championship, giving able-bodied athletes the opportunity to support their Para Taekwondo teammates and share the sporting experience?",
      options: [
        { k: "1", ar: "فكرة رائعة واستثنائية، وتعزز مفهوم الدمج الرياضي.", en: "An outstanding idea that promotes sports inclusion." },
        { k: "2", ar: "فكرة ممتازة، وتمنح اللاعبين فرصة حقيقية لدعم زملائهم.", en: "An excellent initiative that gives athletes a real opportunity to support their teammates." },
        { k: "3", ar: "فكرة جيدة جدًا، وتستحق التوسع والتطبيق.", en: "A very good idea that deserves wider implementation." },
        { k: "4", ar: "فكرة جيدة، وتحتاج إلى تنظيم آليات المشاركة.", en: "A good idea that requires clear participation guidelines." },
        { k: "5", ar: "أرى أنها تجربة جديدة ومثيرة للاهتمام.", en: "A new and interesting experience." }] },
    { id: "q5", type: "single", tag: { ar: "التحول الرقمي وتجربة الموقع", en: "Digital Transformation & Website" },
      ar: "إلى أي مدى ترون أن الموقع الإلكتروني ساهم في تقديم تجربة تنظيمية حديثة، وتسهيل إجراءات المشاركة والتواصل وإدارة بيانات اللاعبين؟",
      en: "To what extent do you believe the website contributes to delivering a modern organizational experience and simplifying participation, communication, and athlete data management?",
      options: [
        { k: "1", ar: "نقلة رقمية متميزة.", en: "An outstanding digital transformation." },
        { k: "2", ar: "تجربة احترافية جيدة جدًا.", en: "A very good and professional experience." },
        { k: "3", ar: "تجربة جيدة تحتاج إلى تحسينات.", en: "A good experience that needs some improvements." },
        { k: "4", ar: "ما زالت تحتاج إلى تطوير كبير.", en: "Requires significant development." },
        { k: "5", ar: "لم أستخدم الموقع بما يكفي للتقييم.", en: "I have not used the website enough to evaluate it." }] },
    { id: "q6", type: "single", tag: { ar: "سهولة الإجراءات والخدمات", en: "Ease of Procedures & Services" },
      ar: "كيف تقيّمون رحلة التسجيل وإدخال بيانات اللاعبين ورفع الفيديوهات والوصول إلى الخدمات المختلفة عبر الموقع؟",
      en: "How would you evaluate the process of registration, entering athlete information, uploading videos, and accessing the various website services?",
      options: [
        { k: "1", ar: "سهلة وسلسة للغاية.", en: "Very easy and smooth." },
        { k: "2", ar: "سهلة مع بعض الملاحظات.", en: "Easy, with a few observations." },
        { k: "3", ar: "متوسطة وتحتاج إلى تبسيط.", en: "Average and needs simplification." },
        { k: "4", ar: "واجهت صعوبات تحتاج إلى معالجة.", en: "I encountered difficulties that need to be addressed." },
        { k: "5", ar: "لم أجرب جميع الخدمات.", en: "I have not tried all services." }],
      text: { id: "q6t", ar: "ما أكثر نقطة تتمنون تحسينها؟", en: "What is the main area you would like to see improved?", optional: true, max: 600 } },
    { id: "q7", type: "single", tag: { ar: "منظومة Captain Taekwondo", en: "Captain Taekwondo Platform" },
      ar: "هل لديكم معرفة بمنظومة Captain Taekwondo، باعتبارها مشروعًا يسعى إلى بناء منظومة رقمية متكاملة لدعم رياضة التايكوندو وتطوير إدارة البطولات وخدمات الرياضيين؟",
      en: "Are you familiar with Captain Taekwondo, a project that aims to build an integrated digital ecosystem to support Taekwondo, improve championship management, and enhance services for athletes?",
      options: [
        { k: "1", ar: "نعم، أعرف المنظومة وأهدافها جيدًا.", en: "Yes, I am familiar with the platform and its objectives." },
        { k: "2", ar: "لدي معرفة مبدئية وأرغب في التعرف على المزيد.", en: "I have basic knowledge and would like to learn more." },
        { k: "3", ar: "سمعت عنها وأرغب في معرفة خدماتها.", en: "I have heard about it and would like to know about its services." },
        { k: "4", ar: "هذه أول مرة أتعرف عليها.", en: "This is my first time learning about it." }],
      text: { id: "q7t", showFor: ["1", "2"], ar: "نرجو مشاركتنا بنبذة مختصرة عما تعرفونه عن المنظومة والخدمات التي تقدمها أو تتوقعون أن تقدمها مستقبلًا.", en: "Please share a brief description of what you know about the platform and the services it offers or that you expect it to offer in the future.", optional: true, max: 800 } },
    { id: "q8", type: "single", tag: { ar: "الانتشار والتأثير الإعلامي", en: "Outreach & Media Impact" },
      ar: "هل ساهمتم في نشر البطولة أو التعريف بها بين المدربين واللاعبين والمؤسسات الرياضية؟ وما مدى استعدادكم لدعم انتشارها مستقبلًا؟",
      en: "Have you helped promote the championship among coaches, athletes, and sports organizations? How willing are you to support its future outreach?",
      options: [
        { k: "1", ar: "نشرت البطولة بالفعل وسأواصل دعمها.", en: "I have already promoted it and will continue supporting it." },
        { k: "2", ar: "شاركت أخبارها مع المهتمين.", en: "I have shared its news with interested people." },
        { k: "3", ar: "لم أنشرها بعد، لكن أرغب في المساهمة.", en: "I have not promoted it yet, but I would like to contribute." },
        { k: "4", ar: "أحتاج إلى مواد إعلامية تساعدني على التعريف بها.", en: "I need promotional materials to help spread the word." },
        { k: "5", ar: "لا أستطيع المشاركة في النشر حاليًا.", en: "I am unable to participate in promotion at the moment." }] },
    { id: "q9", type: "multi", tag: { ar: "أولويات التطوير", en: "Development Priorities" },
      ar: "ما المجالات التي ترون أنها تستحق الاستثمار فيها لتطوير النسخ القادمة من البطولة والارتقاء بمستوى الخدمات؟",
      en: "Which areas do you believe deserve investment to improve future editions of the championship and enhance the quality of services?",
      hint: { ar: "يمكنك اختيار أكثر من إجابة.", en: "Multiple selections allowed." },
      options: [
        { k: "1", ar: "تطوير الموقع والخدمات الرقمية.", en: "Developing the website and digital services." },
        { k: "2", ar: "توسيع المشاركة العربية والدولية.", en: "Expanding regional and international participation." },
        { k: "3", ar: "تطوير التجربة التنظيمية للمدربين واللاعبين.", en: "Improving the organizational experience for coaches and athletes." },
        { k: "4", ar: "زيادة الدعم الإعلامي والتسويقي.", en: "Increasing media coverage and marketing." },
        { k: "5", ar: "إطلاق مبادرات جديدة لدعم أبطال البارا تايكوندو.", en: "Launching new initiatives to support Para Taekwondo athletes." },
        { k: "6", ar: "بناء شراكات مع المؤسسات الرياضية.", en: "Building partnerships with sports organizations." },
        { k: "7", ar: "السعي لتحقيق إنجازات وأرقام قياسية عالمية.", en: "Pursuing global achievements and world records." },
        { k: "8", ar: "جميع ما سبق.", en: "All of the above.", all: true },
        { k: "9", ar: "لدي أفكار أخرى.", en: "I have other ideas.", other: true }],
      text: { id: "q9t", showForOther: true, ar: "اكتب أفكارك", en: "Share your ideas", optional: true, max: 800 } },
    { id: "q10", type: "single", tag: { ar: "المشاركة الفاعلة وصناعة المستقبل", en: "Active Participation & Shaping the Future" },
      lead: {
        ar: "نؤمن أن نجاح أي منظومة رياضية لا يصنعه فريق العمل وحده، بل يشارك في بنائه أصحاب الخبرة والرؤية من المدربين.",
        en: "We believe that the success of any sports ecosystem is not achieved by the organizing team alone, but through the contribution of experienced and visionary coaches." },
      ar: "هل ترغبون في أن تكونوا جزءًا من فريق المساهمين في تطوير البطولة والمنظومة والمبادرات المستقبلية؟",
      en: "Would you like to be part of the team contributing to the development of the championship, the platform, and future initiatives?",
      options: [
        { k: "1", ar: "نعم، أرغب في المشاركة بشكل فعّال.", en: "Yes, I would like to participate actively.", contact: true },
        { k: "2", ar: "نعم، يمكنني المساهمة وفقًا لخبرتي وتخصصي.", en: "Yes, I can contribute based on my experience and expertise.", contact: true },
        { k: "3", ar: "أرغب في التعاون والمشاركة في بعض الأنشطة.", en: "I would like to collaborate in selected activities.", contact: true },
        { k: "4", ar: "أود معرفة المزيد عن فرص المشاركة أولًا.", en: "I would like to learn more about participation opportunities first.", contact: true },
        { k: "5", ar: "أفضل الاكتفاء بالمشاركة كمدرب حاليًا.", en: "I prefer to participate as a coach only at this time." }] }
  ],
  contact: {
    title: { ar: "بيانات التواصل", en: "Contact Details" },
    lead: { ar: "اكتب اسمك لنعرف صاحب المشاركة. البريد الإلكتروني ورقم الهاتف اختياريان، ونتواصل معك بهما فقط إن أبديت رغبة في التعاون.",
            en: "Please enter your name so we know who took part. Email and phone are optional, and we use them only to reach you about collaboration." },
    fields: [
      { id: "name", ar: "اسم المدرب", en: "Coach name", type: "text", ac: "name", required: true },
      { id: "email", ar: "البريد الإلكتروني", en: "Email address", type: "email", ac: "email" },
      { id: "phone", ar: "رقم الهاتف / واتساب", en: "Phone / WhatsApp", type: "tel", ac: "tel-national", dial: true },
      { id: "code", ar: "رقم كود المدرب (إن وجد)", en: "Coach code (if available)", type: "text", ac: "off", ph: "PTA-2026-0001" }],
    consent: {
      ar: "أوافق على استخدام هذه البيانات للتواصل معي بشأن فرص التعاون والمشاركة فقط، ولن تُستخدم لأي غرض آخر.",
      en: "I agree that this information will be used only to contact me about collaboration and participation opportunities, and for no other purpose." },
    /* [العربية, English, رمز الدولة] — الدول العربية أولًا */
    dials: [
      ["مصر","Egypt","20"],["السعودية","Saudi Arabia","966"],["الإمارات","United Arab Emirates","971"],["الكويت","Kuwait","965"],["قطر","Qatar","974"],["البحرين","Bahrain","973"],["عُمان","Oman","968"],["اليمن","Yemen","967"],
      ["العراق","Iraq","964"],["سوريا","Syria","963"],["لبنان","Lebanon","961"],["الأردن","Jordan","962"],["فلسطين","Palestine","970"],["ليبيا","Libya","218"],["تونس","Tunisia","216"],["الجزائر","Algeria","213"],
      ["المغرب","Morocco","212"],["السودان","Sudan","249"],["موريتانيا","Mauritania","222"],["الصومال","Somalia","252"],["جيبوتي","Djibouti","253"],["جزر القمر","Comoros","269"],
      ["تركيا","Turkey","90"],["إيران","Iran","98"],["باكستان","Pakistan","92"],["الهند","India","91"],["بريطانيا","United Kingdom","44"],["فرنسا","France","33"],["ألمانيا","Germany","49"],["إسبانيا","Spain","34"],["إيطاليا","Italy","39"],["الولايات المتحدة وكندا","USA / Canada","1"],["كوريا الجنوبية","South Korea","82"],["ماليزيا","Malaysia","60"],["إندونيسيا","Indonesia","62"],["روسيا","Russia","7"],["أستراليا","Australia","61"]]
  }
};

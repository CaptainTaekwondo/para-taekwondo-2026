(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var API = (window.JUDGING && window.JUDGING.api) || '';

  var T = {
    ar: { brand: 'بطولة أساسيات البارا تايكوندو 2026', home: 'الموقع', title: 'أصدر شهادتك', sub: 'أدخل بياناتك كما سُجّلت في البطولة لعرض شهادتك وتحميلها.',
      r_player: 'لاعب', r_coach: 'مدرب', r_judge: 'حكم', l_code_player: 'كود اللاعب (مثال: PTP-2026-0001)', l_code_coach: 'كود المدرب (مثال: PTA-2026-0001)', l_phone: 'رقم الموبايل', l_email: 'الإيميل', l_pass: 'كلمة السر',
      show: 'عرض شهادتي', privacy: 'تُستخدم هذه البيانات للتحقق من هويتك فقط، ولا تظهر على الشهادة.', download: 'تحميل الشهادة (JPG)', print: 'طباعة / حفظ PDF', corr: 'طلب تعديل',
      corrT: 'طلب تعديل بيانات الشهادة', corrL: 'اكتب التعديل المطلوب (مثال: تصحيح كتابة الاسم)', send: 'إرسال الطلب', corrNote: 'يراجع صاحب الموقع الطلب، وعند الموافقة تُصدَر شهادة جديدة برقم جديد وتُلغى القديمة.',
      e_closed: 'إصدار الشهادات غير متاح الآن. سيتم الإعلان عن فتحه عبر القنوات الرسمية.', e_not_found: 'البيانات غير مطابقة لما هو مسجّل. تأكد من الكود والموبايل والإيميل.', e_locked: 'محاولات كثيرة، حاول بعد 15 دقيقة.',
      e_not_ready: 'لا توجد نتيجة معتمدة لك حتى الآن.', e_not_available: 'هذه الشهادة غير متاحة لك.', e_bad_login: 'الإيميل أو كلمة السر غير صحيحة.', e_auth: 'انتهت الجلسة، حاول من جديد.', e_net: 'تعذّر الاتصال، حاول مرة أخرى.', e_noapi: 'الخدمة غير مفعّلة بعد.',
      e_bad_text: 'اكتب التعديل المطلوب (3 أحرف على الأقل).', e_too_many: 'لديك طلبات مفتوحة بالفعل، انتظر مراجعتها.', fill: 'املأ كل الحقول.',
      lblName: 'الاسم', lblSection: 'القسم', lblGroup: 'الفئة', lblClass: 'التصنيف', lblPlace: 'المركز', lblBand: 'المستوى', lblScore: 'الدرجة', lblSerial: 'رقم الشهادة',
      t_rank: 'شهادة التقدير (المركز)', t_participation: 'شهادة المشاركة', t_coach: 'شهادة تقدير المدرب', t_judge: 'شهادة تقدير الحكم', yourCerts: 'شهادتك', coachPlayers: 'لاعبوك', noRank: 'لا توجد شهادة مركز لك، ويمكنك إصدار شهادة المشاركة.',
      issued: 'تم إصدار الشهادة', loading: 'جارٍ التحضير...', sent: 'تم إرسال طلبك، وسيراجعه صاحب الموقع.', copied: 'تم' },
    en: { brand: 'Arab Para Taekwondo Basics Championship 2026', home: 'Website', title: 'Get your certificate', sub: 'Enter your details as registered in the championship to view and download your certificate.',
      r_player: 'Athlete', r_coach: 'Coach', r_judge: 'Judge', l_code_player: 'Athlete code (e.g. PTP-2026-0001)', l_code_coach: 'Coach code (e.g. PTA-2026-0001)', l_phone: 'Mobile number', l_email: 'Email', l_pass: 'Password',
      show: 'Show my certificate', privacy: 'These details are only used to verify your identity and do not appear on the certificate.', download: 'Download certificate (JPG)', print: 'Print / Save PDF', corr: 'Request a correction',
      corrT: 'Request a certificate correction', corrL: 'Write the correction you need (e.g. fix the spelling of the name)', send: 'Send request', corrNote: 'The site owner reviews the request. If approved, a new certificate with a new number is issued and the old one is cancelled.',
      e_closed: 'Certificates are not available yet. The opening will be announced through the official channels.', e_not_found: 'The details do not match our records. Check the code, mobile and email.', e_locked: 'Too many attempts, try again in 15 minutes.',
      e_not_ready: 'There is no approved result for you yet.', e_not_available: 'This certificate is not available for you.', e_bad_login: 'Wrong email or password.', e_auth: 'Session expired, try again.', e_net: 'Connection failed, try again.', e_noapi: 'The service is not active yet.',
      e_bad_text: 'Write the correction needed (at least 3 characters).', e_too_many: 'You already have open requests, please wait for them to be reviewed.', fill: 'Fill in all fields.',
      lblName: 'Name', lblSection: 'Section', lblGroup: 'Group', lblClass: 'Class', lblPlace: 'Place', lblBand: 'Level', lblScore: 'Score', lblSerial: 'Certificate No.',
      t_rank: 'Achievement certificate (place)', t_participation: 'Participation certificate', t_coach: 'Coach appreciation certificate', t_judge: 'Judge appreciation certificate', yourCerts: 'Your certificates', coachPlayers: 'Your athletes', noRank: 'You have no place certificate, but you can issue the participation certificate.',
      issued: 'Certificate issued', loading: 'Preparing...', sent: 'Your request was sent. The site owner will review it.', copied: 'Done' }
  };
  var lang = 'ar'; try { lang = localStorage.getItem('jd_lang') || 'ar'; } catch (e) {}
  function t(k) { return (T[lang] && T[lang][k]) || T.ar[k] || k; }
  function errText(e) { return T.ar['e_' + e] !== undefined ? t('e_' + e) : t('e_net'); }
  function h(tag, props) {
    var el = document.createElement(tag);
    Object.keys(props || {}).forEach(function (k) { var v = props[k]; if (k === 'class') el.className = v; else if (k.slice(0, 2) === 'on') el[k] = v; else if (v !== undefined && v !== null && v !== false) el.setAttribute(k, v === true ? '' : v); });
    for (var i = 2; i < arguments.length; i++) { var c = arguments[i]; if (c === null || c === undefined || c === false) continue; (Array.isArray(c) ? c : [c]).forEach(function (x) { if (x !== null && x !== undefined && x !== false) el.appendChild(typeof x === 'string' || typeof x === 'number' ? document.createTextNode(String(x)) : x); }); }
    return el;
  }
  function toast(m) { var b = $('toast'); b.textContent = m; b.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(function () { b.hidden = true; }, 2600); }

  var role = 'player', S = { q: null, token: '', cert: null };

  function applyLang() {
    document.documentElement.lang = lang; document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'; $('lang').textContent = lang === 'ar' ? 'EN' : 'ع';
    Array.prototype.forEach.call(document.querySelectorAll('[data-i]'), function (el) { el.textContent = t(el.getAttribute('data-i')); });
    document.title = t('title') + ' | ' + t('brand'); setRole(role);
  }
  $('lang').onclick = function () { lang = lang === 'ar' ? 'en' : 'ar'; try { localStorage.setItem('jd_lang', lang); } catch (e) {} applyLang(); if (S.cert) drawCert(S.cert); };

  function setRole(r) {
    role = r;
    Array.prototype.forEach.call(document.querySelectorAll('#roles button'), function (b) { b.setAttribute('aria-pressed', b.getAttribute('data-role') === r ? 'true' : 'false'); });
    $('fCode').hidden = r === 'judge'; $('fPhone').hidden = r === 'judge'; $('fPass').hidden = r !== 'judge';
    $('lCode').textContent = t(r === 'coach' ? 'l_code_coach' : 'l_code_player');
  }
  Array.prototype.forEach.call(document.querySelectorAll('#roles button'), function (b) { b.onclick = function () { setRole(b.getAttribute('data-role')); $('msg').textContent = ''; }; });

  function post(body) {
    if (!API) return Promise.resolve({ ok: false, error: 'noapi' });
    return fetch(API, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) }).then(function (r) { return r.json(); }).catch(function () { return { ok: false, error: 'net' }; });
  }
  function busy(b, on) { b.disabled = on; }

  $('go').onclick = function () {
    var msg = $('msg'); msg.textContent = ''; msg.className = 'msg';
    var email = $('email').value.trim();
    if (role === 'judge') {
      if (!email || !$('pass').value) { msg.textContent = t('fill'); return; }
      busy($('go'), true);
      post({ action: 'login', email: email, password: $('pass').value }).then(function (r) {
        if (!r.ok || r.role !== 'judge') { busy($('go'), false); msg.textContent = errText(r.ok ? 'bad_login' : r.error); return; }
        S.token = r.token; S.q = { judge: true };
        post({ action: 'judgeCert', token: S.token }).then(function (c) {
          busy($('go'), false);
          if (!c.ok) { msg.textContent = errText(c.error); return; }
          showInfo({ role: 'judge', name: r.name }); showCert(c.cert);
        });
      });
      return;
    }
    var code = $('code').value.trim(), phone = $('phone').value.trim();
    if (!code || !phone || !email) { msg.textContent = t('fill'); return; }
    S.q = { role: role, code: code, phone: phone, email: email };
    busy($('go'), true);
    post(Object.assign({ action: 'certLookup' }, S.q)).then(function (r) {
      busy($('go'), false);
      if (!r.ok) { msg.textContent = errText(r.error); return; }
      S.lookup = r; showInfo(r);
    });
  };

  function pill(label, val) { return h('div', { class: 'pill' }, h('small', {}, label), val); }
  function showInfo(r) {
    var box = $('infoCard'); box.hidden = false; box.innerHTML = ''; $('certArea').hidden = true;
    if (r.role === 'judge') { box.appendChild(h('h2', {}, t('yourCerts'))); box.appendChild(h('div', { class: 'info' }, pill(t('lblName'), r.name))); return; }
    var btns = h('div', { class: 'row' });
    if (r.role === 'coach') {
      box.appendChild(h('h2', {}, r.coach.name));
      var rows = r.players.map(function (p) { return h('div', { class: 'pill' }, h('small', {}, p.code), p.name + (p.place ? '  ·  ' + t('lblPlace') + ' ' + p.place : '') + (p.band ? '  ·  ' + p.band : '')); });
      box.appendChild(h('h2', { style: 'font-size:1rem;margin-top:6px' }, t('coachPlayers'))); box.appendChild(h('div', { class: 'info' }, rows));
      if (r.coach.hasParticipation) btns.appendChild(h('button', { class: 'btn fill', type: 'button', onclick: function (e) { issue('coach', e.target); } }, t('t_coach')));
    } else {
      var p = r.player, info = h('div', { class: 'info' }, pill(t('lblName'), p.name), pill(t('lblSection'), p.section), pill(t('lblGroup'), p.groupName || '-'));
      if (p.classCode) info.appendChild(pill(t('lblClass'), p.classCode));
      if (p.place) info.appendChild(pill(t('lblPlace'), p.place)); if (p.band) info.appendChild(pill(t('lblBand'), p.band));
      if (p.total !== null && p.total !== undefined) info.appendChild(pill(t('lblScore'), Number(p.total).toFixed(2)));
      box.appendChild(h('h2', {}, t('yourCerts'))); box.appendChild(info);
      if (r.rankAvailable) btns.appendChild(h('button', { class: 'btn fill', type: 'button', onclick: function (e) { issue('rank', e.target); } }, t('t_rank')));
      if (r.participationAvailable) btns.appendChild(h('button', { class: 'btn' + (r.rankAvailable ? '' : ' fill'), type: 'button', onclick: function (e) { issue('participation', e.target); } }, t('t_participation')));
      if (!r.rankAvailable && r.participationAvailable) box.appendChild(h('p', { class: 'note' }, t('noRank')));
      if (!r.rankAvailable && !r.participationAvailable) box.appendChild(h('p', { class: 'msg' }, t(r.player.hasResult ? 'e_not_available' : 'e_not_ready')));
    }
    box.appendChild(btns); box.appendChild(h('p', { class: 'msg', id: 'issueMsg', role: 'alert' }));
  }

  function issue(type, btn) {
    busy(btn, true); var m = $('issueMsg'); if (m) m.textContent = '';
    post(Object.assign({ action: 'certIssue', type: type }, S.q)).then(function (r) {
      busy(btn, false);
      if (!r.ok) { if (m) m.textContent = errText(r.error); return; }
      showCert(r.cert);
    });
  }

  function verifyUrl(serial) { return new URL('verify.html?s=' + encodeURIComponent(serial), location.href).href; }
  function drawCert(c) { return CertRender.draw($('cv'), c, { verifyUrl: verifyUrl(c.serial) }); }
  function showCert(c) {
    S.cert = c; var area = $('certArea'); area.hidden = false;
    var head = $('certHead'); head.innerHTML = '';
    head.appendChild(h('h2', {}, t('issued') + ' — ' + t('t_' + c.type))); head.appendChild(h('div', { class: 'info' }, h('div', { class: 'pill' }, h('small', {}, t('lblSerial')), h('span', { class: 'serial' }, c.serial)), pill(t('lblName'), c.name)));
    $('corr').hidden = !!(S.q && S.q.judge); $('corrBox').hidden = true;
    drawCert(c).then(function () { area.scrollIntoView({ behavior: 'smooth', block: 'start' }); });
  }

  $('dl').onclick = function () {
    if (!S.cert) return; var cv = $('cv');
    cv.toBlob(function (b) { var a = h('a', { href: URL.createObjectURL(b), download: 'certificate-' + S.cert.serial + '.jpg' }); document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000); }, 'image/jpeg', 0.93);
  };
  $('pr').onclick = function () { window.print(); };
  $('corr').onclick = function () { $('corrBox').hidden = !$('corrBox').hidden; };
  $('corrSend').onclick = function () {
    var b = $('corrSend'), m = $('corrMsg'); m.className = 'msg'; m.textContent = '';
    busy(b, true);
    post(Object.assign({ action: 'certRequest', text: $('corrText').value }, S.q)).then(function (r) {
      busy(b, false);
      if (!r.ok) { m.textContent = errText(r.error); return; }
      m.className = 'msg ok'; m.textContent = t('sent'); $('corrText').value = '';
    });
  };

  applyLang();
})();

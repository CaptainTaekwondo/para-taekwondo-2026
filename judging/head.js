(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var API = (window.JUDGING && window.JUDGING.api) || '';

  /* ---------- النصوص ---------- */
  var T = {
    ar: { brand: 'لوحة رئيس الحكام', logout: 'خروج', loginTitle: 'دخول رئيس الحكام', email: 'الإيميل', password: 'كلمة السر', enter: 'دخول',
      t_players: 'اللاعبين', t_judges: 'الحكام', t_assign: 'التوزيع', t_review: 'المراجعة', t_results: 'النتائج', t_settings: 'الإعدادات',
      e_bad_login: 'الإيميل أو كلمة السر غير صحيحة', e_locked: 'محاولات كثيرة، حاول بعد 15 دقيقة', e_auth: 'انتهت الجلسة، سجّل الدخول من جديد', e_net: 'تعذّر الاتصال. حاول تاني', e_noapi: 'رابط الخدمة غير مضبوط بعد', e_note_required: 'اكتب ملاحظة للحكم', e_not_submitted: 'التقييم غير مُرسَل',
      total: 'الإجمالي', ready: 'جاهز', noVideo: 'بدون فيديو', importT: 'استيراد اللاعبين', importHelp: 'الصق بيانات من Excel أو ارفع ملف CSV/XLSX. الأعمدة: code, name, section, group, classCode, video. القسم يكتب بمفتاحه أو باسمه.',
      paste: 'الصق البيانات هنا', file: 'أو ارفع ملف', preview: 'معاينة', doImport: 'استيراد', rowsFound: 'صفوف مقروءة: ', unknownSec: 'قسم غير معروف: ', imported: 'تم الاستيراد: ', skippedDup: 'مكرر/متخطى: ',
      pid: 'ID', code: 'الكود', name: 'الاسم', section: 'القسم', group: 'الفئة', cls: 'فئة الإعاقة', status: 'الحالة', judgesN: 'الحكام',
      inviteT: 'روابط تسجيل الحكام', maxUses: 'عدد الحكام المسموح', hours: 'صلاحية بالساعات (فاضي = بلا حد)', makeInvite: 'إنشاء رابط', copy: 'نسخ', copied: 'تم النسخ',
      judgesT: 'الحكام المسجلون', level: 'المستوى', weight: 'وزن الدرجة', active: 'مفعّل', disabled: 'موقوف', save: 'حفظ', saved: 'تم الحفظ',
      autoT: 'توزيع تلقائي', perPlayer: 'عدد الحكام لكل لاعب', pickJudges: 'الحكام المشاركون', onlyNew: 'اللاعبين غير الموزّعين فقط', doAuto: 'وزّع', distributing: 'جاري التوزيع... ', distributed: 'تم التوزيع',
      manual: 'تعديل', assigned: 'الحكام المعيّنون', none: 'لا يوجد', needJudges: 'اختر حكّامًا أولًا', needFewer: 'عدد الحكام للاعب أكبر من عدد الحكام المختارين',
      filter: 'عرض', f_submitted: 'المُرسَل للمراجعة', f_all: 'الكل', approve: 'اعتماد', ret: 'إرجاع للتدقيق', note: 'ملاحظة للحكم', send: 'إرسال', approveAll: 'اعتماد كل المُرسَل', approved: 'تم الاعتماد', returned: 'تم الإرجاع', video: 'الفيديو', details: 'التفاصيل', nothing: 'لا يوجد شيء لعرضه',
      big: 'كبير', small: 'صغير', ded: 'خصومات', items: 'بنود',
      resultsT: 'النتائج المعتمدة', refresh: 'تحديث', exportCsv: 'تصدير CSV', place: 'المركز', band: 'المستوى', score: 'الدرجة', tied: 'تعادل', rank: 'الترتيب',
      s_display: 'ما يظهر للحكم', showName: 'إظهار اسم اللاعب للحكم (بدل الـ ID فقط)', h_showName: 'مغلق = الحكم يشوف رقم اللاعب فقط. مفتوح = يشوف الاسم معه.',
      s_ranking: 'المراكز والمستويات', places: 'عدد المراكز', h_places: 'أي رقم. اللاعبين بعد هذا العدد ما ياخدوش مركز.', labels: 'أسماء المراكز (مفصولة بفاصلة)', h_labels: 'مثال: 1,2,3 أو A,B,C أو ذهبي,فضي,برونزي. لو ناقصة يتكمل بالأرقام.',
      tie: 'قاعدة التعادل', tie1: 'الأعلى في الدقة (الخصم) ثم البنود', tie2: 'الأعلى في البنود ثم الدقة', tie0: 'بدون ترجيح (أقرر يدويًا)', h_tie: 'لو لاعبين أخدوا نفس الدرجة، الترتيب بينهم يتحدد بالقاعدة دي، وإلا يبقى مركز مشترك.',
      trim: 'حذف أعلى وأقل درجة (يشتغل مع 5 حكام أو أكثر)', h_trim: 'يتجاهل أعلى وأقل درجة حكم قبل حساب المتوسط.',
      groupBy: 'تجميع المراكز حسب', g_section: 'القسم', g_groupName: 'الفئة', g_classCode: 'فئة الإعاقة', h_groupBy: 'اللاعبين اللي في نفس المجموعة بس يتقارنوا ببعض في المراكز.',
      bands: 'حدود المستويات (رفع المسطرة)', h_bands: 'كل مستوى له حد أدنى للدرجة. اللاعب ياخد أعلى مستوى وصلت له درجته. غيّر الحدود في أي وقت قبل إصدار الشهادات.', bandMin: 'من درجة', bandLabel: 'الاسم', addBand: 'إضافة مستوى',
      s_sections: 'الأقسام وآلية التقييم', h_sections: 'كل قسم له: درجة الخصومات القصوى، قيمة الخطأ الصغير والكبير، وبنود بدرجات. عدّل أي رقم أو أضف قسمًا جديدًا.', addSection: 'إضافة قسم', delSection: 'حذف القسم',
      label: 'اسم القسم', dedMax: 'أقصى خصم (الدرجة المبنية على الأخطاء)', smallV: 'الخطأ الصغير', bigV: 'الخطأ الكبير', itemsT: 'البنود', itemLabel: 'اسم البند', itemMax: 'الحد الأقصى', itemStep: 'الخطوة', addItem: 'إضافة بند', classes: 'فئات الإعاقة (مفصولة بفاصلة)', isPara: 'قسم بارا', parent: 'القسم الأصلي',
      h_dedMax: 'الدرجة اللي بتتخصم منها الأخطاء. اللاعب يبدأ بها ويقل منها. 0 = قسم من غير خصومات.', h_items: 'كل بند الحكم يدّيه درجة من 0 لحد الحد الأقصى.',
      saveAll: 'حفظ كل الإعدادات', bad_num: 'تأكد من الأرقام',
      pubT: 'نشر النتائج على الموقع', h_pub: 'عند النشر يظهر جدول الفائزين (الاسم والمركز) للمدربين في الموقع. لا تظهر درجات الحكام. تقدر توقف النشر في أي وقت. إصدار الشهادات بيد صاحب الموقع.',
      pubOn: 'النتائج منشورة الآن على الموقع.', pubOff: 'النتائج غير منشورة.', publishNow: 'نشر النتائج', unpublish: 'إيقاف النشر', pubConfirm: 'هتظهر النتائج للعامة في الموقع. متأكد إن كل الدرجات اتعتمدت؟' },
    en: { brand: 'Head Judge Panel', logout: 'Log out', loginTitle: 'Head judge login', email: 'Email', password: 'Password', enter: 'Log in',
      t_players: 'Athletes', t_judges: 'Judges', t_assign: 'Assignment', t_review: 'Review', t_results: 'Results', t_settings: 'Settings',
      e_bad_login: 'Wrong email or password', e_locked: 'Too many attempts, try again in 15 minutes', e_auth: 'Session expired, please log in again', e_net: 'Connection failed. Try again', e_noapi: 'Service URL is not configured yet', e_note_required: 'Write a note for the judge', e_not_submitted: 'Score is not submitted',
      total: 'Total', ready: 'Ready', noVideo: 'No video', importT: 'Import athletes', importHelp: 'Paste data from Excel or upload a CSV/XLSX. Columns: code, name, section, group, classCode, video. Section is its key or its name.',
      paste: 'Paste data here', file: 'or upload a file', preview: 'Preview', doImport: 'Import', rowsFound: 'Rows read: ', unknownSec: 'Unknown section: ', imported: 'Imported: ', skippedDup: 'Duplicates/skipped: ',
      pid: 'ID', code: 'Code', name: 'Name', section: 'Section', group: 'Group', cls: 'Class', status: 'Status', judgesN: 'Judges',
      inviteT: 'Judge registration links', maxUses: 'Judges allowed', hours: 'Valid for hours (empty = no limit)', makeInvite: 'Create link', copy: 'Copy', copied: 'Copied',
      judgesT: 'Registered judges', level: 'Level', weight: 'Score weight', active: 'Active', disabled: 'Disabled', save: 'Save', saved: 'Saved',
      autoT: 'Auto distribution', perPlayer: 'Judges per athlete', pickJudges: 'Participating judges', onlyNew: 'Unassigned athletes only', doAuto: 'Distribute', distributing: 'Distributing... ', distributed: 'Distributed',
      manual: 'Edit', assigned: 'Assigned judges', none: 'None', needJudges: 'Pick judges first', needFewer: 'Judges per athlete exceeds the selected judges',
      filter: 'Show', f_submitted: 'Submitted for review', f_all: 'All', approve: 'Approve', ret: 'Return for review', note: 'Note to the judge', send: 'Send', approveAll: 'Approve all submitted', approved: 'Approved', returned: 'Returned', video: 'Video', details: 'Details', nothing: 'Nothing to show',
      big: 'major', small: 'minor', ded: 'deductions', items: 'items',
      resultsT: 'Approved results', refresh: 'Refresh', exportCsv: 'Export CSV', place: 'Place', band: 'Band', score: 'Score', tied: 'Tie', rank: 'Rank',
      s_display: 'What the judge sees', showName: "Show the athlete's name to the judge (instead of ID only)", h_showName: 'Off = the judge sees the athlete ID only. On = the name is shown too.',
      s_ranking: 'Places and bands', places: 'Number of places', h_places: 'Any number. Athletes beyond it get no place.', labels: 'Place names (comma separated)', h_labels: 'e.g. 1,2,3 or A,B,C or Gold,Silver,Bronze. Missing ones are numbered.',
      tie: 'Tie rule', tie1: 'Higher accuracy (deductions) then items', tie2: 'Higher items then accuracy', tie0: 'No tie-break (I decide manually)', h_tie: 'If two athletes have the same score, this rule orders them; otherwise they share a place.',
      trim: 'Drop highest and lowest score (needs 5+ judges)', h_trim: 'Ignores the highest and lowest judge score before averaging.',
      groupBy: 'Group places by', g_section: 'Section', g_groupName: 'Group', g_classCode: 'Class', h_groupBy: 'Only athletes in the same group are compared for places.',
      bands: 'Score bands (raise the bar)', h_bands: 'Each band has a minimum score. An athlete gets the highest band their score reaches. Change them any time before certificates are issued.', bandMin: 'From score', bandLabel: 'Name', addBand: 'Add band',
      s_sections: 'Sections and scoring', h_sections: 'Each section has: max mistake-based score, minor and major mistake values, and scored items. Edit any number or add a new section.', addSection: 'Add section', delSection: 'Delete section',
      label: 'Section name', dedMax: 'Max deductions budget (mistake-based score)', smallV: 'Minor mistake', bigV: 'Major mistake', itemsT: 'Items', itemLabel: 'Item name', itemMax: 'Max', itemStep: 'Step', addItem: 'Add item', classes: 'Impairment classes (comma separated)', isPara: 'Para section', parent: 'Parent section',
      h_dedMax: 'The score mistakes are deducted from. The athlete starts with it and loses points. 0 = no deductions in this section.', h_items: 'For each item the judge gives a score from 0 up to the maximum.',
      saveAll: 'Save all settings', bad_num: 'Check the numbers',
      pubT: 'Publish results on the site', h_pub: 'When published, the winners table (name and place) appears for coaches on the site. Individual judge scores are never shown. You can unpublish any time. Certificates are opened by the site owner.',
      pubOn: 'Results are published on the site.', pubOff: 'Results are not published.', publishNow: 'Publish results', unpublish: 'Unpublish', pubConfirm: 'Results will be public on the site. Are you sure all scores are approved?' }
  };
  var lang = 'ar'; try { lang = localStorage.getItem('jd_lang') || 'ar'; } catch (e) {}
  function t(k) { return (T[lang] && T[lang][k]) || T.ar[k] || k; }

  /* ---------- أدوات DOM ---------- */
  function h(tag, props) {
    var el = document.createElement(tag);
    Object.keys(props || {}).forEach(function (k) {
      var v = props[k];
      if (k === 'class') el.className = v; else if (k.slice(0, 2) === 'on') el[k] = v; else if (k === 'text') el.textContent = v; else if (v !== undefined && v !== null && v !== false) el.setAttribute(k, v === true ? '' : v);
    });
    function add(c) {
      if (c === null || c === undefined || c === false) return;
      if (Array.isArray(c)) { c.forEach(add); return; }
      el.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
    }
    for (var i = 2; i < arguments.length; i++) add(arguments[i]);
    return el;
  }
  function tip(key) { return h('button', { class: 'tip', type: 'button', 'data-help': key, 'aria-label': '?' }, 'i'); }
  function toast(msg, err) { var b = $('toast'); b.textContent = msg; b.className = 'toast' + (err ? ' err' : ''); b.hidden = false; clearTimeout(toast._t); toast._t = setTimeout(function () { b.hidden = true; }, 3200); }
  function errText(e) { return T.ar['e_' + e] !== undefined ? t('e_' + e) : t('e_net'); }
  function secLabel(k) { var s = S.cfg && S.cfg.sections && S.cfg.sections[k]; return (s && s.label) || k; }

  /* ---------- الحالة والاتصال ---------- */
  var S = { token: '', cfg: null, players: [], judges: [], asg: [], tab: 'players' };
  try { S.token = sessionStorage.getItem('jh_token') || ''; } catch (e) {}
  function call(body) {
    if (!API) return Promise.resolve({ ok: false, error: 'noapi' });
    body.token = S.token;
    return fetch(API, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json(); }).catch(function () { return { ok: false, error: 'net' }; })
      .then(function (r) { if (!r.ok && r.error === 'auth') { logout(); toast(t('e_auth'), true); } return r; });
  }
  function logout() { S.token = ''; try { sessionStorage.removeItem('jh_token'); } catch (e) {} $('app').hidden = true; $('login').hidden = false; $('logout').hidden = true; }

  /* ---------- الثيم واللغة ---------- */
  function setTheme(m) { document.documentElement.setAttribute('data-theme', m); $('theme').textContent = m === 'dark' ? '☀️' : '🌙'; try { localStorage.setItem('jd_theme', m); } catch (e) {} }
  var sv = null; try { sv = localStorage.getItem('jd_theme'); } catch (e) {}
  setTheme(sv || (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  $('theme').onclick = function () { setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'); };
  $('lang').onclick = function () { lang = lang === 'ar' ? 'en' : 'ar'; try { localStorage.setItem('jd_lang', lang); } catch (e) {} applyLang(); };
  function applyLang() {
    document.documentElement.lang = lang; document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'; $('lang').textContent = lang === 'ar' ? 'EN' : 'ع';
    Array.prototype.forEach.call(document.querySelectorAll('[data-i]'), function (el) { el.textContent = t(el.getAttribute('data-i')); });
    if (S.token && !$('app').hidden) render();
  }

  /* ---------- الدخول ---------- */
  $('go').onclick = function () {
    $('go').disabled = true; $('loginMsg').textContent = '';
    call({ action: 'login', email: $('em').value, password: $('pw').value }).then(function (r) {
      $('go').disabled = false;
      if (!r.ok) { $('loginMsg').textContent = errText(r.error); return; }
      if (r.role !== 'head') { $('loginMsg').textContent = t('e_auth'); return; }
      S.token = r.token; try { sessionStorage.setItem('jh_token', S.token); } catch (e) {}
      boot();
    });
  };
  $('pw').addEventListener('keydown', function (e) { if (e.key === 'Enter') $('go').click(); });
  $('logout').onclick = logout;

  function boot() {
    Promise.all([call({ action: 'config' }), call({ action: 'players' }), call({ action: 'review' })]).then(function (rs) {
      if (!rs[0].ok || !rs[1].ok) { logout(); $('loginMsg').textContent = errText(rs[0].error || rs[1].error); return; }
      S.cfg = { sections: rs[0].sections, ranking: rs[0].ranking, display: rs[0].display, publish: rs[0].publish || { on: false } };
      S.players = rs[1].players; S.judges = rs[1].judges; S.asg = rs[2].ok ? rs[2].assignments : [];
      $('login').hidden = true; $('app').hidden = false; $('logout').hidden = false; render();
    });
  }
  function reload(what) {
    return Promise.all([call({ action: 'players' }), call({ action: 'review' })]).then(function (rs) {
      if (rs[0].ok) { S.players = rs[0].players; S.judges = rs[0].judges; } if (rs[1].ok) S.asg = rs[1].assignments; render();
    });
  }

  var TABS = ['players', 'judges', 'assign', 'review', 'results', 'settings'];
  function render() {
    var nav = $('tabs'); nav.innerHTML = '';
    TABS.forEach(function (k) { nav.appendChild(h('button', { class: 'tab', role: 'tab', type: 'button', 'aria-selected': S.tab === k ? 'true' : 'false', 'data-tab': k, onclick: function () { S.tab = k; render(); } }, t('t_' + k))); });
    var pane = $('pane'); pane.innerHTML = '';
    var box = h('div', { class: 'stack' }); pane.appendChild(box);
    ({ players: tabPlayers, judges: tabJudges, assign: tabAssign, review: tabReview, results: tabResults, settings: tabSettings })[S.tab](box);
  }

  /* ---------- استيراد ---------- */
  var ALIAS = { code: ['code', 'الكود', 'كود', 'player code'], name: ['name', 'الاسم', 'اسم', 'namear', 'name ar'], section: ['section', 'القسم'], group: ['group', 'الفئة', 'الفئة السنية', 'category'],
    classCode: ['class', 'classcode', 'class code', 'فئة الإعاقة', 'تصنيف', 'تصنيف البارا', 'para'], video: ['video', 'فيديو', 'رابط الفيديو', 'الفيديو', 'video url'],
    phone: ['phone', 'الموبايل', 'الهاتف', 'رقم الموبايل', 'موبايل'], email: ['email', 'الإيميل', 'البريد', 'البريد الإلكتروني'], coachCode: ['coachcode', 'coach code', 'كود المدرب'],
    coachName: ['coachname', 'coach name', 'اسم المدرب', 'المدرب'], coachPhone: ['coachphone', 'coach phone', 'موبايل المدرب', 'هاتف المدرب'], coachEmail: ['coachemail', 'coach email', 'إيميل المدرب', 'بريد المدرب'], nameEn: ['nameen', 'name en', 'الاسم بالإنجليزي'] };
  function parseTable(text) {
    text = String(text || '').replace(/^﻿/, '').trim(); if (!text) return [];
    var first = text.split(/\r?\n/)[0], d = first.indexOf('\t') >= 0 ? '\t' : (first.split(';').length > first.split(',').length ? ';' : ',');
    var rows = [], row = [], cell = '', q = false;
    for (var i = 0; i < text.length; i++) {
      var c = text[i];
      if (q) { if (c === '"') { if (text[i + 1] === '"') { cell += '"'; i++; } else q = false; } else cell += c; }
      else if (c === '"') q = true; else if (c === d) { row.push(cell); cell = ''; }
      else if (c === '\n' || c === '\r') { if (c === '\r' && text[i + 1] === '\n') i++; row.push(cell); rows.push(row); row = []; cell = ''; }
      else cell += c;
    }
    row.push(cell); rows.push(row);
    var head = rows.shift().map(function (x) { return x.trim().toLowerCase(); }), idx = {};
    Object.keys(ALIAS).forEach(function (k) { head.forEach(function (hn, i) { if (ALIAS[k].indexOf(hn) >= 0 && idx[k] === undefined) idx[k] = i; }); });
    return rows.filter(function (r) { return r.some(function (x) { return String(x).trim(); }); }).map(function (r) {
      var o = {}; Object.keys(idx).forEach(function (k) { o[k] = String(r[idx[k]] === undefined ? '' : r[idx[k]]).trim(); }); return o;
    });
  }
  function sectionKey(v) {
    var secs = S.cfg.sections; v = String(v || '').trim(); if (secs[v]) return v;
    var low = v.toLowerCase(); return Object.keys(secs).filter(function (k) { return k.toLowerCase() === low || String(secs[k].label || '').trim() === v; })[0] || '';
  }

  function tabPlayers(box) {
    var rdy = S.players.filter(function (p) { return p.status === 'ready'; }).length;
    box.appendChild(h('div', { class: 'kv' }, stat(t('total'), S.players.length), stat(t('ready'), rdy), stat(t('noVideo'), S.players.length - rdy)));
    var ta = h('textarea', { id: 'paste', placeholder: 'code,name,section,group,classCode,video,phone,email,coachCode,coachName,coachPhone,coachEmail', 'aria-label': t('paste') });
    var fi = h('input', { type: 'file', accept: '.csv,.tsv,.txt,.xlsx,.xls', 'aria-label': t('file') });
    var out = h('p', { class: 'msg ok', id: 'impOut' }), parsed = [];
    function preview() {
      parsed = parseTable(ta.value).map(function (r) { r.section = sectionKey(r.section) || ('?' + r.section); return r; });
      var unk = parsed.filter(function (r) { return r.section[0] === '?'; });
      out.className = 'msg' + (unk.length ? '' : ' ok');
      out.textContent = t('rowsFound') + parsed.length + (unk.length ? ' — ' + t('unknownSec') + unk.length : '');
    }
    ta.oninput = preview;
    fi.onchange = function () {
      var f = fi.files[0]; if (!f) return;
      if (/\.xlsx?$/i.test(f.name) && window.XLSX) {
        var rd = new FileReader(); rd.onload = function () { var wb = XLSX.read(rd.result, { type: 'array' }); ta.value = XLSX.utils.sheet_to_csv(wb.Sheets[wb.SheetNames[0]]); preview(); }; rd.readAsArrayBuffer(f);
      } else { var r2 = new FileReader(); r2.onload = function () { ta.value = r2.result; preview(); }; r2.readAsText(f, 'utf-8'); }
    };
    var go = h('button', { class: 'btn pri', type: 'button', onclick: function () {
      var good = parsed.filter(function (r) { return r.code && r.section[0] !== '?'; });
      if (!good.length) { preview(); return; }
      go.disabled = true;
      call({ action: 'importPlayers', players: good.map(function (r) { return { code: r.code, name: r.name, section: r.section, group: r.group, classCode: r.classCode, video: r.video, extra: { phone: r.phone, email: r.email, coachCode: r.coachCode, coachName: r.coachName, coachPhone: r.coachPhone, coachEmail: r.coachEmail, nameEn: r.nameEn } }; }) }).then(function (r) {
        go.disabled = false;
        if (!r.ok) { toast(errText(r.error), true); return; }
        toast(t('imported') + r.added + ' | ' + t('skippedDup') + r.skipped + ' | ' + t('noVideo') + ': ' + r.noVideo); reload();
      });
    } }, t('doImport'));
    box.appendChild(h('div', { class: 'card' }, h('h2', {}, t('importT')), h('p', { class: 'msg', style: 'color:var(--mute)' }, t('importHelp')), ta, h('div', { class: 'row', style: 'margin-top:10px' }, h('label', {}, h('span', {}, t('file')), fi), go), out));
    var tb = h('table', {}, h('thead', {}, h('tr', {}, ['pid', 'code', 'name', 'section', 'group', 'cls', 'status', 'judgesN'].map(function (k) { return h('th', {}, t(k)); }))), h('tbody', {}));
    S.players.forEach(function (p) {
      var n = S.asg.filter(function (a) { return a.pid === p.pid; }).length;
      tb.lastChild.appendChild(h('tr', {}, h('td', { dir: 'ltr' }, p.pid), h('td', { dir: 'ltr' }, p.code), h('td', {}, p.name), h('td', {}, secLabel(p.section)), h('td', {}, p.groupName), h('td', {}, p.classCode), h('td', {}, h('span', { class: 'st ' + p.status }, p.status === 'ready' ? t('ready') : t('noVideo'))), h('td', {}, n)));
    });
    box.appendChild(h('div', { class: 'card scroll' }, tb));
  }
  function stat(l, v) { return h('div', { class: 'stat' }, h('b', {}, v), l); }

  /* ---------- الحكام ---------- */
  function tabJudges(box) {
    var mu = h('input', { type: 'number', min: 1, max: 200, value: 5 }), hr = h('input', { type: 'number', min: 1, placeholder: '48' }), out = h('div', {});
    box.appendChild(h('div', { class: 'card' }, h('h2', {}, t('inviteT')),
      h('div', { class: 'row' }, h('label', {}, h('span', {}, t('maxUses')), mu), h('label', {}, h('span', {}, t('hours')), hr),
        h('button', { class: 'btn pri', type: 'button', onclick: function () {
          call({ action: 'createInvite', maxUses: Number(mu.value) || 1, hours: Number(hr.value) || 0 }).then(function (r) {
            if (!r.ok) { toast(errText(r.error), true); return; }
            var link = location.href.replace(/[^\/]*$/, '') + 'register.html?i=' + r.invite;
            out.innerHTML = ''; out.appendChild(h('div', { class: 'link', id: 'inviteLink' }, link));
            out.appendChild(h('button', { class: 'btn', type: 'button', style: 'margin-top:8px', onclick: function () { (navigator.clipboard ? navigator.clipboard.writeText(link) : Promise.reject()).then(function () { toast(t('copied')); }, function () {}); } }, t('copy')));
          });
        } }, t('makeInvite'))), out));
    var tb = h('table', {}, h('thead', {}, h('tr', {}, [t('name'), t('level'), t('weight'), t('status'), ''].map(function (x) { return h('th', {}, x); }))), h('tbody', {}));
    S.judges.forEach(function (j) {
      var lv = h('input', { type: 'text', value: j.level, maxlength: 20 }), w = h('input', { type: 'number', step: 0.1, min: 0.1, max: 5, value: j.weight }),
        st = h('select', {}, h('option', { value: 'active', selected: j.status === 'active' }, t('active')), h('option', { value: 'disabled', selected: j.status === 'disabled' }, t('disabled')));
      tb.lastChild.appendChild(h('tr', {}, h('td', {}, j.name), h('td', {}, lv), h('td', {}, w), h('td', {}, st),
        h('td', {}, h('button', { class: 'btn', type: 'button', onclick: function () { call({ action: 'setJudge', uid: j.uid, level: lv.value, weight: Number(w.value), status: st.value }).then(function (r) { if (r.ok) { toast(t('saved')); reload(); } else toast(errText(r.error), true); }); } }, t('save')))));
    });
    box.appendChild(h('div', { class: 'card scroll' }, h('h2', {}, t('judgesT'), tip('h_weight')), tb));
  }

  /* ---------- التوزيع ---------- */
  function distribute(pids, judgeIds, k) {
    var out = {}; pids.forEach(function (pid, i) { out[pid] = []; for (var j = 0; j < k; j++) out[pid].push(judgeIds[(i * k + j) % judgeIds.length]); }); return out;
  }
  window.__distribute = distribute;
  function tabAssign(box) {
    var active = S.judges.filter(function (j) { return j.status === 'active'; }), picks = {}; active.forEach(function (j) { picks[j.uid] = true; });
    var k = h('input', { type: 'number', min: 1, max: 20, value: 3, id: 'perPlayer' }), only = h('input', { type: 'checkbox', checked: true, id: 'onlyNew' }), msg = h('p', { class: 'msg ok', id: 'asgMsg' });
    var checks = h('div', { class: 'checks' }, active.map(function (j) { var c = h('input', { type: 'checkbox', checked: true, 'data-uid': j.uid, onchange: function () { picks[j.uid] = c.checked; } }); return h('label', {}, c, h('span', {}, j.name)); }));
    function assigned(pid) { return S.asg.filter(function (a) { return a.pid === pid && a.status !== 'cancelled'; }); }
    var go = h('button', { class: 'btn pri', type: 'button', id: 'doAuto', onclick: function () {
      var ids = active.map(function (j) { return j.uid; }).filter(function (u) { return picks[u]; }), n = Math.max(1, Number(k.value) || 1);
      msg.className = 'msg'; if (!ids.length) { msg.textContent = t('needJudges'); return; } if (n > ids.length) { msg.textContent = t('needFewer'); return; }
      var pids = S.players.filter(function (p) { return p.status === 'ready' && (!only.checked || !assigned(p.pid).length); }).map(function (p) { return p.pid; });
      var plan = distribute(pids, ids, n), keys = Object.keys(plan), i = 0; go.disabled = true;
      (function step() {
        if (i >= keys.length) { go.disabled = false; msg.className = 'msg ok'; msg.textContent = t('distributed') + ' (' + keys.length + ')'; reload(); return; }
        msg.textContent = t('distributing') + (i + 1) + '/' + keys.length;
        call({ action: 'assign', pid: keys[i], judges: plan[keys[i]] }).then(function (r) { if (!r.ok) { go.disabled = false; msg.textContent = errText(r.error); return; } i++; step(); });
      })();
    } }, t('doAuto'));
    box.appendChild(h('div', { class: 'card' }, h('h2', {}, t('autoT'), tip('h_auto')), h('div', { class: 'row' }, h('label', {}, h('span', {}, t('perPlayer')), k), h('label', { class: 'checks' }, only, h('span', {}, t('onlyNew'))), go),
      h('p', {}, h('strong', {}, t('pickJudges'))), checks, msg));
    var tb = h('table', {}, h('thead', {}, h('tr', {}, [t('pid'), t('name'), t('section'), t('assigned'), ''].map(function (x) { return h('th', {}, x); }))), h('tbody', {}));
    var names = {}; S.judges.forEach(function (j) { names[j.uid] = j.name; });
    S.players.forEach(function (p) {
      var cur = assigned(p.pid), tr = h('tr', {}, h('td', { dir: 'ltr' }, p.pid), h('td', {}, p.name), h('td', {}, secLabel(p.section)),
        h('td', {}, cur.length ? cur.map(function (a) { return (names[a.judgeUid] || a.judgeUid) + (a.status === 'approved' ? ' ✓' : ''); }).join('، ') : t('none')));
      var editTd = h('td', {}, h('button', { class: 'btn', type: 'button', onclick: function () { editRow(p, cur, tr); } }, t('manual'))); tr.appendChild(editTd); tb.lastChild.appendChild(tr);
    });
    function editRow(p, cur, tr) {
      if (tr.nextSibling && tr.nextSibling.className === 'editrow') { tr.parentNode.removeChild(tr.nextSibling); return; }
      var sel = {}; cur.forEach(function (a) { sel[a.judgeUid] = true; });
      var cs = h('div', { class: 'checks' }, active.map(function (j) { var c = h('input', { type: 'checkbox', checked: !!sel[j.uid], onchange: function () { sel[j.uid] = c.checked; } }); return h('label', {}, c, h('span', {}, j.name)); }));
      var row = h('tr', { class: 'editrow' }, h('td', { colspan: 5 }, cs, h('button', { class: 'btn pri', type: 'button', style: 'margin-top:8px', onclick: function () {
        call({ action: 'assign', pid: p.pid, judges: Object.keys(sel).filter(function (u) { return sel[u]; }) }).then(function (r) { if (r.ok) { toast(t('saved')); reload(); } else toast(errText(r.error), true); });
      } }, t('save'))));
      tr.parentNode.insertBefore(row, tr.nextSibling);
    }
    box.appendChild(h('div', { class: 'card scroll' }, tb));
  }

  /* ---------- المراجعة ---------- */
  function fmtT(s) { s = Math.floor(s || 0); return Math.floor(s / 60) + ':' + ('0' + (s % 60)).slice(-2); }
  function tabReview(box) {
    var mode = S.rmode || 'submitted';
    var sel = h('select', { id: 'rfilter', onchange: function () { S.rmode = sel.value; render(); } }, h('option', { value: 'submitted', selected: mode === 'submitted' }, t('f_submitted')), h('option', { value: 'all', selected: mode === 'all' }, t('f_all')));
    var subs = S.asg.filter(function (a) { return a.status === 'submitted'; });
    box.appendChild(h('div', { class: 'card' }, h('div', { class: 'row' }, h('label', {}, h('span', {}, t('filter')), sel),
      h('button', { class: 'btn ok', type: 'button', id: 'approveAll', disabled: !subs.length, onclick: function () {
        var i = 0; (function step() { if (i >= subs.length) { toast(t('approved')); reload(); return; } call({ action: 'decide', aid: subs[i].aid, decision: 'approve' }).then(function (r) { if (!r.ok) { toast(errText(r.error), true); reload(); return; } i++; step(); }); })();
      } }, t('approveAll') + ' (' + subs.length + ')'))));
    var by = {}; S.asg.forEach(function (a) { if (mode === 'all' || a.status === 'submitted') (by[a.pid] = by[a.pid] || []).push(a); });
    var pids = Object.keys(by).sort();
    if (!pids.length) box.appendChild(h('div', { class: 'card' }, t('nothing')));
    pids.forEach(function (pid) {
      var p = S.players.filter(function (x) { return x.pid === pid; })[0] || {};
      var card = h('div', { class: 'pcard' }, h('header', {}, h('div', {}, h('strong', { dir: 'ltr' }, pid), ' ', p.name || '', ' ', h('span', { class: 'st' }, secLabel(p.section) + (p.classCode ? ' · ' + p.classCode : ''))),
        h('button', { class: 'btn', type: 'button', onclick: function () { var f = card.querySelector('iframe'); if (f) f.remove(); else if (p.videoId) card.insertBefore(h('iframe', { class: 'vid', src: 'https://www.youtube.com/embed/' + p.videoId, allowfullscreen: true, title: 'video' }), card.children[1]); } }, t('video'))));
      by[pid].forEach(function (a) {
        var d = a.details || {}, det = (d.deductions || []).map(function (x) { return t(x.type === 'big' ? 'big' : 'small') + '@' + fmtT(x.t); }).join('، ');
        var its = Object.keys(d.items || {}).map(function (k) { return k + ':' + d.items[k]; }).join(' ');
        var noteIn = h('input', { type: 'text', placeholder: t('note'), style: 'min-width:180px', 'aria-label': t('note') }), noteRow = h('div', { class: 'row', hidden: true, style: 'width:100%' }, noteIn,
          h('button', { class: 'btn bad', type: 'button', onclick: function () { call({ action: 'decide', aid: a.aid, decision: 'return', note: noteIn.value }).then(function (r) { if (r.ok) { toast(t('returned')); reload(); } else toast(errText(r.error), true); }); } }, t('send')));
        card.appendChild(h('div', { class: 'judgeRow' }, h('span', {}, h('strong', {}, a.judge || a.judgeUid), ' ', h('span', { class: 'st ' + a.status }, a.status), a.level && a.level !== 'regular' ? ' (' + a.level + ')' : ''),
          h('span', { dir: 'ltr' }, a.total === null ? '—' : Number(a.total).toFixed(2)), h('small', { style: 'flex-basis:100%;color:var(--mute)' }, (det ? t('ded') + ': ' + det + '  ' : '') + (its ? t('items') + ': ' + its : '')),
          a.status === 'submitted' ? h('span', { class: 'row' }, h('button', { class: 'btn ok', type: 'button', 'data-aid': a.aid, onclick: function () { call({ action: 'decide', aid: a.aid, decision: 'approve' }).then(function (r) { if (r.ok) { toast(t('approved')); reload(); } else toast(errText(r.error), true); }); } }, t('approve')),
            h('button', { class: 'btn bad', type: 'button', onclick: function () { noteRow.hidden = !noteRow.hidden; } }, t('ret'))) : null, noteRow));
      });
      box.appendChild(card);
    });
  }

  /* ---------- النتائج ---------- */
  function publishCard() {
    var on = !!(S.cfg && S.cfg.publish && S.cfg.publish.on), msg = h('p', { class: 'msg' }, on ? t('pubOn') : t('pubOff'));
    var btn = h('button', { class: 'btn ' + (on ? 'bad' : 'pri'), type: 'button', onclick: function () {
      if (!on && !window.confirm(t('pubConfirm'))) return;
      btn.disabled = true;
      call({ action: 'publish', on: !on }).then(function (r) {
        if (!r.ok) { btn.disabled = false; toast(errText(r.error), true); return; }
        S.cfg.publish = { on: r.on, at: '' }; toast(t('saved')); render();
      });
    } }, on ? t('unpublish') : t('publishNow'));
    return h('div', { class: 'card' }, h('h2', {}, t('pubT'), tip('h_pub')), msg, btn);
  }
  function tabResults(box) {
    box.appendChild(publishCard());
    var card = h('div', { class: 'card scroll' }, h('div', { class: 'row' }, h('h2', { style: 'flex:1' }, t('resultsT'))));
    box.appendChild(card);
    call({ action: 'results' }).then(function (r) {
      if (!r.ok) { toast(errText(r.error), true); return; }
      var res = r.results, tb = h('table', {}, h('thead', {}, h('tr', {}, ['rank', 'pid', 'name', 'score', 'place', 'band'].map(function (k) { return h('th', {}, t(k === 'pid' ? 'pid' : k)); }))), h('tbody', {})), last = null;
      card.firstChild.appendChild(h('button', { class: 'btn', type: 'button', onclick: function () { exportCsv(res); } }, t('exportCsv')));
      if (!res.length) card.appendChild(h('p', {}, t('nothing')));
      res.forEach(function (x) {
        if (x.groupKey !== last) { last = x.groupKey; tb.lastChild.appendChild(h('tr', {}, h('td', { colspan: 6, class: 'gh' }, groupText(x)))); }
        tb.lastChild.appendChild(h('tr', {}, h('td', {}, x.rank + (x.tied ? ' (' + t('tied') + ')' : '')), h('td', { dir: 'ltr' }, x.pid), h('td', {}, x.name), h('td', { dir: 'ltr' }, Number(x.total).toFixed(2)), h('td', {}, x.place || ''), h('td', {}, x.band || '')));
      });
      if (res.length) card.appendChild(tb);
    });
  }
  function groupText(x) { return [secLabel(x.section), x.groupName, x.classCode].filter(Boolean).join(' / '); }
  function exportCsv(res) {
    var rows = [['group', 'rank', 'pid', 'code', 'name', 'score', 'place', 'band']].concat(res.map(function (x) { return [groupText(x), x.rank, x.pid, x.code, x.name, x.total, x.place || '', x.band || '']; }));
    var csv = '﻿' + rows.map(function (r) { return r.map(function (c) { return '"' + String(c).replace(/"/g, '""') + '"'; }).join(','); }).join('\r\n');
    var a = h('a', { href: URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })), download: 'results.csv' }); document.body.appendChild(a); a.click(); a.remove();
  }

  /* ---------- الإعدادات ---------- */
  function num(el, def) { var v = Number(String(el.value).replace(',', '.')); return isFinite(v) ? v : def; }
  function tabSettings(box) {
    var cfg = JSON.parse(JSON.stringify(S.cfg)), rk = cfg.ranking, secs = cfg.sections;
    // العرض
    var showName = h('input', { type: 'checkbox', checked: !!(cfg.display && cfg.display.showName), id: 'showName' });
    box.appendChild(h('div', { class: 'card' }, h('h2', {}, t('s_display')), h('label', { class: 'checks' }, showName, h('span', {}, t('showName'), ' '), tip('h_showName'))));
    // المراكز
    var places = h('input', { type: 'number', min: 1, value: rk.places, id: 'places' }), labels = h('input', { type: 'text', value: (rk.labels || []).join(','), id: 'labels' }),
      tie = h('select', { id: 'tie' }, h('option', { value: 'da', selected: (rk.tieBreak || [])[0] === 'deduction' }, t('tie1')), h('option', { value: 'ad', selected: (rk.tieBreak || [])[0] === 'items' }, t('tie2')), h('option', { value: 'none', selected: !(rk.tieBreak || []).length }, t('tie0'))),
      trim = h('input', { type: 'checkbox', checked: !!rk.trim, id: 'trim' }), gb = {};
    var gbBox = h('div', { class: 'checks' }, ['section', 'groupName', 'classCode'].map(function (g) { var c = h('input', { type: 'checkbox', checked: (rk.groupBy || []).indexOf(g) >= 0, 'data-g': g }); gb[g] = c; return h('label', {}, c, h('span', {}, t('g_' + g))); }));
    var bandsBox = h('div', {}), bands = (rk.bands || []).map(function (b) { return { min: b.min, label: b.label }; });
    function drawBands() {
      bandsBox.innerHTML = '';
      bands.forEach(function (b, i) {
        bandsBox.appendChild(h('div', { class: 'mini' }, h('label', {}, h('span', {}, t('bandMin')), h('input', { type: 'number', step: 0.1, value: b.min, 'data-band': 'min', oninput: function (e) { b.min = num(e.target, 0); } })),
          h('label', {}, h('span', {}, t('bandLabel')), h('input', { type: 'text', value: b.label, 'data-band': 'label', oninput: function (e) { b.label = e.target.value; } })),
          h('button', { class: 'btn bad', type: 'button', onclick: function () { bands.splice(i, 1); drawBands(); } }, '✕')));
      });
    }
    drawBands();
    box.appendChild(h('div', { class: 'card' }, h('h2', {}, t('s_ranking')),
      h('div', { class: 'two' }, h('label', {}, h('span', {}, t('places') + ' '), tip('h_places'), places), h('label', {}, h('span', {}, t('labels') + ' '), tip('h_labels'), labels)),
      h('label', {}, h('span', {}, t('tie') + ' '), tip('h_tie'), tie), h('label', { class: 'checks' }, trim, h('span', {}, t('trim') + ' '), tip('h_trim')),
      h('p', {}, h('strong', {}, t('groupBy') + ' '), tip('h_groupBy')), gbBox,
      h('h3', {}, t('bands'), tip('h_bands')), bandsBox, h('button', { class: 'btn', type: 'button', id: 'addBand', onclick: function () { bands.push({ min: 0, label: '' }); drawBands(); } }, '+ ' + t('addBand'))));
    // الأقسام
    var secBox = h('div', {});
    function drawSecs() {
      secBox.innerHTML = '';
      Object.keys(secs).forEach(function (k) {
        var s = secs[k]; s.items = s.items || [];
        var d = h('details', { class: 'sec', 'data-sec': k }, h('summary', {}, s.label || k));
        var lab = h('input', { type: 'text', value: s.label || '', oninput: function (e) { s.label = e.target.value; d.firstChild.textContent = s.label || k; } });
        var dm = h('input', { type: 'number', step: 0.1, min: 0, value: s.deductionMax, oninput: function (e) { s.deductionMax = num(e.target, 0); } }),
          sm = h('input', { type: 'number', step: 0.05, min: 0, value: s.small, oninput: function (e) { s.small = num(e.target, 0.1); } }), bg = h('input', { type: 'number', step: 0.05, min: 0, value: s.big, oninput: function (e) { s.big = num(e.target, 0.3); } });
        var para = h('input', { type: 'checkbox', checked: !!s.para, onchange: function (e) { s.para = e.target.checked; } });
        var parent = h('select', { onchange: function (e) { s.parent = e.target.value; } }, [h('option', { value: '' }, '—')].concat(Object.keys(secs).filter(function (x) { return x !== k; }).map(function (x) { return h('option', { value: x, selected: s.parent === x }, secs[x].label || x); })));
        var cls = h('input', { type: 'text', value: (s.classes || []).join(','), dir: 'ltr', oninput: function (e) { s.classes = e.target.value.split(',').map(function (x) { return x.trim().toUpperCase(); }).filter(Boolean); } });
        var itemsBox = h('div', {});
        function drawItems() {
          itemsBox.innerHTML = '';
          s.items.forEach(function (it, i) {
            itemsBox.appendChild(h('div', { class: 'mini' }, h('label', {}, h('span', {}, t('itemLabel')), h('input', { type: 'text', value: it.label, oninput: function (e) { it.label = e.target.value; } })),
              h('label', {}, h('span', {}, t('itemMax')), h('input', { type: 'number', step: 0.5, min: 0, value: it.max, oninput: function (e) { it.max = num(e.target, 1); } })),
              h('label', {}, h('span', {}, t('itemStep')), h('input', { type: 'number', step: 0.05, min: 0.01, value: it.step || 0.1, oninput: function (e) { it.step = num(e.target, 0.1); } })),
              h('button', { class: 'btn bad', type: 'button', onclick: function () { s.items.splice(i, 1); drawItems(); } }, '✕')));
          });
        }
        drawItems();
        d.appendChild(h('div', { class: 'two' }, h('label', {}, h('span', {}, t('label')), lab), h('label', {}, h('span', {}, t('dedMax') + ' '), tip('h_dedMax'), dm)));
        d.appendChild(h('div', { class: 'two' }, h('label', {}, h('span', {}, t('smallV')), sm), h('label', {}, h('span', {}, t('bigV')), bg)));
        d.appendChild(h('div', { class: 'two' }, h('label', { class: 'checks' }, para, h('span', {}, t('isPara'))), h('label', {}, h('span', {}, t('parent')), parent)));
        d.appendChild(h('label', {}, h('span', {}, t('classes')), cls));
        d.appendChild(h('h3', {}, t('itemsT'), tip('h_items'))); d.appendChild(itemsBox);
        d.appendChild(h('button', { class: 'btn', type: 'button', onclick: function () { s.items.push({ key: 'i' + Date.now().toString(36), label: '', max: 1, step: 0.1 }); drawItems(); } }, '+ ' + t('addItem')));
        d.appendChild(h('button', { class: 'btn bad', type: 'button', style: 'margin-inline-start:8px', onclick: function () { delete secs[k]; drawSecs(); } }, t('delSection')));
        secBox.appendChild(d);
      });
    }
    drawSecs();
    box.appendChild(h('div', { class: 'card' }, h('h2', {}, t('s_sections'), tip('h_sections')), secBox,
      h('button', { class: 'btn', type: 'button', id: 'addSection', onclick: function () { secs['sec_' + Date.now().toString(36)] = { label: '', total: 10, deductionMax: 0, small: 0.1, big: 0.3, para: false, parent: '', classes: [], items: [] }; drawSecs(); secBox.lastChild.open = true; } }, '+ ' + t('addSection'))));
    box.appendChild(h('button', { class: 'btn pri', type: 'button', id: 'saveAll', onclick: function () {
      var p = Math.max(1, Math.floor(num(places, 3))); if (!isFinite(p)) { toast(t('bad_num'), true); return; }
      var tb = tie.value === 'da' ? ['deduction', 'items'] : tie.value === 'ad' ? ['items', 'deduction'] : [];
      var ranking = { places: p, labels: labels.value.split(',').map(function (x) { return x.trim(); }).filter(Boolean), tieBreak: tb,
        groupBy: Object.keys(gb).filter(function (g) { return gb[g].checked; }), trim: trim.checked, bands: bands.filter(function (b) { return String(b.label).trim() && isFinite(b.min); }).map(function (b) { return { min: Number(b.min), label: String(b.label).trim() }; }), showBandWithPlace: true };
      Object.keys(secs).forEach(function (k) { if (!secs[k].label) secs[k].label = k; secs[k].items = (secs[k].items || []).filter(function (it) { return it.label; }); secs[k].items.forEach(function (it, i) { if (!it.key) it.key = 'i' + i; }); });
      call({ action: 'saveSettings', sections: secs, ranking: ranking, display: { showName: showName.checked } }).then(function (r) {
        if (!r.ok) { toast(errText(r.error), true); return; } S.cfg = { sections: secs, ranking: ranking, display: { showName: showName.checked }, publish: S.cfg.publish }; toast(t('saved'));
      });
    } }, t('saveAll')));
  }

  /* ---------- أيقونات الشرح ---------- */
  var HELP = { h_weight: { ar: 'وزن الدرجة: 1 = عادي. رقم أكبر يخلي درجة هذا الحكم أثقل في المتوسط النهائي (مثلًا حكم ماستر).', en: 'Score weight: 1 = normal. A higher number makes this judge count more in the final average (e.g. a master judge).' },
    h_auto: { ar: 'يوزّع اللاعبين على الحكام المختارين بالتساوي، وكل لاعب ياخد العدد اللي تحدده. تقدر بعدها تعدّل أي لاعب يدويًا.', en: 'Spreads athletes evenly over the selected judges, each athlete gets the number you set. You can edit any athlete manually afterwards.' } };
  var box = $('tipBox');
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.tip');
    if (!b) { box.hidden = true; return; }
    var k = b.getAttribute('data-help'), txt = HELP[k] ? HELP[k][lang] : t(k);
    if (!box.hidden && box.textContent === txt) { box.hidden = true; return; }
    box.textContent = txt; box.hidden = false; var r = b.getBoundingClientRect();
    box.style.top = Math.min(window.innerHeight - 100, r.bottom + 8) + 'px'; box.style.left = Math.max(16, Math.min(window.innerWidth - box.offsetWidth - 16, r.left - 20)) + 'px';
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') box.hidden = true; });

  applyLang();
  if (S.token) boot();
})();

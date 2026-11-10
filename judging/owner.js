(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var API = (window.JUDGING && window.JUDGING.api) || '';

  var T = {
    ar: { brand: 'صفحة صاحب الموقع', logout: 'خروج', loginTitle: 'دخول صاحب الموقع', email: 'الإيميل', password: 'كلمة السر', enter: 'دخول',
      t_overview: 'نظرة عامة', t_switches: 'المفاتيح والإعدادات', t_audit: 'سجل المراجعة', t_certs: 'الشهادات', t_corrections: 'طلبات التعديل',
      certsT: 'الشهادات الصادرة', serial: 'الرقم', type: 'النوع', cname: 'الاسم', cstatus: 'الحالة', issuedAt: 'التاريخ', reissue: 'إعادة إصدار', reissuePrompt: 'اسم مصحَّح (اتركه فارغًا لإعادة الإصدار بنفس البيانات الحالية):', reissued: 'تم إصدار شهادة جديدة: ', active: 'سارية', replaced: 'ملغاة', ty_rank: 'مركز', ty_participation: 'مشاركة', ty_coach: 'مدرب', ty_judge: 'حكم',
      corrT: 'طلبات تعديل الشهادات', code: 'الكود', request: 'الطلب', openSt: 'مفتوح', doneSt: 'تم', rejectedSt: 'مرفوض', markDone: 'تم', reject: 'رفض', showCerts: 'شهادات الكود', resolveNote: 'ملاحظة (اختياري):',
      e_bad_login: 'الإيميل أو كلمة السر غير صحيحة', e_locked: 'محاولات كثيرة، حاول بعد 15 دقيقة', e_auth: 'انتهت الجلسة، سجّل الدخول من جديد', e_net: 'تعذّر الاتصال. حاول تاني', e_noapi: 'رابط الخدمة غير مضبوط بعد',
      refresh: 'تحديث', saved: 'تم الحفظ', save: 'حفظ', copy: 'نسخ', copied: 'تم النسخ',
      players: 'اللاعبين', judges: 'الحكام', heads: 'رؤساء الحكام', approvedP: 'لاعبين نتائجهم معتمدة', asgT: 'حالة التقييمات',
      st_assigned: 'موزّع', st_in_progress: 'جاري', st_saved: 'محفوظ', st_submitted: 'مُرسَل للمراجعة', st_approved: 'معتمد', st_returned: 'مُرجَع',
      pubStatus: 'نشر النتائج (بيد رئيس الحكام)', pubOn: 'منشورة على الموقع', pubOff: 'غير منشورة', certStatus: 'الشهادات', certOpen: 'مفتوحة', certClosed: 'مغلقة',
      headInviteT: 'رابط تسجيل رئيس الحكام', headInviteHelp: 'أنشئ رابطًا واحدًا وأعطه لرئيس الحكام. الرابط يُستخدم مرة واحدة.', makeInvite: 'إنشاء رابط',
      s_switches: 'مفاتيح صاحب الموقع', showScore: 'إظهار الدرجة النهائية في جدول الفائزين', h_showScore: 'مغلق = الجدول العام فيه الاسم والمركز فقط. مفتوح = الدرجة النهائية تظهر جنب كل فائز. لا تظهر أبدًا درجات الحكام منفردة.',
      certificatesOpen: 'فتح الشهادات (زر "أصدر شهادتك")', h_certOpen: 'لحد ما تفتحه، زر إصدار الشهادة مش بيشتغل للاعبين والمدربين. تقدر تقفله تاني.',
      partT: 'شهادات المشاركة', h_part: 'اختر من ياخد شهادة مشاركة بعد النتائج. شهادات المراكز تصميم منفصل.', p_players: 'اللاعبين', p_coaches: 'المدربين', p_judges: 'الحكام',
      certWarn: 'ملحوظة: فتح الشهادات يجب أن يتم بعد نشر النتائج واعتمادها نهائيًا.',
      auditT: 'سجل المراجعة', search: 'بحث (حدث / اسم / لاعب)', day: 'اليوم', date: 'التاريخ', time: 'الوقت', who: 'من', role: 'الدور', action: 'الحدث', target: 'الهدف', detail: 'تفاصيل', shown: 'المعروض', of: 'من', nothing: 'لا يوجد شيء لعرضه' },
    en: { brand: 'Site owner', logout: 'Log out', loginTitle: 'Owner login', email: 'Email', password: 'Password', enter: 'Log in',
      t_overview: 'Overview', t_switches: 'Switches & settings', t_audit: 'Audit log', t_certs: 'Certificates', t_corrections: 'Correction requests',
      certsT: 'Issued certificates', serial: 'Number', type: 'Type', cname: 'Name', cstatus: 'Status', issuedAt: 'Issued', reissue: 'Re-issue', reissuePrompt: 'Corrected name (leave empty to re-issue with current data):', reissued: 'New certificate issued: ', active: 'Active', replaced: 'Cancelled', ty_rank: 'Place', ty_participation: 'Participation', ty_coach: 'Coach', ty_judge: 'Judge',
      corrT: 'Certificate correction requests', code: 'Code', request: 'Request', openSt: 'Open', doneSt: 'Done', rejectedSt: 'Rejected', markDone: 'Done', reject: 'Reject', showCerts: 'Certificates of code', resolveNote: 'Note (optional):',
      e_bad_login: 'Wrong email or password', e_locked: 'Too many attempts, try again in 15 minutes', e_auth: 'Session expired, please log in again', e_net: 'Connection failed. Try again', e_noapi: 'Service URL is not configured yet',
      refresh: 'Refresh', saved: 'Saved', save: 'Save', copy: 'Copy', copied: 'Copied',
      players: 'Athletes', judges: 'Judges', heads: 'Head judges', approvedP: 'Athletes with approved results', asgT: 'Scoring status',
      st_assigned: 'Assigned', st_in_progress: 'In progress', st_saved: 'Saved', st_submitted: 'Submitted', st_approved: 'Approved', st_returned: 'Returned',
      pubStatus: 'Results publishing (head judge)', pubOn: 'Published on the site', pubOff: 'Not published', certStatus: 'Certificates', certOpen: 'Open', certClosed: 'Closed',
      headInviteT: 'Head judge registration link', headInviteHelp: 'Create one link and give it to the head judge. It works once.', makeInvite: 'Create link',
      s_switches: 'Owner switches', showScore: 'Show the final score in the winners table', h_showScore: 'Off = the public table shows name and place only. On = the final score shows beside each winner. Individual judge scores are never shown.',
      certificatesOpen: 'Open certificates ("Get your certificate" button)', h_certOpen: 'Until you open it, the certificate button does not work for athletes and coaches. You can close it again.',
      partT: 'Participation certificates', h_part: 'Choose who gets a participation certificate after the results. Rank certificates are a separate design.', p_players: 'Athletes', p_coaches: 'Coaches', p_judges: 'Judges',
      certWarn: 'Note: open certificates only after results are published and finally approved.',
      auditT: 'Audit log', search: 'Search (event / name / athlete)', day: 'Day', date: 'Date', time: 'Time', who: 'Who', role: 'Role', action: 'Event', target: 'Target', detail: 'Details', shown: 'Shown', of: 'of', nothing: 'Nothing to show' }
  };
  var lang = 'ar'; try { lang = localStorage.getItem('jd_lang') || 'ar'; } catch (e) {}
  function t(k) { return (T[lang] && T[lang][k]) || T.ar[k] || k; }

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

  var S = { token: '', tab: 'overview', data: null };
  try { S.token = sessionStorage.getItem('jo_token') || ''; } catch (e) {}
  function call(body) {
    if (!API) return Promise.resolve({ ok: false, error: 'noapi' });
    body.token = S.token;
    return fetch(API, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json(); }).catch(function () { return { ok: false, error: 'net' }; })
      .then(function (r) { if (!r.ok && r.error === 'auth') { logout(); toast(t('e_auth'), true); } return r; });
  }
  function logout() { S.token = ''; try { sessionStorage.removeItem('jo_token'); } catch (e) {} $('app').hidden = true; $('login').hidden = false; $('logout').hidden = true; }

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

  $('go').onclick = function () {
    $('go').disabled = true; $('loginMsg').textContent = '';
    call({ action: 'login', email: $('em').value, password: $('pw').value }).then(function (r) {
      $('go').disabled = false;
      if (!r.ok) { $('loginMsg').textContent = errText(r.error); return; }
      if (r.role !== 'owner') { $('loginMsg').textContent = t('e_auth'); return; }
      S.token = r.token; try { sessionStorage.setItem('jo_token', S.token); } catch (e) {}
      boot();
    });
  };
  $('pw').addEventListener('keydown', function (e) { if (e.key === 'Enter') $('go').click(); });
  $('logout').onclick = logout;

  function load() { return call({ action: 'ownerGet' }).then(function (r) { if (r.ok) S.data = r; return r; }); }
  function boot() {
    load().then(function (r) {
      if (!r.ok) { logout(); $('loginMsg').textContent = errText(r.error); return; }
      $('login').hidden = true; $('app').hidden = false; $('logout').hidden = false; render();
    });
  }

  var TABS = ['overview', 'switches', 'certs', 'corrections', 'audit'];
  function render() {
    var nav = $('tabs'); nav.innerHTML = '';
    TABS.forEach(function (k) { nav.appendChild(h('button', { class: 'tab', role: 'tab', type: 'button', 'aria-selected': S.tab === k ? 'true' : 'false', 'data-tab': k, onclick: function () { S.tab = k; render(); } }, t('t_' + k))); });
    var pane = $('pane'); pane.innerHTML = '';
    var box = h('div', { class: 'stack' }); pane.appendChild(box);
    ({ overview: tabOverview, switches: tabSwitches, certs: tabCerts, corrections: tabCorrections, audit: tabAudit })[S.tab](box);
  }

  function stat(label, val) { return h('div', { class: 'stat' }, h('b', {}, val), label); }

  function tabOverview(box) {
    var d = S.data, st = d.stats, asg = st.assignments || {};
    box.appendChild(h('div', { class: 'card' }, h('div', { class: 'row' }, h('h2', { style: 'flex:1' }, t('t_overview')),
      h('button', { class: 'btn', type: 'button', onclick: function () { load().then(function (r) { if (r.ok) render(); else toast(errText(r.error), true); }); } }, t('refresh'))),
      h('div', { class: 'kv' }, stat(t('players'), st.players), stat(t('judges'), st.judges), stat(t('heads'), st.heads), stat(t('approvedP'), st.approvedPlayers)),
      h('div', { class: 'kv' }, stat(t('pubStatus'), d.publish.on ? t('pubOn') : t('pubOff')), stat(t('certStatus'), d.owner.certificatesOpen ? t('certOpen') : t('certClosed')))));
    var keys = ['assigned', 'in_progress', 'saved', 'submitted', 'approved', 'returned'];
    box.appendChild(h('div', { class: 'card' }, h('h2', {}, t('asgT')), h('div', { class: 'kv' }, keys.map(function (k) { return stat(t('st_' + k), asg[k] || 0); }))));
    var out = h('div', {});
    box.appendChild(h('div', { class: 'card' }, h('h2', {}, t('headInviteT')), h('p', {}, t('headInviteHelp')),
      h('button', { class: 'btn pri', type: 'button', onclick: function (ev) {
        ev.target.disabled = true;
        call({ action: 'createInvite' }).then(function (r) {
          ev.target.disabled = false;
          if (!r.ok) { toast(errText(r.error), true); return; }
          var link = location.href.replace(/[^\/]*$/, '').replace(/\?.*$/, '') + 'register.html?i=' + r.invite;
          out.innerHTML = '';
          out.appendChild(h('div', { class: 'link' }, link));
          out.appendChild(h('button', { class: 'btn', type: 'button', style: 'margin-top:8px', onclick: function () { copy(link); } }, t('copy')));
        });
      } }, t('makeInvite')), out));
  }
  function copy(txt) {
    var done = function () { toast(t('copied')); };
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(done, function () { fallbackCopy(txt); done(); }); else { fallbackCopy(txt); done(); }
  }
  function fallbackCopy(txt) { var a = h('textarea', { style: 'position:fixed;opacity:0' }); a.value = txt; document.body.appendChild(a); a.select(); try { document.execCommand('copy'); } catch (e) {} a.remove(); }

  function check(label, on, helpKey) {
    var cb = h('input', { type: 'checkbox' }); cb.checked = !!on;
    return { cb: cb, el: h('label', { class: 'chk' }, cb, h('span', {}, label), helpKey ? tip(helpKey) : null) };
  }
  function tabSwitches(box) {
    var o = S.data.owner;
    var sc = check(t('showScore'), o.showScore, 'h_showScore'), co = check(t('certificatesOpen'), o.certificatesOpen, 'h_certOpen');
    var pp = check(t('p_players'), o.participation.players), pc = check(t('p_coaches'), o.participation.coaches), pj = check(t('p_judges'), o.participation.judges);
    box.appendChild(h('div', { class: 'card' }, h('h2', {}, t('s_switches')), h('div', { class: 'stack' }, sc.el, co.el), h('p', { class: 'msg' }, t('certWarn'))));
    box.appendChild(h('div', { class: 'card' }, h('h2', {}, t('partT'), tip('h_part')), h('div', { class: 'checks' }, pp.el, pc.el, pj.el)));
    var btn = h('button', { class: 'btn pri', type: 'button', onclick: function () {
      btn.disabled = true;
      call({ action: 'ownerSave', owner: { showScore: sc.cb.checked, certificatesOpen: co.cb.checked, participation: { players: pp.cb.checked, coaches: pc.cb.checked, judges: pj.cb.checked } } }).then(function (r) {
        btn.disabled = false;
        if (!r.ok) { toast(errText(r.error), true); return; }
        S.data.owner = r.owner; toast(t('saved'));
      });
    } }, t('save'));
    box.appendChild(btn);
  }

  function tabCerts(box) {
    var q = h('input', { type: 'text', placeholder: t('search'), dir: 'auto', value: S.certQ || '' }), card = h('div', { class: 'card scroll' }), body = h('div', {});
    var go = function () {
      S.certQ = q.value;
      call({ action: 'certList', q: q.value }).then(function (r) {
        body.innerHTML = '';
        if (!r.ok) { toast(errText(r.error), true); return; }
        if (!r.rows.length) { body.appendChild(h('p', {}, t('nothing'))); return; }
        body.appendChild(h('table', {}, h('thead', {}, h('tr', {}, ['serial', 'type', 'cname', 'cstatus', 'issuedAt', ''].map(function (c) { return h('th', {}, c ? t(c) : ''); }))),
          h('tbody', {}, r.rows.map(function (c) {
            var act = c.status === 'active' ? h('button', { class: 'btn', type: 'button', onclick: function (ev) {
              var nm = window.prompt(t('reissuePrompt'), ''); if (nm === null) return; ev.target.disabled = true;
              call({ action: 'reissue', serial: c.serial, name: nm }).then(function (x) { ev.target.disabled = false; if (!x.ok) { toast(errText(x.error), true); return; } toast(t('reissued') + x.cert.serial); go(); });
            } }, t('reissue')) : (c.replacedBy ? h('span', { class: 'serial', dir: 'ltr' }, '→ ' + c.replacedBy) : '');
            return h('tr', {}, h('td', { dir: 'ltr' }, c.serial), h('td', {}, t('ty_' + c.type)), h('td', {}, c.name), h('td', {}, c.status === 'active' ? t('active') : t('replaced')), h('td', { dir: 'ltr' }, String(c.issued).slice(0, 10)), h('td', {}, act));
          }))));
      });
    };
    q.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
    card.appendChild(h('div', { class: 'row' }, h('h2', { style: 'flex:1' }, t('certsT')), h('label', {}, q), h('button', { class: 'btn', type: 'button', onclick: go }, t('refresh'))));
    card.appendChild(body); box.appendChild(card); go();
  }

  function tabCorrections(box) {
    var card = h('div', { class: 'card scroll' }, h('h2', {}, t('corrT'))), body = h('div', {}); card.appendChild(body); box.appendChild(card);
    var go = function () {
      call({ action: 'corrections' }).then(function (r) {
        body.innerHTML = '';
        if (!r.ok) { toast(errText(r.error), true); return; }
        if (!r.rows.length) { body.appendChild(h('p', {}, t('nothing'))); return; }
        body.appendChild(h('table', {}, h('thead', {}, h('tr', {}, ['code', 'request', 'cstatus', 'issuedAt', ''].map(function (c) { return h('th', {}, c ? t(c) : ''); }))),
          h('tbody', {}, r.rows.map(function (c) {
            var res = function (st) { var n = window.prompt(t('resolveNote'), ''); if (n === null) return; call({ action: 'resolveCorrection', cid: c.cid, status: st, note: n }).then(function (x) { if (!x.ok) toast(errText(x.error), true); else go(); }); };
            var acts = h('div', { class: 'row' }, h('button', { class: 'btn', type: 'button', onclick: function () { S.certQ = c.code; S.tab = 'certs'; render(); } }, t('showCerts')));
            if (c.status === 'open') { acts.appendChild(h('button', { class: 'btn ok', type: 'button', onclick: function () { res('done'); } }, t('markDone'))); acts.appendChild(h('button', { class: 'btn bad', type: 'button', onclick: function () { res('rejected'); } }, t('reject'))); }
            return h('tr', {}, h('td', { dir: 'ltr' }, c.code), h('td', { style: 'max-width:340px;white-space:pre-wrap' }, c.text + (c.note ? '\n— ' + c.note : '')), h('td', {}, t(c.status === 'open' ? 'openSt' : c.status === 'done' ? 'doneSt' : 'rejectedSt')), h('td', { dir: 'ltr' }, String(c.created).slice(0, 10)), h('td', {}, acts));
          }))));
      });
    };
    go();
  }

  function tabAudit(box) {
    var q = h('input', { type: 'text', placeholder: t('search'), dir: 'auto' }), card = h('div', { class: 'card scroll' }), body = h('div', {});
    var go = function () {
      call({ action: 'audit', q: q.value, limit: 200 }).then(function (r) {
        body.innerHTML = '';
        if (!r.ok) { toast(errText(r.error), true); return; }
        if (!r.rows.length) { body.appendChild(h('p', {}, t('nothing'))); return; }
        body.appendChild(h('p', { class: 'msg ok' }, t('shown') + ' ' + r.rows.length + ' ' + t('of') + ' ' + r.total));
        var cols = ['day', 'date', 'time', 'name', 'role', 'action', 'target', 'detail'];
        body.appendChild(h('table', {}, h('thead', {}, h('tr', {}, cols.map(function (c) { return h('th', {}, t(c === 'name' ? 'who' : c)); }))),
          h('tbody', {}, r.rows.map(function (x) { return h('tr', {}, cols.map(function (c) { var v = String(x[c] === undefined ? '' : x[c]); return h('td', { dir: c === 'detail' || c === 'time' || c === 'date' ? 'ltr' : null, style: c === 'detail' ? 'max-width:320px;word-break:break-all;font-size:.8rem' : '' }, v.length > 200 ? v.slice(0, 200) + '…' : v); })); }))));
      });
    };
    q.addEventListener('keydown', function (e) { if (e.key === 'Enter') go(); });
    card.appendChild(h('div', { class: 'row' }, h('h2', { style: 'flex:1' }, t('auditT')), h('label', {}, q), h('button', { class: 'btn', type: 'button', onclick: go }, t('refresh'))));
    card.appendChild(body); box.appendChild(card); go();
  }

  var HELP = {};
  var tb = $('tipBox');
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.tip');
    if (!b) { tb.hidden = true; return; }
    var k = b.getAttribute('data-help'), txt = HELP[k] ? HELP[k][lang] : t(k);
    if (!tb.hidden && tb.textContent === txt) { tb.hidden = true; return; }
    tb.textContent = txt; tb.hidden = false; var r = b.getBoundingClientRect();
    tb.style.top = Math.min(window.innerHeight - tb.offsetHeight - 8, r.bottom + 8) + 'px';
    tb.style.left = Math.max(8, Math.min(window.innerWidth - tb.offsetWidth - 8, r.left - tb.offsetWidth / 2)) + 'px';
  });

  applyLang();
  if (S.token) boot();
})();

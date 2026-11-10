(function () {
  'use strict';
  var $ = function (id) { return document.getElementById(id); };
  var API = (window.JUDGING && window.JUDGING.api) || '';

  /* ---------- اللغة ---------- */
  var T = {
    ar: { brand: 'نظام التحكيم', logout: 'خروج', loginTitle: 'دخول الحكم', email: 'الإيميل', password: 'كلمة السر', enter: 'دخول',
      speed: 'السرعة', zoomL: 'التكبير', reset: 'إعادة', player: 'اللاعب', total: 'الدرجة الحالية', ded: 'الخصومات', items: 'درجات البنود',
      undo: 'تراجع عن آخر خصم', saveNext: 'حفظ والتالي', doneTitle: 'خلصت الفيديوهات المطلوبة', doneText: 'تقدر دلوقتي ترسل تقييماتك لرئيس الحكام للمراجعة.', submit: 'إرسال لرئيس الحكام',
      big: 'خطأ كبير', small: 'خطأ صغير', remaining: 'المتبقي: ', returned: 'مُرجَع من رئيس الحكام: ', saved: 'تم الحفظ', submitted: 'تم الإرسال لرئيس الحكام',
      e_bad_login: 'الإيميل أو كلمة السر غير صحيحة', e_locked: 'محاولات كثيرة، حاول بعد 15 دقيقة', e_auth: 'انتهت الجلسة، سجّل الدخول من جديد',
      e_net: 'تعذّر الاتصال. تأكد من الإنترنت وحاول تاني', e_noapi: 'رابط الخدمة غير مضبوط بعد', e_unfinished: 'لسه فيه فيديوهات ماتحكّمتش', e_locked2: 'التقييم مقفول',
      confirmLeave: 'فيه تقييم لم يُحفظ. تخرج؟', noDed: 'لا توجد خصومات', cls: 'الفئة ',
      helpSpeed: 'غيّر سرعة الفيديو لمراجعة الحركة بدقة. السرعات البطيئة تساعدك تشوف الأخطاء الصغيرة.',
      helpZoom: 'كبّر الفيديو لتفحص الأقدام أو اليدين. بعد التكبير تظهر أسهم لتحريك الصورة.',
      helpDed: 'اضغط الزر وقت ما تشوف الخطأ: كبير أو صغير. يتسجل وقت الخطأ من الفيديو، وتقدر تتراجع عن آخر خصم.',
      helpItems: 'درجات تضيفها حسب أداء اللاعب في كل بند. الحد الأقصى مكتوب جنب البند.' },
    en: { brand: 'Judging System', logout: 'Log out', loginTitle: 'Judge login', email: 'Email', password: 'Password', enter: 'Log in',
      speed: 'Speed', zoomL: 'Zoom', reset: 'Reset', player: 'Athlete', total: 'Current score', ded: 'Deductions', items: 'Item scores',
      undo: 'Undo last deduction', saveNext: 'Save & next', doneTitle: 'All assigned videos are done', doneText: 'You can now send your scores to the head judge for review.', submit: 'Send to head judge',
      big: 'Major mistake', small: 'Minor mistake', remaining: 'Remaining: ', returned: 'Returned by head judge: ', saved: 'Saved', submitted: 'Sent to the head judge',
      e_bad_login: 'Wrong email or password', e_locked: 'Too many attempts, try again in 15 minutes', e_auth: 'Session expired, please log in again',
      e_net: 'Connection failed. Check your internet and try again', e_noapi: 'Service URL is not configured yet', e_unfinished: 'Some videos are not judged yet', e_locked2: 'This score is locked',
      confirmLeave: 'There is an unsaved score. Leave?', noDed: 'No deductions', cls: 'Class ',
      helpSpeed: 'Change the video speed to check movements precisely. Slow speeds help you spot small mistakes.',
      helpZoom: 'Zoom in to inspect feet or hands. Arrows appear to move the picture once zoomed.',
      helpDed: 'Press the button when you see a mistake: major or minor. The video time is recorded, and you can undo the last one.',
      helpItems: 'Scores you give for each item based on the performance. The maximum is shown beside each item.' }
  };
  var lang = 'ar';
  try { lang = localStorage.getItem('jd_lang') || 'ar'; } catch (e) {}
  function t(k) { return (T[lang] && T[lang][k]) || T.ar[k] || k; }
  function applyLang() {
    document.documentElement.lang = lang; document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    Array.prototype.forEach.call(document.querySelectorAll('[data-i]'), function (el) { el.textContent = t(el.getAttribute('data-i')); });
    $('lang').textContent = lang === 'ar' ? 'EN' : 'ع';
    if (cur) { renderCur(); }
  }

  /* ---------- الوضع الليلي/النهاري ---------- */
  function setTheme(m) {
    document.documentElement.setAttribute('data-theme', m);
    $('theme').textContent = m === 'dark' ? '☀️' : '🌙';
    try { localStorage.setItem('jd_theme', m); } catch (e) {}
  }
  var saved = null; try { saved = localStorage.getItem('jd_theme'); } catch (e) {}
  setTheme(saved || (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'));
  $('theme').onclick = function () { setTheme(document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark'); };
  $('lang').onclick = function () { lang = lang === 'ar' ? 'en' : 'ar'; try { localStorage.setItem('jd_lang', lang); } catch (e) {} applyLang(); };

  /* ---------- الاتصال ---------- */
  var token = ''; try { token = sessionStorage.getItem('jd_token') || ''; } catch (e) {}
  function call(body) {
    if (!API) return Promise.resolve({ ok: false, error: 'noapi' });
    body.token = token;
    return fetch(API, { method: 'POST', headers: { 'Content-Type': 'text/plain;charset=utf-8' }, body: JSON.stringify(body) })
      .then(function (r) { return r.json(); }).catch(function () { return { ok: false, error: 'net' }; });
  }
  function errText(e) { return t('e_' + e) !== 'e_' + e ? t('e_' + e) : t('e_net'); }

  /* ---------- سجل الأحداث (يُرسل دفعات) ---------- */
  var evq = [];
  function ev(type, data) { evq.push({ type: type, pid: cur ? cur.pid : '', data: data === undefined ? '' : data }); if (evq.length >= 20) flush(); }
  function flush() {
    if (!evq.length || !token) return Promise.resolve();
    var batch = evq.splice(0, 200);
    return call({ action: 'events', events: batch }).then(function (r) { if (!r.ok && r.error === 'net') evq = batch.concat(evq); });
  }
  setInterval(flush, 8000);

  /* ---------- الحالة ---------- */
  var cur = null, dedList = [], items = {}, dirty = false, player = null, ytReady = null, zoom = 1, px = 0, py = 0;

  function show(id) { ['login', 'work', 'done'].forEach(function (s) { $(s).hidden = s !== id; }); $('logout').hidden = id === 'login'; if (id === 'login') $('remain').hidden = true; }

  $('go').onclick = function () {
    var b = $('go'); b.disabled = true; $('loginMsg').textContent = '';
    call({ action: 'login', email: $('em').value, password: $('pw').value }).then(function (r) {
      b.disabled = false;
      if (!r.ok) { $('loginMsg').textContent = errText(r.error); return; }
      if (r.role !== 'judge') { $('loginMsg').textContent = t('e_auth'); return; }
      token = r.token; try { sessionStorage.setItem('jd_token', token); } catch (e) {}
      loadNext();
    });
  };
  $('pw').addEventListener('keydown', function (e) { if (e.key === 'Enter') $('go').click(); });
  $('logout').onclick = function () { flush().then(function () { token = ''; try { sessionStorage.removeItem('jd_token'); } catch (e) {} cur = null; show('login'); }); };

  function loadNext() {
    call({ action: 'next' }).then(function (r) {
      if (!r.ok) { if (r.error === 'auth') { token = ''; show('login'); $('loginMsg').textContent = t('e_auth'); } else $('workMsg').textContent = errText(r.error); return; }
      if (r.done) { cur = null; show('done'); $('remain').hidden = true; return; }
      cur = r; dedList = (r.previous && r.previous.deductions) ? r.previous.deductions.slice() : []; items = (r.previous && r.previous.items) ? JSON.parse(JSON.stringify(r.previous.items)) : {};
      dirty = false; $('workMsg').textContent = '';
      show('work'); renderCur(); loadVideo(r.videoId);
    });
  }

  function renderCur() {
    var s = cur.sectionConfig || { big: 0.3, small: 0.1, deductionMax: 0, items: [] };
    $('pid').textContent = cur.pid;
    $('pname').textContent = (cur.player && cur.player.name) || '';
    $('secName').textContent = s.label || cur.section;
    var c = $('cls'); c.hidden = !(cur.player && cur.player.classCode); c.textContent = c.hidden ? '' : t('cls') + cur.player.classCode;
    $('remain').hidden = false; $('remain').textContent = t('remaining') + cur.remaining;
    var rt = $('returned'); rt.hidden = !cur.note; rt.textContent = cur.note ? t('returned') + cur.note : '';
    $('dBig').textContent = t('big') + ' −' + s.big; $('dSmall').textContent = t('small') + ' −' + s.small;
    $('dBig').parentNode.hidden = !(s.deductionMax > 0);
    $('undo').hidden = !(s.deductionMax > 0);
    renderItems(s); renderLog(); renderTotal();
  }

  function fmt(sec) { sec = Math.max(0, Math.floor(sec)); return Math.floor(sec / 60) + ':' + ('0' + (sec % 60)).slice(-2); }
  function renderLog() {
    var ul = $('dLog'); ul.innerHTML = '';
    if (!dedList.length) { var li = document.createElement('li'); li.textContent = t('noDed'); ul.appendChild(li); return; }
    var s = cur.sectionConfig;
    dedList.forEach(function (d, i) {
      var li = document.createElement('li'), v = d.type === 'big' ? s.big : s.small;
      var a = document.createElement('span'); a.textContent = (i + 1) + '. ' + t(d.type === 'big' ? 'big' : 'small');
      var b = document.createElement('span'); b.dir = 'ltr'; b.textContent = '−' + v + '  @' + fmt(d.t || 0);
      li.appendChild(a); li.appendChild(b); ul.appendChild(li);
    });
  }
  function renderItems(s) {
    var box = $('items'); box.innerHTML = ''; $('itemsBox').hidden = !(s.items && s.items.length);
    (s.items || []).forEach(function (it) {
      var v = Number(items[it.key]) || 0;
      var wrap = document.createElement('div'); wrap.className = 'item';
      var row = document.createElement('div'); row.className = 'row';
      var lab = document.createElement('span'); lab.textContent = it.label + ' (0–' + it.max + ')';
      var num = document.createElement('span'); num.className = 'n'; num.textContent = v.toFixed(1);
      var r = document.createElement('input'); r.type = 'range'; r.min = 0; r.max = it.max; r.step = it.step || 0.1; r.value = v; r.setAttribute('aria-label', it.label);
      r.oninput = function () { items[it.key] = Number(r.value); num.textContent = Number(r.value).toFixed(1); dirty = true; renderTotal(); };
      r.onchange = function () { ev('item', { key: it.key, value: Number(r.value) }); };
      row.appendChild(lab); row.appendChild(num); wrap.appendChild(row); wrap.appendChild(r); box.appendChild(wrap);
    });
  }
  /* نفس معادلة الخادم (للعرض فقط؛ الخادم يعيد الحساب عند الحفظ) */
  function calc() {
    var s = cur.sectionConfig || { big: 0, small: 0, deductionMax: 0, items: [] }, ded = 0, sum = 0;
    dedList.forEach(function (d) { ded += d.type === 'big' ? s.big : s.small; });
    ded = Math.min(ded, s.deductionMax);
    (s.items || []).forEach(function (it) { var v = Number(items[it.key]); sum += Math.min(isFinite(v) && v > 0 ? v : 0, it.max); });
    return Math.round((s.deductionMax - ded + sum) * 100) / 100;
  }
  function renderTotal() { $('tot').textContent = calc().toFixed(1); }

  function addDed(type) {
    dedList.push({ type: type, t: player && player.getCurrentTime ? Math.round(player.getCurrentTime() * 10) / 10 : 0 });
    dirty = true; ev('deduct', dedList[dedList.length - 1]); renderLog(); renderTotal();
  }
  $('dBig').onclick = function () { addDed('big'); };
  $('dSmall').onclick = function () { addDed('small'); };
  $('undo').onclick = function () { var d = dedList.pop(); if (d) { dirty = true; ev('undo', d); renderLog(); renderTotal(); } };

  /* ---------- الفيديو ---------- */
  function loadYT() {
    if (ytReady) return ytReady;
    ytReady = new Promise(function (res) {
      if (window.YT && YT.Player) return res();
      window.onYouTubeIframeAPIReady = res;
      var s = document.createElement('script'); s.src = 'https://www.youtube.com/iframe_api'; document.head.appendChild(s);
    });
    return ytReady;
  }
  function loadVideo(id) {
    resetZoom(true);
    loadYT().then(function () {
      if (player && player.loadVideoById) { player.loadVideoById(id); buildSpeeds(); return; }
      player = new YT.Player('yt', { videoId: id, playerVars: { rel: 0, playsinline: 1, modestbranding: 1, fs: 1 },
        events: { onReady: buildSpeeds, onStateChange: function (e) { if (e.data === 1) ev('play'); else if (e.data === 2) ev('pause'); } } });
    });
  }
  var speeds = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];
  function buildSpeeds() {
    var g = $('speedGrp'); Array.prototype.slice.call(g.querySelectorAll('.chip')).forEach(function (b) { g.removeChild(b); });
    var avail = (player && player.getAvailablePlaybackRates && player.getAvailablePlaybackRates()) || speeds;
    avail.forEach(function (r) {
      var b = document.createElement('button'); b.type = 'button'; b.className = 'chip' + (r === 1 ? ' on' : ''); b.textContent = r + '×'; b.dir = 'ltr';
      b.onclick = function () { if (player.setPlaybackRate) player.setPlaybackRate(r); Array.prototype.forEach.call(g.querySelectorAll('.chip'), function (x) { x.classList.remove('on'); }); b.classList.add('on'); ev('speed', r); };
      g.appendChild(b);
    });
  }
  function applyZoom() {
    $('zoom').style.transform = 'translate(' + px + '%,' + py + '%) scale(' + zoom + ')';
    $('zVal').textContent = Math.round(zoom * 100) + '%'; $('pan').hidden = zoom <= 1;
  }
  function resetZoom(silent) { zoom = 1; px = 0; py = 0; applyZoom(); if (!silent) ev('zoom', 1); }
  function setZoom(z) { zoom = Math.max(1, Math.min(4, Math.round(z * 4) / 4)); if (zoom === 1) { px = 0; py = 0; } applyZoom(); ev('zoom', zoom); }
  $('zIn').onclick = function () { setZoom(zoom + 0.5); };
  $('zOut').onclick = function () { setZoom(zoom - 0.5); };
  $('zReset').onclick = function () { resetZoom(); };
  Array.prototype.forEach.call(document.querySelectorAll('[data-pan]'), function (b) {
    b.onclick = function () { var k = b.getAttribute('data-pan'), st = 8 * zoom / 2, lim = (zoom - 1) * 50;
      if (k === 'l') px += st; if (k === 'r') px -= st; if (k === 'u') py += st; if (k === 'd') py -= st;
      px = Math.max(-lim, Math.min(lim, px)); py = Math.max(-lim, Math.min(lim, py)); applyZoom(); };
  });
  function seek(d) { if (player && player.getCurrentTime) { player.seekTo(Math.max(0, player.getCurrentTime() + d), true); ev('seek', d); } }
  $('back5').onclick = function () { seek(-5); }; $('fwd5').onclick = function () { seek(5); };
  $('pp').onclick = function () { if (!player || !player.getPlayerState) return; if (player.getPlayerState() === 1) player.pauseVideo(); else player.playVideo(); };
  setInterval(function () { if (player && player.getCurrentTime && cur) $('clock').textContent = fmt(player.getCurrentTime()); }, 500);

  /* ---------- حفظ وإرسال ---------- */
  $('save').onclick = function () {
    var b = $('save'); b.disabled = true; $('workMsg').textContent = '';
    flush().then(function () {
      return call({ action: 'save', aid: cur.aid, details: { deductions: dedList, items: items } });
    }).then(function (r) {
      b.disabled = false;
      if (!r.ok) { $('workMsg').textContent = errText(r.error === 'locked' ? 'locked2' : r.error); return; }
      dirty = false; loadNext();
    });
  };
  $('submit').onclick = function () {
    var b = $('submit'); b.disabled = true; $('doneMsg').textContent = ''; $('doneMsg').className = 'msg';
    call({ action: 'submit' }).then(function (r) {
      b.disabled = false;
      if (!r.ok) { $('doneMsg').textContent = errText(r.error); return; }
      $('doneMsg').className = 'msg ok'; $('doneMsg').textContent = t('submitted'); b.hidden = true;
    });
  };

  /* ---------- أيقونات الشرح ---------- */
  var box = $('tipBox');
  document.addEventListener('click', function (e) {
    var b = e.target.closest && e.target.closest('.tip');
    if (!b) { box.hidden = true; return; }
    var txt = t(b.getAttribute('data-help'));
    if (!box.hidden && box.textContent === txt) { box.hidden = true; return; }
    box.textContent = txt; box.hidden = false;
    var r = b.getBoundingClientRect();
    box.style.top = Math.min(window.innerHeight - 90, r.bottom + 8) + 'px';
    box.style.left = Math.max(16, Math.min(window.innerWidth - box.offsetWidth - 16, r.left - 20)) + 'px';
  });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') box.hidden = true; });
  window.addEventListener('beforeunload', function (e) { if (dirty) { e.preventDefault(); e.returnValue = t('confirmLeave'); } });

  applyLang();
  if (token) loadNext(); else show('login');
})();

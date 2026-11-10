/** @OnlyCurrentDoc */
/* نظام التحكيم بالفيديو - منصات كابتن تايكوندو (المرحلة 1: الـ API والشيت وسجل المراجعة)
   منفصل تمامًا عن شيتات اللاعبين والمدربين. انسخ الملف كاملًا في مشروع Apps Script جديد
   مربوط بشيت جديد، ثم شغّل setup() مرة واحدة وانسخ رابط تسجيل صاحب الموقع من الـ Logs. */

var TZ = 'Africa/Cairo';
var TABS = {
  Settings: ['key', 'value'],
  Users: ['uid', 'role', 'name', 'email', 'phone', 'salt', 'hash', 'level', 'weight', 'status', 'created'],
  Invites: ['token', 'role', 'createdBy', 'maxUses', 'uses', 'expires', 'status', 'created'],
  Sessions: ['token', 'uid', 'expires'],
  Players: ['pid', 'code', 'name', 'section', 'groupName', 'classCode', 'videoUrl', 'videoId', 'extra', 'status', 'created'],
  Assignments: ['aid', 'pid', 'judgeUid', 'status', 'note', 'updated'],
  Scores: ['aid', 'details', 'total', 'savedAt'],
  Audit: ['ts', 'day', 'date', 'time', 'uid', 'name', 'role', 'action', 'target', 'detail'],
  Certificates: ['serial', 'type', 'subject', 'name', 'section', 'groupName', 'classCode', 'place', 'band', 'total', 'tournament', 'issued', 'status', 'replacedBy'],
  Corrections: ['cid', 'code', 'phone', 'email', 'text', 'status', 'note', 'created']
};

/* ---------- الأقسام الجاهزة (يعدّلها رئيس الحكام) ---------- */
var PRESETS = {
  basics: { label: 'الأساسيات', total: 10, deductionMax: 7, small: 0.1, big: 0.3,
    items: [{ key: 'power', label: 'القوة والسرعة', max: 1, step: 0.1 },
            { key: 'balance', label: 'التناسق والتوازن', max: 1, step: 0.1 },
            { key: 'look', label: 'الهيئة واللباس', max: 1, step: 0.1 }] },
  poomsae: { label: 'بومسي معتمد', total: 10, deductionMax: 4, small: 0.1, big: 0.3,
    items: [{ key: 'power', label: 'القوة والسرعة', max: 2, step: 0.1 },
            { key: 'rhythm', label: 'الإيقاع', max: 2, step: 0.1 },
            { key: 'energy', label: 'التعبير عن الطاقة', max: 2, step: 0.1 }] },
  para_poomsae: { label: 'بارا بومسي', total: 10, deductionMax: 4, small: 0.1, big: 0.3,
    items: [{ key: 'power', label: 'القوة والسرعة', max: 2, step: 0.1 },
            { key: 'rhythm', label: 'الإيقاع', max: 2, step: 0.1 },
            { key: 'energy', label: 'التعبير عن الطاقة', max: 2, step: 0.1 }] },
  freestyle: { label: 'فري ستايل', total: 10, deductionMax: 0, small: 0.1, big: 0.3, verify: true,
    items: [{ key: 'tech1', label: 'مهارات تقنية 1', max: 2, step: 0.1 },
            { key: 'tech2', label: 'مهارات تقنية 2', max: 2, step: 0.1 },
            { key: 'tech3', label: 'مهارات تقنية 3', max: 2, step: 0.1 },
            { key: 'pres1', label: 'إبداع وتناسق', max: 2, step: 0.1 },
            { key: 'pres2', label: 'تعبير وموسيقى', max: 2, step: 0.1 }] }
};
/* فئات الإعاقة (نفس رموز الموقع) تُضاف لأقسام البارا، ويعدّلها الرئيس */
var PARA_CLASSES = ['P10', 'P20', 'P31', 'P32', 'P33', 'P34', 'P40', 'P50', 'P60', 'P70'];
/* ثلاثة أقسام رئيسية (بومسي، فري ستايل، أساسيات) ولكل منها قسم بارا يرث قواعده ويضيف فئات الإعاقة */
['basics', 'poomsae', 'freestyle'].forEach(function (k) {
  var base = PRESETS[k], p = JSON.parse(JSON.stringify(base));
  base.para = false; base.parent = ''; base.classes = [];
  p.label = 'بارا ' + base.label; p.para = true; p.parent = k; p.classes = PARA_CLASSES.slice();
  PRESETS[k + '_para'] = p;
});
delete PRESETS.para_poomsae;
var DEFAULT_DISPLAY = { showName: false };   // يحدده الرئيس: false = ID اللاعب فقط، true = الاسم معه
var DEFAULT_RANKING = { places: 3, labels: ['1', '2', '3'], tieBreak: ['deduction', 'items'], groupBy: ['section', 'groupName', 'classCode'],
  trim: false, bands: [], showBandWithPlace: true };

/* ---------- دوال حساب نقية (قابلة للاختبار خارج جوجل) ---------- */
function round2_(n) { return Math.round(n * 100) / 100; }

/* details = {deductions:[{move, type:'small'|'big'}], items:{key:value}} */
function computeScore(section, details) {
  details = details || {};
  var s = section, ded = 0, i;
  (details.deductions || []).forEach(function (d) {
    ded += d.type === 'big' ? s.big : d.type === 'small' ? s.small : 0;
  });
  ded = Math.min(ded, s.deductionMax);
  var itemsSum = 0;
  (s.items || []).forEach(function (it) {
    var v = Number((details.items || {})[it.key]);
    if (!isFinite(v) || v < 0) v = 0;
    itemsSum += Math.min(v, it.max);
  });
  var base = s.deductionMax - ded;
  return { total: round2_(base + itemsSum), deduction: round2_(ded), accuracy: round2_(base), items: round2_(itemsSum) };
}

/* judgeScores = [{total, weight, accuracy, items}] -> الدرجة النهائية (متوسط موزون، مع حذف الأعلى والأقل إن فُعّل وكان العدد 5 أو أكثر) */
function aggregate(judgeScores, trim) {
  var arr = judgeScores.slice();
  if (!arr.length) return null;
  if (trim && arr.length >= 5) {
    arr.sort(function (a, b) { return a.total - b.total; });
    arr = arr.slice(1, arr.length - 1);
  }
  var w = 0, t = 0, a = 0, it = 0;
  arr.forEach(function (x) {
    var wt = x.weight > 0 ? x.weight : 1;
    w += wt; t += x.total * wt; a += (x.accuracy || 0) * wt; it += (x.items || 0) * wt;
  });
  return { total: round2_(t / w), accuracy: round2_(a / w), items: round2_(it / w), judges: arr.length };
}

/* bands = [{min:9, label:'A'}, ...] مرتبة أو غير مرتبة؛ أعلى حد أدنى يتحقق */
function bandFor(score, bands) {
  var best = null;
  (bands || []).forEach(function (b) {
    if (score >= b.min && (!best || b.min > best.min)) best = b;
  });
  return best ? best.label : '';
}

/* players = [{pid, groupKey, total, accuracy, items}] -> يضيف place (أو null) و band */
function rankPlayers(players, ranking) {
  var cfg = ranking || DEFAULT_RANKING, groups = {};
  players.forEach(function (p) { (groups[p.groupKey] = groups[p.groupKey] || []).push(p); });
  Object.keys(groups).forEach(function (k) {
    var g = groups[k];
    g.sort(function (a, b) {
      if (b.total !== a.total) return b.total - a.total;
      for (var i = 0; i < (cfg.tieBreak || []).length; i++) {
        var key = cfg.tieBreak[i];
        if (key === 'deduction' && b.accuracy !== a.accuracy) return b.accuracy - a.accuracy;
        if (key === 'items' && b.items !== a.items) return b.items - a.items;
      }
      return 0;
    });
    var place = 0;
    g.forEach(function (p, i) {
      var prev = g[i - 1];
      var same = prev && prev.total === p.total && prev.accuracy === p.accuracy && prev.items === p.items;
      if (!same) place = i + 1;
      p.rank = place;
      p.tied = !!same || !!(g[i + 1] && g[i + 1].total === p.total && g[i + 1].accuracy === p.accuracy && g[i + 1].items === p.items);
      p.place = place <= cfg.places ? ((cfg.labels && cfg.labels[place - 1]) || String(place)) : null;
      p.band = bandFor(p.total, cfg.bands);
    });
  });
  return players;
}

function videoIdFrom(url) {
  var m = String(url || '').match(/(?:youtu\.be\/|[?&]v=|\/embed\/|\/shorts\/)([A-Za-z0-9_-]{11})/);
  return m ? m[1] : '';
}

/* ---------- أدوات الشيت ---------- */
function ss_() { return SpreadsheetApp.getActiveSpreadsheet(); }
function sheet_(name) {
  var sh = ss_().getSheetByName(name);
  if (!sh) { sh = ss_().insertSheet(name); sh.getRange(1, 1, 1, TABS[name].length).setValues([TABS[name]]); sh.setFrozenRows(1); textCols_(name, sh); }
  return sh;
}
/* جوجل شيتس يحوّل "2026-11-10" و"07:34:19" تلقائيًا لنوع تاريخ/وقت، فنثبّت هذه الأعمدة كنص */
var TEXT_COLS = { Audit: ['ts', 'day', 'date', 'time'], Users: ['phone'], Players: ['code'], Certificates: ['serial', 'subject', 'issued', 'total'], Corrections: ['cid', 'code', 'phone', 'created'] };
function textCols_(name, sh) {
  (TEXT_COLS[name] || []).forEach(function (k) { sh.getRange(1, TABS[name].indexOf(k) + 1, sh.getMaxRows(), 1).setNumberFormat('@'); });
}
/* يُشغَّل مرة واحدة على شيت موجود (setup يستدعيه أيضًا) */
function fixFormats() { Object.keys(TEXT_COLS).forEach(function (n) { textCols_(n, sheet_(n)); }); }
function rows_(name) {
  var sh = sheet_(name), v = sh.getDataRange().getValues(), h = v[0], out = [];
  for (var i = 1; i < v.length; i++) { var o = { _row: i + 1 }; for (var j = 0; j < h.length; j++) o[h[j]] = v[i][j]; out.push(o); }
  return out;
}
function append_(name, obj) {
  var h = TABS[name], sh = sheet_(name), vals = h.map(function (k) { return obj[k] === undefined ? '' : obj[k]; }), tc = TEXT_COLS[name];
  if (!tc) { sh.appendRow(vals); return; }
  /* appendRow يتجاهل تنسيق النص ويحوّل القيم (تواريخ/أرقام)، فنكتب الصف بـ setValues بعد تثبيت أعمدة النص */
  var r = sh.getLastRow() + 1;
  if (r > sh.getMaxRows()) sh.insertRowsAfter(sh.getMaxRows(), 200);
  tc.forEach(function (k) { sh.getRange(r, h.indexOf(k) + 1).setNumberFormat('@'); });
  sh.getRange(r, 1, 1, h.length).setValues([vals]);
}
function update_(name, row, obj) {
  var h = TABS[name], sh = sheet_(name);
  Object.keys(obj).forEach(function (k) { var c = h.indexOf(k); if (c >= 0) sh.getRange(row, c + 1).setValue(obj[k]); });
}
function setting_(key, def) {
  var r = rows_('Settings').filter(function (x) { return x.key === key; })[0];
  if (!r) return def;
  try { return JSON.parse(r.value); } catch (e) { return def; }
}
function setSetting_(key, val) {
  var r = rows_('Settings').filter(function (x) { return x.key === key; })[0];
  if (r) update_('Settings', r._row, { value: JSON.stringify(val) }); else append_('Settings', { key: key, value: JSON.stringify(val) });
}
function sections_() { return setting_('sections', PRESETS); }
function ranking_() { return setting_('ranking', DEFAULT_RANKING); }
function display_() { return setting_('display', DEFAULT_DISPLAY); }
function rand_(n) { var s = '', c = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; for (var i = 0; i < n; i++) s += c.charAt(Math.floor(Math.random() * c.length)); return s; }
function token_() { return Utilities.getUuid().replace(/-/g, '') + rand_(8); }
function now_() { return new Date(); }

/* ---------- سجل المراجعة (إضافة فقط) ---------- */
function audit_(user, action, target, detail) {
  var d = now_();
  append_('Audit', { ts: d.toISOString(), day: Utilities.formatDate(d, TZ, 'EEEE'), date: Utilities.formatDate(d, TZ, 'yyyy-MM-dd'),
    time: Utilities.formatDate(d, TZ, 'HH:mm:ss'), uid: user ? user.uid : '', name: user ? user.name : '', role: user ? user.role : '',
    action: action, target: target || '', detail: typeof detail === 'string' ? detail : JSON.stringify(detail || '') });
}

/* ---------- كلمات السر والجلسات ---------- */
function hash_(pw, salt) {
  var h = pw + ':' + salt;
  for (var i = 0; i < 100; i++) {
    h = Utilities.base64Encode(Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, h + salt, Utilities.Charset.UTF_8));
  }
  return h;
}
function newUser_(role, b, extra) {
  var salt = rand_(16), uid = 'U' + ('000' + (rows_('Users').length + 1)).slice(-4);
  var u = { uid: uid, role: role, name: String(b.name || '').slice(0, 80), email: String(b.email || '').trim().toLowerCase(),
    phone: String(b.phone || '').slice(0, 25), salt: salt, hash: hash_(String(b.password), salt), level: 'regular', weight: 1,
    status: 'active', created: now_().toISOString() };
  for (var k in (extra || {})) u[k] = extra[k];
  append_('Users', u);
  return u;
}
function validReg_(b) {
  if (!b.name || String(b.name).length < 3) return 'bad_name';
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(b.email || '')) return 'bad_email';
  if (!/^\+\d{8,15}$/.test(String(b.phone || '').replace(/\s/g, ''))) return 'bad_phone';
  if (!b.password || String(b.password).length < 8) return 'weak_password';
  return '';
}
function login_(b) {
  var email = String(b.email || '').trim().toLowerCase();
  var u = rows_('Users').filter(function (x) { return x.email === email && x.status === 'active'; })[0];
  var cache = CacheService.getScriptCache(), key = 'try_' + email;
  var tries = Number(cache.get(key) || 0);
  if (tries >= 10) return { ok: false, error: 'locked' };
  if (!u || hash_(String(b.password || ''), u.salt) !== u.hash) {
    cache.put(key, String(tries + 1), 900);
    audit_(u || null, 'login_failed', email, '');
    return { ok: false, error: 'bad_login' };
  }
  var t = token_();
  append_('Sessions', { token: t, uid: u.uid, expires: new Date(now_().getTime() + 12 * 3600 * 1000).toISOString() });
  audit_(u, 'login', '', '');
  return { ok: true, token: t, role: u.role, name: u.name };
}
function auth_(b, roles) {
  var s = rows_('Sessions').filter(function (x) { return x.token === b.token; })[0];
  if (!s || new Date(s.expires) < now_()) return null;
  var u = rows_('Users').filter(function (x) { return x.uid === s.uid && x.status === 'active'; })[0];
  if (!u || (roles && roles.indexOf(u.role) < 0)) return null;
  return u;
}

/* ---------- نقطة الدخول ---------- */
function doGet() { return json_({ ok: true, service: 'judging', version: 1 }); }
function json_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    var b = JSON.parse(e.postData.contents || '{}');
    var fn = ACTIONS[b.action];
    if (!fn) return json_({ ok: false, error: 'unknown_action' });
    return json_(fn(b));
  } catch (err) {
    return json_({ ok: false, error: 'server_error', message: String(err && err.message || err) });
  } finally { try { lock.releaseLock(); } catch (x) {} }
}

var ACTIONS = {
  /* تسجيل بالرابط السري: صاحب الموقع (owner) / رئيس الحكام (head) / الحكم (judge) */
  register: function (b) {
    var err = validReg_(b); if (err) return { ok: false, error: err };
    var inv = rows_('Invites').filter(function (x) { return x.token === b.invite; })[0];
    if (!inv || inv.status !== 'active' || (inv.expires && new Date(inv.expires) < now_()) || Number(inv.uses) >= Number(inv.maxUses)) return { ok: false, error: 'bad_invite' };
    var email = String(b.email).trim().toLowerCase();
    if (rows_('Users').some(function (x) { return x.email === email; })) return { ok: false, error: 'email_exists' };
    var u = newUser_(inv.role, b);
    var uses = Number(inv.uses) + 1;
    update_('Invites', inv._row, { uses: uses, status: uses >= Number(inv.maxUses) ? 'used' : 'active' });
    audit_(u, 'register', inv.role, { invite: inv.token.slice(0, 6) });
    return { ok: true, role: u.role };
  },
  login: login_,
  config: function (b) {
    var u = auth_(b); if (!u) return { ok: false, error: 'auth' };
    return { ok: true, role: u.role, sections: sections_(), ranking: ranking_(), display: display_(), publish: publish_() };
  },
  /* روابط التسجيل: صاحب الموقع يصدر رابط رئيس الحكام، والرئيس يصدر روابط الحكام */
  createInvite: function (b) {
    var u = auth_(b, ['owner', 'head']); if (!u) return { ok: false, error: 'auth' };
    var role = u.role === 'owner' ? 'head' : 'judge';
    var t = token_();
    append_('Invites', { token: t, role: role, createdBy: u.uid, maxUses: Math.max(1, Math.min(200, Number(b.maxUses) || 1)),
      uses: 0, expires: b.hours ? new Date(now_().getTime() + Number(b.hours) * 3600 * 1000).toISOString() : '', status: 'active', created: now_().toISOString() });
    audit_(u, 'invite_created', role, { maxUses: b.maxUses, hours: b.hours });
    return { ok: true, invite: t, role: role };
  },
  /* الإعدادات (رئيس الحكام): الأقسام والترتيب والحدود */
  saveSettings: function (b) {
    var u = auth_(b, ['head']); if (!u) return { ok: false, error: 'auth' };
    if (b.sections) setSetting_('sections', b.sections);
    if (b.ranking) setSetting_('ranking', b.ranking);
    if (b.display) setSetting_('display', { showName: !!b.display.showName });
    audit_(u, 'settings_changed', Object.keys(b).filter(function (k) { return k === 'sections' || k === 'ranking' || k === 'display'; }).join(','), { sections: b.sections, ranking: b.ranking, display: b.display });
    return { ok: true };
  },
  /* استيراد اللاعبين والفيديوهات (من الشيت أو Excel بعد قراءته في المتصفح) */
  importPlayers: function (b) {
    var u = auth_(b, ['head']); if (!u) return { ok: false, error: 'auth' };
    var existing = {}; rows_('Players').forEach(function (p) { existing[p.code] = true; });
    var n = rows_('Players').length, added = 0, noVideo = 0, skipped = 0;
    (b.players || []).slice(0, 2000).forEach(function (p) {
      var code = String(p.code || '').trim();
      if (!code || existing[code]) { skipped++; return; }
      var vid = videoIdFrom(p.video);
      if (!vid) noVideo++;
      n++; existing[code] = true; added++;
      append_('Players', { pid: 'P' + ('0000' + n).slice(-4), code: code, name: String(p.name || '').slice(0, 80), section: String(p.section || ''),
        groupName: String(p.group || ''), classCode: String(p.classCode || '').toUpperCase().slice(0, 10), videoUrl: vid ? String(p.video) : '', videoId: vid, extra: JSON.stringify(p.extra || {}),
        status: vid ? 'ready' : 'no_video', created: now_().toISOString() });
    });
    audit_(u, 'import_players', '', { added: added, skipped: skipped, noVideo: noVideo });
    return { ok: true, added: added, skipped: skipped, noVideo: noVideo };
  },
  players: function (b) {
    var u = auth_(b, ['head', 'owner']); if (!u) return { ok: false, error: 'auth' };
    return { ok: true, players: rows_('Players').map(function (p) { delete p._row; return p; }), judges: rows_('Users').filter(function (x) { return x.role === 'judge'; }).map(function (x) { return { uid: x.uid, name: x.name, level: x.level, weight: x.weight, status: x.status }; }) };
  },
  /* توزيع / إعادة توزيع: لكل لاعب قائمة حكام؛ القديم غير المحكّم يُلغى، والمحكّم يبقى للسجل */
  assign: function (b) {
    var u = auth_(b, ['head']); if (!u) return { ok: false, error: 'auth' };
    var pid = String(b.pid), want = (b.judges || []).map(String);
    var cur = rows_('Assignments').filter(function (a) { return a.pid === pid && a.status !== 'cancelled'; });
    var made = 0, cancelled = 0;
    cur.forEach(function (a) {
      if (want.indexOf(a.judgeUid) < 0) {
        if (a.status === 'assigned' || a.status === 'in_progress' || a.status === 'returned') { update_('Assignments', a._row, { status: 'cancelled', updated: now_().toISOString() }); cancelled++; }
      }
    });
    want.forEach(function (j) {
      if (!cur.some(function (a) { return a.judgeUid === j && a.status !== 'cancelled'; })) {
        append_('Assignments', { aid: 'A' + token_().slice(0, 8), pid: pid, judgeUid: j, status: 'assigned', note: '', updated: now_().toISOString() });
        made++;
      }
    });
    audit_(u, 'assign', pid, { judges: want, made: made, cancelled: cancelled });
    return { ok: true, made: made, cancelled: cancelled };
  },
  setJudge: function (b) {
    var u = auth_(b, ['head']); if (!u) return { ok: false, error: 'auth' };
    var j = rows_('Users').filter(function (x) { return x.uid === b.uid && x.role === 'judge'; })[0];
    if (!j) return { ok: false, error: 'not_found' };
    var upd = {};
    if (b.level) upd.level = String(b.level).slice(0, 20);
    if (b.weight !== undefined) upd.weight = Math.max(0.1, Math.min(5, Number(b.weight) || 1));
    if (b.status === 'active' || b.status === 'disabled') upd.status = b.status;
    update_('Users', j._row, upd);
    audit_(u, 'judge_changed', j.uid, upd);
    return { ok: true };
  },
  /* الحكم: الفيديو التالي (ID اللاعب فقط بدون الاسم) */
  next: function (b) {
    var u = auth_(b, ['judge']); if (!u) return { ok: false, error: 'auth' };
    var mine = rows_('Assignments').filter(function (a) { return a.judgeUid === u.uid && (a.status === 'assigned' || a.status === 'in_progress' || a.status === 'returned'); });
    if (!mine.length) return { ok: true, done: true };
    mine.sort(function (a, c) { return (a.status === 'returned' ? 0 : 1) - (c.status === 'returned' ? 0 : 1); });
    var a = mine[0], p = rows_('Players').filter(function (x) { return x.pid === a.pid; })[0];
    if (!p) return { ok: false, error: 'not_found' };
    if (a.status === 'assigned') update_('Assignments', a._row, { status: 'in_progress', updated: now_().toISOString() });
    audit_(u, 'video_open', p.pid, { aid: a.aid, videoId: p.videoId });
    var sc = rows_('Scores').filter(function (s) { return s.aid === a.aid; })[0];
    var sec = sections_()[p.section] || null;
    var shown = display_().showName ? { name: p.name } : {};
    if (p.classCode) shown.classCode = p.classCode;   // فئة الإعاقة تظهر للحكم دائمًا (لا تكشف الهوية)
    return { ok: true, aid: a.aid, pid: p.pid, player: shown, videoId: p.videoId, section: p.section, sectionConfig: sec, note: a.status === 'returned' ? a.note : '',
      previous: sc ? JSON.parse(sc.details) : null, remaining: mine.length };
  },
  /* سجل خطوات الحكم (ضغطات الخصم، السرعة، التكبير...) */
  events: function (b) {
    var u = auth_(b, ['judge']); if (!u) return { ok: false, error: 'auth' };
    (b.events || []).slice(0, 200).forEach(function (ev) { audit_(u, String(ev.type || 'event').slice(0, 30), String(ev.pid || ''), ev.data || ''); });
    return { ok: true };
  },
  save: function (b) {
    var u = auth_(b, ['judge']); if (!u) return { ok: false, error: 'auth' };
    var a = rows_('Assignments').filter(function (x) { return x.aid === b.aid && x.judgeUid === u.uid; })[0];
    if (!a || ['in_progress', 'returned', 'saved'].indexOf(a.status) < 0) return { ok: false, error: 'locked' };
    var p = rows_('Players').filter(function (x) { return x.pid === a.pid; })[0];
    var sec = sections_()[p.section]; if (!sec) return { ok: false, error: 'no_section' };
    var r = computeScore(sec, b.details);
    var old = rows_('Scores').filter(function (s) { return s.aid === a.aid; })[0];
    var rec = { aid: a.aid, details: JSON.stringify(b.details || {}), total: r.total, savedAt: now_().toISOString() };
    if (old) update_('Scores', old._row, rec); else append_('Scores', rec);
    update_('Assignments', a._row, { status: 'saved', updated: now_().toISOString() });
    audit_(u, 'save', a.pid, { aid: a.aid, total: r.total, deduction: r.deduction });
    return { ok: true, total: r.total };
  },
  /* الحكم يرسل كل ما حفظه للرئيس */
  submit: function (b) {
    var u = auth_(b, ['judge']); if (!u) return { ok: false, error: 'auth' };
    var left = rows_('Assignments').filter(function (a) { return a.judgeUid === u.uid && (a.status === 'assigned' || a.status === 'in_progress' || a.status === 'returned'); });
    if (left.length) return { ok: false, error: 'unfinished', left: left.length };
    var n = 0;
    rows_('Assignments').forEach(function (a) { if (a.judgeUid === u.uid && a.status === 'saved') { update_('Assignments', a._row, { status: 'submitted', updated: now_().toISOString() }); n++; } });
    audit_(u, 'submit', '', { count: n });
    return { ok: true, submitted: n };
  },
  /* مراجعة الرئيس: كل درجات اللاعب */
  review: function (b) {
    var u = auth_(b, ['head']); if (!u) return { ok: false, error: 'auth' };
    var users = {}; rows_('Users').forEach(function (x) { users[x.uid] = x; });
    var scores = {}; rows_('Scores').forEach(function (s) { scores[s.aid] = s; });
    var out = rows_('Assignments').filter(function (a) { return a.status !== 'cancelled'; }).map(function (a) {
      var s = scores[a.aid], j = users[a.judgeUid] || {};
      return { aid: a.aid, pid: a.pid, judge: j.name, judgeUid: a.judgeUid, level: j.level, weight: j.weight, status: a.status, note: a.note,
        total: s ? s.total : null, details: s ? JSON.parse(s.details) : null };
    });
    return { ok: true, assignments: out };
  },
  decide: function (b) {
    var u = auth_(b, ['head']); if (!u) return { ok: false, error: 'auth' };
    var a = rows_('Assignments').filter(function (x) { return x.aid === b.aid; })[0];
    if (!a || a.status !== 'submitted') return { ok: false, error: 'not_submitted' };
    if (b.decision === 'approve') update_('Assignments', a._row, { status: 'approved', note: '', updated: now_().toISOString() });
    else if (b.decision === 'return') {
      if (!b.note) return { ok: false, error: 'note_required' };
      update_('Assignments', a._row, { status: 'returned', note: String(b.note).slice(0, 500), updated: now_().toISOString() });
    } else return { ok: false, error: 'bad_decision' };
    audit_(u, b.decision, a.pid, { aid: a.aid, judge: a.judgeUid, note: b.note || '' });
    return { ok: true };
  },
  /* النتائج النهائية والمراكز (تُحسب من الدرجات المعتمدة فقط) */
  results: function (b) {
    var u = auth_(b, ['head', 'owner']); if (!u) return { ok: false, error: 'auth' };
    return { ok: true, results: computeResults_() };
  },
  /* نشر النتائج على الموقع: مفتاح رئيس الحكام (الجدول العام بالمراكز فقط، بدون درجات الحكام) */
  publish: function (b) {
    var u = auth_(b, ['head']); if (!u) return { ok: false, error: 'auth' };
    var on = !!b.on;
    setSetting_('publish', { on: on, at: now_().toISOString() });
    audit_(u, on ? 'results_published' : 'results_unpublished', '', '');
    return { ok: true, on: on };
  },
  /* صفحة صاحب الموقع: حالة عامة + إعداداته. لا يغيّرها غيره */
  ownerGet: function (b) {
    var u = auth_(b, ['owner']); if (!u) return { ok: false, error: 'auth' };
    var asg = rows_('Assignments').filter(function (a) { return a.status !== 'cancelled'; }), by = {};
    asg.forEach(function (a) { by[a.status] = (by[a.status] || 0) + 1; });
    var users = rows_('Users');
    return { ok: true, owner: owner_(), publish: publish_(), stats: {
      players: rows_('Players').length, judges: users.filter(function (x) { return x.role === 'judge'; }).length,
      heads: users.filter(function (x) { return x.role === 'head'; }).length, assignments: by, approvedPlayers: computeResults_().length } };
  },
  ownerSave: function (b) {
    var u = auth_(b, ['owner']); if (!u) return { ok: false, error: 'auth' };
    var o = owner_(), n = b.owner || {};
    if (n.showScore !== undefined) o.showScore = !!n.showScore;
    if (n.certificatesOpen !== undefined) o.certificatesOpen = !!n.certificatesOpen;
    ['players', 'coaches', 'judges'].forEach(function (k) { if (n.participation && n.participation[k] !== undefined) o.participation[k] = !!n.participation[k]; });
    setSetting_('owner', o);
    audit_(u, 'owner_settings_changed', '', o);
    return { ok: true, owner: o };
  },
  /* سجل المراجعة لصاحب الموقع: آخر السجلات مع فلتر اختياري على نوع الحدث */
  audit: function (b) {
    var u = auth_(b, ['owner']); if (!u) return { ok: false, error: 'auth' };
    var lim = Math.max(1, Math.min(500, Number(b.limit) || 100)), q = String(b.q || '').trim();
    var rows = rows_('Audit');
    if (q) rows = rows.filter(function (r) { return String(r.action).indexOf(q) >= 0 || String(r.name).indexOf(q) >= 0 || String(r.target).indexOf(q) >= 0; });
    return { ok: true, total: rows.length, rows: rows.slice(-lim).reverse().map(function (r) { delete r._row; return r; }) };
  },
  /* جدول الفائزين العام (بدون توكن): يعمل فقط بعد أن ينشر رئيس الحكام. المراكز فقط، والدرجة إن فعّلها صاحب الموقع */
  publicResults: function (b) {
    var p = publish_(); if (!p.on) return { ok: true, published: false, certificatesOpen: false };
    var o = owner_(), secs = sections_(), cfg = ranking_();
    var rows = computeResults_().filter(function (r) { return r.place !== null && r.place !== undefined; }).map(function (r) {
      var x = { name: r.name, section: (secs[r.section] && secs[r.section].label) || r.section, groupName: r.groupName, classCode: r.classCode, place: r.place, rank: r.rank };
      if (cfg.bands && cfg.bands.length && cfg.showBandWithPlace !== false && r.band) x.band = r.band;
      if (o.showScore) x.total = r.total;
      return x;
    });
    return { ok: true, published: true, at: p.at, showScore: !!o.showScore, certificatesOpen: !!o.certificatesOpen, rows: rows };
  },
  /* ---------- الشهادات (عامة بكود + موبايل + إيميل، تعمل فقط بعد نشر النتائج وفتح الشهادات) ---------- */
  certLookup: function (b) {
    var g = certGate_(b); if (g.error) return { ok: false, error: g.error };
    var o = owner_(), out = { ok: true, role: g.role, showScore: !!o.showScore, tournament: TOURNAMENT };
    if (g.role === 'coach') {
      out.coach = { name: g.coachName, code: g.code, hasParticipation: !!o.participation.coaches };
      out.players = g.rows.map(function (p) { var r = resultFor_(p.code); return { name: p.name, code: p.code, place: r ? r.place : null, band: r ? r.band : '' }; });
    } else {
      var r = resultFor_(g.player.code);
      out.player = { code: g.player.code, name: g.player.name, section: secLabel_(g.player.section), groupName: g.player.groupName, classCode: g.player.classCode,
        place: r ? r.place : null, band: r ? r.band : '', total: (r && o.showScore) ? r.total : null, hasResult: !!r };
      out.rankAvailable = !!(r && (r.place || r.band));
      out.participationAvailable = !!(r && o.participation.players);
    }
    out.issued = certsFor_(g.subject).map(pubCert_);
    return out;
  },
  certIssue: function (b) {
    var g = certGate_(b); if (g.error) return { ok: false, error: g.error };
    var o = owner_(), type = String(b.type || ''), rec;
    if (g.role === 'coach') {
      if (type !== 'coach' || !o.participation.coaches) return { ok: false, error: 'not_available' };
      rec = { type: 'coach', subject: g.subject, name: g.coachName, section: '', groupName: '', classCode: '', place: '', band: '', total: '' };
    } else {
      var r = resultFor_(g.player.code);
      if (!r) return { ok: false, error: 'not_ready' };
      if (type !== 'rank' && type !== 'participation') return { ok: false, error: 'bad_type' };
      if (type === 'rank' && !(r.place || r.band)) return { ok: false, error: 'not_available' };
      if (type === 'participation' && !o.participation.players) return { ok: false, error: 'not_available' };
      rec = { type: type, subject: g.subject, name: g.player.name, section: secLabel_(g.player.section), groupName: g.player.groupName, classCode: g.player.classCode,
        place: type === 'rank' && r.place ? r.place : '', band: type === 'rank' ? (r.band || '') : '', total: (type === 'rank' && o.showScore) ? r.total : '' };
    }
    var ex = certsFor_(g.subject).filter(function (c) { return c.type === rec.type && c.status === 'active'; })[0];
    if (ex) return { ok: true, cert: pubCert_(ex), existing: true };
    var made = makeCert_(rec);
    audit_(null, 'cert_issued', made.serial, { type: made.type, subject: made.subject });
    return { ok: true, cert: pubCert_(made) };
  },
  /* حكم: شهادة مشاركته (بالتوكن) */
  judgeCert: function (b) {
    var u = auth_(b, ['judge']); if (!u) return { ok: false, error: 'auth' };
    var o = owner_(); if (!publish_().on || !o.certificatesOpen) return { ok: false, error: 'closed' };
    if (!o.participation.judges) return { ok: false, error: 'not_available' };
    if (!rows_('Assignments').some(function (a) { return a.judgeUid === u.uid && a.status !== 'cancelled'; })) return { ok: false, error: 'not_ready' };
    var ex = certsFor_(u.uid).filter(function (c) { return c.type === 'judge' && c.status === 'active'; })[0];
    if (ex) return { ok: true, cert: pubCert_(ex), existing: true };
    var made = makeCert_({ type: 'judge', subject: u.uid, name: u.name, section: '', groupName: '', classCode: '', place: '', band: '', total: '' });
    audit_(u, 'cert_issued', made.serial, { type: 'judge' });
    return { ok: true, cert: pubCert_(made) };
  },
  /* تحقق عام بالـ serial: يرجّع البيانات المسجلة فقط */
  certVerify: function (b) {
    var sn = String(b.serial || '').trim().toUpperCase();
    if (!/^PTC-\d{4}-[A-Z0-9]{6}$/.test(sn)) return { ok: true, found: false };
    var tries = Number(CacheService.getScriptCache().get('vf') || 0); if (tries > 300) return { ok: false, error: 'locked' };
    CacheService.getScriptCache().put('vf', String(tries + 1), 600);
    var c = rows_('Certificates').filter(function (x) { return x.serial === sn; })[0];
    return c ? { ok: true, found: true, cert: pubCert_(c) } : { ok: true, found: false };
  },
  certRequest: function (b) {
    var g = certGate_(b); if (g.error) return { ok: false, error: g.error };
    var text = String(b.text || '').trim().slice(0, 1000); if (text.length < 3) return { ok: false, error: 'bad_text' };
    var open = rows_('Corrections').filter(function (x) { return x.code === g.code && x.status === 'open'; }).length;
    if (open >= 3) return { ok: false, error: 'too_many' };
    var cid = 'C' + rand_(6);
    append_('Corrections', { cid: cid, code: g.code, phone: String(b.phone || '').slice(0, 25), email: String(b.email || '').slice(0, 120), text: text, status: 'open', note: '', created: now_().toISOString() });
    audit_(null, 'correction_requested', g.code, { cid: cid });
    return { ok: true, cid: cid };
  },
  /* المالك: الشهادات الصادرة، طلبات التصحيح، إعادة الإصدار */
  certList: function (b) {
    var u = auth_(b, ['owner']); if (!u) return { ok: false, error: 'auth' };
    var q = String(b.q || '').trim().toLowerCase(), rows = rows_('Certificates');
    if (q) rows = rows.filter(function (c) { return [c.serial, c.name, c.subject, c.type].join(' ').toLowerCase().indexOf(q) >= 0; });
    return { ok: true, total: rows.length, rows: rows.slice(-200).reverse().map(function (c) { delete c._row; return c; }) };
  },
  corrections: function (b) {
    var u = auth_(b, ['owner']); if (!u) return { ok: false, error: 'auth' };
    return { ok: true, rows: rows_('Corrections').reverse().map(function (c) { delete c._row; return c; }) };
  },
  resolveCorrection: function (b) {
    var u = auth_(b, ['owner']); if (!u) return { ok: false, error: 'auth' };
    var c = rows_('Corrections').filter(function (x) { return x.cid === b.cid; })[0]; if (!c) return { ok: false, error: 'not_found' };
    var st = b.status === 'rejected' ? 'rejected' : 'done';
    update_('Corrections', c._row, { status: st, note: String(b.note || '').slice(0, 300) });
    audit_(u, 'correction_' + st, c.code, { cid: c.cid });
    return { ok: true };
  },
  reissue: function (b) {
    var u = auth_(b, ['owner']); if (!u) return { ok: false, error: 'auth' };
    var old = rows_('Certificates').filter(function (x) { return x.serial === String(b.serial || '').toUpperCase(); })[0];
    if (!old || old.status !== 'active') return { ok: false, error: 'not_found' };
    var rec = { type: old.type, subject: old.subject, name: old.name, section: old.section, groupName: old.groupName, classCode: old.classCode, place: old.place, band: old.band, total: old.total };
    var o = owner_();
    if (old.type === 'rank' || old.type === 'participation') {
      var p = rows_('Players').filter(function (x) { return x.code === old.subject; })[0], r = p ? resultFor_(p.code) : null;
      if (!p || !r) return { ok: false, error: 'not_ready' };
      rec.name = p.name; rec.section = secLabel_(p.section); rec.groupName = p.groupName; rec.classCode = p.classCode;
      if (old.type === 'rank') { rec.place = r.place || ''; rec.band = r.band || ''; rec.total = o.showScore ? r.total : ''; if (!rec.place && !rec.band) return { ok: false, error: 'not_available' }; }
    } else if (old.type === 'judge') {
      var jn = rows_('Users').filter(function (x) { return x.uid === old.subject; })[0]; if (jn) rec.name = jn.name;
    } else if (old.type === 'coach') {
      var cp = rows_('Players').filter(function (x) { return String(parseExtra_(x).coachCode || '').toUpperCase() === old.subject; })[0]; if (cp) rec.name = parseExtra_(cp).coachName || rec.name;
    }
    if (b.name && String(b.name).trim().length >= 3) rec.name = String(b.name).trim().slice(0, 80);
    var made = makeCert_(rec);
    update_('Certificates', old._row, { status: 'replaced', replacedBy: made.serial });
    audit_(u, 'cert_reissued', old.serial, { newSerial: made.serial });
    return { ok: true, cert: pubCert_(made) };
  }
};

var OWNER_DEFAULT = { showScore: false, certificatesOpen: false, participation: { players: true, coaches: true, judges: true } };
function owner_() {
  var o = setting_('owner', null) || {}, d = JSON.parse(JSON.stringify(OWNER_DEFAULT));
  d.showScore = !!o.showScore; d.certificatesOpen = !!o.certificatesOpen;
  ['players', 'coaches', 'judges'].forEach(function (k) { if (o.participation && o.participation[k] !== undefined) d.participation[k] = !!o.participation[k]; });
  return d;
}
function publish_() { var p = setting_('publish', null) || {}; return { on: !!p.on, at: p.at || '' }; }

/* ---------- مساعدات الشهادات ---------- */
var TOURNAMENT = 'بطولة أساسيات البارا تايكوندو 2026';
function digits_(x) { return String(x === undefined || x === null ? '' : x).replace(/\D/g, ''); }
function pkey_(x) { return digits_(x).slice(-8); }
function parseExtra_(p) { try { return JSON.parse(p.extra || '{}') || {}; } catch (e) { return {}; } }
function secLabel_(k) { var s = sections_()[k]; return (s && s.label) || k; }
function resultFor_(code) { return computeResults_().filter(function (r) { return r.code === code; })[0] || null; }
function certsFor_(subject) { return rows_('Certificates').filter(function (c) { return String(c.subject) === String(subject); }); }
function pubCert_(c) {
  return { serial: c.serial, type: c.type, name: c.name, section: c.section, groupName: c.groupName, classCode: c.classCode, place: c.place, band: c.band,
    total: (c.total === '' || c.total === null || c.total === undefined) ? null : Number(c.total), tournament: c.tournament, issued: c.issued, status: c.status, replacedBy: c.replacedBy };
}
function makeCert_(rec) {
  var all = {}; rows_('Certificates').forEach(function (c) { all[c.serial] = true; });
  var sn; do { sn = 'PTC-' + Utilities.formatDate(now_(), TZ, 'yyyy') + '-' + rand_(6); } while (all[sn]);
  var o = { serial: sn, type: rec.type, subject: rec.subject, name: rec.name, section: rec.section, groupName: rec.groupName, classCode: rec.classCode,
    place: rec.place, band: rec.band, total: rec.total, tournament: TOURNAMENT, issued: now_().toISOString(), status: 'active', replacedBy: '' };
  append_('Certificates', o);
  return o;
}
/* كود + موبايل + إيميل (لاعب أو مدرب). يرجّع {role:'player', player, subject, code} أو {role:'coach', rows, coachName, subject, code} أو {error} */
function certGate_(b) {
  var o = owner_(); if (!publish_().on || !o.certificatesOpen) return { error: 'closed' };
  var code = String(b.code || '').trim().toUpperCase(), email = String(b.email || '').trim().toLowerCase(), phone = String(b.phone || '');
  if (!code || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || pkey_(phone).length < 8) return { error: 'not_found' };
  var cache = CacheService.getScriptCache(), key = 'ct_' + code, tries = Number(cache.get(key) || 0);
  if (tries >= 10) return { error: 'locked' };
  var ps = rows_('Players'), fail = function () { cache.put(key, String(tries + 1), 900); return { error: 'not_found' }; };
  if (b.role === 'coach') {
    var rows = ps.filter(function (p) { var x = parseExtra_(p); return String(x.coachCode || '').toUpperCase() === code && String(x.coachEmail || '').toLowerCase() === email && pkey_(x.coachPhone) === pkey_(phone); });
    if (!rows.length) return fail();
    return { role: 'coach', rows: rows, coachName: parseExtra_(rows[0]).coachName || '', subject: code, code: code };
  }
  var p = ps.filter(function (x) { return String(x.code).toUpperCase() === code; })[0];
  if (!p) return fail();
  var e = parseExtra_(p);
  var own = String(e.email || '').toLowerCase() === email && pkey_(e.phone) === pkey_(phone);
  var coach = String(e.coachEmail || '').toLowerCase() === email && pkey_(e.coachPhone) === pkey_(phone);
  if (!own && !coach) return fail();
  return { role: 'player', player: p, subject: p.code, code: p.code };
}


function computeResults_() {
  var secs = sections_(), cfg = ranking_(), users = {}, scores = {};
  rows_('Users').forEach(function (x) { users[x.uid] = x; });
  rows_('Scores').forEach(function (s) { scores[s.aid] = s; });
  var per = {};
  rows_('Assignments').forEach(function (a) {
    if (a.status !== 'approved' || !scores[a.aid]) return;
    (per[a.pid] = per[a.pid] || []).push({ a: a, s: scores[a.aid] });
  });
  var list = [];
  rows_('Players').forEach(function (p) {
    var sec = secs[p.section], items = per[p.pid]; if (!sec || !items) return;
    var js = items.map(function (x) {
      var r = computeScore(sec, JSON.parse(x.s.details));
      return { total: r.total, accuracy: r.accuracy, items: r.items, weight: Number((users[x.a.judgeUid] || {}).weight) || 1 };
    });
    var ag = aggregate(js, cfg.trim);
    list.push({ pid: p.pid, code: p.code, name: p.name, section: p.section, groupName: p.groupName, classCode: p.classCode,
      groupKey: (cfg.groupBy || []).map(function (k) { return p[k]; }).join('|'), total: ag.total, accuracy: ag.accuracy, items: ag.items, judges: ag.judges });
  });
  rankPlayers(list, cfg);
  list.sort(function (a, b) { return a.groupKey < b.groupKey ? -1 : a.groupKey > b.groupKey ? 1 : a.rank - b.rank; });
  return list;
}

/* ---------- التهيئة (تُشغَّل مرة واحدة من المحرر) ---------- */
function setup() {
  Object.keys(TABS).forEach(sheet_);
  fixFormats();
  setSetting_('sections', PRESETS);
  setSetting_('ranking', DEFAULT_RANKING);
  setSetting_('display', DEFAULT_DISPLAY);
  var t = token_();
  append_('Invites', { token: t, role: 'owner', createdBy: 'setup', maxUses: 1, uses: 0, expires: '', status: 'active', created: now_().toISOString() });
  Logger.log('رمز تسجيل صاحب الموقع (يُستخدم مرة واحدة): ' + t);
  return t;
}

/* يمسح كل البيانات (بعد اختبار التجربة) ويعيد التهيئة برمز صاحب موقع جديد. يُشغَّل من المحرر فقط، وليس متاحًا عبر الـ API. */
function resetForProduction() {
  Object.keys(TABS).forEach(function (n) {
    var sh = sheet_(n), last = sh.getLastRow();
    if (last > 1) sh.deleteRows(2, last - 1);
  });
  return setup();
}

if (typeof module !== 'undefined') module.exports = { computeScore: computeScore, aggregate: aggregate, bandFor: bandFor, rankPlayers: rankPlayers, videoIdFrom: videoIdFrom, PRESETS: PRESETS, DEFAULT_RANKING: DEFAULT_RANKING };

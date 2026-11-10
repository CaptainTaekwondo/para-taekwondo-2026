// اختبار محلي بمحاكاة بسيطة لبيئة Apps Script (ليس اختبارًا على جوجل الفعلي)
const fs = require('fs'), vm = require('vm'), crypto = require('crypto'), assert = require('assert');
const code = fs.readFileSync(__dirname + '/../judging.gs', 'utf8');

const book = {};
function mkSheet(name) {
  const data = [];
  const sh = {
    getDataRange: () => ({ getValues: () => data.map(r => r.slice()) }),
    getRange: (r, c, nr, nc) => ({
      setValues: v => { v.forEach((row, i) => { data[r - 1 + i] = data[r - 1 + i] || []; row.forEach((x, j) => data[r - 1 + i][c - 1 + j] = x); }); },
      setValue: v => { data[r - 1] = data[r - 1] || []; data[r - 1][c - 1] = v; },
      setNumberFormat: f => { sh._fmt = sh._fmt || {}; sh._fmt[c] = f; }
    }),
    appendRow: row => data.push(row.slice()), setFrozenRows() {}, getMaxRows: () => 1000, insertRowsAfter() {}, _data: data,
    getLastRow: () => data.length, deleteRows: (from, n) => data.splice(from - 1, n)
  };
  return sh;
}
const cacheStore = {};
const sandbox = {
  console, Logger: { log: x => (sandbox._log = x) },
  SpreadsheetApp: { getActiveSpreadsheet: () => ({ getSheetByName: n => book[n], insertSheet: n => (book[n] = mkSheet(n)) }) },
  Utilities: {
    getUuid: () => crypto.randomUUID(),
    computeDigest: (a, s) => Array.from(crypto.createHash('sha256').update(s).digest()),
    base64Encode: b => Buffer.from(b).toString('base64'),
    DigestAlgorithm: { SHA_256: 1 }, Charset: { UTF_8: 1 },
    formatDate: (d, tz, f) => f === 'yyyy' ? String(d.getFullYear()) : f === 'EEEE' ? d.toLocaleDateString('en', { weekday: 'long' }) : f === 'yyyy-MM-dd' ? d.toISOString().slice(0, 10) : d.toISOString().slice(11, 19)
  },
  CacheService: { getScriptCache: () => ({ get: k => cacheStore[k] || null, put: (k, v) => (cacheStore[k] = v) }) },
  LockService: { getScriptLock: () => ({ waitLock() {}, releaseLock() {} }) },
  ContentService: { createTextOutput: s => ({ s, setMimeType() { return this; } }), MimeType: { JSON: 1 } }
};
vm.createContext(sandbox);
vm.runInContext(code, sandbox);
const call = o => JSON.parse(sandbox.doPost({ postData: { contents: JSON.stringify(o) } }).s);
const pure = vm.runInContext('({computeScore,aggregate,bandFor,rankPlayers,videoIdFrom,PRESETS})', sandbox);
let n = 0; const ok = (c, m) => { assert(c, m); n++; };

// --- الدوال النقية
const basics = pure.PRESETS.basics;
let r = pure.computeScore(basics, { deductions: [{ type: 'big' }, { type: 'small' }, { type: 'small' }], items: { power: 1, balance: 0.5, look: 2 } });
ok(r.total === 7 - 0.5 + 1 + 0.5 + 1 && r.deduction === 0.5, 'basics total ' + r.total);   // 7-0.5=6.5 + 1+0.5+1(cap)=9
ok(pure.computeScore(basics, { deductions: Array(30).fill({ type: 'big' }) }).total === 0, 'deduction cap');
const pm = pure.computeScore(pure.PRESETS.poomsae, { deductions: [{ type: 'big' }], items: { power: 2, rhythm: 1.5, energy: 1 } });
ok(pm.total === 3.7 + 4.5, 'poomsae ' + pm.total);
ok(pure.aggregate([{ total: 8, weight: 1 }, { total: 9, weight: 2 }]).total === 8.67, 'weighted mean');
ok(pure.aggregate([1, 2, 3, 4, 100].map(t => ({ total: t })), true).total === 3, 'trim 5');
ok(pure.aggregate([1, 2, 3, 4].map(t => ({ total: t })), true).total === 2.5, 'no trim under 5');
ok(pure.bandFor(6, [{ min: 9, label: 'A' }, { min: 6, label: 'B' }, { min: 0, label: 'C' }]) === 'B', 'band');
ok(pure.bandFor(5.99, [{ min: 6, label: 'B' }]) === '', 'below all bands');
ok(pure.videoIdFrom('https://youtu.be/dQw4w9WgXcQ') === 'dQw4w9WgXcQ' && pure.videoIdFrom('https://www.youtube.com/watch?v=dQw4w9WgXcQ') === 'dQw4w9WgXcQ' && pure.videoIdFrom('x') === '', 'video id');
const rk = pure.rankPlayers([{ pid: 'a', groupKey: 'g', total: 9, accuracy: 4, items: 5 }, { pid: 'b', groupKey: 'g', total: 9, accuracy: 3.5, items: 5.5 },
  { pid: 'c', groupKey: 'g', total: 7, accuracy: 3, items: 4 }, { pid: 'd', groupKey: 'g', total: 7, accuracy: 3, items: 4 }, { pid: 'e', groupKey: 'g', total: 5, accuracy: 1, items: 4 }],
  { places: 3, labels: ['ذهبي', 'فضي', 'برونزي'], tieBreak: ['deduction', 'items'], bands: [{ min: 8, label: 'A' }] });
const by = Object.fromEntries(rk.map(p => [p.pid, p]));
ok(by.a.place === 'ذهبي' && by.b.place === 'فضي' && by.c.place === 'برونزي' && by.d.place === 'برونزي' && by.e.place === null, 'ranking & ties');
ok(by.c.tied && by.d.tied && !by.a.tied && by.a.band === 'A' && by.c.band === '', 'tied flag / band');

// --- تدفق كامل بالمحاكاة
const owner0 = vm.runInContext('setup()', sandbox);
ok(owner0 && sandbox._log.includes(owner0), 'setup invite');
ok(call({ action: 'register', invite: 'bad', name: 'Owner One', email: 'o@x.com', phone: '+201000000000', password: 'password1' }).error === 'bad_invite', 'bad invite');
ok(call({ action: 'register', invite: owner0, name: 'Owner One', email: 'o@x.com', phone: '+201000000000', password: 'short' }).error === 'weak_password', 'weak');
ok(call({ action: 'register', invite: owner0, name: 'Owner One', email: 'o@x.com', phone: '+201000000000', password: 'password1' }).ok, 'owner reg');
ok(call({ action: 'register', invite: owner0, name: 'Owner Two', email: 'o2@x.com', phone: '+201000000001', password: 'password1' }).error === 'bad_invite', 'invite single use');
ok(call({ action: 'login', email: 'o@x.com', password: 'wrongpass1' }).error === 'bad_login', 'bad login');
const O = call({ action: 'login', email: 'o@x.com', password: 'password1' }).token;
ok(O && call({ action: 'createInvite', token: O }).role === 'head', 'owner makes head invite');
ok(call({ action: 'createInvite', token: 'nope' }).error === 'auth', 'no auth');
const headInv = call({ action: 'createInvite', token: O }).invite;
ok(call({ action: 'register', invite: headInv, name: 'Head Judge', email: 'h@x.com', phone: '+201000000002', password: 'password2' }).role === 'head', 'head reg');
const H = call({ action: 'login', email: 'h@x.com', password: 'password2' }).token;
const jInv = call({ action: 'createInvite', token: H, maxUses: 3 });
ok(jInv.role === 'judge', 'judge invite');
['j1', 'j2', 'j3'].forEach((j, i) => ok(call({ action: 'register', invite: jInv.invite, name: 'Judge ' + j, email: j + '@x.com', phone: '+20100000010' + i, password: 'password3' }).ok, 'judge reg ' + j));
ok(call({ action: 'register', invite: jInv.invite, name: 'Judge j4', email: 'j4@x.com', phone: '+201000000199', password: 'password3' }).error === 'bad_invite', 'invite maxUses');
const J = ['j1', 'j2', 'j3'].map(j => call({ action: 'login', email: j + '@x.com', password: 'password3' }).token);
ok(call({ action: 'importPlayers', token: J[0], players: [] }).error === 'auth', 'judge cannot import');
const imp = call({ action: 'importPlayers', token: H, players: [
  { code: 'PTP-2026-0001', name: 'لاعب أول', section: 'basics', group: 'U12', video: 'https://youtu.be/dQw4w9WgXcQ' },
  { code: 'PTP-2026-0002', name: 'لاعب ثان', section: 'basics', group: 'U12', video: 'https://youtu.be/aaaaaaaaaaa' },
  { code: 'PTP-2026-0003', name: 'لاعب ثالث', section: 'basics', group: 'U12', video: '' },
  { code: 'PTP-2026-0001', name: 'مكرر', section: 'basics', group: 'U12', video: '' }] });
ok(imp.added === 3 && imp.skipped === 1 && imp.noVideo === 1, 'import ' + JSON.stringify(imp));
const pl = call({ action: 'players', token: H });
const judges = pl.judges.map(j => j.uid);
ok(judges.length === 3, 'judges list');
// الأقسام: 3 رئيسية + نسخة بارا لكل منها بفئات الإعاقة
const secs = call({ action: 'config', token: H }).sections;
ok(Object.keys(secs).sort().join() === 'basics,basics_para,freestyle,freestyle_para,poomsae,poomsae_para', 'six sections');
ok(secs.poomsae_para.para && secs.poomsae_para.parent === 'poomsae' && secs.poomsae_para.classes.includes('P31') && secs.poomsae.classes.length === 0, 'para classes');
ok(call({ action: 'config', token: H }).display.showName === false, 'name hidden by default');
// توزيع: P0001 على حكمين، P0002 على حكم واحد
ok(call({ action: 'assign', token: H, pid: 'P0001', judges: [judges[0], judges[1]] }).made === 2, 'assign 2');
ok(call({ action: 'assign', token: H, pid: 'P0002', judges: [judges[0]] }).made === 1, 'assign 1');
// الحكم الأول
let nx = call({ action: 'next', token: J[0] });
ok(nx.pid === 'P0001' && nx.videoId === 'dQw4w9WgXcQ' && !('name' in nx) && JSON.stringify(nx).indexOf('لاعب') < 0, 'judge sees ID only');
ok(call({ action: 'events', token: J[0], events: [{ type: 'deduct', pid: 'P0001', data: { type: 'big', move: 3 } }, { type: 'speed', pid: 'P0001', data: 0.5 }] }).ok, 'events');
let sv = call({ action: 'save', token: J[0], aid: nx.aid, details: { deductions: [{ type: 'big' }, { type: 'small' }], items: { power: 1, balance: 1, look: 1 } } });
ok(sv.total === 9.6, 'save total ' + sv.total);
ok(call({ action: 'save', token: J[1], aid: nx.aid, details: {} }).error === 'locked', 'other judge cannot save my aid');
nx = call({ action: 'next', token: J[0] });
ok(nx.pid === 'P0002', 'next video');
ok(call({ action: 'submit', token: J[0] }).error === 'unfinished', 'cannot submit with unfinished');
call({ action: 'save', token: J[0], aid: nx.aid, details: { deductions: [], items: { power: 1, balance: 1, look: 1 } } });
ok(call({ action: 'next', token: J[0] }).done, 'no more');
ok(call({ action: 'submit', token: J[0] }).submitted === 2, 'submit');
// الحكم الثاني
const n2 = call({ action: 'next', token: J[1] });
call({ action: 'save', token: J[1], aid: n2.aid, details: { deductions: [{ type: 'small' }], items: { power: 0.5, balance: 1, look: 1 } } });
call({ action: 'submit', token: J[1] });
// مراجعة الرئيس: اعتماد وإرجاع
const rv = call({ action: 'review', token: H }).assignments;
ok(rv.length === 3 && rv.every(a => a.status === 'submitted'), 'review list');
ok(call({ action: 'decide', token: H, aid: rv[0].aid, decision: 'return' }).error === 'note_required', 'return needs note');
ok(call({ action: 'decide', token: H, aid: rv[0].aid, decision: 'return', note: 'راجع الحركة 3' }).ok, 'return');
const back = call({ action: 'next', token: J[0] });
ok(back.note === 'راجع الحركة 3' && back.previous, 'returned shows note + previous');
call({ action: 'save', token: J[0], aid: back.aid, details: back.previous });
call({ action: 'submit', token: J[0] });
call({ action: 'review', token: H }).assignments.forEach(a => ok(call({ action: 'decide', token: H, aid: a.aid, decision: 'approve' }).ok, 'approve'));
const res = call({ action: 'results', token: H }).results;
ok(res.length === 2 && res[0].pid === 'P0002' && res[0].place === '1' && res[1].place === '2', 'results ' + JSON.stringify(res.map(x => [x.pid, x.total, x.place])));
// إظهار الاسم إعداد للرئيس + تجميع البارا حسب فئة الإعاقة
ok(call({ action: 'saveSettings', token: J[0], display: { showName: true } }).error === 'auth', 'judge cannot change display');
ok(call({ action: 'saveSettings', token: H, display: { showName: true }, ranking: { places: 12, labels: [], tieBreak: [], groupBy: ['section', 'classCode'], trim: false, bands: [] } }).ok, 'head sets display + 12 places');
call({ action: 'importPlayers', token: H, players: [
  { code: 'PTP-2026-0010', name: 'بارا ١', section: 'poomsae_para', group: 'U12', classCode: 'p31', video: 'https://youtu.be/bbbbbbbbbbb' },
  { code: 'PTP-2026-0011', name: 'بارا ٢', section: 'poomsae_para', group: 'U12', classCode: 'P20', video: 'https://youtu.be/ccccccccccc' }] });
const pp = call({ action: 'players', token: H }).players.filter(p => p.section === 'poomsae_para');
ok(pp.length === 2 && pp[0].classCode === 'P31', 'classCode stored upper-case');
call({ action: 'assign', token: H, pid: pp[0].pid, judges: [judges[2]] });
const sh = call({ action: 'next', token: J[2] });
ok(sh.player.name === 'بارا ١' && sh.player.classCode === 'P31', 'name shown when enabled');
// إعادة توزيع بعد التحكيم: الحكم المحكَّم يبقى في السجل
ok(call({ action: 'assign', token: H, pid: 'P0001', judges: [judges[2]] }).cancelled === 0, 'scored assignments kept');
// صاحب الموقع: النشر، الإعدادات، السجل، الجدول العام
ok(call({ action: 'publicResults' }).published === false, 'public results hidden before publish');
ok(call({ action: 'publish', token: J[0], on: true }).error === 'auth', 'judge cannot publish');
ok(call({ action: 'publish', token: O, on: true }).error === 'auth', 'owner cannot publish (head only)');
ok(call({ action: 'ownerGet', token: H }).error === 'auth', 'head cannot read owner page');
const og = call({ action: 'ownerGet', token: O });
ok(og.ok && og.owner.showScore === false && og.owner.certificatesOpen === false && og.publish.on === false && og.stats.players >= 3, 'owner defaults ' + JSON.stringify(og.owner));
ok(call({ action: 'config', token: H }).publish.on === false, 'config has publish flag');
ok(call({ action: 'publish', token: H, on: true }).on === true, 'head publishes');
let pub = call({ action: 'publicResults' });
ok(pub.published && pub.rows.length > 0 && pub.rows.every(r => !('total' in r) && !('code' in r) && !('pid' in r)), 'public rows: no score/code/pid by default');
ok(JSON.stringify(pub).indexOf('judge') < 0, 'no judge info publicly');
ok(call({ action: 'ownerSave', token: O, owner: { showScore: true, participation: { judges: false } } }).owner.showScore === true, 'owner shows score');
pub = call({ action: 'publicResults' });
ok(pub.rows.every(r => typeof r.total === 'number'), 'score shown when owner enables');
ok(call({ action: 'ownerGet', token: O }).owner.participation.judges === false && call({ action: 'ownerGet', token: O }).owner.participation.players === true, 'participation saved/merged');
ok(call({ action: 'ownerSave', token: H, owner: { showScore: false } }).error === 'auth', 'head cannot change owner settings');
ok(call({ action: 'publish', token: H, on: false }).on === false && call({ action: 'publicResults' }).published === false, 'unpublish hides again');
const au = call({ action: 'audit', token: O, q: 'publish', limit: 5 });
ok(au.ok && au.rows.length >= 2 && au.rows[0].action.indexOf('publish') >= 0, 'owner audit search');
ok(call({ action: 'audit', token: H }).error === 'auth', 'head cannot read owner audit');
// الشهادات
{
  const P = book.Players._data, hd = P[0], iEx = hd.indexOf('extra');
  const row = P.find(r => r[hd.indexOf('code')] === 'PTP-2026-0002');
  row[iEx] = JSON.stringify({ phone: '01000000005', email: 'Kid@Example.com', coachCode: 'PTA-2026-0007', coachName: 'مدرب تجريبي', coachPhone: '+20 111 222 3333', coachEmail: 'coach@example.com' });
  const q = { code: 'ptp-2026-0002', phone: '+20 100 000 0005', email: 'kid@example.com' };
  ok(call(Object.assign({ action: 'certLookup' }, q)).error === 'closed', 'certificates closed by default');
  call({ action: 'publish', token: H, on: true });
  call({ action: 'ownerSave', token: O, owner: { showScore: false, certificatesOpen: true, participation: { players: true, coaches: true, judges: true } } });
  ok(call(Object.assign({ action: 'certLookup' }, q, { email: 'wrong@example.com' })).error === 'not_found', 'wrong email rejected');
  ok(call(Object.assign({ action: 'certLookup' }, q, { phone: '01099999999' })).error === 'not_found', 'wrong phone rejected');
  const lk = call(Object.assign({ action: 'certLookup' }, q));
  ok(lk.ok && lk.role === 'player' && lk.player.code === 'PTP-2026-0002' && lk.rankAvailable && lk.participationAvailable && lk.player.total === null, 'lookup ok, score hidden when owner hides it');
  ok(!JSON.stringify(lk).includes('example.com') && !JSON.stringify(lk).includes('01000000005'), 'lookup does not echo contact data');
  const c1 = call(Object.assign({ action: 'certIssue', type: 'rank' }, q));
  ok(c1.ok && /^PTC-2026-[A-Z0-9]{6}$/.test(c1.cert.serial) && c1.cert.type === 'rank' && c1.cert.place === '1' && c1.cert.status === 'active', 'rank cert issued ' + JSON.stringify(c1.cert));
  const c1b = call(Object.assign({ action: 'certIssue', type: 'rank' }, q));
  ok(c1b.existing && c1b.cert.serial === c1.cert.serial, 'issuing again returns same serial');
  const c2 = call(Object.assign({ action: 'certIssue', type: 'participation' }, q));
  ok(c2.ok && c2.cert.serial !== c1.cert.serial && c2.cert.place === '', 'participation cert separate serial');
  ok(call(Object.assign({ action: 'certIssue', type: 'bogus' }, q)).error === 'bad_type', 'bad type');
  // لاعب بدون نتيجة معتمدة
  const none = book.Players._data.find(r => r[hd.indexOf('code')] === 'PTP-2026-0003'); none[iEx] = JSON.stringify({ phone: '0100000000', email: 'n@example.com' });
  ok(call({ action: 'certIssue', type: 'participation', code: 'PTP-2026-0003', phone: '0100000000', email: 'n@example.com' }).error === 'not_ready', 'no approved result -> not_ready');
  // تحقق عام
  const v = call({ action: 'certVerify', serial: c1.cert.serial.toLowerCase() });
  ok(v.found && v.cert.name === c1.cert.name && v.cert.status === 'active' && !JSON.stringify(v).includes('example.com') && !('subject' in v.cert), 'public verify shows recorded data only');
  ok(call({ action: 'certVerify', serial: 'PTC-2026-ZZZZZZ' }).found === false && call({ action: 'certVerify', serial: 'junk' }).found === false, 'verify unknown');
  // مدرب
  const cq = { role: 'coach', code: 'PTA-2026-0007', phone: '01112223333', email: 'COACH@example.com' };
  const cl = call(Object.assign({ action: 'certLookup' }, cq));
  ok(cl.ok && cl.role === 'coach' && cl.coach.name === 'مدرب تجريبي' && cl.players.length === 1 && cl.players[0].place === '1', 'coach lookup lists own athletes');
  ok(call(Object.assign({ action: 'certIssue', type: 'coach' }, cq)).cert.type === 'coach', 'coach cert');
  ok(call(Object.assign({ action: 'certLookup' }, cq, { email: 'x@example.com' })).error === 'not_found', 'coach wrong email');
  // المدرب يقدر يطلب شهادة لاعبه بكود اللاعب + بياناته هو
  ok(call({ action: 'certLookup', code: 'PTP-2026-0002', phone: '01112223333', email: 'coach@example.com' }).player.code === 'PTP-2026-0002', 'coach can open his athlete by athlete code');
  // حكم
  ok(call({ action: 'judgeCert', token: J[0] }).cert.type === 'judge', 'judge participation cert');
  ok(call({ action: 'judgeCert', token: O }).error === 'auth', 'only judges');
  // طلب تصحيح
  ok(call(Object.assign({ action: 'certRequest', text: 'الاسم فيه خطأ' }, q)).ok, 'correction request');
  ok(call(Object.assign({ action: 'certRequest', text: 'x' }, q)).error === 'bad_text', 'correction text too short');
  ok(call({ action: 'corrections', token: H }).error === 'auth', 'head cannot read corrections');
  const cr = call({ action: 'corrections', token: O }).rows;
  ok(cr.length === 1 && cr[0].status === 'open' && cr[0].text === 'الاسم فيه خطأ', 'owner sees correction');
  ok(call({ action: 'resolveCorrection', token: O, cid: cr[0].cid, status: 'done', note: 'تم' }).ok && call({ action: 'corrections', token: O }).rows[0].status === 'done', 'resolve correction');
  // إعادة الإصدار (المالك فقط)
  ok(call({ action: 'reissue', token: H, serial: c1.cert.serial }).error === 'auth', 'head cannot reissue');
  const ri = call({ action: 'reissue', token: O, serial: c1.cert.serial, name: 'اسم مصحَّح' });
  ok(ri.ok && ri.cert.serial !== c1.cert.serial && ri.cert.name === 'اسم مصحَّح', 'reissue with corrected name');
  const vo = call({ action: 'certVerify', serial: c1.cert.serial });
  ok(vo.cert.status === 'replaced' && vo.cert.replacedBy === ri.cert.serial, 'old serial marked replaced -> points to new');
  ok(call(Object.assign({ action: 'certIssue', type: 'rank' }, q)).cert.serial === ri.cert.serial, 'player now gets the new active serial');
  ok(call({ action: 'certList', token: O, q: 'مصحَّح' }).rows.length === 1, 'owner cert list search');
  // الإغلاق يوقف الشهادات
  call({ action: 'ownerSave', token: O, owner: { certificatesOpen: false } });
  ok(call(Object.assign({ action: 'certLookup' }, q)).error === 'closed', 'closing certificates blocks lookup');
  ok(call({ action: 'certVerify', serial: ri.cert.serial }).found, 'verify still works when closed');
  call({ action: 'publish', token: H, on: false });
}
// سجل المراجعة
const audit = book.Audit._data.slice(1);
const acts = new Set(audit.map(r => r[7]));
['register', 'login', 'login_failed', 'invite_created', 'import_players', 'assign', 'video_open', 'deduct', 'speed', 'save', 'submit', 'return', 'approve'].forEach(a => ok(acts.has(a), 'audit has ' + a));
ok(audit.every(r => r[0] && r[1] && r[2] && r[3]), 'audit has ts/day/date/time');
ok(book.Audit._fmt && book.Audit._fmt[1] === '@' && book.Audit._fmt[2] === '@' && book.Audit._fmt[3] === '@' && book.Audit._fmt[4] === '@', 'audit ts/day/date/time columns forced to text');
ok(!JSON.stringify(book.Users._data).includes('password'), 'no plain passwords');
// مسح بيانات التجربة وإعادة التهيئة
const tok = vm.runInContext('resetForProduction()', sandbox);
ok(book.Users._data.length === 1 && book.Players._data.length === 1 && book.Audit._data.length === 1 && book.Assignments._data.length === 1, 'reset clears all data rows');
ok(book.Invites._data.length === 2 && book.Invites._data[1][0] === tok && book.Invites._data[1][1] === 'owner', 'reset creates one fresh owner invite');
ok(call({ action: 'login', email: 'h@x.com', password: 'password2' }).error === 'bad_login', 'old accounts gone after reset');
ok(call({ action: 'resetForProduction' }).error === 'unknown_action', 'reset not exposed via API');
console.log('OK - ' + n + ' checks passed');

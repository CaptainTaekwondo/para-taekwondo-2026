/* رسم الشهادة على canvas بمقاس A4 أفقي (3508×2480 = 300dpi). لا يعتمد على أي مكتبة سوى qrcode-generator للـ QR. */
(function () {
  'use strict';
  var W = 3508, H = 2480, CX = W / 2;
  var FONT_HEAD = '"Reem Kufi","Cairo",sans-serif', FONT_BODY = '"Cairo","Segoe UI",sans-serif';
  var ASSET = (window.CERT_ASSETS || '../assets/');

  var TYPES = {
    rank: { ar: 'شهادة تقدير', en: 'CERTIFICATE OF ACHIEVEMENT', to: 'تُمنح هذه الشهادة إلى' },
    participation: { ar: 'شهادة مشاركة', en: 'CERTIFICATE OF PARTICIPATION', to: 'تُمنح هذه الشهادة إلى' },
    coach: { ar: 'شهادة تقدير للمدرب', en: 'COACH APPRECIATION CERTIFICATE', to: 'تُمنح هذه الشهادة إلى المدرب' },
    judge: { ar: 'شهادة تقدير للحكم', en: 'JUDGE APPRECIATION CERTIFICATE', to: 'تُمنح هذه الشهادة إلى الحكم' }
  };
  var ORD = { 1: 'الأول', 2: 'الثاني', 3: 'الثالث', 4: 'الرابع', 5: 'الخامس', 6: 'السادس', 7: 'السابع', 8: 'الثامن', 9: 'التاسع', 10: 'العاشر' };
  function placeWord(p) { var s = String(p).trim(); return /^\d+$/.test(s) ? (ORD[Number(s)] || ('رقم ' + s)) : s; }

  function loadImg(src) { return new Promise(function (res) { var i = new Image(); i.onload = function () { res(i); }; i.onerror = function () { res(null); }; i.src = src; }); }
  function loadFonts() {
    if (!document.fonts || !document.fonts.load) return Promise.resolve();
    return Promise.all(['400 60px Cairo', '700 60px Cairo', '800 60px Cairo', '700 60px "Reem Kufi"'].map(function (f) { return document.fonts.load(f, 'أبجد ABC 123'); })).catch(function () {});
  }

  function foil(ctx, y0, y1) {
    var g = ctx.createLinearGradient(0, y0, 0, y1);
    g.addColorStop(0, '#fff6c9'); g.addColorStop(.38, '#f6d56b'); g.addColorStop(.66, '#c58a18'); g.addColorStop(1, '#ffe49a'); return g;
  }
  function goldH(ctx, x0, x1) {
    var g = ctx.createLinearGradient(x0, 0, x1, 0);
    g.addColorStop(0, 'rgba(125,82,8,0)'); g.addColorStop(.2, '#c58a18'); g.addColorStop(.5, '#fff6c9'); g.addColorStop(.8, '#c58a18'); g.addColorStop(1, 'rgba(125,82,8,0)'); return g;
  }
  function goldDiag(ctx, x0, y0, x1, y1) {
    var g = ctx.createLinearGradient(x0, y0, x1, y1);
    g.addColorStop(0, '#7d5208'); g.addColorStop(.2, '#f6d56b'); g.addColorStop(.5, '#fff6c9'); g.addColorStop(.8, '#d79a1f'); g.addColorStop(1, '#7d5208'); return g;
  }
  function fitFont(ctx, text, weight, family, maxW, start, min) {
    var s = start; for (; s > min; s -= 4) { ctx.font = weight + ' ' + s + 'px ' + family; if (ctx.measureText(text).width <= maxW) break; } return s;
  }
  function diamond(ctx, x, y, r, fill) { ctx.beginPath(); ctx.moveTo(x, y - r); ctx.lineTo(x + r, y); ctx.lineTo(x, y + r); ctx.lineTo(x - r, y); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); }

  function background(ctx) {
    var g = ctx.createRadialGradient(CX, 1050, 200, CX, 1150, 2300);
    g.addColorStop(0, '#0e2f85'); g.addColorStop(.45, '#071a52'); g.addColorStop(1, '#020717');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // شبكة معينات خفيفة
    ctx.save(); ctx.strokeStyle = 'rgba(244,203,85,.055)'; ctx.lineWidth = 3;
    for (var i = -H; i < W + H; i += 150) { ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i + H, H); ctx.stroke(); ctx.beginPath(); ctx.moveTo(i + H, 0); ctx.lineTo(i, H); ctx.stroke(); }
    ctx.restore();
    // دوائر هندسية كبيرة خلف المحتوى
    ctx.save(); ctx.strokeStyle = 'rgba(244,203,85,.07)'; ctx.lineWidth = 4;
    [900, 1050, 1200, 1350].forEach(function (r) { ctx.beginPath(); ctx.arc(CX, 1240, r, 0, Math.PI * 2); ctx.stroke(); });
    ctx.restore();
    // إضاءة علوية وتعتيم الأطراف
    var v = ctx.createRadialGradient(CX, H / 2, H * .45, CX, H / 2, W * .62);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.55)'); ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
  }

  function frame(ctx) {
    ctx.save();
    ctx.strokeStyle = goldDiag(ctx, 0, 0, W, H); ctx.lineWidth = 16; ctx.strokeRect(62, 62, W - 124, H - 124);
    ctx.lineWidth = 5; ctx.strokeRect(100, 100, W - 200, H - 200);
    ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(244,203,85,.55)'; ctx.strokeRect(130, 130, W - 260, H - 260);
    // زخارف الزوايا
    [[100, 100, 1, 1], [W - 100, 100, -1, 1], [100, H - 100, 1, -1], [W - 100, H - 100, -1, -1]].forEach(function (c) {
      var x = c[0], y = c[1], sx = c[2], sy = c[3];
      ctx.save(); ctx.translate(x, y); ctx.scale(sx, sy);
      ctx.strokeStyle = goldDiag(ctx, 0, 0, 300, 300); ctx.lineWidth = 9;
      ctx.beginPath(); ctx.moveTo(0, 300); ctx.lineTo(0, 150); ctx.arc(150, 150, 150, Math.PI, Math.PI * 1.5); ctx.lineTo(300, 0); ctx.stroke();
      ctx.lineWidth = 4; ctx.beginPath(); ctx.arc(150, 150, 96, Math.PI, Math.PI * 1.5); ctx.stroke();
      diamond(ctx, 150, 150, 26, foil(ctx, 120, 180)); diamond(ctx, 150, 150, 11, '#071a52');
      diamond(ctx, 0, 330, 14, '#f6d56b'); diamond(ctx, 330, 0, 14, '#f6d56b');
      ctx.restore();
    });
    // أنصاف أضلاع في منتصف الأضلاع
    [[CX, 100], [CX, H - 100]].forEach(function (p) { diamond(ctx, p[0], p[1], 30, foil(ctx, p[1] - 30, p[1] + 30)); diamond(ctx, p[0], p[1], 12, '#071a52'); });
    [[100, H / 2], [W - 100, H / 2]].forEach(function (p) { diamond(ctx, p[0], p[1], 24, foil(ctx, p[1] - 24, p[1] + 24)); });
    ctx.restore();
  }

  function divider(ctx, y, w) {
    ctx.save(); ctx.fillStyle = goldH(ctx, CX - w, CX + w); ctx.fillRect(CX - w, y - 3, w * 2, 6);
    diamond(ctx, CX, y, 22, foil(ctx, y - 22, y + 22)); diamond(ctx, CX - 70, y, 11, '#f6d56b'); diamond(ctx, CX + 70, y, 11, '#f6d56b'); ctx.restore();
  }

  function foilText(ctx, text, x, y, font, size) {
    ctx.save(); ctx.font = font; ctx.textAlign = 'center'; ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = 'rgba(40,20,0,.75)'; ctx.fillText(text, x + 5, y + 7);
    ctx.fillStyle = foil(ctx, y - size * .8, y + size * .15); ctx.fillText(text, x, y); ctx.restore();
  }
  function plainText(ctx, text, x, y, font, color, align) {
    ctx.save(); ctx.font = font; ctx.textAlign = align || 'center'; ctx.fillStyle = color; ctx.fillText(text, x, y); ctx.restore();
  }

  function medal(ctx, img, cx, cy, r) {
    var g = ctx.createRadialGradient(cx, cy, r * .6, cx, cy, r * 1.55);
    g.addColorStop(0, 'rgba(255,214,102,.55)'); g.addColorStop(1, 'rgba(255,214,102,0)'); ctx.fillStyle = g; ctx.fillRect(cx - r * 1.6, cy - r * 1.6, r * 3.2, r * 3.2);
    if (img) ctx.drawImage(img, cx - r, cy - r, r * 2, r * 2);
  }

  function seal(ctx, cx, cy, r, big, small, band) {
    // شريطان أحمران
    ctx.save();
    [-1, 1].forEach(function (s) {
      ctx.save(); ctx.translate(cx, cy + r * .55); ctx.rotate(s * .22);
      var g = ctx.createLinearGradient(0, 0, 0, r * 1.5); g.addColorStop(0, '#ff5a66'); g.addColorStop(1, '#8d1620');
      ctx.fillStyle = g; ctx.beginPath(); ctx.moveTo(-r * .32, 0); ctx.lineTo(r * .32, 0); ctx.lineTo(r * .32, r * 1.15); ctx.lineTo(0, r * .95); ctx.lineTo(-r * .32, r * 1.15); ctx.closePath(); ctx.fill();
      ctx.strokeStyle = 'rgba(255,230,160,.6)'; ctx.lineWidth = 4; ctx.stroke(); ctx.restore();
    });
    // حلقة ذهبية مسننة
    ctx.beginPath(); for (var i = 0; i < 48; i++) { var a = i / 48 * Math.PI * 2, rr = r * (i % 2 ? .96 : 1.06); ctx.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } ctx.closePath();
    ctx.fillStyle = foil(ctx, cy - r, cy + r); ctx.fill();
    ctx.beginPath(); ctx.arc(cx, cy, r * .86, 0, Math.PI * 2); ctx.fillStyle = '#071a52'; ctx.fill();
    ctx.lineWidth = 8; ctx.strokeStyle = foil(ctx, cy - r, cy + r); ctx.stroke();
    ctx.beginPath(); ctx.arc(cx, cy, r * .74, 0, Math.PI * 2); ctx.lineWidth = 3; ctx.strokeStyle = 'rgba(244,203,85,.6)'; ctx.stroke();
    ctx.restore();
    if (small) plainText(ctx, small, cx, cy - r * .36, '700 ' + Math.round(r * .26) + 'px ' + FONT_BODY, '#f6d56b');
    var size = fitFont(ctx, big, '800', FONT_HEAD, r * 1.28, Math.round(r * .8), 40);
    foilText(ctx, big, cx, cy + (small ? r * .3 : r * .22), '800 ' + size + 'px ' + FONT_HEAD, size);
    if (band) plainText(ctx, band, cx, cy + r * .62, '700 ' + Math.round(r * .24) + 'px ' + FONT_BODY, '#e8eefc');
  }

  function signature(ctx, cx, y, name, title) {
    ctx.save(); ctx.fillStyle = goldH(ctx, cx - 360, cx + 360); ctx.fillRect(cx - 360, y, 720, 5); ctx.restore();
    plainText(ctx, name, cx, y + 80, '800 58px ' + FONT_BODY, '#f5f2ea');
    plainText(ctx, title, cx, y + 142, '600 44px ' + FONT_BODY, '#c9a24a');
  }

  function qrBlock(ctx, x, y, size, url, serial) {
    ctx.save();
    ctx.fillStyle = goldDiag(ctx, x - 30, y - 30, x + size + 30, y + size + 30); ctx.fillRect(x - 28, y - 28, size + 56, size + 56);
    ctx.fillStyle = '#ffffff'; ctx.fillRect(x - 12, y - 12, size + 24, size + 24);
    if (window.qrcode) {
      try {
        var q = window.qrcode(0, 'M'); q.addData(url); q.make(); var n = q.getModuleCount(), cell = size / n;
        ctx.fillStyle = '#071a52';
        for (var r = 0; r < n; r++) for (var c = 0; c < n; c++) if (q.isDark(r, c)) ctx.fillRect(Math.floor(x + c * cell), Math.floor(y + r * cell), Math.ceil(cell), Math.ceil(cell));
      } catch (e) {}
    }
    ctx.restore();
    plainText(ctx, serial, x + size / 2, y + size + 96, '700 46px Consolas,"Courier New",monospace', '#f6d56b');
    plainText(ctx, 'امسح الرمز للتحقق من صحة الشهادة', x + size / 2, y + size + 150, '600 36px ' + FONT_BODY, '#aab9de');
  }

  function body(ctx, cert, y) {
    var t = cert.type, tn = cert.tournament || 'بطولة أساسيات البارا تايكوندو 2026';
    var l1 = '', l2 = '', det = [];
    if (t === 'rank') {
      l1 = 'تقديرًا للأداء المتميز، وحصولًا على المركز ' + (cert.place ? placeWord(cert.place) : '') + (cert.band ? (cert.place ? ' بمستوى ' : 'المستوى ') + cert.band : '');
      if (!cert.place) l1 = 'تقديرًا للأداء المتميز، وحصولًا على المستوى ' + cert.band;
      l2 = 'في ' + tn;
      det = [cert.section && ('القسم: ' + cert.section), cert.groupName && ('الفئة: ' + cert.groupName), cert.classCode && ('التصنيف: ' + cert.classCode)];
      if (cert.total !== null && cert.total !== undefined) det.push('الدرجة النهائية: ' + Number(cert.total).toFixed(2));
    } else if (t === 'participation') {
      l1 = 'تقديرًا للمشاركة الفاعلة وروح التحدي في'; l2 = tn;
      det = [cert.section && ('القسم: ' + cert.section), cert.groupName && ('الفئة: ' + cert.groupName), cert.classCode && ('التصنيف: ' + cert.classCode)];
    } else if (t === 'coach') {
      l1 = 'تقديرًا لجهوده في إعداد الأبطال ومرافقتهم خلال'; l2 = tn;
    } else {
      l1 = 'تقديرًا لجهوده ونزاهته في تحكيم منافسات'; l2 = tn;
    }
    plainText(ctx, l1, CX, y, '600 66px ' + FONT_BODY, '#f5f2ea');
    plainText(ctx, l2, CX, y + 96, '700 70px ' + FONT_BODY, '#f6d56b');
    var d = det.filter(Boolean).join('   ✦   ');
    if (d) plainText(ctx, d, CX, y + 190, '600 52px ' + FONT_BODY, '#aab9de');
  }

  function fmtDate(iso) {
    try { return new Date(iso).toLocaleDateString('ar-EG-u-nu-latn', { year: 'numeric', month: 'long', day: 'numeric' }); } catch (e) { return String(iso || '').slice(0, 10); }
  }

  /* draw(canvas, cert, {verifyUrl, team:[{name,title},{name,title}]}) */
  function draw(canvas, cert, opts) {
    opts = opts || {}; canvas.width = W; canvas.height = H;
    var ctx = canvas.getContext('2d'), T = TYPES[cert.type] || TYPES.participation;
    return Promise.all([loadFonts(), loadImg(ASSET + 'champion.webp'), loadImg(ASSET + 'captain.webp'), loadImg(ASSET + 'sportland.webp')]).then(function (r) {
      ctx.direction = 'rtl';
      background(ctx); frame(ctx);
      medal(ctx, r[1], CX, 430, 270);
      if (r[2]) ctx.drawImage(r[2], 400, 300, 260, 260);
      if (r[3]) ctx.drawImage(r[3], W - 660, 300, 260, 260);
      foilText(ctx, T.ar, CX, 960, '700 250px ' + FONT_HEAD, 250);
      ctx.save(); ctx.font = '600 52px ' + FONT_BODY; if ('letterSpacing' in ctx) ctx.letterSpacing = '14px'; ctx.textAlign = 'center'; ctx.fillStyle = '#c9a24a'; ctx.direction = 'ltr'; ctx.fillText(T.en, CX, 1050); ctx.restore();
      divider(ctx, 1120, 760);
      plainText(ctx, T.to, CX, 1230, '600 62px ' + FONT_BODY, '#aab9de');
      var nm = String(cert.name || ''), size = fitFont(ctx, nm, '800', FONT_BODY, 2500, 210, 90);
      ctx.save(); ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 24; ctx.shadowOffsetY = 8; plainText(ctx, nm, CX, 1440, '800 ' + size + 'px ' + FONT_BODY, '#ffffff'); ctx.restore();
      var wName = Math.min(2700, ctx.measureText(nm).width + 260);
      ctx.save(); ctx.fillStyle = goldH(ctx, CX - wName / 2, CX + wName / 2); ctx.fillRect(CX - wName / 2, 1488, wName, 6); ctx.restore();
      body(ctx, cert, 1595);
      var big, small, band = '';
      if (cert.type === 'rank') { big = cert.place ? String(cert.place) : (cert.band || '★'); small = cert.place && /^\d+$/.test(String(cert.place)) ? 'المركز' : ''; band = cert.place && cert.band ? cert.band : ''; }
      else { big = '★'; small = cert.type === 'participation' ? 'مشاركة' : (cert.type === 'coach' ? 'مدرب' : 'تحكيم'); }
      seal(ctx, CX, 2015, 175, big, small, band);
      var team = opts.team || [{ name: 'الكابتن إبراهيم الحاج', title: 'مدير البطولة وصاحب المبادرة' }, { name: 'الحكم الدولي علي نور', title: 'رئيس لجنة الحكام' }];
      signature(ctx, 1130, 2185, team[0].name, team[0].title); signature(ctx, W - 1130, 2185, team[1].name, team[1].title);
      qrBlock(ctx, 400, 1740, 250, opts.verifyUrl || '', cert.serial || '');
      plainText(ctx, 'تاريخ الإصدار', W - 520, 1900, '600 40px ' + FONT_BODY, '#aab9de');
      plainText(ctx, fmtDate(cert.issued), W - 520, 1970, '800 54px ' + FONT_BODY, '#f5f2ea');
      plainText(ctx, 'Captain Taekwondo  ·  SportLand', W - 520, 2050, '600 38px ' + FONT_BODY, '#c9a24a');
      if (cert.status === 'replaced') {
        ctx.save(); ctx.translate(CX, H / 2); ctx.rotate(-.35); ctx.font = '800 380px ' + FONT_HEAD; ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(217,32,47,.28)'; ctx.fillText('ملغاة', 0, 0); ctx.restore();
      }
      return canvas;
    });
  }
  window.CertRender = { draw: draw, W: W, H: H, TYPES: TYPES };
})();

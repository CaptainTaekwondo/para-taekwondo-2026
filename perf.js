/* مستوى الأداء: full أو low. بيقيس النت (Network Information + تحميل ملف صغير) وقدرة الجهاز (ذاكرة/معالج + قياس fps حقيقي).
   النتيجة: <html class="fx-low"> للجهاز/النت الضعيف (إضاءة أخف بنفس الشكل)، و"lite" للنت الضعيف (صور أخف).
   للتجربة: ?fx=low أو ?fx=full — القرار بيتحفظ في sessionStorage عشان ما يتغيّرش وسط التصفح. */
(function () {
  var d = document.documentElement, KEY = "fxTier";
  function set(t, net) {
    d.classList.toggle("fx-low", t === "low");
    if (net) d.classList.add("lite");
    try { sessionStorage.setItem(KEY, t); } catch (e) {}
    window.dispatchEvent(new Event("fxtier"));
  }
  var q = /[?&]fx=(low|full)/.exec(location.search);
  if (q) return set(q[1]);
  var saved; try { saved = sessionStorage.getItem(KEY); } catch (e) {}
  if (saved) { d.classList.toggle("fx-low", saved === "low"); return; }
  var c = navigator.connection || {}, slow = c.saveData || /2g|3g/.test(c.effectiveType || "") || (c.downlink && c.downlink < 1.5);
  var weak = (navigator.deviceMemory && navigator.deviceMemory <= 2) || (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 2);
  if (slow || weak) set("low", slow);
  else d.classList.remove("fx-low");
  /* قياس fps حقيقي بعد ما الصفحة تفتح (ثانية ونص تقريبًا) */
  function probe() {
    var n = 0, t0 = 0;
    function f(t) {
      if (!t0) t0 = t;
      n++;
      if (t - t0 < 1200) return requestAnimationFrame(f);
      var fps = n * 1000 / (t - t0);
      if (document.hidden) return;
      if (fps < 28) set("low", false); else if (!d.classList.contains("fx-low")) try { sessionStorage.setItem(KEY, "full"); } catch (e) {}
    }
    requestAnimationFrame(f);
  }
  /* قياس سرعة التحميل الفعلية: ملف الصورة الخفيفة (يُحمّل مرة) */
  function speed() {
    if (c.effectiveType) return;
    var t = performance.now(), im = new Image();
    im.onload = function () { var ms = performance.now() - t; if (ms > 1800) set("low", true); };
    im.src = "assets/champion-lite.webp?s=" + t;
  }
  addEventListener("load", function () { setTimeout(function () { probe(); speed(); }, 600); });
})();

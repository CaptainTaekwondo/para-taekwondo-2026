import subprocess,time,json,os,shutil,re,base64
from playwright.sync_api import sync_playwright
SP=os.getcwd();DUR=json.load(open('dur.json'));GAP=0.35
order=['02','03','04','05','06','07','08','09','10','11']
S={};t=0.0
for n in order: S[n]=(t,t+DUR[n]);t+=DUR[n]+GAP
json.dump(S,open('sched.json','w'));TOTAL=t
VD=SP+'/vid';shutil.rmtree(VD,ignore_errors=True)
srv=subprocess.Popen(["python3","-m","http.server","8798","-d","/mnt/user-data/outputs/site"],stdout=subprocess.DEVNULL,stderr=subprocess.DEVNULL);time.sleep(1)
U="http://localhost:8798/";PHOTO=SP+"/../sample-photo.jpg"
b64=lambda p:base64.b64encode(open(p,'rb').read()).decode()
HOME=b64('gpt_home.jpg');SAMPLE=b64('sample-photo.jpg')
def api(route):
    d=json.loads(route.request.post_data);a=d["action"];r={"ok":True}
    if a=="register": r={"ok":True,"code":"PTA-2026-0004"}
    if a=="sendcode": r={"ok":True}
    if a=="lookup": r={"ok":True,"code":d["code"],"data":{"nameAr":"أحمد محمد علي","nameEn":"Ahmed Mohamed Ali","countryAr":"مصر","countryEn":"Egypt","clubAr":"أكاديمية النصر","clubEn":"Al Nasr Academy","champions":"6","promo":"no","whatsapp":"","coachInVideo":"no","photo":""}}
    if a=="update": r={"ok":True,"code":d["code"]}
    route.fulfill(status=200,headers={"access-control-allow-origin":"*","content-type":"text/plain"},body=json.dumps(r))
INIT="""(()=>{function boot(){if(document.getElementById('__cur'))return;
const c=document.createElement('div');c.id='__cur';c.style.cssText='position:fixed;z-index:2147483647;width:34px;height:34px;border-radius:50%;background:rgba(255,59,59,.55);border:3px solid #fff;pointer-events:none;left:-50px;top:-50px;transform:translate(-50%,-50%)';document.body.appendChild(c);
addEventListener('mousemove',e=>{c.style.left=e.clientX+'px';c.style.top=e.clientY+'px'},true);
addEventListener('touchmove',e=>{const t=e.touches[0];c.style.left=t.clientX+'px';c.style.top=t.clientY+'px'},true);}
if(document.body)boot();else addEventListener('DOMContentLoaded',boot);
window.open=()=>null;})();"""
GPT=r"""(([HOME,SAMPLE])=>{
const css='position:fixed;inset:0;z-index:2147483000;background:#fff;color:#111;font:600 15px/1.7 Cairo,Tahoma,sans-serif;direction:rtl;overflow:hidden';
window.__gpt=(st)=>{let o=document.getElementById('__gptov');if(!st&&st!==0){if(o)o.remove();return}
if(!o){o=document.createElement('div');o.id='__gptov';o.style.cssText=css;document.body.appendChild(o)}
const hdr='<div style="padding:12px 16px;border-bottom:1px solid #eee;text-align:center;font-weight:800;color:#444">ChatGPT</div>';
const bub=(t,me)=>`<div style="margin:10px 14px;display:flex;justify-content:${me?'flex-start':'flex-end'}"><div style="max-width:88%;padding:10px 14px;border-radius:18px;background:${me?'#f0f0f0':'transparent'};direction:rtl;text-align:right;${me?'':'color:#222'}">${t}</div></div>`;
const comp=(inner)=>`<div style="position:absolute;left:12px;right:12px;bottom:14px;border:1px solid #ddd;border-radius:28px;background:#fff;box-shadow:0 2px 10px #0002;padding:10px 14px;min-height:44px">${inner}</div>`;
const send='<div style="position:absolute;left:10px;bottom:8px;width:38px;height:38px;border-radius:50%;background:#111;color:#fff;text-align:center;line-height:38px;font-size:20px;outline:4px solid #f0b93c;animation:p 1s infinite">↑</div><style>@keyframes p{50%{transform:scale(1.18)}}</style>';
let h=hdr;
if(st===0) h=`<img src="data:image/jpeg;base64,${HOME}" style="width:100%;height:100%;object-fit:cover;object-position:bottom">`+`<div style="position:absolute;left:14px;right:14px;bottom:30px;height:46px;border-radius:24px;background:#fff;direction:rtl;padding:9px 56px 0 14px;color:#111;font-weight:700;font-size:15px;overflow:hidden;white-space:nowrap">🥋 ULTIMATE PROFESSIONAL TAEKWONDO PORTRAIT STUDIO …</div>`;
if(st===1) h+=bub('🥋 ULTIMATE PROFESSIONAL TAEKWONDO PORTRAIT STUDIO<br><span style="color:#888">(الأمر الجاهز اللي نسخته)</span>',true)+bub('أهلاً بيك في استوديو بورتريه التايكوندو الاحترافي 🥋<br>ارفع صورتك الشخصية…<br>مستني صورتك عشان نبدأ.',false);
if(st===2) h+=bub('أهلاً بيك في استوديو بورتريه التايكوندو الاحترافي 🥋<br>ارفع صورتك الشخصية…',false)+comp(`<img src="data:image/jpeg;base64,${SAMPLE}" style="width:58px;height:58px;border-radius:12px;object-fit:cover;float:right"><div style="clear:both"></div>`+send)+`<div style="position:absolute;right:20px;bottom:100px;background:#f0b93c;color:#071535;border-radius:12px;padding:4px 12px;font-weight:800;font-size:14px">أرسل بس… من غير كتابة!</div>`;
if(st===3) h+=bub('تمام! اختار ماركة بدلة التايكوندو:',false)+bub('ADIDAS · MOOTO · DAEDO<br>KWON · TUSAH · SMAI<br>JCALICU · ماركة أخرى',false)+comp('<span style="color:#999">اختار الماركة…</span>'+send);
if(st===4) h+=bub('الصورة الشخصية: تم الاستلام ✅<br>ماركة البدلة: ADIDAS<br>لون البدلة: أبيض بياقة سوداء<br>تطريز الحزام: اسمك<br>درجة الحزام: دان أول',false)+bub('<b>هل تؤكد الاختيارات دي ونبدأ إنشاء الصورة؟</b>',false)+comp('<span style="color:#999">أؤكد ✔</span>'+send);
if(st===5) h+=`<div style="padding:16px;text-align:center"><div style="display:inline-block;padding:10px;border-radius:18px;background:linear-gradient(135deg,#f7d56a,#b88a1e);"><img src="data:image/jpeg;base64,${SAMPLE}" style="width:260px;height:325px;object-fit:cover;border-radius:10px;display:block"></div><div style="margin-top:12px;font-weight:800;color:#222">صورتك الاحترافية جاهزة! 🥋<br><span style="font-weight:600;color:#666">(مثال توضيحي)</span></div></div>`;
o.innerHTML=h};})"""
with sync_playwright() as p:
    b=p.chromium.launch()
    ctx=b.new_context(viewport={"width":1080,"height":1380},is_mobile=True,has_touch=True,device_scale_factor=1,record_video_dir=VD,record_video_size={"width":1080,"height":1380},locale="ar-EG")
    ctx.add_init_script(INIT)
    pg=ctx.new_page();tc=time.time();t0=tc;now=lambda:time.time()-t0
    def fix(route):
        r=route.fetch();body=r.text();body=re.sub(r'<meta[^>]*name="viewport"[^>]*>','<meta name="viewport" content="width=405">',body);route.fulfill(response=r,body=body)
    pg.route("**/*.html",fix);pg.route(U,fix)
    pg.route("https://api.test/**",api)
    pg.route("**/config.js*",lambda r:r.fulfill(body='window.CONFIG={cardApi:"https://api.test/x",coachCard:"assets/coach-card-v5.webp"};',content_type="application/javascript"))
    def until(x):
        d=x-now()
        if d>0: pg.wait_for_timeout(int(d*1000))
        else: print('LATE',round(-d,2),'at',x)
    def go(sel,steps=12):
        el=pg.locator(sel).first;el.scroll_into_view_if_needed();bb=el.bounding_box()
        pg.mouse.move(bb["x"]+bb["width"]/2,bb["y"]+bb["height"]/2,steps=steps);pg.wait_for_timeout(120)
    def click(sel):
        go(sel);pg.mouse.down();pg.wait_for_timeout(80);pg.mouse.up();pg.wait_for_timeout(300)
    def center(sel): pg.evaluate("s=>document.querySelector(s).scrollIntoView({behavior:'smooth',block:'center'})",sel);pg.wait_for_timeout(900)
    def typ(sel,text,d=30):
        go(sel);pg.mouse.down();pg.mouse.up();pg.locator(sel).first.fill("");pg.locator(sel).first.press_sequentially(text,delay=d);pg.wait_for_timeout(200)
    pg.goto(U+"index.html");pg.wait_for_timeout(1500);t0=time.time();json.dump({"off":t0-tc},open("off.json","w"))
    # scene 02
    s,e=S['02']
    click("#menuBtn");click("#links a[href='#certs']");pg.wait_for_timeout(500);center(".regbtn");click(".regbtn");pg.wait_for_url("**/card.html");pg.wait_for_timeout(300)
    click("#btnNew");until(e)
    # scene 03
    s,e=S['03'];until(s);center("#f_nameAr")
    typ("#f_nameAr","أحمد محمد علي");typ("#f_nameEn","Ahmed Mohamed Ali");[pg.locator(k).fill(v) for k,v in (("#f_countryAr","مصر"),("#f_countryEn","Egypt"),("#f_clubAr","أكاديمية النصر"),("#f_clubEn","Al Nasr Academy"))];pg.evaluate("window.scrollTo({top:0,behavior:'smooth'})");until(e)
    # scene 04
    s,e=S['04'];until(s);center("#f_email");typ("#f_email","ahmed@example.com");until(s+2.4);center("#f_phone");typ("#f_phone","+20 100 123 4567");until(s+4.7);center("#f_champions");typ("#f_champions","6");until(s+14.6);typ("#f_champions","0");until(e)
    # scene 05
    s,e=S['05'];until(s);click("#btnSendCode");pg.wait_for_timeout(600);typ("#f_vcode","482915",90);until(e)
    # scene 06
    s,e=S['06'];until(s);go("#f_photo");pg.set_input_files("#f_photo",PHOTO);pg.wait_for_timeout(1000)
    center("#card");bb=pg.locator("#card").bounding_box()
    x=bb["x"]+bb["width"]*.3;y=bb["y"]+bb["height"]*.55
    pg.mouse.move(x,y,steps=18);pg.mouse.down();pg.mouse.move(x+40,y+45,steps=25);pg.mouse.move(x-10,y+10,steps=25);pg.mouse.move(x+25,y+30,steps=20);pg.mouse.up()
    pg.evaluate("document.querySelector('#f_zoom').value=1.5;document.querySelector('#f_zoom').dispatchEvent(new Event('input',{bubbles:true}))");pg.wait_for_timeout(600)
    center("#f_zoom");until(e)
    # scene 07
    s,e=S['07'];until(s)
    center("#aiBtn");click("#aiBtn");pg.wait_for_timeout(500)
    center("#aiGo");pg.wait_for_timeout(500)
    click("#aiCopy");until(s+9.0)
    click("#aiGo");T7=now()-s
    pg.evaluate('a=>{const f='+GPT+';f(a)}',[HOME,SAMPLE])
    gts=[(s+10.5,0),(s+14.5,1),(s+19.0,2),(s+23.5,3),(s+27.0,4),(s+30.5,5)]
    for tt,st in gts: until(tt);pg.evaluate("s=>window.__gpt(s)",st)
    until(e);pg.evaluate("()=>window.__gpt(null)")
    json.dump({'T7_click':T7},open('t7.json','w'))
    # scene 08
    LB="(src)=>{let o=document.getElementById('__lb');if(!src){if(o)o.remove();return}if(!o){o=document.createElement('div');o.id='__lb';o.style.cssText='position:fixed;left:0;right:0;top:130px;z-index:2147483000;display:flex;justify-content:center;padding:0 10px;animation:lbin .35s ease';const st=document.createElement('style');st.textContent='@keyframes lbin{from{opacity:0;transform:scale(.92)}to{opacity:1;transform:none}}';document.head.appendChild(st);document.body.appendChild(o)}o.innerHTML='<img src=\"'+src+'\" style=\"width:100%;border-radius:18px;border:3px solid #f0b93c;box-shadow:0 20px 60px rgba(0,0,0,.7)\">'}"
    s,e=S['08'];until(s);center("#promoBox");until(s+6.5);click("input[name=promo][value=yes]");typ("#f_wa","+20 100 123 4567");until(s+10.0);pg.evaluate(LB,"assets/card/promo-player.webp");until(s+18.2);pg.evaluate(LB,None);pg.wait_for_timeout(300);until(s+20.3);center("#f_coachVid");click("#f_coachVid");until(s+25.5);pg.evaluate(LB,"assets/card/promo-coach.webp");until(e-0.6);pg.evaluate(LB,None)
    # scene 09
    s,e=S['09'];until(s);center("#f_consent");until(s+10.4);click("#f_consent");until(s+11.9);click("#submitBtn");pg.wait_for_timeout(2200);until(e)
    # scene 10
    s,e=S['10'];until(s);center("#dlPng");go("#dlPng");until(e)
    # scene 11
    s,e=S['11'];until(s);pg.goto(U+"card.html");pg.wait_for_timeout(500);until(s+1.8);click("#btnEdit")
    if pg.locator("#lookupBox").is_hidden(): pg.click("#btnEdit")
    typ("#f_lkPhone","+20 100 123 4567",18);typ("#f_lkEmail","ahmed@example.com",18);typ("#f_lkCode","0004",40);until(s+7.4);click("#lkBtn");pg.wait_for_timeout(900);pg.evaluate("()=>{const b=document.getElementById('editBadge');if(b)b.scrollIntoView({behavior:'smooth',block:'center'})}");until(e)
    pg.wait_for_timeout(500)
    ctx.close();b.close()
srv.kill()
print('total',TOTAL)

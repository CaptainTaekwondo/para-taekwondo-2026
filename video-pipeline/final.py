import json,subprocess,os,sys
D=json.load(open('dur.json'));S=json.load(open('sched.json'));SB=json.load(open('subs.json'))
BASE=SB['BASE'];OUT0=SB['OUT0'];TOT=OUT0+36.03
names={'02':'١ · الدخول والبدء','03':'٢ · البيانات الأساسية','04':'٣ · الإيميل والهاتف','05':'٤ · كود التأكيد','06':'٥ · الصورة الشخصية','07':'٦ · صورة احترافية AI','08':'٧ · الفيديو الترويجي','09':'٨ · الإقرار والحفظ','10':'٩ · تحميل البطاقة','11':'١٠ · تعديل البطاقة'}
st={n:BASE+S[n][0] for n in names}
# 1. badges PNG
from playwright.sync_api import sync_playwright
os.makedirs('badges',exist_ok=True)
html='<html><body style="margin:0;background:transparent"><div id=b style="display:inline-block;direction:rtl;font:800 34px Cairo,Tahoma,sans-serif;color:#1a1200;background:linear-gradient(135deg,#ffe28a,#f0b93c 55%,#c98d12);padding:14px 30px;border-radius:40px;border:3px solid #fff3c4;box-shadow:0 6px 18px rgba(0,0,0,.55);white-space:nowrap"></div></body></html>'
with sync_playwright() as p:
    b=p.chromium.launch();pg=b.new_page(viewport={'width':700,'height':120},device_scale_factor=1);pg.set_content(html)
    for n,t in names.items():
        pg.evaluate("t=>document.getElementById('b').textContent=t",t)
        el=pg.locator('#b');el.screenshot(path=f'badges/{n}.png',omit_background=True)
    b.close()
from PIL import Image
for n in names: print(n,Image.open(f'badges/{n}.png').size)
# 2. video filter graph
inputs=['-i','base_video.mp4','-i','subs.mov']+sum([['-i',f'badges/{n}.png'] for n in names],[])+['-f','lavfi','-i','color=c=0xF0B93C:s=1080x8:r=30']
fc=[];cur='[0:v]'
# flashes on screen scene starts
chain=cur
fl=','.join(f"drawbox=x=0:y=0:w=iw:h=1380:color=white@0.5:t=fill:enable='between(t,{st[n]:.2f},{st[n]+0.12:.2f})'" for n in names)
fc.append(f"{chain}{fl}[v0]");cur='[v0]'
for i,n in enumerate(names):
    a=st[n]+0.15;e=a+4.6;idx=2+i
    nxt=f'[v{i+1}]'
    fc.append(f"{cur}[{idx}:v]overlay=x='W-w-28+(w+60)*pow(1-min(1,max(0,t-{a:.2f})/0.35),2)':y=1398:enable='between(t,{a:.2f},{e:.2f})'{nxt}");cur=nxt
bar=2+len(names)
fc.append(f"{cur}[{bar}:v]overlay=x='-W+W*(t-{BASE:.2f})/{OUT0-BASE:.2f}':y=1912:enable='between(t,{BASE:.2f},{OUT0:.2f})'[vb]")
fc.append(f"[vb][1:v]overlay=0:1720:eof_action=pass[vout]")
json.dump({'inputs':inputs,'fc':';'.join(fc)},open('final_plan.json','w'))
print('plan ok',TOT)

import json,math,random,subprocess,numpy as np
from PIL import Image,ImageDraw
D=json.load(open('dur.json'));S=json.load(open('sched.json'));T7=json.load(open('t7.json'))['T7_click']
W,H,FPS=1080,540,30;TOTAL=sum(D[n]+0.35 for n in S)
random.seed(2)
yy,xx=np.mgrid[0:H,0:W];d=np.sqrt(((xx-W/2)/(W*.7))**2+((yy-H*.55)/(H*.9))**2);dd=np.clip(d,0,1)[...,None]
bg=(np.array([14,42,119])*(1-dd)+np.array([3,10,36])*dd).astype(np.uint8)
BG=Image.fromarray(bg).convert('RGBA');g=ImageDraw.Draw(BG)
for i in range(45):
    x,y=random.randint(0,W),random.randint(10,H);r=random.choice([1,1,2,3]);g.ellipse([x-r,y-r,x+r,y+r],fill=(240,185,60,random.randint(60,160)))
g.rectangle([0,0,W,5],fill=(240,185,60,255));g.rectangle([0,H-4,W,H],fill=(4,12,40,255))
def load(n,h=400):
    im=Image.open(f'poses/pose_{n}.png').convert('RGBA');oh=im.size[1];r=im.resize((int(im.size[0]*h/im.size[1]),h),Image.LANCZOS);import fixpose;return fixpose.fix(r,f'poses/pose_{n}.png',oh)
P={}
def pose(n):
    if n not in P:P[n]=load(n)
    return P[n]
# per scene: list of (fraction_start,pose)
TL={'02':[(0,'point')],'03':[(0,'front'),(.55,'thumb')],'04':[(0,'phone')],'05':[(0,'point'),(.55,'wave')],
'06':[(0,'pull_left'),(.55,'wipe_sweat')],'07':[(0,'point'),(.27,'foot_press'),(.36,'laugh_fists'),(.45,'phone'),(.8,'thumb')],
'08':[(0,'point'),(.45,'walk'),(.75,'jump')],'09':[(0,'front'),(.35,'point'),(.62,'celebrate')],'10':[(0,'thumb')],'11':[(0,'point')]}
conf=[(random.uniform(150,930),random.uniform(-300,0),random.uniform(60,140),random.choice([(240,185,60),(255,255,255),(220,50,60),(80,160,255)])) for _ in range(70)]
def scene_at(t):
    for n,(a,b) in S.items():
        if a<=t<b+0.35: return n,a,b
    return '11',S['11'][0],S['11'][1]
ff=subprocess.Popen(['ffmpeg','-loglevel','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-c:v','libx264','-crf','18','-preset','veryfast','-pix_fmt','yuv420p','panel.mp4'],stdin=subprocess.PIPE)
for f in range(int(TOTAL*FPS)):
    t=f/FPS;n,a,b=scene_at(t);fr=min(1,max(0,(t-a)/(b-a)))
    name=[p for fs,p in TL[n] if fr>=fs][-1];start=[fs for fs,p in TL[n] if fr>=fs][-1]*(b-a)+a
    lt=t-start;im=pose(name)
    s=1+0.10*math.exp(-lt*8)*math.cos(lt*24) # pop on pose change
    bob=math.sin(t*8)*6;rot=math.sin(t*4.5)*1.6
    if name=='jump': bob=-abs(math.sin(lt*7))*40
    x=W/2;ybase=H-60
    if name=='foot_press': x=W/2-30
    w,h=im.size;sim=im.resize((int(w*s),int(h*s)),Image.BILINEAR).rotate(rot,expand=True,resample=Image.BILINEAR,center=(int(w*s)//2,int(h*s)))
    cv=BG.copy()
    sh=Image.new('RGBA',(W,H),(0,0,0,0));ImageDraw.Draw(sh).ellipse([x-130,ybase-10,x+130,ybase+16],fill=(0,0,0,110));cv.alpha_composite(sh)
    cv.alpha_composite(sim,(int(x-sim.size[0]/2),int(ybase-sim.size[1]+bob)))
    if name=='foot_press' and lt<1.0:
        gd=ImageDraw.Draw(cv);r0=40+lt*160
        for j in range(12):
            an=j*math.pi/6;gd.line([x+190+math.cos(an)*r0,ybase-40+math.sin(an)*r0*0.6,x+190+math.cos(an)*(r0+30),ybase-40+math.sin(an)*(r0+30)*0.6],fill=(255,220,100,255),width=5)
    if name=='celebrate' or (n=='09' and fr>0.8):
        gd=ImageDraw.Draw(cv);tt=max(0,t-(a+0.62*(b-a)))
        for cx,cy,sp,col in conf:
            y_=cy+tt*sp*4+ (tt*sp*0)
            if 0<y_<H: gd.rectangle([cx,y_,cx+9,y_+14],fill=col+(255,))
    ff.stdin.write(cv.convert('RGB').tobytes())
ff.stdin.close();ff.wait();print('panel done',TOTAL)

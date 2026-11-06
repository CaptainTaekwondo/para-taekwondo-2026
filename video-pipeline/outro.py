import json,math,random,subprocess,numpy as np,re
from PIL import Image,ImageDraw
from texts import T
D=json.load(open('dur.json'))
W,H,FPS=1080,1920,30;DUR=D['12'];END=3.4;TOT=DUR+END
random.seed(7)
# phase boundaries from sentence lengths
sents=[s for s in re.split(r'(?<=[\.!\?؟])\s+',T['12']) if s]
L=[len(s) for s in sents];tot=sum(L);cum=[0]
for l in L:cum.append(cum[-1]+l)
tm=[DUR*c/tot for c in cum];print([round(x,1) for x in tm],sents[:3])
# sentences: 0 thanks captain,1 Ibrahim/Ali/all,2 Hosny,3 code,4 call,5.. rest
tA=(0,tm[1]);tB=(tm[1],tm[3]);tC=(tm[3],tm[4]);tD=(tm[4],DUR)
yy,xx=np.mgrid[0:H,0:W];d=np.sqrt(((xx-W/2)/(W*.7))**2+((yy-H*.45)/(H*.8))**2);dd=np.clip(d,0,1)[...,None]
bg=(np.array([14,42,119])*(1-dd)+np.array([3,10,36])*dd).astype(np.uint8)
BG=Image.fromarray(bg).convert('RGBA');g=ImageDraw.Draw(BG)
for i in range(110):
    x,y=random.randint(0,W),random.randint(0,H);r=random.choice([1,1,2,3]);g.ellipse([x-r,y-r,x+r,y+r],fill=(240,185,60,random.randint(60,160)))
def ld(p,h=None,w=None):
    im=Image.open(p).convert('RGBA');oh=im.size[1]
    if h: im=im.resize((int(im.size[0]*h/im.size[1]),h),Image.LANCZOS)
    if w: im=im.resize((w,int(im.size[1]*w/im.size[0])),Image.LANCZOS)
    import fixpose;return fixpose.fix(im,p,oh)
A='/mnt/user-data/outputs/site/assets/'
cap=ld(A+'captain.webp',w=480);lock=ld(A+'lockup.webp',h=1000);capS=ld(A+'captain.webp',w=250);sl=ld(A+'sportland.webp',w=250)
ch={k:ld(f'chips/{k}.png') for k in ['thanks','ibrahim','ali','hosny','all','code','call','tag']}
PO={k:ld(f'poses/pose_{k}.png',h=800) for k in ['bow','thumb','gift','celebrate','wave','front','point']}
conf=[(random.uniform(50,1030),random.uniform(-600,0),random.uniform(80,200),random.choice([(240,185,60),(255,255,255),(220,50,60),(80,160,255)])) for _ in range(110)]
def eob(t):
    c1=1.70158;c3=c1+1;t=min(1,max(0,t));return 1+c3*(t-1)**3+c1*(t-1)**2
def put(cv,im,cx,cy,sc=1,al=1):
    if sc!=1: im=im.resize((max(1,int(im.size[0]*sc)),max(1,int(im.size[1]*sc))),Image.BILINEAR)
    if al<1: a=im.split()[3].point(lambda v:int(v*al));im=im.copy();im.putalpha(a)
    cv.alpha_composite(im,(int(cx-im.size[0]/2),int(cy-im.size[1]/2))) if 0<=cx<=W and 0<=cy<=H+900 else None
def show(cv,im,cx,cy,t,t0,al=1):
    if t<t0: return
    k=eob((t-t0)/0.45);put(cv,im,cx,cy,max(0.05,k),al)
ff=subprocess.Popen(['ffmpeg','-loglevel','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-c:v','libx264','-crf','18','-preset','veryfast','-pix_fmt','yuv420p','outro_m.mp4'],stdin=subprocess.PIPE)
for f in range(int(TOT*FPS)):
    t=f/FPS;cv=BG.copy()
    if t<DUR:
        if t<tA[1]: name='bow' if t<tA[1]-1 else 'thumb'
        elif t<tB[1]: name='thumb'
        elif t<tC[1]: name='gift'
        else: name='celebrate'
        t0={'bow':0,'thumb':tA[1]-1,'gift':tC[0],'celebrate':tD[0]}
        st={'bow':0,'thumb':(tA[1]-1 if t<tA[1] else tB[0]),'gift':tC[0],'celebrate':tD[0]}[name]
        lt=t-st;s=1+0.09*math.exp(-lt*8)*math.cos(lt*22)
        bob=math.sin(t*8)*7
        if name=='celebrate': bob=-abs(math.sin(lt*6))*60
        im=PO[name];cx=540;cy=1560-im.size[1]/2*s+ (im.size[1]/2)  # feet at 1560
        sim=im.resize((int(im.size[0]*s),int(im.size[1]*s)),Image.BILINEAR)
        sh=Image.new('RGBA',(W,H),(0,0,0,0));ImageDraw.Draw(sh).ellipse([540-220,1560-14,540+220,1560+24],fill=(0,0,0,110));cv.alpha_composite(sh)
        cv.alpha_composite(sim,(int(540-sim.size[0]/2),int(1560-sim.size[1]+bob)))
        # phase overlays
        if t<tA[1]:
            show(cv,cap,540,330,t,0.0);show(cv,ch['thanks'],540,640,t,0.5)
        elif t<tB[1]:
            span=(tB[1]-tB[0])/4
            show(cv,ch['ibrahim'],540,230,t,tB[0]);show(cv,ch['ali'],540,430,t,tB[0]+span);show(cv,ch['all'],540,610,t,tB[0]+2*span);show(cv,ch['hosny'],540,810,t,tB[0]+3*span)
        elif t<tC[1]:
            show(cv,ch['code'],540,400,t,tC[0])
        else:
            show(cv,ch['call'],540,300,t,tD[0])
            gd=ImageDraw.Draw(cv);tt=max(0,t-tD[0])
            for cx_,cy_,sp,col in conf:
                y_=cy_+tt*sp*4
                if 0<y_<H: gd.rectangle([cx_,y_,cx_+11,y_+16],fill=col+(255,))
    else:
        u=t-DUR;a=min(1,u/0.6)
        put(cv,lock,540,760,eob(u/0.7)*1.0)
        show(cv,capS,330,1430,t,DUR+0.5);show(cv,sl,750,1430,t,DUR+0.7);show(cv,ch['tag'],540,1740,t,DUR+1.0)
    ff.stdin.write(cv.convert('RGB').tobytes())
ff.stdin.close();ff.wait();print('outro',TOT)

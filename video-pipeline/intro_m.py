import numpy as np, random, math, subprocess
from PIL import Image, ImageDraw, ImageChops, ImageFilter
W,H,FPS,DUR=1080,1920,30,14.71
random.seed(3)
sheet=Image.open('/mnt/user-data/attachments/a8454560-0262-5feb-80b8-faf2a2b12af9/f9790b84-image.png').convert('RGB')
xs=[(11,341),(348,670),(677,1002),(1010,1334),(1342,1661)];ys=[(12,307),(315,615),(623,922)]
SC=2.9;CW,CH=326,292
frames=[]
for r in range(3):
  for c in range(5):
    x0,x1=xs[c];y0,y1=ys[r];cr=sheet.crop((x0,y0,x1,y1)).resize((CW,CH),Image.LANCZOS)
    d=ImageDraw.Draw(cr);d.rectangle([0,CH-44,66,CH],fill=(0,0,0))  # remove number label
    cr=cr.resize((int(CW*SC),int(CH*SC)),Image.LANCZOS)
    frames.append(np.asarray(cr).astype(np.float32))
FW,FH=frames[0].shape[1],frames[0].shape[0]
# background
yy,xx=np.mgrid[0:H,0:W];d=np.sqrt(((xx-W/2)/(W*.6))**2+((yy-H*.45)/(H*.7))**2)
c0=np.array([14,42,119]);c1=np.array([3,10,36])
bg=np.clip(c0[None,None]*(1-np.clip(d,0,1))[...,None]+c1[None,None]*np.clip(d,0,1)[...,None],0,255).astype(np.uint8)
BGI=Image.fromarray(bg).convert('RGBA');dr=ImageDraw.Draw(BGI)
for i in range(60):
    x,y=random.randint(0,W),random.randint(0,H);r=random.choice([1,1,2,3]);dr.ellipse([x-r,y-r,x+r,y+r],fill=(240,185,60,random.randint(60,160)))
dr.rectangle([0,1640,W,H],fill=(4,12,40,255))
BG=np.asarray(BGI.convert('RGB')).astype(np.float32)
def load(p,h):
    im=Image.open(p).convert('RGBA');oh=im.size[1];r=im.resize((int(im.size[0]*h/im.size[1]),h),Image.LANCZOS);import fixpose;return fixpose.fix(r,p,oh)
kick=load('../intro/pose_kick.png',820);wave=load('../intro/pose_wave.png',900);thumb=load('../intro/pose_thumb.png',900);bubble=Image.open('../intro/bubble.png').convert('RGBA')
def clamp(x,a=0,b=1):return max(a,min(b,x))
def ease_out_back(t):
    c1=1.70158;c3=c1+1;return 1+c3*(t-1)**3+c1*(t-1)**2
def paste_clip(canvas,im,x,y):
    x,y=int(x),int(y)
    bx0,by0=max(0,-x),max(0,-y);bx1,by1=min(im.size[0],W-x),min(im.size[1],H-y)
    if bx1<=bx0 or by1<=by0:return
    canvas.alpha_composite(im.crop((bx0,by0,bx1,by1)),(x+bx0,y+by0))
def pc(canvas,im,cx,cy,scale=1,rot=0,alpha=1):
    if scale!=1: im=im.resize((max(1,int(im.size[0]*scale)),max(1,int(im.size[1]*scale))),Image.BILINEAR)
    if rot: im=im.rotate(rot,expand=True,resample=Image.BILINEAR)
    if alpha<1:
        a=im.split()[3].point(lambda v:int(v*alpha));im=im.copy();im.putalpha(a)
    paste_clip(canvas,im,cx-im.size[0]/2,cy-im.size[1]/2)
CX,CY=W//2,760
T_CR=0.9      # cracks start
T_OUT=1.5     # Ahmed bursts out
T_LAND=2.25
def shard_frame(t):
    if t<T_CR: return 0.0
    return min(14.0,(t-T_CR)/0.1+1.0)   # frame index (float) 1..14 -> sheet frame 2..15
ff=subprocess.Popen(['ffmpeg','-loglevel','error','-y','-f','rawvideo','-pix_fmt','rgb24','-s',f'{W}x{H}','-r',str(FPS),'-i','-','-c:v','libx264','-crf','18','-preset','veryfast','-pix_fmt','yuv420p','intro_m.mp4'],stdin=subprocess.PIPE)
for f in range(int(DUR*FPS)):
    t=f/FPS;base=BG.copy()
    # logo / shatter frame (screen blend), float index with crossfade
    fi=shard_frame(t);i0=int(fi);i1=min(14,i0+1);k=fi-i0
    fr=frames[i0]*(1-k)+frames[i1]*k
    # pop-in
    s=1.0
    if t<0.7: s=ease_out_back(clamp(t/0.7))
    pulse=1+0.015*math.sin(t*12) if t<T_OUT else 1
    sc=max(0.02,s*pulse)
    if abs(sc-1)>1e-3:
        im=Image.fromarray(fr.astype(np.uint8)).resize((max(1,int(FW*sc)),max(1,int(FH*sc))),Image.BILINEAR);fr_s=np.asarray(im).astype(np.float32)
    else: fr_s=fr
    h,w=fr_s.shape[:2];x0=CX-w//2;y0=CY-h//2
    ys0,xs0=max(0,y0),max(0,x0);ys1,xs1=min(H,y0+h),min(W,x0+w)
    layer=np.zeros((H,W,3),np.float32);layer[ys0:ys1,xs0:xs1]=fr_s[ys0-y0:ys1-y0,xs0-x0:xs1-x0]
    # inner glow before burst (light leaking)
    if T_CR<=t<T_OUT+0.1:
        g=clamp((t-T_CR)/(T_OUT-T_CR));gl=np.exp(-(((xx-CX)/(120+240*g))**2+((yy-CY)/(120+240*g))**2))*(70+140*g)
        layer+=np.dstack([gl,gl*0.8,gl*0.25])
    mk=np.exp(-((((xx-CX)/700)**2+((yy-CY)/620)**2))**2)
    fade=1-clamp((t-2.2)/0.5)
    layer=layer*mk[...,None]*fade
    out=255-(255-base)*(255-np.clip(layer,0,255))/255
    cv=Image.fromarray(out.astype(np.uint8)).convert('RGBA')
    # speed streak + flash at burst
    if T_OUT<=t<T_OUT+0.4:
        k2=(t-T_OUT)/0.4;fl=Image.new('RGBA',(W,H),(255,248,220,int(120*(1-k2)**2)));cv.alpha_composite(fl)
        star=Image.new('RGBA',(W,H),(0,0,0,0));sd=ImageDraw.Draw(star);R=140+560*k2;r=R*0.4
        pts=[(CX+(R if q%2==0 else r)*math.cos(q*math.pi/8),CY+(R if q%2==0 else r)*math.sin(q*math.pi/8)) for q in range(16)]
        sd.polygon(pts,fill=(255,225,110,int(200*(1-k2))));cv.alpha_composite(star)
    # Ahmed
    if t>=T_OUT:
        u=clamp((t-T_OUT)/0.5)
        if t<T_LAND:
            ue=1-(1-u)**3
            sca=0.12+0.88*ue;cx=CX+(0-0)*ue;cy=CY+700*ue+(-120*math.sin(ue*math.pi))
            rot=-(1-ue)*720
            pc(cv,kick,cx,cy,scale=sca,rot=rot)
        else:
            v=clamp((t-T_LAND)/0.12);sq=1+0.06*math.sin(clamp((t-T_LAND)/0.3)*math.pi)
            bob=1+0.012*math.sin((t-T_LAND)*9)
            pc(cv,(thumb if t>8.5 else wave),540,1180+(1-sq)*260,scale=bob*(1/sq))
    if t>2.6:
        s2=ease_out_back(clamp((t-2.6)/0.35));pc(cv,bubble,540,330,scale=max(0.01,s2*1.9))
    img=cv.convert('RGB')
    # shake: building during cracks, big at burst
    amp=0
    if T_CR<=t<T_OUT: amp=2+8*(t-T_CR)/(T_OUT-T_CR)
    elif T_OUT<=t<T_OUT+0.4: amp=16*(1-(t-T_OUT)/0.4)
    if amp>0: img=ImageChops.offset(img,int(random.uniform(-amp,amp)),int(random.uniform(-amp,amp)))
    ff.stdin.write(img.tobytes())
ff.stdin.close();ff.wait()

import json,subprocess
D=json.load(open('dur.json'));S=json.load(open('sched.json'));SB=json.load(open('subs.json'))
st=SB['start'];BASE=SB['BASE'];OUT0=SB['OUT0'];TOT=OUT0+36.03
ins=[];fl=[];names=[]
for i in range(12):
    n='%02d'%(i+1);ins+=['-i',f'../voice12/clean/{n}.wav'];ms=int(st[n]*1000)
    fl.append(f'[{i}:a]adelay={ms}|{ms},aresample=44100[a{i}]');names.append(f'[a{i}]')
fl.append(''.join(names)+'amix=inputs=12:normalize=0:duration=longest,volume=1.0,asplit=2[voice][vsc0];[vsc0]apad=whole_dur=240.4[vsc]')
ins+=['-stream_loop','1','-i','music_long.wav']
fl.append('[12:a]aresample=44100,volume=0.45,afade=t=in:d=2,afade=t=out:st=%.2f:d=3[mus]'%(TOT-3))
fl.append('[mus][vsc]sidechaincompress=threshold=0.02:ratio=6:attack=15:release=450[duck]')
# sfx events: (file, time, volume)
ev=[('boom',1.45,0.55),('whoosh',0.85,0.25)]
for n in ['02','03','04','05','06','07','08','09','10','11']: ev.append(('whoosh',BASE+S[n][0]-0.05,0.22))
ev.append(('whoosh',OUT0-0.1,0.28))
ev+=[('pop',BASE+S['08'][0]+6.5,0.35),('pop',BASE+S['08'][0]+20.3,0.35),('pop',BASE+S['09'][0]+10.4,0.35),
     ('click',BASE+S['02'][0]+1.2,0.3),('click',BASE+S['02'][0]+2.0,0.3),('click',BASE+S['02'][0]+5.4,0.3),
     ('chime',BASE+S['09'][0]+14.8,0.35),('sparkle',BASE+S['09'][0]+14.9,0.25),('sparkle',BASE+S['05'][0]+8.0,0.25),('sparkle',BASE+S['10'][0]+0.4,0.2),('chime',OUT0+31.0,0.25)]
k=ins.count('-i')
sf=[]
for j,(f,t,v) in enumerate(ev):
    ins+=['-i',f'fx/{f}.wav'];ms=int(t*1000);idx=k+j
    fl.append(f'[{idx}:a]aresample=44100,volume={v},adelay={ms}|{ms}[s{j}]');sf.append(f'[s{j}]')
fl.append('[voice][duck]'+''.join(sf)+f'amix=inputs={2+len(ev)}:normalize=0:duration=longest,atrim=0:{TOT:.2f}[out]')
subprocess.run(['ffmpeg','-y','-loglevel','error']+ins+['-filter_complex',';'.join(fl),'-map','[out]','audio_final.wav'],check=True)
print('audio ok',len(ev))

import re,json,os
from texts import T
D=json.load(open('dur.json'));S=json.load(open('sched.json'))
GAP=0.35;BASE=D['01']+GAP;SCREEN=sum(D[n]+GAP for n in ['02','03','04','05','06','07','08','09','10','11']);OUT0=BASE+SCREEN
start={'01':0.0,**{n:BASE+S[n][0] for n in S},'12':OUT0}
def phrases(t):
    parts=re.split(r'(?<=[\.!\?؟…،])\s+',t.strip());out=[];cur=''
    for p in parts:
        if cur and len(cur)+len(p)<=44: cur+=' '+p
        else:
            if cur: out.append(cur)
            cur=p
    if cur: out.append(cur)
    res=[]
    for p in out:
        if len(p)<=44: res.append(p);continue
        w=p.split();line='';
        chunks=[]
        for x in w:
            if len(line)+len(x)+1>40 and line: chunks.append(line);line=x
            else: line=(line+' '+x).strip()
        chunks.append(line);res+=chunks
    return res
subs=[]
for n,t in T.items():
    ph=phrases(t);tot=sum(len(p) for p in ph);a=start[n];L=D[n]-0.2;acc=0
    for p in ph:
        s=a+L*acc/tot;acc+=len(p);e=a+L*acc/tot;subs.append([round(s,2),round(e,2),p])
json.dump({'subs':subs,'start':start,'OUT0':OUT0,'BASE':BASE,'SCREEN':SCREEN},open('subs.json','w'),ensure_ascii=False)
print(len(subs),OUT0,OUT0+D['12'])

# Genera el tema claro a partir del CSS oscuro: cada regla con colores se repite bajo html.light con los colores convertidos.
import re,colorsys
COLOR_PROPS=re.compile(r'^(color|background(-color|-image)?|border(-top|-bottom|-left|-right)?(-color)?|box-shadow|outline(-color)?|fill|stroke|caret-color|accent-color|scrollbar-color|text-decoration-color|--[\w-]+)$')
COL=re.compile(r'#[0-9a-fA-F]{6}\b|#[0-9a-fA-F]{3}\b|rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+\s*)?\)')
def parse(c):
    if c.startswith('#'):
        h=c[1:];h=''.join(x*2 for x in h) if len(h)==3 else h
        return int(h[0:2],16),int(h[2:4],16),int(h[4:6],16),1.0
    n=[float(x) for x in re.findall(r'[\d.]+',c)];return int(n[0]),int(n[1]),int(n[2]),(n[3] if len(n)>3 else 1.0)
def out(r,g,b,a):
    r,g,b=[max(0,min(255,int(round(x)))) for x in (r,g,b)]
    return '#%02x%02x%02x'%(r,g,b) if a>=0.999 else 'rgba(%d,%d,%d,%s)'%(r,g,b,('%.3f'%a).rstrip('0').rstrip('.'))
FIX={(217,119,87):(201,100,66)}
def conv(c):
    r,g,b,a=parse(c)
    if (r,g,b) in FIX and a>=0.6: return out(*FIX[(r,g,b)],a)
    h,l,s=colorsys.rgb_to_hls(r/255,g/255,b/255)
    neutral=s<0.18 or (max(r,g,b)-min(r,g,b))<22
    if neutral:
        if max(r,g,b)<8: return out(0,0,0,a*0.16)               # sombras negras
        if a<1:
            if l>0.6: return out(31,30,29,min(1,a*0.95))         # tinte claro sobre oscuro → tinte oscuro
            if l<0.3: return out(240,237,229,max(a,0.6))          # superficie oscura translúcida → crema translúcida
        if l<0.3: L=0.925-l*0.3                                    # fondos oscuros → crema suave (sin blanco puro)
        elif l>0.6: L=(1-l)*0.9+0.08                                # texto claro → texto oscuro
        else: L=1-l
        rr,gg,bb=colorsys.hls_to_rgb(45/360,L,0.12 if L>0.5 else 0.04)
        return out(rr*255,gg*255,bb*255,a)
    # con color: lo brillante (texto, acentos) se oscurece; lo oscuro (fondos) se aclara; tintes translúcidos se quedan
    if a<0.6: return out(r,g,b,min(1,a*1.25))
    if l>0.5: L=min(l,0.40);S=min(1,s*0.9)
    elif l<0.3: L=0.92;S=s*0.5
    else: L=l;S=s
    rr,gg,bb=colorsys.hls_to_rgb(h,L,S);return out(rr*255,gg*255,bb*255,a)
def split_top(s,sep):
    out=[];d=0;cur=''
    for ch in s:
        if ch=='(':d+=1
        elif ch==')':d-=1
        if ch==sep and d==0:out.append(cur);cur=''
        else:cur+=ch
    out.append(cur);return out
def sel(sx):
    res=[]
    for x in split_top(sx,','):
        x=x.strip()
        if not x:continue
        # Explicit Light selectors are authoritative; converting them creates
        # html.light.light selectors that cause unexpected precedence.
        if x=='html.light' or any(x.startswith('html.light'+p) for p in (' ', '.', ':', '[', '#')):continue
        if x.startswith(':root'):res.append('html.light'+x[5:])
        elif re.match(r'html(?![\w-])',x):res.append('html.light'+x[4:])
        else:res.append('html.light '+x)
    return ','.join(res)
def blocks(css):
    i=0;n=len(css)
    while i<n:
        j=css.find('{',i)
        if j<0:return
        head=css[i:j].strip();d=1;k=j+1
        while k<n and d:
            if css[k]=='{':d+=1
            elif css[k]=='}':d-=1
            k+=1
        yield head,css[j+1:k-1];i=k
def light(css):
    css=re.sub(r'/\*.*?\*/','',css,flags=re.S);out=[]
    for head,body in blocks(css):
        if head.startswith('@keyframes'):continue
        if head.startswith('@'):
            inner=light(body)
            if inner.strip():out.append(head+'{'+inner+'}')
            continue
        decls=[]
        for dcl in split_top(body,';'):
            if ':' not in dcl:continue
            p,v=dcl.split(':',1);p=p.strip()
            if not COLOR_PROPS.match(p) or not COL.search(v) or 'url(__' in v:continue
            decls.append(p+':'+COL.sub(lambda m:conv(m.group(0)),v.strip()))
        qualified=sel(head)
        if decls and qualified:out.append(qualified+'{'+';'.join(decls)+'}')
    return '\n'.join(out)

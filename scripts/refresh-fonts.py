import urllib.request,urllib.parse,re
from pathlib import Path
root=Path(__file__).resolve().parent.parent
s=''.join((root/p).read_text() for p in ['src/event.mjs','scripts/build.mjs'])
chars=''.join(sorted(set(re.findall(r'[\u0080-\uffff]',s))))+''.join(chr(i) for i in range(32,127))+'–・↗＋↑©’'
for family,file,weight in [('Noto Sans TC','noto-sans-tc.woff2','400..700'),('Noto Serif TC','noto-serif-tc.woff2','500')]:
 u='https://fonts.googleapis.com/css2?'+urllib.parse.urlencode({'family':family+':wght@'+weight,'display':'swap','text':chars})
 req=urllib.request.Request(u,headers={'User-Agent':'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'})
 css=urllib.request.urlopen(req,timeout=30).read().decode()
 urls=re.findall(r'url\((https[^)]+)\)',css)
 print(family,len(chars),len(urls))
 data=urllib.request.urlopen(urls[0],timeout=30).read()
 print(len(data),data[:4])
 (root/'public/assets'/file).write_bytes(data)

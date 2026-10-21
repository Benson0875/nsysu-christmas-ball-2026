import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { resolve, extname, sep } from 'node:path';
const root = resolve('dist');
const types = { '.html':'text/html; charset=utf-8', '.css':'text/css; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.webp':'image/webp', '.png':'image/png', '.woff2':'font/woff2', '.xml':'application/xml', '.txt':'text/plain; charset=utf-8' };
const prefix = '/nsysu-christmas-ball-2026';
createServer(async (req,res) => {
  try {
    let path = decodeURIComponent(new URL(req.url,'http://localhost').pathname);
    if (path === prefix) {res.writeHead(302,{location:prefix+'/'}); res.end(); return;}
    if(path.startsWith(prefix+'/')) path = path.slice(prefix.length);
    let file = resolve(root,'.'+path);
    if(file !== root && !file.startsWith(root+sep)) throw new Error('outside root');
    if((await stat(file)).isDirectory()) file = resolve(file,'index.html');
    const body = await readFile(file);
    res.writeHead(200,{'content-type':types[extname(file)]||'application/octet-stream'});res.end(body);
  } catch {res.writeHead(404,{'content-type':'text/plain'});res.end('Not found');}
}).listen(Number(process.env.PORT)||4173,'127.0.0.1',()=>console.log('Preview http://127.0.0.1:4173/nsysu-christmas-ball-2026/'));

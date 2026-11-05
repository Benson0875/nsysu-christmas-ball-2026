import { chromium } from '@playwright/test';
import { mkdir, writeFile } from 'node:fs/promises';
const dest='docs/redesign/screenshots';
await mkdir(dest,{recursive:true});
const browser=await chromium.launch();
const evidence=[];
for(const width of [390,1440]){
 const page=await browser.newPage({viewport:{width,height:900}});
 for(const locale of ['zh','en'])for(const route of ['index','evening','visit','partners']){
  await page.goto(`http://127.0.0.1:4173/nsysu-christmas-ball-2026/${locale==='en'?'en/':''}${route}.html`);
  await page.evaluate(async()=>{await document.fonts.ready;for(const i of document.images)i.loading='eager';await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));});
  await page.screenshot({path:`${dest}/after-${locale}-${route}-${width}.png`,fullPage:true});
  if(route==='index'){
   evidence.push(await page.evaluate(()=>({locale:document.documentElement.lang,width:innerWidth,cta:document.querySelector('.hero-actions .button').getBoundingClientRect().toJSON(),navigation:performance.getEntriesByType('navigation').map(n=>({domContentLoadedMs:n.domContentLoadedEventEnd,loadMs:n.loadEventEnd})),resources:performance.getEntriesByType('resource').filter(e=>e.initiatorType!=='fetch').map(e=>({name:e.name.split('/').at(-1),bytes:e.encodedBodySize}))})));
   await page.screenshot({path:`${dest}/candidate-A-${locale}-${width}.png`,fullPage:false});
   if(locale==='zh'){
    await page.evaluate(()=>{
     const art=document.querySelector('.hero-art');
     art.innerHTML='<img src="assets/group-960.webp" width="1440" height="958" alt="2025 活動入口合照"><p class="art-credit">2025 活動照片</p>';
     art.classList.add('candidate-photo');
    });
    await page.addStyleTag({content:'.candidate-photo>img{border-radius:0;aspect-ratio:1.5;object-fit:contain;max-height:none}.candidate-photo::after{border-radius:0}'});
    await page.evaluate(()=>Promise.all([...document.images].map(i=>i.decode().catch(()=>{}))));
    await page.screenshot({path:`${dest}/candidate-B-${width}.png`,fullPage:false});
    await page.evaluate(()=>{document.querySelector('.hero-art').innerHTML='<div class="candidate-date"><span>DECEMBER 2026</span><strong>12.24</strong><p>18:00 至 21:00<br>高雄福容大飯店・芙蓉廳</p></div>';});
    await page.addStyleTag({content:'.candidate-date{background:#eee9df;color:#172239;padding:44px 25px;border-top:8px solid #dec38d}.candidate-date>strong{display:block;font-size:clamp(70px,9vw,140px);font-family:var(--serif);line-height:1.4}.candidate-date>span{font-size:12px;letter-spacing:.2em}.hero-art::after{display:none}'});
    await page.screenshot({path:`${dest}/candidate-C-${width}.png`,fullPage:false});
   }
  }
 }
 await page.close();
}
await writeFile('docs/redesign/browser-evidence.json',JSON.stringify({note:'Local browser observations only. These do not measure student interest or production conversion. Resource lists include images eagerly decoded for screenshots, including initially hidden artwork.',evidence},null,2));
await browser.close();
console.log('Saved final page captures, three candidate directions and local browser evidence.');

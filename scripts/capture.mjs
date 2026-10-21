import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
const destination='test-results/visual-review';
await mkdir(destination,{recursive:true});
const browser=await chromium.launch();
for(const width of [390,1440]) {
  const page=await browser.newPage({viewport:{width,height:900}});
  for(const locale of ['zh','en']) for(const route of ['index','evening','visit','partners']) {
    await page.goto(`http://127.0.0.1:4173/nsysu-christmas-ball-2026/${locale==='en'?'en/':''}${route}.html`);
    await page.evaluate(()=>document.fonts.ready);
    await page.evaluate(()=>Promise.all([...document.images].map(img=>{img.loading='eager';return img.decode().catch(()=>{});})));
    await page.screenshot({path:`${destination}/${locale}-${route}-${width}.png`,fullPage:true});
  }
  await page.close();
}
await browser.close();
console.log(`Captured 16 page screenshots in ${destination}`);

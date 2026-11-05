import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdir } from 'node:fs/promises';
const routes=['index','evening','visit','partners'];
for(const width of [375,390,768,1440])for(const locale of ['zh','en'])for(const route of routes){
 test(`${locale} ${route} at ${width}px`,async({page})=>{
  await page.setViewportSize({width,height:900});
  const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
  expect((await page.goto(`${locale==='en'?'en/':''}${route}.html`)).status()).toBe(200);
  await page.evaluate(()=>document.fonts.ready);
  await expect(page.locator('h1')).toHaveCount(1);
  expect(await page.locator('html').getAttribute('lang')).toBe(locale==='zh'?'zh-Hant':'en');
  const layout=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,clipped:[...document.querySelectorAll('h1,h2,h3,p,dd,summary,.button,.text-link')].filter(e=>e.getClientRects().length).filter(e=>e.scrollWidth>e.clientWidth+2).map(e=>e.textContent)}));
  expect(layout.scroll).toBeLessThanOrEqual(layout.width+1);expect(layout.clipped).toEqual([]);
  const body=await page.locator('body').innerText();
  expect(body).not.toMatch(/[;；]/);expect(body).not.toMatch(/欣賞完整主視覺|一個夜晚.*相聚|照片裡的相聚|從第一聲|不是.*而是/);
  expect(body).not.toContain('12.26');expect(body).not.toMatch(/17:45|18:15/);
  expect(await page.locator('a[href="#"]').count()).toBe(0);
  await page.evaluate(()=>{for(const img of document.images)img.loading='eager';});
  await expect.poll(()=>page.evaluate(()=>[...document.images].filter(i=>i.getClientRects().length&&(!i.complete||!i.naturalWidth)).length)).toBe(0);
  const hrefs=await page.locator('a[href]').evaluateAll(links=>links.map(a=>a.href).filter(h=>h.startsWith(location.origin)));
  for(const href of new Set(hrefs))expect((await page.request.get(href)).status()).toBe(200);
  expect(errors).toEqual([]);
  if(route==='index'&&[390,1440].includes(width)){
   await mkdir('docs/redesign/screenshots',{recursive:true});
   await page.evaluate(()=>Promise.all([...document.images].map(i=>i.decode().catch(()=>{}))));
   await page.screenshot({path:`docs/redesign/screenshots/after-${locale}-${width}.png`,fullPage:true});
  }
 });
}
test('mobile menu, Escape, locale and navigation',async({page})=>{
 await page.setViewportSize({width:375,height:812});await page.goto('visit.html');
 const toggle=page.locator('.menu-toggle');await toggle.click();await expect(toggle).toHaveAttribute('aria-expanded','true');await expect(page.locator('.site-nav')).toBeVisible();
 await page.keyboard.press('Escape');await expect(toggle).toHaveAttribute('aria-expanded','false');await expect(toggle).toBeFocused();
 await toggle.click();await page.locator('.site-nav a').last().click();await expect(page).toHaveURL(/partners\.html$/);await expect(toggle).toHaveAttribute('aria-expanded','false');
 await page.locator('.language-switch').click();await expect(page).toHaveURL(/en\/partners\.html$/);await page.locator('.language-switch').click();await expect(page).not.toHaveURL(/en\//);
});
test('registration and real prices with payment instructions',async({page})=>{
 await page.goto('visit.html');await expect(page.locator('#prices')).toContainText('NT$500');await expect(page.locator('#prices')).toContainText('NT$600');await expect(page.locator('#prices')).toContainText('IBBA');
 await expect(page.locator('#registration')).toContainText('11 月 30 日');await expect(page.locator('#registration')).toContainText('僅收現金');
 const cta=page.locator('#registration a.button');await expect(cta).toHaveAttribute('href',/^https:\/\/docs.google.com\/forms\/d\/e\/1FAIpQLSdbCmJCnpaMx3yXq5MPW752hXm9opATsylgUQ6VNDP05DYKcQ\/viewform$/);
 const summary=page.locator('.faq summary').first();await summary.focus();await page.keyboard.press('Enter');await expect(page.locator('.faq details').first()).toHaveAttribute('open','');
});




test('no JavaScript keeps mobile navigation and registration available',async({browser})=>{
 const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:375,height:812}});const page=await context.newPage();await page.goto('http://127.0.0.1:4173/nsysu-christmas-ball-2026/');await expect(page.locator('.site-nav a').last()).toBeVisible();await expect(page.locator('[data-share]')).toBeHidden();await page.locator('.site-nav a').nth(2).click();await expect(page.locator('#registration a.button')).toBeVisible();await context.close();
});
test('sponsor forecast is labelled, real contact and no fake partners',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('partners.html');await expect(page.locator('.forecast')).toContainText('並非已報名或歷年實到');await expect(page.locator('[data-track="sponsor_contact"]')).toHaveAttribute('href','https://www.instagram.com/serendipity20.26/');await expect(page.locator('.partner-card')).toHaveCount(0);expect(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
});
for(const locale of ['zh','en'])for(const route of routes)test(`accessibility ${locale} ${route}`,async({page})=>{
 await page.setViewportSize({width:390,height:844});await page.goto(`${locale==='en'?'en/':''}${route}.html`);await page.evaluate(()=>document.fonts.ready);const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(result.violations).toEqual([]);
});
for(const width of [375,390,1280,1920,2560])test(`first screen registration and wide layout ${width}`,async({page})=>{
 await page.setViewportSize({width,height:width<700?812:900});await page.goto('index.html');await page.evaluate(()=>document.fonts.ready);const cta=await page.locator('.hero-actions .button').first().boundingBox();expect(cta.y+cta.height).toBeLessThan(width<700?812:900);expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBe(width);
});



test('skip link moves keyboard focus into main content',async({page})=>{
 await page.goto('index.html');await page.keyboard.press('Tab');await expect(page.locator('.skip-link')).toBeFocused();await page.keyboard.press('Enter');await expect(page.locator('main')).toBeFocused();
});


test('home simplifies invitation and keeps all ticket benefits',async({page})=>{
 await page.goto('index.html');await expect(page.locator('h1')).toHaveText('童話序曲聖誕舞章');await expect(page.locator('.action-strip,.art-details')).toHaveCount(0);await expect(page.locator('.home-tickets')).toContainText('NT$500');await expect(page.locator('.home-tickets')).toContainText('NT$600');await expect(page.locator('.home-tickets')).toContainText('團報由一人填寫');await expect(page.locator('.home-tickets')).toContainText('可合併');
});
test('program page opens with blended illustrations and no date text overlay',async({page})=>{
 await page.goto('evening.html');await expect(page.locator('main > section').first()).toHaveClass('evening-art');await expect(page.locator('.evening-art img')).toHaveCount(3);await expect(page.locator('.art-date')).toHaveCount(0);await expect(page.locator('.art-date-mask')).toBeEmpty();
});
test('photo reveal honors reduced motion',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('index.html');await page.locator('.archive').scrollIntoViewIfNeeded();expect(await page.locator('[data-reveal]').first().evaluate(e=>getComputedStyle(e).animationName)).toBe('none');
});

test('confirmed performers and revised admission stay consistent',async({page})=>{
 await page.goto('evening.html');const program=page.locator('.program-list');await expect(program).toContainText('18:00 至 18:20');for(const name of ['吉他社','勁舞社','舞蹈社','班恩'])await expect(program).toContainText(name);await expect(program).not.toContainText('表演名單確認後公布');await page.goto('visit.html');await expect(page.locator('#registration')).toContainText('18:00 至 18:20');await expect(page.locator('h1')).toHaveText('找好朋友一起來報名');
});

for(const locale of ['zh','en'])test(`mobile title and compact illustration sit side by side ${locale}`,async({page})=>{
 for(const width of [320,375,390,430,700]){
  await page.setViewportSize({width,height:900});await page.goto(`${locale==='en'?'en/':''}index.html`);await page.evaluate(()=>document.fonts.ready);
  const title=await page.locator('.hero h1').boundingBox(),art=await page.locator('.hero-art').boundingBox();
  expect(art.y).toBeLessThan(title.y+title.height);expect(art.x).toBeGreaterThanOrEqual(title.x+title.width);expect(art.width).toBeLessThanOrEqual(160);
 }
});
test('mobile archive year has a clear space beside the photo',async({page})=>{
 for(const width of [320,375,390,430,700]){
  await page.setViewportSize({width,height:900});await page.goto('index.html');await page.evaluate(()=>document.fonts.ready);await page.emulateMedia({reducedMotion:'reduce'});
  const year=await page.locator('.gallery-stamp strong').boundingBox(),photo=await page.locator('.archive-small').boundingBox();
  expect(year.x).toBeGreaterThanOrEqual(0);expect(year.x+year.width+8).toBeLessThanOrEqual(photo.x);
 }
});

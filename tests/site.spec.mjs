import { test, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import AxeBuilder from '@axe-core/playwright';

const routes = ['index','evening','visit','partners'];
for (const width of [375,390,768,1440]) {
  for (const locale of ['zh','en']) {
    for (const route of routes) {
      test(`${locale} ${route} at ${width}px`, async ({page}) => {
        await page.setViewportSize({width,height:900});
        const errors=[];
        page.on('pageerror',error=>errors.push(error.message));
        page.on('console',message=>{if(message.type()==='error')errors.push(message.text());});
        const response=await page.goto(`${locale==='en'?'en/':''}${route}.html`);
        expect(response.status()).toBe(200);
        await page.evaluate(()=>document.fonts.ready);
        await page.locator('h1').waitFor();
        expect(await page.locator('h1').count()).toBe(1);
        expect(await page.locator('html').getAttribute('lang')).toBe(locale==='zh'?'zh-Hant':'en');
        if(route==='index') await expect(page.locator('.hero-quicklink')).toBeInViewport();
        const layout=await page.evaluate(()=>({view:innerWidth,body:document.documentElement.scrollWidth, clipped:[...document.querySelectorAll('h1,h2,h3,p,dd,summary,.button,.text-link')].filter(el=>el.getClientRects().length&&!el.closest('dialog')).filter(el=>el.scrollWidth>el.clientWidth+2).map(el=>el.textContent)}));
        expect(layout.body).toBeLessThanOrEqual(layout.view+1);
        expect(layout.clipped).toEqual([]);
        const text=await page.locator('body').innerText();
        expect(text).not.toMatch(/[;；\-]/);
        expect(text).not.toContain('12.26');
        expect(await page.locator('a[href="#"]').count()).toBe(0);
        await page.evaluate(()=>{for(const img of document.images)img.loading='eager';});
        await expect.poll(()=>page.evaluate(()=>[...document.images].filter(i=>!i.complete||!i.naturalWidth).length)).toBe(0);
        const hrefs=await page.locator('a[href]').evaluateAll(links=>links.map(a=>a.href).filter(h=>h.startsWith(location.origin)));
        for (const href of new Set(hrefs)) expect((await page.request.get(href)).status()).toBe(200);
        expect(errors).toEqual([]);
        if(route==='index' && [390,1440].includes(width)) {
          await mkdir('docs/screenshots',{recursive:true});
          await page.screenshot({path:`docs/screenshots/home-${locale}-${width}.png`,fullPage:true});
        }
      });
    }
  }
}

test('mobile navigation, locale switch and return path',async({page})=>{
  await page.setViewportSize({width:375,height:812});
  await page.goto('visit.html');
  const toggle=page.locator('.menu-toggle');
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded','true');
  await expect(page.locator('.site-nav')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(toggle).toHaveAttribute('aria-expanded','false');
  await expect(toggle).toBeFocused();
  await toggle.click();
  await page.locator('.site-nav a').last().click();
  await expect(page).toHaveURL(/partners\.html$/);
  await expect(toggle).toHaveAttribute('aria-expanded','false');
  await page.locator('.language-switch').click();
  await expect(page).toHaveURL(/en\/partners\.html$/);
  await page.locator('.language-switch').click();
  await expect(page).not.toHaveURL(/en\//);
});

test('artwork viewer, carousel controls and focus restoration',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('index.html');
  const scroller=page.locator('.panorama-scroll');
  const initial=await scroller.evaluate(el=>el.scrollLeft);
  expect(initial).toBeGreaterThan(0);
  await page.locator('[data-direction="next"]').click();
  await expect.poll(()=>scroller.evaluate(el=>el.scrollLeft)).toBeGreaterThan(initial);
  await page.locator('[data-open-art]').click();
  await expect(page.locator('dialog')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('dialog')).not.toBeVisible();
  await expect(page.locator('[data-open-art]')).toBeFocused();
});

test('registration state and FAQ keyboard operation',async({page})=>{
  await page.goto('visit.html');
  await expect(page.locator('#registration')).toContainText('報名表單尚在準備中');
  await expect(page.getByRole('link',{name:'前往報名'})).toHaveCount(0);
  const summary=page.locator('summary').first();
  await summary.focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('details').first()).toHaveAttribute('open','');
});

test('no JavaScript fallback keeps navigation and event content available',async({browser})=>{
  const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:375,height:812}});
  const page=await context.newPage();
  await page.goto('http://127.0.0.1:4173/nsysu-christmas-ball-2026/');
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.locator('.site-nav a').last()).toBeVisible();
  await page.locator('.site-nav a').nth(2).click();
  await expect(page.locator('#registration')).toBeVisible();
  await context.close();
});

test('reduced motion and sponsor empty state',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('partners.html');
  await expect(page.locator('.partners-empty')).toBeVisible();
  expect(await page.locator('.partner-card').count()).toBe(0);
  expect(await page.evaluate(()=>getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto');
});

for(const locale of ['zh','en']) for(const route of routes) {
  test(`accessibility ${locale} ${route}`,async({page})=>{
    await page.setViewportSize({width:390,height:844});
    await page.goto(`${locale==='en'?'en/':''}${route}.html`);
    await page.evaluate(()=>document.fonts.ready);
    const result=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    expect(result.violations).toEqual([]);
  });
}

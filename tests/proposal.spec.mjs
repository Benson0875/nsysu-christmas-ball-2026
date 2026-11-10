import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for(const width of [320,1440])test(`REYS proposal can be read and downloaded at ${width}px`,async({page})=>{
 await page.setViewportSize({width,height:900});
 expect((await page.goto('proposals/reys/')).status()).toBe(200);
 await expect(page.locator('h1')).toHaveText('REYS 合作提案');
 await expect(page.locator('main section')).toHaveCount(5);
 for(const image of await page.locator('main section img').all()){
  await image.scrollIntoViewIfNeeded();
  await expect.poll(()=>image.evaluate(el=>el.complete&&el.naturalWidth===1600)).toBe(true);
 }
 expect(await page.evaluate(()=>document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
 await page.locator('.intro nav a').last().click();await expect(page).toHaveURL(/#page-5$/);
 await page.locator('#page-5 summary').click();
 await expect(page.locator('#page-5 .transcript')).toBeVisible();
 await expect(page.locator('#page-5 .related a[href^="mailto:"]')).toHaveAttribute('href','mailto:senbenson8888@gmail.com');
 const pdf=await page.request.get('proposals/reys/proposal.pdf');expect(pdf.status()).toBe(200);
 expect(pdf.headers()['content-type']).toContain('application/pdf');expect((await pdf.body()).subarray(0,5).toString()).toBe('%PDF-');
 const downloadPromise=page.waitForEvent('download');await page.locator('a[download]').click();
 expect((await downloadPromise).suggestedFilename()).toContain('REYS合作提案.pdf');
 expect((await new AxeBuilder({page}).analyze()).violations).toEqual([]);
});

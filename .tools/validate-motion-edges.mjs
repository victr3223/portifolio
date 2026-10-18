// Supplemental browser checks for first-visit scrolling, layout and preference changes.
import assert from 'node:assert/strict';
import { writeFile } from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const { chromium } = await import(pathToFileURL(process.env.PORTFOLIO_PLAYWRIGHT).href);
const browser = await chromium.launch({ headless: true });
const report = { browser: browser.version(), started: new Date().toISOString(), checks: [], errors: [] };
const origin = 'http://127.0.0.1:4321';
const destination = 'docs/validation-motion-20261018/edge-checks.json';
const check = async (name, action) => {
  try { report.checks.push({ name, result: 'passed', details: await action() }); }
  catch (error) { report.checks.push({ name, result: 'failed', error: error.message }); }
};
async function ready(viewport) {
  const context = await browser.newContext({ viewport, reducedMotion: 'no-preference' });
  const page = await context.newPage();
  page.on('pageerror', error => report.errors.push(error.message));
  page.on('console', message => { if (['warning', 'error'].includes(message.type())) report.errors.push(message.text()); });
  await page.goto(origin, { waitUntil: 'networkidle' });
  await page.waitForTimeout(3200);
  return { context, page };
}
async function visible(page) {
  const bad = await page.locator('.reveal').evaluateAll(elements => elements.filter(element => {
    const rect = element.getBoundingClientRect();
    return !element.closest('[hidden]') && rect.bottom > 75 && rect.top < innerHeight - 30 && Number(getComputedStyle(element).opacity) < .99;
  }).map(element => element.textContent.trim().slice(0, 50)));
  assert.deepEqual(bad, []);
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
}
try {
  for (const viewport of [{ width: 1024, height: 576 }, { width: 390, height: 844 }]) {
    const { context, page } = await ready(viewport);
    await check(`First-visit fast scrolling at ${viewport.width}px`, async () => {
      for (const top of [50000, 0, 2500, 300, 50000, 1200, 0, 50000]) {
        await page.evaluate(top => scrollTo({ top, behavior: 'instant' }), top);
        await page.waitForTimeout(45);
      }
      await page.waitForTimeout(1800); await visible(page);
      await page.locator('.about-layout').evaluate(element => scrollTo({ top: scrollY + element.getBoundingClientRect().top - 140, behavior: 'instant' }));
      await page.waitForTimeout(1800); await visible(page);
      return 'Fresh page; 45 ms between jumps; bottom and returning about section visible.';
    });
    await context.close();
  }
  const { context, page } = await ready({ width: 1024, height: 576 });
  const layout = () => page.locator('.reveal').evaluateAll(elements => elements.map(element => [element.offsetTop, element.offsetLeft, element.offsetWidth, element.offsetHeight]));
  await check('Reveal motion keeps layout boxes unchanged', async () => {
    const before = await layout();
    await page.locator('.about-layout').evaluate(element => scrollTo({ top: scrollY + element.getBoundingClientRect().top - 140, behavior: 'instant' }));
    await page.waitForTimeout(240); assert.deepEqual(await layout(), before);
    await page.waitForTimeout(1400); assert.deepEqual(await layout(), before);
    return { boxes: before.length, samples: ['before', 'during', 'after'] };
  });
  await check('Unvisited hidden tabs do not consume entrances', async () => {
    const state = await page.locator('#panel-certificados .reveal, #panel-tecnologias .reveal').evaluateAll(elements => elements.map(element => ({ hidden: !!element.closest('[hidden]'), shown: element.classList.contains('is-visible') })));
    assert.ok(state.length > 0); assert.ok(state.every(item => item.hidden && !item.shown));
    return { waiting: state.length };
  });
  await check('Switch to reduced motion during pending delays', async () => {
    await page.locator('#contact-title').evaluate(element => scrollTo({ top: scrollY + element.getBoundingClientRect().top - 110, behavior: 'instant' }));
    await page.waitForTimeout(100);
    const pending = await page.locator('#contact-form .reveal').evaluateAll(elements => elements.filter(element => Number(getComputedStyle(element).opacity) < .99).length);
    assert.ok(pending > 0);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.waitForTimeout(40);
    const bad = await page.locator('.reveal').evaluateAll(elements => elements.filter(element => !element.closest('[hidden]') && (getComputedStyle(element).opacity !== '1' || getComputedStyle(element).translate !== 'none')).map(element => element.className));
    assert.deepEqual(bad, []);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await visible(page);
    return { pendingBefore: pending, hiddenAfter: bad.length };
  });
  await context.close();
} finally {
  await browser.close();
  report.finished = new Date().toISOString();
  await writeFile(destination, JSON.stringify(report, null, 2));
}
console.log(JSON.stringify(report, null, 2));
if (report.errors.length || report.checks.some(check => check.result !== 'passed')) process.exitCode = 1;

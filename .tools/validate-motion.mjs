// Local QA only. Requires an isolated Playwright installation; never copied to dist.
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

if (!process.env.PORTFOLIO_PLAYWRIGHT) throw new Error('Set PORTFOLIO_PLAYWRIGHT to the installed playwright/index.mjs path.');
const { chromium } = await import(pathToFileURL(process.env.PORTFOLIO_PLAYWRIGHT).href);
const output = resolve(process.argv[2] || `docs/validation-motion-${new Date().toISOString().replaceAll(':', '-')}`);
await mkdir(output, { recursive: true });
const origin = 'http://127.0.0.1:4321';
const browser = await chromium.launch({ headless: true });
const report = { started: new Date().toISOString(), browser: browser.version(), origin, contexts: [], failures: [] };

async function run(name, viewport, reducedMotion, scenario) {
  const directory = resolve(output, name);
  await mkdir(directory, { recursive: true });
  const context = await browser.newContext({ viewport, reducedMotion, deviceScaleFactor: 1,
    isMobile: viewport.width < 600, hasTouch: viewport.width < 600,
    recordVideo: { dir: directory, size: viewport } });
  const page = await context.newPage();
  const record = { name, viewport, reducedMotion, checks: [], console: [], pageErrors: [], scenes: [] };
  report.contexts.push(record);
  page.on('console', message => { if (['error', 'warning'].includes(message.type())) record.console.push(message.text()); });
  page.on('pageerror', error => record.pageErrors.push(error.message));
  await page.addInitScript(() => {
    window.__motionEvents = [];
    const describe = element => ({ tag: element.tagName, text: element.textContent.trim().slice(0, 55),
      id: element.id, classes: element.className, top: element.getBoundingClientRect().top,
      hidden: !!element.closest('[hidden]'), opacity: getComputedStyle(element).opacity,
      translate: getComputedStyle(element).translate, delay: getComputedStyle(element).transitionDelay });
    for (const type of ['transitionrun', 'transitionstart', 'transitionend', 'transitioncancel']) {
      document.addEventListener(type, event => {
        if (event.propertyName === 'opacity' && event.target.matches('.reveal')) {
          window.__motionEvents.push({ time: performance.now(), type, y: scrollY, ...describe(event.target) });
        }
      }, true);
    }
  });
  const check = async (label, action) => {
    try { const details = await action(); record.checks.push({ label, result: 'passed', details }); }
    catch (error) { record.checks.push({ label, result: 'failed', error: error.message }); report.failures.push(`${name}: ${label}: ${error.message}`); }
  };
  const capture = async label => page.screenshot({ path: resolve(directory, `${label}.png`) });
  const inspect = async (selector = '.reveal') => page.locator(selector).evaluateAll(elements => elements.map(element => {
    const css = getComputedStyle(element), rect = element.getBoundingClientRect();
    return { text: element.textContent.trim().slice(0, 45), id: element.id, top: rect.top, bottom: rect.bottom,
      layoutTop: rect.top + scrollY - (parseFloat(css.translate.split(' ')[1]) || 0),
      opacity: Number(css.opacity), translate: css.translate, delay: css.transitionDelay,
      visible: element.classList.contains('is-visible'), hidden: !!element.closest('[hidden]') };
  }));
  const scene = async (label, selector, top = 200) => {
    await page.locator(selector).first().evaluate((element, offset) => window.scrollTo({ top: scrollY + element.getBoundingClientRect().top - offset, behavior: 'instant' }), top);
    const started = Date.now();
    const samples = [];
    for (const targetTime of [40, 220, 440, 800, 1300]) {
      await page.waitForTimeout(Math.max(0, started + targetTime - Date.now()));
      const values = await inspect();
      samples.push({ elapsed: Date.now() - started, y: await page.evaluate(() => scrollY), values });
      if (targetTime !== 1300) await capture(`${label}-${targetTime}`);
    }
    record.scenes.push({ label, samples });
  };
  try {
    await page.goto(origin, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3200); // Preserve the real first-visit introduction in the video.
    await check('Browser preference and public page', async () => {
      const state = await page.evaluate(() => ({ reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
        qaOverlay: !!document.querySelector('#motion-qa'), width: innerWidth, height: innerHeight }));
      assert.equal(state.reduced, reducedMotion === 'reduce'); assert.equal(state.qaOverlay, false); return state;
    });
    await scenario({ page, record, check, capture, inspect, scene });
    await check('No horizontal overflow or console errors', async () => {
      const widths = await page.evaluate(() => ({ document: document.documentElement.scrollWidth, viewport: innerWidth }));
      assert.ok(widths.document <= widths.viewport, JSON.stringify(widths));
      assert.deepEqual(record.pageErrors, []); assert.deepEqual(record.console, []); return widths;
    });
    record.events = await page.evaluate(() => window.__motionEvents);
  } catch (error) { report.failures.push(`${name}: ${error.stack}`); }
  finally {
    await capture('final').catch(() => {});
    const video = page.video();
    await context.close();
    record.video = await video.path();
    await writeFile(resolve(output, 'results.json'), JSON.stringify(report, null, 2));
  }
}

async function activeIsVisible(page) {
  const bad = await page.locator('.reveal').evaluateAll(elements => elements.filter(element => {
    const rect = element.getBoundingClientRect();
    return !element.closest('[hidden]') && rect.bottom > 75 && rect.top < innerHeight - 30 && Number(getComputedStyle(element).opacity) < .99;
  }).map(element => ({ text: element.textContent.slice(0, 35), class: element.className, opacity: getComputedStyle(element).opacity })));
  assert.deepEqual(bad, []);
}

try {
  await run('desktop-normal', { width: 1024, height: 576 }, 'no-preference', async ({ page, check, scene, inspect, capture }) => {
    await check('Offscreen text, image, cards and fields await intersection', async () => {
      const items = await inspect('#sobre .reveal, #portfolio .reveal, #contato .reveal');
      assert.ok(items.filter(item => !item.hidden).every(item => !item.visible && item.opacity === 0));
      return { count: items.length };
    });
    await scene('about', '.about-layout', 160);
    await scene('highlights', '.stats-grid', 160);
    await scene('portfolio', '#portfolio-title', 150);
    await scene('projects', '#projects', 180);
    await scene('contact-panels', '#contact-title', 110);
    await scene('fields', '#contact-form', 150);
    await scene('channels', '.connect-panel', 220);
    await check('End of page has no stranded content', async () => {
      await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
      await page.waitForTimeout(1700); await activeIsVisible(page);
    });
    await capture('bottom');
    await check('Rapid scroll down and up remains usable', async () => {
      for (const y of [0, 50000, 400, 2400, 1100, 50000]) {
        await page.evaluate(value => scrollTo({ top: value, behavior: 'instant' }), y);
        await page.waitForTimeout(65);
      }
      await page.waitForTimeout(1800); await activeIsVisible(page);
    });
    await page.getByRole('tab', { name: 'Certificados', exact: true }).click();
    await page.waitForTimeout(1400);
    await check('Tabs repeated before delayed entries start do not accumulate seconds', async () => {
      // Actual DOM click events at 30 ms intervals exercise a timing race faster than pointer auto-wait.
      await page.evaluate(async () => {
        for (let i = 0; i < 10; i++) {
          document.querySelector('#tab-tecnologias').click();
          await new Promise(resolve => setTimeout(resolve, 30));
          document.querySelector('#tab-certificados').click();
          await new Promise(resolve => setTimeout(resolve, 30));
        }
        document.querySelector('#tab-tecnologias').click();
      });
      await page.waitForTimeout(1300); await activeIsVisible(page);
      return await inspect('#panel-tecnologias .reveal');
    });
    await capture('rapid-tabs');
    await check('Certificate gallery and keyboard', async () => {
      await page.getByRole('tab', { name: 'Certificados', exact: true }).click();
      await page.getByRole('button', { name: 'Ampliar certificado: AI-900 - Fundamentos de IA no Azure', exact: true }).click();
      await page.keyboard.press('ArrowRight');
      assert.match(await page.locator('#certificate-title').textContent(), /Crie um site/);
      await capture('certificate');
      await page.keyboard.press('Escape'); assert.equal(await page.locator('#certificate-dialog').isVisible(), false);
    });
    await check('Themes still toggle', async () => {
      await page.getByRole('button', { name: 'Ativar tema claro', exact: true }).click();
      assert.equal(await page.locator('html').getAttribute('data-theme'), 'light'); await capture('light');
      await page.getByRole('button', { name: 'Ativar tema escuro', exact: true }).click();
    });
  });

  await run('mobile-normal', { width: 390, height: 844 }, 'no-preference', async ({ page, check, capture, inspect, record }) => {
    await check('Mobile menu focus and Escape', async () => {
      await page.getByRole('button', { name: 'Abrir menu', exact: true }).click();
      assert.equal(await page.evaluate(() => document.activeElement.textContent), 'Início');
      await page.keyboard.press('Escape');
      assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'), 'false');
    });
    await check('Slow scroll reveals individual rows and fields in order', async () => {
      const samples = [];
      const height = await page.evaluate(() => document.documentElement.scrollHeight);
      for (let y = 0; y < height; y += 90) {
        await page.evaluate(value => scrollTo({ top: value, behavior: 'instant' }), y);
        await page.waitForTimeout(140);
        samples.push({ y: await page.evaluate(() => scrollY), items: await inspect('.project-card, #contact-form .reveal, .comments-panel .reveal'),
          overflow: await page.evaluate(() => document.documentElement.scrollWidth > innerWidth) });
        if (y % 630 === 0) await capture(`scroll-${y}`);
      }
      record.slowScroll = samples;
      assert.ok(samples.every(sample => !sample.overflow));
      assert.ok(samples.some(sample => sample.items.some(item => item.top > 844 && !item.visible && item.opacity === 0)));
      await page.waitForTimeout(1800); await activeIsVisible(page);
    });
    await capture('bottom');
    await check('Keyboard focus immediately exposes a newly reached field', async () => {
      await page.reload({ waitUntil: 'networkidle' });
      await page.locator('#contact-form input[name=email]').focus();
      const state = await page.locator('#contact-form input[name=email]').evaluate(element => {
        const nodes = []; for (let current = element; current; current = current.parentElement) if (current.matches('.reveal')) nodes.push(getComputedStyle(current).opacity);
        return nodes;
      });
      assert.ok(state.every(opacity => opacity === '1')); return state;
    });
    await check('Exit before delay and return', async () => {
      await page.reload({ waitUntil: 'networkidle' });
      await page.locator('.stats-grid').evaluate(element => scrollTo({ top: element.getBoundingClientRect().top + scrollY - 160, behavior: 'instant' }));
      await page.waitForTimeout(35);
      await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
      await page.waitForTimeout(60);
      await page.locator('.stats-grid').evaluate(element => scrollTo({ top: element.getBoundingClientRect().top + scrollY - 160, behavior: 'instant' }));
      await page.waitForTimeout(1400); await activeIsVisible(page);
    });
    await capture('return');
  });

  for (const viewport of [{ width: 1024, height: 576 }, { width: 390, height: 844 }]) {
    await run(`${viewport.width}-reduced`, viewport, 'reduce', async ({ page, check, capture, inspect }) => {
      await check('Reduced motion exposes all registered content without displacement', async () => {
        const values = await inspect();
        assert.ok(values.filter(value => !value.hidden).every(value => value.opacity === 1 && value.translate === 'none'));
        assert.ok(values.every(value => value.visible)); return { count: values.length };
      });
      await page.getByRole('tab', { name: 'Stack Tecnológica', exact: true }).click();
      await capture('technologies');
      await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
      await check('Reduced motion final fields are usable', async () => { await activeIsVisible(page); });
      await capture('bottom');
      await check('Changing preference live keeps content visible', async () => {
        await page.emulateMedia({ reducedMotion: 'no-preference' }); await activeIsVisible(page);
        await page.emulateMedia({ reducedMotion: 'reduce' }); await activeIsVisible(page);
      });
    });
  }
} finally {
  report.finished = new Date().toISOString();
  await browser.close();
  await writeFile(resolve(output, 'results.json'), JSON.stringify(report, null, 2));
}
console.log(JSON.stringify({ output, browser: report.browser, checks: report.contexts.flatMap(context => context.checks).length, failures: report.failures }, null, 2));
if (report.failures.length) process.exitCode = 1;

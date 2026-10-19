import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../app.js', import.meta.url), 'utf8');
const start = source.indexOf("document.documentElement.classList.add('js');");
const end = source.indexOf('const themeButton =', start);
assert.ok(start >= 0 && end > start, 'Locate the production introduction controller.');
const controller = source.slice(start, end);
const css = await readFile(new URL('../styles.css', import.meta.url), 'utf8');

// Each fixture is a fresh document. Only storage is shared across visits/tabs.
// The clock and event targets model the platform; the controller is production code.
function openPage({ session = new Map(), local = new Map(), reduced = false } = {}) {
  let now = 0, nextTimer = 0;
  const timers = new Map(), pageEvents = new Map(), introEvents = new Map(), classes = new Set();
  const root = { classList: { add: name => classes.add(name), contains: name => classes.has(name) } };
  const body = { style: { overflow: '' } };
  const intro = {
    hidden: false, offsetWidth: 1024,
    addEventListener(type, handler) { introEvents.set(type, handler); }
  };
  const storage = map => ({ getItem: key => map.get(key) ?? null, setItem: (key, value) => map.set(key, value), clear: () => map.clear() });
  vm.runInNewContext(controller, {
    document: { documentElement: root, body },
    $: selector => { assert.equal(selector, '.intro'); return intro; },
    sessionStorage: storage(session), localStorage: storage(local), motion: { matches: reduced },
    setTimeout(callback, delay) { const id = ++nextTimer; timers.set(id, { callback, at: now + delay }); return id; },
    clearTimeout(id) { timers.delete(id); },
    addEventListener(type, handler) { pageEvents.set(type, handler); }
  });
  return {
    intro, timers, body,
    visible: () => !intro.hidden && !classes.has('intro-done'),
    advance(ms) {
      const until = now + ms;
      while (true) {
        const next = [...timers].filter(([, timer]) => timer.at <= until).sort((a, b) => a[1].at - b[1].at)[0];
        if (!next) break;
        now = next[1].at; timers.delete(next[0]); next[1].callback();
      }
      now = until;
    },
    emit(type, event = {}) { pageEvents.get(type)?.(event); },
    animation(event) { introEvents.get('animationend')?.(event); }
  };
}

test('introduction appears on first entry, keeps its duration and does not restart on page interactions', () => {
  const page = openPage();
  assert.equal(page.visible(), true);
  page.advance(500);
  page.emit('pageshow', { persisted: false });
  for (const type of ['click', 'hashchange', 'popstate']) page.emit(type);
  assert.equal(page.timers.size, 1);
  page.advance(2499); assert.equal(page.visible(), true);
  page.advance(1); assert.equal(page.intro.hidden, true);
  assert.equal(page.body.style.overflow, '', 'The introduction must not leave scrolling locked.');
  for (const type of ['click', 'hashchange', 'popstate']) page.emit(type);
  page.emit('pageshow', { persisted: false });
  assert.equal(page.visible(), false); assert.equal(page.timers.size, 0);
});

test('reload, a new tab and browser reopening show the introduction without altering saved data', () => {
  const session = new Map([['victor-intro', 'seen'], ['another-session-key', 'preserve']]);
  const local = new Map([['victor-theme', 'light'], ['victor-local-comments-v1', '[{"id":"saved-comment","author":"Visitante","message":"Preservar"}]']]);
  const beforeSession = [...session], beforeLocal = [...local];
  const first = openPage({ session, local });
  assert.equal(first.visible(), true, 'A legacy seen flag must not skip the introduction.');
  first.advance(3000);
  const reload = openPage({ session, local });
  assert.equal(reload.visible(), true, 'Reload creates its own introduction.');
  const newTab = openPage({ session: new Map(session), local });
  assert.equal(newTab.visible(), true, 'An inherited session must not skip a new tab.');
  reload.advance(3000); assert.equal(newTab.visible(), true, 'Each document owns its timer.');
  newTab.advance(3000);
  const reopened = openPage({ local });
  assert.equal(reopened.visible(), true, 'A fresh session with retained local data must show it.');
  assert.deepEqual([...session], beforeSession); assert.deepEqual([...local], beforeLocal);
});

test('reduced motion still shows a brief introduction and removes movement from its contents', () => {
  const page = openPage({ reduced: true });
  assert.equal(page.visible(), true);
  page.advance(449); assert.equal(page.visible(), true);
  page.advance(1); assert.equal(page.intro.hidden, true); assert.equal(page.timers.size, 0);
  const reducedRules = css.slice(css.indexOf('@media(prefers-reduced-motion:reduce)')).split('\n')[0];
  assert.doesNotMatch(reducedRules, /\.js \.intro\{display:none/);
  assert.match(reducedRules, /\.js \.intro\{animation:intro-out [^}]*!important\}/);
  assert.match(reducedRules, /\.intro-icons>span\{animation:none!important\}/);
  assert.match(css, /\[hidden\]\{display:none!important\}/);
});

test('only the overlay exit completes it, and a cached page restoration starts one fresh entry', () => {
  const page = openPage();
  page.animation({ target: {}, animationName: 'intro-out' });
  page.animation({ target: page.intro, animationName: 'intro-text' });
  assert.equal(page.visible(), true);
  page.animation({ target: page.intro, animationName: 'intro-out' });
  assert.equal(page.intro.hidden, true); assert.equal(page.timers.size, 0);
  page.advance(4000); assert.equal(page.visible(), false);
  page.emit('pageshow', { persisted: true });
  assert.equal(page.visible(), true); assert.equal(page.timers.size, 1);
  page.advance(3000); assert.equal(page.intro.hidden, true); assert.equal(page.timers.size, 0);
});

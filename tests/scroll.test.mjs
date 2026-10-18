import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import vm from 'node:vm';

const source = await readFile(new URL('../app.js', import.meta.url), 'utf8');
const motorStart = source.indexOf('// Only intersecting items');
const motorEnd = source.indexOf('const portrait =', motorStart);
const tabsStart = source.indexOf('function selectTab(');
const tabsEnd = source.indexOf('const technologies =', tabsStart);
if (motorStart < 0 || motorEnd < motorStart || tabsStart < 0 || tabsEnd < tabsStart) {
  throw new Error('The production reveal/tab blocks could not be located.');
}
const productionCode = source.slice(motorStart, motorEnd) + source.slice(tabsStart, tabsEnd);

// This fixture models DOM/observer events and a clock, not the reveal algorithm.
// Assertions inspect the classes, delays and tab state consumed by the real CSS.
function fixture(build, { reducedMotion = false } = {}) {
  let now = 1000, serial = 0, nextFrame = 0;
  const frames = new Map(), observers = [], listeners = new Map();
  const attributeName = key => key.replace(/[A-Z]/g, value => `-${value.toLowerCase()}`);
  class Element {
    constructor({ classes = '', id = '', data = {}, attributes = {}, top = 100, height = 50, hidden = false } = {}) {
      this.order = serial++; this.id = id; this.dataset = data; this.attributes = { ...attributes };
      this.children = []; this.parentElement = null; this.isConnected = true;
      this.top = top; this.offsetTop = top; this.offsetHeight = height; this.hidden = hidden;
      this.events = new Map(); this.values = new Map();
      const classesSet = new Set(classes.split(' ').filter(Boolean));
      this.classList = {
        contains: name => classesSet.has(name),
        add: (...names) => names.forEach(name => classesSet.add(name)),
        remove: (...names) => names.forEach(name => classesSet.delete(name)),
        toggle: (name, force = !classesSet.has(name)) => { force ? classesSet.add(name) : classesSet.delete(name); return force; }
      };
      this.style = { setProperty: (name, value) => this.values.set(name, value), getPropertyValue: name => this.values.get(name) || '', removeProperty: name => this.values.delete(name) };
    }
    append(child) { this.children.push(child); child.parentElement = this; return child; }
    matches(selector) {
      if (selector.startsWith('.')) return selector.slice(1).split('.').every(name => this.classList.contains(name));
      if (selector.startsWith('#')) return this.id === selector.slice(1);
      const attribute = selector.match(/^\[([^=\]]+)(?:=['"]?([^'"\]]+)['"]?)?\]$/);
      return Boolean(attribute && (attribute[2] === undefined ? this.hasAttribute(attribute[1]) : this.getAttribute(attribute[1]) === attribute[2]));
    }
    hasAttribute(name) {
      if (name === 'hidden') return this.hidden;
      if (name.startsWith('data-')) return Object.keys(this.dataset).some(key => `data-${attributeName(key)}` === name);
      return Object.hasOwn(this.attributes, name);
    }
    getAttribute(name) { return this.attributes[name] ?? null; }
    setAttribute(name, value) { this.attributes[name] = String(value); }
    closest(selector) { for (let element = this; element; element = element.parentElement) if (element.matches(selector)) return element; return null; }
    querySelectorAll(selector) { return this.children.flatMap(child => [...(child.matches(selector) ? [child] : []), ...child.querySelectorAll(selector)]); }
    querySelector(selector) { return this.querySelectorAll(selector)[0] || null; }
    getBoundingClientRect() { return { top: this.top, bottom: this.top + this.offsetHeight, left: 0, right: 200, width: 200, height: this.offsetHeight }; }
    compareDocumentPosition(other) { return this.order < other.order ? 4 : 2; }
    addEventListener(type, handler) { const callbacks = this.events.get(type) || []; callbacks.push(handler); this.events.set(type, callbacks); }
    click() { for (const handler of this.events.get('click') || []) handler({ target: this, preventDefault() {} }); }
    focus() { for (const handler of listeners.get('focusin') || []) handler({ target: this }); }
  }
  const documentElement = new Element(), body = documentElement.append(new Element());
  const header = body.append(new Element({ classes: 'site-header', top: 0, height: 56 }));
  const document = {
    documentElement, body,
    querySelectorAll: selector => documentElement.querySelectorAll(selector),
    querySelector: selector => documentElement.querySelector(selector),
    addEventListener(type, handler) { const callbacks = listeners.get(type) || []; callbacks.push(handler); listeners.set(type, callbacks); }
  };
  const create = (options, parent = body) => parent.append(new Element(options));
  const nodes = build(create);
  class Observer {
    constructor(callback) { this.callback = callback; this.observed = new Set(); observers.push(this); }
    observe(element) { this.observed.add(element); }
    unobserve(element) { this.observed.delete(element); }
    disconnect() { this.observed.clear(); }
  }
  vm.runInNewContext(productionCode, {
    document, window: { IntersectionObserver: Observer }, IntersectionObserver: Observer,
    Node: { DOCUMENT_POSITION_FOLLOWING: 4 }, performance: { now: () => now },
    motion: { matches: reducedMotion },
    $: (selector, root = document) => root.querySelector(selector),
    $$: (selector, root = document) => root.querySelectorAll(selector),
    requestAnimationFrame(callback) { const id = ++nextFrame; frames.set(id, callback); return id; },
    cancelAnimationFrame: id => frames.delete(id),
    scheduleScrollUpdate() {}, updateScroll() {}
  }, { filename: 'app.js:scroll-and-tabs' });
  return {
    ...nodes, header,
    get now() { return now; },
    set now(value) { now = value; },
    intersect(elements, isIntersecting = true) {
      for (const observer of observers) {
        const entries = elements.filter(element => observer.observed.has(element)).map(target => ({ target, isIntersecting }));
        if (entries.length) observer.callback(entries);
      }
    },
    frames() {
      for (let rounds = 0; frames.size; rounds++) {
        assert.ok(rounds < 20, 'The reveal queue should settle without a perpetual frame loop.');
        const callbacks = [...frames.values()]; frames.clear();
        for (const callback of callbacks) callback(now);
      }
    },
    startTime: element => now + Number.parseFloat(element.style.getPropertyValue('--reveal-delay') || '0')
  };
}

test('form sequence preserves order when fields enter in separate visibility batches', () => {
  const h = fixture(create => {
    const panel = create({ classes: 'reveal', top: 60 });
    const form = create({ data: { revealSequence: '' } }, panel);
    return { panel, name: create({ classes: 'reveal', top: 100 }, form), email: create({ classes: 'reveal', top: 160 }, form), message: create({ classes: 'reveal', top: 220 }, form) };
  });
  h.intersect([h.panel, h.name, h.email]); h.frames();
  const nameStart = h.startTime(h.name), emailStart = h.startTime(h.email);
  assert.ok(emailStart > nameStart, 'The second field must follow the first.');
  assert.equal(h.message.classList.contains('is-visible'), false, 'An unreached field must keep waiting.');
  h.now += 16;
  h.intersect([h.message]); h.frames();
  assert.ok(h.startTime(h.message) > emailStart, 'A later visibility batch must not overtake an already scheduled field.');
});

test('focus reveals its ancestor and releases a waiting dependency without another observer event', () => {
  const h = fixture(create => {
    const predecessor = create({ classes: 'reveal', id: 'predecessor' });
    const button = create({}, predecessor);
    const group = create({ data: { revealSequence: '', revealAfter: '#predecessor' } });
    return { predecessor, button, card: create({ classes: 'reveal', top: 200 }, group) };
  });
  h.intersect([h.card]); h.frames();
  assert.equal(h.card.classList.contains('is-visible'), false);
  h.button.focus(); h.frames();
  assert.equal(h.predecessor.classList.contains('is-visible'), true, 'A focused control must not have an invisible ancestor.');
  assert.equal(h.predecessor.style.getPropertyValue('--reveal-delay'), '0ms');
  assert.equal(h.card.classList.contains('is-visible'), true, 'Resolving the predecessor must wake the existing queue.');
});

test('switching tabs preserves started entries and reschedules entries whose delay has not elapsed', () => {
  const h = fixture(create => {
    const tabs = create({ classes: 'reveal', id: 'portfolio-tabs' });
    const projectsTab = create({ data: { tab: 'projetos' }, attributes: { role: 'tab', 'aria-controls': 'panel-projetos' } }, tabs);
    const certificatesTab = create({ data: { tab: 'certificados' }, attributes: { role: 'tab', 'aria-controls': 'panel-certificados' } }, tabs);
    const projectsPanel = create({ id: 'panel-projetos' });
    create({ id: 'panel-certificados', hidden: true });
    const grid = create({ data: { revealSequence: '', revealGrid: '', revealAfter: '#portfolio-tabs' } }, projectsPanel);
    return { tabs, projectsTab, certificatesTab, projectsPanel, first: create({ classes: 'reveal', top: 200 }, grid), second: create({ classes: 'reveal', top: 200 }, grid) };
  });
  h.intersect([h.tabs, h.first, h.second]); h.frames();
  const firstStart = h.startTime(h.first), secondStart = h.startTime(h.second);
  assert.ok(secondStart > firstStart);
  h.now = (firstStart + secondStart) / 2;
  h.certificatesTab.click(); h.frames();
  assert.equal(h.projectsPanel.hidden, true);
  assert.equal(h.first.classList.contains('is-visible'), true, 'An entry that started must not be reset.');
  assert.equal(h.second.classList.contains('is-visible'), false, 'A hidden tab must not consume an entry that has not started.');
  h.intersect([h.second], false); h.frames();
  h.now = secondStart + 1000;
  h.projectsTab.click(); h.frames();
  assert.equal(h.projectsPanel.hidden, false);
  assert.equal(h.second.classList.contains('is-visible'), false, 'Showing a tab alone must not bypass viewport observation.');
  h.intersect([h.second]); h.frames();
  assert.equal(h.second.classList.contains('is-visible'), true, 'The deferred entry must remain observable after returning to its tab.');
});

test('repeated rapid tab switches do not accumulate cancelled sequence reservations', () => {
  const h = fixture(create => {
    const tabs = create({ classes: 'reveal', id: 'portfolio-tabs' });
    const projectsTab = create({ data: { tab: 'projetos' }, attributes: { role: 'tab', 'aria-controls': 'panel-projetos' } }, tabs);
    const certificatesTab = create({ data: { tab: 'certificados' }, attributes: { role: 'tab', 'aria-controls': 'panel-certificados' } }, tabs);
    const projectsPanel = create({ id: 'panel-projetos' });
    create({ id: 'panel-certificados', hidden: true });
    const grid = create({ data: { revealSequence: '', revealGrid: '', revealAfter: '#portfolio-tabs' } }, projectsPanel);
    return { tabs, projectsTab, certificatesTab, cards: Array.from({ length: 6 }, () => create({ classes: 'reveal', top: 200 }, grid)) };
  });
  h.intersect([h.tabs, ...h.cards]); h.frames();
  for (let cycle = 0; cycle < 8; cycle++) {
    h.now += 30;
    h.certificatesTab.click(); h.intersect(h.cards, false); h.frames();
    h.now += 30;
    h.projectsTab.click(); h.intersect(h.cards); h.frames();
  }
  const delays = h.cards.map(card => Number.parseFloat(card.style.getPropertyValue('--reveal-delay')));
  assert.ok(delays.every(delay => delay <= 690), `Returning to a tab must use its normal stagger, not cancelled reservations: ${delays.join(', ')}ms`);
  assert.ok(h.cards.every(card => card.classList.contains('is-visible')), 'Every intersecting card in the active tab must be scheduled.');
});

test('partial cancellation preserves the order of entries that are still pending', () => {
  const h = fixture(create => {
    const panel = create({ classes: 'reveal', top: 60 });
    const form = create({ data: { revealSequence: '' } }, panel);
    return { panel, first: create({ classes: 'reveal', top: 100 }, form), second: create({ classes: 'reveal', top: 160 }, form), third: create({ classes: 'reveal', top: 220 }, form), fourth: create({ classes: 'reveal', top: 280 }, form) };
  });
  h.intersect([h.panel, h.first, h.second, h.third]); h.frames();
  const firstStart = h.startTime(h.first), secondStart = h.startTime(h.second), thirdStart = h.startTime(h.third);
  h.now += 30;
  h.intersect([h.third], false); h.frames();
  h.intersect([h.third, h.fourth]); h.frames();
  assert.equal(h.startTime(h.third), thirdStart, 'The returning field should reuse the released tail slot.');
  assert.ok(h.startTime(h.third) > secondStart, 'A partial cancellation must not let the returning field overtake an earlier pending field.');
  assert.ok(h.startTime(h.fourth) > h.startTime(h.third), 'A newly reached field must follow the returned field.');
  assert.ok(secondStart > firstStart);
});

test('reduced motion exposes registered content immediately while keeping hidden tabs hidden', () => {
  const h = fixture(create => {
    const panel = create({ classes: 'reveal', data: { revealSequence: '' } });
    const field = create({ classes: 'reveal' }, panel);
    const hiddenPanel = create({ hidden: true });
    return { panel, field, hiddenPanel, hiddenCard: create({ classes: 'reveal' }, hiddenPanel) };
  }, { reducedMotion: true });
  h.frames();
  for (const element of [h.panel, h.field, h.hiddenCard]) {
    assert.equal(element.classList.contains('is-visible'), true);
    assert.equal(element.style.getPropertyValue('--reveal-delay'), '0ms');
  }
  assert.equal(h.hiddenPanel.hidden, true);
});

test('leaving the viewport before a delayed entry starts defers it until the next intersection', () => {
  const h = fixture(create => {
    const grid = create({ data: { revealSequence: '', revealGrid: '' } });
    return { first: create({ classes: 'reveal', top: 200 }, grid), second: create({ classes: 'reveal', top: 200 }, grid) };
  });
  h.intersect([h.first, h.second]); h.frames();
  const firstStart = h.startTime(h.first), secondStart = h.startTime(h.second);
  assert.ok(secondStart > firstStart);
  h.now = (firstStart + secondStart) / 2;
  h.intersect([h.second], false); h.frames();
  assert.equal(h.first.classList.contains('is-visible'), true, 'An entry that started must remain revealed.');
  assert.equal(h.second.classList.contains('is-visible'), false, 'A pending entry must not run after leaving the viewport.');
  h.now = secondStart + 1000;
  h.frames();
  assert.equal(h.second.classList.contains('is-visible'), false, 'Elapsed time alone must not reveal an offscreen item.');
  h.intersect([h.second]); h.frames();
  assert.equal(h.second.classList.contains('is-visible'), true, 'The cancelled entry must still respond to a later intersection.');
  assert.ok(h.startTime(h.second) >= h.now);
});

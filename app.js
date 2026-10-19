/* Local-only portfolio. No analytics, remote requests, or message submission. */
'use strict';
const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
const motion = matchMedia('(prefers-reduced-motion: reduce)');
const icons = {
  code: '<path d="m8 5-7 7 7 7m8-14 7 7-7 7"/>',
  user: '<circle cx="12" cy="7" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3"/>',
  monitor: '<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 22h8m-4-5v5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 1v2m0 18v2M1 12h2m18 0h2M4.2 4.2l1.4 1.4m12.8 12.8 1.4 1.4m0-15.6-1.4 1.4M5.6 18.4l-1.4 1.4"/>',
  moon: '<path d="M20.8 14A9 9 0 0 1 10 3.2 9 9 0 1 0 20.8 14Z"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  sparkles: '<path d="m12 2 2.8 7.2L22 12l-7.2 2.8L12 22l-2.8-7.2L2 12l7.2-2.8L12 2Zm8 0v4m-2-2h4"/>',
  external: '<path d="M14 3h7v7m0-7L10 14m0-11H4a1 1 0 0 0-1 1v16a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1v-6"/>',
  mail: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 5 10 8L22 5"/>',
  github: '<path d="M9 19c-4 1-4-2-6-2m12 5v-4a3.4 3.4 0 0 0-1-2.7c3.3-.4 6.8-1.6 6.8-7.3a5.7 5.7 0 0 0-1.5-4c.2-1.2.2-2.2-.2-3 0 0-1.2-.4-4.1 1.5a14.3 14.3 0 0 0-6 0C6.1.6 4.9 1 4.9 1c-.4.8-.4 1.8-.2 3a5.7 5.7 0 0 0-1.5 4c0 5.7 3.5 6.9 6.8 7.3A3.4 3.4 0 0 0 9 18v4"/>',
  linkedin: '<rect x="3" y="8" width="4" height="13"/><circle cx="5" cy="3" r="2"/><path d="M11 21V8h4v2a4 4 0 0 1 7 3v8h-4v-7a2 2 0 0 0-4 0"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 20 20 0 0 1-8.7-3.1 20 20 0 0 1-6.2-6.2A20 20 0 0 1 1.8 4 2 2 0 0 1 3.8 1.8h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L7.7 9.8a16 16 0 0 0 6.2 6.2l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.8 2Z"/>',
  file: '<path d="M14 2H5a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V9Zm0 0v7h7M7 14h10M7 18h7"/>',
  award: '<circle cx="12" cy="8" r="6"/><path d="m8 13-1 9 5-3 5 3-1-9"/>',
  globe: '<circle cx="12" cy="12" r="10"/><ellipse cx="12" cy="12" rx="4" ry="10"/><path d="M2 12h20"/>',
  layers: '<path d="m12 2 10 6-10 6L2 8Zm-10 10 10 6 10-6M2 17l10 6 10-6"/>',
  send: '<path d="m22 2-7 20-4-9-9-4 20-7ZM22 2 11 13"/>',
  pin: '<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  message: '<path d="M21 15a3 3 0 0 1-3 3H8l-6 4V5a3 3 0 0 1 3-3h13a3 3 0 0 1 3 3Z"/>',
  image: '<rect x="2" y="3" width="20" height="18" rx="2"/><circle cx="8" cy="8" r="2"/><path d="m22 16-7-7L2 21"/>',
  'arrow-up': '<path d="m5 12 7-7 7 7m-7-7v17"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  'chevron-left': '<path d="m15 5-7 7 7 7"/>',
  'chevron-right': '<path d="m9 5 7 7-7 7"/>',
  database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14c0 4 18 4 18 0V5M3 12c0 4 18 4 18 0"/>',
  git: '<path d="m12 1 11 11-11 11L1 12Z"/><path d="m8 5 8 8m-8-5v9"/><circle cx="8" cy="7" r="1.5"/><circle cx="8" cy="17" r="1.5"/><circle cx="16" cy="13" r="1.5"/>',
  docker: '<path d="M1 12h17c2 0 3-1 4-3 1 5-4 12-11 12-6 0-10-4-10-9Z"/><path d="M4 12V8h4v4m0-4V4h4v8m0-4h4v4m-8 0V8h4"/>',
  cpu: '<rect x="5" y="5" width="14" height="14" rx="3"/><rect x="9" y="9" width="6" height="6"/><path d="M9 1v4m6-4v4M9 19v4m6-4v4M1 9h4m-4 6h4m14-6h4m-4 6h4"/>',
  workflow: '<rect x="8" y="1" width="8" height="6" rx="1"/><rect x="1" y="17" width="8" height="6" rx="1"/><rect x="15" y="17" width="8" height="6" rx="1"/><path d="M12 7v5M5 17v-5h14v5"/>'
};
function icon(name) { return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[name] || icons.code}</svg>`; }
function renderIcons(root = document) { $$('[data-icon]', root).forEach(el => { el.innerHTML = icon(el.dataset.icon); }); }
renderIcons();

const storage = {
  get(key, fallback = null) { try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; } },
  set(key, value) { try { localStorage.setItem(key, value); return true; } catch { return false; } }
};
document.documentElement.classList.add('js');
const intro = $('.intro');
let introTimer;
function finishIntro() {
  clearTimeout(introTimer);
  intro.hidden = true;
}
function startIntro() {
  clearTimeout(introTimer);
  // Reset only this overlay, including a document restored from the back/forward cache.
  intro.hidden = true;
  void intro.offsetWidth;
  intro.hidden = false;
  introTimer = setTimeout(finishIntro, motion.matches ? 450 : 3000);
}
intro.addEventListener('animationend', event => {
  if (event.target === intro && event.animationName === 'intro-out') finishIntro();
});
startIntro();
addEventListener('pageshow', event => { if (event.persisted) startIntro(); });

const themeButton = $('.theme-toggle');
function updateTheme() {
  const light = document.documentElement.dataset.theme === 'light';
  themeButton.innerHTML = icon(light ? 'moon' : 'sun');
  themeButton.setAttribute('aria-label', `Ativar tema ${light ? 'escuro' : 'claro'}`);
  $('meta[name="theme-color"]').content = light ? '#f8f8fa' : '#09090b';
}
themeButton.addEventListener('click', () => {
  const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.dataset.theme = next;
  storage.set('victor-theme', next);
  updateTheme();
});
updateTheme();

const menuButton = $('.menu-toggle');
function closeMenu() { $('.navigation').classList.remove('is-open'); menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Abrir menu'); menuButton.innerHTML = icon('menu'); }
menuButton.addEventListener('click', event => { event.stopPropagation(); const open = $('.navigation').classList.toggle('is-open'); menuButton.setAttribute('aria-expanded', String(open)); menuButton.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu'); menuButton.innerHTML = icon(open ? 'close' : 'menu'); if (open) $('.navigation a').focus(); });
$$('.navigation a').forEach(a => a.addEventListener('click', closeMenu));
document.addEventListener('click', event => { if (!event.target.closest('.site-header')) closeMenu(); });
document.addEventListener('keydown', event => { if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') { closeMenu(); menuButton.focus(); } });
$('.back-top').addEventListener('click', () => { window.scrollTo({ top: 0, behavior: motion.matches ? 'instant' : 'smooth' }); $('.brand').focus({ preventScroll: true }); });
const sections = $$('main > section[id]');
let scrollPending = false;
function updateScroll() {
  const top = window.scrollY;
  $('.site-header').classList.toggle('scrolled', top > 20);
  $('.back-top').hidden = top < 500;
  let active = 'inicio';
  for (const section of sections) if (section.getBoundingClientRect().top < window.innerHeight * .38) active = section.id;
  $$('.navigation a').forEach(a => { const selected = a.hash === `#${active}`; a.classList.toggle('active', selected); if (selected) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current'); });
  scrollPending = false;
  if (typeof scheduleRevealFlush === 'function') scheduleRevealFlush();
}
function scheduleScrollUpdate() { if (!scrollPending) { scrollPending = true; requestAnimationFrame(updateScroll); } }
addEventListener('scroll', scheduleScrollUpdate, { passive: true });
addEventListener('resize', scheduleScrollUpdate);
if ('ResizeObserver' in window) new ResizeObserver(scheduleScrollUpdate).observe($('main'));

// Only intersecting items join a sequence. Hidden tabs and lower rows keep waiting.
const registeredReveals = new WeakSet();
const revealStarts = new WeakMap();
const revealSequences = new WeakMap();
const revealReservations = new WeakMap();
const waitingReveals = new Set();
let revealFrame = 0;
function scheduleRevealFlush() {
  if (waitingReveals.size && !revealFrame) revealFrame = requestAnimationFrame(flushReveals);
}
function releaseRevealReservation(element) {
  revealReservations.get(element)?.reservations.delete(element);
  revealReservations.delete(element);
}
function finishReveal(element) {
  releaseRevealReservation(element);
  element.classList.add('reveal-immediate', 'is-visible');
  element.style.setProperty('--reveal-delay', '0ms');
  revealStarts.set(element, 0);
  waitingReveals.delete(element);
  revealObserver?.unobserve(element);
  scheduleRevealFlush();
}
function flushReveals() {
  revealFrame = 0;
  const now = performance.now();
  const elements = [...waitingReveals].sort((a, b) => a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1);
  for (const element of elements) {
    if (!element.isConnected || element.closest('[hidden]') || element.classList.contains('is-visible')) { waitingReveals.delete(element); continue; }
    let earliest = now;
    const parent = element.parentElement.closest('.reveal');
    const dependency = element.closest('[data-reveal-after]')?.dataset.revealAfter;
    const predecessor = dependency ? $(dependency) : null;
    let ready = true;
    for (const prior of [parent, predecessor].filter(Boolean)) {
      if (!prior.classList.contains('is-visible')) {
        // An anchor or a fast scroll may have skipped the preceding heading.
        if (prior.getBoundingClientRect().bottom < $('.site-header').offsetHeight) finishReveal(prior);
        else { ready = false; break; }
      }
      earliest = Math.max(earliest, (revealStarts.get(prior) || 0) + (prior === parent ? 420 : 140));
    }
    if (!ready) continue;
    const group = element.closest('[data-reveal-sequence]') || element.parentElement;
    const rows = revealSequences.get(group) || [];
    const top = element.offsetTop;
    let row = rows.find(item => !group.hasAttribute('data-reveal-grid') || Math.abs(item.top - top) < 12);
    if (!row) { row = { top, reservations: new Map() }; rows.push(row); revealSequences.set(group, rows); }
    // Cancelled entries release their slots; the remaining entries keep their order.
    const start = Math.max(earliest, ...[...row.reservations.values()].map(time => time + 110));
    row.reservations.set(element, start);
    revealReservations.set(element, row);
    revealStarts.set(element, start);
    element.style.setProperty('--reveal-delay', `${Math.round(start - now)}ms`);
    element.classList.add('is-visible');
    waitingReveals.delete(element);
    // Keep observing through the delay so leaving the viewport can cancel it.
  }
}
const revealObserver = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
  for (const { target, isIntersecting } of entries) {
    if (isIntersecting && !target.closest('[hidden]')) {
      if (!target.classList.contains('is-visible')) waitingReveals.add(target);
    } else {
      waitingReveals.delete(target);
      cancelPendingReveal(target);
      if (target.classList.contains('is-visible')) revealObserver.unobserve(target);
    }
  }
  scheduleRevealFlush();
}, { threshold: 0, rootMargin: '0px 0px -24px 0px' }) : null;
function registerReveals(root = document) {
  for (const element of $$('.reveal', root)) {
    if (registeredReveals.has(element)) continue;
    registeredReveals.add(element);
    if (motion.matches || !revealObserver) finishReveal(element);
    else revealObserver.observe(element);
  }
}
function cancelPendingReveal(element) {
  if ((revealStarts.get(element) || 0) <= performance.now()) return;
  releaseRevealReservation(element);
  element.classList.remove('is-visible');
  element.style.setProperty('--reveal-delay', '0ms');
  revealStarts.delete(element);
  revealObserver?.observe(element);
}
function suspendReveals(panel) {
  for (const element of $$('.reveal', panel)) {
    waitingReveals.delete(element);
    // Preserve completed/started entries, but don't consume an unseen delayed item.
    cancelPendingReveal(element);
  }
}
document.documentElement.classList.add('reveals-ready');
registerReveals();
updateScroll();
// Keyboard focus must never land on an invisible control or invisible parent.
document.addEventListener('focusin', event => {
  let element = event.target.closest('.reveal');
  while (element) { finishReveal(element); element = element.parentElement.closest('.reveal'); }
});
document.addEventListener('transitionend', event => {
  if (event.propertyName === 'opacity' && event.target.matches('.reveal.is-visible')) {
    releaseRevealReservation(event.target);
    revealObserver?.unobserve(event.target);
  }
});
const portrait = $('.portrait');
portrait.addEventListener('pointermove', event => {
  if (motion.matches || event.pointerType === 'touch') return;
  const box = portrait.getBoundingClientRect();
  portrait.style.setProperty('--portrait-x', `${(0.5 - (event.clientY - box.top) / box.height) * 12}deg`);
  portrait.style.setProperty('--portrait-y', `${((event.clientX - box.left) / box.width - 0.5) * 16}deg`);
});
portrait.addEventListener('pointerleave', () => { portrait.style.setProperty('--portrait-x', '0deg'); portrait.style.setProperty('--portrait-y', '0deg'); });

let typingTimer;
const roles = ['Em formação', 'Entusiasta de tecnologia', 'Full Stack · automação · IA'];
let roleIndex = 0, charIndex = roles[0].length, deleting = true;
function typeRole() {
  if (motion.matches) { $('#typed-role').textContent = roles[0]; return; }
  const word = roles[roleIndex];
  charIndex += deleting ? -1 : 1;
  $('#typed-role').textContent = word.slice(0, Math.max(0, charIndex));
  let delay = deleting ? 35 : 70;
  if (charIndex <= 0) { deleting = false; roleIndex = (roleIndex + 1) % roles.length; delay = 350; }
  else if (charIndex >= word.length && !deleting) { deleting = true; delay = 2500; }
  typingTimer = setTimeout(typeRole, delay);
}
if (!motion.matches) typingTimer = setTimeout(typeRole, 4600);

const projects = [
  {
    id: 'connectclass', title: 'ConnectClass', image: 'assets/connectclass.jpeg', alt: 'Tela de cadastro do ConnectClass',
    summary: 'Uma conexão mais simples entre alunos e secretaria escolar. Dúvidas, sugestões e respostas em um só lugar.',
    status: 'TCC concluído · não publicado', tech: ['Node.js', 'HTML', 'CSS', 'JavaScript', 'SQL', 'Docker', 'Git/GitHub'],
    paragraphs: ['Plataforma de comunicação entre alunos e secretaria escolar. A proposta é facilitar a comunicação, reduzir filas e substituir processos em papel.', 'O ConnectClass foi o TCC de um grupo. Fiquei responsável pelo desenvolvimento da plataforma: front-end, back-end, banco de dados, versionamento e atividades de deploy.'],
    resources: ['Cadastro e login de usuários.', 'Envio e pesquisa de dúvidas, reclamações e sugestões.', 'Histórico de mensagens, horários e acompanhamento das respostas.', 'Painel de gestão para a secretaria responder às mensagens.'],
    learning: 'Node.js, banco de dados, Docker, Git/GitHub e ferramentas de IA como apoio ao desenvolvimento.',
    availability: 'O TCC está concluído. A aplicação ainda não foi publicada, o repositório GitHub é privado e não há demonstração pública.'
  },
  {
    id: 'next', title: 'NEXT', image: 'assets/next-core.gif', alt: 'Núcleo geométrico animado do assistente NEXT',
    summary: 'Meu assistente pessoal por voz. Automação para executar ações enquanto minha atenção está em outra tarefa.',
    status: 'Em desenvolvimento', tech: ['Python', 'Reconhecimento de voz', 'Síntese de fala', 'Automação'],
    paragraphs: ['O NEXT é meu assistente pessoal e uma das marcas dos meus projetos. Desenvolvi o design e o código usando Python e inteligência artificial como apoio.', 'A ideia é pedir uma ação por voz, como abrir o Firefox, enquanto faço outra tarefa. O projeto busca evoluir como orquestrador de automações e apoio à organização de tarefas e arquivos.'],
    resources: ['Comandos de voz para abrir o Firefox.', 'Abertura do Bloco de Notas, Calculadora e Explorador de Arquivos.', 'Reconhecimento de voz e síntese de fala no fluxo do assistente.'],
    learning: 'Automação e aplicação de inteligência artificial em tarefas do dia a dia.',
    availability: 'Em desenvolvimento, sem repositório GitHub ou demonstração públicos. A organização ampla de tarefas e arquivos continua em evolução; integrações externas dependem de configuração.'
  },
  {
    id: 'next-coin', title: 'NEXT COIN', image: 'assets/next-coin.png', alt: 'Tela de entrada do aplicativo de gestão financeira NEXT COIN',
    summary: 'Gestão financeira pessoal para organizar receitas, despesas, contas e investimentos registrados manualmente.',
    status: 'Em desenvolvimento', tech: ['HTML', 'CSS', 'JavaScript', 'SQL'],
    paragraphs: ['Aplicativo de gestão financeira pessoal. A proposta é acompanhar despesas, mostrar valores disponíveis para gastar e lembrar datas de pagamento.', 'Desenvolvi o design e trabalhei no front-end, back-end e banco de dados. O escopo atual prevê o registro manual das informações, sem conexão bancária.'],
    resources: ['Organização de receitas, gastos e contas.', 'Registro manual de investimentos.', 'Planejamento e acompanhamento das finanças pessoais.'],
    learning: 'Gestão financeira e criação de ferramentas úteis para o cotidiano.',
    availability: 'Em desenvolvimento, sem repositório GitHub ou demonstração públicos. O agente COIN com IA e uma possível integração com dados da B3 são planos, não integrações prontas.'
  }
];
const projectImage = project => project.id === 'next' && motion.matches ? 'assets/next-core-static.webp' : project.image;
$('#projects').innerHTML = projects.map(project => `<article class="project-card"><div class="project-image-wrap"><img class="project-image ${project.id === 'next' ? 'core' : ''}" src="${projectImage(project)}" alt="${project.alt}" width="500" height="253" loading="lazy" ${project.id === 'next' ? 'data-next-core' : ''}></div><h3>${project.title}</h3><p>${project.summary}</p><p class="project-tech">${project.tech.join(' · ')}</p><div class="project-footer"><span class="project-status">${project.status}</span><button data-project="${project.id}" aria-label="Detalhes de ${project.title}">Detalhes <span aria-hidden="true">→</span></button></div></article>`).join('');
$$('.project-card').forEach(card => card.classList.add('reveal'));
registerReveals($('#projects'));

const details = $('#detail-dialog');
function openDetails(title, body, imageHtml = '', status = '') {
  $('#detail-content').innerHTML = `${imageHtml}<h3 id="detail-title">${title}</h3>${status ? `<p class="detail-status">${status}</p>` : ''}<div class="detail-body">${body}</div>`;
  details.showModal();
  document.body.style.overflow = 'hidden';
  details.scrollTop = 0;
}
$$('[data-project]').forEach(button => button.addEventListener('click', () => {
  const project = projects.find(item => item.id === button.dataset.project);
  openDetails(project.title, `${project.paragraphs.map(p => `<p>${p}</p>`).join('')}<h4>Recursos</h4><ul>${project.resources.map(item => `<li>${item}</li>`).join('')}</ul><h4>Tecnologias</h4><div class="chips">${project.tech.map(item => `<span>${item}</span>`).join('')}</div><h4>Aprendizados</h4><p>${project.learning}</p><h4>Estado do projeto</h4><p>${project.availability}</p>`, `<img class="detail-image ${project.id === 'next' ? 'core' : ''}" src="${projectImage(project)}" alt="${project.alt}" ${project.id === 'next' ? 'data-next-core' : ''}>`, project.status);
}));
const highlights = {
  objetivo: { title: 'Meus interesses', body: '<p>Desenvolvimento Full Stack, automação e inteligência artificial aplicada ao desenvolvimento. Atualmente desenvolvo o NEXT, meu assistente pessoal e orquestrador de automações, e estou montando meu próprio homelab.</p>' },
  experiencia: { title: 'Experiência', body: '<p>Trabalhei como garçom freelancer em um buffet durante sete meses. Essa experiência me ajudou a desenvolver atendimento ao público, comunicação e trabalho em equipe.</p><h4>Desenvolvimento de projetos</h4><p>No TCC ConnectClass, fui responsável pelo desenvolvimento da plataforma, incluindo front-end, back-end, banco de dados, versionamento e atividades de deploy. Também desenvolvo o NEXT e o NEXT COIN.</p>' },
  formacao: { title: 'Formação', body: '<p>Atualmente estou na <strong>3ª série do Ensino Médio</strong> e no <strong>4º semestre do Técnico Integrado em Desenvolvimento de Sistemas</strong>.</p><p>Estudo programação desde pequeno e continuo aprofundando meus conhecimentos por meio de projetos e cursos. Os certificados reais estão disponíveis na aba Certificados.</p>' },
  vivencias: { title: 'Tecnologia além da sala de aula', body: '<p>Participei de feiras de tecnologia como Sebrae e PG Tech.</p><p>Também apresentei e divulguei o ConnectClass em um estande na feira de TCC da escola, compartilhando a proposta de facilitar a comunicação entre alunos e secretaria.</p>' }
};
$$('[data-highlight]').forEach(button => button.addEventListener('click', () => { const item = highlights[button.dataset.highlight]; openDetails(item.title, item.body); }));

function selectTab(name, focus = false) {
  $$('[role=tab]').forEach(tab => {
    const active = tab.dataset.tab === name;
    const panel = $(`#${tab.getAttribute('aria-controls')}`);
    if (!active && !panel.hidden) suspendReveals(panel);
    tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1;
    panel.hidden = !active;
    if (active && focus) tab.focus();
  });
  scheduleScrollUpdate();
}
$$('[role=tab]').forEach((tab, index, tabs) => {
  tab.addEventListener('click', () => selectTab(tab.dataset.tab));
  tab.addEventListener('keydown', event => {
    let next = index;
    if (event.key === 'ArrowRight') next = (index + 1) % tabs.length;
    else if (event.key === 'ArrowLeft') next = (index + tabs.length - 1) % tabs.length;
    else if (event.key === 'Home') next = 0;
    else if (event.key === 'End') next = tabs.length - 1;
    else return;
    event.preventDefault(); selectTab(tabs[next].dataset.tab, true);
  });
});
$$('[data-open-tab]').forEach(link => link.addEventListener('click', () => selectTab(link.dataset.openTab)));

const technologies = [
  ['HTML', 'Front-end', 'html5.svg'], ['CSS', 'Front-end', 'css3.svg'], ['JavaScript', 'Front-end', 'javascript.svg'], ['Node.js', 'Back-end', 'nodejs.svg'], ['Python', 'Back-end', 'python.svg'], ['SQL', 'Banco de dados', '@database'],
  ['Git', 'Ferramentas', 'git.svg'], ['GitHub', 'Ferramentas', 'github.svg'], ['Docker', 'Ferramentas', 'docker.svg'], ['Excel', 'Ferramentas', 'excel.svg'], ['APIs', 'Outros', '{}'], ['Automação', 'Outros', '@workflow'], ['IA aplicada', 'Outros', '@cpu']
];
$('#technologies').innerHTML = technologies.map(([name, category, symbol]) => `<div class="tech-card"><span class="tech-symbol" aria-hidden="true">${symbol.endsWith('.svg') ? `<img class="${name === 'GitHub' ? 'github-mark' : ''}" src="assets/tech/${symbol}" alt="" width="40" height="40" loading="lazy">` : symbol.startsWith('@') ? icon(symbol.slice(1)) : symbol}</span><strong>${name}</strong><small>${category}</small></div>`).join('');
$$('.tech-card').forEach(card => card.classList.add('reveal'));
registerReveals($('#technologies'));

let certificates = [], certificateIndex = 0;
const certificateDialog = $('#certificate-dialog');
function showCertificate(index) {
  certificateIndex = (index + certificates.length) % certificates.length;
  const certificate = certificates[certificateIndex];
  $('#certificate-title').textContent = certificate.title;
  $('#certificate-position').textContent = `${certificateIndex + 1} de ${certificates.length} · ${certificate.institution}`;
  $('#certificate-image').src = certificate.thumbnail;
  $('#certificate-image').alt = `Certificado de Victor: ${certificate.title}`;
  $('#certificate-original').href = certificate.pdf;
}
async function loadCertificates() {
  try {
    const response = await fetch('assets/asset-manifest.json');
    if (!response.ok) throw new Error('Manifesto indisponível');
    certificates = (await response.json()).certificates;
    $('#certificate-count').textContent = certificates.length;
    const grid = $('#certificates');
    grid.replaceChildren();
    certificates.forEach((certificate, index) => {
      const button = document.createElement('button'); button.className = 'certificate-card reveal'; button.setAttribute('aria-label', `Ampliar certificado: ${certificate.title}`);
      const img = document.createElement('img'); img.src = certificate.thumbnail; img.alt = certificate.title; img.loading = 'lazy'; img.width = certificate.thumbnailWidth; img.height = certificate.thumbnailHeight;
      const caption = document.createElement('span'); caption.className = 'certificate-caption'; caption.textContent = certificate.title;
      const institution = document.createElement('small'); institution.textContent = `${certificate.institution} · ${certificate.hours}h`; caption.append(institution); button.append(img, caption); grid.append(button);
      button.addEventListener('click', () => { showCertificate(index); certificateDialog.showModal(); document.body.style.overflow = 'hidden'; });
    });
    registerReveals(grid);
  } catch {
    $('#certificates').innerHTML = '<p>Não foi possível carregar a galeria. <button class="button button-outline" id="retry-certificates">Tentar novamente</button></p>';
    $('#retry-certificates').addEventListener('click', loadCertificates);
  }
}
loadCertificates();
$('.certificate-prev').addEventListener('click', () => showCertificate(certificateIndex - 1));
$('.certificate-next').addEventListener('click', () => showCertificate(certificateIndex + 1));
certificateDialog.addEventListener('keydown', event => { if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') { event.preventDefault(); showCertificate(certificateIndex + (event.key === 'ArrowRight' ? 1 : -1)); } });
$$('dialog').forEach(dialog => {
  $('.dialog-close', dialog).addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', event => { if (event.target === dialog) { const r = dialog.getBoundingClientRect(); if (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom) dialog.close(); } });
  dialog.addEventListener('close', () => { document.body.style.overflow = ''; });
});

$('#contact-form').addEventListener('submit', event => {
  event.preventDefault();
  const data = new FormData(event.currentTarget);
  const name = String(data.get('name')).trim(); const email = String(data.get('email')).trim(); const message = String(data.get('message')).trim();
  if (!name || !message) { $('#contact-feedback').textContent = 'Preencha seu nome e uma mensagem.'; return; }
  const subject = encodeURIComponent(`Contato pelo portfólio — ${name}`);
  const body = encodeURIComponent(`Nome: ${name}\nE-mail: ${email}\n\n${message}`);
  $('#contact-feedback').textContent = 'Abra seu aplicativo de e-mail para revisar e enviar. Nenhuma mensagem foi enviada pelo site.';
  window.location.href = `mailto:victornext32@gmail.com?subject=${subject}&body=${body}`;
});

const COMMENT_KEY = 'victor-local-comments-v1';
function validComment(item) {
  return item && typeof item.id === 'string' && typeof item.author === 'string' && item.author.length <= 80 && typeof item.message === 'string' && item.message.length <= 1500 && typeof item.date === 'string' && Number.isFinite(Date.parse(item.date)) && (!item.avatar || /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(item.avatar)) && (item.avatar?.length || 0) < 200000;
}
let comments = [];
try { const saved = JSON.parse(storage.get(COMMENT_KEY, '[]')); comments = Array.isArray(saved) ? saved.filter(validComment).slice(-30) : []; } catch {}
function renderComments() {
  $('#comment-count').textContent = `(${comments.length})`;
  const list = $('#comments-list'); list.replaceChildren();
  if (!comments.length) { list.innerHTML = `<div class="comment-empty">${icon('message')}<strong>A conversa começa aqui</strong><p>Ainda não há comentários salvos neste navegador.</p></div>`; return; }
  [...comments].reverse().forEach(comment => {
    const article = document.createElement('article'); article.className = 'comment';
    const avatar = document.createElement(comment.avatar ? 'img' : 'span'); avatar.className = 'comment-avatar';
    if (comment.avatar) { avatar.src = comment.avatar; avatar.alt = ''; } else avatar.innerHTML = icon('user');
    const content = document.createElement('div'); content.className = 'comment-content';
    const heading = document.createElement('div'); heading.className = 'comment-heading';
    const name = document.createElement('strong'); name.textContent = comment.author;
    const date = document.createElement('time'); date.dateTime = comment.date; date.textContent = new Date(comment.date).toLocaleDateString('pt-BR'); heading.append(name, date);
    const message = document.createElement('p'); message.textContent = comment.message;
    const remove = document.createElement('button'); remove.className = 'comment-delete'; remove.textContent = 'Excluir deste navegador'; remove.setAttribute('aria-label', `Excluir comentário de ${comment.author}`);
    remove.addEventListener('click', () => { const remaining = comments.filter(item => item.id !== comment.id); if (!storage.set(COMMENT_KEY, JSON.stringify(remaining))) { $('#comment-feedback').textContent = 'O navegador não permitiu excluir o comentário salvo.'; return; } comments = remaining; renderComments(); $('#comment-feedback').textContent = 'Comentário excluído deste navegador.'; $('#comment-form button[type=submit]').focus({ preventScroll: true }); });
    content.append(heading, message, remove); article.append(avatar, content); list.append(article);
  });
}
renderComments();
const avatarInput = $('#avatar-input');
avatarInput.addEventListener('change', () => {
  const file = avatarInput.files[0];
  if (file && (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type) || file.size > 5 * 1024 * 1024)) { avatarInput.value = ''; $('#upload-text').textContent = 'Escolher foto de perfil'; $('#comment-feedback').textContent = 'Escolha uma imagem PNG, JPG ou WebP de até 5 MB.'; return; }
  $('#upload-text').textContent = file ? file.name : 'Escolher foto de perfil';
  $('#comment-feedback').textContent = '';
});
async function avatarData(file) {
  if (!file) return null;
  const bitmap = await createImageBitmap(file);
  try { const canvas = document.createElement('canvas'); canvas.width = canvas.height = 96; const ctx = canvas.getContext('2d'); const size = Math.min(bitmap.width, bitmap.height); ctx.drawImage(bitmap, (bitmap.width - size) / 2, (bitmap.height - size) / 2, size, size, 0, 0, 96, 96); return canvas.toDataURL('image/webp', .75); }
  finally { bitmap.close(); }
}
$('#comment-form').addEventListener('submit', async event => {
  event.preventDefault();
  const form = event.currentTarget, submit = $('button[type=submit]', form), data = new FormData(form);
  const author = String(data.get('author')).trim(), message = String(data.get('comment')).trim();
  if (!author || !message) { $('#comment-feedback').textContent = 'Preencha seu nome e uma mensagem.'; return; }
  if (comments.length >= 30) { $('#comment-feedback').textContent = 'Este mural local atingiu 30 comentários. Exclua um comentário para liberar espaço.'; return; }
  submit.disabled = true;
  try {
    const comment = { id: crypto.randomUUID(), author, message, date: new Date().toISOString(), avatar: await avatarData(avatarInput.files[0]) };
    const next = [...comments, comment];
    if (!storage.set(COMMENT_KEY, JSON.stringify(next))) throw new Error('storage');
    comments = next; renderComments(); form.reset(); $('#upload-text').textContent = 'Escolher foto de perfil'; $('#comment-feedback').textContent = 'Comentário salvo apenas neste navegador. Não foi publicado online nem enviado ao Victor.';
  } catch (error) { $('#comment-feedback').textContent = error.message === 'storage' ? 'O navegador não permitiu salvar. Seu comentário não foi armazenado.' : 'Não foi possível ler essa foto. Escolha outra imagem e tente novamente.'; }
  finally { submit.disabled = false; }
});

motion.addEventListener('change', () => {
  clearTimeout(typingTimer);
  if (motion.matches) {
    $('#typed-role').textContent = roles[0]; finishIntro();
    cancelAnimationFrame(revealFrame); revealFrame = 0;
    $$('.reveal').forEach(finishReveal);
    portrait.style.setProperty('--portrait-x', '0deg'); portrait.style.setProperty('--portrait-y', '0deg');
  }
  else typingTimer = setTimeout(typeRole, 2500);
  $$('[data-next-core]').forEach(img => { img.src = motion.matches ? 'assets/next-core-static.webp' : 'assets/next-core.gif'; });
});
$('#year').textContent = new Date().getFullYear();

import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import assert from 'node:assert/strict';

const root = resolve('docs/validation-motion-20261018');
const report = JSON.parse(await readFile(resolve(root, 'run-1/results.json'), 'utf8'));
const desktop = report.contexts.find(item => item.name === 'desktop-normal');
const starts = desktop.events.filter(event => event.type === 'transitionstart');
const first = text => starts.find(event => event.text === text);
const exact = text => { const event = first(text); assert.ok(event, `Missing animation: ${text}`); return event; };
const order = texts => {
  const events = texts.map(exact);
  assert.ok(events.every((event, index) => !index || event.time > events[index - 1].time));
  return events.map(({ text, time, translate, delay }) => ({ text, time, translate, delay }));
};
const numeric = {
  textSequence: order(['Olá, eu souVictor Rogenare', 'Sou estudante do Ensino Médio e do curso Técnico Integr', 'Tenho me interessado cada vez mais por inteligência art', 'Download CV', 'Ver Projetos']),
  fields: order(['O seu nome', 'O seu e-mail', 'A sua mensagem', 'Enviar mensagem']),
  showcase: order(['Vitrine de Portfólio', 'Explore projetos, certificações e tecnologias que refle']),
  photo: starts.find(event => event.classes.includes('portrait-wrap')),
  firstText: starts.find(event => event.classes.includes('from-left')),
  reducedTransitionEvents: report.contexts.filter(item => item.reducedMotion === 'reduce').map(item => ({ name: item.name, count: item.events.length })),
  cancellationEvents: report.contexts.filter(item => item.reducedMotion !== 'reduce').map(item => ({ name: item.name, count: item.events.filter(event => event.type === 'transitioncancel').length }))
};
assert.ok(parseFloat(numeric.photo.translate) > 0);
assert.ok(parseFloat(numeric.firstText.translate) < 0);
assert.ok(numeric.reducedTransitionEvents.every(item => item.count === 0));
await writeFile(resolve(root, 'motion-measurements.json'), JSON.stringify(numeric, null, 2));

const ffmpeg = resolve('.tools/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe');
const frames = resolve(root, 'filmstrips');
await mkdir(frames, { recursive: true });
const scenes = [
  ['about', 4.4], ['highlights', 5.8], ['showcase', 7.2], ['contact', 9.9], ['fields-channels', 11.2]
];
for (const [name, time] of scenes) {
  const result = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-ss', String(time), '-i', desktop.video,
    '-vf', 'fps=5,scale=512:-1,tile=4x2', '-frames:v', '1', resolve(frames, `${name}.jpg`)], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr);
}
const mobileScenes = [['mobile-about', 5.8], ['mobile-contact', 12]];
const mobileVideo = report.contexts.find(context => context.name === 'mobile-normal').video;
for (const [name, time] of mobileScenes) {
  const result = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-ss', String(time), '-i', mobileVideo,
    '-vf', 'fps=5,scale=195:-1,tile=4x2', '-frames:v', '1', resolve(frames, `${name}.jpg`)], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr);
}
for (const name of ['desktop-normal', 'mobile-normal']) {
  const video = report.contexts.find(context => context.name === name).video;
  const result = spawnSync(ffmpeg, ['-hide_banner', '-loglevel', 'error', '-y', '-i', video,
    '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', resolve(root, `${name}.mp4`)], { encoding: 'utf8' });
  if (result.status !== 0) throw new Error(result.stderr);
}
console.log(JSON.stringify({ numericChecks: 'passed', filmstrips: [...scenes, ...mobileScenes].map(([name]) => name), videos: ['desktop-normal.mp4', 'mobile-normal.mp4'] }));

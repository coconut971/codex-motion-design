import test from 'node:test';
import assert from 'node:assert/strict';
import { parseArgs, sampleTimes, inspectionTimes, render, verifyEncodedAudio } from '../scripts/render.mjs';
import { synthesizeAudio } from '../scripts/audio.mjs';
import { mkdir, writeFile, readFile, readdir, rm, symlink } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { repositoryRoot, serve } from '../scripts/serve.mjs';

const project = { duration: 2, fps: 30, frameCount: 60, bpm: 120, beatOffset: 0, cuts: [1], events: [{ id: 'contact', at: 0.5, sound: { hz: 220, gain: 0.1, duration: 0.2 } }] };

test('shutter stays inside the current shot, including a cut frame', () => {
  assert.deepEqual(sampleTimes(1, project, 1, 1), [1]);
  assert.ok(sampleTimes(1, project, 8, 1).every(t => t >= 1));
  assert.ok(sampleTimes(0, project, 8, 1).every(t => t >= 0));
  assert.ok(sampleTimes(0.99, project, 8, 1).every(t => t < 1));
  assert.ok(sampleTimes(59 / 30, project, 8, 1).every(t => t < 2));
});

test('CLI rejects ambiguous or invalid exports', () => {
  assert.equal(parseArgs(['--draft']).scale, 0.5);
  assert.equal(parseArgs(['--draft', '--scale=.25']).scale, 0.25);
  assert.throws(() => parseArgs(['--sheet', '--strip=0:1']));
  assert.throws(() => parseArgs(['--samples=0']));
  assert.throws(() => parseArgs(['--shutter=2']));
  assert.throws(() => parseArgs(['--timeout=Infinity']));
  assert.throws(() => parseArgs(['--timeout=2147483648']));
  assert.throws(() => parseArgs(['--unknown']));
  assert.throws(() => inspectionTimes(parseArgs(['--stills=2']), project));
});

test('beat sheet handles offsets without scanning historical beats, includes endpoints', () => {
  const options = parseArgs(['--sheet']);
  assert.deepEqual(inspectionTimes(options, { ...project, beatOffset: 5 }), [0, 59 / 30]);
  assert.equal(inspectionTimes(options, { ...project, beatOffset: -1e6 })[0], 0);
  assert.throws(() => inspectionTimes(options, { ...project, beatOffset: -1e300 }), /numeric precision/);
  assert.throws(() => inspectionTimes(options, { ...project, bpm: 1e9 }), /image limit/);
});

test('local server confines files and denies dotfiles', async () => {
  const directory = path.join(repositoryRoot, `work/server-test-${randomUUID()}`);
  const root = path.join(directory, 'public');
  await mkdir(root, { recursive: true });
  await writeFile(path.join(root, 'normal.txt'), 'normal');
  await writeFile(path.join(root, '.env'), 'hidden');
  await writeFile(path.join(directory, 'secret.txt'), 'outside');
  let local;
  try {
    local = await serve({ root, port: 0 });
    assert.equal(await (await fetch(`${local.url}/normal.txt`)).text(), 'normal');
    assert.equal((await fetch(`${local.url}/.env`)).status, 403);
    assert.equal((await fetch(`${local.url}/%2e%2e%2Fsecret.txt`)).status, 403);
    assert.equal((await fetch(`${local.url}/normal.txt`, { method: 'POST' })).status, 405);
    try {
      await symlink(directory, path.join(root, 'escape'), 'junction');
      assert.equal((await fetch(`${local.url}/escape/secret.txt`)).status, 403);
    } catch (error) { if (!['EPERM', 'EACCES', 'ENOTSUP'].includes(error.code)) throw error; }
  } finally {
    await local?.close();
    // directory is a UUID child of this repository's ignored work directory.
    assert.ok(path.relative(path.join(repositoryRoot, 'work'), directory).startsWith('server-test-'));
    await rm(directory, { recursive: true, force: true });
  }
});

test('contact strip includes consecutive frame intervals and preserves fractional start', () => {
  const times = inspectionTimes(parseArgs(['--strip=0.5:0.6']), project);
  assert.equal(times.length, 4);
  assert.equal(times[0], 0.5);
  assert.ok(Math.abs(times[3] - 0.6) < 1e-10);
});

test('sound uses event time, has exact PCM duration, zero attack and peak headroom', () => {
  const a = synthesizeAudio(project), b = synthesizeAudio(project);
  assert.ok(a.buffer.equals(b.buffer));
  assert.equal(a.stats.sampleFrames, 96000);
  assert.equal(a.buffer.length, 44 + 96000 * 4);
  assert.equal(a.stats.cues[0].startSample, 24000);
  assert.equal(a.buffer.readInt16LE(44 + 24000 * 4), 0);
  assert.equal(a.buffer.readInt16LE(44 + 23999 * 4), 0);
  assert.ok(a.stats.peakDbFS <= -1);
  assert.ok(a.stats.peakDbFS > -1.01);
  assert.equal(a.stats.clippedSamples, 0);
  assert.equal(a.stats.cues[0].offsetSeconds, 0);
});

test('failed frame capture preserves an existing video and cleans partial MP4', { skip: process.env.RENDER_INTEGRATION !== '1', timeout: 60000 }, async () => {
  const relative = `work/render-failure-${randomUUID()}`;
  const directory = path.join(repositoryRoot, relative);
  await mkdir(directory, { recursive: true });
  const output = path.join(directory, 'existing.mp4');
  await writeFile(output, 'existing video marker');
  const fixture = `<!doctype html><link rel="icon" href="data:,"><canvas id="film"></canvas><script type="module">
    import {compileProject} from '/lib/project.mjs';
    window.__motionReady = (async () => {
      const project = compileProject(await (await fetch('/project.json')).json());
      const scale = Number(new URLSearchParams(location.search).get('scale') || 1);
      const canvas = document.querySelector('#film'); canvas.width = Math.round(project.width*scale); canvas.height = Math.round(project.height*scale);
      const ctx = canvas.getContext('2d'); window.film = {project};
      window.seek = t => { if(t>1 && t<1.2) throw new Error('Intentional frame capture failure'); ctx.fillStyle='#f1e8d7';ctx.fillRect(0,0,canvas.width,canvas.height); return {time:t}; };
    })();
  </script>`;
  await writeFile(path.join(directory, 'fixture.html'), fixture);
  try {
    await assert.rejects(render(parseArgs([`--html=/${relative}/fixture.html`, '--draft', '--scale=.1', `--out=${relative}/existing.mp4`, '--overwrite'])), /Intentional frame capture failure/);
    assert.equal(await readFile(output, 'utf8'), 'existing video marker');
    assert.equal((await readdir(directory)).filter(name => name.includes('.partial-')).length, 0);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('unresolved readiness promise has a real deadline and closes browser/server', { skip: process.env.RENDER_INTEGRATION !== '1', timeout: 30000 }, async () => {
  const relative = `work/render-timeout-${randomUUID()}`;
  const directory = path.join(repositoryRoot, relative);
  await mkdir(directory, { recursive: true });
  await writeFile(path.join(directory, 'fixture.html'), '<!doctype html><link rel="icon" href="data:,"><canvas id="film"></canvas><script>window.seek=t=>({time:t});window.__motionReady=new Promise(()=>{});</script>');
  try {
    await assert.rejects(render(parseArgs([`--html=/${relative}/fixture.html`, '--sheet', '--timeout=2000', `--out=${relative}/result.png`])), /Ready\/fonts\/animation frame wait timed out after 2000ms/);
    assert.equal((await readdir(directory)).filter(name => name.includes('.partial-') || name === 'result.png').length, 0);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test('MP4 retains complete audio through the final cue after video encoder lookahead', { skip: process.env.RENDER_INTEGRATION !== '1', timeout: 60000 }, async () => {
  const relative = `work/render-audio-${randomUUID()}`;
  const directory = path.join(repositoryRoot, relative);
  await mkdir(directory, { recursive: true });
  try {
    const manifest = await render(parseArgs(['--draft', '--scale=.1', `--out=${relative}/complete.mp4`]));
    assert.equal(manifest.checks.decode.decodedFrames, 240);
    const audio = manifest.checks.decode.encodedAudio;
    assert.equal(audio.decodedBytes, audio.decodedSampleFrames * 4);
    assert.ok(audio.duration >= 8 && audio.duration <= 8 + 1024 / 48000);
    const finalCue = audio.cues.find(cue => cue.id === 'resolve');
    assert.equal(finalCue.startSample, 6 * 48000);
    assert.ok(finalCue.rms > 0.001, `Final cue is missing or inaudible in decoded AAC: RMS ${finalCue.rms}`);
    assert.ok(finalCue.peak > 0.01);
    const ffmpeg = process.env.FFMPEG_PATH || 'ffmpeg';
    const truncated = path.join(directory, 'truncated.mp4');
    const cut = spawnSync(ffmpeg, ['-hide_banner', '-v', 'error', '-y', '-i', path.join(directory, 'complete.mp4'), '-t', '5', '-c', 'copy', truncated], { windowsHide: true, timeout: 20000, encoding: 'utf8' });
    assert.equal(cut.status, 0, cut.stderr);
    await assert.rejects(verifyEncodedAudio(ffmpeg, truncated, { duration: 8, events: [] }), /Decoded audio has .*expected 384000/);
  } finally {
    assert.ok(path.relative(path.join(repositoryRoot, 'work'), directory).startsWith('render-audio-'));
    await rm(directory, { recursive: true, force: true });
  }
});

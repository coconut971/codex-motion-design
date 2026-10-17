import { readFile, writeFile, mkdir, access, rename, rm, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { createHash, randomUUID } from 'node:crypto';
import { serve, repositoryRoot } from './serve.mjs';
import { writeAudio } from './audio.mjs';
import { compileProject, beatTime } from '../lib/project.mjs';

export function parseArgs(argv) {
  const result = { scale: 1, samples: 1, shutter: 0.5, timeout: 30000, html: '/examples/signal.html', project: 'project.json' };
  const booleans = new Set(['draft', 'sheet', 'overwrite', 'no-audio']);
  const values = new Set(['scale', 'samples', 'shutter', 'timeout', 'html', 'project', 'out', 'stills', 'strip', 'crop', 'chrome', 'ffmpeg']);
  for (const arg of argv) {
    const match = /^--([a-z-]+)(?:=(.*))?$/.exec(arg);
    if (!match || (!booleans.has(match[1]) && !values.has(match[1]))) throw new Error(`Unknown option: ${arg}`);
    if (booleans.has(match[1])) {
      if (match[2] !== undefined) throw new Error(`Flag has no value: ${arg}`);
      result[match[1]] = true;
    } else {
      if (!match[2]) throw new Error(`Expected --${match[1]}=value`);
      result[match[1]] = match[2];
    }
  }
  for (const name of ['scale', 'samples', 'shutter', 'timeout']) result[name] = Number(result[name]);
  if (result.draft && !argv.some(arg => arg.startsWith('--scale='))) result.scale = 0.5;
  if (!(result.scale > 0 && result.scale <= 2) || !Number.isInteger(result.samples) || result.samples < 1 || result.samples > 32 || !(result.shutter >= 0 && result.shutter <= 1) || !Number.isFinite(result.timeout) || result.timeout <= 0 || result.timeout > 2147483647) throw new Error('Expected 0 < scale <= 2, integer samples 1–32, shutter 0–1 and finite positive timeout up to 2147483647 milliseconds.');
  if ([result.sheet, result.stills, result.strip].filter(Boolean).length > 1) throw new Error('Choose one of --sheet, --stills, --strip.');
  result.mode = result.sheet ? 'sheet' : result.stills ? 'stills' : result.strip ? 'strip' : 'video';
  result.out ||= result.mode === 'video' ? (result.draft ? 'out/draft.mp4' : 'out/final.mp4') : result.mode === 'stills' ? 'out/stills.png' : `out/${result.mode}.png`;
  if (result.crop) {
    result.crop = result.crop.split(',').map(Number);
    if (result.crop.length !== 4 || result.crop.some(n => !Number.isFinite(n)) || result.crop[0] < 0 || result.crop[1] < 0 || result.crop[2] <= 0 || result.crop[3] <= 0) throw new Error('Crop is logical x,y,width,height, with positive dimensions.');
  }
  return result;
}

/** Box shutter centered on n/fps, constrained to the shot containing that time. */
export function sampleTimes(time, project, samples = 1, shutter = 0.5) {
  let start = 0, end = project.duration;
  for (const cut of project.cuts ?? []) {
    if (cut <= time) start = cut;
    else { end = cut; break; }
  }
  return Array.from({ length: samples }, (_, i) => Math.max(start, Math.min(end - 1e-9, time + ((i + 0.5) / samples - 0.5) * shutter / project.fps)));
}

function assertTimes(times, project) {
  if (!times.length || times.length > 2000 || times.some(t => !Number.isFinite(t) || t < 0 || t >= project.duration)) throw new Error('Times must be within [0, duration), at most 2000 images.');
  return times;
}

export function inspectionTimes(options, project) {
  if (options.mode === 'stills') return assertTimes(options.stills.split(',').map(Number), project);
  if (options.mode === 'strip') {
    const interval = options.strip.split(':').map(Number);
    if (interval.length !== 2 || interval.some(t => !Number.isFinite(t)) || interval[1] < interval[0]) throw new Error('Strip is --strip=start:end in seconds.');
    const [start, end] = interval;
    return assertTimes(Array.from({ length: Math.floor((end - start) * project.fps + 1e-7) + 1 }, (_, i) => start + i / project.fps), project);
  }
  const times = [0];
  const step = 60 / project.bpm;
  const firstBeat = Math.max(0, Math.ceil(-project.beatOffset / step));
  const count = Math.max(0, Math.ceil((project.duration - project.beatOffset) / step) - firstBeat);
  if (!Number.isSafeInteger(firstBeat) || !Number.isSafeInteger(count) || count > 1998) throw new Error('Beat sheet exceeds image limit or numeric precision; adjust BPM/beatOffset or choose --stills.');
  for (let i = 0; i < count; i++) {
    const t = beatTime(project, firstBeat + i);
    if (t >= project.duration) break;
    if (t >= 0) times.push(t);
  }
  times.push((project.frameCount - 1) / project.fps);
  return assertTimes([...new Set(times)].sort((a, b) => a - b), project);
}

function subprocess(command, args, { timeout = 120000, pipe = false, binary = false, onStdout } = {}) {
  const child = spawn(command, args, { windowsHide: true, stdio: [pipe ? 'pipe' : 'ignore', 'pipe', 'pipe'] });
  let stdout = '', stderr = '', stdoutBytes = 0, killed = false;
  child.stdout?.on('data', data => { stdoutBytes += data.length; if (!binary) stdout = (stdout + data).slice(-65536); onStdout?.(data); });
  child.stderr?.on('data', data => { stderr = (stderr + data).slice(-65536); });
  // Stream errors are reported by the exit promise, preventing unhandled EPIPE.
  child.stdin?.on('error', () => {});
  const timer = setTimeout(() => { killed = true; child.kill('SIGKILL'); }, timeout);
  const done = new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('close', code => {
      clearTimeout(timer);
      if (code !== 0) reject(new Error(`${command} ${killed ? 'timed out' : `exited ${code}`}\n${stderr}`));
      else resolve({ stdout, stderr, stdoutBytes });
    });
  });
  // A consumer may spend time rendering before awaiting; retain rejection for it.
  done.catch(() => {});
  return { child, done };
}

export async function verifyEncodedAudio(ffmpeg, file, project) {
  const rate = 48000, bytesPerFrame = 4;
  let pending = Buffer.alloc(0), sampleCursor = 0;
  const cues = project.events.filter(event => event.sound).map(event => ({ id: event.id, startSample: Math.round(event.at * rate), endSample: Math.min(Math.round(project.duration * rate), Math.round((event.at + event.sound.duration) * rate)), squareSum: 0, sampleValues: 0, peak: 0 }));
  const decoded = await subprocess(ffmpeg, ['-hide_banner', '-v', 'error', '-xerror', '-i', file, '-map', '0:a:0', '-vn', '-ar', String(rate), '-ac', '2', '-c:a', 'pcm_s16le', '-f', 's16le', 'pipe:1'], {
    binary: true, timeout: 120000,
    onStdout(data) {
      const bytes = pending.length ? Buffer.concat([pending, data]) : data;
      const frames = Math.floor(bytes.length / bytesPerFrame);
      for (let i = 0; i < frames; i++) {
        const left = bytes.readInt16LE(i * bytesPerFrame) / 32768;
        const right = bytes.readInt16LE(i * bytesPerFrame + 2) / 32768;
        const at = sampleCursor + i;
        for (const cue of cues) if (at >= cue.startSample && at < cue.endSample) {
          cue.squareSum += left * left + right * right;
          cue.sampleValues += 2;
          cue.peak = Math.max(cue.peak, Math.abs(left), Math.abs(right));
        }
      }
      sampleCursor += frames;
      pending = Buffer.from(bytes.subarray(frames * bytesPerFrame));
    },
  }).done;
  if (decoded.stderr.trim()) throw new Error(`Audio decode errors: ${decoded.stderr}`);
  if (decoded.stdoutBytes % bytesPerFrame) throw new Error('Decoded audio has an incomplete stereo PCM sample frame.');
  const decodedFrames = decoded.stdoutBytes / bytesPerFrame;
  const expectedFrames = Math.round(project.duration * rate);
  // AAC packet padding is permitted; truncated audio is never accepted.
  if (decodedFrames < expectedFrames || decodedFrames > expectedFrames + 1024) throw new Error(`Decoded audio has ${decodedFrames} samples (${decodedFrames / rate}s); expected ${expectedFrames} to ${expectedFrames + 1024} samples.`);
  return { sampleRate: rate, channels: 2, bits: 16, decodedBytes: decoded.stdoutBytes, decodedSampleFrames: decodedFrames, duration: decodedFrames / rate, expectedDuration: project.duration, maximumAacPaddingSamples: 1024, cues: cues.map(({ squareSum, sampleValues, ...cue }) => ({ ...cue, sampleValues, rms: sampleValues ? Math.sqrt(squareSum / sampleValues) : 0 })) };
}

async function checkTarget(target, overwrite) {
  try { await access(target); } catch (error) { if (error.code === 'ENOENT') return; throw error; }
  if (!overwrite) throw new Error(`Already exists: ${target}. Use --overwrite to replace it.`);
}

async function atomicWrite(target, buffer) {
  const temporary = `${target}.partial-${randomUUID()}`;
  try { await writeFile(temporary, buffer); await rename(temporary, target); }
  finally { await rm(temporary, { force: true }); }
}

async function bounded(promise, timeout, label) {
  let timer;
  try {
    return await Promise.race([promise, new Promise((_, reject) => { timer = setTimeout(() => reject(new Error(`${label} timed out after ${timeout}ms`)), timeout); })]);
  } finally { clearTimeout(timer); }
}

async function sourceHashes(projectPath, htmlPath) {
  const sources = {};
  const visit = async relative => {
    const absolute = path.resolve(repositoryRoot, relative);
    let entries;
    try { entries = await readdir(absolute, { withFileTypes: true }); }
    catch (error) {
      if (error.code === 'ENOENT') return;
      if (error.code !== 'ENOTDIR') throw error;
      sources[relative.replaceAll(path.sep, '/')] = createHash('sha256').update(await readFile(absolute)).digest('hex');
      return;
    }
    for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
      if (entry.isDirectory() || entry.isFile()) await visit(path.join(relative, entry.name));
    }
  };
  const selectedHtml = decodeURIComponent(htmlPath.split('?')[0]).replace(/^\/+/, '');
  for (const file of [...new Set([projectPath, selectedHtml, 'package.json', 'package-lock.json', 'lib', 'examples', 'scripts'])]) await visit(file);
  return sources;
}

async function capture(page, times, crop, dimensions, timeout = 30000) {
  const base64 = await bounded(page.evaluate(({ times, crop, dimensions }) => {
    const source = document.querySelector('#film');
    if (!(source instanceof HTMLCanvasElement)) throw new Error('Expected canvas#film.');
    const [x, y, width, height] = crop;
    const output = document.createElement('canvas'); output.width = width; output.height = height;
    const context = output.getContext('2d', { willReadFrequently: true });
    const sum = new Float64Array(width * height * 4);
    for (const time of times) {
      const result = window.seek(time);
      if (result?.then) throw new Error('seek(t) must be synchronous.');
      if (!result || !Number.isFinite(result.time) || Math.abs(result.time - time) > 1e-6) throw new Error('seek(t) must return { time: t, ... }.');
      if (source.width !== dimensions[0] || source.height !== dimensions[1]) throw new Error('Canvas dimensions changed during capture.');
      context.clearRect(0, 0, width, height);
      context.drawImage(source, x, y, width, height, 0, 0, width, height);
      const pixels = context.getImageData(0, 0, width, height).data;
      for (let i = 0; i < pixels.length; i++) sum[i] += pixels[i];
    }
    const averaged = context.createImageData(width, height);
    for (let i = 0; i < sum.length; i++) averaged.data[i] = Math.round(sum[i] / times.length);
    context.putImageData(averaged, 0, 0);
    return output.toDataURL('image/png').split(',')[1];
  }, { times, crop, dimensions }), timeout, 'Frame capture');
  return Buffer.from(base64, 'base64');
}

async function composeSheet(page, frames, times, options, project) {
  return Buffer.from(await bounded(page.evaluate(async ({ frames, times, strip, fps }) => {
    const images = await Promise.all(frames.map(base64 => new Promise((resolve, reject) => {
      const image = new Image(); image.onload = () => resolve(image); image.onerror = reject; image.src = `data:image/png;base64,${base64}`;
    })));
    const cols = Math.min(images.length, strip ? 6 : 4);
    const tileWidth = Math.min(480, images[0].width);
    const tileHeight = Math.round(images[0].height * tileWidth / images[0].width);
    const labelHeight = 32, margin = 16;
    const canvas = document.createElement('canvas');
    canvas.width = cols * (tileWidth + margin) + margin;
    canvas.height = Math.ceil(images.length / cols) * (tileHeight + labelHeight + margin) + margin;
    const context = canvas.getContext('2d');
    context.fillStyle = '#e9e3d6'; context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = '#2e3c50'; context.font = '16px monospace';
    images.forEach((image, i) => {
      const x = margin + i % cols * (tileWidth + margin), y = margin + Math.floor(i / cols) * (tileHeight + labelHeight + margin);
      context.drawImage(image, x, y, tileWidth, tileHeight);
      context.fillText(`${times[i].toFixed(4)}s · frame ${(times[i] * fps).toFixed(2)}`, x + 4, y + tileHeight + 22);
    });
    return canvas.toDataURL('image/png').split(',')[1];
  }, { frames: frames.map(frame => frame.toString('base64')), times, strip: options.mode === 'strip', fps: project.fps }), options.timeout, 'Sheet composition'), 'base64');
}

export async function render(options) {
  const rawText = await readFile(path.resolve(repositoryRoot, options.project), 'utf8');
  const project = compileProject(JSON.parse(rawText));
  const output = path.resolve(repositoryRoot, options.out);
  const manifestPath = `${output}.manifest.json`;
  const ffmpeg = options.ffmpeg || process.env.FFMPEG_PATH || 'ffmpeg';
  const token = randomUUID();
  const temporary = `${output}.partial-${token}.mp4`;
  const audioPath = path.join(path.dirname(output), `${path.parse(output).name}.audio.wav`);
  const width = Math.round(project.width * options.scale), height = Math.round(project.height * options.scale);
  const crop = options.crop ? options.crop.map(value => Math.round(value * options.scale)) : [0, 0, width, height];
  if (crop[0] + crop[2] > width || crop[1] + crop[3] > height || crop[2] < 1 || crop[3] < 1) throw new Error('Crop exceeds the film or is empty after scaling.');
  if (options.mode === 'video' && (crop[2] % 2 || crop[3] % 2)) throw new Error('H.264 yuv420p requires even output dimensions.');
  await checkTarget(output, options.overwrite);
  await checkTarget(manifestPath, options.overwrite);
  if (options.mode === 'video' && !options['no-audio']) await checkTarget(audioPath, options.overwrite);
  await mkdir(path.dirname(output), { recursive: true });
  const manifest = {
    schemaVersion: 1, project: project.id, projectSha256: createHash('sha256').update(rawText).digest('hex'),
    runtime: { node: process.version, platform: process.platform, browser: null, ffmpeg: null },
    sources: await sourceHashes(options.project, options.html),
    parameters: { mode: options.mode, scale: options.scale, samples: options.samples, shutter: options.shutter, shutterUnits: 'frame intervals', pixelAverage: 'sRGB RGBA arithmetic mean before encoding', fps: project.fps, duration: project.duration, frameCount: project.frameCount, dimensions: [width, height], crop, endpoint: 'n/fps, n in [0, frameCount)' },
    outputs: { imageOrVideo: output }, checks: { ready: false, fonts: false, pageErrors: [], requestErrors: [], determinism: null, decode: null }, audio: null,
  };
  let local, browser, encoder;
  try {
    if (options.mode === 'video') {
      const version = await subprocess(ffmpeg, ['-version'], { timeout: options.timeout }).done;
      manifest.runtime.ffmpeg = version.stdout.split(/\r?\n/)[0];
    }
    local = await serve({ port: 0 });
    const { chromium } = await import('playwright');
    browser = await chromium.launch({ headless: true, executablePath: options.chrome || process.env.CHROME_PATH || undefined, timeout: options.timeout, args: ['--force-color-profile=srgb', '--disable-dev-shm-usage'] });
    manifest.runtime.browser = browser.version();
    const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 });
    page.setDefaultTimeout(options.timeout);
    page.on('pageerror', error => manifest.checks.pageErrors.push(error.message));
    page.on('requestfailed', request => manifest.checks.requestErrors.push(`${request.url()}: ${request.failure()?.errorText}`));
    page.on('response', response => { if (response.status() >= 400 && !response.url().endsWith('/favicon.ico')) manifest.checks.requestErrors.push(`${response.status()} ${response.url()}`); });
    await page.goto(`${local.url}${options.html}${options.html.includes('?') ? '&' : '?'}scale=${options.scale}`, { waitUntil: 'networkidle', timeout: options.timeout });
    await page.waitForFunction(() => !!window.__motionReady && typeof window.seek === 'function');
    await bounded(page.evaluate(async () => { await window.__motionReady; await document.fonts.ready; await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))); }), options.timeout, 'Ready/fonts/animation frame wait');
    manifest.checks.ready = true; manifest.checks.fonts = true;
    const browserProject = await bounded(page.evaluate(() => window.film?.project), options.timeout, 'Project read');
    if (!browserProject || JSON.stringify(browserProject) !== JSON.stringify(project)) throw new Error('Browser project differs from renderer project.json. Select a matching HTML/project pair.');
    const actual = await page.locator('#film').evaluate(canvas => [canvas.width, canvas.height]);
    if (actual[0] !== width || actual[1] !== height) throw new Error(`Expected ${width}×${height} canvas; got ${actual.join('×')}. The HTML must honor ?scale=.`);
    const failOnErrors = () => { if (manifest.checks.pageErrors.length || manifest.checks.requestErrors.length) throw new Error(`Browser errors: ${JSON.stringify(manifest.checks)}`); };
    failOnErrors();
    // Pixel equality after forward, backward and repeated seek. Animation is never played.
    const checkTime = Math.min(project.duration / 2, (project.frameCount - 1) / project.fps);
    const first = await capture(page, [checkTime], crop, [width, height], options.timeout);
    await capture(page, [0], crop, [width, height], options.timeout);
    const repeated = await capture(page, [checkTime], crop, [width, height], options.timeout);
    manifest.checks.determinism = { time: checkTime, sameBytes: first.equals(repeated), sha256: createHash('sha256').update(first).digest('hex'), scope: 'one same-browser backward/repeated seek; cross-platform equality not asserted' };
    if (!first.equals(repeated)) throw new Error('Repeated seek produced different pixels.');
    if (options.mode === 'video') {
      if (!options['no-audio']) {
        manifest.audio = await writeAudio(project, audioPath);
        manifest.outputs.audio = audioPath;
      }
      const args = ['-hide_banner', '-loglevel', 'warning', '-y', '-f', 'image2pipe', '-framerate', String(project.fps), '-vcodec', 'png', '-i', 'pipe:0'];
      if (!options['no-audio']) args.push('-i', audioPath, '-map', '0:v:0', '-map', '1:a:0');
      args.push('-vf', 'scale=out_color_matrix=bt709:out_range=tv', '-c:v', 'libx264', '-preset', options.draft ? 'veryfast' : 'medium', '-crf', options.draft ? '23' : '18', '-pix_fmt', 'yuv420p', '-color_range', 'tv', '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'iec61966-2-1');
      manifest.parameters.videoColor = { pixelFormat: 'yuv420p', range: 'limited', matrix: 'bt709', primaries: 'bt709', transfer: 'iec61966-2-1 (sRGB retained; not transformed to BT.709 transfer)' };
      if (!options['no-audio']) args.push('-c:a', 'aac', '-b:a', '192k', '-af', `atrim=duration=${project.duration}`);
      // The pipe supplies exactly N frames, then EOF. A video frame cap can
      // prematurely stop audio muxing with FFmpeg encoder lookahead.
      args.push('-t', String(project.duration), '-movflags', '+faststart', temporary);
      encoder = subprocess(ffmpeg, args, { pipe: true, timeout: Math.max(120000, project.duration * 120000) });
      for (let frame = 0; frame < project.frameCount; frame++) {
        const time = frame / project.fps;
        const png = await capture(page, sampleTimes(time, project, options.samples, options.shutter), crop, [width, height], options.timeout);
        failOnErrors();
        if (!encoder.child.stdin.write(png)) await Promise.race([once(encoder.child.stdin, 'drain'), encoder.done.then(() => { throw new Error('Encoder closed before all frames were written.'); })]);
        if (frame % project.fps === 0) console.log(`Frame ${frame}/${project.frameCount} · ${time.toFixed(2)}s`);
      }
      encoder.child.stdin.end();
      await encoder.done;
      const decoded = await subprocess(ffmpeg, ['-hide_banner', '-v', 'error', '-xerror', '-i', temporary, '-map', '0:v:0', ...(!options['no-audio'] ? ['-map', '0:a:0'] : []), '-f', 'null', '-'], { timeout: 120000 }).done;
      if (decoded.stderr.trim()) throw new Error(`Decode errors: ${decoded.stderr}`);
      // Count decoded video frames without requiring a separately installed ffprobe.
      const counted = await subprocess(ffmpeg, ['-hide_banner', '-v', 'error', '-i', temporary, '-map', '0:v:0', '-an', '-progress', 'pipe:1', '-f', 'null', '-'], { timeout: 120000 }).done;
      const counts = [...counted.stdout.matchAll(/^frame=(\d+)$/gm)];
      const decodedFrames = Number(counts.at(-1)?.[1]);
      if (decodedFrames !== project.frameCount) throw new Error(`Decoded ${decodedFrames} frames; expected ${project.frameCount}.`);
      const encodedAudio = options['no-audio'] ? null : await verifyEncodedAudio(ffmpeg, temporary, project);
      manifest.checks.decode = { succeeded: true, decodedFrames, videoAndAudio: !options['no-audio'], encodedAudio };
      await rename(temporary, output);
    } else {
      const times = inspectionTimes(options, project);
      const frames = [];
      for (const time of times) { frames.push(await capture(page, sampleTimes(time, project, options.samples, options.shutter), crop, [width, height], options.timeout)); failOnErrors(); }
      manifest.parameters.times = times;
      if (options.mode === 'stills' && frames.length === 1) await atomicWrite(output, frames[0]);
      else await atomicWrite(output, await composeSheet(page, frames, times, options, project));
      manifest.checks.decode = { succeeded: true, scope: 'Canvas PNG encoded in browser' };
    }
    failOnErrors();
    await atomicWrite(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
    console.log(`Wrote ${output}\nManifest: ${manifestPath}`);
    return manifest;
  } finally {
    if (encoder && encoder.child.exitCode === null) { encoder.child.stdin?.destroy(); encoder.child.kill('SIGKILL'); await encoder.done.catch(() => {}); }
    await browser?.close();
    await local?.close();
    await rm(temporary, { force: true });
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try { await render(parseArgs(process.argv.slice(2))); }
  catch (error) { console.error(error.stack || error); process.exitCode = 1; }
}

import { writeFile, mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compileProject } from '../core/project.mjs';

export const sampleRate = 48000;

/** Original sine/percussion cues. Event times come exclusively from compiled project JSON. */
export function synthesizeAudio(project) {
  const length = Math.round(project.duration * sampleRate);
  const left = new Float64Array(length);
  const right = new Float64Array(length);
  const cues = [];
  const contributions = [];
  for (const event of project.events) {
    if (!event.sound) continue;
    const { hz = 220, gain = 0.1, duration = 0.2, pan = 0 } = event.sound;
    if (![event.at, hz, gain, duration, pan].every(Number.isFinite) || event.at < 0 || hz <= 0 || hz >= sampleRate / 2 || gain < 0 || duration <= 0 || pan < -1 || pan > 1) throw new Error(`Invalid sound cue: ${event.id}`);
    const start = Math.round(event.at * sampleRate);
    const count = Math.min(Math.round(duration * sampleRate), length - start);
    if (start < 0 || count <= 0) throw new Error(`Sound cue outside film: ${event.id}`);
    const angle = (pan + 1) * Math.PI / 4;
    let firstNonzero = null;
    const isolated = new Float64Array(count);
    for (let i = 0; i < count; i++) {
      const t = i / sampleRate;
      const progress = i / Math.max(1, count - 1);
      // Zero-valued start/end, 4ms attack, short overtone. No accumulated oscillator state.
      const attack = Math.min(1, t / 0.004);
      const envelope = Math.sin(Math.PI * Math.min(1, attack) / 2) ** 2 * (1 - progress) ** 2 * Math.exp(-3 * progress);
      const value = gain * envelope * (Math.sin(2 * Math.PI * hz * t) + 0.18 * Math.sin(2 * Math.PI * hz * 2 * t)) / 1.18;
      isolated[i] = value * Math.max(Math.cos(angle), Math.sin(angle));
      if (value !== 0 && firstNonzero === null) firstNonzero = start + i;
      left[start + i] += value * Math.cos(angle);
      right[start + i] += value * Math.sin(angle);
    }
    cues.push({ id: event.id, requestedAt: event.at, startSample: start, startTime: start / sampleRate, offsetSeconds: start / sampleRate - event.at, mathematicalFirstNonzeroSample: firstNonzero, durationSamples: count });
    contributions.push(isolated);
  }
  let sourcePeak = 0;
  for (let i = 0; i < length; i++) sourcePeak = Math.max(sourcePeak, Math.abs(left[i]), Math.abs(right[i]));
  const ceiling = 10 ** (-1 / 20);
  const normalizationGain = sourcePeak ? ceiling / sourcePeak : 1;
  cues.forEach((cue, index) => {
    const first = contributions[index].findIndex(value => Math.round(value * normalizationGain * 32767) !== 0);
    cue.firstNonzeroSample = first < 0 ? null : cue.startSample + first;
    cue.firstNonzeroTime = first < 0 ? null : cue.firstNonzeroSample / sampleRate;
    cue.measurement = 'First nonzero 16-bit sample of this cue in isolation, after shared normalization; overlap can mask it in the mix.';
  });
  const pcm = Buffer.alloc(length * 4);
  let peak = 0, squareSum = 0, clippedSamples = 0;
  for (let i = 0; i < length; i++) {
    for (let channel = 0; channel < 2; channel++) {
      const value = (channel ? right[i] : left[i]) * normalizationGain;
      if (Math.abs(value) > 1) clippedSamples++;
      const quantized = Math.round(Math.max(-1, Math.min(1, value)) * 32767);
      pcm.writeInt16LE(quantized, i * 4 + channel * 2);
      const actual = quantized / 32768;
      peak = Math.max(peak, Math.abs(actual)); squareSum += actual * actual;
    }
  }
  const header = Buffer.alloc(44);
  header.write('RIFF'); header.writeUInt32LE(36 + pcm.length, 4); header.write('WAVEfmt ', 8);
  header.writeUInt32LE(16, 16); header.writeUInt16LE(1, 20); header.writeUInt16LE(2, 22);
  header.writeUInt32LE(sampleRate, 24); header.writeUInt32LE(sampleRate * 4, 28); header.writeUInt16LE(4, 32); header.writeUInt16LE(16, 34);
  header.write('data', 36); header.writeUInt32LE(pcm.length, 40);
  const rms = Math.sqrt(squareSum / (length * 2));
  return { buffer: Buffer.concat([header, pcm]), stats: { sampleRate, channels: 2, bits: 16, sampleFrames: length, duration: length / sampleRate, peak, peakDbFS: peak ? 20 * Math.log10(peak) : null, rms, rmsDbFS: rms ? 20 * Math.log10(rms) : null, sourcePeak, normalizationGain, clippedSamples, cues, loudness: 'Peak and RMS only; LUFS has not been measured.' } };
}

export async function writeAudio(project, target) {
  const { buffer, stats } = synthesizeAudio(project);
  await writeFile(target, buffer);
  return stats;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const root = fileURLToPath(new URL('../', import.meta.url));
  const args = Object.fromEntries(process.argv.slice(2).map(value => {
    const match = /^--(project|out)=(.+)$/.exec(value);
    if (!match) throw new Error(`Expected --project=project.json or --out=out/audio.wav; got ${value}`);
    return [match[1], match[2]];
  }));
  const project = compileProject(JSON.parse(await readFile(path.resolve(root, args.project || 'project.json'), 'utf8')));
  const target = path.resolve(root, args.out || 'out/audio.wav');
  await mkdir(path.dirname(target), { recursive: true });
  const stats = await writeAudio(project, target);
  await writeFile(`${target}.json`, `${JSON.stringify(stats, null, 2)}\n`);
  console.log(`Audio: ${target}\nPeak: ${stats.peakDbFS?.toFixed(3)} dBFS · RMS: ${stats.rmsDbFS?.toFixed(3)} dBFS · ${stats.duration}s`);
}

const finite = Number.isFinite;
export function beatTime(project, beat) { return project.beatOffset + beat * 60 / project.bpm; }
export function compileProject(raw) {
  const p = structuredClone(raw);
  for (const key of ['width', 'height', 'fps']) {
    if (!Number.isInteger(p[key]) || p[key] <= 0) throw new Error(`${key} must be a positive integer`);
  }
  if (p.width % 2 || p.height % 2) throw new Error('dimensions must be even for yuv420p');
  if (!finite(p.duration) || p.duration <= 0 || !finite(p.bpm) || p.bpm <= 0 ||
      !finite(p.beatOffset) || !Number.isInteger(p.seed) || !Number.isInteger(p.beatsPerBar) || p.beatsPerBar <= 0) throw new Error('invalid timing or seed');
  p.frameCount = Math.round(p.duration * p.fps);
  if (Math.abs(p.frameCount - p.duration * p.fps) > 1e-7) throw new Error('duration * fps must be integral');
  if (!Array.isArray(p.events) || !Array.isArray(p.cuts)) throw new Error('events and cuts arrays required');
  const ids = new Set(); let last = -Infinity;
  p.events = p.events.map(event => {
    if (typeof event.id !== 'string' || !event.id || ids.has(event.id) || !finite(event.beat)) throw new Error('unique event ids and finite beats required');
    ids.add(event.id);
    const at = beatTime(p, event.beat);
    if (at < 0 || at >= p.duration || at < last) throw new Error('events must be ordered inside film');
    last = at;
    if (event.sound) {
      const s = event.sound;
      if (![s.hz,s.gain,s.duration,s.pan].every(finite) || s.hz <= 0 || s.hz >= 24000 || s.gain < 0 || s.gain > 1 || s.duration <= 0 || Math.abs(s.pan) > 1) throw new Error('invalid sound');
    }
    return {...event, at};
  });
  if (p.cuts.some((v, i) => !finite(v) || v <= 0 || v >= p.duration || (i > 0 && v <= p.cuts[i-1]))) throw new Error('cuts must be ordered seconds inside film');
  for (const c of Object.values(p.palette ?? {})) if (!/^#[\da-f]{6}$/i.test(c)) throw new Error('palette must contain hex colours');
  return p;
}
export function eventTime(project, id) {
  const e = project.events.find(event => event.id === id);
  if (!e) throw new Error(`unknown cue: ${id}`);
  return e.at;
}

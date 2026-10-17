// Original implementation. Time is seconds; angular frequency is radians/second.
export const clamp = (x, lo = 0, hi = 1) => Math.min(hi, Math.max(lo, x));
export const mix = (a, b, p) => a + (b - a) * p;
export function progress(t, start, end) {
  if (!(end > start)) throw new RangeError('end must exceed start');
  return clamp((t - start) / (end - start));
}
export const smooth = p => { const q = clamp(p); return q * q * (3 - 2 * q); };

// Unit step: x'' + 2*zeta*omega*x' + omega^2*x = omega^2,
// x(0)=0, x'(0)=initialVelocity. No simulation, rounding or shared state.
export function spring(t, {frequencyHz = 3, dampingRatio = 0.8, initialVelocity = 0} = {}) {
  if (!Number.isFinite(t) || !Number.isFinite(frequencyHz) || frequencyHz <= 0 ||
      !Number.isFinite(dampingRatio) || dampingRatio < 0 || !Number.isFinite(initialVelocity)) {
    throw new RangeError('spring expects finite t, positive frequencyHz and nonnegative dampingRatio');
  }
  if (t <= 0) return 0;
  const w = 2 * Math.PI * frequencyHz, z = dampingRatio, v = initialVelocity;
  if (Math.abs(z - 1) < 1e-7) return 1 + Math.exp(-w * t) * (-1 + (v - w) * t);
  if (z < 1) {
    const a = z * w, wd = w * Math.sqrt(1 - z * z);
    return 1 - Math.exp(-a * t) * (Math.cos(wd * t) + (a - v) / wd * Math.sin(wd * t));
  }
  const q = z + Math.sqrt(z * z - 1), r1 = -w / q, r2 = -w * q;
  const c1 = (v + r2) / (r1 - r2), c2 = -1 - c1;
  return 1 + c1 * Math.exp(r1 * t) + c2 * Math.exp(r2 * t);
}

// Superpose target changes: continuous position/velocity, assuming a system at rest.
export function springTrack(t, initial, changes, options) {
  if (options?.initialVelocity) throw new RangeError('springTrack assumes an initial state at rest; initialVelocity must be zero');
  let result = initial, previous = initial, lastAt = -Infinity;
  for (const {at, value} of changes) {
    if (!Number.isFinite(at) || !Number.isFinite(value) || at < lastAt) throw new RangeError('ordered finite track required');
    result += (value - previous) * spring(t - at, options);
    previous = value; lastAt = at;
  }
  return result;
}

export function dampingRatio({stiffness, damping, mass = 1}) {
  if (![stiffness, damping, mass].every(Number.isFinite) || stiffness <= 0 || mass <= 0 || damping < 0) throw new RangeError('invalid physical spring');
  return damping / (2 * Math.sqrt(stiffness * mass));
}

// Stateless fixed variation. Include object id and, only for line boil, a time tick.
export function hash(seed, id) {
  let h = (2166136261 ^ seed) >>> 0;
  for (const c of String(id)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  h ^= h >>> 16; h = Math.imul(h, 0x7feb352d); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

export function clamp(value: number, min = 0, max = 1): number {
  return Math.min(max, Math.max(min, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function easeInOutSine(t: number): number {
  const c = clamp(t, 0, 1);
  return -(Math.cos(Math.PI * c) - 1) / 2;
}

/**
 * Exact CSS cubic-bezier(x1, y1, x2, y2) solver.
 */
export function cubicBezier(x1: number, y1: number, x2: number, y2: number): (x: number) => number {
  const cx = 3 * x1;
  const bx = 3 * (x2 - x1) - cx;
  const ax = 1 - cx - bx;

  const cy = 3 * y1;
  const by = 3 * (y2 - y1) - cy;
  const ay = 1 - cy - by;

  const sampleX = (t: number) => ((ax * t + bx) * t + cx) * t;
  const sampleY = (t: number) => ((ay * t + by) * t + cy) * t;
  const sampleDerivX = (t: number) => (3 * ax * t + 2 * bx) * t + cx;

  return (x: number): number => {
    if (x <= 0) return 0;
    if (x >= 1) return 1;

    let t = x;
    for (let i = 0; i < 6; i++) {
      const err = sampleX(t) - x;
      if (Math.abs(err) < 1e-5) return sampleY(t);
      const d = sampleDerivX(t);
      if (Math.abs(d) < 1e-6) break;
      t -= err / d;
    }

    let lo = 0;
    let hi = 1;
    t = x;
    for (let i = 0; i < 12; i++) {
      const val = sampleX(t);
      if (Math.abs(val - x) < 1e-5) break;
      if (x > val) lo = t;
      else hi = t;
      t = (lo + hi) * 0.5;
    }
    return sampleY(t);
  };
}

export const easeSlide = cubicBezier(0.25, 0.75, 0.2, 1);
export const easeEntrance = cubicBezier(0.16, 1, 0.3, 1);

export interface BarPose {
  x: number;
  y: number;
  h: number;
  rz: number;
  ry: number;
  rx: number;
  z: number;
  op: number;
  sx: number;
  sy: number;
  shadow: number;
}

const ARC_SLOTS = [
  { dx: 0, dy: 0, h: 470, rz: 0, ry: 0 },
  { dx: 350, dy: 28, h: 380, rz: 4, ry: 13 },
  { dx: 642, dy: 58, h: 335, rz: 8, ry: 22 },
  { dx: 880, dy: 94, h: 290, rz: 12, ry: 30 },
  { dx: 1120, dy: 134, h: 260, rz: 15, ry: 36 },
] as const;

export function evalArcPose(
  k: number,
  cx: number,
  cy: number,
  u: number,
  xSpread = 1,
  floatPhase = 0,
  reducedMotion = false,
): BarPose {
  const sign = k < 0 ? -1 : 1;
  const ak = Math.min(Math.abs(k), 4);
  const idx0 = Math.min(3, Math.floor(ak));
  const idx1 = Math.min(4, idx0 + 1);
  const frac = ak - idx0;

  const s0 = ARC_SLOTS[idx0];
  const s1 = ARC_SLOTS[idx1];

  const dx = lerp(s0.dx, s1.dx, frac) * sign * u * xSpread;
  const dy = lerp(s0.dy, s1.dy, frac) * u;
  const h = lerp(s0.h, s1.h, frac) * u;
  let rz = lerp(s0.rz, s1.rz, frac) * sign;
  const ry = lerp(s0.ry, s1.ry, frac) * sign;
  const z = -ak * 34 * u;
  // Confine arc to 5 visible cards (k = -2, -1, 0, 1, 2); fade out beyond |k| > 2
  const op = ak <= 2.1 ? 1 : clamp(1 - (ak - 2.1) / 0.45, 0, 1);

  let y = cy + dy;
  if (!reducedMotion) {
    const b = Math.sin(floatPhase);
    y -= (0.5 * b + 0.5) * 9 * u;
    rz += 0.4 * b;
  }

  return {
    x: cx + dx,
    y,
    h,
    rz,
    ry,
    rx: 0,
    z,
    op,
    sx: 1,
    sy: 1,
    shadow: 1,
  };
}

/**
 * Computes gentle sculptural Z relief for 3D product cutout plates without distorting straight hardware edges.
 */
export function computeBarZ(u: number, v: number): number {
  const ex = Math.abs(2 * u - 1);
  const ev = Math.abs(2 * v - 1);
  const across = Math.pow(Math.max(0, 1 - Math.pow(ex, 2.4)), 0.65);
  const along = Math.pow(Math.max(0, 1 - Math.pow(ev, 2.4)), 0.65);
  return 0.008 + 0.038 * across * along;
}

export interface Section2Metrics {
  p: number;
  step: number;
  q: number;
  pinY: number;
}

export function computeSection2Metrics(secTop: number, secHeight: number, vh: number): Section2Metrics {
  const span = Math.max(1, secHeight - vh);
  const p = secHeight <= vh ? clamp(1 - secTop / vh, 0, 1) : clamp(-secTop / span, 0, 1);
  const step = 0;
  const q = 0;
  const secBottom = secTop + secHeight;
  const pinY = secTop > 0 ? secTop : secBottom < vh ? secBottom - vh : 0;
  return { p, step, q, pinY };
}

export function lerpPose(a: BarPose, b: BarPose, t: number): BarPose {
  return {
    x: lerp(a.x, b.x, t),
    y: lerp(a.y, b.y, t),
    h: lerp(a.h, b.h, t),
    rz: lerp(a.rz, b.rz, t),
    ry: lerp(a.ry, b.ry, t),
    rx: lerp(a.rx, b.rx, t),
    z: lerp(a.z, b.z, t),
    op: lerp(a.op, b.op, t),
    sx: lerp(a.sx, b.sx, t),
    sy: lerp(a.sy, b.sy, t),
    shadow: lerp(a.shadow, b.shadow, t),
  };
}

export function computeTravellerPose(
  a: BarPose,
  b: BarPose,
  c: BarPose,
  p1: number,
  p3: number,
): BarPose {
  let state = a;
  if (p1 > 0) {
    state = lerpPose(state, b, easeInOutSine(p1));
  }
  if (p3 > 0) {
    state = lerpPose(state, c, easeInOutSine(p3));
  }
  return state;
}

/**
 * Deterministic seeded PRNG (Mulberry32) for barcode bars and storm particles.
 */
export function mulberry32(seed: number): () => number {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Mixes a hex colour toward another hex colour by weight w in [0, 1].
 */
export function mixHex(hexA: string, hexB: string, w: number): string {
  const parse = (h: string) => {
    const clean = h.replace('#', '');
    return [
      parseInt(clean.slice(0, 2), 16),
      parseInt(clean.slice(2, 4), 16),
      parseInt(clean.slice(4, 6), 16),
    ];
  };
  const [r1, g1, b1] = parse(hexA);
  const [r2, g2, b2] = parse(hexB);
  const r = Math.round(lerp(r1, r2, w));
  const g = Math.round(lerp(g1, g2, w));
  const b = Math.round(lerp(b1, b2, w));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

export function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

export function modFlavour(j: number, count = 5): number {
  return ((j % count) + count) % count;
}

import { BAR_ASPECT_H, FLAVOURS, HARDWARE_BITS, type Flavour } from './data';
import { hexToRgba, mixHex } from './math';

const imagePromiseCache = new Map<string, Promise<HTMLImageElement | null>>();
const loadedImages = new Map<string, HTMLImageElement>();
const cutoutCanvasCache = new Map<string, HTMLCanvasElement>();
const cutoutUrlCache = new Map<string, string>();

export function loadImageAsset(url: string): Promise<HTMLImageElement | null> {
  if (typeof Image === 'undefined') return Promise.resolve(null);
  const existing = loadedImages.get(url);
  if (existing) return Promise.resolve(existing);

  const cachedPromise = imagePromiseCache.get(url);
  if (cachedPromise) return cachedPromise;

  const p = new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      loadedImages.set(url, img);
      resolve(img);
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
  imagePromiseCache.set(url, p);
  return p;
}

/**
 * Removes the studio sweep backdrop from a product photo using perimeter-seeded,
 * gradient-bounded flood fill + edge alpha feathering so white housings inside
 * products stay crisp and opaque while returning a tight transparent cutout.
 */
export function buildProductCutoutCanvas(
  img: HTMLImageElement,
  assetKey: string,
): HTMLCanvasElement {
  const cached = cutoutCanvasCache.get(assetKey);
  if (cached) return cached;

  const S = 440;
  const work = document.createElement('canvas');
  work.width = S;
  work.height = S;
  const wCtx = work.getContext('2d');
  if (!wCtx) return work;

  // If the asset is already a pre-rendered transparent cutout PNG, preserve all product colors with 100% solid opacity
  if ((img.src && img.src.includes('cutout')) || assetKey.includes('cutout')) {
    const nw = img.naturalWidth || img.width || S;
    const nh = img.naturalHeight || img.height || S;
    const scale = Math.min(S / nw, S / nh);
    const dw = nw * scale;
    const dh = nh * scale;
    wCtx.drawImage(img, (S - dw) * 0.5, (S - dh) * 0.5, dw, dh);
    cutoutCanvasCache.set(assetKey, work);
    return work;
  }

  wCtx.drawImage(img, 0, 0, S, S);
  const imgData = wCtx.getImageData(0, 0, S, S);
  const data = imgData.data;

  // Sample neutral studio wall tone at top-center
  let bgR = 0;
  let bgG = 0;
  let bgB = 0;
  let sampleCount = 0;
  for (let sy = 10; sy < 20; sy++) {
    for (let sx = Math.floor(S * 0.44); sx < Math.floor(S * 0.56); sx++) {
      const idx = (sy * S + sx) * 4;
      bgR += data[idx];
      bgG += data[idx + 1];
      bgB += data[idx + 2];
      sampleCount++;
    }
  }
  bgR /= Math.max(1, sampleCount);
  bgG /= Math.max(1, sampleCount);
  bgB /= Math.max(1, sampleCount);
  const bgLum = 0.299 * bgR + 0.587 * bgG + 0.114 * bgB;

  // Sample neutral studio floor tone at bottom-center (handles brighter lit sweep under products)
  let flR = 0;
  let flG = 0;
  let flB = 0;
  let flCount = 0;
  for (let sy = S - 16; sy < S - 6; sy++) {
    for (let sx = Math.floor(S * 0.42); sx < Math.floor(S * 0.58); sx++) {
      const idx = (sy * S + sx) * 4;
      flR += data[idx];
      flG += data[idx + 1];
      flB += data[idx + 2];
      flCount++;
    }
  }
  flR /= Math.max(1, flCount);
  flG /= Math.max(1, flCount);
  flB /= Math.max(1, flCount);
  const flLum = 0.299 * flR + 0.587 * flG + 0.114 * flB;

  const total = S * S;
  const bgMask = new Uint8Array(total);
  const queue = new Int32Array(total);
  let head = 0;
  let tail = 0;

  const isIpsPhoto = assetKey.includes('ips');
  const isCctvPhoto = assetKey.includes('cctv');

  const enqueue = (pIdx: number) => {
    if (bgMask[pIdx]) return;
    bgMask[pIdx] = 1;
    queue[tail++] = pIdx;
  };

  // Top zone of IPS photo (y < 0.435*S) contains only the studio wall and upper softboxes
  if (isIpsPhoto) {
    const topCut = Math.floor(S * 0.435);
    for (let y = 0; y < topCut; y++) {
      for (let x = 0; x < S; x++) {
        enqueue(y * S + x);
      }
    }
  }

  // Seed outer perimeter pixels
  for (let x = 0; x < S; x++) {
    enqueue(x);
    enqueue((S - 1) * S + x);
  }
  for (let y = 1; y < S - 1; y++) {
    enqueue(y * S);
    enqueue(y * S + (S - 1));
  }

  // Also seed small enclosed studio gap inside the IPS cable loop if it matches studio wall closely
  if (isIpsPhoto) {
    const gapSeedX = Math.floor(S * 0.545);
    const gapSeedY = Math.floor(S * 0.49);
    const gi = gapSeedY * S + gapSeedX;
    const d0 =
      Math.abs(data[gi * 4] - bgR) +
      Math.abs(data[gi * 4 + 1] - bgG) +
      Math.abs(data[gi * 4 + 2] - bgB);
    if (d0 < 36) enqueue(gi);
  }

  while (head < tail) {
    const cur = queue[head++];
    const cx = cur % S;
    const cy = (cur - cx) / S;
    const cOff = cur * 4;
    const cLum = 0.299 * data[cOff] + 0.587 * data[cOff + 1] + 0.114 * data[cOff + 2];

    for (let d = 0; d < 4; d++) {
      let nx = cx;
      let ny = cy;
      if (d === 0) nx -= 1;
      else if (d === 1) nx += 1;
      else if (d === 2) ny -= 1;
      else ny += 1;

      if (nx < 0 || nx >= S || ny < 0 || ny >= S) continue;
      const nIdx = ny * S + nx;
      if (bgMask[nIdx]) continue;

      const nOff = nIdx * 4;
      const r = data[nOff];
      const g = data[nOff + 1];
      const b = data[nOff + 2];
      const lum = 0.299 * r + 0.587 * g + 0.114 * b;

      const distTopBg = Math.max(
        Math.abs(r - bgR),
        Math.abs(g - bgG),
        Math.abs(b - bgB),
      );
      const distFloorBg = Math.max(
        Math.abs(r - flR),
        Math.abs(g - flG),
        Math.abs(b - flB),
      );

      const chroma = Math.max(r, g, b) - Math.min(r, g, b);
      const gradStep = Math.abs(lum - cLum);

      if (isCctvPhoto) {
        // Cameras sit in 0.39..0.656*S: keep wall BFS tight so white camera housings stay 100% solid,
        // while sweeping freely across the studio floor below 0.658*S (and under the black NVR).
        if (ny <= S * 0.658) {
          if (
            distTopBg < 26 &&
            chroma < 18 &&
            gradStep < 7 &&
            lum <= bgLum + 10
          ) {
            enqueue(nIdx);
          }
        } else if (
          Math.min(distTopBg, distFloorBg) < 58 &&
          chroma < 22 &&
          gradStep < 16 &&
          lum > 118 &&
          lum <= Math.max(bgLum, flLum) + 26
        ) {
          enqueue(nIdx);
        }
        continue;
      }

      const isFloorZone = ny > S * 0.665;
      const effectiveDist = isFloorZone ? Math.min(distTopBg, distFloorBg) : distTopBg;
      const maxAllowedLum = (isFloorZone ? Math.max(bgLum, flLum) : bgLum) + 22;
      const allowBgDist = isFloorZone ? 54 : 42;
      const allowGrad = isFloorZone ? 14 : 11;

      if (
        effectiveDist < allowBgDist &&
        chroma < 26 &&
        gradStep < allowGrad &&
        lum <= maxAllowedLum
      ) {
        bgMask[nIdx] = 1;
        queue[tail++] = nIdx;
      }
    }
  }

  // Remove tiny isolated foreground speckles (< 65 pixels) left near studio corner edges
  const visited = new Uint8Array(total);
  const compQueue = new Int32Array(total);
  for (let i = 0; i < total; i++) {
    if (bgMask[i] || visited[i]) continue;
    let cHead = 0;
    let cTail = 0;
    visited[i] = 1;
    compQueue[cTail++] = i;
    while (cHead < cTail) {
      const curr = compQueue[cHead++];
      const cx = curr % S;
      const cy = (curr - cx) / S;
      for (let d = 0; d < 4; d++) {
        const nx = d === 0 ? cx - 1 : d === 1 ? cx + 1 : cx;
        const ny = d === 2 ? cy - 1 : d === 3 ? cy + 1 : cy;
        if (nx < 0 || nx >= S || ny < 0 || ny >= S) continue;
        const nIdx = ny * S + nx;
        if (!bgMask[nIdx] && !visited[nIdx]) {
          visited[nIdx] = 1;
          compQueue[cTail++] = nIdx;
        }
      }
    }
    if (cTail < 65) {
      for (let k = 0; k < cTail; k++) {
        bgMask[compQueue[k]] = 1;
      }
    }
  }

  // Apply alpha + soft 1px anti-aliased edge feathering + find tight content bounding box
  let minX = S;
  let minY = S;
  let maxX = 0;
  let maxY = 0;

  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      const idx = y * S + x;
      if (bgMask[idx]) {
        data[idx * 4 + 3] = 0;
        continue;
      }

      let bgNeighbors = 0;
      if (x > 0 && bgMask[idx - 1]) bgNeighbors++;
      if (x < S - 1 && bgMask[idx + 1]) bgNeighbors++;
      if (y > 0 && bgMask[idx - S]) bgNeighbors++;
      if (y < S - 1 && bgMask[idx + S]) bgNeighbors++;

      if (bgNeighbors >= 3) {
        data[idx * 4 + 3] = 95;
      } else if (bgNeighbors >= 1) {
        data[idx * 4 + 3] = 205;
      }

      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }

  wCtx.putImageData(imgData, 0, 0);

  if (maxX <= minX || maxY <= minY) {
    cutoutCanvasCache.set(assetKey, work);
    return work;
  }

  const pad = 8;
  const sx = Math.max(0, minX - pad);
  const sy = Math.max(0, minY - pad);
  const sw = Math.min(S - sx, maxX - minX + 1 + pad * 2);
  const sh = Math.min(S - sy, maxY - minY + 1 + pad * 2);

  const cropped = document.createElement('canvas');
  cropped.width = sw;
  cropped.height = sh;
  const cCtx = cropped.getContext('2d');
  if (cCtx) {
    cCtx.drawImage(work, sx, sy, sw, sh, 0, 0, sw, sh);
  }
  cutoutCanvasCache.set(assetKey, cropped);
  return cropped;
}

/**
 * Renders a rounded color-matched card backing behind each product on the 3D Hero arc
 * (uses lighter/richer shades of the product's background hue so the card pops while
 * preserving the natural colors of the product cutout rendered in front of it).
 */
export function drawCardBackingTexture(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  flavour: Flavour,
): void {
  ctx.clearRect(0, 0, W, H);
  const pad = Math.round(W * 0.025);
  const cw = W - pad * 2;
  const ch = H - pad * 2;
  const r = Math.round(W * 0.075);

  ctx.save();
  ctx.beginPath();
  ctx.roundRect(pad, pad, cw, ch, r);
  ctx.clip();

  // Translucent frosted glass tint fill so background texture shows through uniformly
  ctx.fillStyle = hexToRgba(flavour.color, 0.22);
  ctx.fillRect(pad, pad, cw, ch);

  ctx.restore();

  // Crisp frosted glass outer border with clean uniform outline (no top glow/glare)
  ctx.save();
  ctx.beginPath();
  ctx.roundRect(pad + 1, pad + 1, cw - 2, ch - 2, Math.max(4, r - 1));
  ctx.lineWidth = Math.max(2, W * 0.0055);
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.72)';
  ctx.stroke();
  ctx.restore();
}

/**
 * Draws ONLY the un-tinted transparent product cutout centered cleanly on the 3D mesh canvas.
 */
export function drawCutoutTexture(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  flavour: Flavour,
  productImg?: HTMLImageElement | null,
  mirrorX = false,
): void {
  ctx.clearRect(0, 0, W, H);

  const resolvedPhoto = productImg ?? loadedImages.get(flavour.imageUrl) ?? null;
  if (!resolvedPhoto || !resolvedPhoto.complete || resolvedPhoto.naturalWidth === 0) {
    return;
  }

  const cutout = buildProductCutoutCanvas(resolvedPhoto, flavour.id);
  const cw = cutout.width;
  const ch = cutout.height;
  if (!cw || !ch) return;

  const maxW = W * 0.90;
  const maxH = H * 0.86;
  const scale = Math.min(maxW / cw, maxH / ch);
  const dw = cw * scale;
  const dh = ch * scale;
  const dx = (W - dw) * 0.5;
  const dy = (H - dh) * 0.5;

  ctx.save();
  if (mirrorX) {
    ctx.translate(W, 0);
    ctx.scale(-1, 1);
  }
  ctx.shadowColor = 'rgba(12, 10, 18, 0.44)';
  ctx.shadowBlur = W * 0.055;
  ctx.shadowOffsetY = W * 0.026;
  ctx.drawImage(cutout, dx, dy, dw, dh);
  ctx.restore();
}

export async function getProductCutoutDataUrl(flavourOrBitIndex: number): Promise<string> {
  if (typeof document === 'undefined') return '';
  const item = FLAVOURS[flavourOrBitIndex] ?? FLAVOURS[0];
  const bit = HARDWARE_BITS[flavourOrBitIndex];
  const url = item?.imageUrl ?? bit?.imageUrl;
  const key = item?.id ?? `bit-${flavourOrBitIndex}`;
  if (!url) return '';

  const cached = cutoutUrlCache.get(key);
  if (cached) return cached;

  // Pre-rendered clean transparent cutouts are already crisp and have 100% solid product bodies
  if (url.includes('cutout')) {
    cutoutUrlCache.set(key, url);
    return url;
  }

  const img = await loadImageAsset(url);
  if (!img) return url;

  const cutout = buildProductCutoutCanvas(img, key);
  const baseW = 400;
  const W = Math.round(baseW * 1.24);
  const H = Math.round(baseW * BAR_ASPECT_H);
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return url;

  const maxW = W * 0.95;
  const maxH = H * 0.9;
  const scale = Math.min(maxW / cutout.width, maxH / cutout.height);
  const dw = cutout.width * scale;
  const dh = cutout.height * scale;
  ctx.drawImage(cutout, (W - dw) * 0.5, (H - dh) * 0.5, dw, dh);

  const dataUrl = canvas.toDataURL('image/png');
  cutoutUrlCache.set(key, dataUrl);
  return dataUrl;
}

// Generates the PWA icon set into public/ with no image dependencies:
// an eight-pointed compass rose, ink on paper, encoded as PNG by hand.
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';

const PAPER = [246, 243, 236];
const INK = [42, 39, 33];

const CRC_TABLE = new Uint32Array(256);
for (let n = 0; n < 256; n++) {
  let c = n;
  for (let k = 0; k < 8; k++) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  CRC_TABLE[n] = c >>> 0;
}

/** @param {Uint8Array} bytes */
function crc32(bytes) {
  let c = 0xffffffff;
  for (const byte of bytes) {
    c = (CRC_TABLE[(c ^ byte) & 0xff] ?? 0) ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

/**
 * @param {string} type
 * @param {Uint8Array} data
 */
function chunk(type, data) {
  const out = new Uint8Array(12 + data.length);
  const view = new DataView(out.buffer);
  view.setUint32(0, data.length);
  const typed = new Uint8Array(4 + data.length);
  for (let i = 0; i < 4; i++) {
    typed[i] = type.charCodeAt(i);
  }
  typed.set(data, 4);
  out.set(typed, 4);
  view.setUint32(8 + data.length, crc32(typed));
  return out;
}

/**
 * @param {number} size
 * @param {Uint8Array} rgb  size*size*3 bytes
 */
function encodePng(size, rgb) {
  const ihdr = new Uint8Array(13);
  const view = new DataView(ihdr.buffer);
  view.setUint32(0, size);
  view.setUint32(4, size);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // truecolor
  const raw = new Uint8Array(size * (size * 3 + 1));
  for (let y = 0; y < size; y++) {
    raw.set(rgb.subarray(y * size * 3, (y + 1) * size * 3), y * (size * 3 + 1) + 1);
  }
  return Buffer.concat([
    Uint8Array.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(raw, { level: 9 })),
    chunk('IEND', new Uint8Array(0)),
  ]);
}

/**
 * Vertices of an eight-pointed star, alternating outer/inner radius.
 * @param {number} cx @param {number} cy @param {number} rOut @param {number} rIn
 */
function starVertices(cx, cy, rOut, rIn) {
  const points = [];
  for (let k = 0; k < 16; k++) {
    const r = k % 2 === 0 ? rOut : rIn;
    const a = (-90 + k * 22.5) * (Math.PI / 180);
    points.push([cx + r * Math.cos(a), cy + r * Math.sin(a)]);
  }
  return points;
}

/**
 * Even-odd point-in-polygon test.
 * @param {[number, number][]} poly @param {number} x @param {number} y
 */
function inPolygon(poly, x, y) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) {
      inside = !inside;
    }
  }
  return inside;
}

/** @param {number} size */
function drawIcon(size) {
  const c = size / 2;
  const star = starVertices(c, c, size * 0.36, size * 0.135);
  const ringR = size * 0.42;
  const ringW = size * 0.012;
  const rgb = new Uint8Array(size * size * 3);
  const samples = [-1 / 3, 0, 1 / 3];
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      let hit = 0;
      for (const dy of samples) {
        for (const dx of samples) {
          const px = x + 0.5 + dx;
          const py = y + 0.5 + dy;
          const d = Math.hypot(px - c, py - c);
          if (inPolygon(star, px, py) || Math.abs(d - ringR) < ringW) {
            hit++;
          }
        }
      }
      const t = hit / 9;
      const i = (y * size + x) * 3;
      for (let ch = 0; ch < 3; ch++) {
        rgb[i + ch] = Math.round((PAPER[ch] ?? 0) * (1 - t) + (INK[ch] ?? 0) * t);
      }
    }
  }
  return encodePng(size, rgb);
}

function iconSvg() {
  const star = starVertices(256, 256, 184, 69)
    .map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`)
    .join(' ');
  const paper = `rgb(${PAPER.join(',')})`;
  const ink = `rgb(${INK.join(',')})`;
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">',
    `  <rect width="512" height="512" fill="${paper}"/>`,
    `  <circle cx="256" cy="256" r="215" fill="none" stroke="${ink}" stroke-width="6"/>`,
    `  <polygon points="${star}" fill="${ink}"/>`,
    '</svg>',
    '',
  ].join('\n');
}

const publicDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public');
mkdirSync(publicDir, { recursive: true });
writeFileSync(join(publicDir, 'icon-192.png'), drawIcon(192));
writeFileSync(join(publicDir, 'icon-512.png'), drawIcon(512));
writeFileSync(join(publicDir, 'apple-touch-icon.png'), drawIcon(180));
writeFileSync(join(publicDir, 'icon.svg'), iconSvg());
console.log('Wrote icon-192.png, icon-512.png, apple-touch-icon.png, icon.svg');

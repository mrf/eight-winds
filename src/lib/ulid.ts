// Minimal ULID: 48-bit timestamp + 80-bit randomness, Crockford base32.
// Monotonic within a millisecond so ids stay strictly sortable.

const ALPHABET = '0123456789ABCDEFGHJKMNPQRSTVWXYZ';

let lastTime = -1;
let lastRandom: Uint8Array = new Uint8Array(10);

function randomBytes(): Uint8Array {
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  return bytes;
}

function incrementBytes(bytes: Uint8Array): void {
  for (let i = bytes.length - 1; i >= 0; i--) {
    const current = bytes[i] ?? 0;
    if (current < 0xff) {
      bytes[i] = current + 1;
      return;
    }
    bytes[i] = 0;
  }
}

function encodeTime(time: number): string {
  let t = time;
  let out = '';
  for (let i = 0; i < 10; i++) {
    out = (ALPHABET[t % 32] ?? '0') + out;
    t = Math.floor(t / 32);
  }
  return out;
}

function encodeBytes(bytes: Uint8Array): string {
  // 10 bytes = 80 bits = exactly 16 base32 characters.
  let out = '';
  let acc = 0;
  let bits = 0;
  for (const byte of bytes) {
    acc = (acc << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      out += ALPHABET[(acc >>> (bits - 5)) & 31] ?? '0';
      bits -= 5;
      acc &= (1 << bits) - 1;
    }
  }
  return out;
}

export function ulid(time: number = Date.now()): string {
  if (time === lastTime) {
    incrementBytes(lastRandom);
  } else {
    lastTime = time;
    lastRandom = randomBytes();
  }
  return encodeTime(time) + encodeBytes(lastRandom);
}

export function ulidTime(id: string): number {
  let t = 0;
  for (const char of id.slice(0, 10)) {
    const index = ALPHABET.indexOf(char);
    if (index < 0) {
      throw new Error(`Not a ULID: ${id}`);
    }
    t = t * 32 + index;
  }
  return t;
}

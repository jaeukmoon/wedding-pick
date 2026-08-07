// Encrypt all photos + metadata for the password-gated gallery.
// Usage: node tools/encrypt.mjs <password>
// Output: enc/NNN.bin (IV(12) || ciphertext || GCM tag(16)), data.bin (same layout)
import { pbkdf2Sync, randomBytes, createCipheriv } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SALT_HEX = 'b7a1c9e24d8f3056a2e1907c5b4d6f18';   // must match index.html
const ITER = 300000;

const password = process.argv[2];
if (!password) { console.error('usage: node tools/encrypt.mjs <password>'); process.exit(1); }

const key = pbkdf2Sync(password, Buffer.from(SALT_HEX, 'hex'), ITER, 32, 'sha256');

function enc(buf) {
  const iv = randomBytes(12);
  const c = createCipheriv('aes-256-gcm', key, iv);
  const ct = Buffer.concat([c.update(buf), c.final()]);
  return Buffer.concat([iv, ct, c.getAuthTag()]);  // WebCrypto expects ct||tag
}

const meta = JSON.parse(readFileSync(join(ROOT, 'tmp_meta.json'), 'utf8'));
mkdirSync(join(ROOT, 'enc'), { recursive: true });

let bytes = 0;
for (const m of meta) {
  const out = enc(readFileSync(m.src));
  writeFileSync(join(ROOT, m.f), out);
  bytes += out.length;
}

const pub = meta.map(({ f, w, h, t, u }) => ({ f, w, h, t, u }));
writeFileSync(join(ROOT, 'data.bin'), enc(Buffer.from(JSON.stringify(pub), 'utf8')));
console.log(`encrypted ${meta.length} photos (${(bytes / 1e6).toFixed(1)}MB) + data.bin`);

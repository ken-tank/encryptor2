import { webcrypto } from "node:crypto";
const subtle = globalThis.crypto?.subtle || webcrypto.subtle;

const enc = new TextEncoder();
const dec = new TextDecoder();

function toBase64(buf: ArrayBuffer): string {
  return Buffer.from(buf).toString("base64");
}
function fromBase64(str: string): Uint8Array {
  return new Uint8Array(Buffer.from(str, "base64"));
}

/* ------------------ key derivation ------------------ */
async function deriveKey(password: string, salt: Uint8Array) {
  // pastikan hanya ArrayBuffer, bukan SharedArrayBuffer
  const saltBuf = salt.buffer instanceof ArrayBuffer ? salt.buffer : salt.buffer.slice(0);

  const keyMaterial = await subtle.importKey(
    "raw",
    enc.encode(password),
    "PBKDF2",
    false,
    ["deriveKey"]
  );

  return subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: saltBuf as ArrayBuffer, // ← fix utama di sini
      iterations: 200_000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

/* ------------------ AES-GCM ------------------ */
export async function encryptAESGCM(message: string, password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(password, salt);

  const data = enc.encode(message);
  const cipherBuf = await subtle.encrypt(
    { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
    key,
    data
  );

  // gabungkan salt + iv + ciphertext
  const result = new Uint8Array(salt.length + iv.length + cipherBuf.byteLength);
  result.set(salt, 0);
  result.set(iv, salt.length);
  result.set(new Uint8Array(cipherBuf), salt.length + iv.length);

  return toBase64(result.buffer);
}

export async function decryptAESGCM(packed: string, password: string): Promise<string> {
  const all = fromBase64(packed);
  const salt = all.slice(0, 16);
  const iv = all.slice(16, 28);
  const cipher = all.slice(28);

  const key = await deriveKey(password, salt);
  const plainBuf = await subtle.decrypt(
    { name: "AES-GCM", iv: iv.buffer as ArrayBuffer },
    key,
    cipher.buffer as ArrayBuffer
  );

  return dec.decode(plainBuf);
}

export async function generateSHA256Key(length: number = 32): Promise<string> {
  // 1. Buat seed acak (random data)
  const randomData = crypto.getRandomValues(new Uint8Array(length));

  // 2. Hash data acak menggunakan SHA-256
  const hashBuffer = await crypto.subtle.digest("SHA-256", randomData);

  // 3. Konversi hasil hash ke Base64 agar mudah dibaca/simpan
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashBase64 = btoa(String.fromCharCode(...hashArray));

  // 4. Kembalikan string hasil hash
  return hashBase64;
}
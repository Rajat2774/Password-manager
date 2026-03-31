// src/utils/crypto.js
// All encryption/decryption happens HERE — never on the server

const ITERATIONS = 600000;
const KEY_LENGTH = 256;

// ── Derive a key from master password using PBKDF2 ──────────────────────────
// The salt is the user's Firebase UID — unique per user, no need to store it
export const deriveKey = async (masterPassword, uid) => {
  const enc = new TextEncoder();
  const keyMaterial = await window.crypto.subtle.importKey(
    "raw",
    enc.encode(masterPassword),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  return window.crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode(uid),      // UID as salt — unique per user
      iterations: ITERATIONS,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: KEY_LENGTH },
    false,
    ["encrypt", "decrypt"]
  );
};

// ── Encrypt a string with AES-GCM ───────────────────────────────────────────
export const encrypt = async (plaintext, cryptoKey) => {
  const enc = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(12)); // random IV
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    cryptoKey,
    enc.encode(plaintext)
  );
  // Store iv + ciphertext together as base64
  const combined = new Uint8Array(iv.byteLength + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.byteLength);
  return btoa(String.fromCharCode(...combined));
};

// ── Decrypt a string with AES-GCM ───────────────────────────────────────────
export const decrypt = async (encoded, cryptoKey) => {
  try {
    const combined = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    const plainBuffer = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      cryptoKey,
      ciphertext
    );
    return new TextDecoder().decode(plainBuffer);
  } catch {
    return null; // wrong master password → decryption fails
  }
};

// ── Verify master password by decrypting a known test value ─────────────────
// We store a small encrypted "canary" in Firestore to verify the key is correct
export const encryptCanary = (cryptoKey) => encrypt("keyvault-canary", cryptoKey);
export const verifyCanary = async (encoded, cryptoKey) => {
  const result = await decrypt(encoded, cryptoKey);
  return result === "keyvault-canary";
};
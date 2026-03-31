// src/utils/sharing.js
// Secure sharing utilities — encryption key stays in URL fragment (never sent to server)

/**
 * Generate a random AES-GCM key for sharing
 */
export async function generateShareKey() {
  const key = await window.crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true, // extractable so we can export it
    ["encrypt", "decrypt"]
  );
  return key;
}

/**
 * Export a CryptoKey to a URL-safe base64 string
 */
export async function exportKey(key) {
  const raw = await window.crypto.subtle.exportKey("raw", key);
  return btoa(String.fromCharCode(...new Uint8Array(raw)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Import a CryptoKey from a URL-safe base64 string
 */
export async function importKey(b64) {
  const str = b64.replace(/-/g, "+").replace(/_/g, "/");
  const padded = str + "=".repeat((4 - (str.length % 4)) % 4);
  const raw = Uint8Array.from(atob(padded), (c) => c.charCodeAt(0));
  return window.crypto.subtle.importKey(
    "raw",
    raw,
    { name: "AES-GCM", length: 256 },
    false,
    ["decrypt"]
  );
}

/**
 * Encrypt plaintext data object for sharing
 */
export async function encryptForSharing(data, shareKey) {
  const enc = new TextEncoder();
  const iv = window.crypto.getRandomValues(new Uint8Array(12));
  const plaintext = enc.encode(JSON.stringify(data));
  const ciphertext = await window.crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    shareKey,
    plaintext
  );
  const combined = new Uint8Array(iv.byteLength + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.byteLength);
  return btoa(String.fromCharCode(...combined));
}

/**
 * Decrypt shared data using the share key
 */
export async function decryptSharedData(encoded, shareKey) {
  try {
    const combined = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    const plainBuffer = await window.crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      shareKey,
      ciphertext
    );
    return JSON.parse(new TextDecoder().decode(plainBuffer));
  } catch {
    return null;
  }
}

/**
 * Build the share URL with key in fragment (never sent to server)
 */
export function buildShareUrl(docId, keyB64) {
  const origin = window.location.origin;
  return `${origin}/share/${docId}#${keyB64}`;
}

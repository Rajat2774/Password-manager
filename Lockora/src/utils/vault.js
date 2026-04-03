import { encrypt, decrypt } from "./crypto";
import { FIELDS } from "../constants/vault";

// ── Shared Tailwind input classes (Light green theme) ─────────────────────────
export const inputCls =
  "w-full py-2.5 px-3.5 bg-white border border-[#d4dcc8] rounded-xl text-[13px] text-[#1a1a2e] outline-none placeholder:text-[#a0a8b0] transition-all duration-200 focus:border-[#1a6b3c] focus:shadow-[0_0_0_3px_rgba(26,107,60,0.1)] resize-y";

export const selectCls =
  "w-full py-2.5 px-3.5 bg-white border border-[#d4dcc8] rounded-xl text-[13px] text-[#1a1a2e] outline-none transition-all duration-200 focus:border-[#1a6b3c] cursor-pointer";

// ── Entry title / subtitle helpers ────────────────────────────────────────────
export const getTitle = (e) =>
  e.site || e.cardName || e.fullName || e.title || e.label || "Untitled";

export const getSub = (e) =>
  e.username || e.cardHolder || e.host || e.fullName || "";

// ── Encrypt a form object into a Firestore-ready payload ──────────────────────
export async function encryptEntry(form, cryptoKey, vaultType) {
  const payload = { vaultType };
  for (const f of FIELDS[vaultType]) {
    const val = form[f.key] || "";
    payload[f.key] = f.plain ? val : val ? await encrypt(val, cryptoKey) : "";
  }
  return payload;
}

// ── Decrypt a Firestore entry back into plaintext ─────────────────────────────
export async function decryptEntry(entry, cryptoKey) {
  const vaultType = entry.vaultType || "password";
  const plain = { vaultType };
  for (const f of FIELDS[vaultType]) {
    const val = entry[f.key] || "";
    plain[f.key] = f.plain
      ? val
      : val
        ? (await decrypt(val, cryptoKey)) || ""
        : "";
  }
  return plain;
}

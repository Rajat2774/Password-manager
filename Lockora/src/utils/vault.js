import { encrypt, decrypt } from "./crypto";
import { FIELDS } from "../constants/vault";

// ── Shared Tailwind input classes ─────────────────────────────────────────────
export const inputCls =
  "w-full py-2.5 px-3 bg-[#0f0f14] border border-[#232329] rounded-lg text-[12px] text-white outline-none placeholder:text-[#3a3a45] transition-all duration-200 focus:border-purple-500/50 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.08)] resize-y";

export const selectCls =
  "w-full py-2.5 px-3 bg-[#0f0f14] border border-[#232329] rounded-lg text-[12px] text-white outline-none transition-all duration-200 focus:border-purple-500/50 cursor-pointer";

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

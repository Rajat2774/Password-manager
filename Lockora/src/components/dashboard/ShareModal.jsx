// src/components/dashboard/ShareModal.jsx
import { useState } from "react";
import { db } from "../../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { decryptEntry } from "../../utils/vault";
import {
  generateShareKey,
  exportKey,
  encryptForSharing,
  buildShareUrl,
} from "../../utils/sharing";
import { ShareIcon, CopyIcon, ClockIcon, LinkIcon } from "./Icons";

const EXPIRY_OPTIONS = [
  { label: "30 min", value: 30 * 60 * 1000 },
  { label: "1 hour", value: 60 * 60 * 1000 },
  { label: "6 hours", value: 6 * 60 * 60 * 1000 },
  { label: "24 hours", value: 24 * 60 * 60 * 1000 },
  { label: "7 days", value: 7 * 24 * 60 * 60 * 1000 },
];

const ACCESS_OPTIONS = [
  { label: "Unlimited", value: 0 },
  { label: "1 view", value: 1 },
  { label: "5 views", value: 5 },
  { label: "10 views", value: 10 },
];

export default function ShareModal({ entry, cryptoKey, onClose }) {
  const [step, setStep] = useState("config"); // config | generated
  const [expiry, setExpiry] = useState(EXPIRY_OPTIONS[1].value);
  const [maxAccess, setMaxAccess] = useState(0);
  const [generating, setGenerating] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    setGenerating(true);
    setError("");
    try {
      // 1. Decrypt the entry
      const plain = await decryptEntry(entry, cryptoKey);

      // 2. Create a share-specific payload (only include relevant info)
      const shareData = {
        title: plain.site || plain.cardName || plain.fullName || plain.title || plain.label || "Untitled",
        subtitle: plain.username || plain.cardHolder || plain.host || plain.fullName || "",
        vaultType: entry.vaultType,
        fields: {},
      };

      // Include all non-empty fields
      for (const [key, value] of Object.entries(plain)) {
        if (value && key !== "vaultType") {
          shareData.fields[key] = value;
        }
      }

      // 3. Generate a random share key & encrypt
      const shareKey = await generateShareKey();
      const encryptedPayload = await encryptForSharing(shareData, shareKey);
      const keyB64 = await exportKey(shareKey);

      // 4. Store encrypted data in Firestore
      const expiresAt = new Date(Date.now() + expiry);
      const docRef = await addDoc(collection(db, "sharedLinks"), {
        encryptedData: encryptedPayload,
        expiresAt,
        maxAccess: maxAccess || null,
        accessCount: 0,
        createdAt: serverTimestamp(),
      });

      // 5. Build the share URL (key is in the fragment - never sent to server)
      const url = buildShareUrl(docRef.id, keyB64);
      setShareUrl(url);
      setStep("generated");
    } catch (e) {
      console.error("Share error:", e);
      setError("Failed to generate share link. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getExpiryLabel = () => {
    const opt = EXPIRY_OPTIONS.find((o) => o.value === expiry);
    return opt?.label || "";
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 md:p-5"
      onClick={onClose}
    >
      <div
        className="bg-[#141418] border border-[#232329] rounded-t-2xl md:rounded-2xl w-full max-w-[480px] overflow-hidden shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 mb-4">
          <div className="flex items-center gap-2.5">
            <span className="text-purple-400">
              <ShareIcon size={18} />
            </span>
            <h2 className="text-lg font-light text-white">Share Securely</h2>
          </div>
          <button
            onClick={onClose}
            className="text-[#6b6b7b] hover:text-white text-lg transition-colors bg-transparent border-none cursor-pointer w-8 h-8 rounded-lg hover:bg-[#1e1e25] flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        {step === "config" && (
          <div className="px-5 pb-5">
            {/* Entry preview */}
            <div className="flex items-center gap-2.5 py-2.5 px-3.5 bg-[#0f0f14] border border-[#1e1e25] rounded-xl mb-5">
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-300">
                <LinkIcon size={14} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[12px] text-white truncate">
                  {entry.site || entry.cardName || entry.fullName || entry.title || entry.label || "Untitled"}
                </div>
                <div className="text-[11px] text-[#4a4a55] truncate">
                  {entry.username || entry.cardHolder || entry.host || ""}
                </div>
              </div>
            </div>

            {/* Expiration */}
            <div className="mb-4">
              <label className="text-[10px] uppercase tracking-[0.1em] text-[#6b6b7b] flex items-center gap-1.5 mb-2">
                <ClockIcon size={12} /> Expires after
              </label>
              <div className="flex gap-1.5 flex-wrap">
                {EXPIRY_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setExpiry(opt.value)}
                    className={`py-1.5 px-3 rounded-lg border text-[11px] transition-all duration-200 cursor-pointer ${
                      expiry === opt.value
                        ? "bg-purple-500/15 border-purple-500/30 text-purple-300"
                        : "bg-[#1a1a20] border-[#232329] text-[#6b6b7b] hover:border-[#3a3a45] hover:text-[#a0a0b0]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Access limit */}
            <div className="mb-5">
              <label className="text-[10px] uppercase tracking-[0.1em] text-[#6b6b7b] flex items-center gap-1.5 mb-2">
                Max views (optional)
              </label>
              <div className="flex gap-1.5 flex-wrap">
                {ACCESS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setMaxAccess(opt.value)}
                    className={`py-1.5 px-3 rounded-lg border text-[11px] transition-all duration-200 cursor-pointer ${
                      maxAccess === opt.value
                        ? "bg-purple-500/15 border-purple-500/30 text-purple-300"
                        : "bg-[#1a1a20] border-[#232329] text-[#6b6b7b] hover:border-[#3a3a45] hover:text-[#a0a0b0]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="text-[11px] text-red-400 py-2 px-3 bg-red-500/[0.06] border border-red-500/20 rounded-lg mb-4">
                {error}
              </div>
            )}

            {/* Generate button */}
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="w-full py-3 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white border-none rounded-xl text-[12px] uppercase tracking-[0.1em] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2"
            >
              {generating ? (
                <>
                  <span className="animate-spin inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full" />
                  Generating…
                </>
              ) : (
                <>
                  <LinkIcon size={14} /> Generate secure link
                </>
              )}
            </button>
          </div>
        )}

        {step === "generated" && (
          <div className="px-5 pb-5">
            {/* Success */}
            <div className="text-center mb-5">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-3 text-emerald-400">
                <LinkIcon size={22} />
              </div>
              <div className="text-[13px] text-white mb-1">Link generated!</div>
              <div className="text-[11px] text-[#4a4a55]">
                Expires in {getExpiryLabel()} · {maxAccess > 0 ? `${maxAccess} view${maxAccess > 1 ? "s" : ""}` : "Unlimited views"}
              </div>
            </div>

            {/* Link display */}
            <div className="flex items-center gap-2 py-2.5 px-3 bg-[#0f0f14] border border-[#1e1e25] rounded-xl mb-4">
              <span className="text-[11px] text-[#6b6b7b] flex-1 truncate select-all font-mono">
                {shareUrl}
              </span>
              <button
                onClick={copyLink}
                className={`flex items-center gap-1 py-1.5 px-3 rounded-lg border text-[11px] transition-all duration-200 cursor-pointer flex-shrink-0 ${
                  copied
                    ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-300"
                    : "bg-[#1a1a20] border-[#232329] text-[#a0a0b0] hover:border-purple-500/30 hover:text-white"
                }`}
              >
                {copied ? (
                  <>✓ Copied</>
                ) : (
                  <>
                    <CopyIcon /> Copy
                  </>
                )}
              </button>
            </div>

            {/* Warning */}
            <div className="flex items-start gap-2.5 py-2.5 px-3.5 bg-amber-500/[0.06] border border-amber-500/20 rounded-xl mb-5">
              <span className="text-amber-400 text-sm mt-0.5">⚠</span>
              <div className="text-[11px] text-amber-200/80 leading-relaxed">
                Anyone with this link can access the shared data. The encryption key is embedded in the link — share it only through secure channels.
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-transparent border border-[#232329] hover:border-[#3a3a45] text-[#a0a0b0] hover:text-white rounded-xl text-[11px] uppercase tracking-[0.1em] transition-all cursor-pointer"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

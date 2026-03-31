// src/pages/SharePage.jsx
import { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase";
import { doc, getDoc, updateDoc, increment } from "firebase/firestore";
import { importKey, decryptSharedData } from "../utils/sharing";
import {
  EyeIcon,
  CopyIcon,
  ShieldIcon,
  ClockIcon,
} from "../components/dashboard/Icons";

function formatCountdown(ms) {
  if (ms <= 0) return "Expired";
  const s = Math.floor(ms / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  const d = Math.floor(h / 24);
  if (d > 0) return `${d}d ${h % 24}h ${m % 60}m`;
  if (h > 0) return `${h}h ${m % 60}m ${s % 60}s`;
  if (m > 0) return `${m}m ${s % 60}s`;
  return `${s}s`;
}

export default function SharePage() {
  const { id } = useParams();
  const [state, setState] = useState("loading"); // loading | decrypting | ready | expired | error | access_exceeded
  const [data, setData] = useState(null);
  const [revealed, setRevealed] = useState({});
  const [copied, setCopied] = useState("");
  const [remaining, setRemaining] = useState(0);
  const [expiresAt, setExpiresAt] = useState(null);
  const timerRef = useRef(null);

  useEffect(() => {
    loadSharedData();
    return () => clearInterval(timerRef.current);
  }, [id]);

  // Countdown timer
  useEffect(() => {
    if (!expiresAt) return;
    const update = () => {
      const ms = expiresAt.getTime() - Date.now();
      setRemaining(ms);
      if (ms <= 0) {
        setState("expired");
        clearInterval(timerRef.current);
      }
    };
    update();
    timerRef.current = setInterval(update, 1000);
    return () => clearInterval(timerRef.current);
  }, [expiresAt]);

  const loadSharedData = async () => {
    try {
      // 1. Get the key from URL fragment
      const keyB64 = window.location.hash.slice(1);
      if (!keyB64) {
        console.error("No key in URL fragment");
        setState("error");
        return;
      }

      console.log("Loading shared data for ID:", id);
      console.log("Key present:", !!keyB64);

      // 2. Fetch the document from Firestore
      const docRef = doc(db, "sharedLinks", id);
      const snap = await getDoc(docRef);

      if (!snap.exists()) {
        console.error("Document does not exist:", id);
        setState("error");
        return;
      }

      console.log("Document found");
      const docData = snap.data();

      // 3. Check expiry
      const expiry = docData.expiresAt?.toDate ? docData.expiresAt.toDate() : new Date(docData.expiresAt);
      if (expiry < new Date()) {
        console.error("Link expired:", expiry);
        setState("expired");
        return;
      }
      setExpiresAt(expiry);

      // 4. Check access limit
      if (docData.maxAccess && docData.accessCount >= docData.maxAccess) {
        console.error("Access limit exceeded:", docData.accessCount, "/", docData.maxAccess);
        setState("access_exceeded");
        return;
      }

      // 5. Increment access count
      console.log("Incrementing access count");
      await updateDoc(docRef, { accessCount: increment(1) });

      // 6. Decrypt the data
      setState("decrypting");
      console.log("Importing key and decrypting");
      const shareKey = await importKey(keyB64);
      const decrypted = await decryptSharedData(docData.encryptedData, shareKey);

      if (!decrypted) {
        console.error("Decryption failed");
        setState("error");
        return;
      }

      console.log("Share loaded successfully");
      setData(decrypted);
      setState("ready");
    } catch (e) {
      console.error("Share page error:", e);
      setState("error");
    }
  };

  const copyField = async (value, key) => {
    await navigator.clipboard.writeText(value);
    setCopied(key);
    setTimeout(() => setCopied(""), 2000);
  };

  const toggleReveal = (key) => {
    setRevealed((r) => ({ ...r, [key]: !r[key] }));
  };

  const SENSITIVE_KEYS = ["password", "cardNumber", "cvv", "pin", "privateKey", "passphrase", "content", "dob", "passportNo", "nationalId", "phone", "address"];

  const isSensitive = (key) => SENSITIVE_KEYS.includes(key);

  // Meta label mapping
  const labelMap = {
    site: "Site / App",
    url: "URL",
    username: "Username",
    password: "Password",
    category: "Category",
    notes: "Notes",
    cardName: "Card Name",
    cardHolder: "Cardholder",
    cardNumber: "Card Number",
    expiry: "Expiry",
    cvv: "CVV",
    pin: "PIN",
    fullName: "Full Name",
    dob: "Date of Birth",
    passportNo: "Passport No.",
    nationalId: "National ID",
    address: "Address",
    phone: "Phone",
    title: "Title",
    content: "Content",
    label: "Label",
    host: "Host",
    privateKey: "Private Key",
    passphrase: "Passphrase",
  };

  // ── Render states ─────────────────────────────────────────────────────────

  if (state === "loading" || state === "decrypting") {
    return (
      <div className="min-h-screen bg-[#0b0b0f] flex items-center justify-center" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="text-center">
          <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center mx-auto mb-4 text-purple-400">
            <ShieldIcon size={22} />
          </div>
          <div className="text-[13px] text-white mb-2">
            {state === "loading" ? "Loading…" : "Decrypting…"}
          </div>
          <div className="w-8 h-0.5 bg-purple-500/30 rounded-full mx-auto overflow-hidden">
            <div className="w-full h-full bg-purple-500 rounded-full animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (state === "expired") {
    return (
      <div className="min-h-screen bg-[#0b0b0f] flex items-center justify-center" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="text-center max-w-[320px]">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4 text-red-400 text-2xl">
            ⏰
          </div>
          <div className="text-lg font-light text-white mb-2">Link Expired</div>
          <div className="text-[12px] text-[#4a4a55] leading-relaxed">
            This shared link has expired and is no longer accessible. Ask the sender to generate a new one.
          </div>
        </div>
      </div>
    );
  }

  if (state === "access_exceeded") {
    return (
      <div className="min-h-screen bg-[#0b0b0f] flex items-center justify-center" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="text-center max-w-[320px]">
          <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center mx-auto mb-4 text-amber-400 text-2xl">
            🔒
          </div>
          <div className="text-lg font-light text-white mb-2">Access Limit Reached</div>
          <div className="text-[12px] text-[#4a4a55] leading-relaxed">
            This shared link has reached its maximum number of views. Ask the sender to generate a new one.
          </div>
        </div>
      </div>
    );
  }

  if (state === "error") {
    return (
      <div className="min-h-screen bg-[#0b0b0f] flex items-center justify-center" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="text-center max-w-[320px]">
          <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4 text-red-400 text-2xl">
            ❌
          </div>
          <div className="text-lg font-light text-white mb-2">Invalid Link</div>
          <div className="text-[12px] text-[#4a4a55] leading-relaxed">
            This link is invalid or has been removed. Make sure you have the complete URL including the key.
          </div>
        </div>
      </div>
    );
  }

  // ── Ready state ─────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0b0b0f] flex items-center justify-center p-4" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="w-full max-w-[460px]">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <span className="text-purple-400">
              <ShieldIcon size={22} />
            </span>
            <span className="text-lg font-semibold text-white">Lockora</span>
          </div>
          <div className="text-[11px] text-[#4a4a55]">Shared securely with end-to-end encryption</div>
        </div>

        {/* Card */}
        <div className="bg-[#141418] border border-[#232329] rounded-2xl overflow-hidden shadow-2xl shadow-black/30">
          {/* Title bar */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#1e1e25]">
            <div>
              <div className="text-[15px] text-white">{data.title}</div>
              {data.subtitle && (
                <div className="text-[12px] text-[#4a4a55] mt-0.5">{data.subtitle}</div>
              )}
            </div>
            <span className="text-[9px] uppercase tracking-[0.08em] py-0.5 px-2 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
              {data.vaultType}
            </span>
          </div>

          {/* Fields */}
          <div className="p-5 space-y-3">
            {Object.entries(data.fields || {}).map(([key, value]) => {
              if (!value || key === "vaultType") return null;
              const sensitive = isSensitive(key);
              const isRevealed = revealed[key];
              const displayValue = sensitive && !isRevealed
                ? "••••••••••••"
                : value;

              return (
                <div key={key} className="bg-[#0f0f14] border border-[#1e1e25] rounded-xl p-3">
                  <div className="text-[9px] uppercase tracking-[0.1em] text-[#4a4a55] mb-1.5">
                    {labelMap[key] || key}
                  </div>
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[12px] flex-1 min-w-0 break-all ${
                        sensitive && !isRevealed ? "text-[#4a4a55] tracking-wider" : "text-white"
                      }`}
                    >
                      {displayValue}
                    </span>
                    <div className="flex gap-0.5 flex-shrink-0">
                      {sensitive && (
                        <button
                          onClick={() => toggleReveal(key)}
                          className="bg-transparent border-none p-1.5 rounded-lg text-[#4a4a55] hover:bg-[#1e1e25] hover:text-white flex items-center justify-center transition-all cursor-pointer"
                        >
                          <EyeIcon open={isRevealed} />
                        </button>
                      )}
                      <button
                        onClick={() => copyField(value, key)}
                        className="bg-transparent border-none p-1.5 rounded-lg text-[#4a4a55] hover:bg-[#1e1e25] hover:text-white flex items-center justify-center transition-all cursor-pointer"
                      >
                        {copied === key ? (
                          <span className="text-[12px] text-emerald-400">✓</span>
                        ) : (
                          <CopyIcon />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Expiry countdown */}
          <div className="px-5 pb-4">
            <div className={`flex items-center justify-center gap-2 py-2.5 px-3.5 rounded-xl text-[11px] ${
              remaining < 300000
                ? "bg-red-500/[0.06] border border-red-500/20 text-red-400"
                : "bg-amber-500/[0.06] border border-amber-500/20 text-amber-300"
            }`}>
              <ClockIcon size={13} />
              <span>
                {remaining <= 0 ? "This link has expired" : `Expires in ${formatCountdown(remaining)}`}
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-5">
          <div className="text-[10px] text-[#3a3a45]">
            Protected by Lockora · End-to-end encrypted
          </div>
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import { doc, setDoc } from "firebase/firestore";
import { inputCls } from "../../utils/vault";
import { checkBreached } from "../../utils/breach";

export default function SecuritySettings({
  user,
  sessionTimeout,
  setSessionTimeout,
}) {
  const navigate = useNavigate();
  const [newMaster, setNewMaster] = useState("");
  const [confirmMaster, setConfirmMaster] = useState("");
  const [changing, setChanging] = useState(false);
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [breachPassword, setBreachPassword] = useState("");
  const [breachResult, setBreachResult] = useState(null);
  const [checkingBreach, setCheckingBreach] = useState(false);

  const TIMEOUT_OPTIONS = [
    { label: "1 min", value: 1 },
    { label: "5 min", value: 5 },
    { label: "15 min", value: 15 },
    { label: "30 min", value: 30 },
    { label: "1 hour", value: 60 },
    { label: "Never", value: 0 },
  ];

  const handleChangeMaster = async (e) => {
    e.preventDefault();
    setErr("");
    setMsg("");
    if (newMaster !== confirmMaster) {
      setErr("Passwords do not match.");
      return;
    }
    if (newMaster.length < 8) {
      setErr("Must be at least 8 characters.");
      return;
    }
    setChanging(true);
    try {
      const { deriveKey, encryptCanary } = await import("../../utils/crypto");
      const newKey = await deriveKey(newMaster, user.uid);
      const canary = await encryptCanary(newKey);
      await setDoc(doc(db, "users", user.uid, "vault", "meta"), { canary });
      setMsg("Master password updated. Redirecting…");
      setTimeout(() => navigate("/unlock", { replace: true }), 2500);
    } catch {
      setErr("Failed to update. Try again.");
    } finally {
      setChanging(false);
    }
  };

  const handleCheckBreach = async () => {
    if (!breachPassword.trim()) return;
    setCheckingBreach(true);
    setBreachResult(null);
    try {
      const count = await checkBreached(breachPassword);
      setBreachResult(count);
    } catch {
      setBreachResult(-1); // error
    } finally {
      setCheckingBreach(false);
    }
  };

  return (
    <div className="w-full max-w-[600px] px-1 sm:px-0">
      <h2 className="text-[22px] md:text-[26px] font-light text-white mb-4 md:mb-6">
        Security
      </h2>

      <div className="bg-[#141418] border border-[#232329] rounded-2xl p-4 md:p-5 mb-4">
        <div className="text-[13px] text-white mb-1.5">Session timeout</div>
        <div className="text-[11px] text-[#4a4a55] leading-relaxed">
          Locks your vault after inactivity — you stay logged in but must
          re-enter your master password.
        </div>
        <div className="flex gap-2 mt-3.5 flex-wrap">
          {TIMEOUT_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => setSessionTimeout(o.value)}
              className={`py-1.5 px-3 sm:px-3.5 rounded-lg border text-[11px] transition-all cursor-pointer ${sessionTimeout === o.value ? "bg-purple-500/15 border-purple-500/30 text-purple-300" : "bg-[#1a1a20] border-[#232329] text-[#6b6b7b] hover:border-[#3a3a45] hover:text-[#a0a0b0]"}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-[#141418] border border-[#232329] rounded-2xl p-4 md:p-5 mb-4">
        <div className="text-[13px] text-white mb-1.5">
          Change master password
        </div>
        <div className="text-[11px] text-[#4a4a55] leading-relaxed mb-4">
          After changing, you will be redirected to the unlock screen.
        </div>
        <form onSubmit={handleChangeMaster} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-[0.1em] text-[#6b6b7b]">
              New master password
            </label>
            <input
              type="password"
              placeholder="New master password"
              value={newMaster}
              onChange={(e) => setNewMaster(e.target.value)}
              required
              className={inputCls}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-[0.1em] text-[#6b6b7b]">
              Confirm new master password
            </label>
            <input
              type="password"
              placeholder="Confirm"
              value={confirmMaster}
              onChange={(e) => setConfirmMaster(e.target.value)}
              required
              className={inputCls}
            />
          </div>
          {err && (
            <div className="text-[11px] text-red-400 py-2 px-3 bg-red-500/[0.06] border border-red-500/20 rounded-lg">
              {err}
            </div>
          )}
          {msg && (
            <div className="text-[11px] text-emerald-400 py-2 px-3 bg-emerald-500/[0.06] border border-emerald-500/20 rounded-lg">
              {msg}
            </div>
          )}
          <button
            type="submit"
            disabled={changing}
            className="self-start py-2.5 px-5 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white border-none rounded-lg text-[11px] uppercase tracking-[0.1em] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {changing ? "Updating…" : "Update master password"}
          </button>
        </form>
      </div>

      <div className="bg-[#141418] border border-[#232329] rounded-2xl p-4 md:p-5 mb-4">
        <div className="text-[13px] text-white mb-1.5">
          Check password breach
        </div>
        <div className="text-[11px] text-[#4a4a55] leading-relaxed mb-4">
          Check if a password has been found in known data breaches using
          HaveIBeenPwned.
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-[0.1em] text-[#6b6b7b]">
              Password to check
            </label>
            <input
              type="password"
              placeholder="Enter password"
              value={breachPassword}
              onChange={(e) => setBreachPassword(e.target.value)}
              className={inputCls}
            />
          </div>
          {breachResult !== null && (
            <div
              className={`text-[11px] py-2 px-3 rounded-lg ${
                breachResult === 0
                  ? "text-emerald-400 bg-emerald-500/[0.06] border border-emerald-500/20"
                  : breachResult > 0
                    ? "text-red-400 bg-red-500/[0.06] border border-red-500/20"
                    : "text-yellow-400 bg-yellow-500/[0.06] border border-yellow-500/20"
              }`}
            >
              {breachResult === 0
                ? "This password has not been found in any known breaches."
                : breachResult > 0
                  ? `This password has been found in ${breachResult.toLocaleString()} breach${breachResult === 1 ? "" : "es"}.`
                  : "Failed to check. Please try again."}
            </div>
          )}
          <button
            onClick={handleCheckBreach}
            disabled={checkingBreach || !breachPassword.trim()}
            className="self-start py-2.5 px-5 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white border-none rounded-lg text-[11px] uppercase tracking-[0.1em] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {checkingBreach ? "Checking…" : "Check breach"}
          </button>
        </div>
      </div>

      <div className="bg-[#141418] border border-[#232329] rounded-2xl p-4 md:p-5">
        <div className="text-[13px] text-white mb-1.5">Active sessions</div>
        <div className="text-[11px] text-[#4a4a55] leading-relaxed mb-3.5">
          Devices currently signed in to your vault.
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3 border-b border-[#1e1e25] last:border-b-0 gap-2 sm:gap-0">
          <div>
            <div className="text-[12px] text-white flex items-center gap-2">
              This device{" "}
              <span className="text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded py-px px-1.5 tracking-wide">
                Current
              </span>
            </div>
            <div className="text-[11px] text-[#4a4a55] mt-0.5">
              {navigator.userAgent.includes("Chrome") ? "Chrome" : "Browser"} ·
              Last seen: Now
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

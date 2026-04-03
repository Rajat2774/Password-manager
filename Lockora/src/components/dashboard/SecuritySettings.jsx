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
      <h2 className="text-[22px] md:text-[28px] font-bold text-[#1a1a2e] mb-1">
        Security
      </h2>
      <p className="text-[13px] text-[#6b7c6b] mb-6">
        Manage your vault security and session settings.
      </p>

      <div className="bg-white border border-[#e2e8e0] rounded-2xl p-4 md:p-5 mb-4 shadow-sm">
        <div className="text-[14px] text-[#1a1a2e] mb-1.5 font-semibold">Session timeout</div>
        <div className="text-[12px] text-[#6b7c6b] leading-relaxed">
          Locks your vault after inactivity — you stay logged in but must
          re-enter your master password.
        </div>
        <div className="flex gap-2 mt-3.5 flex-wrap">
          {TIMEOUT_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => setSessionTimeout(o.value)}
              className={`py-2 px-3.5 sm:px-4 rounded-xl border text-[12px] font-medium transition-all cursor-pointer ${sessionTimeout === o.value ? "bg-[#1a6b3c] border-[#1a6b3c] text-white shadow-md shadow-[#1a6b3c]/15" : "bg-[#f6f8f3] border-[#e2e8e0] text-[#5a6a5a] hover:border-[#c5cdb8] hover:text-[#1a1a2e]"}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-white border border-[#e2e8e0] rounded-2xl p-4 md:p-5 mb-4 shadow-sm">
        <div className="text-[14px] text-[#1a1a2e] mb-1.5 font-semibold">
          Change master password
        </div>
        <div className="text-[12px] text-[#6b7c6b] leading-relaxed mb-4">
          After changing, you will be redirected to the unlock screen.
        </div>
        <form onSubmit={handleChangeMaster} className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-[0.1em] text-[#8a9a72] font-medium">
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
            <label className="text-[10px] uppercase tracking-[0.1em] text-[#8a9a72] font-medium">
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
            <div className="text-[12px] text-red-500 py-2 px-3 bg-red-50 border border-red-200 rounded-xl">
              {err}
            </div>
          )}
          {msg && (
            <div className="text-[12px] text-emerald-600 py-2 px-3 bg-emerald-50 border border-emerald-200 rounded-xl">
              {msg}
            </div>
          )}
          <button
            type="submit"
            disabled={changing}
            className="self-start py-2.5 px-5 bg-[#1a6b3c] hover:bg-[#145a31] text-white border-none rounded-xl text-[12px] font-medium tracking-wide transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {changing ? "Updating…" : "Update master password"}
          </button>
        </form>
      </div>

      <div className="bg-white border border-[#e2e8e0] rounded-2xl p-4 md:p-5 mb-4 shadow-sm">
        <div className="text-[14px] text-[#1a1a2e] mb-1.5 font-semibold">
          Check password breach
        </div>
        <div className="text-[12px] text-[#6b7c6b] leading-relaxed mb-4">
          Check if a password has been found in known data breaches using
          HaveIBeenPwned.
        </div>
        <div className="flex flex-col gap-3">
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] uppercase tracking-[0.1em] text-[#8a9a72] font-medium">
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
              className={`text-[12px] py-2.5 px-3.5 rounded-xl ${
                breachResult === 0
                  ? "text-emerald-600 bg-emerald-50 border border-emerald-200"
                  : breachResult > 0
                    ? "text-red-500 bg-red-50 border border-red-200"
                    : "text-amber-600 bg-amber-50 border border-amber-200"
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
            className="self-start py-2.5 px-5 bg-[#1a6b3c] hover:bg-[#145a31] text-white border-none rounded-xl text-[12px] font-medium tracking-wide transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
          >
            {checkingBreach ? "Checking…" : "Check breach"}
          </button>
        </div>
      </div>

      <div className="bg-white border border-[#e2e8e0] rounded-2xl p-4 md:p-5 shadow-sm">
        <div className="text-[14px] text-[#1a1a2e] mb-1.5 font-semibold">Active sessions</div>
        <div className="text-[12px] text-[#6b7c6b] leading-relaxed mb-3.5">
          Devices currently signed in to your vault.
        </div>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between py-3 border-b border-[#e2e8e0] last:border-b-0 gap-2 sm:gap-0">
          <div>
            <div className="text-[13px] text-[#1a1a2e] font-medium flex items-center gap-2">
              This device{" "}
              <span className="text-[9px] bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full py-px px-2 tracking-wide font-semibold">
                Current
              </span>
            </div>
            <div className="text-[11px] text-[#6b7c6b] mt-0.5">
              {navigator.userAgent.includes("Chrome") ? "Chrome" : "Browser"} ·
              Last seen: Now
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

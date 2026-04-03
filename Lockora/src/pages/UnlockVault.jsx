// src/pages/UnlockVault.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { deriveKey, encryptCanary, verifyCanary } from "../utils/crypto";

const ShieldIcon = ({ size = 40 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const EyeIcon = ({ open }) => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {open ? (
      <>
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" />
        <path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" />
        <line x1="1" y1="1" x2="23" y2="23" />
      </>
    )}
  </svg>
);

export default function UnlockVault() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [masterPassword, setMasterPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordHint, setPasswordHint] = useState("");
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [unlockFailures, setUnlockFailures] = useState(0);
  const [savedHint, setSavedHint] = useState("");

  useEffect(() => {
    // Check if coming from extension with expected uid
    const urlParams = new URLSearchParams(window.location.search);
    const fromExtension = urlParams.get("from") === "extension";
    const expectedUid = urlParams.get("uid");

    if (fromExtension && expectedUid) {
      // Clean up URL
      const url = new URL(window.location);
      url.searchParams.delete("from");
      url.searchParams.delete("uid");
      window.history.replaceState({}, "", url);

      // Check current user
      const currentUser = auth.currentUser;
      if (currentUser && currentUser.uid !== expectedUid) {
        // Wrong user signed in, sign out
        signOut(auth);
        return;
      }
    }

    const unsubscribe = auth.onAuthStateChanged(async (u) => {
      if (!u) {
        navigate("/");
        return;
      }
      setUser(u);
      const snap = await getDoc(doc(db, "users", u.uid, "vault", "meta"));
      setIsNewUser(!snap.exists());
      setTimeout(() => setMounted(true), 50);
    });
    return unsubscribe;
  }, [navigate]);

  const handleUnlock = async (e) => {
    e.preventDefault();
    setError("");

    if (isNewUser && masterPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (masterPassword.length < 8) {
      setError("Master password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      const cryptoKey = await deriveKey(masterPassword, user.uid);

      if (isNewUser) {
        const canary = await encryptCanary(cryptoKey);
        await setDoc(doc(db, "users", user.uid, "vault", "meta"), {
          canary,
          hint: passwordHint,
        });
      } else {
        const snap = await getDoc(doc(db, "users", user.uid, "vault", "meta"));
        const metaData = snap.data();
        const valid = await verifyCanary(metaData.canary, cryptoKey);
        if (!valid) {
          setUnlockFailures((prev) => prev + 1);
          setSavedHint(metaData.hint || "");
          setError("Incorrect master password. Please try again.");
          setLoading(false);
          return;
        }
      }

      navigate("/dashboard", { state: { cryptoKey } });
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  if (!user) return null;

  const inputClass =
    "w-full py-3 px-3.5 bg-white border border-[#d4dcc8] rounded-xl text-[13px] text-[#1a1a2e] outline-none placeholder:text-[#a0a8b0] transition-all duration-200 focus:border-[#1a6b3c] focus:shadow-[0_0_0_3px_rgba(26,107,60,0.08)]";

  return (
    <div className="min-h-screen bg-[#eef1e8] flex flex-col items-center justify-center px-3 sm:px-4 py-6 sm:py-8 relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-[-200px] right-[-200px] w-[700px] h-[700px] rounded-full bg-[#1a6b3c]/[0.03] blur-[150px] pointer-events-none" />
      <div className="absolute bottom-[-150px] left-[-100px] w-[500px] h-[500px] rounded-full bg-[#22a050]/[0.03] blur-[120px] pointer-events-none" />

      <div
        className={`relative w-full max-w-[400px] bg-white border border-[#e2e8e0] rounded-2xl p-6 sm:p-8 md:p-11 shadow-2xl shadow-[#1a6b3c]/5 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-5 scale-[0.98]"}`}
      >
        {/* Accent Top Line */}
        <div className="absolute top-0 left-10 right-10 h-[2px] bg-gradient-to-r from-transparent via-[#1a6b3c]/40 to-transparent rounded-full" />

        {/* Icon */}
        <div className="flex justify-center mb-4 sm:mb-5 text-[#1a6b3c] opacity-85">
          <ShieldIcon size={32} />
        </div>

        {isNewUser && (
          <div className="text-center mb-4">
            <span className="inline-block bg-[#1a6b3c]/10 border border-[#1a6b3c]/25 text-[#1a6b3c] text-[9px] uppercase tracking-[0.1em] px-2.5 py-0.5 rounded-full font-semibold">
              First time setup
            </span>
          </div>
        )}

        <h1 className="text-[22px] sm:text-[28px] font-bold text-[#1a1a2e] text-center mb-2 tracking-tight">
          {isNewUser ? "Set Master Password" : "Unlock Vault"}
        </h1>

        <div className="flex justify-center mb-5 sm:mb-8">
          <div className="inline-flex items-center gap-1.5 bg-[#1a6b3c]/[0.06] border border-[#1a6b3c]/15 rounded-full py-1 px-3 text-[10px] sm:text-[11px] text-[#6b7c6b] tracking-wide max-w-full">
            <span className="truncate">🔑 {user?.email}</span>
          </div>
        </div>

        <form onSubmit={handleUnlock}>
          <div className="mb-4">
            <label className="block text-[10px] uppercase tracking-[0.12em] text-[#8a9a72] mb-2 font-medium">
              Master Password
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                placeholder="Enter your master password"
                value={masterPassword}
                onChange={(e) => setMasterPassword(e.target.value)}
                required
                autoFocus
                className={`${inputClass} pr-10`}
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a9a72] hover:text-[#1a6b3c] transition-colors bg-transparent border-none flex items-center p-0.5 cursor-pointer"
              >
                <EyeIcon open={showPass} />
              </button>
            </div>
            {isNewUser && (
              <p className="text-[10px] text-[#8a9a72] tracking-wide mt-1.5 leading-relaxed">
                ⚠ This password encrypts all your vault data. It cannot be
                recovered if lost.
              </p>
            )}
          </div>

          {isNewUser && (
            <>
              <div className="mb-4">
                <label className="block text-[10px] uppercase tracking-[0.12em] text-[#8a9a72] mb-2 font-medium">
                  Confirm Master Password
                </label>
                <div className="relative">
                  <input
                    type={showPass ? "text" : "password"}
                    placeholder="Confirm your master password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className={`${inputClass} pr-10`}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-[10px] uppercase tracking-[0.12em] text-[#8a9a72] mb-2 font-medium">
                  Password Hint (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="A clue to help you remember"
                    value={passwordHint}
                    onChange={(e) => setPasswordHint(e.target.value)}
                    className={inputClass}
                  />
                </div>
                <p className="text-[10px] text-[#8a9a72] tracking-wide mt-1.5 leading-relaxed">
                  Avoid using your actual password as the hint.
                </p>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-[#1a6b3c] hover:bg-[#145a31] text-white border-none rounded-xl text-[12px] font-semibold uppercase tracking-[0.12em] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#1a6b3c]/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-2 cursor-pointer"
          >
            {loading ? (
              <>
                <span className="inline-block w-3.5 h-3.5 border-[1.5px] border-white/30 border-t-white rounded-full animate-spin align-middle mr-2" />
                {isNewUser ? "Setting up vault…" : "Decrypting vault…"}
              </>
            ) : isNewUser ? (
              "Create Vault →"
            ) : (
              "Unlock Vault →"
            )}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="mt-4 py-2.5 px-3.5 rounded-xl text-[11px] tracking-wide bg-red-50 border border-red-200 text-red-500">
            ⚠ {error}
          </div>
        )}

        {/* Hint */}
        {!isNewUser && unlockFailures >= 1 && savedHint && (
          <div className="mt-4 py-3 px-3.5 rounded-xl flex items-start gap-3 bg-[#1a6b3c]/[0.05] border border-[#1a6b3c]/15 text-[#1a6b3c]">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="shrink-0 mt-0.5"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
            <div>
              <div className="text-[9px] uppercase tracking-[0.12em] text-[#8a9a72] mb-0.5 font-medium">
                Your Hint
              </div>
              <div className="text-[11px] text-[#1a1a2e]">{savedHint}</div>
            </div>
          </div>
        )}

        <button
          onClick={handleLogout}
          className="block mx-auto mt-6 bg-transparent border-none text-[11px] text-[#8a9a72] hover:text-[#1a6b3c] underline tracking-wide transition-colors cursor-pointer"
        >
          Sign in with a different account
        </button>
      </div>
    </div>
  );
}

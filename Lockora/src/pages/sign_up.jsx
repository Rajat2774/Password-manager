import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, googleProvider } from "../firebase";
import { createUserWithEmailAndPassword, signInWithPopup, updateProfile } from "firebase/auth";

const ShieldIcon = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

const EyeIcon = ({ open }) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    {open ? (<><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>) : (<><path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></>)}
  </svg>
);

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

// Password strength checker
const getStrength = (pwd) => {
  let score = 0;
  if (pwd.length >= 8) score++;
  if (pwd.length >= 12) score++;
  if (/[A-Z]/.test(pwd)) score++;
  if (/[0-9]/.test(pwd)) score++;
  if (/[^A-Za-z0-9]/.test(pwd)) score++;
  return score;
};

const strengthLabel = ["", "Weak", "Fair", "Good", "Strong", "Very strong"];
const strengthColor = ["", "#ef4444", "#f97316", "#eab308", "#22c55e", "#10b981"];

const getFriendlyError = (code) => {
  switch (code) {
    case "auth/email-already-in-use": return "An account with this email already exists.";
    case "auth/invalid-email": return "Please enter a valid email address.";
    case "auth/weak-password": return "Password must be at least 6 characters.";
    case "auth/popup-closed-by-user": return "Google sign-in was cancelled.";
    case "auth/network-request-failed": return "Network error. Check your connection.";
    default: return "Something went wrong. Please try again.";
  }
};

export default function SignUp() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  const strength = getStrength(password);
  const passwordsMatch = confirm.length > 0 && password === confirm;
  const passwordsMismatch = confirm.length > 0 && password !== confirm;

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords do not match."); return; }
    if (strength < 2) { setError("Please choose a stronger password."); return; }
    setLoading(true);
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      if (name.trim()) await updateProfile(user, { displayName: name.trim() });
      navigate("/unlock");
    } catch (err) {
      setError(getFriendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setError("");
    setGoogleLoading(true);
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/unlock");
    } catch (err) {
      setError(getFriendlyError(err.code));
    } finally {
      setGoogleLoading(false);
    }
  };

  const inputClass = "w-full py-3 px-3.5 bg-white border border-[#d4dcc8] rounded-xl text-[13px] text-[#1a1a2e] outline-none placeholder:text-[#a0a8b0] transition-all duration-200 focus:border-[#1a6b3c] focus:shadow-[0_0_0_3px_rgba(26,107,60,0.08)]";

  return (
    <div className="min-h-screen bg-[#eef1e8] flex items-center justify-center px-3 sm:px-4 py-6 sm:py-8 relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-[-200px] right-[-100px] w-[500px] h-[500px] rounded-full bg-[#1a6b3c]/[0.04] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-150px] left-[-100px] w-[400px] h-[400px] rounded-full bg-[#22a050]/[0.03] blur-[100px] pointer-events-none" />

      {/* Grid */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage: "linear-gradient(rgba(26,107,60,.12) 1px, transparent 1px), linear-gradient(90deg, rgba(26,107,60,.12) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <div
        className={`relative w-full max-w-[420px] bg-white border border-[#e2e8e0] rounded-2xl p-6 sm:p-8 md:p-11 shadow-2xl shadow-[#1a6b3c]/5 transition-all duration-700 ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
      >
        {/* Accent Top Line */}
        <div className="absolute top-0 left-10 right-10 h-[2px] bg-gradient-to-r from-transparent via-[#1a6b3c]/40 to-transparent rounded-full" />

        {/* Brand */}
        <div className="flex items-center gap-2.5 mb-5 sm:mb-7">
          <div className="w-9 h-9 rounded-xl bg-[#1a6b3c] flex items-center justify-center text-white shadow-lg shadow-[#1a6b3c]/20">
            <ShieldIcon size={18} />
          </div>
          <span className="text-xl font-bold text-[#1a1a2e] tracking-wide">Lockora</span>
        </div>

        <h1 className="text-[22px] sm:text-[28px] font-bold text-[#1a1a2e] mb-1.5 tracking-tight">Create account</h1>
        <p className="text-[12px] text-[#8a9a72] tracking-wide mb-5 sm:mb-7">Set up your secure vault</p>

        {/* Google Button */}
        <button
          onClick={handleGoogle}
          disabled={googleLoading || loading}
          className="w-full flex items-center justify-center gap-2.5 py-3 px-4 bg-[#f6f8f3] border border-[#e2e8e0] rounded-xl text-[13px] text-[#5a6a5a] tracking-wide transition-all duration-200 hover:border-[#c5cdb8] hover:text-[#1a1a2e] hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 mb-5 cursor-pointer font-medium"
        >
          {googleLoading ? <span className="w-4 h-4 border-[1.5px] border-[#e2e8e0] border-t-[#4285F4] rounded-full animate-spin" /> : <GoogleIcon />}
          {googleLoading ? "Connecting…" : "Continue with Google"}
        </button>

        {/* Divider */}
        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-[#e2e8e0]" />
          <span className="text-[10px] text-[#8a9a72] uppercase tracking-[0.12em]">or</span>
          <div className="flex-1 h-px bg-[#e2e8e0]" />
        </div>

        {/* Form */}
        <form onSubmit={handleSignUp}>
          <div className="mb-4">
            <label className="block text-[10px] uppercase tracking-[0.12em] text-[#8a9a72] mb-2 font-medium">Full name</label>
            <input type="text" placeholder="Jane Doe" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" className={inputClass} />
          </div>
          <div className="mb-4">
            <label className="block text-[10px] uppercase tracking-[0.12em] text-[#8a9a72] mb-2 font-medium">Email address</label>
            <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" className={inputClass} />
          </div>
          <div className="mb-4">
            <label className="block text-[10px] uppercase tracking-[0.12em] text-[#8a9a72] mb-2 font-medium">Master password</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                className={`${inputClass} pr-10`}
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a9a72] hover:text-[#1a6b3c] transition-colors bg-transparent border-none flex items-center p-0.5 cursor-pointer">
                <EyeIcon open={showPass} />
              </button>
            </div>
            {password.length > 0 && (
              <div className="flex items-center gap-1.5 mt-2">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="h-[3px] flex-1 rounded-full transition-colors duration-300" style={{ background: i <= strength ? strengthColor[strength] : "#e2e8e0" }} />
                ))}
                <span className="text-[10px] tracking-wide ml-1 min-w-[60px] font-medium" style={{ color: strengthColor[strength] }}>{strengthLabel[strength]}</span>
              </div>
            )}
          </div>
          <div className="mb-4">
            <label className="block text-[10px] uppercase tracking-[0.12em] text-[#8a9a72] mb-2 font-medium">Confirm password</label>
            <div className="relative">
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="••••••••••••"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
                className={`${inputClass} pr-10 ${passwordsMatch ? "!border-emerald-500/50" : passwordsMismatch ? "!border-red-500/50" : ""}`}
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a9a72] hover:text-[#1a6b3c] transition-colors bg-transparent border-none flex items-center p-0.5 cursor-pointer">
                <EyeIcon open={showConfirm} />
              </button>
            </div>
            {passwordsMatch && <p className="text-[10px] text-emerald-500 tracking-wide mt-1.5 font-medium">✓ Passwords match</p>}
            {passwordsMismatch && <p className="text-[10px] text-red-500 tracking-wide mt-1.5 font-medium">✗ Passwords do not match</p>}
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading || passwordsMismatch}
            className="w-full py-3.5 bg-[#1a6b3c] hover:bg-[#145a31] text-white border-none rounded-xl text-[12px] font-semibold uppercase tracking-[0.12em] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#1a6b3c]/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-1 cursor-pointer"
          >
            {loading ? <><span className="inline-block w-3.5 h-3.5 border-[1.5px] border-white/30 border-t-white rounded-full animate-spin align-middle mr-2" />Creating vault…</> : "Create Vault →"}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="mt-4 py-2.5 px-3.5 rounded-xl text-[11px] tracking-wide bg-red-50 border border-red-200 text-red-500">
            ⚠ {error}
          </div>
        )}

        {/* Footer */}
        <div className="mt-6 text-center text-[11px] text-[#8a9a72] tracking-wide">
          Already have an account? <Link to="/" className="text-[#1a6b3c] hover:text-[#145a31] no-underline font-medium transition-colors duration-200">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
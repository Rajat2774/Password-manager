import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, googleProvider } from "../firebase";
import { signInWithEmailAndPassword, signInWithPopup, sendPasswordResetEmail } from "firebase/auth";
import logoImg from "../assets/logo.png";

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

const getFriendlyError = (code) => {
  switch (code) {
    case "auth/invalid-credential":
    case "auth/wrong-password":
    case "auth/user-not-found": return "Incorrect email or password.";
    case "auth/invalid-email": return "Please enter a valid email address.";
    case "auth/too-many-requests": return "Too many attempts. Please wait and try again.";
    case "auth/popup-closed-by-user": return "Google sign-in was cancelled.";
    case "auth/network-request-failed": return "Network error. Check your connection.";
    default: return "Something went wrong. Please try again.";
  }
};

export default function SignIn() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState("");

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/unlock");
    } catch (err) {
      setError(getFriendlyError(err.code));
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setForgotMsg("");
    const target = email.trim();
    if (!target) {
      setForgotMsg("error:Enter your email address above first, then click Forgot password.");
      return;
    }
    setForgotLoading(true);
    try {
      await sendPasswordResetEmail(auth, target);
      setForgotMsg("ok:Password reset email sent! Check your inbox.");
    } catch (err) {
      if (err.code === "auth/user-not-found" || err.code === "auth/invalid-email") {
        setForgotMsg("error:No account found for that email address.");
      } else {
        setForgotMsg("error:Could not send reset email. Please try again.");
      }
    } finally {
      setForgotLoading(false);
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

  return (
    <div className="min-h-screen bg-[#eef1e8] flex items-center justify-center px-3 sm:px-4 py-6 sm:py-8 relative overflow-hidden">
      {/* Ambient Glow */}
      <div className="absolute top-[-200px] right-[-100px] w-[500px] h-[500px] rounded-full bg-[#1a6b3c]/[0.04] blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-150px] left-[-100px] w-[400px] h-[400px] rounded-full bg-[#22a050]/[0.03] blur-[100px] pointer-events-none" />

      {/* Grid Pattern */}
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
        <div className="flex items-center gap-2.5 mb-5 sm:mb-8 justify-center w-full">
          <img src={logoImg} alt="Logo" className="h-10 w-auto object-contain" />
        </div>

        <h1 className="text-[22px] sm:text-[28px] font-bold text-[#1a1a2e] mb-1.5 tracking-tight">Welcome back</h1>
        <p className="text-[12px] text-[#8a9a72] tracking-wide mb-5 sm:mb-8">Sign in to your vault</p>

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
        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-px bg-[#e2e8e0]" />
          <span className="text-[10px] text-[#8a9a72] uppercase tracking-[0.12em]">or</span>
          <div className="flex-1 h-px bg-[#e2e8e0]" />
        </div>

        {/* Form */}
        <form onSubmit={handleSignIn}>
          <div className="mb-4">
            <label className="block text-[10px] uppercase tracking-[0.12em] text-[#8a9a72] mb-2 font-medium">Email address</label>
            <input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full py-3 px-3.5 bg-white border border-[#d4dcc8] rounded-xl text-[13px] text-[#1a1a2e] outline-none placeholder:text-[#a0a8b0] transition-all duration-200 focus:border-[#1a6b3c] focus:shadow-[0_0_0_3px_rgba(26,107,60,0.08)]"
            />
          </div>
          <div className="mb-2">
            <label className="block text-[10px] uppercase tracking-[0.12em] text-[#8a9a72] mb-2 font-medium">Account password</label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full py-3 px-3.5 pr-10 bg-white border border-[#d4dcc8] rounded-xl text-[13px] text-[#1a1a2e] outline-none placeholder:text-[#a0a8b0] transition-all duration-200 focus:border-[#1a6b3c] focus:shadow-[0_0_0_3px_rgba(26,107,60,0.08)]"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8a9a72] hover:text-[#1a6b3c] transition-colors duration-200 bg-transparent border-none flex items-center p-0.5 cursor-pointer">
                <EyeIcon open={showPass} />
              </button>
            </div>
            <div className="text-right mt-1.5">
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={forgotLoading}
                className="text-[10px] text-[#8a9a72] hover:text-[#1a6b3c] tracking-wide transition-colors duration-200 bg-transparent border-none p-0 cursor-pointer underline-offset-2 hover:underline disabled:opacity-50"
              >
                {forgotLoading ? "Sending…" : "Forgot password?"}
              </button>
            </div>
            {forgotMsg && (
              <div className={`mt-1.5 py-2 px-3 rounded-xl text-[10px] tracking-wide ${
                forgotMsg.startsWith("ok:")
                  ? "bg-green-50 border border-green-200 text-green-700"
                  : "bg-red-50 border border-red-200 text-red-500"
              }`}>
                {forgotMsg.startsWith("ok:") ? "✓ " : "⚠ "}{forgotMsg.slice(3)}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || googleLoading}
            className="w-full py-3.5 bg-[#1a6b3c] hover:bg-[#145a31] text-white border-none rounded-xl text-[12px] font-semibold uppercase tracking-[0.12em] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#1a6b3c]/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:translate-y-0 mt-2 cursor-pointer"
          >
            {loading ? <><span className="inline-block w-3.5 h-3.5 border-[1.5px] border-white/30 border-t-white rounded-full animate-spin align-middle mr-2" />Verifying…</> : "Unlock Vault →"}
          </button>
        </form>

        {/* Error */}
        {error && (
          <div className="mt-4 py-2.5 px-3.5 rounded-xl text-[11px] tracking-wide bg-red-50 border border-red-200 text-red-500">
            ⚠ {error}
          </div>
        )}

        {/* Footer */}
        <div className="mt-7 text-center text-[11px] text-[#8a9a72] tracking-wide">
          Don't have an account? <Link to="/signup" className="text-[#1a6b3c] hover:text-[#145a31] no-underline font-medium transition-colors duration-200">Create one</Link>
        </div>
      </div>
    </div>
  );
}
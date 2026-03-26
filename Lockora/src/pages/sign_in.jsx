import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth, googleProvider } from "../firebase";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";

const GridLines = () => (
  <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.04, pointerEvents: "none" }} xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
        <path d="M 48 0 L 0 0 0 48" fill="none" stroke="#c8b8a2" strokeWidth="0.5" />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#grid)" />
  </svg>
);

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

  useEffect(() => { setTimeout(() => setMounted(true), 50); }, []);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/dashboard");
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
      navigate("/dashboard");
    } catch (err) {
      setError(getFriendlyError(err.code));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500;600&family=DM+Mono:wght@300;400&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        :root { --parchment: #f5f0e8; --ink: #1a1610; --ink-soft: #3d3428; --gold: #b8860b; --sepia: #8b7355; --sepia-light: #c8b8a2; --card-bg: #faf7f2; --border: #ddd5c4; --error: #8b2020; }
        body { background: var(--parchment); font-family: 'DM Mono', monospace; }
        .page { min-height: 100vh; display: flex; align-items: center; justify-content: center; background: var(--parchment); position: relative; overflow: hidden; padding: 24px; }
        .ambient-1 { position: absolute; width: 600px; height: 600px; border-radius: 50%; background: radial-gradient(circle, rgba(184,134,11,0.06) 0%, transparent 70%); top: -150px; right: -100px; pointer-events: none; }
        .ambient-2 { position: absolute; width: 500px; height: 500px; border-radius: 50%; background: radial-gradient(circle, rgba(139,115,85,0.07) 0%, transparent 70%); bottom: -100px; left: -80px; pointer-events: none; }
        .card { width: 100%; max-width: 420px; background: var(--card-bg); border: 1px solid var(--border); border-radius: 4px; padding: 52px 44px 44px; position: relative; box-shadow: 0 1px 2px rgba(26,22,16,0.04), 0 4px 16px rgba(26,22,16,0.06); opacity: ${mounted ? 1 : 0}; transform: ${mounted ? "translateY(0)" : "translateY(16px)"}; transition: opacity 0.6s ease, transform 0.6s ease; }
        .card::before { content: ''; position: absolute; top: 0; left: 44px; right: 44px; height: 2px; background: linear-gradient(90deg, transparent, var(--gold), transparent); }
        .brand { display: flex; align-items: center; gap: 10px; margin-bottom: 32px; }
        .brand-icon { color: var(--gold); }
        .brand-text { font-family: 'Cormorant Garamond', serif; font-size: 22px; font-weight: 500; color: var(--ink); letter-spacing: 0.04em; }
        .brand-text span { color: var(--gold); }
        h1 { font-family: 'Cormorant Garamond', serif; font-size: 32px; font-weight: 300; color: var(--ink); margin-bottom: 6px; }
        .subtitle { font-size: 11px; color: var(--sepia); letter-spacing: 0.08em; margin-bottom: 36px; text-transform: uppercase; }
        .divider { display: flex; align-items: center; gap: 12px; margin-bottom: 24px; }
        .divider-line { flex: 1; height: 1px; background: var(--border); }
        .divider-text { font-size: 10px; color: var(--sepia-light); letter-spacing: 0.1em; text-transform: uppercase; }
        .google-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 10px; padding: 11px 16px; background: white; border: 1px solid var(--border); border-radius: 3px; cursor: pointer; font-family: 'DM Mono', monospace; font-size: 12px; color: var(--ink-soft); letter-spacing: 0.04em; transition: all 0.2s ease; margin-bottom: 20px; }
        .google-btn:hover:not(:disabled) { border-color: var(--sepia-light); transform: translateY(-1px); box-shadow: 0 2px 8px rgba(26,22,16,0.06); }
        .google-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .field { margin-bottom: 18px; }
        label { display: block; font-size: 10px; letter-spacing: 0.12em; text-transform: uppercase; color: var(--sepia); margin-bottom: 7px; }
        .input-wrap { position: relative; }
        input[type="email"], input[type="password"], input[type="text"] { width: 100%; padding: 11px 14px; background: white; border: 1px solid var(--border); border-radius: 3px; font-family: 'DM Mono', monospace; font-size: 13px; color: var(--ink); outline: none; transition: border-color 0.2s, box-shadow 0.2s; }
        input::placeholder { color: var(--sepia-light); }
        input:focus { border-color: var(--gold); box-shadow: 0 0 0 3px rgba(184,134,11,0.08); }
        .eye-btn { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--sepia-light); display: flex; align-items: center; padding: 2px; }
        .eye-btn:hover { color: var(--sepia); }
        .forgot { text-align: right; margin-top: 6px; }
        .forgot a { font-size: 10px; color: var(--sepia); text-decoration: none; letter-spacing: 0.06em; border-bottom: 1px solid transparent; transition: all 0.2s; }
        .forgot a:hover { color: var(--gold); border-color: var(--gold); }
        .submit-btn { width: 100%; padding: 13px; background: var(--ink); color: var(--parchment); border: none; border-radius: 3px; font-family: 'DM Mono', monospace; font-size: 12px; letter-spacing: 0.12em; text-transform: uppercase; cursor: pointer; margin-top: 8px; transition: all 0.2s; }
        .submit-btn:hover:not(:disabled) { background: var(--ink-soft); transform: translateY(-1px); box-shadow: 0 4px 16px rgba(26,22,16,0.18); }
        .submit-btn:disabled { opacity: 0.7; cursor: not-allowed; }
        .loader { display: inline-block; width: 14px; height: 14px; border: 1.5px solid rgba(245,240,232,0.3); border-top-color: var(--parchment); border-radius: 50%; animation: spin 0.7s linear infinite; vertical-align: middle; margin-right: 8px; }
        @keyframes spin { to { transform: rotate(360deg); } }
        .error-msg { margin-top: 16px; padding: 10px 14px; border-radius: 3px; font-size: 11px; letter-spacing: 0.04em; background: rgba(139,32,32,0.06); border: 1px solid rgba(139,32,32,0.2); color: var(--error); }
        .footer { margin-top: 28px; text-align: center; font-size: 11px; color: var(--sepia-light); letter-spacing: 0.04em; }
        .footer a { color: var(--gold); text-decoration: none; border-bottom: 1px solid transparent; transition: border-color 0.2s; }
        .footer a:hover { border-color: var(--gold); }
      `}</style>
      <div className="page">
        <GridLines />
        <div className="ambient-1" /><div className="ambient-2" />
        <div className="card">
          <div className="brand">
            <span className="brand-icon"><ShieldIcon /></span>
            <span className="brand-text">Key<span>Vault</span></span>
          </div>
          <h1>Welcome back</h1>
          <p className="subtitle">Sign in to your vault</p>

          <button className="google-btn" onClick={handleGoogle} disabled={googleLoading || loading}>
            {googleLoading ? <span className="loader" style={{ borderTopColor: "#4285F4", border: "1.5px solid #ddd", borderTopWidth: "1.5px" }} /> : <GoogleIcon />}
            {googleLoading ? "Connecting…" : "Continue with Google"}
          </button>

          <div className="divider"><div className="divider-line" /><span className="divider-text">or</span><div className="divider-line" /></div>

          <form onSubmit={handleSignIn}>
            <div className="field">
              <label>Email address</label>
              <input type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required autoComplete="email" />
            </div>
            <div className="field">
              <label>Master password</label>
              <div className="input-wrap">
                <input type={showPass ? "text" : "password"} placeholder="••••••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" style={{ paddingRight: 40 }} />
                <button type="button" className="eye-btn" onClick={() => setShowPass(!showPass)}><EyeIcon open={showPass} /></button>
              </div>
              <div className="forgot"><a href="#">Forgot password?</a></div>
            </div>
            <button className="submit-btn" type="submit" disabled={loading || googleLoading}>
              {loading ? <><span className="loader" />Verifying…</> : "Unlock Vault →"}
            </button>
          </form>

          {error && <div className="error-msg">⚠ {error}</div>}

          <div className="footer">
            Don't have an account? <Link to="/signup">Create one</Link>
          </div>
        </div>
      </div>
    </>
  );
}
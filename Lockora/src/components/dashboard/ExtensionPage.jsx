// src/components/dashboard/ExtensionPage.jsx
import extSignin from "../../assets/extension/ext-signin.png";
import extAutofill from "../../assets/extension/ext-autofill.png";
import extNoform from "../../assets/extension/ext-noform.png";
import { ShieldIcon } from "./Icons";

const CHROME_STORE_URL =
  "https://chromewebstore.google.com/detail/lockora/YOUR_EXTENSION_ID";

const features = [
  {
    emoji: "🔑",
    title: "One-Click Autofill",
    desc: "Lockora detects login forms automatically and fills your credentials with a single click. No more copy-pasting.",
  },
  {
    emoji: "💾",
    title: "Smart Save Prompts",
    desc: "When you log in to a new site, Lockora prompts you to save the credentials securely to your encrypted vault.",
  },
  {
    emoji: "🔒",
    title: "Zero-Knowledge Security",
    desc: "Your master password never leaves your device. The extension uses the same AES-256 encryption as the web vault.",
  },
  {
    emoji: "⏱️",
    title: "Auto-Lock on Inactivity",
    desc: "The extension automatically locks your vault after a period of inactivity, keeping your data safe even if you walk away.",
  },
];

const steps = [
  {
    step: "01",
    title: "Install the Extension",
    desc: "Click the download button and add Lockora to your Chrome browser from the Chrome Web Store.",
  },
  {
    step: "02",
    title: "Sign In to Your Vault",
    desc: "Use your Lockora credentials or Google sign-in to authenticate, then enter your master password to unlock.",
  },
  {
    step: "03",
    title: "Browse & Autofill",
    desc: "Navigate to any login page — Lockora will detect the form and let you autofill your saved credentials instantly.",
  },
];

export default function ExtensionPage() {
  return (
    <div className="max-w-5xl mx-auto">
      {/* ── Hero Section ── */}
      <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-14 mb-14">
        {/* Left - Text */}
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1a6b3c]/10 border border-[#1a6b3c]/20 text-[#1a6b3c] text-[11px] font-semibold mb-5 uppercase tracking-[0.1em]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
            </svg>
            Chrome Extension
          </div>

          <h1 className="text-[28px] sm:text-[36px] lg:text-[42px] font-extrabold text-[#1a1a2e] leading-tight mb-4">
            Lockora for{" "}
            <span className="bg-gradient-to-r from-[#1a6b3c] to-[#22a050] bg-clip-text text-transparent">
              Chrome
            </span>
          </h1>

          <p className="text-[14px] sm:text-[16px] text-[#6b7c6b] leading-relaxed max-w-lg mx-auto lg:mx-0 mb-8">
            Autofill passwords, save new credentials, and access your
            encrypted vault — all without leaving the page. The same
            zero-knowledge security, right in your browser toolbar.
          </p>

          {/* Download Button */}
          <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start">
            <a
              href={CHROME_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center gap-2.5 px-7 py-3.5 bg-[#1a6b3c] hover:bg-[#145a31] text-white rounded-2xl text-[13px] font-semibold tracking-wide transition-all duration-400 hover:shadow-2xl hover:shadow-[#1a6b3c]/20 hover:scale-[1.03] hover:-translate-y-0.5 no-underline"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Add to Chrome — It's Free
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="group-hover:translate-x-1 transition-transform duration-300">
                <line x1="5" y1="12" x2="19" y2="12" />
                <polyline points="12 5 19 12 12 19" />
              </svg>
            </a>
            <span className="text-[11px] text-[#8a9a72]">
              Works with Chrome, Edge & Brave
            </span>
          </div>
        </div>

        {/* Right - Hero Image (Sign-in screenshot) */}
        <div className="flex-shrink-0 relative">
          <div className="absolute -inset-6 bg-[#1a6b3c]/[0.04] rounded-[32px] blur-[40px] pointer-events-none" />
          <div className="relative bg-white border border-[#e2e8e0] rounded-2xl p-2 shadow-2xl shadow-[#1a6b3c]/8 hover:shadow-[#1a6b3c]/15 transition-shadow duration-500">
            <img
              src={extSignin}
              alt="Lockora Chrome Extension sign-in screen"
              className="w-[260px] sm:w-[280px] rounded-xl"
            />
          </div>
        </div>
      </div>

      {/* ── Screenshot Showcase ── */}
      <div className="mb-14">
        <div className="text-center mb-8">
          <h2 className="text-[22px] sm:text-[28px] font-bold text-[#1a1a2e] mb-2">
            See It in Action
          </h2>
          <p className="text-[13px] text-[#6b7c6b]">
            From sign-in to autofill — a seamless experience
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 lg:gap-8">
          {[
            {
              img: extSignin,
              label: "Secure Sign-In",
              desc: "Google or email sign-in with master password",
            },
            {
              img: extAutofill,
              label: "Smart Autofill",
              desc: "One-click credential fill on any login page",
            },
            {
              img: extNoform,
              label: "Idle State",
              desc: "Quick access to your vault at any time",
            },
          ].map(({ img, label, desc }) => (
            <div key={label} className="group text-center">
              <div className="bg-white border border-[#e2e8e0] rounded-2xl p-2.5 mb-3 shadow-lg shadow-black/[0.03] group-hover:shadow-xl group-hover:shadow-[#1a6b3c]/8 group-hover:-translate-y-1 transition-all duration-400">
                <img
                  src={img}
                  alt={label}
                  className="w-full rounded-xl"
                />
              </div>
              <div className="text-[13px] font-semibold text-[#1a1a2e] mb-0.5">
                {label}
              </div>
              <div className="text-[11px] text-[#8a9a72]">{desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Features Grid ── */}
      <div className="mb-14">
        <div className="text-center mb-8">
          <span className="inline-block px-3 py-1 rounded-full bg-[#1a6b3c]/10 border border-[#1a6b3c]/20 text-[#1a6b3c] text-[10px] font-semibold mb-3 uppercase tracking-[0.12em]">
            Features
          </span>
          <h2 className="text-[22px] sm:text-[28px] font-bold text-[#1a1a2e] mb-2">
            Everything You Need,{" "}
            <span className="bg-gradient-to-r from-[#1a6b3c] to-[#22a050] bg-clip-text text-transparent">
              Built In
            </span>
          </h2>
          <p className="text-[13px] text-[#6b7c6b] max-w-md mx-auto">
            The Lockora extension brings the full power of your vault to
            every tab.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {features.map(({ emoji, title, desc }) => (
            <div
              key={title}
              className="group bg-white border border-[#e2e8e0] rounded-2xl p-5 hover:border-[#c5cdb8] hover:shadow-lg hover:shadow-[#1a6b3c]/5 hover:-translate-y-0.5 transition-all duration-400"
            >
              <div className="w-10 h-10 rounded-xl bg-[#1a6b3c]/8 border border-[#1a6b3c]/15 flex items-center justify-center mb-3.5 text-lg group-hover:scale-110 transition-transform duration-300">
                {emoji}
              </div>
              <h3 className="text-[14px] font-semibold text-[#1a1a2e] mb-1.5">
                {title}
              </h3>
              <p className="text-[12px] text-[#6b7c6b] leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── How It Works ── */}
      <div className="mb-14">
        <div className="text-center mb-8">
          <h2 className="text-[22px] sm:text-[28px] font-bold text-[#1a1a2e] mb-2">
            Get Started in{" "}
            <span className="bg-gradient-to-r from-[#1a6b3c] to-[#22a050] bg-clip-text text-transparent">
              3 Steps
            </span>
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {steps.map(({ step, title, desc }) => (
            <div
              key={step}
              className="relative bg-white border border-[#e2e8e0] rounded-2xl p-5 hover:border-[#c5cdb8] transition-all duration-300"
            >
              <div className="text-[28px] font-extrabold text-[#1a6b3c]/10 absolute top-3 right-4 leading-none select-none">
                {step}
              </div>
              <div className="w-8 h-8 rounded-lg bg-[#1a6b3c] text-white flex items-center justify-center text-[11px] font-bold mb-3">
                {step}
              </div>
              <h3 className="text-[13px] font-semibold text-[#1a1a2e] mb-1.5">
                {title}
              </h3>
              <p className="text-[12px] text-[#6b7c6b] leading-relaxed">
                {desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Bottom CTA ── */}
      <div className="relative bg-white border border-[#e2e8e0] rounded-2xl overflow-hidden mb-4">
        <div className="absolute top-0 right-0 w-60 h-60 bg-[#1a6b3c]/[0.03] rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#22a050]/[0.02] rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 py-12 px-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-[#1a6b3c] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#1a6b3c]/20">
            <ShieldIcon size={24} />
          </div>
          <h2 className="text-[20px] sm:text-[24px] font-bold text-[#1a1a2e] mb-2">
            Ready to supercharge your browser?
          </h2>
          <p className="text-[13px] text-[#6b7c6b] max-w-md mx-auto mb-6">
            Install the Lockora extension and never manually type a password again.
          </p>
          <a
            href={CHROME_STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#1a6b3c] hover:bg-[#145a31] text-white rounded-2xl text-[13px] font-semibold tracking-wide transition-all duration-400 hover:shadow-2xl hover:shadow-[#1a6b3c]/20 hover:scale-[1.03] no-underline"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Download for Chrome
          </a>
        </div>
      </div>
    </div>
  );
}

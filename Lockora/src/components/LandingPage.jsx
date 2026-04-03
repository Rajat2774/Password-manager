import { Link } from "react-router-dom";
import {
  RiShieldCheckLine,
  RiDeviceLine,
  RiLockPasswordLine,
  RiSafeLine,
  RiShieldKeyholeLine,
  RiEyeOffLine,
  RiKey2Line,
} from "react-icons/ri";
import { HiArrowRight, HiChevronDown } from "react-icons/hi";
import Navbar from "./Navbar";
import Footer from "./Footer";

/* ─────────── HERO ─────────── */
function Hero() {
  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20"
    >
      {/* Ambient background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[#1a6b3c]/[0.04] rounded-full blur-[150px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-[#22a050]/[0.03] rounded-full blur-[120px] animate-pulse-glow delay-500" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#1a6b3c]/[0.02] rounded-full blur-[180px]" />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(26,107,60,.15) 1px, transparent 1px), linear-gradient(90deg, rgba(26,107,60,.15) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a6b3c]/10 border border-[#1a6b3c]/20 text-[#1a6b3c] text-xs font-semibold mb-8 animate-fade-in-up">
          <RiShieldKeyholeLine className="text-sm" />
          <span>Zero-Knowledge Encryption</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight tracking-tight animate-fade-in-up delay-100">
          <span className="text-[#1a1a2e]">Secure Your</span>
          <br />
          <span className="bg-gradient-to-r from-[#1a6b3c] via-[#22a050] to-[#1a6b3c] bg-clip-text text-transparent animate-gradient">
            Digital Life
          </span>
          <br />
          <span className="text-[#1a1a2e]">with Lockora</span>
        </h1>

        {/* Subheading */}
        <p className="mt-4 sm:mt-6 text-base sm:text-xl text-[#6b7c6b] max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200 px-2 sm:px-0">
          Military-grade AES-256 encryption with zero-knowledge architecture.
          Your passwords are encrypted on your device — only you hold the key.
          Not even we can see your data.
        </p>

        {/* CTAs */}
        <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 animate-fade-in-up delay-300 px-2 sm:px-0">
          <Link
            to="/signin"
            className="group inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 text-base font-semibold text-white rounded-2xl bg-[#1a6b3c] hover:bg-[#145a31] transition-all duration-500 hover:shadow-2xl hover:shadow-[#1a6b3c]/20 hover:scale-105 hover:-translate-y-0.5"
          >
            <span>Get Started</span>
            <HiArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
          </Link>

          <a
            href="#features"
            className="group inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-3 sm:px-8 sm:py-4 text-base font-semibold text-[#5a6a5a] rounded-2xl border border-[#d4dcc8] bg-white hover:border-[#1a6b3c]/30 hover:text-[#1a1a2e] transition-all duration-300 hover:-translate-y-0.5"
          >
            How it Works
            <HiChevronDown className="group-hover:translate-y-1 transition-transform duration-300" />
          </a>
        </div>

        {/* Trust Bar */}
        <div className="mt-12 sm:mt-16 flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-[#8a9a72] text-xs sm:text-sm animate-fade-in-up delay-400">
          {[
            { icon: RiShieldCheckLine, text: "AES-256 Encryption" },
            { icon: RiEyeOffLine, text: "Zero-Knowledge" },
            { icon: RiKey2Line, text: "Open Source" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2">
              <Icon className="text-[#1a6b3c]/50" />
              <span>{text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────── DASHBOARD PREVIEW ─────────── */
function DashboardPreview() {
  return (
    <section className="relative py-16 lg:py-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-4xl lg:text-[42px] font-bold text-[#1a1a2e] leading-tight">
            All-in-One Vault to Organize,{" "}
            <span className="bg-gradient-to-r from-[#1a6b3c] to-[#22a050] bg-clip-text text-transparent">
              Protect, and Access
            </span>
          </h2>
          <p className="mt-4 text-[#6b7c6b] text-lg leading-relaxed">
            Lockora brings military-grade security and effortless usability
            together, so you can focus on what matters most.
          </p>
        </div>

        {/* Mock dashboard card */}
        <div className="rounded-2xl bg-white border border-[#e2e8e0] p-1.5 shadow-2xl shadow-black/5">
          <div className="rounded-xl bg-[#f6f8f3] border border-[#e2e8e0] p-4 sm:p-6">
            {/* Mock toolbar */}
            <div className="flex items-center justify-between pb-4 border-b border-[#e2e8e0] mb-5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-[#1a6b3c] flex items-center justify-center">
                  <RiShieldKeyholeLine className="text-white text-sm" />
                </div>
                <span className="text-[13px] text-[#1a1a2e] font-semibold">
                  Lockora
                </span>
                <div className="hidden sm:flex items-center gap-1 ml-4">
                  {["Overview", "Vault", "Generator", "Settings"].map(
                    (tab, i) => (
                      <span
                        key={tab}
                        className={`text-[11px] px-3 py-1.5 rounded-full font-medium ${i === 0 ? "bg-[#1a6b3c] text-white" : "text-[#8a9a72]"}`}
                      >
                        {tab}
                      </span>
                    ),
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-[#1a6b3c]" />
              </div>
            </div>
            {/* Mock content rows */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Stat card 1 */}
              <div className="bg-[#1a6b3c] rounded-xl p-4 text-white">
                <div className="text-[10px] text-white/60 uppercase tracking-wider mb-2">
                  Total Items
                </div>
                <div className="text-2xl font-bold">24</div>
                <div className="flex gap-1 mt-3">
                  {[60, 25, 10, 5].map((w, i) => (
                    <div
                      key={i}
                      className="h-1.5 rounded-full"
                      style={{
                        width: `${w}%`,
                        background:
                          i === 0
                            ? "rgba(255,255,255,0.6)"
                            : i === 1
                              ? "rgba(255,255,255,0.4)"
                              : i === 2
                                ? "rgba(255,255,255,0.3)"
                                : "rgba(255,255,255,0.2)",
                      }}
                    />
                  ))}
                </div>
              </div>
              {/* Stat card 2 */}
              <div className="bg-white rounded-xl border border-[#e2e8e0] p-4">
                <div className="text-[10px] text-[#8a9a72] uppercase tracking-wider mb-2">
                  Passwords
                </div>
                <div className="flex items-end gap-3">
                  <span className="text-2xl font-bold text-[#1a1a2e]">15</span>
                  <span className="text-[10px] text-emerald-500 mb-1 font-medium">
                    ↑ Secure
                  </span>
                </div>
                <div className="flex items-center gap-2 mt-3">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div
                      key={i}
                      className="w-2 rounded-sm"
                      style={{
                        background: i <= 4 ? "#1a6b3c" : "#e2e8e0",
                        height: `${10 + i * 4}px`,
                      }}
                    />
                  ))}
                </div>
              </div>
              {/* Stat card 3 */}
              <div className="bg-white rounded-xl border border-[#e2e8e0] p-4">
                <div className="text-[10px] text-[#8a9a72] uppercase tracking-wider mb-2">
                  Security Score
                </div>
                <div className="text-2xl font-bold text-[#1a1a2e]">
                  92<span className="text-[14px] text-[#8a9a72]">%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-[#e6ebe0] mt-3">
                  <div
                    className="h-full rounded-full bg-[#1a6b3c]"
                    style={{ width: "92%" }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────── FEATURES ─────────── */
const features = [
  {
    icon: RiShieldCheckLine,
    title: "End-to-End Encryption",
    desc: "Your data is encrypted with AES-256 before it ever leaves your device. Zero-knowledge architecture ensures nobody — not even Lockora — can read your passwords.",
  },
  {
    icon: RiDeviceLine,
    title: "Cross-Device Access",
    desc: "Seamlessly sync your vault across all your devices. Access your passwords from desktop, tablet, or phone — encrypted in transit, always.",
  },
  {
    icon: RiLockPasswordLine,
    title: "Password Generator",
    desc: "Generate strong, unique passwords with customizable length, symbols, and patterns. Never reuse a weak password again.",
  },
  {
    icon: RiSafeLine,
    title: "Secure Vault Storage",
    desc: "Store passwords, secure notes, credit cards, and sensitive documents in your personal encrypted vault with biometric unlock support.",
  },
];

function Features() {
  return (
    <section id="features" className="relative py-20 lg:py-28">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-[#1a6b3c]/15 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="inline-block px-3 py-1 rounded-full bg-[#1a6b3c]/10 border border-[#1a6b3c]/20 text-[#1a6b3c] text-xs font-semibold mb-4 uppercase tracking-[0.12em]">
            Features
          </span>
          <h2 className="text-2xl sm:text-4xl lg:text-[42px] font-bold text-[#1a1a2e] leading-tight">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-[#1a6b3c] to-[#22a050] bg-clip-text text-transparent">
              Stay Safe
            </span>
          </h2>
          <p className="mt-4 text-[#6b7c6b] text-lg">
            Powerful security tools wrapped in an intuitive interface you'll
            actually enjoy using.
          </p>
        </div>

        {/* Cards Grid — 2x2 like the reference image */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {features.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="group relative rounded-2xl bg-white border border-[#e2e8e0] p-5 sm:p-7 hover:border-[#c5cdb8] transition-all duration-500 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#1a6b3c]/5"
            >
              <div className="relative z-10">
                <div className="w-11 h-11 rounded-xl bg-[#1a6b3c]/10 border border-[#1a6b3c]/20 flex items-center justify-center mb-5 group-hover:bg-[#1a6b3c]/15 group-hover:border-[#1a6b3c]/30 transition-all duration-300">
                  <Icon className="text-[#1a6b3c] text-xl" />
                </div>
                <h3 className="text-[15px] font-semibold text-[#1a1a2e] mb-2.5">
                  {title}
                </h3>
                <p className="text-[13px] text-[#6b7c6b] leading-relaxed">
                  {desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─────────── SECURITY ─────────── */
const securityPoints = [
  {
    icon: RiKey2Line,
    title: "Master Password",
    desc: "Your master password is the only key to your vault. It's never stored or transmitted — we use PBKDF2 with 600,000 iterations for key derivation.",
  },
  {
    icon: RiShieldCheckLine,
    title: "Client-Side Encryption",
    desc: "All encryption and decryption happens locally on your device. Your plaintext data never touches our servers.",
  },
  {
    icon: RiEyeOffLine,
    title: "Zero-Knowledge Architecture",
    desc: "We have zero access to your vault. Even in the event of a breach, your encrypted data remains indecipherable without your master password.",
  },
];

function Security() {
  return (
    <section id="security" className="relative py-20 lg:py-28">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-[#1a6b3c]/15 to-transparent" />

      {/* Ambient glow */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#1a6b3c]/[0.02] rounded-full blur-[150px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — Illustration Card */}
          <div className="relative flex items-center justify-center">
            <div className="relative w-full max-w-md aspect-square sm:aspect-square rounded-2xl bg-white border border-[#e2e8e0] overflow-hidden flex items-center justify-center shadow-lg shadow-[#1a6b3c]/5">
              {/* Decorative circles */}
              <div className="absolute w-64 h-64 rounded-full border border-[#1a6b3c]/[0.08] animate-[spin_30s_linear_infinite]" />
              <div className="absolute w-48 h-48 rounded-full border border-[#22a050]/[0.1] animate-[spin_20s_linear_infinite_reverse]" />
              <div className="absolute w-32 h-32 rounded-full border border-[#1a6b3c]/[0.12] animate-[spin_15s_linear_infinite]" />
              {/* Central icon */}
              <div className="relative w-24 h-24 rounded-2xl bg-[#1a6b3c] flex items-center justify-center shadow-2xl shadow-[#1a6b3c]/30 animate-float">
                <RiShieldKeyholeLine className="text-white text-4xl" />
              </div>
            </div>
          </div>

          {/* Right — Content */}
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-[#1a6b3c]/10 border border-[#1a6b3c]/20 text-[#1a6b3c] text-xs font-semibold mb-4 uppercase tracking-[0.12em]">
              Security
            </span>
            <h2 className="text-2xl sm:text-4xl lg:text-[42px] font-bold text-[#1a1a2e] mb-4 sm:mb-6 leading-tight">
              Your Data,{" "}
              <span className="bg-gradient-to-r from-[#1a6b3c] to-[#22a050] bg-clip-text text-transparent">
                Your Rules
              </span>
            </h2>
            <p className="text-[#6b7c6b] text-base sm:text-lg mb-8 sm:mb-10 leading-relaxed">
              At Lockora, security isn't a feature — it's the foundation. Every
              layer of our stack is designed so that trust is built into the
              math, not promises.
            </p>

            <div className="space-y-4">
              {securityPoints.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="group flex gap-4 p-4 rounded-2xl hover:bg-white transition-all duration-300"
                >
                  <div className="shrink-0 w-11 h-11 rounded-xl bg-[#1a6b3c]/10 border border-[#1a6b3c]/20 flex items-center justify-center text-[#1a6b3c] group-hover:bg-[#1a6b3c]/15 group-hover:border-[#1a6b3c]/30 transition-all duration-300">
                    <Icon className="text-lg" />
                  </div>
                  <div>
                    <h4 className="text-[14px] font-semibold text-[#1a1a2e] mb-1">
                      {title}
                    </h4>
                    <p className="text-[13px] text-[#6b7c6b] leading-relaxed">
                      {desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────── CTA ─────────── */
function CallToAction() {
  return (
    <section className="relative py-20 lg:py-28">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-2xl overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-white" />
          <div className="absolute top-0 right-0 w-72 h-72 bg-[#1a6b3c]/[0.04] rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#22a050]/[0.03] rounded-full blur-[100px]" />

          {/* Border */}
          <div className="absolute inset-0 rounded-2xl border border-[#e2e8e0]" />

          <div className="relative z-10 py-16 px-6 sm:px-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#1a6b3c]/10 border border-[#1a6b3c]/20 text-[#1a6b3c] text-xs font-semibold mb-6">
              <RiShieldCheckLine />
              <span>Free to Get Started</span>
            </div>

            <h2 className="text-2xl sm:text-4xl lg:text-[42px] font-bold text-[#1a1a2e] mb-4 leading-tight">
              Ready to Take Control?
            </h2>
            <p className="text-[#6b7c6b] text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Join thousands of users who trust Lockora with their digital
              security. Set up your encrypted vault in under a minute.
            </p>

            <Link
              to="/signin"
              className="group inline-flex items-center gap-2 px-10 py-4 text-base font-semibold text-white rounded-2xl bg-[#1a6b3c] hover:bg-[#145a31] transition-all duration-500 hover:shadow-2xl hover:shadow-[#1a6b3c]/20 hover:scale-105"
            >
              <span>Start Using Lockora</span>
              <HiArrowRight className="group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─────────── ABOUT ─────────── */
function About() {
  return (
    <section id="about" className="relative py-20 lg:py-28">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-[#1a6b3c]/15 to-transparent" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="inline-block px-3 py-1 rounded-full bg-[#1a6b3c]/10 border border-[#1a6b3c]/20 text-[#1a6b3c] text-xs font-semibold mb-4 uppercase tracking-[0.12em]">
          About Lockora
        </span>
        <h2 className="text-2xl sm:text-4xl lg:text-[42px] font-bold text-[#1a1a2e] mb-4 sm:mb-6 leading-tight">
          Built by Security{" "}
          <span className="bg-gradient-to-r from-[#1a6b3c] to-[#22a050] bg-clip-text text-transparent">
            Enthusiasts
          </span>
        </h2>
        <p className="text-[#6b7c6b] text-lg leading-relaxed max-w-2xl mx-auto">
          Lockora was born from a simple belief: everyone deserves effortless,
          uncompromising security. We're a team of cryptography engineers and UX
          designers building a password manager that treats your privacy as
          non-negotiable. No ads, no trackers, no compromise.
        </p>
      </div>
    </section>
  );
}

/* ─────────── LANDING PAGE ─────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#eef1e8]">
      <Navbar />
      <Hero />
      <DashboardPreview />
      <Features />
      <Security />
      <About />
      <CallToAction />
      <Footer />
    </div>
  );
}

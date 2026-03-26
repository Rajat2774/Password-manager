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
        {/* Gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-accent/8 rounded-full blur-[100px] animate-pulse-glow delay-500" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[150px]" />
        {/* Grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-8 animate-fade-in-up">
          <RiShieldKeyholeLine className="text-sm" />
          <span>Zero-Knowledge Encryption</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-5xl lg:text-7xl font-extrabold leading-tight tracking-tight animate-fade-in-up delay-100">
          <span className="text-white">Secure Your</span>
          <br />
          <span className="bg-gradient-to-r from-primary via-primary-light to-accent bg-clip-text text-transparent animate-gradient">
            Digital Life
          </span>
          <br />
          <span className="text-white">with Lockora</span>
        </h1>

        {/* Subheading */}
        <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed animate-fade-in-up delay-200">
          Military-grade AES-256 encryption with zero-knowledge architecture.
          Your passwords are encrypted on your device — only you hold the key.
          Not even we can see your data.
        </p>

        {/* CTAs */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
          <Link
            to="/signin"
            className="group relative inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-white rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary/30 hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-dark" />
            <div className="absolute inset-0 bg-gradient-to-r from-primary-light to-accent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="relative z-10">Get Started</span>
            <HiArrowRight className="relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
          </Link>

          <a
            href="#features"
            className="group inline-flex items-center gap-2 px-8 py-4 text-base font-semibold text-slate-300 rounded-2xl border border-glass-border bg-glass hover:border-primary/30 hover:text-white transition-all duration-300"
          >
            Learn More
            <HiChevronDown className="group-hover:translate-y-1 transition-transform duration-300" />
          </a>
        </div>

        {/* Trust Bar */}
        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-slate-600 text-sm animate-fade-in-up delay-400">
          {[
            { icon: RiShieldCheckLine, text: "AES-256 Encryption" },
            { icon: RiEyeOffLine, text: "Zero-Knowledge" },
            { icon: RiKey2Line, text: "Open Source" },
          ].map(({ icon: Icon, text }) => (
            <div key={text} className="flex items-center gap-2">
              <Icon className="text-primary/60" />
              <span>{text}</span>
            </div>
          ))}
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
    color: "from-primary to-primary-light",
  },
  {
    icon: RiDeviceLine,
    title: "Cross-Device Access",
    desc: "Seamlessly sync your vault across all your devices. Access your passwords from desktop, tablet, or phone — encrypted in transit, always.",
    color: "from-accent to-accent-dark",
  },
  {
    icon: RiLockPasswordLine,
    title: "Password Generator",
    desc: "Generate strong, unique passwords with customizable length, symbols, and patterns. Never reuse a weak password again.",
    color: "from-violet-500 to-primary",
  },
  {
    icon: RiSafeLine,
    title: "Secure Vault Storage",
    desc: "Store passwords, secure notes, credit cards, and sensitive documents in your personal encrypted vault with biometric unlock support.",
    color: "from-primary-light to-accent",
  },
];

function Features() {
  return (
    <section id="features" className="relative py-24 lg:py-32">
      {/* Subtle divider glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-4 uppercase tracking-wider">
            Features
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white">
            Everything You Need to{" "}
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Stay Safe
            </span>
          </h2>
          <p className="mt-4 text-slate-400 text-lg">
            Powerful security tools wrapped in an intuitive interface you'll
            actually enjoy using.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map(({ icon: Icon, title, desc, color }, i) => (
            <div
              key={title}
              className="group relative rounded-2xl bg-dark-800/50 border border-glass-border p-7 hover:border-primary/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/10"
            >
              {/* Glow on hover */}
              <div
                className={`absolute -inset-px rounded-2xl bg-gradient-to-b ${color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}
              />

              <div className="relative z-10">
                <div
                  className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-5 shadow-lg group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className="text-white text-xl" />
                </div>
                <h3 className="text-lg font-semibold text-white mb-3">
                  {title}
                </h3>
                <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
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
    <section id="security" className="relative py-24 lg:py-32">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />

      {/* Ambient glow */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-accent/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left — Illustration Card */}
          <div className="relative flex items-center justify-center">
            <div className="relative w-full max-w-md aspect-square rounded-3xl bg-dark-800/50 border border-glass-border overflow-hidden flex items-center justify-center">
              {/* Decorative circles */}
              <div className="absolute w-64 h-64 rounded-full border border-primary/10 animate-[spin_30s_linear_infinite]" />
              <div className="absolute w-48 h-48 rounded-full border border-accent/10 animate-[spin_20s_linear_infinite_reverse]" />
              <div className="absolute w-32 h-32 rounded-full border border-primary/20 animate-[spin_15s_linear_infinite]" />
              {/* Central icon */}
              <div className="relative w-24 h-24 rounded-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-2xl shadow-primary/30 animate-float">
                <RiShieldKeyholeLine className="text-white text-4xl" />
              </div>
            </div>
          </div>

          {/* Right — Content */}
          <div>
            <span className="inline-block px-3 py-1 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold mb-4 uppercase tracking-wider">
              Security
            </span>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Your Data,{" "}
              <span className="bg-gradient-to-r from-accent to-primary-light bg-clip-text text-transparent">
                Your Rules
              </span>
            </h2>
            <p className="text-slate-400 text-lg mb-10 leading-relaxed">
              At Lockora, security isn't a feature — it's the foundation.
              Every layer of our stack is designed so that trust is built into
              the math, not promises.
            </p>

            <div className="space-y-6">
              {securityPoints.map(({ icon: Icon, title, desc }) => (
                <div
                  key={title}
                  className="group flex gap-4 p-4 rounded-2xl hover:bg-dark-700/30 transition-all duration-300"
                >
                  <div className="shrink-0 w-11 h-11 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent group-hover:bg-accent/20 transition-colors duration-300">
                    <Icon className="text-lg" />
                  </div>
                  <div>
                    <h4 className="text-base font-semibold text-white mb-1">
                      {title}
                    </h4>
                    <p className="text-sm text-slate-400 leading-relaxed">
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
    <section className="relative py-24 lg:py-32">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-dark-700 to-accent/10" />
          <div className="absolute inset-0 bg-dark-800/60 backdrop-blur-sm" />
          <div className="absolute top-0 right-0 w-72 h-72 bg-primary/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-0 left-0 w-60 h-60 bg-accent/10 rounded-full blur-[80px]" />

          {/* Border */}
          <div className="absolute inset-0 rounded-3xl border border-glass-border" />

          <div className="relative z-10 py-16 px-6 sm:px-12 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-6">
              <RiShieldCheckLine />
              <span>Free to Get Started</span>
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Ready to Take Control?
            </h2>
            <p className="text-slate-400 text-lg max-w-xl mx-auto mb-10 leading-relaxed">
              Join thousands of users who trust Lockora with their digital
              security. Set up your encrypted vault in under a minute.
            </p>

            <Link
              to="/signin"
              className="group relative inline-flex items-center gap-2 px-10 py-4 text-base font-semibold text-white rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-primary/30 hover:scale-105"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-primary to-accent" />
              <div className="absolute inset-0 bg-gradient-to-r from-accent to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
              <span className="relative z-10">Start Using Lockora</span>
              <HiArrowRight className="relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
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
    <section id="about" className="relative py-24 lg:py-32">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <span className="inline-block px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-4 uppercase tracking-wider">
          About Lockora
        </span>
        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
          Built by Security{" "}
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Enthusiasts
          </span>
        </h2>
        <p className="text-slate-400 text-lg leading-relaxed max-w-2xl mx-auto">
          Lockora was born from a simple belief: everyone deserves effortless,
          uncompromising security. We're a team of cryptography engineers and
          UX designers building a password manager that treats your privacy as
          non-negotiable. No ads, no trackers, no compromise.
        </p>
      </div>
    </section>
  );
}

/* ─────────── LANDING PAGE ─────────── */
export default function LandingPage() {
  return (
    <div className="min-h-screen bg-dark-900">
      <Navbar />
      <Hero />
      <Features />
      <Security />
      <About />
      <CallToAction />
      <Footer />
    </div>
  );
}

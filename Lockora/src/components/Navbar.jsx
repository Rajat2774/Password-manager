import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { HiMenu, HiX } from "react-icons/hi";
import { RiShieldKeyholeLine } from "react-icons/ri";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Home", href: "#home" },
    { label: "Features", href: "#features" },
    { label: "Security", href: "#security" },
    { label: "About", href: "#about" },
  ];

  return (
    <nav
      className={`fixed top-2 left-0 right-0 z-50 transition-all duration-500 rounded-2xl ${
        scrolled
          ? "bg-white/85 backdrop-blur-xl border-b border-[#e2e8e0] shadow-lg shadow-[#1a6b3c]/5"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12 lg:h-14">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-[#1a6b3c] flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-[#1a6b3c]/20">
                <RiShieldKeyholeLine className="text-white text-lg" />
              </div>
            </div>
            <span className="text-xl font-bold text-[#1a1a2e] tracking-wide">
              Lockora
            </span>
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="relative px-4 py-2 text-[13px] font-medium text-[#6b7c6b] hover:text-[#1a1a2e] transition-colors duration-300 group"
              >
                {link.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-[#1a6b3c] group-hover:w-3/4 transition-all duration-300 rounded-full" />
              </a>
            ))}
          </div>

          {/* Sign In Button */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/signin"
              className="inline-flex items-center gap-2 px-4 py-1.5 text-[13px] font-semibold text-white rounded-xl bg-[#1a6b3c] hover:bg-[#145a31] transition-all duration-300 hover:shadow-lg hover:shadow-[#1a6b3c]/20 hover:-translate-y-0.5"
            >
              Sign In
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-[#6b7c6b] hover:text-[#1a1a2e] p-2 transition-colors bg-transparent border-none cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <HiX size={24} /> : <HiMenu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden transition-all duration-500 overflow-hidden ${
          mobileOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-white/95 backdrop-blur-xl border-t border-[#e2e8e0] px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 text-[13px] font-medium text-[#6b7c6b] hover:text-[#1a1a2e] hover:bg-[#f2f5ed] rounded-xl transition-all duration-300"
            >
              {link.label}
            </a>
          ))}
          <Link
            to="/signin"
            onClick={() => setMobileOpen(false)}
            className="block mt-3 text-center px-4 py-3 text-[13px] font-semibold text-white bg-[#1a6b3c] rounded-xl hover:bg-[#145a31] transition-all duration-300"
          >
            Sign In
          </Link>
        </div>
      </div>
    </nav>
  );
}

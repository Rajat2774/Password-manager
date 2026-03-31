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
          ? "bg-[#0b0b0f]/85 backdrop-blur-xl border-b border-[#1e1e25] shadow-2xl shadow-purple-600/50"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12 lg:h-14">
          {/* Logo */}
          <a href="#home" className="flex items-center gap-2.5 group">
            <div className="relative">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center transform group-hover:scale-110 transition-transform duration-300 shadow-lg shadow-purple-500/20">
                <RiShieldKeyholeLine className="text-white text-lg" />
              </div>
            </div>
            <span className="text-xl font-semibold text-white tracking-wide">
              Lockora
            </span>
          </a>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="relative px-4 py-2 text-[13px] font-medium text-[#6b6b7b] hover:text-white transition-colors duration-300 group"
              >
                {link.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-[2px] bg-purple-500 group-hover:w-3/4 transition-all duration-300 rounded-full" />
              </a>
            ))}
          </div>

          {/* Sign In Button */}
          <div className="hidden md:flex items-center gap-3">
            <Link
              to="/signin"
              className="inline-flex items-center gap-2 px-4 py-1.5 text-[13px] font-semibold text-white rounded-xl bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 transition-all duration-300 hover:shadow-lg hover:shadow-purple-500/25 hover:-translate-y-0.5"
            >
              Sign In
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden text-[#6b6b7b] hover:text-white p-2 transition-colors bg-transparent border-none cursor-pointer"
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
        <div className="bg-[#111116]/95 backdrop-blur-xl border-t border-[#1e1e25] px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className="block px-4 py-3 text-[13px] font-medium text-[#6b6b7b] hover:text-white hover:bg-[#1a1a20] rounded-xl transition-all duration-300"
            >
              {link.label}
            </a>
          ))}
          <Link
            to="/signin"
            onClick={() => setMobileOpen(false)}
            className="block mt-3 text-center px-4 py-3 text-[13px] font-semibold text-white bg-gradient-to-r from-purple-600 to-violet-600 rounded-xl hover:from-purple-500 hover:to-violet-500 transition-all duration-300"
          >
            Sign In
          </Link>
        </div>
      </div>
    </nav>
  );
}

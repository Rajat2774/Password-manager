import { Link } from "react-router-dom";
import logoImg from "../assets/logo.png";
import { FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="relative bg-white border-t border-[#e2e8e0]">
      {/* Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#1a6b3c]/20 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <img src={logoImg} alt="Logo" className="h-10 w-auto object-contain" />
            </div>
            <p className="text-[#8a9a72] text-sm leading-relaxed max-w-sm">
              Your digital vault for the modern world. We use zero-knowledge
              encryption to ensure only you can access your passwords.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3 mt-6">
              {[
                { icon: FaTwitter, href: "https://x.com/RAJAT_073" },
                { icon: FaGithub, href: "https://github.com/Rajat2774" },
                { icon: FaLinkedin, href: "https://www.linkedin.com/in/rajat-singh-6558aa294/" },
              ].map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-10 h-10 rounded-xl bg-[#f6f8f3] border border-[#e2e8e0] flex items-center justify-center text-[#8a9a72] hover:text-[#1a6b3c] hover:border-[#1a6b3c]/30 hover:bg-[#1a6b3c]/5 transition-all duration-300"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links Column 1 */}
          <div>
            <h4 className="text-[11px] font-semibold text-[#1a1a2e] mb-4 uppercase tracking-[0.14em]">
              Product
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Features", to: "/#features" },
                { label: "Security", to: "/#security" },
                { label: "About", to: "/#about" },
              ].map(({ label, to }) => (
                <li key={label}>
                  <Link
                    to={to}
                    className="text-sm text-[#8a9a72] hover:text-[#1a6b3c] transition-colors duration-300"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h4 className="text-[11px] font-semibold text-[#1a1a2e] mb-4 uppercase tracking-[0.14em]">
              Support
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Contact", href: "mailto:rajatsingh2774@gmail.com" },
                { label: "GitHub Issues", href: "https://github.com/Rajat2774/Password-manager/issues" },
              ].map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-sm text-[#8a9a72] hover:text-[#1a6b3c] transition-colors duration-300"
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[#e2e8e0] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#8a9a72]">
            © {new Date().getFullYear()} Lockyt. All rights reserved.
          </p>
          <p className="text-sm text-[#8a9a72]">
            Built with 🔒 for your security.
          </p>
        </div>
      </div>
    </footer>
  );
}

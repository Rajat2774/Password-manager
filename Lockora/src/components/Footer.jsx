import { RiShieldKeyholeLine } from "react-icons/ri";
import { FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="relative bg-[#0b0b0f] border-t border-[#1e1e25]">
      {/* Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <RiShieldKeyholeLine className="text-white text-lg" />
              </div>
              <span className="text-xl font-semibold text-white">Lockora</span>
            </div>
            <p className="text-[#4a4a55] text-sm leading-relaxed max-w-sm">
              Your digital vault for the modern world. We use zero-knowledge
              encryption to ensure only you can access your passwords.
            </p>
            {/* Social Icons */}
            <div className="flex items-center gap-3 mt-6">
              {[
                { icon: FaTwitter, href: "#" },
                { icon: FaGithub, href: "#" },
                { icon: FaLinkedin, href: "#" },
              ].map(({ icon: Icon, href }, i) => (
                <a
                  key={i}
                  href={href}
                  className="w-10 h-10 rounded-xl bg-[#141418] border border-[#232329] flex items-center justify-center text-[#4a4a55] hover:text-purple-400 hover:border-purple-500/30 hover:bg-purple-500/5 transition-all duration-300"
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
            <h4 className="text-[11px] font-semibold text-white mb-4 uppercase tracking-[0.14em]">
              Product
            </h4>
            <ul className="space-y-3">
              {["Features", "Security", "Pricing", "Changelog"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm text-[#4a4a55] hover:text-purple-400 transition-colors duration-300"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h4 className="text-[11px] font-semibold text-white mb-4 uppercase tracking-[0.14em]">
              Legal
            </h4>
            <ul className="space-y-3">
              {["Privacy Policy", "Terms of Service", "Contact", "Support"].map(
                (item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-[#4a4a55] hover:text-purple-400 transition-colors duration-300"
                    >
                      {item}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-[#1e1e25] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-[#3a3a45]">
            © 2026 Lockora. All rights reserved.
          </p>
          <p className="text-sm text-[#3a3a45]">
            Built with 🔒 for your security.
          </p>
        </div>
      </div>
    </footer>
  );
}

import { RiShieldKeyholeLine } from "react-icons/ri";
import { FaGithub, FaTwitter, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="relative bg-dark-900 border-t border-glass-border">
      {/* Gradient Line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <RiShieldKeyholeLine className="text-white text-lg" />
              </div>
              <span className="text-xl font-bold text-white">Lockora</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed max-w-sm">
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
                  className="w-10 h-10 rounded-xl bg-dark-700/50 border border-glass-border flex items-center justify-center text-slate-500 hover:text-primary hover:border-primary/30 hover:bg-primary/5 transition-all duration-300"
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
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              Product
            </h4>
            <ul className="space-y-3">
              {["Features", "Security", "Pricing", "Changelog"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm text-slate-500 hover:text-primary transition-colors duration-300"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Links Column 2 */}
          <div>
            <h4 className="text-sm font-semibold text-white mb-4 uppercase tracking-wider">
              Legal
            </h4>
            <ul className="space-y-3">
              {["Privacy Policy", "Terms of Service", "Contact", "Support"].map(
                (item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-slate-500 hover:text-primary transition-colors duration-300"
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
        <div className="mt-12 pt-8 border-t border-glass-border flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-slate-600">
            © 2026 Lockora. All rights reserved.
          </p>
          <p className="text-sm text-slate-600">
            Built with 🔒 for your security.
          </p>
        </div>
      </div>
    </footer>
  );
}

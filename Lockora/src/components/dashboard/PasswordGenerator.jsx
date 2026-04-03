import { useState, useEffect, useCallback } from "react";
import { generatePassword, getStrength } from "../../utils/passwordGenerator";
import { inputCls } from "../../utils/vault";
import { CopyIcon, RefreshIcon, SaveIcon } from "./Icons";

export default function PasswordGenerator({ onUsePassword }) {
  const [opts, setOpts] = useState({
    length: 16,
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    noAmbiguous: false,
    pattern: "",
  });
  const [usePattern, setUsePattern] = useState(false);
  const [password, setPassword] = useState("");
  const [history, setHistory] = useState([]);
  const [copied, setCopied] = useState(false);

  const generate = useCallback(() => {
    const pw = generatePassword({
      ...opts,
      pattern: usePattern ? opts.pattern : "",
    });
    setPassword(pw);
    setHistory((h) => [pw, ...h].slice(0, 10));
  }, [opts, usePattern]);

  useEffect(() => {
    generate();
  }, []);

  const copy = async (pw) => {
    await navigator.clipboard.writeText(pw);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const strength = getStrength(password);
  const toggle = (key) => setOpts((o) => ({ ...o, [key]: !o[key] }));

  const Toggle = ({ label, k, desc }) => (
    <div className="flex items-center justify-between py-3 border-b border-[#e2e8e0] last:border-b-0">
      <div>
        <div className="text-[13px] text-[#1a1a2e] font-medium">{label}</div>
        {desc && (
          <div className="text-[10px] text-[#8a9a72] mt-0.5">{desc}</div>
        )}
      </div>
      <button
        type="button"
        onClick={() => toggle(k)}
        className={`relative w-10 h-5 rounded-full border-none transition-all duration-200 cursor-pointer flex-shrink-0 ${opts[k] ? "bg-[#1a6b3c]" : "bg-[#d4dcc8]"}`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-200 shadow-sm ${opts[k] ? "left-[calc(100%-18px)]" : "left-0.5"}`}
        />
      </button>
    </div>
  );

  return (
    <div className="w-full max-w-[700px] px-1 sm:px-0">
      <h2 className="text-[22px] md:text-[28px] font-bold text-[#1a1a2e] mb-1">
        Password Generator
      </h2>
      <p className="text-[13px] text-[#6b7c6b] mb-6 leading-relaxed">
        Generate strong, unique passwords with customizable length, character
        sets, and patterns.
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-[1fr_280px]">
        {/* ── Left: output + controls ── */}
        <div className="flex flex-col gap-4">
          {/* Generated password display */}
          <div className="bg-white border border-[#e2e8e0] rounded-2xl p-4 md:p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <div
                className="flex-1 font-mono text-[13px] md:text-[15px] text-[#1a1a2e] bg-[#f6f8f3] border border-[#e2e8e0] rounded-xl px-3 md:px-4 py-3 min-h-[48px] md:min-h-[52px] break-all leading-relaxed select-all"
                style={{ wordBreak: "break-all" }}
              >
                {password || (
                  <span className="text-[#a0a8b0]">Click generate…</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => copy(password)}
                  title="Copy"
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-200 cursor-pointer ${copied ? "bg-emerald-50 border-emerald-300/50 text-emerald-500" : "bg-[#f6f8f3] border-[#e2e8e0] text-[#6b7c6b] hover:border-[#1a6b3c]/30 hover:text-[#1a6b3c]"}`}
                >
                  {copied ? (
                    <span className="text-[13px]">✓</span>
                  ) : (
                    <CopyIcon />
                  )}
                </button>
                <button
                  onClick={generate}
                  title="Regenerate"
                  className="w-10 h-10 rounded-xl bg-[#f6f8f3] border border-[#e2e8e0] text-[#6b7c6b] hover:border-[#1a6b3c]/30 hover:text-[#1a6b3c] flex items-center justify-center transition-all duration-200 cursor-pointer"
                >
                  <RefreshIcon />
                </button>
              </div>
            </div>

            {/* Strength bar */}
            {password && (
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-[#8a9a72] uppercase tracking-[0.08em]">
                    Strength
                  </span>
                  <span
                    className="text-[11px] font-semibold"
                    style={{ color: strength.color }}
                  >
                    {strength.label}
                  </span>
                </div>
                <div className="h-2 bg-[#e6ebe0] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${strength.pct}%`,
                      background: strength.color,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Length slider */}
          <div className="bg-white border border-[#e2e8e0] rounded-2xl p-4 md:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[13px] text-[#1a1a2e] font-medium">Length</span>
              <span className="text-[13px] font-mono text-[#1a6b3c] bg-[#1a6b3c]/8 border border-[#1a6b3c]/20 px-3 py-0.5 rounded-lg font-semibold">
                {opts.length}
              </span>
            </div>
            <input
              type="range"
              min="6"
              max="128"
              step="1"
              value={opts.length}
              onChange={(e) =>
                setOpts((o) => ({ ...o, length: +e.target.value }))
              }
              className="w-full cursor-pointer"
            />
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] text-[#8a9a72]">6</span>
              <span className="text-[10px] text-[#8a9a72]">128</span>
            </div>
          </div>

          {/* Pattern mode */}
          <div className="bg-white border border-[#e2e8e0] rounded-2xl p-4 md:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-[13px] text-[#1a1a2e] font-medium">Custom pattern</div>
                <div className="text-[10px] text-[#8a9a72] mt-0.5">
                  Use X=any, A=upper, a=lower, 0=digit, S=symbol
                </div>
              </div>
              <button
                type="button"
                onClick={() => setUsePattern((p) => !p)}
                className={`relative w-10 h-5 rounded-full border-none transition-all duration-200 cursor-pointer flex-shrink-0 ${usePattern ? "bg-[#1a6b3c]" : "bg-[#d4dcc8]"}`}
              >
                <span
                  className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all duration-200 shadow-sm ${usePattern ? "left-[calc(100%-18px)]" : "left-0.5"}`}
                />
              </button>
            </div>
            {usePattern && (
              <input
                type="text"
                placeholder="e.g. AaXX-0000-XSX"
                value={opts.pattern}
                onChange={(e) =>
                  setOpts((o) => ({ ...o, pattern: e.target.value }))
                }
                className={inputCls}
              />
            )}
          </div>

          {/* Action buttons */}
          <div className="flex gap-2.5 flex-wrap">
            <button
              onClick={generate}
              className="flex items-center justify-center gap-2 py-2.5 px-5 bg-[#1a6b3c] hover:bg-[#145a31] text-white border-none rounded-xl text-[12px] font-medium tracking-wide transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#1a6b3c]/20 cursor-pointer flex-1 sm:flex-initial"
            >
              <RefreshIcon /> Generate
            </button>
            {onUsePassword && password && (
              <button
                onClick={() => onUsePassword(password)}
                className="flex items-center justify-center gap-2 py-2.5 px-5 bg-white hover:bg-[#f6f8f3] border border-[#e2e8e0] hover:border-[#1a6b3c]/30 text-[#5a6a5a] hover:text-[#1a6b3c] rounded-xl text-[12px] font-medium tracking-wide transition-all duration-200 cursor-pointer flex-1 sm:flex-initial"
              >
                <SaveIcon /> Use this password
              </button>
            )}
          </div>
        </div>

        {/* ── Right: options + history ── */}
        <div className="flex flex-col gap-4">
          {/* Character set toggles */}
          <div className="bg-white border border-[#e2e8e0] rounded-2xl p-4 md:p-5 shadow-sm">
            <div className="text-[11px] uppercase tracking-[0.1em] text-[#8a9a72] mb-3 font-medium">
              Character sets
            </div>
            <Toggle label="Uppercase" k="uppercase" desc="A – Z" />
            <Toggle label="Lowercase" k="lowercase" desc="a – z" />
            <Toggle label="Numbers" k="numbers" desc="0 – 9" />
            <Toggle label="Symbols" k="symbols" desc="! @ # $ % ^ &amp; *" />
            <Toggle
              label="Exclude ambiguous"
              k="noAmbiguous"
              desc="Removes 0, O, l, I, 1"
            />
          </div>

          {/* History */}
          {history.length > 1 && (
            <div className="bg-white border border-[#e2e8e0] rounded-2xl p-4 md:p-5 shadow-sm">
              <div className="text-[11px] uppercase tracking-[0.1em] text-[#8a9a72] mb-3 font-medium">
                Recent ({history.length})
              </div>
              <div className="flex flex-col gap-1 max-h-[200px] overflow-y-auto">
                {history.map((pw, i) => (
                  <div key={i} className="flex items-center gap-2 group">
                    <span className="flex-1 font-mono text-[11px] text-[#6b7c6b] group-hover:text-[#1a1a2e] truncate transition-colors">
                      {pw}
                    </span>
                    <button
                      onClick={() => copy(pw)}
                      className="opacity-0 group-hover:opacity-100 bg-transparent border-none text-[#8a9a72] hover:text-[#1a6b3c] flex items-center cursor-pointer transition-all p-1"
                    >
                      <CopyIcon />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

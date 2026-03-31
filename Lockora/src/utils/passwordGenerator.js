// ── Character sets ────────────────────────────────────────────────────────────
export const CHARSETS = {
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>?",
  ambiguous: "0Oo1lI",
};

export function randomChar(pool) {
  if (!pool) return "";
  return pool[
    Math.floor(
      (crypto.getRandomValues(new Uint32Array(1))[0] / 0xffffffff) *
        pool.length,
    )
  ];
}

// ── Generate a password with options ──────────────────────────────────────────
export function generatePassword(opts) {
  const { length, uppercase, lowercase, numbers, symbols, noAmbiguous, pattern } = opts;

  // Pattern mode
  if (pattern && pattern.trim()) {
    return pattern
      .replace(/[Aa]/g, () =>
        randomChar(uppercase ? CHARSETS.uppercase : CHARSETS.lowercase),
      )
      .replace(/[0-9]/, () => randomChar(CHARSETS.numbers))
      .replace(/[Ss!]/g, () => randomChar(CHARSETS.symbols))
      .replace(/[Xx]/g, () => {
        let pool = "";
        if (uppercase) pool += CHARSETS.uppercase;
        if (lowercase) pool += CHARSETS.lowercase;
        if (numbers) pool += CHARSETS.numbers;
        if (symbols) pool += CHARSETS.symbols;
        return randomChar(pool || CHARSETS.lowercase);
      });
  }

  let pool = "";
  if (uppercase) pool += CHARSETS.uppercase;
  if (lowercase) pool += CHARSETS.lowercase;
  if (numbers) pool += CHARSETS.numbers;
  if (symbols) pool += CHARSETS.symbols;
  if (!pool) pool = CHARSETS.lowercase;

  if (noAmbiguous) {
    CHARSETS.ambiguous.split("").forEach((c) => {
      pool = pool.split(c).join("");
    });
  }

  // Guarantee at least one char from each enabled group
  const required = [];
  if (uppercase)
    required.push(
      randomChar(
        noAmbiguous
          ? CHARSETS.uppercase.split("").filter((c) => !CHARSETS.ambiguous.includes(c)).join("")
          : CHARSETS.uppercase,
      ),
    );
  if (lowercase)
    required.push(
      randomChar(
        noAmbiguous
          ? CHARSETS.lowercase.split("").filter((c) => !CHARSETS.ambiguous.includes(c)).join("")
          : CHARSETS.lowercase,
      ),
    );
  if (numbers)
    required.push(
      randomChar(
        noAmbiguous
          ? CHARSETS.numbers.split("").filter((c) => !CHARSETS.ambiguous.includes(c)).join("")
          : CHARSETS.numbers,
      ),
    );
  if (symbols) required.push(randomChar(CHARSETS.symbols));

  const rest = Array.from(
    { length: Math.max(0, length - required.length) },
    () => randomChar(pool),
  );
  const combined = [...required, ...rest];
  // shuffle using crypto random
  for (let i = combined.length - 1; i > 0; i--) {
    const j = Math.floor(
      (crypto.getRandomValues(new Uint32Array(1))[0] / 0xffffffff) * (i + 1),
    );
    [combined[i], combined[j]] = [combined[j], combined[i]];
  }
  return combined.join("");
}

// ── Password strength checker ─────────────────────────────────────────────────
export function getStrength(pw) {
  if (!pw) return { score: 0, label: "", color: "" };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (pw.length >= 16) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 2) return { score, label: "Weak", color: "#f87171", pct: 20 };
  if (score <= 4) return { score, label: "Fair", color: "#fb923c", pct: 45 };
  if (score <= 5) return { score, label: "Good", color: "#facc15", pct: 65 };
  if (score <= 6) return { score, label: "Strong", color: "#4ade80", pct: 82 };
  return { score, label: "Very strong", color: "#34d399", pct: 100 };
}

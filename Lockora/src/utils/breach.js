// src/utils/breach.js
// HaveIBeenPwned k-anonymity — password never leaves the browser

async function sha1(str) {
  const buf = await crypto.subtle.digest("SHA-1", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
}

export async function checkBreached(password) {
  if (!password) return 0;
  try {
    const hash   = await sha1(password);
    const prefix = hash.slice(0, 5);
    const suffix = hash.slice(5);
    const res    = await fetch(`https://api.pwnedpasswords.com/range/${prefix}`, {
      headers: { "Add-Padding": "true" },
    });
    if (!res.ok) return 0;
    const line = (await res.text()).split("\n").find(l => l.startsWith(suffix));
    return line ? parseInt(line.split(":")[1].trim(), 10) || 0 : 0;
  } catch {
    return 0;
  }
}

export async function checkMultipleBreached(passwords, concurrency = 5) {
  const results = new Map();
  const unique  = [...new Set(passwords.filter(Boolean))];
  for (let i = 0; i < unique.length; i += concurrency) {
    await Promise.allSettled(
      unique.slice(i, i + concurrency).map(async pw => {
        results.set(pw, await checkBreached(pw));
      })
    );
  }
  return results;
}
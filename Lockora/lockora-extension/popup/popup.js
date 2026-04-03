// lockora-extension/popup/popup.js
"use strict";

// ── Helpers ───────────────────────────────────────────────────────────────────
const $ = (id) => document.getElementById(id);
const msg = (data) => chrome.runtime.sendMessage(data);

function showScreen(id) {
  document
    .querySelectorAll(".screen")
    .forEach((s) => s.classList.add("hidden"));
  $(id).classList.remove("hidden");
}

function setError(elId, text) {
  const el = $(elId);
  el.textContent = text;
  el.classList.toggle("hidden", !text);
}

function setLoading(btnId, loading, label = "Unlock vault") {
  const btn = $(btnId);
  btn.disabled = loading;
  btn.textContent = loading ? "Please wait…" : label;
}

// ── Track unlock failures for hint display ──────────────────────────────────
let unlockFailCount = 0;

// ── Eye toggle ────────────────────────────────────────────────────────────────
document.querySelectorAll(".eye-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const input = document.getElementById(btn.dataset.target);
    input.type = input.type === "password" ? "text" : "password";
  });
});

// ── Open webapp link ───────────────────────────────────────────────────────────
document.getElementById("open-webapp").addEventListener("click", async (e) => {
  e.preventDefault();
  const base = "https://lockora-vault.vercel.app";
  // Always go to /unlock — the web app needs to derive its own cryptoKey
  // (the extension's in-memory key can't be transferred to the web app)
  chrome.tabs.create({ url: base + "/unlock" });
});

// ── Create account link ──────────────────────────────────────────────────────
document.getElementById("btn-create-account").addEventListener("click", (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: "https://lockora-vault.vercel.app/signup" });
});

// ── Init ──────────────────────────────────────────────────────────────────────
async function init() {
  showScreen("screen-loading");

  try {
    const session = await msg({ type: "GET_SESSION" });

    // Not signed in at all — show full sign-in form
    if (!session.ok && !session.email) {
      showScreen("screen-signin");
      return;
    }

    // Google sign-in completed but still needs master password
    if (session.email && session.needsMasterPassword) {
      $("unlock-email").textContent = session.email;
      $("unlock-email").dataset.reason = "google";
      showScreen("screen-unlock");
      // Check if this user has a vault (i.e. has set a master password before)
      checkAndShowNewUserState();
      loadHint();
      return;
    }

    // Vault genuinely timed out due to inactivity — must re-enter master password
    if (session.email && session.timedOut) {
      $("unlock-email").textContent = `${session.email} · Session timed out`;
      $("unlock-email").dataset.reason = "timeout";
      showScreen("screen-unlock");
      loadHint();
      return;
    }

    // SW was restarted (key lost) but timeout hasn't elapsed.
    if (session.email && session.swRestart) {
      $("unlock-email").textContent = session.email;
      $("unlock-email").dataset.reason = "swrestart";
      showScreen("screen-unlock");
      loadHint();
      return;
    }

    // Fully unlocked — show vault
    if (session.ok) {
      showScreen("screen-vault");
      await loadVaultForCurrentTab();
      return;
    }

    // Fallback: signed in but key missing for unknown reason
    if (session.email) {
      $("unlock-email").textContent = session.email;
      showScreen("screen-unlock");
      loadHint();
      return;
    }

    showScreen("screen-signin");
  } catch {
    showScreen("screen-signin");
  }
}

// ── Check if new user (no vault/meta doc) for Google sign-in flow ──────────
async function checkAndShowNewUserState() {
  try {
    const res = await msg({ type: "CHECK_VAULT_EXISTS" });
    if (res && !res.exists) {
      // New user — show "create" label
      const hdr = $("unlock-email");
      if (hdr) hdr.textContent = (hdr.textContent || "") + " · First time setup";
      $("btn-unlock").textContent = "Create Vault";
    }
  } catch { /* ignore */ }
}

// ── Load and display master password hint ──────────────────────────────────
async function loadHint() {
  try {
    const res = await msg({ type: "GET_HINT" });
    if (res && res.hint) {
      $("hint-container").dataset.hint = res.hint;
    } else {
      $("hint-container").dataset.hint = "";
    }
    // Always start with hint hidden
    $("hint-container").classList.add("hidden");
  } catch {
    $("hint-container").dataset.hint = "";
    $("hint-container").classList.add("hidden");
  }
}

function showHintIfAvailable() {
  const container = $("hint-container");
  const hint = container.dataset.hint;
  if (hint) {
    $("hint-text").textContent = hint;
    container.classList.remove("hidden");
  }
}

// ── Google Sign-In ────────────────────────────────────────────────────────────
$("btn-google-signin").addEventListener("click", async () => {
  setError("google-err", "");

  const btn = $("btn-google-signin");
  const textEl = $("google-signin-text");
  btn.disabled = true;
  textEl.textContent = "Connecting…";

  try {
    const res = await msg({ type: "GOOGLE_SIGN_IN" });
    if (!res.ok) {
      setError("google-err", res.error || "Google sign-in failed.");
    } else {
      $("unlock-email").textContent = res.email;
      unlockFailCount = 0;
      showScreen("screen-unlock");
      checkAndShowNewUserState();
      loadHint();
    }
  } catch (err) {
    setError(
      "google-err",
      err.message || "Google sign-in failed. Please try again.",
    );
  } finally {
    btn.disabled = false;
    textEl.textContent = "Continue with Google";
  }
});

// ── Sign in form ──────────────────────────────────────────────────────────────
$("form-signin").addEventListener("submit", async (e) => {
  e.preventDefault();
  setError("signin-err", "");
  setLoading("btn-signin", true, "Unlocking…");

  const email = $("input-email").value.trim();
  const password = $("input-password").value;
  const masterPassword = $("input-master").value;

  try {
    const res = await msg({ type: "SIGN_IN", email, password, masterPassword });
    if (!res.ok) {
      setError("signin-err", res.error || "Sign in failed.");
    } else {
      showScreen("screen-vault");
      await loadVaultForCurrentTab();
    }
  } catch (err) {
    setError("signin-err", "Something went wrong. Check your connection.");
  } finally {
    setLoading("btn-signin", false, "Unlock vault");
  }
});

// ── Unlock form (re-derive key after SW restart, timeout, or Google sign-in) ──
$("form-unlock").addEventListener("submit", async (e) => {
  e.preventDefault();
  setError("unlock-err", "");
  setLoading("btn-unlock", true, "Unlocking…");

  const masterPassword = $("input-unlock-master").value;

  try {
    const res = await msg({ type: "UNLOCK", masterPassword });
    if (!res.ok) {
      unlockFailCount++;
      setError("unlock-err", res.error || "Incorrect master password.");
      // Show hint after 1 failed attempt
      if (unlockFailCount >= 1) {
        showHintIfAvailable();
      }
    } else {
      unlockFailCount = 0;
      showScreen("screen-vault");
      await loadVaultForCurrentTab();
    }
  } catch {
    setError("unlock-err", "Something went wrong.");
  } finally {
    setLoading("btn-unlock", false, "Unlock");
  }
});

// ── Switch account ────────────────────────────────────────────────────────────
$("btn-switch-account").addEventListener("click", async () => {
  await msg({ type: "SIGN_OUT" });
  unlockFailCount = 0;
  $("hint-container").classList.add("hidden");
  showScreen("screen-signin");
});

// ── Sign out ──────────────────────────────────────────────────────────────────
$("btn-signout").addEventListener("click", async () => {
  await msg({ type: "SIGN_OUT" });
  unlockFailCount = 0;
  showScreen("screen-signin");
});

// ── Load vault matches for current tab ───────────────────────────────────────
async function loadVaultForCurrentTab() {
  $("vault-loading").classList.remove("hidden");
  $("vault-matches").classList.add("hidden");
  $("vault-empty").classList.add("hidden");
  $("vault-noform").classList.add("hidden");
  $("site-banner").classList.add("hidden");

  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (!tab || !tab.id) {
    showNoForm();
    return;
  }

  let formInfo;
  try {
    formInfo = await chrome.tabs.sendMessage(tab.id, { type: "CHECK_FORM" });
  } catch {
    showNoForm();
    return;
  }

  if (!formInfo?.hasForm) {
    showNoForm();
    return;
  }

  const domain =
    formInfo.domain || new URL(tab.url).hostname.replace(/^www\./, "");

  $("site-domain").textContent = domain;
  $("site-banner").classList.remove("hidden");

  const res = await msg({ type: "FIND_MATCHES", domain });
  $("vault-loading").classList.add("hidden");

  if (!res.ok || res.error === "locked") {
    showScreen("screen-unlock");
    return;
  }

  const entries = res.entries || [];

  if (!entries.length) {
    $("vault-empty").classList.remove("hidden");
    $("empty-domain").textContent = `No saved logins for ${domain}`;
    return;
  }

  if (entries.length === 1) {
    await autofill(tab.id, entries[0]);
    renderMatches(entries, tab.id, true);
  } else {
    renderMatches(entries, tab.id, false);
  }
}

function showNoForm() {
  $("vault-loading").classList.add("hidden");
  $("vault-noform").classList.remove("hidden");
}

// ── Render match cards ────────────────────────────────────────────────────────
function renderMatches(entries, tabId, autoFilled) {
  const list = $("matches-list");
  const label = $("matches-label");

  label.textContent = autoFilled
    ? `Auto-filled · ${entries.length} credential${entries.length > 1 ? "s" : ""} found`
    : `${entries.length} credential${entries.length > 1 ? "s" : ""} found — choose one`;

  list.innerHTML = "";

  entries.forEach((entry) => {
    const card = document.createElement("div");
    card.className = "match-card";

    card.innerHTML = `
      <div class="match-avatar">🔑</div>
      <div class="match-info">
        <div class="match-site">${escHtml(entry.site || entry.username || "Login")}</div>
        <div class="match-user">${escHtml(entry.username || "")}</div>
      </div>
      <button class="match-fill-btn" data-id="${entry.id}">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        Fill
      </button>
    `;

    const fillBtn = card.querySelector(".match-fill-btn");
    fillBtn.addEventListener("click", async (e) => {
      e.stopPropagation();
      await autofill(tabId, entry);
      fillBtn.textContent = "✓ Filled";
      fillBtn.classList.add("success");
    });

    card.addEventListener("click", async () => {
      await autofill(tabId, entry);
      fillBtn.textContent = "✓ Filled";
      fillBtn.classList.add("success");
    });

    list.appendChild(card);
  });

  $("vault-matches").classList.remove("hidden");
}

// ── Autofill ──────────────────────────────────────────────────────────────────
async function autofill(tabId, entry) {
  await msg({ type: "AUTOFILL", tabId, entry });
}

// ── Escape HTML ───────────────────────────────────────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Start ─────────────────────────────────────────────────────────────────────
init();

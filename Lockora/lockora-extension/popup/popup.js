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

// ── Eye toggle ────────────────────────────────────────────────────────────────
document.querySelectorAll(".eye-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    const input = document.getElementById(btn.dataset.target);
    input.type = input.type === "password" ? "text" : "password";
  });
});

// ── Open webapp link ───────────────────────────────────────────────────────────
document.getElementById("open-webapp").addEventListener("click", (e) => {
  e.preventDefault();
  chrome.tabs.create({ url: "https://lockora-vault.vercel.app" });
});

// ── Init ──────────────────────────────────────────────────────────────────────
// FIX: Use timedOut and swRestart flags from GET_SESSION to correctly decide
// whether to show the unlock screen. Previously, any SW restart (which wipes
// cryptoKey from memory) would trigger the unlock screen even if the user's
// configured inactivity period hadn't elapsed yet.
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
      return;
    }

    // Vault genuinely timed out due to inactivity — must re-enter master password
    if (session.email && session.timedOut) {
      $("unlock-email").textContent = `${session.email} · Session timed out`;
      $("unlock-email").dataset.reason = "timeout";
      showScreen("screen-unlock");
      return;
    }

    // FIX: SW was restarted (key lost) but timeout hasn't elapsed.
    // Still need to re-derive the key, but show a softer unlock message.
    if (session.email && session.swRestart) {
      $("unlock-email").textContent = session.email;
      $("unlock-email").dataset.reason = "swrestart";
      showScreen("screen-unlock");
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
      return;
    }

    showScreen("screen-signin");
  } catch {
    showScreen("screen-signin");
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
      showScreen("screen-unlock");
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
      setError("unlock-err", res.error || "Incorrect master password.");
    } else {
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
  showScreen("screen-signin");
});

// ── Sign out ──────────────────────────────────────────────────────────────────
$("btn-signout").addEventListener("click", async () => {
  await msg({ type: "SIGN_OUT" });
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

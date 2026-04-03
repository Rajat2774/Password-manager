

(function () {
  "use strict";

  // ── Constants ───────────────────────────────────────────────────────────────
  const LOCKORA_BANNER_ID = "lockora-autofill-banner";
  const LOCKORA_SAVE_ID   = "lockora-save-banner";
  const LOCKORA_TOAST_ID  = "lockora-toast";
  const LOG = (...a) => console.debug("[Lockora]", ...a);

  // ── State ───────────────────────────────────────────────────────────────────
  let bannerDismissTimer = null;
  let saveDismissTimer   = null;
  let formObserver       = null;
  let autofillChecked    = false;

  // Credential capture state
  let lastCaptured    = null;   // { username, domain, time } — dedup guard
  let pendingCreds    = null;   // creds held just before submit for URL-watch fallback
  let lastUrl         = location.href;
  let urlWatcherTimer = null;

  // ── Helper: message background ──────────────────────────────────────────────
  function bgMsg(data) {
    return new Promise((resolve) => {
      try {
        chrome.runtime.sendMessage(data, (res) => {
          if (chrome.runtime.lastError) {
            resolve({ ok: false, error: chrome.runtime.lastError.message });
          } else {
            resolve(res || { ok: false });
          }
        });
      } catch {
        resolve({ ok: false, error: "Extension not available" });
      }
    });
  }

  // ── Inject styles ───────────────────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById("lockora-injected-styles")) return;
    const style = document.createElement("style");
    style.id = "lockora-injected-styles";
    style.textContent = `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

      #${LOCKORA_BANNER_ID}, #${LOCKORA_SAVE_ID} {
        position: fixed !important;
        bottom: 16px !important;
        right: 16px !important;
        z-index: 2147483647 !important;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif !important;
        animation: lockora-slide-up 0.35s cubic-bezier(0.22, 1, 0.36, 1) !important;
      }
      @keyframes lockora-slide-up {
        from { opacity: 0; transform: translateY(16px) scale(0.97); }
        to   { opacity: 1; transform: translateY(0) scale(1); }
      }
      @keyframes lockora-fade-out {
        from { opacity: 1; transform: translateY(0) scale(1); }
        to   { opacity: 0; transform: translateY(8px) scale(0.97); }
      }
      .lockora-banner-container {
        background: #ffffff !important;
        border: 1px solid #e2e8e0 !important;
        border-radius: 16px !important;
        padding: 0 !important;
        box-shadow: 0 12px 40px rgba(0,0,0,0.08), 0 4px 12px rgba(26,107,60,0.06), 0 0 0 1px rgba(26,107,60,0.04) !important;
        min-width: 290px !important;
        max-width: 350px !important;
        overflow: hidden !important;
        pointer-events: all !important;
      }
      .lockora-banner-header {
        display: flex !important;
        align-items: center !important;
        justify-content: space-between !important;
        padding: 11px 14px !important;
        border-bottom: 1px solid #e2e8e0 !important;
        background: #f6f8f3 !important;
      }
      .lockora-banner-brand {
        display: flex !important;
        align-items: center !important;
        gap: 7px !important;
        font-size: 12px !important;
        font-weight: 600 !important;
        color: #1a1a2e !important;
        letter-spacing: -0.01em !important;
      }
      .lockora-banner-brand svg { color: #1a6b3c !important; }
      .lockora-banner-close {
        background: none !important;
        border: none !important;
        color: #8a9a72 !important;
        cursor: pointer !important;
        padding: 3px !important;
        border-radius: 6px !important;
        display: flex !important;
        align-items: center !important;
        transition: all 0.15s !important;
      }
      .lockora-banner-close:hover { color: #ef4444 !important; background: rgba(239,68,68,0.06) !important; }
      .lockora-entry-item {
        display: flex !important;
        align-items: center !important;
        gap: 10px !important;
        padding: 10px 14px !important;
        cursor: pointer !important;
        transition: background 0.15s !important;
        border-bottom: 1px solid #e2e8e0 !important;
        background: #ffffff !important;
      }
      .lockora-entry-item:last-child { border-bottom: none !important; }
      .lockora-entry-item:hover { background: #f6f8f3 !important; }
      .lockora-entry-avatar {
        width: 32px !important; height: 32px !important;
        border-radius: 10px !important;
        background: rgba(26,107,60,0.08) !important;
        border: 1px solid rgba(26,107,60,0.15) !important;
        display: flex !important; align-items: center !important; justify-content: center !important;
        font-size: 13px !important; flex-shrink: 0 !important;
      }
      .lockora-entry-info { flex: 1 !important; min-width: 0 !important; }
      .lockora-entry-site {
        font-size: 12px !important; color: #1a1a2e !important; font-weight: 500 !important;
        white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important;
      }
      .lockora-entry-user {
        font-size: 10px !important; color: #8a9a72 !important; margin-top: 1px !important;
        white-space: nowrap !important; overflow: hidden !important; text-overflow: ellipsis !important;
      }
      .lockora-fill-btn {
        display: flex !important; align-items: center !important; gap: 4px !important;
        padding: 5px 11px !important;
        background: rgba(26,107,60,0.08) !important;
        border: 1px solid rgba(26,107,60,0.18) !important;
        border-radius: 8px !important; font-size: 10px !important; color: #1a6b3c !important;
        cursor: pointer !important; transition: all 0.15s !important; font-weight: 500 !important;
        white-space: nowrap !important; flex-shrink: 0 !important; font-family: inherit !important;
      }
      .lockora-fill-btn:hover { background: rgba(26,107,60,0.14) !important; transform: translateY(-1px) !important; }
      .lockora-fill-btn.success {
        background: rgba(34,160,80,0.08) !important;
        border-color: rgba(34,160,80,0.22) !important; color: #22a050 !important;
      }
      .lockora-save-body { padding: 12px 14px !important; }
      .lockora-save-text {
        font-size: 12px !important; color: #6b7c6b !important;
        margin-bottom: 8px !important; line-height: 1.4 !important;
      }
      .lockora-save-text strong { color: #1a1a2e !important; font-weight: 600 !important; }
      .lockora-save-creds {
        background: #f6f8f3 !important; border: 1px solid #e2e8e0 !important;
        border-radius: 10px !important; padding: 9px 11px !important;
        margin-bottom: 10px !important; font-size: 11px !important; color: #6b7c6b !important;
      }
      .lockora-save-creds strong { color: #5a6a5a !important; font-weight: 500 !important; }
      .lockora-save-actions {
        display: flex !important; gap: 8px !important; justify-content: flex-end !important;
      }
      .lockora-save-btn {
        padding: 7px 14px !important; border-radius: 10px !important;
        font-size: 11px !important; font-weight: 600 !important;
        letter-spacing: 0.02em !important; cursor: pointer !important;
        transition: all 0.2s !important; border: none !important; font-family: inherit !important;
      }
      .lockora-save-btn.primary {
        background: #1a6b3c !important; color: #fff !important;
      }
      .lockora-save-btn.primary:hover {
        background: #145a31 !important;
        transform: translateY(-1px) !important;
        box-shadow: 0 4px 14px rgba(26,107,60,0.2) !important;
      }
      .lockora-save-btn.ghost {
        background: none !important; color: #6b7c6b !important;
        border: 1px solid #e2e8e0 !important;
      }
      .lockora-save-btn.ghost:hover { border-color: #c5cdb8 !important; color: #1a1a2e !important; background: #f6f8f3 !important; }
    `;
    document.head.appendChild(style);
  }

  // ══════════════════════════════════════════════════════════════
  // FORM DETECTION
  // ══════════════════════════════════════════════════════════════

  function findLoginForm() {
    const passwordFields = Array.from(
      document.querySelectorAll('input[type="password"]')
    ).filter(isVisible);
    if (!passwordFields.length) return null;

    for (const pwField of passwordFields) {
      const usernameField = findUsernameField(pwField);
      return { usernameField, passwordField: pwField };
    }
    return null;
  }

  function findUsernameField(passwordField) {
    const candidates = Array.from(
      document.querySelectorAll(
        'input[type="email"], input[type="text"], input[type="tel"], ' +
        'input[autocomplete="username"], input[autocomplete="email"]'
      )
    ).filter(isVisible);
    if (!candidates.length) return null;

    let closest = null, minDist = Infinity;
    for (const c of candidates) {
      const dist = domDistance(c, passwordField);
      if (dist < minDist) { minDist = dist; closest = c; }
    }
    return closest;
  }

  function isVisible(el) {
    if (!el) return false;
    const rect = el.getBoundingClientRect();
    return (
      rect.width > 0 && rect.height > 0 &&
      getComputedStyle(el).visibility !== "hidden" &&
      getComputedStyle(el).display !== "none" &&
      !el.disabled
    );
  }

  function domDistance(a, b) {
    const pos = a.compareDocumentPosition(b);
    if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return domDepth(b) - domDepth(a);
    if (pos & Node.DOCUMENT_POSITION_PRECEDING)  return domDepth(a) - domDepth(b);
    return 999;
  }

  function domDepth(el) {
    let d = 0;
    while (el.parentElement) { el = el.parentElement; d++; }
    return d;
  }

  // ── Fill field (React/Vue/Angular-safe) ─────────────────────────────────────
  function fillField(el, value) {
    if (!el || value == null) return;
    const nativeSetter = Object.getOwnPropertyDescriptor(
      window.HTMLInputElement.prototype, "value"
    )?.set;
    if (nativeSetter) nativeSetter.call(el, value);
    else el.value = value;
    ["input", "change", "keyup", "blur"].forEach((evt) =>
      el.dispatchEvent(new Event(evt, { bubbles: true, cancelable: true }))
    );
  }

  // ── Autofill ────────────────────────────────────────────────────────────────
  function doAutofill(username, password) {
    const form = findLoginForm();
    if (!form) { showToast("No login form found on this page.", "warn"); return false; }
    if (form.usernameField && username) fillField(form.usernameField, username);
    if (form.passwordField  && password) fillField(form.passwordField,  password);
    showToast("Credentials filled by Lockora ✓", "success");
    return true;
  }

  // ══════════════════════════════════════════════════════════════
  // AUTOFILL BANNER
  // ══════════════════════════════════════════════════════════════

  function showAutofillBanner(entries) {
    removeElement(LOCKORA_BANNER_ID);
    injectStyles();

    const banner = document.createElement("div");
    banner.id = LOCKORA_BANNER_ID;

    const entriesHtml = entries.map((entry, i) => `
      <div class="lockora-entry-item" data-index="${i}">
        <div class="lockora-entry-avatar">🔑</div>
        <div class="lockora-entry-info">
          <div class="lockora-entry-site">${escHtml(entry.site || entry.username || "Login")}</div>
          <div class="lockora-entry-user">${escHtml(entry.username || "")}</div>
        </div>
        <button class="lockora-fill-btn" data-index="${i}">Fill</button>
      </div>
    `).join("");

    banner.innerHTML = `
      <div class="lockora-banner-container">
        <div class="lockora-banner-header">
          <div class="lockora-banner-brand">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
            Autofill with Lockora
          </div>
          <button class="lockora-banner-close" id="lockora-banner-dismiss">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        ${entriesHtml}
      </div>
    `;

    document.body.appendChild(banner);

    banner.querySelector("#lockora-banner-dismiss").addEventListener("click", (e) => {
      e.stopPropagation();
      removeElement(LOCKORA_BANNER_ID);
    });

    banner.querySelectorAll(".lockora-entry-item").forEach((item) => {
      const fillHandler = () => {
        const entry = entries[parseInt(item.dataset.index)];
        doAutofill(entry.username, entry.password);
        const btn = item.querySelector(".lockora-fill-btn");
        if (btn) { btn.textContent = "✓ Filled"; btn.classList.add("success"); }
        clearTimeout(bannerDismissTimer);
        bannerDismissTimer = setTimeout(() => removeElement(LOCKORA_BANNER_ID), 1200);
      };
      item.addEventListener("click", fillHandler);
      const btn = item.querySelector(".lockora-fill-btn");
      if (btn) btn.addEventListener("click", (e) => { e.stopPropagation(); fillHandler(); });
    });

    clearTimeout(bannerDismissTimer);
    bannerDismissTimer = setTimeout(() => removeElement(LOCKORA_BANNER_ID), 15000);
  }

  // ══════════════════════════════════════════════════════════════
  // SAVE PASSWORD BANNER
  // ══════════════════════════════════════════════════════════════

  function showSavePasswordBanner(domain, fullUrl, username, password) {
    if (document.getElementById(LOCKORA_SAVE_ID)) return; // already showing
    injectStyles();

    LOG("Showing save banner for", domain, "/", username);

    const banner = document.createElement("div");
    banner.id = LOCKORA_SAVE_ID;
    const maskedPass = "•".repeat(Math.min(password.length, 12));

    banner.innerHTML = `
      <div class="lockora-banner-container">
        <div class="lockora-banner-header">
          <div class="lockora-banner-brand">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              <path d="M9 12l2 2 4-4"/>
            </svg>
            Save to Lockora
          </div>
          <button class="lockora-banner-close" id="lockora-save-dismiss">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor"
              stroke-width="2" stroke-linecap="round">
              <line x1="18" y1="6" x2="6" y2="18"/>
              <line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>
        <div class="lockora-save-body">
          <div class="lockora-save-text">
            Save credentials for <strong>${escHtml(domain)}</strong>?
          </div>
          <div class="lockora-save-creds">
            <strong>User:</strong> ${escHtml(username)}<br>
            <strong>Pass:</strong> ${maskedPass}
          </div>
          <div class="lockora-save-actions">
            <button class="lockora-save-btn ghost" id="lockora-save-never">Not now</button>
            <button class="lockora-save-btn primary" id="lockora-save-confirm">Save password</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(banner);

    banner.querySelector("#lockora-save-dismiss").addEventListener("click", () => removeElement(LOCKORA_SAVE_ID));
    banner.querySelector("#lockora-save-never").addEventListener("click",   () => removeElement(LOCKORA_SAVE_ID));

    banner.querySelector("#lockora-save-confirm").addEventListener("click", async () => {
      const btn = banner.querySelector("#lockora-save-confirm");
      btn.textContent = "Saving…";
      btn.disabled = true;
      try {
        const res = await bgMsg({ type: "SAVE_CREDENTIALS", domain, fullUrl, username, password });
        if (res.ok) {
          showToast("Password saved to Lockora ✓", "success");
        } else if (res.error === "locked") {
          showToast("Vault is locked — open Lockora to unlock first.", "warn");
        } else {
          showToast(res.error || "Failed to save.", "warn");
        }
      } catch {
        showToast("Failed to save password.", "warn");
      }
      removeElement(LOCKORA_SAVE_ID);
    });

    clearTimeout(saveDismissTimer);
    saveDismissTimer = setTimeout(() => removeElement(LOCKORA_SAVE_ID), 30000);
  }

  // ══════════════════════════════════════════════════════════════
  // HELPERS
  // ══════════════════════════════════════════════════════════════

  function removeElement(id) {
    const el = document.getElementById(id);
    if (el) {
      el.style.animation = "lockora-fade-out 0.2s ease-in forwards";
      setTimeout(() => el.remove(), 200);
    }
  }

  function showToast(message, type = "info") {
    const existing = document.getElementById(LOCKORA_TOAST_ID);
    if (existing) existing.remove();
    injectStyles();
    const colors = {
      success: { bg: "#ffffff", border: "rgba(34,160,80,0.3)",  text: "#1a6b3c" },
      warn:    { bg: "#ffffff", border: "rgba(217,119,6,0.3)",   text: "#b45309" },
      info:    { bg: "#ffffff", border: "rgba(26,107,60,0.3)",   text: "#1a6b3c" },
    };
    const c = colors[type] || colors.info;
    const toast = document.createElement("div");
    toast.id = LOCKORA_TOAST_ID;
    toast.style.cssText = `
      position:fixed!important; bottom:20px!important; right:20px!important;
      z-index:2147483647!important; display:flex!important; align-items:center!important;
      gap:8px!important; padding:10px 16px!important;
      background:${c.bg}!important; border:1px solid ${c.border}!important;
      border-radius:12px!important;
      font-family:'Inter',-apple-system,BlinkMacSystemFont,sans-serif!important;
      font-size:12px!important; color:${c.text}!important; font-weight:500!important;
      box-shadow:0 8px 32px rgba(0,0,0,0.08), 0 2px 8px rgba(26,107,60,0.06)!important;
      transition:opacity 0.3s ease!important; pointer-events:none!important;
    `;
    toast.innerHTML = `
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
        stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="M9 12l2 2 4-4"/>
      </svg>
      <span>${message}</span>
    `;
    document.body.appendChild(toast);
    setTimeout(() => { toast.style.opacity = "0"; }, 2500);
    setTimeout(() => toast.remove(), 2800);
  }

  function escHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;").replace(/</g, "&lt;")
      .replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  // ══════════════════════════════════════════════════════════════
  // CREDENTIAL CAPTURE
  // ══════════════════════════════════════════════════════════════

  function captureCredentials() {
    const form = findLoginForm();
    if (!form?.passwordField?.value) return null;

    const username = form.usernameField?.value?.trim() || "";
    const password = form.passwordField.value;
    if (!password) return null;

    return {
      domain:  window.location.hostname.replace(/^www\./, ""),
      fullUrl: window.location.href,
      username,
      password,
    };
  }

  // Send to background with dedup (prevents triple-send from submit+click+keydown)
  function sendPendingSave(creds) {
    if (!creds?.password) return;

    const now = Date.now();
    if (
      lastCaptured &&
      lastCaptured.username === creds.username &&
      lastCaptured.domain   === creds.domain   &&
      now - lastCaptured.time < 4000
    ) {
      LOG("Dedup — skipping duplicate capture for", creds.username);
      return;
    }

    lastCaptured = { username: creds.username, domain: creds.domain, time: now };
    LOG("Sending PENDING_SAVE →", creds.domain, creds.username);
    bgMsg({ type: "PENDING_SAVE", ...creds });
  }

  function monitorFormSubmissions() {
    // 1. Standard HTML form submit
    document.addEventListener("submit", (e) => {
      if (!(e.target instanceof HTMLFormElement)) return;
      const creds = captureCredentials();
      LOG("form submit event, captured:", !!creds);
      if (creds) { sendPendingSave(creds); pendingCreds = creds; }
    }, true);

    // 2. Click on any submit-like button while a password field is visible
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(
        'button[type="submit"], input[type="submit"], button:not([type]), [role="button"]'
      );
      if (!btn) return;

      const hasPw = [...document.querySelectorAll('input[type="password"]')].some(isVisible);
      if (!hasPw) return;

      const creds = captureCredentials();
      LOG("button click event, captured:", !!creds);
      if (creds) { sendPendingSave(creds); pendingCreds = creds; }
    }, true);

    // 3. Enter key inside a login field
    document.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return;
      const inLogin =
        e.target.type === "password" ||
        e.target.closest("form")?.querySelector('input[type="password"]');
      if (!inLogin) return;

      const creds = captureCredentials();
      LOG("Enter key event, captured:", !!creds);
      if (creds) { sendPendingSave(creds); pendingCreds = creds; }
    }, true);
  }

  // ══════════════════════════════════════════════════════════════
  // SPA NAVIGATION DETECTION
  // LeetCode uses React + fetch-based login + history.pushState.
  // There is no page reload, so TAB_READY never fires.
  // We detect the URL change via two mechanisms:
  //   1. Patching history.pushState / replaceState (instant)
  //   2. A 250ms polling interval as safety net
  // ══════════════════════════════════════════════════════════════

  function onUrlChange(source) {
    const currentUrl = location.href;
    if (currentUrl === lastUrl) return;
    LOG("URL changed via", source, "→", currentUrl);
    lastUrl = currentUrl;

    // Reset page state
    autofillChecked = false;
    if (formObserver) { formObserver.disconnect(); formObserver = null; }

    // Check for pending save from the login that just happened
    // Use retries because the SW may still be processing PENDING_SAVE
    checkPendingSave(4, 500);

    // Re-check autofill for the new page
    setTimeout(() => checkForInlineAutofill(), 600);
    setTimeout(() => startFormObserver(), 900);
  }

  function patchHistoryApi() {
    try {
      const _push    = history.pushState.bind(history);
      const _replace = history.replaceState.bind(history);

      history.pushState = function (...args) {
        _push(...args);
        onUrlChange("pushState");
      };
      history.replaceState = function (...args) {
        _replace(...args);
        onUrlChange("replaceState");
      };
      window.addEventListener("popstate", () => onUrlChange("popstate"));
      LOG("History API patched");
    } catch (err) {
      LOG("Failed to patch history API:", err);
    }
  }

  // Polling fallback — catches any navigation that bypassed our pushState patch
  function startUrlWatcher() {
    if (urlWatcherTimer) return;
    urlWatcherTimer = setInterval(() => {
      if (location.href !== lastUrl) {
        onUrlChange("poll");
      }
    }, 250);
  }

  // ══════════════════════════════════════════════════════════════
  // SAVE PROMPT — asks background for stored pending credentials
  // ══════════════════════════════════════════════════════════════

  async function checkPendingSave(retries = 3, delayMs = 600) {
    LOG("checkPendingSave — attempts:", retries);

    for (let i = 0; i < retries; i++) {
      try {
        const res = await bgMsg({
          type:   "GET_PENDING_SAVE",
          domain: window.location.hostname.replace(/^www\./, ""),
        });

        LOG("GET_PENDING_SAVE response (attempt", i + 1, "):", JSON.stringify(res));

        if (res.ok && res.pending) {
          showSavePasswordBanner(
            res.pending.domain,
            res.pending.fullUrl,
            res.pending.username,
            res.pending.password,
          );
          return; // success
        }
      } catch (err) {
        LOG("checkPendingSave error:", err);
      }

      if (i < retries - 1) {
        await new Promise((r) => setTimeout(r, delayMs));
      }
    }

    LOG("No pending save found after", retries, "attempts");
  }

  // ══════════════════════════════════════════════════════════════
  // AUTOFILL CHECK
  // ══════════════════════════════════════════════════════════════

  async function checkForInlineAutofill() {
    if (autofillChecked) return;
    if (document.getElementById(LOCKORA_BANNER_ID)) return;

    const form = findLoginForm();
    if (!form) return;

    if (form.passwordField?.value || form.usernameField?.value) return;

    const domain = window.location.hostname.replace(/^www\./, "");
    const res = await bgMsg({ type: "CHECK_MATCHES", domain });

    if (res.ok && res.entries?.length > 0) {
      const form2 = findLoginForm();
      if (
        form2 &&
        !form2.passwordField?.value &&
        !form2.usernameField?.value &&
        !document.getElementById(LOCKORA_BANNER_ID)
      ) {
        showAutofillBanner(res.entries);
        autofillChecked = true;
      }
    }
  }

  function startFormObserver() {
    if (formObserver) return;
    formObserver = new MutationObserver(() => {
      if (document.getElementById(LOCKORA_BANNER_ID)) return;
      if (findLoginForm()) checkForInlineAutofill();
    });
    formObserver.observe(document.body, { childList: true, subtree: true });
  }

  // ══════════════════════════════════════════════════════════════
  // MESSAGE LISTENER
  // ══════════════════════════════════════════════════════════════

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

    if (msg.type === "DO_AUTOFILL") {
      const success = doAutofill(msg.username, msg.password);
      removeElement(LOCKORA_BANNER_ID);
      sendResponse({ ok: success });
    }

    if (msg.type === "TAB_READY") {
      LOG("TAB_READY received");
      autofillChecked = false;
      lastUrl = location.href;

      if (formObserver) { formObserver.disconnect(); formObserver = null; }

      const form = findLoginForm();
      if (form) {
        bgMsg({ type: "PAGE_HAS_FORM", domain: location.hostname.replace(/^www\./, "") });
        setTimeout(() => checkForInlineAutofill(), 300);
      }

      setTimeout(() => checkPendingSave(3, 600), 500);
      setTimeout(() => startFormObserver(), 800);
    }

    if (msg.type === "CHECK_FORM") {
      const form = findLoginForm();
      sendResponse({
        hasForm: !!form,
        domain:  location.hostname.replace(/^www\./, ""),
      });
    }

    if (msg.type === "VAULT_LOCKED") {
      removeElement(LOCKORA_BANNER_ID);
      removeElement(LOCKORA_SAVE_ID);
      autofillChecked = false;
    }

    return true;
  });

  // ══════════════════════════════════════════════════════════════
  // BOOTSTRAP
  // ══════════════════════════════════════════════════════════════

  patchHistoryApi();         // Patch pushState/replaceState first
  monitorFormSubmissions();  // Listen for submit/click/keydown
  startUrlWatcher();         // 250ms poll safety net

  // Staggered initial checks on page load
  setTimeout(() => checkForInlineAutofill(), 800);
  setTimeout(() => checkPendingSave(2, 600),  1200);
  setTimeout(() => startFormObserver(),        1600);

  LOG("Initialized on", location.hostname);
})();
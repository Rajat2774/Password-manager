// lockora-extension/background.js
// Service worker — handles auth, Firestore queries, encryption/decryption, and auto-lock

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getAuth,
  signInWithEmailAndPassword,
  signInWithCredential,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  getFirestore,
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { firebaseConfig, GOOGLE_CLIENT_ID } from "./firebase-config.js";

// ── Firebase init ─────────────────────────────────────────────────────────────
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// ── In-memory session (cleared when service worker stops) ────────────────────
let cryptoKey = null;
let currentUid = null;
const autoLockAlarmName = "lockora-auto-lock";
const keepAliveAlarmName = "lockora-keep-alive";
const DEFAULT_TIMEOUT = 15; // minutes

// ── Keep service worker alive while vault is unlocked ────────────────────────
function startKeepAlive() {
  chrome.alarms.create(keepAliveAlarmName, { periodInMinutes: 0.4 }); // ~24s
}

function stopKeepAlive() {
  chrome.alarms.clear(keepAliveAlarmName);
}

// ── PBKDF2 key derivation ────────────────────────────────────────────────────
async function deriveKey(masterPassword, uid) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(masterPassword),
    "PBKDF2",
    false,
    ["deriveKey"],
  );
  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode(uid),
      iterations: 600000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

// ── AES-GCM encrypt ──────────────────────────────────────────────────────────
async function encryptField(plaintext, key) {
  const enc = new TextEncoder();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const ciphertext = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    enc.encode(plaintext),
  );
  const combined = new Uint8Array(iv.byteLength + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.byteLength);
  return btoa(String.fromCharCode(...combined));
}

// ── AES-GCM decrypt ──────────────────────────────────────────────────────────
async function decryptField(encoded, key) {
  try {
    const combined = Uint8Array.from(atob(encoded), (c) => c.charCodeAt(0));
    const iv = combined.slice(0, 12);
    const ciphertext = combined.slice(12);
    const buf = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      ciphertext,
    );
    return new TextDecoder().decode(buf);
  } catch {
    return null;
  }
}

// ── Canary verification ───────────────────────────────────────────────────────
async function verifyMasterPassword(uid, key) {
  try {
    const snap = await getDoc(doc(db, "users", uid, "vault", "meta"));
    if (!snap.exists()) return true;
    const canary = snap.data().canary;
    const result = await decryptField(canary, key);
    return result === "keyvault-canary";
  } catch {
    return false;
  }
}

// ── Auto-lock timer ──────────────────────────────────────────────────────────
async function resetAutoLockTimer() {
  const { lockTimeout } = await chrome.storage.local.get(["lockTimeout"]);
  const timeout = lockTimeout !== undefined ? lockTimeout : DEFAULT_TIMEOUT;

  await chrome.alarms.clear(autoLockAlarmName);

  if (timeout > 0 && cryptoKey) {
    await chrome.alarms.create(autoLockAlarmName, {
      delayInMinutes: timeout,
    });
  }
}

// ── Handle alarms ────────────────────────────────────────────────────────────
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === autoLockAlarmName) {
    // Auto-lock: clear key but keep session
    cryptoKey = null;
    currentUid = null;
    stopKeepAlive();

    // FIX: Mark that the vault was explicitly locked by timeout
    chrome.storage.session.set({ timedOut: true, unlockedAt: null });

    chrome.tabs.query({}, (tabs) => {
      for (const tab of tabs) {
        if (tab.id) {
          chrome.tabs
            .sendMessage(tab.id, { type: "VAULT_LOCKED" })
            .catch(() => {});
        }
      }
    });
  }
  // keepalive alarm — just existing keeps the SW alive
});

// ── Google OAuth ─────────────────────────────────────────────────────────────
async function launchGoogleOAuth() {
  let clientId = GOOGLE_CLIENT_ID;
  if (!clientId || clientId.startsWith("PASTE_YOUR")) {
    clientId = await getGoogleClientId();
  }
  if (!clientId) {
    throw new Error("Google Client ID not configured. Add it to firebase-config.js.");
  }

  const redirectUrl = chrome.identity.getRedirectURL();
  const nonce = crypto.getRandomValues(new Uint8Array(16));
  const nonceStr = Array.from(nonce, (b) => b.toString(16).padStart(2, "0")).join("");

  const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth");
  authUrl.searchParams.set("client_id", clientId);
  authUrl.searchParams.set("redirect_uri", redirectUrl);
  authUrl.searchParams.set("response_type", "id_token");
  authUrl.searchParams.set("scope", "openid email profile");
  authUrl.searchParams.set("nonce", nonceStr);
  authUrl.searchParams.set("prompt", "select_account");

  return new Promise((resolve, reject) => {
    chrome.identity.launchWebAuthFlow(
      { url: authUrl.toString(), interactive: true },
      (responseUrl) => {
        if (chrome.runtime.lastError) {
          reject(new Error(chrome.runtime.lastError.message));
          return;
        }
        if (!responseUrl) {
          reject(new Error("Google sign-in was cancelled."));
          return;
        }
        const hash = new URL(responseUrl).hash.substring(1);
        const params = new URLSearchParams(hash);
        const idToken = params.get("id_token");
        if (!idToken) {
          reject(new Error("No ID token received from Google."));
          return;
        }
        resolve(idToken);
      },
    );
  });
}

// ── Fetch Google Client ID from Firebase ──────────────────────────────────────
let cachedGoogleClientId = null;
async function getGoogleClientId() {
  if (cachedGoogleClientId) return cachedGoogleClientId;
  try {
    const res = await fetch(
      `https://www.googleapis.com/identitytoolkit/v3/relyingparty/getProjectConfig?key=${firebaseConfig.apiKey}`,
    );
    const data = await res.json();
    const gp = (data.idpConfig || []).find((p) => p.provider === "GOOGLE");
    if (gp?.clientId) { cachedGoogleClientId = gp.clientId; return cachedGoogleClientId; }

    const res2 = await fetch(
      `https://identitytoolkit.googleapis.com/v2/projects/${firebaseConfig.projectId}/config?key=${firebaseConfig.apiKey}`,
    );
    const data2 = await res2.json();
    const gc = (data2.signIn?.idpConfig || []).find((p) => p.provider === "GOOGLE");
    if (gc?.clientId) { cachedGoogleClientId = gc.clientId; return cachedGoogleClientId; }
  } catch (err) {
    console.error("[Lockora] Failed to fetch Google Client ID:", err);
  }
  return null;
}

// ── Find matching vault entries ──────────────────────────────────────────────
async function findMatchingEntries(uid, domain) {
  const snap = await getDocs(collection(db, "users", uid, "passwords"));
  const matches = [];

  for (const d of snap.docs) {
    const data = d.data();
    if (data.vaultType && data.vaultType !== "password") continue;

    const site = (data.site || "").toLowerCase();
    const url = (data.url || "").toLowerCase();
    const dom = domain.toLowerCase();

    const siteMatch = site.includes(dom) || dom.includes(site.replace(/^www\./, ""));
    const urlMatch = url.includes(dom) || dom.includes(url.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]);

    if (siteMatch || urlMatch) {
      const username = data.username
        ? ((await decryptField(data.username, cryptoKey)) ?? data.username)
        : data.username || "";
      const password = data.password
        ? await decryptField(data.password, cryptoKey)
        : null;

      if (password) {
        matches.push({
          id: d.id,
          site: data.site || "",
          url: data.url || "",
          username,
          password,
        });
      }
    }
  }
  return matches;
}

// ── Check if creds already saved ─────────────────────────────────────────────
async function hasExistingCredentials(uid, domain, username) {
  const snap = await getDocs(collection(db, "users", uid, "passwords"));
  const dom = domain.toLowerCase();

  for (const d of snap.docs) {
    const data = d.data();
    if (data.vaultType && data.vaultType !== "password") continue;

    const site = (data.site || "").toLowerCase();
    const url = (data.url || "").toLowerCase();
    const siteMatch = site.includes(dom) || dom.includes(site.replace(/^www\./, ""));
    const urlMatch = url.includes(dom) || dom.includes(url.replace(/^https?:\/\/(www\.)?/, "").split("/")[0]);

    if (siteMatch || urlMatch) {
      if ((data.username || "") === username) return true;
    }
  }
  return false;
}

// ── Save new credentials ─────────────────────────────────────────────────────
async function saveCredentials(uid, domain, fullUrl, username, password) {
  const encryptedPassword = await encryptField(password, cryptoKey);
  const payload = {
    vaultType: "password",
    site: domain,
    url: fullUrl,
    category: "Other",
    username: username,
    password: encryptedPassword,
    notes: "",
  };
  await addDoc(collection(db, "users", uid, "passwords"), payload);
}

// ── Pending save storage (cross-origin safe) ─────────────────────────────────
async function storePendingSave(tabId, data) {
  const key = `pendingSave_${tabId}`;
  const fallbackKey = `pendingSave_domain_${data.domain}_${data.username}`;

  try {
    const existing = await chrome.storage.session.get([key, fallbackKey]);
    const byTab = existing[key];
    const byDomain = existing[fallbackKey];

    const isDupe = (entry) =>
      entry &&
      Date.now() - entry.time < 5000 &&
      entry.username === data.username &&
      entry.domain === data.domain;

    if (isDupe(byTab) || isDupe(byDomain)) return; // already stored
  } catch { /* ignore */ }

  const payload = { ...data, tabId, time: Date.now() };
  await chrome.storage.session.set({
    [key]: payload,
    [fallbackKey]: payload,
  });
}

async function getPendingSave(tabId) {
  const key = `pendingSave_${tabId}`;
  const result = await chrome.storage.session.get([key]);
  let pending = result[key];

  // If not found by tabId, scan for domain-based fallback keys
  if (!pending) {
    const all = await chrome.storage.session.get(null);
    const fallback = Object.entries(all)
      .filter(([k]) => k.startsWith("pendingSave_domain_"))
      .map(([k, v]) => ({ key: k, ...v }))
      .filter((v) => Date.now() - v.time < 60000)
      .sort((a, b) => b.time - a.time)[0]; // most recent

    if (fallback) {
      pending = fallback;
      await chrome.storage.session.remove([fallback.key]);
    }
  } else {
    await chrome.storage.session.remove([key]);
    // Also clean up the domain fallback
    const fallbackKey = `pendingSave_domain_${pending.domain}_${pending.username}`;
    await chrome.storage.session.remove([fallbackKey]);
  }

  if (!pending) return null;
  if (Date.now() - pending.time > 60000) return null;
  return pending;
}


// ── Message handler ───────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  handleMessage(msg, sender)
    .then(sendResponse)
    .catch((err) => {
      sendResponse({ ok: false, error: err.message });
    });
  return true;
});

async function handleMessage(msg, sender) {
  if (cryptoKey && !["GET_SESSION", "PAGE_HAS_FORM", "PENDING_SAVE", "GET_PENDING_SAVE"].includes(msg.type)) {
    resetAutoLockTimer();
  }

  switch (msg.type) {

    // ── Sign in with email + password ─────────────────────────────────────────
    case "SIGN_IN": {
      const { email, password, masterPassword } = msg;
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const uid = cred.user.uid;
      const key = await deriveKey(masterPassword, uid);
      const valid = await verifyMasterPassword(uid, key);
      if (!valid) {
        await signOut(auth);
        return { ok: false, error: "Incorrect master password." };
      }
      cryptoKey = key;
      currentUid = uid;
      // FIX: Store unlockedAt timestamp so popup can distinguish SW restart from real timeout
      await chrome.storage.session.set({
        uid,
        email: cred.user.email,
        signedIn: true,
        authMethod: "email",
        unlockedAt: Date.now(),
        timedOut: false,
      });
      startKeepAlive();
      resetAutoLockTimer();
      return { ok: true, email: cred.user.email };
    }

    // ── Sign in with Google ───────────────────────────────────────────────────
    case "GOOGLE_SIGN_IN": {
      // FIX: Clear any previous session first to prevent account conflicts
      if (auth.currentUser) {
        await signOut(auth);
      }
      cryptoKey = null;
      currentUid = null;
      await chrome.storage.session.clear();
      stopKeepAlive();

      const idToken = await launchGoogleOAuth();
      const credential = GoogleAuthProvider.credential(idToken);
      const cred = await signInWithCredential(auth, credential);
      const uid = cred.user.uid;
      await chrome.storage.session.set({
        uid,
        email: cred.user.email,
        signedIn: true,
        authMethod: "google",
        needsMasterPassword: true,
        unlockedAt: null,
        timedOut: false,
      });
      return { ok: true, email: cred.user.email, needsMasterPassword: true };
    }

    // ── Check session ────────────────────────────────────────────────────────
    // FIX: Compute whether timeout has genuinely elapsed using the stored
    // unlockedAt timestamp, rather than blindly treating missing cryptoKey
    // as a timeout (which happens on every SW restart).
    case "GET_SESSION": {
      const session = await chrome.storage.session.get([
        "uid", "email", "signedIn", "authMethod",
        "needsMasterPassword", "unlockedAt", "timedOut",
      ]);

      const { lockTimeout } = await chrome.storage.local.get(["lockTimeout"]);
      const timeoutMs = (lockTimeout !== undefined ? lockTimeout : DEFAULT_TIMEOUT) * 60 * 1000;

      const unlockedAt = session.unlockedAt || 0;
      const now = Date.now();

      // A genuine timeout: either flagged explicitly by the alarm, or
      // enough time has elapsed since unlock that we'd expect a lock.
      const genuinelyTimedOut =
        session.timedOut === true ||
        (unlockedAt > 0 && timeoutMs > 0 && now - unlockedAt > timeoutMs);

      // SW restart without timeout: key is gone but timeout hasn't elapsed.
      // In this case we still need the key, so show unlock screen —
      // but we pass swRestart=true so the popup can display a softer message.
      const swRestart = !cryptoKey && !!session.signedIn && !genuinelyTimedOut && !session.needsMasterPassword;

      return {
        ok: !!session.signedIn && !!cryptoKey,
        email: session.email || null,
        hasKey: !!cryptoKey,
        authMethod: session.authMethod || null,
        needsMasterPassword: !!session.needsMasterPassword,
        timedOut: genuinelyTimedOut,
        swRestart,
      };
    }

    // ── Unlock (re-derive key) ───────────────────────────────────────────────
    case "UNLOCK": {
      const { masterPassword } = msg;
      const session = await chrome.storage.session.get(["uid"]);
      if (!session.uid) return { ok: false, error: "Not signed in." };

      // FIX: Verify the session uid matches the current Firebase auth user
      const currentAuthUser = auth.currentUser;
      if (!currentAuthUser || currentAuthUser.uid !== session.uid) {
        // Stale session — force re-sign-in
        await chrome.storage.session.clear();
        cryptoKey = null;
        currentUid = null;
        return { ok: false, error: "Session expired. Please sign in again." };
      }

      const key = await deriveKey(masterPassword, session.uid);
      const valid = await verifyMasterPassword(session.uid, key);
      if (!valid) return { ok: false, error: "Incorrect master password." };
      cryptoKey = key;
      currentUid = session.uid;
      await chrome.storage.session.set({
        needsMasterPassword: false,
        unlockedAt: Date.now(),
        timedOut: false,
      });
      startKeepAlive();
      resetAutoLockTimer();
      return { ok: true };
    }

    // ── Find matches (popup) ─────────────────────────────────────────────────
    case "FIND_MATCHES": {
      if (!cryptoKey || !currentUid) return { ok: false, error: "locked" };
      const entries = await findMatchingEntries(currentUid, msg.domain);
      return { ok: true, entries };
    }

    // ── Check matches (content script inline autofill) ───────────────────────
    case "CHECK_MATCHES": {
      if (!cryptoKey || !currentUid) return { ok: false, error: "locked" };
      const entries = await findMatchingEntries(currentUid, msg.domain);
      return { ok: true, entries, count: entries.length };
    }

    // ── Autofill ─────────────────────────────────────────────────────────────
    case "AUTOFILL": {
      const { tabId, entry } = msg;
      await chrome.tabs.sendMessage(tabId, {
        type: "DO_AUTOFILL",
        username: entry.username,
        password: entry.password,
      });
      return { ok: true };
    }

    // ── Store pending save (from content script before page navigates) ───────
    case "PENDING_SAVE": {
      const tabId = sender?.tab?.id;
      if (!tabId) return { ok: false };
      await storePendingSave(tabId, {
        domain: msg.domain,
        fullUrl: msg.fullUrl,
        username: msg.username,
        password: msg.password,
      });
      return { ok: true };
    }

    // ── Get pending save (content script checks after navigation) ────────────
    // FIX: No longer requires cryptoKey to return the pending save data.
    // The vault-locked check only happens at save time (SAVE_CREDENTIALS).
    // This ensures the "Save to Lockora" banner always appears after login,
    // even if the SW was restarted and needs re-unlocking.
    case "GET_PENDING_SAVE": {
      const tabId = sender?.tab?.id;
      if (!tabId) return { ok: false };

      const pending = await getPendingSave(tabId);
      if (!pending) return { ok: true, pending: null };

      // If vault is unlocked, also deduplicate against existing credentials
      if (cryptoKey && currentUid) {
        const exists = await hasExistingCredentials(currentUid, pending.domain, pending.username);
        if (exists) return { ok: true, pending: null };
      }

      // Return pending regardless of lock state — banner shows,
      // and SAVE_CREDENTIALS will return { error: "locked" } if needed.
      return { ok: true, pending };
    }

    // ── Check if saved ───────────────────────────────────────────────────────
    case "CHECK_SAVED": {
      if (!cryptoKey || !currentUid) return { ok: false, error: "locked" };
      const exists = await hasExistingCredentials(currentUid, msg.domain, msg.username);
      return { ok: true, exists };
    }

    // ── Save credentials ─────────────────────────────────────────────────────
    case "SAVE_CREDENTIALS": {
      if (!cryptoKey || !currentUid) return { ok: false, error: "locked" };
      await saveCredentials(currentUid, msg.domain, msg.fullUrl, msg.username, msg.password);
      return { ok: true };
    }

    // ── Page has form ────────────────────────────────────────────────────────
    case "PAGE_HAS_FORM": {
      return { ok: true };
    }

    // ── Set lock timeout ─────────────────────────────────────────────────────
    case "SET_LOCK_TIMEOUT": {
      await chrome.storage.local.set({ lockTimeout: msg.timeout });
      resetAutoLockTimer();
      return { ok: true };
    }

    // ── Get lock timeout ─────────────────────────────────────────────────────
    case "GET_LOCK_TIMEOUT": {
      const { lockTimeout } = await chrome.storage.local.get(["lockTimeout"]);
      return { ok: true, timeout: lockTimeout !== undefined ? lockTimeout : DEFAULT_TIMEOUT };
    }

    // ── Sign out ─────────────────────────────────────────────────────────────
    case "SIGN_OUT": {
      await signOut(auth);
      await chrome.storage.session.clear();
      await chrome.alarms.clear(autoLockAlarmName);
      stopKeepAlive();
      cryptoKey = null;
      currentUid = null;
      return { ok: true };
    }

    // ── Check if vault meta exists (to detect new vs returning user) ─────────
    case "CHECK_VAULT_EXISTS": {
      const session = await chrome.storage.session.get(["uid"]);
      if (!session.uid) return { ok: false, exists: false };
      try {
        const snap = await getDoc(doc(db, "users", session.uid, "vault", "meta"));
        return { ok: true, exists: snap.exists() };
      } catch {
        return { ok: false, exists: false };
      }
    }

    // ── Get master password hint ──────────────────────────────────────────────
    case "GET_HINT": {
      const session = await chrome.storage.session.get(["uid"]);
      if (!session.uid) return { ok: false, hint: null };
      try {
        const snap = await getDoc(doc(db, "users", session.uid, "vault", "meta"));
        if (!snap.exists()) return { ok: true, hint: null };
        return { ok: true, hint: snap.data().hint || null };
      } catch {
        return { ok: false, hint: null };
      }
    }

    default:
      return { ok: false, error: "Unknown message type" };
  }
}

// ── On tab update — notify content script ────────────────────────────────────
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (
    changeInfo.status === "complete" &&
    tab.url &&
    !tab.url.startsWith("chrome://")
  ) {
    chrome.tabs.sendMessage(tabId, { type: "TAB_READY" }).catch(() => {});
  }
});
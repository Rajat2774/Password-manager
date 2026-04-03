// src/pages/Dashboard.jsx
import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import {
  collection,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp,
  onSnapshot,
} from "firebase/firestore";

// ── Constants & helpers ───────────────────────────────────────────────────────
import { VAULT_TYPES } from "../constants/vault";
import { getTitle, getSub } from "../utils/vault";

// ── Dashboard sub-components ──────────────────────────────────────────────────
import Sidebar from "../components/dashboard/Sidebar";
import VaultModal from "../components/dashboard/VaultModal";
import VaultCard from "../components/dashboard/VaultCard";
import PasswordGenerator from "../components/dashboard/PasswordGenerator";
import AccountSettings from "../components/dashboard/AccountSettings";
import SecuritySettings from "../components/dashboard/SecuritySettings";
import FolderModal from "../components/dashboard/FolderModal";

import {
  PlusIcon,
  SearchIcon,
  ShieldIcon,
  ToolsIcon,
  UserIcon,
  LockIcon,
  LogoutIcon,
  StarIcon,
  FolderIcon,
  TagIcon,
} from "../components/dashboard/Icons";

// ── Mobile Bottom Nav ─────────────────────────────────────────────────────────
function MobileBottomNav({
  activeNav,
  setActiveNav,
  activeSubNav,
  setActiveSubNav,
  onLogout,
}) {
  const [showSettings, setShowSettings] = useState(false);

  const items = [
    {
      key: "vault",
      label: "Vault",
      icon: <ShieldIcon size={20} />,
      onClick: () => {
        setActiveNav("vault");
        setShowSettings(false);
      },
    },
    {
      key: "tools",
      label: "Tools",
      icon: <ToolsIcon size={20} />,
      onClick: () => {
        setActiveNav("tools");
        setShowSettings(false);
      },
    },
    {
      key: "account",
      label: "Account",
      icon: <UserIcon size={20} />,
      onClick: () => {
        setActiveNav("settings");
        setActiveSubNav("account");
        setShowSettings(false);
      },
    },
    {
      key: "security",
      label: "Security",
      icon: <LockIcon size={20} />,
      onClick: () => {
        setActiveNav("settings");
        setActiveSubNav("security");
        setShowSettings(false);
      },
    },
    {
      key: "logout",
      label: "Sign out",
      icon: <LogoutIcon size={20} />,
      onClick: onLogout,
    },
  ];

  const isActive = (key) => {
    if (key === "vault") return activeNav === "vault";
    if (key === "tools") return activeNav === "tools";
    if (key === "account")
      return activeNav === "settings" && activeSubNav === "account";
    if (key === "security")
      return activeNav === "settings" && activeSubNav === "security";
    return false;
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/90 backdrop-blur-xl border-t border-[#e2e8e0] shadow-[0_-4px_20px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-around px-1 py-1.5 safe-bottom">
        {items.map(({ key, label, icon, onClick }) => (
          <button
            key={key}
            onClick={onClick}
            className={`flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl border-none transition-all duration-200 cursor-pointer min-w-0 flex-1
              ${isActive(key) ? "text-[#1a6b3c] bg-[#1a6b3c]/8" : key === "logout" ? "text-red-400/60" : "text-[#8a9a72] bg-transparent"}`}
          >
            {icon}
            <span className="text-[9px] tracking-wide truncate">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

// ── Mobile Filter Bar ─────────────────────────────────────────────────────────
function MobileFilterBar({
  showFavoritesOnly,
  setShowFavoritesOnly,
  activeFolder,
  setActiveFolder,
  activeTag,
  setActiveTag,
  folders,
  allTags,
}) {
  return (
    <div className="flex md:hidden gap-1.5 mb-3 overflow-x-auto scrollbar-hide pb-1">
      <button
        onClick={() => {
          setShowFavoritesOnly(!showFavoritesOnly);
          setActiveFolder("");
          setActiveTag("");
        }}
        className={`flex items-center gap-1 py-1.5 px-3 rounded-full border text-[11px] transition-all cursor-pointer flex-shrink-0 ${
          showFavoritesOnly
            ? "bg-amber-50 border-amber-300/40 text-amber-600"
            : "bg-white border-[#e2e8e0] text-[#6b7c6b]"
        }`}
      >
        <StarIcon size={12} filled={showFavoritesOnly} /> Favorites
      </button>
      {folders.map((f) => (
        <button
          key={f.id}
          onClick={() => {
            setActiveFolder(activeFolder === f.id ? "" : f.id);
            setShowFavoritesOnly(false);
            setActiveTag("");
          }}
          className={`flex items-center gap-1 py-1.5 px-3 rounded-full border text-[11px] transition-all cursor-pointer flex-shrink-0 ${
            activeFolder === f.id
              ? "bg-[#1a6b3c]/8 border-[#1a6b3c]/25 text-[#1a6b3c]"
              : "bg-white border-[#e2e8e0] text-[#6b7c6b]"
          }`}
        >
          <span style={{ color: f.color }}>
            <FolderIcon size={11} />
          </span>{" "}
          {f.name}
        </button>
      ))}
      {allTags.slice(0, 5).map((tag) => (
        <button
          key={tag}
          onClick={() => {
            setActiveTag(activeTag === tag ? "" : tag);
            setShowFavoritesOnly(false);
            setActiveFolder("");
          }}
          className={`py-1.5 px-3 rounded-full border text-[11px] transition-all cursor-pointer flex-shrink-0 ${
            activeTag === tag
              ? "bg-[#1a6b3c]/8 border-[#1a6b3c]/25 text-[#1a6b3c]"
              : "bg-white border-[#e2e8e0] text-[#6b7c6b]"
          }`}
        >
          #{tag}
        </button>
      ))}
    </div>
  );
}

// ── Dashboard ─────────────────────────────────────────────────────────────────
export default function Dashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const cryptoKey = location.state?.cryptoKey;

  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState("all");
  const [activeNav, setActiveNav] = useState("vault");
  const [activeSubNav, setActiveSubNav] = useState("account");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [modal, setModal] = useState(null);
  const [prefillPassword, setPrefillPassword] = useState("");
  const [mounted, setMounted] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState(15);
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 768,
  );
  const timeoutRef = useRef(null);
  const vaultUnsubRef = useRef(null);
  const foldersUnsubRef = useRef(null);

  // ── New state for enhanced features ─────────────────────────────────────
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [folders, setFolders] = useState([]);
  const [activeFolder, setActiveFolder] = useState("");
  const [activeTag, setActiveTag] = useState("");
  const [folderModal, setFolderModal] = useState(null); // null | "new" | folder object


  // ── Responsive breakpoint listener ────────────────────────────────────────
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const handler = (e) => setIsMobile(!e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  // ── Auth guard + live vault subscription ──────────────────────────────────
  useEffect(() => {
    if (!cryptoKey) {
      navigate("/unlock");
      return;
    }
    const unsub = auth.onAuthStateChanged((u) => {
      if (!u) {
        navigate("/");
        return;
      }
      setUser(u);
      if (vaultUnsubRef.current) vaultUnsubRef.current();
      vaultUnsubRef.current = subscribeEntries(u.uid);
      if (foldersUnsubRef.current) foldersUnsubRef.current();
      foldersUnsubRef.current = subscribeFolders(u.uid);
      setTimeout(() => setMounted(true), 60);
    });
    return () => {
      unsub();
      if (vaultUnsubRef.current) vaultUnsubRef.current();
      if (foldersUnsubRef.current) foldersUnsubRef.current();
    };
  }, [cryptoKey]);

  // ── Session timeout → lock vault ──────────────────────────────────────────
  useEffect(() => {
    if (!sessionTimeout) return;
    const reset = () => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(
        () => navigate("/unlock", { replace: true }),
        sessionTimeout * 60 * 1000,
      );
    };
    const events = ["mousemove", "keydown", "click", "scroll", "touchstart"];
    events.forEach((e) => window.addEventListener(e, reset));
    reset();
    return () => {
      events.forEach((e) => window.removeEventListener(e, reset));
      clearTimeout(timeoutRef.current);
    };
  }, [sessionTimeout, navigate]);

  // ── Firestore live sync ───────────────────────────────────────────────────
  const subscribeEntries = (uid) => {
    setLoading(true);
    const unsubscribe = onSnapshot(
      collection(db, "users", uid, "passwords"),
      (snap) => {
        setEntries(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (error) => {
        console.error("Vault sync error:", error);
        setLoading(false);
      },
    );
    return unsubscribe;
  };

  // ── Folders live sync ─────────────────────────────────────────────────────
  const subscribeFolders = (uid) => {
    const unsubscribe = onSnapshot(
      collection(db, "users", uid, "folders"),
      (snap) => {
        setFolders(
          snap.docs
            .map((d) => ({ id: d.id, ...d.data() }))
            .sort((a, b) => (a.name || "").localeCompare(b.name || "")),
        );
      },
      (error) => {
        console.error("Folders sync error:", error);
      },
    );
    return unsubscribe;
  };

  // ── CRUD ──────────────────────────────────────────────────────────────────
  const handleSave = async (data, existingId) => {
    const payload = { ...data, updatedAt: serverTimestamp() };
    if (existingId) {
      await updateDoc(
        doc(db, "users", user.uid, "passwords", existingId),
        payload,
      );
    } else {
      payload.createdAt = serverTimestamp();
      await addDoc(collection(db, "users", user.uid, "passwords"), payload);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this entry?")) return;
    await deleteDoc(doc(db, "users", user.uid, "passwords", id));
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  // ── Favorites toggle ─────────────────────────────────────────────────────
  const handleToggleFavorite = async (entryId, newValue) => {
    await updateDoc(doc(db, "users", user.uid, "passwords", entryId), {
      favorite: newValue,
    });
  };

  // ── Folder CRUD ───────────────────────────────────────────────────────────
  const handleSaveFolder = async (data, existingId) => {
    if (existingId) {
      await updateDoc(doc(db, "users", user.uid, "folders", existingId), data);
    } else {
      await addDoc(collection(db, "users", user.uid, "folders"), {
        ...data,
        createdAt: serverTimestamp(),
      });
    }
  };

  const handleDeleteFolder = async (folderId) => {
    await deleteDoc(doc(db, "users", user.uid, "folders", folderId));
    // Unassign entries from the deleted folder
    const affected = entries.filter((e) => e.folder === folderId);
    for (const entry of affected) {
      await updateDoc(doc(db, "users", user.uid, "passwords", entry.id), {
        folder: "",
      });
    }
    if (activeFolder === folderId) setActiveFolder("");
  };

  // ── Derived data ──────────────────────────────────────────────────────────
  const allTags = useMemo(() => {
    const tagSet = new Set();
    entries.forEach((e) => {
      if (e.tags && Array.isArray(e.tags)) {
        e.tags.forEach((t) => tagSet.add(t));
      }
    });
    return Array.from(tagSet).sort();
  }, [entries]);

  const tagCounts = useMemo(() => {
    const counts = {};
    entries.forEach((e) => {
      if (e.tags && Array.isArray(e.tags)) {
        e.tags.forEach((t) => {
          counts[t] = (counts[t] || 0) + 1;
        });
      }
    });
    return counts;
  }, [entries]);

  const folderCounts = useMemo(() => {
    const counts = {};
    entries.forEach((e) => {
      if (e.folder) {
        counts[e.folder] = (counts[e.folder] || 0) + 1;
      }
    });
    return counts;
  }, [entries]);

  const favCount = useMemo(
    () => entries.filter((e) => e.favorite).length,
    [entries],
  );

  // ── Filtering ─────────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    let result = entries.filter((e) => {
      const matchType = activeType === "all" || e.vaultType === activeType;
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        getTitle(e).toLowerCase().includes(q) ||
        getSub(e).toLowerCase().includes(q) ||
        (e.tags && e.tags.some((t) => t.includes(q)));
      const matchFav = !showFavoritesOnly || e.favorite;
      const matchFolder = !activeFolder || e.folder === activeFolder;
      const matchTag = !activeTag || (e.tags && e.tags.includes(activeTag));
      return matchType && matchSearch && matchFav && matchFolder && matchTag;
    });

    // Sort favorites to top, then by updatedAt
    result.sort((a, b) => {
      if (a.favorite && !b.favorite) return -1;
      if (!a.favorite && b.favorite) return 1;
      const aTime = a.updatedAt?.seconds || a.createdAt?.seconds || 0;
      const bTime = b.updatedAt?.seconds || b.createdAt?.seconds || 0;
      return bTime - aTime;
    });

    return result;
  }, [entries, activeType, search, showFavoritesOnly, activeFolder, activeTag]);

  const counts = Object.fromEntries(
    Object.keys(VAULT_TYPES).map((k) => [
      k,
      entries.filter((e) => e.vaultType === k).length,
    ]),
  );

  const sidebarW = collapsed ? 60 : 250;

  const handleUsePassword = (pw) => {
    setPrefillPassword(pw);
    setModal("new");
    setActiveNav("vault");
  };

  // Active filter label for breadcrumb
  const getActiveFilterLabel = () => {
    if (showFavoritesOnly) return "⭐ Favorites";
    if (activeFolder) {
      const f = folders.find((fl) => fl.id === activeFolder);
      return f ? `📁 ${f.name}` : "Folder";
    }
    if (activeTag) return `🏷️ #${activeTag}`;
    return null;
  };

  const activeFilterLabel = getActiveFilterLabel();

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div
      className={`flex min-h-screen bg-[#eef1e8] transition-opacity duration-400 ${mounted ? "opacity-100" : "opacity-0"}`}
      style={{ fontFamily: "'Inter', sans-serif" }}
    >
      {/* ── Desktop Sidebar (hidden on mobile) ── */}
      <Sidebar
        user={user}
        collapsed={collapsed}
        sidebarW={sidebarW}
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        activeSubNav={activeSubNav}
        setActiveSubNav={setActiveSubNav}
        settingsOpen={settingsOpen}
        setSettingsOpen={setSettingsOpen}
        onLogout={handleLogout}
        // Enhanced features
        favCount={favCount}
        folders={folders}
        allTags={allTags}
        activeFolder={activeFolder}
        setActiveFolder={setActiveFolder}
        activeTag={activeTag}
        setActiveTag={setActiveTag}
        showFavoritesOnly={showFavoritesOnly}
        setShowFavoritesOnly={setShowFavoritesOnly}
        onNewFolder={() => setFolderModal("new")}
        onEditFolder={(f) => setFolderModal(f)}
        tagCounts={tagCounts}
        folderCounts={folderCounts}
      />

      {/* Desktop collapse toggle (hidden on mobile) */}
      <button
        onClick={() => setCollapsed((c) => !c)}
        className="hidden md:flex fixed z-30 w-7 h-7 rounded-full bg-white border border-[#e2e8e0] items-center justify-center text-[10px] text-[#8a9a72] hover:text-[#1a6b3c] hover:border-[#1a6b3c]/30 shadow-sm transition-all duration-300 cursor-pointer"
        style={{ top: 19, left: sidebarW - 14 }}
      >
        {collapsed ? "▶" : "◀"}
      </button>

      {/* ── Main Content ── */}
      <main
        className="flex-1 min-w-0 overflow-x-hidden min-h-screen transition-[margin-left] duration-300 px-4 pt-3 pb-20 md:px-8 md:pt-8 md:pb-8"
        style={{ marginLeft: isMobile ? 0 : sidebarW }}
      >
        {/* Mobile header bar */}
        <div className="flex md:hidden items-center gap-2.5 mb-4 pb-3 border-b border-[#e2e8e0]">
          <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-[#1a6b3c] flex items-center justify-center text-white">
            <ShieldIcon size={16} />
          </span>
          <span className="text-lg font-bold text-[#1a1a2e]">Lockora</span>
        </div>

        {/* Vault */}
        {activeNav === "vault" && (
          <>
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-3">
              <div>
                <div className="text-[22px] md:text-[28px] font-bold text-[#1a1a2e]">
                  {activeFilterLabel || "Your Vault"}
                </div>
                <p className="text-[13px] text-[#6b7c6b] mt-0.5">
                  Plan, organize, and secure your credentials with ease.
                </p>
                {activeFilterLabel && (
                  <button
                    onClick={() => {
                      setShowFavoritesOnly(false);
                      setActiveFolder("");
                      setActiveTag("");
                    }}
                    className="text-[11px] text-[#8a9a72] hover:text-[#1a6b3c] bg-transparent border-none cursor-pointer mt-1 p-0 transition-colors"
                  >
                    ← Back to all items
                  </button>
                )}
              </div>
              <button
                onClick={() => {
                  setPrefillPassword("");
                  setModal("new");
                }}
                className="flex items-center justify-center gap-2 py-2.5 px-5 bg-[#1a6b3c] hover:bg-[#145a31] text-white border-none rounded-xl text-[12px] sm:text-[12px] font-medium tracking-wide transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#1a6b3c]/20 cursor-pointer w-full sm:w-auto"
              >
                <PlusIcon /> Add item
              </button>
            </div>

            {/* Stats — scrollable on mobile */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 md:gap-4 mb-5 md:mb-6">
              <div className="bg-[#1a6b3c] rounded-2xl py-3.5 px-4 md:py-4 md:px-5 text-white relative overflow-hidden">
                <div className="absolute top-0 right-0 w-16 h-16 bg-white/10 rounded-full -translate-y-4 translate-x-4" />
                <div className="text-[22px] md:text-[28px] font-bold leading-none relative z-10">
                  {entries.length}
                </div>
                <div className="text-[10px] md:text-[11px] text-white/70 uppercase tracking-[0.08em] mt-1.5">
                  Total items
                </div>
              </div>
              <div className="bg-white border border-[#e2e8e0] rounded-2xl py-3.5 px-4 md:py-4 md:px-5">
                <div className="text-[22px] md:text-[28px] font-bold text-amber-500 leading-none">
                  {favCount}
                </div>
                <div className="text-[10px] md:text-[11px] text-[#8a9a72] uppercase tracking-[0.08em] mt-1.5">
                  Favorites
                </div>
              </div>
              {Object.entries(VAULT_TYPES).slice(0, 2).map(
                ([k, v]) =>
                  counts[k] > 0 && (
                    <div
                      className="bg-white border border-[#e2e8e0] rounded-2xl py-3.5 px-4 md:py-4 md:px-5"
                      key={k}
                    >
                      <div className="text-[22px] md:text-[28px] font-bold text-[#1a1a2e] leading-none">
                        {counts[k]}
                      </div>
                      <div className="text-[10px] md:text-[11px] text-[#8a9a72] uppercase tracking-[0.08em] mt-1.5 whitespace-nowrap">
                        {v.label}s
                      </div>
                    </div>
                  ),
              )}
            </div>

            {/* Mobile filter bar (folders, tags, favorites) */}
            <MobileFilterBar
              showFavoritesOnly={showFavoritesOnly}
              setShowFavoritesOnly={setShowFavoritesOnly}
              activeFolder={activeFolder}
              setActiveFolder={setActiveFolder}
              activeTag={activeTag}
              setActiveTag={setActiveTag}
              folders={folders}
              allTags={allTags}
            />

            {/* Type filter pills — scrollable on mobile */}
            <div className="flex gap-2 md:gap-2.5 mb-4 md:mb-5 flex-wrap">
              {[
                ["all", "All", filtered.length],
                ...Object.entries(VAULT_TYPES).map(([k, v]) => [
                  k,
                  `${v.icon} ${v.label}`,
                  entries.filter((e) => e.vaultType === k).length,
                ]),
              ].map(([k, label, count]) => (
                <button
                  key={k}
                  onClick={() => setActiveType(k)}
                  className={`flex items-center gap-1.5 py-2 px-4 md:px-4.5 rounded-full border text-[12px] font-medium transition-all duration-200 cursor-pointer flex-shrink-0 whitespace-nowrap ${activeType === k ? "bg-[#1a6b3c] border-[#1a6b3c] text-white shadow-md shadow-[#1a6b3c]/15" : "bg-white border-[#e2e8e0] text-[#5a6a5a] hover:border-[#c5cdb8] hover:text-[#1a1a2e]"}`}
                >
                  {label}{" "}
                  <span
                    className={`text-[10px] rounded-full py-px px-1.5 ${activeType === k ? "bg-white/20 text-white" : "bg-[#f2f5ed] text-[#8a9a72]"}`}
                  >
                    {count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative mb-5 md:mb-6">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8a9a72] pointer-events-none">
                <SearchIcon />
              </span>
              <input
                placeholder="Search your vault…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full py-3 md:py-3.5 pl-11 pr-4 bg-white border border-[#e2e8e0] rounded-2xl text-[13px] text-[#1a1a2e] outline-none placeholder:text-[#a0a8b0] transition-all duration-200 focus:border-[#1a6b3c] focus:shadow-[0_0_0_3px_rgba(26,107,60,0.08)]"
              />
            </div>

            {/* Vault grid */}
            {loading ? (
              <div className="text-center py-16 text-[13px] text-[#8a9a72] tracking-wide">
                <div className="w-8 h-8 border-3 border-[#e2e8e0] border-t-[#1a6b3c] rounded-full animate-spin mx-auto mb-3" />
                Loading vault…
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 md:py-20">
                <div className="text-[36px] md:text-[48px] mb-3.5 opacity-40">
                  {entries.length === 0
                    ? "🔐"
                    : showFavoritesOnly
                      ? "⭐"
                      : "🔍"}
                </div>
                <div className="text-sm md:text-xl font-semibold text-[#1a1a2e] mb-1.5">
                  {entries.length === 0
                    ? "Your vault is empty"
                    : showFavoritesOnly
                      ? "No favorites yet"
                      : "No results"}
                </div>
                <div className="text-[12px] text-[#8a9a72]">
                  {entries.length === 0
                    ? "Add your first item to get started"
                    : showFavoritesOnly
                      ? "Star important entries to see them here"
                      : "Try a different search or filter"}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(300px,1fr))] gap-3 md:gap-4">
                {filtered.map((e) => (
                  <VaultCard
                    key={e.id}
                    entry={e}
                    cryptoKey={cryptoKey}
                    onEdit={setModal}
                    onDelete={handleDelete}
                    onToggleFavorite={handleToggleFavorite}

                    folders={folders}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {/* Tools */}
        {activeNav === "tools" && (
          <PasswordGenerator onUsePassword={handleUsePassword} />
        )}

        {/* Settings */}
        {activeNav === "settings" && activeSubNav === "account" && (
          <AccountSettings user={user} />
        )}
        {activeNav === "settings" && activeSubNav === "security" && (
          <SecuritySettings
            user={user}
            sessionTimeout={sessionTimeout}
            setSessionTimeout={setSessionTimeout}
          />
        )}
      </main>

      {/* ── Mobile Bottom Nav (visible only on mobile) ── */}
      <MobileBottomNav
        activeNav={activeNav}
        setActiveNav={setActiveNav}
        activeSubNav={activeSubNav}
        setActiveSubNav={setActiveSubNav}
        onLogout={handleLogout}
      />

      {/* Vault Modal */}
      {modal && (
        <VaultModal
          entry={modal === "new" ? null : modal}
          onClose={() => {
            setModal(null);
            setPrefillPassword("");
          }}
          onSave={handleSave}
          cryptoKey={cryptoKey}
          prefillPassword={prefillPassword}
          folders={folders}
          allTags={allTags}
        />
      )}

      {/* Folder Modal */}
      {folderModal && (
        <FolderModal
          folder={folderModal === "new" ? null : folderModal}
          onClose={() => setFolderModal(null)}
          onSave={handleSaveFolder}
          onDelete={handleDeleteFolder}
        />
      )}


    </div>
  );
}

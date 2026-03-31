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
import ShareModal from "../components/dashboard/ShareModal";
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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-[#111116]/95 backdrop-blur-xl border-t border-[#1e1e25]">
      <div className="flex items-center justify-around px-1 py-1.5 safe-bottom">
        {items.map(({ key, label, icon, onClick }) => (
          <button
            key={key}
            onClick={onClick}
            className={`flex flex-col items-center gap-0.5 py-2 px-3 rounded-xl border-none transition-all duration-200 cursor-pointer min-w-0 flex-1
              ${isActive(key) ? "text-purple-400 bg-purple-500/10" : key === "logout" ? "text-red-400/60" : "text-[#a0a0b0] bg-transparent"}`}
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
        className={`flex items-center gap-1 py-1.5 px-3 rounded-lg border text-[11px] transition-all cursor-pointer flex-shrink-0 ${
          showFavoritesOnly
            ? "bg-amber-500/15 border-amber-500/30 text-amber-300"
            : "bg-[#141418] border-[#232329] text-[#a0a0b0]"
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
          className={`flex items-center gap-1 py-1.5 px-3 rounded-lg border text-[11px] transition-all cursor-pointer flex-shrink-0 ${
            activeFolder === f.id
              ? "bg-purple-500/15 border-purple-500/30 text-purple-300"
              : "bg-[#141418] border-[#232329] text-[#a0a0b0]"
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
          className={`py-1.5 px-3 rounded-lg border text-[11px] transition-all cursor-pointer flex-shrink-0 ${
            activeTag === tag
              ? "bg-purple-500/15 border-purple-500/30 text-purple-300"
              : "bg-[#141418] border-[#232329] text-[#a0a0b0]"
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
  const [shareModal, setShareModal] = useState(null); // null | entry

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

  const sidebarW = collapsed ? 60 : 240;

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
      className={`flex min-h-screen bg-[#0b0b0f] transition-opacity duration-400 ${mounted ? "opacity-100" : "opacity-0"}`}
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
        className="hidden md:flex fixed z-30 w-6 h-6 rounded-full bg-[#141418] border border-[#232329] items-center justify-center text-[10px] text-[#a0a0b0] hover:text-white hover:border-[#3a3a45] shadow-lg transition-all duration-300 cursor-pointer"
        style={{ top: 19, left: sidebarW - 12 }}
      >
        {collapsed ? "▶" : "◀"}
      </button>

      {/* ── Main Content ── */}
      <main
        className="flex-1 min-w-0 overflow-x-hidden min-h-screen transition-[margin-left] duration-300 px-4 pt-3 pb-20 md:px-8 md:pt-8 md:pb-8"
        style={{ marginLeft: isMobile ? 0 : sidebarW }}
      >
        {/* Mobile header bar */}
        <div className="flex md:hidden items-center gap-2.5 mb-4 pb-3 border-b border-[#1e1e25]">
          <span className="flex-shrink-0 text-purple-400">
            <ShieldIcon size={22} />
          </span>
          <span className="text-lg font-semibold text-white">Lockora</span>
        </div>

        {/* Vault */}
        {activeNav === "vault" && (
          <>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 md:mb-6 gap-3">
              <div>
                <div className="text-[20px] md:text-[26px] font-semibold text-white">
                  {activeFilterLabel || "Your Vault"}
                </div>
                {activeFilterLabel && (
                  <button
                    onClick={() => {
                      setShowFavoritesOnly(false);
                      setActiveFolder("");
                      setActiveTag("");
                    }}
                    className="text-[11px] text-[#a0a0b0] hover:text-purple-300 bg-transparent border-none cursor-pointer mt-0.5 p-0 transition-colors"
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
                className="flex items-center justify-center gap-1.5 py-2.5 px-5 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white border-none rounded-xl text-[12px] sm:text-[11px] uppercase tracking-[0.1em] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-purple-500/20 cursor-pointer w-full sm:w-auto"
              >
                <PlusIcon /> Add item
              </button>
            </div>

            {/* Stats — scrollable on mobile */}
            <div className="flex gap-2 md:gap-3 mb-4 md:mb-6 flex-wrap">
              <div className="bg-[#141418] border border-[#232329] rounded-2xl py-2.5 px-3.5 md:py-3 md:px-5 flex-shrink-0 min-w-[80px]">
                <div className="text-[16px] md:text-[24px] font-semibold text-white leading-none">
                  {entries.length}
                </div>
                <div className="text-[9px] md:text-[10px] text-[#a0a0b0] uppercase tracking-[0.08em] mt-1 whitespace-nowrap">
                  Total items
                </div>
              </div>
              <div className="bg-[#141418] border border-amber-500/15 rounded-2xl py-2.5 px-3.5 md:py-3 md:px-5 flex-shrink-0 min-w-[80px]">
                <div className="text-[16px] md:text-[24px] font-semibold text-amber-300 leading-none">
                  {favCount}
                </div>
                <div className="text-[9px] md:text-[10px] text-[#a0a0b0] uppercase tracking-[0.08em] mt-1 whitespace-nowrap">
                  Favorites
                </div>
              </div>
              {Object.entries(VAULT_TYPES).map(
                ([k, v]) =>
                  counts[k] > 0 && (
                    <div
                      className="bg-[#141418] border border-[#232329] rounded-2xl py-2.5 px-3.5 md:py-3 md:px-5 flex-shrink-0 min-w-[80px]"
                      key={k}
                    >
                      <div className="text-[16px] md:text-[24px] font-semibold text-white leading-none">
                        {counts[k]}
                      </div>
                      <div className="text-[9px] md:text-[10px] text-[#a0a0b0] uppercase tracking-[0.08em] mt-1 whitespace-nowrap">
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
            <div className="flex gap-1.5 md:gap-2 mb-4 md:mb-5 flex-wrap">
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
                  className={`flex items-center gap-1.5 py-1.5 px-3 md:px-3.5 rounded-full border text-[11px] transition-all duration-200 cursor-pointer flex-shrink-0 whitespace-nowrap ${activeType === k ? "bg-purple-500/15 border-purple-500/30 text-purple-300" : "bg-[#141418] border-[#232329] text-[#a0a0b0] hover:border-[#3a3a45] hover:text-white"}`}
                >
                  {label}{" "}
                  <span
                    className={`text-[10px] rounded-full py-px px-1.5 ${activeType === k ? "bg-purple-500/20 text-purple-200" : "bg-[#1a1a20] text-[#a0a0b0]"}`}
                  >
                    {count}
                  </span>
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative mb-5 md:mb-6">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#a0a0b0] pointer-events-none">
                <SearchIcon />
              </span>
              <input
                placeholder="Search your vault…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full py-2.5 md:py-3 pl-10 pr-4 bg-[#141418] border border-[#232329] rounded-xl text-[12px] text-white outline-none placeholder:text-[#a0a0b0] transition-all duration-200 focus:border-purple-500/50 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.08)]"
              />
            </div>

            {/* Vault grid */}
            {loading ? (
              <div className="text-center py-16 text-[12px] text-[#a0a0b0] tracking-wide">
                Loading vault…
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 md:py-20">
                <div className="text-[28px] md:text-[44px] mb-3.5 opacity-35">
                  {entries.length === 0
                    ? "🔐"
                    : showFavoritesOnly
                      ? "⭐"
                      : "🔍"}
                </div>
                <div className="text-xs md:text-xl font-semibold text-white mb-1.5">
                  {entries.length === 0
                    ? "Your vault is empty"
                    : showFavoritesOnly
                      ? "No favorites yet"
                      : "No results"}
                </div>
                <div className="text-[11px] text-[#a0a0b0]">
                  {entries.length === 0
                    ? "Add your first item to get started"
                    : showFavoritesOnly
                      ? "Star important entries to see them here"
                      : "Try a different search or filter"}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(auto-fill,minmax(290px,1fr))] gap-2.5 md:gap-3.5">
                {filtered.map((e) => (
                  <VaultCard
                    key={e.id}
                    entry={e}
                    cryptoKey={cryptoKey}
                    onEdit={setModal}
                    onDelete={handleDelete}
                    onToggleFavorite={handleToggleFavorite}
                    onShare={setShareModal}
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

      {/* Share Modal */}
      {shareModal && (
        <ShareModal
          entry={shareModal}
          cryptoKey={cryptoKey}
          onClose={() => setShareModal(null)}
        />
      )}
    </div>
  );
}

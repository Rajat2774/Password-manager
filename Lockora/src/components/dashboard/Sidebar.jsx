import { useState } from "react";
import {
  ShieldIcon,
  SettingsIcon,
  ToolsIcon,
  ChevronIcon,
  UserIcon,
  LockIcon,
  LogoutIcon,
  StarIcon,
  FolderIcon,
  FolderPlusIcon,
  TagIcon,
} from "./Icons";

// ── Reusable sidebar nav item ─────────────────────────────────────────────────
function SbItem({
  icon,
  label,
  active,
  onClick,
  collapsed,
  children,
  tip,
  count,
  color,
}) {
  return (
    <div className="relative group">
      {collapsed && (
        <div className="hidden group-hover:flex absolute left-[calc(60px+8px)] top-1/2 -translate-y-1/2 bg-[#141418] text-[#a0a0b0] text-[11px] py-1 px-2.5 rounded-lg whitespace-nowrap z-50 border border-[#232329] shadow-lg pointer-events-none">
          {tip || label}
        </div>
      )}
      <button
        onClick={onClick}
        className={`flex items-center gap-2.5 w-full rounded-xl text-[12px] tracking-wide border-none transition-all duration-200 overflow-hidden cursor-pointer
          ${collapsed ? "justify-center py-2.5 px-2.5" : "py-2.5 px-3 text-left"}
          ${active ? "bg-purple-500/10 text-purple-300" : "bg-transparent text-[#a0a0b0] hover:bg-[#1a1a20] hover:text-white"}`}
        style={color ? { color: active ? color : undefined } : undefined}
      >
        <span
          style={
            color && !active
              ? { color: color + "80" }
              : color && active
                ? { color }
                : undefined
          }
        >
          {icon}
        </span>
        <span
          className={`flex-1 transition-opacity duration-200 truncate ${collapsed ? "opacity-0 w-0 overflow-hidden pointer-events-none" : ""}`}
        >
          {label}
        </span>
        {!collapsed && count !== undefined && (
          <span className="text-[10px] text-[#a0a0b0] ml-auto flex-shrink-0">
            {count}
          </span>
        )}
        {!collapsed && children}
      </button>
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
export default function Sidebar({
  user,
  collapsed,
  sidebarW,
  activeNav,
  setActiveNav,
  activeSubNav,
  setActiveSubNav,
  settingsOpen,
  setSettingsOpen,
  onLogout,
  // New props for enhanced features
  favCount = 0,
  folders = [],
  allTags = [],
  activeFolder,
  setActiveFolder,
  activeTag,
  setActiveTag,
  showFavoritesOnly,
  setShowFavoritesOnly,
  onNewFolder,
  onEditFolder,
  tagCounts = {},
  folderCounts = {},
}) {
  const [foldersOpen, setFoldersOpen] = useState(true);
  const [tagsOpen, setTagsOpen] = useState(false);

  return (
    <aside
      className="hidden md:flex fixed top-0 left-0 z-20 min-h-screen bg-[#111116] border-r border-[#1e1e25] flex-col overflow-hidden transition-[width] duration-300 ease-in-out"
      style={{ width: sidebarW }}
    >
      {/* Brand */}
      <div
        className={`border-b border-[#1e1e25] flex items-center gap-2.5 overflow-hidden whitespace-nowrap ${collapsed ? "justify-center px-0 py-5" : "px-4 py-5"}`}
      >
        <span className="flex-shrink-0 text-purple-400">
          <ShieldIcon size={20} />
        </span>
        <span
          className={`text-lg font-semibold text-white transition-all duration-200 overflow-hidden ${collapsed ? "opacity-0 w-0" : ""}`}
        >
          Lockora
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3.5 px-2 overflow-y-auto overflow-x-hidden scrollbar-hide">
        {/* All Items / Vault */}
        <SbItem
          icon={<ShieldIcon size={16} />}
          label="All Items"
          active={
            activeNav === "vault" &&
            !showFavoritesOnly &&
            !activeFolder &&
            !activeTag
          }
          collapsed={collapsed}
          onClick={() => {
            setActiveNav("vault");
            setShowFavoritesOnly?.(false);
            setActiveFolder?.("");
            setActiveTag?.("");
          }}
        />

        {/* Favorites */}
        <SbItem
          icon={<StarIcon size={16} filled={showFavoritesOnly} />}
          label="Favorites"
          active={showFavoritesOnly}
          collapsed={collapsed}
          count={favCount}
          onClick={() => {
            setActiveNav("vault");
            setShowFavoritesOnly?.(!showFavoritesOnly);
            setActiveFolder?.("");
            setActiveTag?.("");
          }}
          color="#fbbf24"
        />

        {/* Folders section */}
        {!collapsed && (
          <>
            <div className="h-px bg-[#1e1e25] my-2 mx-2" />
            <div className="flex items-center justify-between px-3 py-1.5">
              <button
                onClick={() => setFoldersOpen((o) => !o)}
                className="text-[9px] uppercase tracking-[0.14em] text-[#6b6b7b] bg-transparent border-none cursor-pointer hover:text-[#a0a0b0] transition-colors flex items-center gap-1 p-0"
              >
                <ChevronIcon open={foldersOpen} />
                Folders
              </button>
              <button
                onClick={onNewFolder}
                className="bg-transparent border-none p-0.5 rounded cursor-pointer text-[#a0a0b0] hover:text-purple-400 transition-colors"
                title="New folder"
              >
                <FolderPlusIcon size={13} />
              </button>
            </div>
            {foldersOpen && (
              <div className="pl-1">
                {folders.length === 0 ? (
                  <div className="text-[10px] text-[#a0a0b0] px-3 py-1.5">
                    No folders yet
                  </div>
                ) : (
                  folders.map((f) => (
                    <SbItem
                      key={f.id}
                      icon={<FolderIcon size={14} />}
                      label={f.name}
                      active={activeFolder === f.id}
                      collapsed={false}
                      count={folderCounts[f.id] || 0}
                      color={f.color}
                      onClick={() => {
                        setActiveNav("vault");
                        setActiveFolder?.(activeFolder === f.id ? "" : f.id);
                        setActiveTag?.("");
                        setShowFavoritesOnly?.(false);
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditFolder?.(f);
                        }}
                        className="bg-transparent border-none p-0 text-[#a0a0b0] hover:text-[#c0c0c0] cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                        title="Edit folder"
                      >
                        <span className="text-[10px]">✎</span>
                      </button>
                    </SbItem>
                  ))
                )}
              </div>
            )}
          </>
        )}

        {/* Tags section */}
        {!collapsed && (
          <>
            <div className="h-px bg-[#1e1e25] my-2 mx-2" />
            <button
              onClick={() => setTagsOpen((o) => !o)}
              className="text-[9px] uppercase tracking-[0.14em] text-[#6b6b7b] bg-transparent border-none cursor-pointer hover:text-[#a0a0b0] transition-colors flex items-center gap-1 px-3 py-1.5 w-full text-left"
            >
              <ChevronIcon open={tagsOpen} />
              Tags
            </button>
            {tagsOpen && (
              <div className="px-3 py-1 flex flex-wrap gap-1">
                {allTags.length === 0 ? (
                  <div className="text-[10px] text-[#a0a0b0] py-1">
                    No tags yet
                  </div>
                ) : (
                  allTags.map((tag) => (
                    <button
                      key={tag}
                      onClick={() => {
                        setActiveNav("vault");
                        setActiveTag?.(activeTag === tag ? "" : tag);
                        setActiveFolder?.("");
                        setShowFavoritesOnly?.(false);
                      }}
                      className={`text-[10px] py-0.5 px-2 rounded-md border transition-all duration-200 cursor-pointer ${
                        activeTag === tag
                          ? "bg-purple-500/15 border-purple-500/30 text-purple-300"
                          : "bg-[#1a1a20] border-[#1e1e25] text-[#a0a0b0] hover:border-[#3a3a45] hover:text-white]"
                      }`}
                    >
                      #{tag}
                      {tagCounts[tag] > 0 && (
                        <span className="ml-1 text-[9px] opacity-60">
                          {tagCounts[tag]}
                        </span>
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </>
        )}

        <div className="h-px bg-[#1e1e25] my-2 mx-2" />

        {/* Tools */}
        <SbItem
          icon={<ToolsIcon size={16} />}
          label="Tools"
          active={activeNav === "tools"}
          collapsed={collapsed}
          onClick={() => setActiveNav("tools")}
        />

        <div className="h-px bg-[#1e1e25] my-2 mx-2" />
        <div
          className={`text-[9px] uppercase tracking-[0.14em] text-[#6b6b7b] px-3 py-1.5 whitespace-nowrap overflow-hidden transition-all duration-200 ${collapsed ? "opacity-0 h-0 p-0" : ""}`}
        >
          Settings
        </div>

        {/* Settings */}
        <SbItem
          icon={<SettingsIcon size={16} />}
          label="Settings"
          active={activeNav === "settings"}
          collapsed={collapsed}
          onClick={() => {
            setSettingsOpen((o) => !o);
            setActiveNav("settings");
            setActiveSubNav((s) => s || "account");
          }}
        >
          <ChevronIcon open={settingsOpen} />
        </SbItem>

        {settingsOpen && !collapsed && (
          <div className="pl-8">
            <SbItem
              icon={<UserIcon size={13} />}
              label="My Account"
              active={activeNav === "settings" && activeSubNav === "account"}
              collapsed={false}
              onClick={() => {
                setActiveNav("settings");
                setActiveSubNav("account");
              }}
            />
            <SbItem
              icon={<LockIcon size={13} />}
              label="Security"
              active={activeNav === "settings" && activeSubNav === "security"}
              collapsed={false}
              onClick={() => {
                setActiveNav("settings");
                setActiveSubNav("security");
              }}
            />
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="border-t border-[#1e1e25] px-2 py-3 overflow-hidden">
        <div
          className={`px-3 text-[10px] text-[#a0a0b0] mb-1 truncate transition-all duration-200 ${collapsed ? "opacity-0 h-0 p-0 m-0" : ""}`}
        >
          🔑 {user?.email}
        </div>
        <SbItem
          icon={<LogoutIcon />}
          label="Sign out"
          active={false}
          collapsed={collapsed}
          onClick={onLogout}
          tip="Sign out"
        />
      </div>
    </aside>
  );
}

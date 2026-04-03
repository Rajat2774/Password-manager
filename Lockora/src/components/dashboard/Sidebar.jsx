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
        <div className="hidden group-hover:flex absolute left-[calc(60px+8px)] top-1/2 -translate-y-1/2 bg-white text-[#4a5568] text-[11px] py-1.5 px-3 rounded-xl whitespace-nowrap z-50 border border-[#e2e8e0] shadow-lg pointer-events-none">
          {tip || label}
        </div>
      )}
      <button
        onClick={onClick}
        className={`flex items-center gap-2.5 w-full rounded-xl text-[12.5px] tracking-wide border-none transition-all duration-200 overflow-hidden cursor-pointer
          ${collapsed ? "justify-center py-2.5 px-2.5" : "py-2.5 px-3 text-left"}
          ${active ? "bg-[#1a6b3c]/10 text-[#1a6b3c] font-medium" : "bg-transparent text-[#5a6a5a] hover:bg-[#e6ebe0] hover:text-[#1a1a2e]"}`}
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
          <span className="text-[10px] text-[#8a9a72] bg-[#e6ebe0] rounded-full py-0.5 px-2 ml-auto flex-shrink-0">
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
  activeFolder,
  setActiveFolder,
  showFavoritesOnly,
  setShowFavoritesOnly,
  onNewFolder,
  onEditFolder,
  folderCounts = {},
}) {
  const [foldersOpen, setFoldersOpen] = useState(true);

  return (
    <aside
      className="hidden md:flex fixed top-0 left-0 z-20 min-h-screen bg-white/80 backdrop-blur-xl border-r border-[#e2e8e0] flex-col overflow-hidden transition-[width] duration-300 ease-in-out"
      style={{ width: sidebarW }}
    >
      {/* Brand */}
      <div
        className={`border-b border-[#e2e8e0] flex items-center gap-2.5 overflow-hidden whitespace-nowrap ${collapsed ? "justify-center px-0 py-5" : "px-4 py-5"}`}
      >
        <span className="flex-shrink-0 w-8 h-8 rounded-xl bg-[#1a6b3c] flex items-center justify-center text-white">
          <ShieldIcon size={16} />
        </span>
        <span
          className={`text-lg font-bold text-[#1a1a2e] transition-all duration-200 overflow-hidden ${collapsed ? "opacity-0 w-0" : ""}`}
        >
          Lockora
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-3.5 px-2.5 overflow-y-auto overflow-x-hidden scrollbar-hide">
        {/* Section Label */}
        <div
          className={`text-[9px] uppercase tracking-[0.14em] text-[#8a9a72] px-3 py-1.5 whitespace-nowrap overflow-hidden transition-all duration-200 ${collapsed ? "opacity-0 h-0 p-0" : ""}`}
        >
          Menu
        </div>

        {/* All Items / Vault */}
        <SbItem
          icon={<ShieldIcon size={16} />}
          label="All Items"
          active={activeNav === "vault" && !showFavoritesOnly && !activeFolder}
          collapsed={collapsed}
          onClick={() => {
            setActiveNav("vault");
            setShowFavoritesOnly?.(false);
            setActiveFolder?.("");
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
          }}
          color="#d97706"
        />

        {/* Folders section */}
        {!collapsed && (
          <>
            <div className="h-px bg-[#e2e8e0] my-2.5 mx-2" />
            <div className="flex items-center justify-between px-3 py-1.5">
              <button
                onClick={() => setFoldersOpen((o) => !o)}
                className="text-[9px] uppercase tracking-[0.14em] text-[#8a9a72] bg-transparent border-none cursor-pointer hover:text-[#5a6a5a] transition-colors flex items-center gap-1 p-0"
              >
                <ChevronIcon open={foldersOpen} />
                Folders
              </button>
              <button
                onClick={onNewFolder}
                className="bg-transparent border-none p-0.5 rounded cursor-pointer text-[#8a9a72] hover:text-[#1a6b3c] transition-colors"
                title="New folder"
              >
                <FolderPlusIcon size={13} />
              </button>
            </div>
            {foldersOpen && (
              <div className="pl-1">
                {folders.length === 0 ? (
                  <div className="text-[10px] text-[#a0a8b0] px-3 py-1.5">
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
                        setShowFavoritesOnly?.(false);
                      }}
                    >
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditFolder?.(f);
                        }}
                        className="bg-transparent border-none p-0 text-[#8a9a72] hover:text-[#1a6b3c] cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
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

        <div className="h-px bg-[#e2e8e0] my-2.5 mx-2" />

        <div
          className={`text-[9px] uppercase tracking-[0.14em] text-[#8a9a72] px-3 py-1.5 whitespace-nowrap overflow-hidden transition-all duration-200 ${collapsed ? "opacity-0 h-0 p-0" : ""}`}
        >
          General
        </div>

        {/* Tools */}
        <SbItem
          icon={<ToolsIcon size={16} />}
          label="Tools"
          active={activeNav === "tools"}
          collapsed={collapsed}
          onClick={() => setActiveNav("tools")}
        />

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
      <div className="border-t border-[#e2e8e0] px-2.5 py-3 overflow-hidden">
        <div
          className={`px-3 text-[10px] text-[#8a9a72] mb-1 truncate transition-all duration-200 ${collapsed ? "opacity-0 h-0 p-0 m-0" : ""}`}
        >
          {user?.email}
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

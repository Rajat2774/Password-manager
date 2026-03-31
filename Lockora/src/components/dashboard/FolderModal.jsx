// src/components/dashboard/FolderModal.jsx
import { useState } from "react";
import { FolderIcon } from "./Icons";

const FOLDER_COLORS = [
  "#a78bfa", "#60a5fa", "#34d399", "#f472b6", "#fbbf24",
  "#f87171", "#22d3ee", "#c084fc", "#fb923c", "#4ade80",
];

export default function FolderModal({ folder, onClose, onSave, onDelete }) {
  const isEdit = !!folder?.id;
  const [name, setName] = useState(folder?.name || "");
  const [color, setColor] = useState(folder?.color || FOLDER_COLORS[0]);
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await onSave({ name: name.trim(), color }, folder?.id);
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center z-50 md:p-5"
      onClick={onClose}
    >
      <div
        className="bg-[#141418] border border-[#232329] rounded-t-2xl md:rounded-2xl w-full max-w-[400px] overflow-hidden shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-5 mb-4">
          <h2 className="text-lg font-light text-white">
            {isEdit ? "Edit Folder" : "New Folder"}
          </h2>
          <button
            onClick={onClose}
            className="text-[#6b6b7b] hover:text-white text-lg transition-colors bg-transparent border-none cursor-pointer w-8 h-8 rounded-lg hover:bg-[#1e1e25] flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="px-5 flex flex-col gap-4">
            {/* Folder name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-[0.1em] text-[#6b6b7b]">
                Folder name
              </label>
              <input
                type="text"
                placeholder="e.g. Work, Personal, Finance…"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                className="w-full py-2.5 px-3 bg-[#0f0f14] border border-[#232329] rounded-lg text-[12px] text-white outline-none placeholder:text-[#3a3a45] transition-all duration-200 focus:border-purple-500/50 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.08)]"
              />
            </div>

            {/* Color picker */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-[0.1em] text-[#6b6b7b]">
                Color
              </label>
              <div className="flex gap-2 flex-wrap">
                {FOLDER_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="w-7 h-7 rounded-lg border-2 transition-all duration-200 cursor-pointer flex items-center justify-center"
                    style={{
                      backgroundColor: c + "20",
                      borderColor: color === c ? c : "transparent",
                    }}
                  >
                    <FolderIcon size={14} />
                    <style>{`button:hover { opacity: 0.8; }`}</style>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="flex items-center gap-2 py-2 px-3 bg-[#0f0f14] border border-[#1e1e25] rounded-xl">
              <span style={{ color }}>
                <FolderIcon size={16} />
              </span>
              <span className="text-[12px] text-white">
                {name || "Folder name"}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between px-5 py-4">
            <div>
              {isEdit && onDelete && (
                <button
                  type="button"
                  onClick={() => {
                    if (window.confirm("Delete this folder? Entries won't be deleted, just unassigned.")) {
                      onDelete(folder.id);
                      onClose();
                    }
                  }}
                  className="py-2 px-3.5 bg-transparent border border-red-500/30 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded-lg text-[11px] uppercase tracking-[0.1em] transition-all cursor-pointer"
                >
                  Delete
                </button>
              )}
            </div>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-5 bg-transparent border border-[#232329] rounded-lg text-[11px] uppercase tracking-[0.1em] text-[#6b6b7b] hover:border-[#3a3a45] hover:text-white transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !name.trim()}
                className="py-2.5 px-5 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white border-none rounded-lg text-[11px] uppercase tracking-[0.1em] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {saving ? "Saving…" : isEdit ? "Update" : "Create"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

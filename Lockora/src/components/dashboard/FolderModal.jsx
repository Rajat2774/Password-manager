// src/components/dashboard/FolderModal.jsx
import { useState } from "react";
import { FolderIcon } from "./Icons";

const FOLDER_COLORS = [
  "#1a6b3c", "#2563eb", "#0891b2", "#d97706", "#dc2626",
  "#7c3aed", "#db2777", "#059669", "#ea580c", "#4f46e5",
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
      className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-end md:items-center justify-center z-50 md:p-5"
      onClick={onClose}
    >
      <div
        className="bg-white border border-[#e2e8e0] rounded-t-2xl md:rounded-2xl w-full max-w-[400px] overflow-hidden shadow-2xl shadow-black/10"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 pt-5 mb-4">
          <h2 className="text-lg font-bold text-[#1a1a2e]">
            {isEdit ? "Edit Folder" : "New Folder"}
          </h2>
          <button
            onClick={onClose}
            className="text-[#8a9a72] hover:text-[#1a1a2e] text-lg transition-colors bg-transparent border-none cursor-pointer w-8 h-8 rounded-lg hover:bg-[#f2f5ed] flex items-center justify-center"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSave}>
          <div className="px-5 flex flex-col gap-4">
            {/* Folder name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-[0.1em] text-[#8a9a72] font-medium">
                Folder name
              </label>
              <input
                type="text"
                placeholder="e.g. Work, Personal, Finance…"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
                className="w-full py-2.5 px-3.5 bg-white border border-[#d4dcc8] rounded-xl text-[13px] text-[#1a1a2e] outline-none placeholder:text-[#a0a8b0] transition-all duration-200 focus:border-[#1a6b3c] focus:shadow-[0_0_0_3px_rgba(26,107,60,0.1)]"
              />
            </div>

            {/* Color picker */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] uppercase tracking-[0.1em] text-[#8a9a72] font-medium">
                Color
              </label>
              <div className="flex gap-2.5 flex-wrap">
                {FOLDER_COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className="w-8 h-8 rounded-xl border-2 transition-all duration-200 cursor-pointer flex items-center justify-center hover:scale-110"
                    style={{
                      backgroundColor: c + "18",
                      borderColor: color === c ? c : "transparent",
                    }}
                  >
                    <span style={{ color: c }}>
                      <FolderIcon size={14} />
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="flex items-center gap-2 py-2.5 px-3.5 bg-[#f6f8f3] border border-[#e2e8e0] rounded-xl">
              <span style={{ color }}>
                <FolderIcon size={16} />
              </span>
              <span className="text-[13px] text-[#1a1a2e] font-medium">
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
                  className="py-2 px-3.5 bg-transparent border border-red-300 hover:bg-red-50 text-red-500 hover:text-red-600 rounded-xl text-[11px] font-medium tracking-wide transition-all cursor-pointer"
                >
                  Delete
                </button>
              )}
            </div>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-5 bg-transparent border border-[#e2e8e0] rounded-xl text-[12px] font-medium tracking-wide text-[#6b7c6b] hover:border-[#c5cdb8] hover:text-[#1a1a2e] transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !name.trim()}
                className="py-2.5 px-5 bg-[#1a6b3c] hover:bg-[#145a31] text-white border-none rounded-xl text-[12px] font-medium tracking-wide transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
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

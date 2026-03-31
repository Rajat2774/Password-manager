import { useState, useEffect, useRef } from "react";
import { VAULT_TYPES, FIELDS } from "../../constants/vault";
import { encryptEntry, decryptEntry, inputCls, selectCls } from "../../utils/vault";
import { EyeIcon, XCircleIcon, TagIcon, FolderIcon } from "./Icons";

export default function VaultModal({ entry, onClose, onSave, cryptoKey, prefillPassword, folders = [], allTags = [] }) {
  const isEdit = !!entry?.id;
  const [vaultType, setVaultType] = useState(entry?.vaultType || "password");
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [revealed, setRevealed] = useState({});
  const [decrypting, setDecrypting] = useState(isEdit);

  // Folder & tags
  const [selectedFolder, setSelectedFolder] = useState(entry?.folder || "");
  const [tags, setTags] = useState(entry?.tags || []);
  const [tagInput, setTagInput] = useState("");
  const [showTagSuggestions, setShowTagSuggestions] = useState(false);
  const tagInputRef = useRef(null);

  useEffect(() => {
    if (isEdit) {
      decryptEntry(entry, cryptoKey).then((plain) => {
        setForm(plain);
        setDecrypting(false);
      });
    } else {
      const defaults = {};
      FIELDS[vaultType].forEach((f) => {
        defaults[f.key] = "";
      });
      if (vaultType === "password") {
        defaults.category = "Other";
        if (prefillPassword) defaults.password = prefillPassword;
      }
      setForm(defaults);
    }
  }, [vaultType]);

  const handle = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const toggleReveal = (k) => setRevealed((r) => ({ ...r, [k]: !r[k] }));

  // Tag management
  const addTag = (tag) => {
    const cleaned = tag.trim().toLowerCase().replace(/[^a-z0-9_-]/g, "");
    if (cleaned && !tags.includes(cleaned) && tags.length < 10) {
      setTags((t) => [...t, cleaned]);
    }
    setTagInput("");
    setShowTagSuggestions(false);
  };

  const removeTag = (tag) => {
    setTags((t) => t.filter((tt) => tt !== tag));
  };

  const handleTagKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      if (tagInput.trim()) addTag(tagInput);
    } else if (e.key === "Backspace" && !tagInput && tags.length > 0) {
      setTags((t) => t.slice(0, -1));
    }
  };

  // Filter suggestions
  const tagSuggestions = allTags
    .filter((t) => !tags.includes(t) && t.includes(tagInput.toLowerCase()))
    .slice(0, 6);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = await encryptEntry(form, cryptoKey, vaultType);
      // Add folder and tags to payload (stored as plain metadata)
      payload.folder = selectedFolder || "";
      payload.tags = tags;
      await onSave(payload, entry?.id);
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
        className="bg-[#141418] border border-[#232329] rounded-t-2xl md:rounded-2xl w-full max-w-[500px] max-h-[85vh] md:max-h-[90vh] overflow-y-auto overflow-x-hidden shadow-2xl shadow-black/50"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-4 md:px-6 pt-5 md:pt-6 mb-3 md:mb-4">
          <h2 className="text-xl font-light text-white">
            {isEdit ? "Edit entry" : "New entry"}
          </h2>
          <button
            onClick={onClose}
            className="text-[#6b6b7b] hover:text-white text-lg transition-colors bg-transparent border-none cursor-pointer w-8 h-8 rounded-lg hover:bg-[#1e1e25] flex items-center justify-center"
          >
            ✕
          </button>
        </div>
        {!isEdit && (
          <div className="flex gap-1.5 px-4 md:px-6 mb-4 md:mb-5 flex-wrap">
            {Object.entries(VAULT_TYPES).map(([k, v]) => (
              <button
                key={k}
                onClick={() => setVaultType(k)}
                className={`flex items-center gap-1.5 py-1.5 px-3 rounded-lg border text-[11px] transition-all duration-200 cursor-pointer flex-shrink-0 whitespace-nowrap ${vaultType === k ? "bg-purple-500/10 border-purple-500/30 text-purple-300" : "bg-[#1a1a20] border-[#232329] text-[#6b6b7b] hover:border-[#3a3a45] hover:text-[#a0a0b0]"}`}
              >
                {v.icon} {v.label}
              </button>
            ))}
          </div>
        )}
        {decrypting ? (
          <div className="text-center py-10 text-[12px] text-[#4a4a55] tracking-wide">
            Decrypting…
          </div>
        ) : (
          <form onSubmit={handleSave}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 px-4 md:px-6">
              {FIELDS[vaultType].map((f) => (
                <div
                  key={f.key}
                  className={`flex flex-col gap-1.5 ${f.type === "textarea" ? "md:col-span-2" : ""}`}
                >
                  <label className="text-[10px] uppercase tracking-[0.1em] text-[#6b6b7b]">
                    {f.label}
                  </label>
                  {f.type === "select" ? (
                    <select
                      value={form[f.key] || ""}
                      onChange={handle(f.key)}
                      className={selectCls}
                    >
                      {f.options.map((o) => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  ) : f.type === "textarea" ? (
                    <textarea
                      rows={3}
                      placeholder={f.label}
                      value={form[f.key] || ""}
                      onChange={handle(f.key)}
                      className={inputCls}
                    />
                  ) : (
                    <div className="relative">
                      <input
                        type={
                          f.type === "password" && !revealed[f.key]
                            ? "password"
                            : "text"
                        }
                        placeholder={f.label}
                        value={form[f.key] || ""}
                        onChange={handle(f.key)}
                        className={`${inputCls} ${f.type === "password" ? "pr-9" : ""}`}
                      />
                      {f.type === "password" && (
                        <button
                          type="button"
                          onClick={() => toggleReveal(f.key)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#4a4a55] hover:text-[#8b8b9b] bg-transparent border-none flex items-center p-0.5 cursor-pointer"
                        >
                          <EyeIcon open={!!revealed[f.key]} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {/* ── Folder selector ── */}
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] uppercase tracking-[0.1em] text-[#6b6b7b] flex items-center gap-1">
                  <FolderIcon size={10} /> Folder
                </label>
                <select
                  value={selectedFolder}
                  onChange={(e) => setSelectedFolder(e.target.value)}
                  className={selectCls}
                >
                  <option value="">No folder</option>
                  {folders.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* ── Tag input ── */}
              <div className="flex flex-col gap-1.5 md:col-span-2 relative">
                <label className="text-[10px] uppercase tracking-[0.1em] text-[#6b6b7b] flex items-center gap-1">
                  <TagIcon size={10} /> Tags
                </label>
                <div className="flex flex-wrap items-center gap-1.5 min-h-[38px] py-1.5 px-2.5 bg-[#0f0f14] border border-[#232329] rounded-lg transition-all duration-200 focus-within:border-purple-500/50 focus-within:shadow-[0_0_0_3px_rgba(139,92,246,0.08)]">
                  {tags.map((tag) => (
                    <span
                      key={tag}
                      className="flex items-center gap-1 text-[11px] py-0.5 px-2 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20"
                    >
                      #{tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="bg-transparent border-none p-0 cursor-pointer text-purple-400/60 hover:text-purple-300 flex items-center"
                      >
                        <XCircleIcon size={12} />
                      </button>
                    </span>
                  ))}
                  <input
                    ref={tagInputRef}
                    type="text"
                    placeholder={tags.length === 0 ? "Add tags…" : ""}
                    value={tagInput}
                    onChange={(e) => {
                      setTagInput(e.target.value);
                      setShowTagSuggestions(true);
                    }}
                    onKeyDown={handleTagKeyDown}
                    onFocus={() => setShowTagSuggestions(true)}
                    onBlur={() => setTimeout(() => setShowTagSuggestions(false), 150)}
                    className="bg-transparent border-none outline-none text-[12px] text-white placeholder:text-[#3a3a45] flex-1 min-w-[80px] py-0.5"
                  />
                </div>

                {/* Autocomplete dropdown */}
                {showTagSuggestions && tagSuggestions.length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 z-10 bg-[#141418] border border-[#232329] rounded-lg shadow-xl shadow-black/30 overflow-hidden">
                    {tagSuggestions.map((tag) => (
                      <button
                        key={tag}
                        type="button"
                        onMouseDown={(e) => {
                          e.preventDefault();
                          addTag(tag);
                        }}
                        className="w-full text-left py-2 px-3 text-[11px] text-[#a0a0b0] hover:bg-[#1e1e25] hover:text-white bg-transparent border-none cursor-pointer transition-colors"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex gap-2.5 justify-end px-4 md:px-6 py-4 md:py-5">
              <button
                type="button"
                onClick={onClose}
                className="py-2.5 px-5 bg-transparent border border-[#232329] rounded-lg text-[11px] uppercase tracking-[0.1em] text-[#6b6b7b] hover:border-[#3a3a45] hover:text-white transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="py-2.5 px-5 bg-gradient-to-r from-purple-600 to-violet-600 hover:from-purple-500 hover:to-violet-500 text-white border-none rounded-lg text-[11px] uppercase tracking-[0.1em] transition-all duration-300 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {saving ? "Saving…" : isEdit ? "Save changes" : "Add to vault"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

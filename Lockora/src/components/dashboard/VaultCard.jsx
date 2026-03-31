import { useState } from "react";
import { VAULT_TYPES } from "../../constants/vault";
import { getTitle, getSub, decryptEntry } from "../../utils/vault";
import {
  EyeIcon,
  CopyIcon,
  EditIcon,
  TrashIcon,
  StarIcon,
  ShareIcon,
  FolderIcon,
} from "./Icons";

export default function VaultCard({
  entry,
  onEdit,
  onDelete,
  cryptoKey,
  onToggleFavorite,
  onShare,
  folders,
}) {
  const [revealed, setRevealed] = useState(false);
  const [plain, setPlain] = useState(null);
  const [copied, setCopied] = useState("");
  const vt = VAULT_TYPES[entry.vaultType] || VAULT_TYPES.password;
  const isFav = !!entry.favorite;

  // Find folder info
  const folder = entry.folder && folders?.find((f) => f.id === entry.folder);

  const reveal = async () => {
    if (revealed) {
      setRevealed(false);
      setPlain(null);
      return;
    }
    const d = await decryptEntry(entry, cryptoKey);
    setPlain(d);
    setRevealed(true);
  };

  const copy = async (text, label) => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(""), 2000);
  };

  const getSecret = () => {
    if (!plain) return null;
    if (entry.vaultType === "password") return plain.password;
    if (entry.vaultType === "card") return plain.cardNumber;
    if (entry.vaultType === "ssh") return plain.privateKey;
    if (entry.vaultType === "note") return plain.content;
    if (entry.vaultType === "identity")
      return plain.passportNo || plain.nationalId;
    return null;
  };

  const secret = getSecret();

  return (
    <div
      className={`bg-[#141418] border rounded-2xl p-3 md:p-4 transition-all duration-200 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5 overflow-hidden ${
        isFav
          ? "border-amber-500/25 hover:border-amber-500/40 shadow-amber-500/5"
          : "border-[#232329] hover:border-[#2a2a32]"
      }`}
    >
      {/* Header row */}
      <div className="flex items-center gap-2.5 mb-2">
        <div
          className="w-8 h-8 md:w-9 md:h-9 rounded-xl flex items-center justify-center text-sm md:text-base flex-shrink-0"
          style={{ background: vt.color + "15", color: vt.color }}
        >
          {vt.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[12px] md:text-[13px] text-white truncate">
            {getTitle(entry)}
          </div>
          <div className="text-[11px] text-[#a0a0b0] mt-0.5 truncate">
            {getSub(entry) || vt.label}
          </div>
        </div>

        {/* Favorite star */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.(entry.id, !isFav);
          }}
          className={`bg-transparent border-none p-1 rounded-lg flex items-center justify-center transition-all duration-300 cursor-pointer hover:scale-110 ${
            isFav
              ? "text-amber-400 hover:text-amber-300 star-pulse"
              : "text-[#4a4a55] hover:text-[#a0a0b0]"
          }`}
          title={isFav ? "Remove from favorites" : "Add to favorites"}
        >
          <StarIcon size={15} filled={isFav} />
        </button>

        <span
          className="text-[8px] md:text-[9px] uppercase tracking-[0.08em] py-0.5 px-1.5 md:px-2 rounded whitespace-nowrap flex-shrink-0 hidden sm:inline"
          style={{ background: vt.color + "12", color: vt.color }}
        >
          {vt.label}
        </span>
      </div>

      {/* Folder + Tags row */}
      {(folder || (entry.tags && entry.tags.length > 0)) && (
        <div className="flex items-center gap-1.5 mb-2.5 flex-wrap">
          {folder && (
            <span
              className="flex items-center gap-1 text-[10px] py-0.5 px-2 rounded-md"
              style={{ background: folder.color + "12", color: folder.color }}
            >
              <FolderIcon size={10} />
              {folder.name}
            </span>
          )}
          {entry.tags?.map((tag) => (
            <span
              key={tag}
              className="text-[10px] py-0.5 px-2 rounded-md bg-[#1a1a25] text-[#a0a0b0] border border-[#232329]"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Secret row */}
      <div className="flex items-center justify-between bg-[#0f0f14] border border-[#1e1e25] rounded-xl py-2 px-2.5 md:px-3 gap-1">
        <span className="text-[11px] md:text-[12px] text-[#a0a0b0] tracking-wide flex-1 truncate min-w-0">
          {revealed && secret
            ? entry.vaultType === "ssh"
              ? "••• private key stored •••"
              : secret
            : "••••••••••••"}
        </span>
        <div className="flex gap-0.5 flex-shrink-0">
          <button
            className="bg-transparent border-none p-1 md:p-1.5 rounded-lg text-[#a0a0b0] hover:bg-[#1e1e25] hover:text-white flex items-center justify-center transition-all cursor-pointer"
            onClick={reveal}
          >
            <EyeIcon open={revealed} />
          </button>
          {revealed && secret && entry.vaultType !== "note" && (
            <button
              className="bg-transparent border-none p-1 md:p-1.5 rounded-lg text-[#a0a0b0] hover:bg-[#1e1e25] hover:text-white flex items-center justify-center transition-all cursor-pointer"
              onClick={() => copy(secret, "s")}
            >
              {copied === "s" ? (
                <span className="text-[12px] text-emerald-400">✓</span>
              ) : (
                <CopyIcon />
              )}
            </button>
          )}
          <button
            className="bg-transparent border-none p-1 md:p-1.5 rounded-lg text-[#a0a0b0] hover:bg-purple-500/10 hover:text-purple-400 flex items-center justify-center transition-all cursor-pointer"
            onClick={() => onShare?.(entry)}
            title="Share securely"
          >
            <ShareIcon size={14} />
          </button>
          <button
            className="bg-transparent border-none p-1 md:p-1.5 rounded-lg text-[#a0a0b0] hover:bg-[#1e1e25] hover:text-white flex items-center justify-center transition-all cursor-pointer"
            onClick={() => onEdit(entry)}
          >
            <EditIcon />
          </button>
          <button
            className="bg-transparent border-none p-1 md:p-1.5 rounded-lg text-[#a0a0b0] hover:bg-red-500/10 hover:text-red-400 flex items-center justify-center transition-all cursor-pointer"
            onClick={() => onDelete(entry.id)}
          >
            <TrashIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

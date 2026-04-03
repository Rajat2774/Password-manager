import { useState } from "react";
import { VAULT_TYPES } from "../../constants/vault";
import { getTitle, getSub, decryptEntry } from "../../utils/vault";
import {
  EyeIcon,
  CopyIcon,
  EditIcon,
  TrashIcon,
  StarIcon,
  FolderIcon,
} from "./Icons";

export default function VaultCard({
  entry,
  onEdit,
  onDelete,
  cryptoKey,
  onToggleFavorite,

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
      className={`bg-white border rounded-2xl p-3.5 md:p-4.5 transition-all duration-250 hover:shadow-xl hover:shadow-[#1a6b3c]/8 hover:-translate-y-1 overflow-hidden animate-card-enter ${
        isFav
          ? "border-amber-400/40 shadow-amber-400/5"
          : "border-[#e2e8e0] hover:border-[#c5cdb8]"
      }`}
    >
      {/* Header row */}
      <div className="flex items-center gap-2.5 mb-2.5">
        <div
          className="w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center text-sm md:text-base flex-shrink-0"
          style={{ background: vt.color + "15", color: vt.color }}
        >
          {vt.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-[13px] md:text-[14px] font-medium text-[#1a1a2e] truncate">
            {getTitle(entry)}
          </div>
          <div className="text-[11px] text-[#6b7c6b] mt-0.5 truncate">
            {getSub(entry) || vt.label}
          </div>
        </div>

        {/* Favorite star */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleFavorite?.(entry.id, !isFav);
          }}
          className={`bg-transparent border-none p-1.5 rounded-lg flex items-center justify-center transition-all duration-300 cursor-pointer hover:scale-110 ${
            isFav
              ? "text-amber-500 hover:text-amber-400 star-pulse"
              : "text-[#c5cdb8] hover:text-[#8a9a72]"
          }`}
          title={isFav ? "Remove from favorites" : "Add to favorites"}
        >
          <StarIcon size={15} filled={isFav} />
        </button>

        <span
          className="text-[8px] md:text-[9px] uppercase tracking-[0.08em] py-0.5 px-2 md:px-2.5 rounded-full whitespace-nowrap flex-shrink-0 hidden sm:inline font-medium"
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
              className="flex items-center gap-1 text-[10px] py-0.5 px-2 rounded-full font-medium"
              style={{ background: folder.color + "12", color: folder.color }}
            >
              <FolderIcon size={10} />
              {folder.name}
            </span>
          )}
          {entry.tags?.map((tag) => (
            <span
              key={tag}
              className="text-[10px] py-0.5 px-2 rounded-full bg-[#f2f5ed] text-[#5a6a5a] border border-[#e2e8e0]"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Secret row */}
      <div className="flex items-center justify-between bg-[#f6f8f3] border border-[#e2e8e0] rounded-xl py-2 px-3 md:px-3.5 gap-1">
        <span className="text-[11px] md:text-[12px] text-[#6b7c6b] tracking-wide flex-1 truncate min-w-0 font-mono">
          {revealed && secret
            ? entry.vaultType === "ssh"
              ? "••• private key stored •••"
              : secret
            : "••••••••••••"}
        </span>
        <div className="flex gap-0.5 flex-shrink-0">
          <button
            className="bg-transparent border-none p-1.5 md:p-2 rounded-lg text-[#8a9a72] hover:bg-[#e6ebe0] hover:text-[#1a6b3c] flex items-center justify-center transition-all cursor-pointer"
            onClick={reveal}
          >
            <EyeIcon open={revealed} />
          </button>
          {revealed && secret && entry.vaultType !== "note" && (
            <button
              className="bg-transparent border-none p-1.5 md:p-2 rounded-lg text-[#8a9a72] hover:bg-[#e6ebe0] hover:text-[#1a6b3c] flex items-center justify-center transition-all cursor-pointer"
              onClick={() => copy(secret, "s")}
            >
              {copied === "s" ? (
                <span className="text-[12px] text-emerald-500">✓</span>
              ) : (
                <CopyIcon />
              )}
            </button>
          )}

          <button
            className="bg-transparent border-none p-1.5 md:p-2 rounded-lg text-[#8a9a72] hover:bg-[#e6ebe0] hover:text-[#1a6b3c] flex items-center justify-center transition-all cursor-pointer"
            onClick={() => onEdit(entry)}
          >
            <EditIcon />
          </button>
          <button
            className="bg-transparent border-none p-1.5 md:p-2 rounded-lg text-[#8a9a72] hover:bg-red-50 hover:text-red-500 flex items-center justify-center transition-all cursor-pointer"
            onClick={() => onDelete(entry.id)}
          >
            <TrashIcon />
          </button>
        </div>
      </div>
    </div>
  );
}

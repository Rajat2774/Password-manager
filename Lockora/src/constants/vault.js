// ── Vault types ───────────────────────────────────────────────────────────────
export const VAULT_TYPES = {
  password: { label: "Password", icon: "🔑", color: "#a78bfa" },
  card: { label: "Card", icon: "💳", color: "#60a5fa" },
  identity: { label: "Identity", icon: "🪪", color: "#34d399" },
  note: { label: "Secure Note", icon: "📝", color: "#c084fc" },
  ssh: { label: "SSH Key", icon: "⌨️", color: "#22d3ee" },
};

export const CATEGORIES = ["All", "Social", "Finance", "Work", "Shopping", "Other"];

// ── Field definitions per vault type ──────────────────────────────────────────
export const FIELDS = {
  password: [
    { key: "site", label: "Site / App", type: "text", plain: true },
    { key: "url", label: "URL", type: "text", plain: true },
    {
      key: "category",
      label: "Category",
      type: "select",
      plain: true,
      options: CATEGORIES.filter((c) => c !== "All"),
    },
    { key: "username", label: "Username / Email", type: "text", plain: true },
    { key: "password", label: "Password", type: "password", plain: false },
    { key: "notes", label: "Notes", type: "textarea", plain: false },
  ],
  card: [
    { key: "cardName", label: "Card nickname", type: "text", plain: true },
    { key: "cardHolder", label: "Cardholder name", type: "text", plain: false },
    { key: "cardNumber", label: "Card number", type: "text", plain: false },
    { key: "expiry", label: "Expiry (MM/YY)", type: "text", plain: false },
    { key: "cvv", label: "CVV", type: "password", plain: false },
    { key: "pin", label: "PIN", type: "password", plain: false },
    { key: "notes", label: "Notes", type: "textarea", plain: false },
  ],
  identity: [
    { key: "fullName", label: "Full name", type: "text", plain: true },
    { key: "dob", label: "Date of birth", type: "text", plain: false },
    { key: "passportNo", label: "Passport no.", type: "text", plain: false },
    { key: "nationalId", label: "National ID", type: "text", plain: false },
    { key: "address", label: "Address", type: "textarea", plain: false },
    { key: "phone", label: "Phone", type: "text", plain: false },
    { key: "notes", label: "Notes", type: "textarea", plain: false },
  ],
  note: [
    { key: "title", label: "Title", type: "text", plain: true },
    { key: "content", label: "Content", type: "textarea", plain: false },
  ],
  ssh: [
    { key: "label", label: "Label", type: "text", plain: true },
    { key: "host", label: "Host / IP", type: "text", plain: true },
    { key: "username", label: "Username", type: "text", plain: false },
    { key: "privateKey", label: "Private key", type: "textarea", plain: false },
    { key: "passphrase", label: "Passphrase", type: "password", plain: false },
    { key: "notes", label: "Notes", type: "textarea", plain: false },
  ],
};

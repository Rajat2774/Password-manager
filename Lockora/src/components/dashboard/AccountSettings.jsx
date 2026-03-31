import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { db } from "../../firebase";
import {
  deleteUser,
  EmailAuthProvider,
  reauthenticateWithCredential,
  GoogleAuthProvider,
  reauthenticateWithPopup,
} from "firebase/auth";
import { collection, getDocs, deleteDoc } from "firebase/firestore";
import { inputCls } from "../../utils/vault";
import { EyeIcon } from "./Icons";

export default function AccountSettings({ user }) {
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [deletePass, setDeletePass] = useState("");
  const [showDeletePass, setShowDeletePass] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [err, setErr] = useState("");

  const isGoogleUser = user?.providerData?.some(
    (p) => p.providerId === "google.com",
  );

  const getFriendlyError = (code) => {
    switch (code) {
      case "auth/wrong-password":
      case "auth/invalid-credential":
        return "Incorrect password. Please try again.";
      case "auth/too-many-requests":
        return "Too many attempts. Please wait a moment.";
      case "auth/requires-recent-login":
        return "Session expired. Sign out and sign back in.";
      case "auth/popup-closed-by-user":
        return "Google sign-in was cancelled.";
      default:
        return "Something went wrong. Please try again.";
    }
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    setErr("");
    setDeleting(true);
    try {
      if (isGoogleUser) {
        const provider = new GoogleAuthProvider();
        await reauthenticateWithPopup(user, provider);
      } else {
        if (!deletePass) {
          setErr("Please enter your password.");
          setDeleting(false);
          return;
        }
        const cred = EmailAuthProvider.credential(user.email, deletePass);
        await reauthenticateWithCredential(user, cred);
      }
      const snap = await getDocs(
        collection(db, "users", user.uid, "passwords"),
      );
      await Promise.all(snap.docs.map((d) => deleteDoc(d.ref)));
      await deleteUser(user);
      navigate("/");
    } catch (e) {
      setErr(getFriendlyError(e.code));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="w-full max-w-[600px] px-1 sm:px-0">
      <h2 className="text-[22px] md:text-[26px] font-light text-white mb-4 md:mb-6">
        My Account
      </h2>

      {/* Account info */}
      <div className="bg-[#141418] border border-[#232329] rounded-2xl p-4 md:p-5 mb-4">
        {[
          ["Email", user?.email],
          ["Sign-in method", isGoogleUser ? "Google" : "Email / Password"],
          [
            "Account created",
            user?.metadata?.creationTime
              ? new Date(user.metadata.creationTime).toLocaleDateString()
              : "—",
          ],
          [
            "Last sign-in",
            user?.metadata?.lastSignInTime
              ? new Date(user.metadata.lastSignInTime).toLocaleDateString()
              : "—",
          ],
        ].map(([label, val]) => (
          <div
            className="flex flex-col sm:flex-row sm:items-center justify-between py-2.5 border-b border-[#1e1e25] last:border-b-0 last:pb-0 gap-0.5"
            key={label}
          >
            <div>
              <div className="text-[11px] uppercase tracking-[0.06em] text-[#a0a0b0] mb-0.5">
                {label}
              </div>
              <div className="text-[12px] md:text-[13px] text-white break-all">
                {val}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Delete account */}
      <div className="bg-[#141418] border border-red-500/20 rounded-2xl p-4 md:p-5">
        <div className="text-[13px] text-red-400 mb-1.5">⚠ Delete account</div>

        {step === 1 && (
          <>
            <div className="text-[11px] text-[#a0a0b0] leading-relaxed mb-5">
              This permanently deletes your account and{" "}
              <span className="text-[#6b6b7b]">all vault data</span> —
              passwords, cards, identities, notes, and SSH keys. This action
              cannot be undone.
            </div>
            <button
              onClick={() => {
                setStep(2);
                setErr("");
              }}
              className="py-2.5 px-5 bg-transparent border border-red-500/30 hover:bg-red-500/10 text-red-400 hover:text-red-300 rounded-lg text-[11px] uppercase tracking-[0.1em] transition-all cursor-pointer"
            >
              Delete my account
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <div className="text-[11px] text-[#a0a0b0] leading-relaxed mb-4">
              {isGoogleUser
                ? "Verify your identity to proceed. A Google sign-in popup will appear."
                : "Enter your password to verify your identity and permanently delete your account."}
            </div>
            <form onSubmit={handleDelete} className="flex flex-col gap-3">
              {!isGoogleUser && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] uppercase tracking-[0.1em] text-[#a0a0b0]">
                    Your password
                  </label>
                  <div className="relative">
                    <input
                      type={showDeletePass ? "text" : "password"}
                      placeholder="Enter your password to confirm"
                      value={deletePass}
                      onChange={(e) => setDeletePass(e.target.value)}
                      autoFocus
                      className={`${inputCls} pr-9`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowDeletePass((s) => !s)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#a0a0b0] hover:text-white bg-transparent border-none flex items-center p-0.5 cursor-pointer"
                    >
                      <EyeIcon open={showDeletePass} />
                    </button>
                  </div>
                </div>
              )}
              {err && (
                <div className="text-[11px] text-red-400 py-2 px-3 bg-red-500/[0.06] border border-red-500/20 rounded-lg">
                  {err}
                </div>
              )}
              <div className="flex gap-2.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setErr("");
                    setDeletePass("");
                    setShowDeletePass(false);
                  }}
                  className="py-2.5 px-4 bg-transparent border border-[#232329] hover:border-[#3a3a45] text-[#a0a0b0] hover:text-white rounded-lg text-[11px] uppercase tracking-[0.1em] transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={deleting}
                  className="py-2.5 px-5 bg-red-600 hover:bg-red-700 text-white border-none rounded-lg text-[11px] uppercase tracking-[0.1em] transition-all disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                  {deleting ? "Deleting…" : "Permanently delete account"}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

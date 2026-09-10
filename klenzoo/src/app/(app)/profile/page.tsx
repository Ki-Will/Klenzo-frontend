"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/auth-context";
import { auth as authApi } from "@/lib/api";

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.name ?? "");
      setPhone(user.phone ?? "");
    }
  }, [user]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);
    try {
      await authApi.updateProfile({ name, phone });
      await refreshUser();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingAvatar(true);
    setError("");
    try {
      await authApi.uploadAvatar(file);
      await refreshUser();
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to upload avatar");
    } finally {
      setUploadingAvatar(false);
    }
  }

  return (
    <main className="px-6 lg:px-12 py-6 min-h-screen relative">
      {/* Ambient glow */}
      <div className="glow-orb glow-orb-primary glass-pulse absolute -top-20 -left-20 w-72 h-72 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-2xl mx-auto space-y-8 relative z-10">
        <div>
          <span className="text-primary uppercase tracking-[0.3em] text-[10px] mb-2 block">Account</span>
          <h1 className="text-5xl font-headline font-extrabold tracking-tighter text-on-surface">Profile</h1>
        </div>

        {/* Avatar */}
        <div className="glass-panel flex flex-col items-center py-8 rounded-2xl">
          <div className="relative mb-4">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center overflow-hidden glass-panel"
              style={{ boxShadow: "0 0 0 4px rgba(90,77,255,0.15)" }}
            >
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                <img
                  src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || user?.email?.split("@")[0] || "User")}&background=353534&color=c7c4d8&size=256`}
                  alt="Default Avatar"
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <label
              className={`absolute bottom-0 right-0 w-8 h-8 glass-btn-primary rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform ${uploadingAvatar ? "opacity-50 pointer-events-none" : ""}`}
            >
              <span className="material-symbols-outlined text-white text-sm">
                {uploadingAvatar ? "hourglass_empty" : "edit"}
              </span>
              <input type="file" className="hidden" accept="image/*" onChange={handleAvatarChange} disabled={uploadingAvatar} />
            </label>
          </div>
          <h2 className="text-2xl font-headline font-bold">{user?.name ?? user?.email?.split("@")[0] ?? "User"}</h2>
          <p className="text-primary text-sm">{user?.email}</p>
          <div className="flex gap-3 mt-4">
            <span className="glass-badge px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              {user?.role ?? "USER"}
            </span>
            <span className="glass-badge px-4 py-1.5 text-xs font-bold uppercase tracking-wider text-primary">
              {user?.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSave} className="glass-panel rounded-2xl p-8 space-y-6">
          <h3 className="font-headline font-bold text-lg">Edit Profile</h3>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold mb-2 block" style={{ color: "var(--c-text-secondary)" }}>
                Display Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="glass-input w-full px-4 py-3 text-sm"
              />
            </div>
            <div>
              <label className="text-xs font-semibold mb-2 block" style={{ color: "var(--c-text-secondary)" }}>
                Phone Number
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="glass-input w-full px-4 py-3 text-sm"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 bg-error-container/20 border border-error/20 rounded-2xl px-4 py-3">
              <span className="material-symbols-outlined text-error text-sm">error</span>
              <p className="text-error text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 bg-success/10 border border-success/20 rounded-2xl px-4 py-3">
              <span className="material-symbols-outlined text-success text-sm">check_circle</span>
              <p className="text-success text-sm">Profile updated successfully</p>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="glass-btn-primary w-full py-3 text-sm font-bold text-white disabled:opacity-50 cursor-pointer"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </form>
      </div>
    </main>
  );
}

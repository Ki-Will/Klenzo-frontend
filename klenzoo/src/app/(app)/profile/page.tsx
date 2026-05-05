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

  return (
    <main className="px-6 lg:px-12 py-6 min-h-screen">
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <span className="text-[#c3c0ff] uppercase tracking-[0.3em] text-[10px] mb-2 block">Account</span>
          <h1 className="text-5xl font-headline font-extrabold tracking-tighter text-[#e5e2e1]">Profile</h1>
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center py-8 bg-[#1c1b1b] rounded-2xl">
          <div className="relative mb-4">
            <div className="w-24 h-24 rounded-full bg-[#353534] flex items-center justify-center ring-4 ring-[#4f46e5]/20">
              <span className="material-symbols-outlined text-5xl text-[#c7c4d8]">account_circle</span>
            </div>
            <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#4f46e5] rounded-full flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-sm">edit</span>
            </button>
          </div>
          <h2 className="text-2xl font-headline font-bold">{user?.name ?? user?.email?.split("@")[0] ?? "User"}</h2>
          <p className="text-[#c3c0ff] text-sm">{user?.email}</p>
          <div className="flex gap-3 mt-4">
            <span className="px-4 py-1.5 bg-[#2a2a2a] rounded-full text-xs font-bold uppercase tracking-wider text-[#c7c4d8]">
              {user?.isActive ? "Active" : "Inactive"}
            </span>
            <span className="px-4 py-1.5 bg-[#c3c0ff]/10 rounded-full text-xs font-bold uppercase tracking-wider text-[#c3c0ff]">
              Verified
            </span>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} className="bg-[#1c1b1b] rounded-2xl p-8 space-y-6">
          <h3 className="font-headline font-bold text-lg">Personal Information</h3>

          {[
            { label: "Full Name", value: name, onChange: setName, icon: "person", type: "text", placeholder: "Your name" },
            { label: "Email", value: user?.email ?? "", onChange: () => {}, icon: "mail", type: "email", placeholder: "", disabled: true },
            { label: "Phone", value: phone, onChange: setPhone, icon: "phone", type: "tel", placeholder: "+1 (555) 000-0000" },
          ].map((field) => (
            <div key={field.label} className="space-y-2">
              <label className="text-xs font-semibold text-[#c7c4d8] uppercase tracking-widest">{field.label}</label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-4 text-[#918fa1]">{field.icon}</span>
                <input
                  type={field.type}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.value)}
                  placeholder={field.placeholder}
                  disabled={field.disabled}
                  className="w-full bg-[#0e0e0e] border-none rounded-2xl py-4 pl-12 pr-4 text-[#e5e2e1] focus:outline-none focus:ring-1 focus:ring-[#c3c0ff] transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          ))}

          {error && (
            <div className="flex items-center gap-2 bg-[#93000a]/20 border border-[#ffb4ab]/20 rounded-2xl px-4 py-3">
              <span className="material-symbols-outlined text-[#ffb4ab] text-sm">error</span>
              <p className="text-[#ffb4ab] text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="flex items-center gap-2 bg-emerald-900/20 border border-emerald-400/20 rounded-2xl px-4 py-3">
              <span className="material-symbols-outlined text-emerald-400 text-sm">check_circle</span>
              <p className="text-emerald-400 text-sm">Profile updated successfully.</p>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="w-full py-4 luminous-gradient text-white font-headline font-bold rounded-full shadow-[0_10px_30px_rgba(79,70,229,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save Changes"}
          </button>
        </form>

        {/* Last login */}
        {user?.lastLogin && (
          <p className="text-center text-xs text-[#c7c4d8]/50">
            Last login: {new Date(user.lastLogin).toLocaleString()}
          </p>
        )}
      </div>
    </main>
  );
}

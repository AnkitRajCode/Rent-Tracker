"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Lock, CheckCircle2, Loader2 } from "lucide-react";

export default function ChangePasswordForm() {
  const supabase = createClient();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (newPassword.length < 6) {
      setError("New password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match.");
      return;
    }

    setLoading(true);

    // Verify current password by re-authenticating
    const { data: { user } } = await supabase.auth.getUser();
    if (!user?.email) {
      setError("Unable to verify user.");
      setLoading(false);
      return;
    }

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    });

    if (signInError) {
      setError("Current password is incorrect.");
      setLoading(false);
      return;
    }

    // Update to new password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => setSuccess(false), 4000);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="current_password" className="text-xs font-mono tracking-widest uppercase text-[#94A3B8]">
          Current Password
        </label>
        <div className="flex items-center gap-2 bg-[#0F1115] border border-white/10 rounded-xl px-4 py-3 focus-within:border-[#EA580C]/60 focus-within:shadow-[0_0_0_3px_rgba(234,88,12,0.15)] transition-all">
          <Lock className="w-4 h-4 text-[#94A3B8] flex-shrink-0" />
          <input
            id="current_password"
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="flex-1 bg-transparent text-white text-sm placeholder-[#4A5568] outline-none"
            autoComplete="current-password"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="new_password" className="text-xs font-mono tracking-widest uppercase text-[#94A3B8]">
          New Password
        </label>
        <div className="flex items-center gap-2 bg-[#0F1115] border border-white/10 rounded-xl px-4 py-3 focus-within:border-[#EA580C]/60 focus-within:shadow-[0_0_0_3px_rgba(234,88,12,0.15)] transition-all">
          <Lock className="w-4 h-4 text-[#94A3B8] flex-shrink-0" />
          <input
            id="new_password"
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Min. 6 characters"
            required
            minLength={6}
            className="flex-1 bg-transparent text-white text-sm placeholder-[#4A5568] outline-none"
            autoComplete="new-password"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <label htmlFor="confirm_password" className="text-xs font-mono tracking-widest uppercase text-[#94A3B8]">
          Confirm New Password
        </label>
        <div className="flex items-center gap-2 bg-[#0F1115] border border-white/10 rounded-xl px-4 py-3 focus-within:border-[#EA580C]/60 focus-within:shadow-[0_0_0_3px_rgba(234,88,12,0.15)] transition-all">
          <Lock className="w-4 h-4 text-[#94A3B8] flex-shrink-0" />
          <input
            id="confirm_password"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter new password"
            required
            minLength={6}
            className="flex-1 bg-transparent text-white text-sm placeholder-[#4A5568] outline-none"
            autoComplete="new-password"
          />
        </div>
      </div>

      {error && (
        <p className="text-red-400 text-sm font-mono bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      {success && (
        <p className="text-[#22c55e] text-sm font-mono bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-lg px-3 py-2 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          Password changed successfully!
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-2 h-10 px-6 rounded-full bg-gradient-to-r from-[#EA580C] to-[#F7931A] text-white text-sm font-semibold uppercase tracking-wider shadow-[0_0_20px_-5px_rgba(234,88,12,0.5)] hover:shadow-[0_0_30px_-5px_rgba(247,147,26,0.6)] hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Lock className="w-4 h-4" />
        )}
        {loading ? "Updating..." : "Change Password"}
      </button>
    </form>
  );
}

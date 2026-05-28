"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import Image from "next/image";
import { Mail, Lock, Loader2, UserPlus, LogIn, ArrowLeft } from "lucide-react";

type Mode = "signin" | "signup" | "forgot";

export default function LoginPage() {
  const supabase = createClient();
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    if (mode === "forgot") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/login?mode=reset`,
      });
      setLoading(false);
      if (error) {
        setError(error.message);
      } else {
        setMessage("Password reset link sent! Check your email.");
      }
      return;
    }

    if (mode === "signin") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) {
        setError(error.message);
      } else {
        window.location.href = "/dashboard";
      }
    } else {
      const { data, error } = await supabase.auth.signUp({ email, password });
      setLoading(false);
      if (error) {
        if (
          error.message.toLowerCase().includes("already registered") ||
          error.message.toLowerCase().includes("already exists") ||
          error.message.toLowerCase().includes("user already") ||
          error.status === 422
        ) {
          setError("An account with this email already exists. Please sign in instead.");
          setMode("signin");
        } else {
          setError(error.message);
        }
      } else if (data?.user?.identities?.length === 0) {
        // Supabase returns a fake user with no identities when email already exists
        setError("An account with this email already exists. Please sign in instead.");
        setMode("signin");
      } else {
        setMessage("Account created! Check your email to confirm, then sign in.");
        setMode("signin");
      }
    }
  }

  return (
    <div className="relative min-h-screen bg-[#030304] flex items-center justify-center overflow-hidden px-4">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundSize: "50px 50px",
          backgroundImage:
            "linear-gradient(to right, rgba(30,41,59,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(30,41,59,0.5) 1px, transparent 1px)",
          maskImage:
            "radial-gradient(circle at center, black 40%, transparent 100%)",
        }}
      />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#F7931A] opacity-5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-[0_0_30px_-5px_rgba(247,147,26,0.6)] mb-4">
            <Image src="/rent_logo.png" alt="RentTracker" width={44} height={44} />
          </div>
          <h1 className="font-heading text-2xl font-bold text-white tracking-tight">
            Rent<span className="bg-gradient-to-r from-[#F7931A] to-[#FFD600] bg-clip-text text-transparent">Tracker</span>
          </h1>
          <p className="text-[#94A3B8] text-sm mt-1 font-mono tracking-wider uppercase">
            Owner Portal
          </p>
        </div>

        <div className="bg-[#0F1115] border border-white/10 rounded-2xl p-8 shadow-[0_0_50px_-10px_rgba(247,147,26,0.1)]">
          <div className="flex gap-1 bg-black/40 rounded-xl p-1 mb-6">
            {mode === "forgot" ? (
              <button
                type="button"
                onClick={() => { setMode("signin"); setError(""); setMessage(""); }}
                className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs font-mono tracking-wider uppercase transition-all text-[#94A3B8] hover:text-white"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Sign In
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => { setMode("signin"); setError(""); setMessage(""); }}
                  className={`flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs font-mono tracking-wider uppercase transition-all ${
                    mode === "signin"
                      ? "bg-gradient-to-r from-[#EA580C] to-[#F7931A] text-white shadow-[0_0_15px_-3px_rgba(234,88,12,0.5)]"
                      : "text-[#94A3B8] hover:text-white"
                  }`}
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => { setMode("signup"); setError(""); setMessage(""); }}
                  className={`cursor-pointer flex-1 flex items-center justify-center gap-1.5 h-9 rounded-lg text-xs font-mono tracking-wider uppercase transition-all ${
                    mode === "signup"
                      ? "bg-gradient-to-r from-[#EA580C] to-[#F7931A] text-white shadow-[0_0_15px_-3px_rgba(234,88,12,0.5)]"
                      : "text-[#94A3B8] hover:text-white"
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5" />
                  Sign Up
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#EA580C]/20 border border-[#EA580C]/50 flex items-center justify-center">
              {mode === "signup"
                ? <UserPlus className="w-5 h-5 text-[#F7931A]" />
                : <Mail className="w-5 h-5 text-[#F7931A]" />
              }
            </div>
            <div>
              <h2 className="font-heading font-semibold text-white text-lg">
                {mode === "forgot" ? "Reset Password" : mode === "signin" ? "Welcome back" : "Create account"}
              </h2>
              <p className="text-[#94A3B8] text-xs">
                {mode === "forgot"
                  ? "Enter your email to receive a reset link"
                  : mode === "signin"
                    ? "Sign in with your email and password"
                    : "Register as the property owner"}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-mono tracking-wider uppercase text-[#94A3B8] mb-1.5">
                Email Address
              </label>
              <div className="flex items-center gap-2 bg-black/50 border-b-2 border-white/20 focus-within:border-[#F7931A] focus-within:shadow-[0_10px_20px_-10px_rgba(247,147,26,0.3)] transition-all rounded-t-lg px-4 h-12">
                <Mail className="w-4 h-4 text-[#94A3B8] flex-shrink-0" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="owner@example.com"
                  className="flex-1 bg-transparent text-white text-sm placeholder:text-white/30 outline-none"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {mode !== "forgot" && (
            <div>
              <label className="block text-xs font-mono tracking-wider uppercase text-[#94A3B8] mb-1.5">
                Password
              </label>
              <div className="flex items-center gap-2 bg-black/50 border-b-2 border-white/20 focus-within:border-[#F7931A] focus-within:shadow-[0_10px_20px_-10px_rgba(247,147,26,0.3)] transition-all rounded-t-lg px-4 h-12">
                <Lock className="w-4 h-4 text-[#94A3B8] flex-shrink-0" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === "signup" ? "Min. 6 characters" : "••••••••"}
                  className="flex-1 bg-transparent text-white text-sm placeholder:text-white/30 outline-none"
                  required
                  minLength={6}
                  autoComplete={mode === "signin" ? "current-password" : "new-password"}
                />
              </div>
              {mode === "signin" && (
                <button
                  type="button"
                  onClick={() => { setMode("forgot"); setError(""); setMessage(""); }}
                  className="text-[#F7931A]/70 hover:text-[#F7931A] text-xs font-mono mt-1.5 transition-colors"
                >
                  Forgot password?
                </button>
              )}
            </div>
            )}

            {error && (
              <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {message && (
              <p className="text-[#22c55e] text-xs bg-[#22c55e]/10 border border-[#22c55e]/20 rounded-lg px-3 py-2">
                {message}
              </p>
            )}

            <div className="pt-1">
              <button
                type="submit"
                disabled={loading}
                className="cursor-pointer w-full h-12 rounded-full bg-gradient-to-r from-[#EA580C] to-[#F7931A] text-white font-semibold text-sm uppercase tracking-wider shadow-[0_0_20px_-5px_rgba(234,88,12,0.5)] hover:shadow-[0_0_30px_-5px_rgba(247,147,26,0.6)] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading
                  ? mode === "forgot" ? "Sending..." : mode === "signin" ? "Signing in..." : "Creating account..."
                  : mode === "forgot" ? "Send Reset Link" : mode === "signin" ? "Sign In" : "Create Account"
                }
              </button>
            </div>
          </form>
        </div>

        <p className="text-center text-[#94A3B8] text-xs mt-6 font-mono">
          Owner-only access &middot; Secured by Supabase
        </p>
      </div>
    </div>
  );
}

"use client";

import { useActionState } from "react";
import { tenantLogin } from "@/lib/actions/tenantPortal";
import Image from "next/image";
import { Mail, Loader2 } from "lucide-react";
import Link from "next/link";

const initialState = { error: "" };

export default function TenantLoginPage() {
  const [state, formAction, pending] = useActionState(tenantLogin, initialState);

  return (
    <div className="relative min-h-screen bg-[#030304] flex items-center justify-center overflow-hidden px-4">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundSize: "50px 50px",
          backgroundImage:
            "linear-gradient(to right, rgba(30,41,59,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(30,41,59,0.5) 1px, transparent 1px)",
          maskImage: "radial-gradient(circle at center, black 40%, transparent 100%)",
        }}
      />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#F7931A] opacity-5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-[0_0_30px_-5px_rgba(247,147,26,0.6)] mb-4">
            <Image src="/rent_logo.png" alt="RentTracker" width={32} height={32} />
          </div>
          <h1 className="font-heading text-2xl font-bold text-white tracking-tight">
            Rent<span className="bg-gradient-to-r from-[#F7931A] to-[#FFD600] bg-clip-text text-transparent">Tracker</span>
          </h1>
          <p className="text-[#94A3B8] text-sm mt-1 font-mono tracking-wider uppercase">
            Tenant Portal
          </p>
        </div>

        {/* Card */}
        <div className="bg-[#0F1115] border border-white/10 rounded-2xl p-8 shadow-[0_0_50px_-10px_rgba(247,147,26,0.1)]">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-lg bg-[#EA580C]/20 border border-[#EA580C]/50 flex items-center justify-center">
              <Mail className="w-5 h-5 text-[#F7931A]" />
            </div>
            <div>
              <h2 className="font-heading font-semibold text-white text-lg">View My Details</h2>
              <p className="text-[#94A3B8] text-xs">Enter your registered email to access your portal</p>
            </div>
          </div>

          <form action={formAction} className="space-y-5">
            <div>
              <label className="block text-xs font-mono tracking-wider uppercase text-[#94A3B8] mb-1.5">
                Email Address
              </label>
              <div className="flex items-center gap-2 bg-black/50 border-b-2 border-white/20 focus-within:border-[#F7931A] focus-within:shadow-[0_10px_20px_-10px_rgba(247,147,26,0.3)] transition-all rounded-t-lg px-4 h-12">
                <Mail className="w-4 h-4 text-[#94A3B8] flex-shrink-0" />
                <input
                  type="email"
                  name="email"
                  placeholder="your@email.com"
                  required
                  autoComplete="email"
                  autoFocus
                  className="flex-1 bg-transparent text-white text-sm placeholder:text-white/30 outline-none"
                />
              </div>
            </div>

            {state.error && (
              <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                {state.error}
              </p>
            )}

            <button
              type="submit"
              disabled={pending}
              className="w-full h-12 rounded-full bg-gradient-to-r from-[#EA580C] to-[#F7931A] text-white font-semibold text-sm uppercase tracking-wider shadow-[0_0_20px_-5px_rgba(234,88,12,0.5)] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
            >
              {pending && <Loader2 className="w-4 h-4 animate-spin" />}
              {pending ? "Checking..." : "View My Details"}
            </button>
          </form>
        </div>

        <p className="text-center text-[#94A3B8] text-xs mt-6 font-mono">
          Tenant read-only access &middot; No password required
        </p>
        <p className="text-center text-[#94A3B8]/50 text-xs mt-2 font-mono">
          Are you the property owner?{" "}
          <Link href="/login" className="text-[#F7931A]/70 hover:text-[#F7931A] transition-colors">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
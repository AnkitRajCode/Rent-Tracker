"use client";
import { tenantLogout } from "@/lib/actions/tenantPortal";
import { LogOut } from "lucide-react";

export default function SignOutTenantButton() {
  return (
    <form action={tenantLogout}>
      <button
        type="submit"
        className="flex items-center gap-1.5 h-8 px-3 rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/10 border border-white/10 text-xs font-mono transition-all"
      >
        <LogOut className="w-3.5 h-3.5" />
        Sign Out
      </button>
    </form>
  );
}

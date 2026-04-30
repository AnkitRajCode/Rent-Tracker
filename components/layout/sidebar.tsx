"use client";
import Image from "next/image";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Home,
  Users,
  IndianRupee,
  LogOut,
  Menu,
  X,
  UserCircle,
} from "lucide-react";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Properties", href: "/dashboard/properties", icon: Home },
  { label: "Tenants", href: "/dashboard/tenants", icon: Users },
  { label: "Rent", href: "/dashboard/rent", icon: IndianRupee },
  { label: "Profile", href: "/dashboard/profile", icon: UserCircle },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const [mobileOpen, setMobileOpen] = useState(false);

  async function signOut() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  const NavContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-[0_0_15px_-3px_rgba(247,147,26,0.5)]">
            <Image src="/rent_logo.png" alt="Logo" width={26} height={26} />
          </div>
          <div>
            <span className="font-heading font-bold text-white text-base leading-none">
              Rent
              <span className="bg-gradient-to-r from-[#F7931A] to-[#FFD600] bg-clip-text text-transparent">
                Tracker
              </span>
            </span>
            <p className="text-[#94A3B8] text-[10px] font-mono tracking-widest uppercase mt-0.5">
              Owner Portal
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active =
            href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-mono tracking-wide transition-all group ${
                active
                  ? "bg-[#EA580C]/20 border border-[#EA580C]/40 text-[#F7931A] shadow-[0_0_15px_-5px_rgba(234,88,12,0.4)]"
                  : "text-[#94A3B8] hover:text-white hover:bg-white/5 border border-transparent"
              }`}
            >
              <Icon
                className={`w-4 h-4 flex-shrink-0 ${active ? "text-[#F7931A]" : "text-[#94A3B8] group-hover:text-white"}`}
              />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Sign out */}
      <div className="px-3 py-4 border-t border-white/10">
        <button
          onClick={signOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-mono tracking-wide text-[#94A3B8] hover:text-red-400 hover:bg-red-400/10 border border-transparent transition-all cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-60 flex-col bg-[#0F1115] border-r border-white/10 fixed inset-y-0 left-0 z-30">
        <NavContent />
      </aside>

      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 z-30 h-14 bg-[#0F1115] border-b border-white/10 flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg border border-[#EA580C]/40 flex items-center justify-center">
            <Image src="/rent_logo.png" alt="Logo" width={16} height={16} />
          </div>
          <span className="font-heading font-bold text-white text-sm">
            Rent
            <span className="bg-gradient-to-r from-[#F7931A] to-[#FFD600] bg-clip-text text-transparent">
              Tracker
            </span>
          </span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-9 h-9 flex items-center justify-center text-[#94A3B8] hover:text-white hover:bg-white/10 rounded-lg transition-all"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="lg:hidden fixed inset-y-0 left-0 z-50 w-64 bg-[#0F1115] border-r border-white/10">
            <NavContent />
          </aside>
        </>
      )}
    </>
  );
}

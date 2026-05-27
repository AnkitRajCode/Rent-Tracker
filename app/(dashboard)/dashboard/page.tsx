import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Landmark,
  Home,
  Users,
  IndianRupee,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import RentTrendChart, { type RentMonthData } from "@/components/charts/RentTrendChart";
import OccupancyChart from "@/components/charts/OccupancyChart";

const SHORT_MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const now = new Date();
  const currentMonth = now.getMonth() + 1;
  const currentYear = now.getFullYear();

  // Build last 6 months range
  const last6: { month: number; year: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(currentYear, currentMonth - 1 - i, 1);
    last6.push({ month: d.getMonth() + 1, year: d.getFullYear() });
  }

  const [
    { count: totalProperties },
    { count: totalHouses },
    { count: occupiedHouses },
    { count: vacantHouses },
    { count: totalTenants },
    { data: thisMonthRent },
    { data: trendRecords },
  ] = await Promise.all([
    supabase.from("properties").select("*", { count: "exact", head: true }).eq("owner_id", user!.id),
    supabase.from("houses").select("*", { count: "exact", head: true }).eq("owner_id", user!.id),
    supabase.from("houses").select("*", { count: "exact", head: true }).eq("owner_id", user!.id).eq("status", "occupied"),
    supabase.from("houses").select("*", { count: "exact", head: true }).eq("owner_id", user!.id).eq("status", "vacant"),
    supabase.from("tenants").select("*", { count: "exact", head: true }).eq("owner_id", user!.id),
    supabase.from("rent_records").select("amount_due, amount_paid, status").eq("owner_id", user!.id).eq("month", currentMonth).eq("year", currentYear),
    supabase.from("rent_records").select("month, year, amount_due, amount_paid").eq("owner_id", user!.id).gte("year", last6[0].year).order("year").order("month"),
  ]);

  const totalExpected = thisMonthRent?.reduce((s, r) => s + r.amount_due, 0) ?? 0;
  const totalCollected = thisMonthRent?.reduce((s, r) => s + r.amount_paid, 0) ?? 0;
  const totalPending = totalExpected - totalCollected;
  const paidCount = thisMonthRent?.filter((r) => r.status === "paid").length ?? 0;
  const pendingCount = thisMonthRent?.filter((r) => r.status !== "paid").length ?? 0;

  // Build 6-month chart data
  const trendData: RentMonthData[] = last6.map(({ month, year }) => {
    const records = (trendRecords ?? []).filter(
      (r) => r.month === month && r.year === year
    );
    return {
      month: SHORT_MONTHS[month - 1],
      expected: records.reduce((s, r) => s + r.amount_due, 0),
      collected: records.reduce((s, r) => s + r.amount_paid, 0),
    };
  });

  const stats = [
    { label: "Properties", value: totalProperties ?? 0, icon: Landmark, color: "#F7931A", glow: "rgba(247,147,26,0.4)", href: "/dashboard/properties" },
    { label: "Total Houses", value: totalHouses ?? 0, icon: Home, color: "#FFD600", glow: "rgba(255,214,0,0.3)", href: "/dashboard/properties" },
    { label: "Occupied", value: occupiedHouses ?? 0, icon: CheckCircle2, color: "#22c55e", glow: "rgba(34,197,94,0.3)", href: "/dashboard/tenants" },
    { label: "Vacant", value: vacantHouses ?? 0, icon: AlertCircle, color: "#94A3B8", glow: "rgba(148,163,184,0.2)", href: "/dashboard/properties" },
    { label: "Tenants", value: totalTenants ?? 0, icon: Users, color: "#F7931A", glow: "rgba(247,147,26,0.4)", href: "/dashboard/tenants" },
  ];

  const monthName = now.toLocaleString("default", { month: "long" });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-[#94A3B8] text-sm mt-1 font-mono">
          Overview of your properties and rent status
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {stats.map(({ label, value, icon: Icon, color, href }) => (
          <Link
            key={label}
            href={href}
            className="bg-[#0F1115] border border-white/10 rounded-2xl p-5 hover:-translate-y-1 hover:border-[#F7931A]/30 transition-all duration-300 cursor-pointer"
          >
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center mb-3"
              style={{ background: `${color}20`, border: `1px solid ${color}40` }}
            >
              <Icon className="w-4 h-4" style={{ color }} />
            </div>
            <p className="font-heading text-2xl font-bold" style={{ color }}>{value}</p>
            <p className="text-[#94A3B8] text-xs font-mono tracking-wider uppercase mt-0.5">{label}</p>
          </Link>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Rent trend - 6 months */}
        <div className="lg:col-span-2 bg-[#0F1115] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-heading text-base font-semibold text-white">
                Rent Collection - Last 6 Months
              </h2>
              <p className="text-[#94A3B8] text-xs font-mono mt-0.5">
                Expected vs collected per month
              </p>
            </div>
            <TrendingUp className="w-4 h-4 text-[#F7931A]" />
          </div>
          <RentTrendChart data={trendData} />
        </div>

        {/* Occupancy donut */}
        <div className="bg-[#0F1115] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="font-heading text-base font-semibold text-white">
                Occupancy
              </h2>
              <p className="text-[#94A3B8] text-xs font-mono mt-0.5">
                Current house status
              </p>
            </div>
            <Home className="w-4 h-4 text-[#22c55e]" />
          </div>
          <OccupancyChart
            data={{ occupied: occupiedHouses ?? 0, vacant: vacantHouses ?? 0 }}
          />
        </div>
      </div>

      {/* This month rent summary */}
      <div>
        <h2 className="font-heading text-lg font-semibold text-white mb-4">
          {monthName} {currentYear} - Rent Summary
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Link href="/dashboard/rent" className="bg-[#0F1115] border border-white/10 rounded-2xl p-6 hover:border-[#F7931A]/30 transition-all">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-[#94A3B8]" />
              <span className="text-[#94A3B8] text-xs font-mono tracking-wider uppercase">Expected</span>
            </div>
            <p className="font-heading text-3xl font-bold text-white">
              ₹{totalExpected.toLocaleString("en-IN")}
            </p>
            <p className="text-[#94A3B8] text-xs mt-1">{thisMonthRent?.length ?? 0} records</p>
          </Link>

          <Link href="/dashboard/rent" className="bg-[#0F1115] border border-[#22c55e]/20 rounded-2xl p-6 shadow-[0_0_20px_-5px_rgba(34,197,94,0.1)] hover:border-[#22c55e]/40 transition-all">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-[#22c55e]" />
              <span className="text-[#94A3B8] text-xs font-mono tracking-wider uppercase">Collected</span>
            </div>
            <p className="font-heading text-3xl font-bold text-[#22c55e]">
              ₹{totalCollected.toLocaleString("en-IN")}
            </p>
            <p className="text-[#94A3B8] text-xs mt-1">{paidCount} paid</p>
          </Link>

          <Link href="/dashboard/rent" className="bg-[#0F1115] border border-[#F7931A]/20 rounded-2xl p-6 shadow-[0_0_20px_-5px_rgba(247,147,26,0.1)] hover:border-[#F7931A]/40 transition-all">
            <div className="flex items-center gap-2 mb-3">
              <IndianRupee className="w-4 h-4 text-[#F7931A]" />
              <span className="text-[#94A3B8] text-xs font-mono tracking-wider uppercase">Pending</span>
            </div>
            <p className="font-heading text-3xl font-bold text-[#F7931A]">
              ₹{totalPending.toLocaleString("en-IN")}
            </p>
            <p className="text-[#94A3B8] text-xs mt-1">{pendingCount} pending</p>
          </Link>
        </div>
      </div>

      {/* Collection progress bar */}
      {totalExpected > 0 && (
        <div className="bg-[#0F1115] border border-white/10 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[#94A3B8] text-xs font-mono tracking-wider uppercase">
              Collection Progress
            </span>
            <span className="text-white text-sm font-mono font-bold">
              {Math.round((totalCollected / totalExpected) * 100)}%
            </span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#EA580C] to-[#F7931A] transition-all duration-700"
              style={{ width: `${Math.min(100, (totalCollected / totalExpected) * 100)}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[#94A3B8] text-xs font-mono">
              ₹{totalCollected.toLocaleString("en-IN")} collected
            </span>
            <span className="text-[#94A3B8] text-xs font-mono">
              ₹{totalExpected.toLocaleString("en-IN")} total
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

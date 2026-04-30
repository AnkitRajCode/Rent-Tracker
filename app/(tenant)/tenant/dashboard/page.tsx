import { createAdminClient } from "@/lib/supabase/admin";
import { getTenantIdFromCookie } from "@/lib/actions/tenantPortal";
import { redirect } from "next/navigation";
import Image from "next/image";
import {
  IndianRupee,
  CheckCircle2,
  Clock,
  AlertCircle,
  ShieldCheck,
  Users,
  Home,
} from "lucide-react";
import SignOutTenantButton from "@/components/tenant/SignOutTenantButton";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const STATUS_CONFIG = {
  paid:    { label: "Paid",    icon: CheckCircle2, color: "#22c55e", bg: "#22c55e15", border: "#22c55e40" },
  partial: { label: "Partial", icon: Clock,        color: "#FFD600", bg: "#FFD60015", border: "#FFD60040" },
  pending: { label: "Pending", icon: AlertCircle,  color: "#F7931A", bg: "#F7931A15", border: "#F7931A40" },
};

export default async function TenantDashboardPage() {
  const tenantId = await getTenantIdFromCookie();
  if (!tenantId) redirect("/tenant/login");

  const supabase = createAdminClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("*, houses(house_number, floor, type, rent_amount, security_deposit, properties(name, address_line, city, state, pin_code))")
    .eq("id", tenantId)
    .eq("can_login", true)
    .maybeSingle();

  if (!tenant) {
    return (
      <div className="min-h-screen bg-[#030304] flex items-center justify-center px-4">
        <div className="bg-[#0F1115] border border-white/10 rounded-2xl p-10 text-center max-w-sm">
          <ShieldCheck className="w-10 h-10 text-[#94A3B8] mx-auto mb-4" />
          <h2 className="font-heading text-lg font-semibold text-white mb-2">No portal access</h2>
          <p className="text-[#94A3B8] text-sm">
            Your owner has not enabled portal access for your account yet.
          </p>
        </div>
      </div>
    );
  }

  const house = tenant.houses as unknown as {
    house_number: string;
    floor: string | null;
    type: string | null;
    rent_amount: number;
    security_deposit: number;
    properties: { name: string; address_line: string | null; city: string | null; state: string | null; pin_code: string | null } | null;
  } | null;

  const [membersResult, rentResult] = await Promise.all([
    supabase
      .from("tenant_members")
      .select("name, phone, email, is_primary")
      .eq("tenant_id", tenant.id)
      .order("is_primary", { ascending: false }),
    supabase
      .from("rent_records")
      .select("month, year, amount_due, amount_paid, status, payment_mode, paid_on")
      .eq("tenant_id", tenant.id)
      .order("year", { ascending: false })
      .order("month", { ascending: false })
      .limit(12),
  ]);

  const members = membersResult.data;
  const rentRecords = rentResult.data;
  const now = new Date();

  const totalPaid = rentRecords?.reduce((s, r) => s + r.amount_paid, 0) ?? 0;
  const currentRecord = rentRecords?.find(
    (r) => r.month === now.getMonth() + 1 && r.year === now.getFullYear()
  );

  const refundAmount = (tenant as unknown as { deposit_refund_amount: number | null; deposit_refund_published: boolean }).deposit_refund_amount;
  const refundPublished = (tenant as unknown as { deposit_refund_amount: number | null; deposit_refund_published: boolean }).deposit_refund_published;

  return (
    <div className="min-h-screen bg-[#030304]">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-[#0F1115]/80 backdrop-blur border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg border border-[#EA580C]/40 flex items-center justify-center">
            <Image src="/rent_logo.png" alt="RentTracker" width={16} height={16} />
          </div>
          <div>
            <span className="font-heading font-bold text-white text-sm">
              Rent<span className="bg-gradient-to-r from-[#F7931A] to-[#FFD600] bg-clip-text text-transparent">Tracker</span>
            </span>
            <p className="text-[#94A3B8] text-[10px] font-mono">Tenant Portal</p>
          </div>
        </div>
        <SignOutTenantButton />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
        {/* Identity */}
        <div className="bg-[#0F1115] border border-white/10 rounded-2xl p-5">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-xl bg-[#EA580C]/20 border border-[#EA580C]/40 flex items-center justify-center flex-shrink-0">
              <Home className="w-5 h-5 text-[#F7931A]" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-heading text-xl font-bold text-white">{tenant.name}</h1>
              <p className="text-[#F7931A] text-sm font-mono mt-0.5">
                {house?.properties?.name} &middot; Unit {house?.house_number}
                {house?.type ? ` · ${house.type}` : ""}
                {house?.floor ? ` · Floor ${house.floor}` : ""}
              </p>
              {house?.properties?.city && (
                <p className="text-[#94A3B8] text-xs font-mono mt-0.5">
                  {[house.properties.address_line, house.properties.city, house.properties.state, house.properties.pin_code]
                    .filter(Boolean).join(", ")}
                </p>
              )}
              <p className="text-[#94A3B8] text-xs font-mono mt-1">
                Move-in: {new Date(tenant.move_in_date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </p>
            </div>
          </div>
        </div>

        {/* This month status */}
        {currentRecord ? (() => {
          const status = currentRecord.status as keyof typeof STATUS_CONFIG;
          const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
          const StatusIcon = cfg.icon;
          return (
            <div className="rounded-2xl p-6 border" style={{ background: cfg.bg, borderColor: cfg.border }}>
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-mono tracking-wider uppercase" style={{ color: cfg.color }}>
                  {MONTHS[currentRecord.month - 1]} {currentRecord.year} &mdash; This Month
                </span>
                <span className="flex items-center gap-1.5 text-xs font-mono px-2 py-0.5 rounded-full border" style={{ color: cfg.color, borderColor: cfg.border, background: cfg.bg }}>
                  <StatusIcon className="w-3 h-3" />
                  {cfg.label}
                </span>
              </div>
              <div className="flex items-end gap-6">
                <div>
                  <p className="text-[#94A3B8] text-xs font-mono mb-1">Amount Paid</p>
                  <p className="font-heading text-3xl font-bold" style={{ color: cfg.color }}>
                    &#8377;{currentRecord.amount_paid.toLocaleString("en-IN")}
                  </p>
                </div>
                <div className="pb-1 space-y-0.5">
                  <p className="text-[#94A3B8] text-xs font-mono">of &#8377;{currentRecord.amount_due.toLocaleString("en-IN")} due</p>
                  {currentRecord.payment_mode && <p className="text-[#94A3B8] text-xs font-mono capitalize">via {currentRecord.payment_mode.replace("_", " ")}</p>}
                  {currentRecord.paid_on && <p className="text-[#94A3B8] text-xs font-mono">on {new Date(currentRecord.paid_on).toLocaleDateString("en-IN")}</p>}
                </div>
              </div>
            </div>
          );
        })() : (
          <div className="bg-[#0F1115] border border-[#F7931A]/20 rounded-2xl p-5 flex items-center gap-4">
            <AlertCircle className="w-8 h-8 text-[#F7931A] flex-shrink-0" />
            <div>
              <p className="text-white font-semibold text-sm">
                {MONTHS[now.getMonth()]} {now.getFullYear()} &mdash; No payment recorded yet
              </p>
              <p className="text-[#94A3B8] text-xs mt-0.5">
                Rent of &#8377;{house?.rent_amount.toLocaleString("en-IN")}/mo due on the {tenant.rent_due_day}th
              </p>
            </div>
          </div>
        )}

        {/* Key numbers */}
        <div className={`grid grid-cols-2 gap-3 ${refundPublished && refundAmount != null ? "sm:grid-cols-4" : "sm:grid-cols-3"}`}>
          <div className="bg-[#0F1115] border border-white/10 rounded-2xl p-4">
            <p className="text-[#94A3B8] text-xs font-mono uppercase tracking-wider mb-2">Monthly Rent</p>
            <p className="font-heading text-xl font-bold text-[#F7931A]">&#8377;{house?.rent_amount.toLocaleString("en-IN")}</p>
            <p className="text-[#94A3B8] text-xs font-mono mt-0.5">Due {tenant.rent_due_day}th</p>
          </div>
          <div className="bg-[#0F1115] border border-white/10 rounded-2xl p-4">
            <p className="text-[#94A3B8] text-xs font-mono uppercase tracking-wider mb-2">Deposit Paid</p>
            <p className="font-heading text-xl font-bold text-[#FFD600]">&#8377;{(house?.security_deposit ?? 0).toLocaleString("en-IN")}</p>
          </div>
          <div className="bg-[#0F1115] border border-white/10 rounded-2xl p-4">
            <p className="text-[#94A3B8] text-xs font-mono uppercase tracking-wider mb-2">Total Paid</p>
            <p className="font-heading text-xl font-bold text-[#22c55e]">&#8377;{totalPaid.toLocaleString("en-IN")}</p>
            <p className="text-[#94A3B8] text-xs font-mono mt-0.5">{rentRecords?.length ?? 0} months</p>
          </div>
          {refundPublished && refundAmount != null && (
            <div className="bg-[#0F1115] border border-[#22c55e]/30 rounded-2xl p-4 shadow-[0_0_20px_-5px_rgba(34,197,94,0.15)]">
              <p className="text-[#94A3B8] text-xs font-mono uppercase tracking-wider mb-2">Deposit Refund</p>
              <p className="font-heading text-xl font-bold text-[#22c55e]">&#8377;{refundAmount.toLocaleString("en-IN")}</p>
              <p className="text-[#94A3B8] text-xs font-mono mt-0.5">Confirmed by owner</p>
            </div>
          )}
        </div>

        {/* Members */}
        {members && members.length > 1 && (
          <div className="bg-[#0F1115] border border-white/10 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Users className="w-4 h-4 text-[#F7931A]" />
              <h2 className="font-heading font-semibold text-white text-sm">Household Members</h2>
            </div>
            <div className="space-y-0">
              {(members as unknown as Array<{ name: string; phone: string | null; email: string | null; is_primary: boolean }>).map((m, i) => (
                <div key={i} className="flex items-center justify-between py-2.5 border-b border-white/5 last:border-0">
                  <div>
                    <p className="text-white text-sm">{m.name}</p>
                    {m.phone && <p className="text-[#94A3B8] text-xs font-mono">{m.phone}</p>}
                  </div>
                  {m.is_primary && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#F7931A]/10 border border-[#F7931A]/20 text-[#F7931A]">
                      Primary
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Payment history */}
        {rentRecords && rentRecords.length > 0 && (
          <div className="bg-[#0F1115] border border-white/10 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <IndianRupee className="w-4 h-4 text-[#F7931A]" />
              <h2 className="font-heading font-semibold text-white text-sm">Payment History</h2>
            </div>
            <div className="space-y-0">
              {rentRecords.map((r, i) => {
                const status = r.status as keyof typeof STATUS_CONFIG;
                const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.pending;
                const StatusIcon = cfg.icon;
                return (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                    <div>
                      <p className="text-white text-sm font-mono font-semibold">{MONTHS[r.month - 1]} {r.year}</p>
                      {r.paid_on && (
                        <p className="text-[#94A3B8] text-xs mt-0.5">
                          {new Date(r.paid_on).toLocaleDateString("en-IN")}
                          {r.payment_mode ? ` · ${r.payment_mode.replace("_", " ")}` : ""}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm font-bold" style={{ color: cfg.color }}>
                        &#8377;{r.amount_paid.toLocaleString("en-IN")}
                      </p>
                      <span className="inline-flex items-center gap-1 text-[10px] font-mono" style={{ color: cfg.color }}>
                        <StatusIcon className="w-3 h-3" />
                        {cfg.label}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className="pb-8" />
      </div>
    </div>
  );
}

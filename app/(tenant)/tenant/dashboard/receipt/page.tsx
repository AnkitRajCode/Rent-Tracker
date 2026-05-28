import { createAdminClient } from "@/lib/supabase/admin";
import { getTenantIdFromCookie } from "@/lib/actions/tenantPortal";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import PrintButton from "@/components/PrintButton";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default async function TenantReceiptPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ month?: string; year?: string }>;
}>) {
  const tenantId = await getTenantIdFromCookie();
  if (!tenantId) redirect("/tenant/login");

  const params = await searchParams;
  const supabase = createAdminClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("*, houses(id, house_number, rent_amount, properties(name))")
    .eq("id", tenantId)
    .eq("can_login", true)
    .maybeSingle();

  if (!tenant) redirect("/tenant/login");

  const house = tenant.houses as unknown as {
    id: string;
    house_number: string;
    rent_amount: number;
    properties: { name: string } | null;
  } | null;

  if (!house) notFound();

  const now = new Date();
  const month = params.month ? Number.parseInt(params.month) : now.getMonth() + 1;
  const year = params.year ? Number.parseInt(params.year) : now.getFullYear();

  const { data: record } = await supabase
    .from("rent_records")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("house_id", house.id)
    .eq("month", month)
    .eq("year", year)
    .maybeSingle();

  if (!record || record.status !== "paid") notFound();

  const { data: ownerProfile } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", tenant.owner_id)
    .maybeSingle();

  const { data: members } = await supabase
    .from("tenant_members")
    .select("name, is_primary")
    .eq("tenant_id", tenantId)
    .eq("is_primary", true)
    .maybeSingle();

  const rec = record as unknown as {
    amount_due: number;
    electricity_bill: number | null;
    maintenance: number | null;
    amount_paid: number;
    status: string;
    payment_mode: string | null;
    paid_on: string | null;
    notes: string | null;
  };

  const rent = rec.amount_due ?? 0;
  const electricity = rec.electricity_bill ?? 0;
  const maintenanceCharge = rec.maintenance ?? 0;
  const totalDue = rent + electricity + maintenanceCharge;
  const amountPaid = rec.amount_paid ?? 0;
  const balance = totalDue - amountPaid;

  const receiptNo = `REC-${year}-${String(month).padStart(2, "0")}-${house.id.slice(-6).toUpperCase()}`;
  const generatedOn = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="min-h-screen bg-[#030304] px-4 py-6">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Top bar – hidden on print */}
        <div className="flex items-center justify-between print:hidden">
          <Link
            href="/tenant/dashboard"
            className="w-9 h-9 flex items-center justify-center rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/10 border border-transparent transition-all"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <PrintButton />
        </div>

        {/* Receipt card */}
        <div
          id="receipt"
          className="bg-[#0F1115] border border-white/10 rounded-2xl p-8 print:bg-white print:text-black print:border-gray-300 print:rounded-none print:shadow-none"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-6 pb-6 border-b border-white/10 print:border-gray-200">
            <div>
              <h1 className="font-heading text-2xl font-bold text-white print:text-black">
                Rent<span className="text-[#F7931A] print:text-orange-500">Tracker</span>
              </h1>
              <p className="text-[#94A3B8] text-xs font-mono mt-0.5 print:text-gray-500">
                {ownerProfile?.full_name ?? "Property Owner"}
                {ownerProfile?.phone ? ` · ${ownerProfile.phone}` : ""}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-mono text-[#94A3B8] print:text-gray-500">Receipt No.</p>
              <p className="text-white font-mono font-bold text-sm print:text-black">{receiptNo}</p>
              <p className="text-xs font-mono text-[#94A3B8] print:text-gray-500 mt-1">Generated: {generatedOn}</p>
            </div>
          </div>

          {/* Period + Status */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs font-mono tracking-wider uppercase text-[#94A3B8] print:text-gray-500">Billing Period</p>
              <p className="font-heading text-xl font-bold text-white print:text-black">
                {MONTHS[month - 1]} {year}
              </p>
            </div>
            <span className="flex items-center gap-1.5 text-sm font-mono px-3 py-1 rounded-full border text-[#22c55e] bg-[#22c55e]/10 border-[#22c55e]/30 print:text-green-600 print:bg-green-50 print:border-green-200">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Paid
            </span>
          </div>

          {/* Property + Tenant */}
          <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-white/5 rounded-xl print:bg-gray-50 print:border print:border-gray-200">
            <div>
              <p className="text-xs font-mono tracking-wider uppercase text-[#94A3B8] print:text-gray-500 mb-1">Property</p>
              <p className="text-white text-sm font-medium print:text-black">{house.properties?.name ?? "—"}</p>
              <p className="text-[#94A3B8] text-xs font-mono print:text-gray-500">Unit {house.house_number}</p>
            </div>
            <div>
              <p className="text-xs font-mono tracking-wider uppercase text-[#94A3B8] print:text-gray-500 mb-1">Tenant</p>
              <p className="text-white text-sm font-medium print:text-black">{members?.name ?? tenant.name}</p>
            </div>
          </div>

          {/* Charges breakdown */}
          <div className="space-y-2 mb-6">
            <p className="text-xs font-mono tracking-wider uppercase text-[#94A3B8] print:text-gray-500 mb-3">Charges</p>

            <div className="flex justify-between items-center py-2 border-b border-white/5 print:border-gray-100">
              <span className="text-[#94A3B8] text-sm print:text-gray-600">Monthly Rent</span>
              <span className="text-white font-mono font-medium print:text-black">₹{rent.toLocaleString("en-IN")}</span>
            </div>

            {electricity > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-white/5 print:border-gray-100">
                <span className="text-[#94A3B8] text-sm print:text-gray-600">Electricity Bill</span>
                <span className="text-white font-mono font-medium print:text-black">₹{electricity.toLocaleString("en-IN")}</span>
              </div>
            )}

            {maintenanceCharge > 0 && (
              <div className="flex justify-between items-center py-2 border-b border-white/5 print:border-gray-100">
                <span className="text-[#94A3B8] text-sm print:text-gray-600">Maintenance</span>
                <span className="text-white font-mono font-medium print:text-black">₹{maintenanceCharge.toLocaleString("en-IN")}</span>
              </div>
            )}

            <div className="flex justify-between items-center py-3 mt-1">
              <span className="text-white font-semibold print:text-black">Total Due</span>
              <span className="text-[#F7931A] font-heading font-bold text-lg print:text-orange-600">₹{totalDue.toLocaleString("en-IN")}</span>
            </div>
          </div>

          {/* Payment info */}
          <div className="p-4 bg-white/5 rounded-xl space-y-2 print:bg-gray-50 print:border print:border-gray-200">
            <div className="flex justify-between items-center">
              <span className="text-[#94A3B8] text-sm print:text-gray-600">Amount Paid</span>
              <span className="text-[#22c55e] font-mono font-bold print:text-green-600">₹{amountPaid.toLocaleString("en-IN")}</span>
            </div>
            {balance > 0 && (
              <div className="flex justify-between items-center">
                <span className="text-[#94A3B8] text-sm print:text-gray-600">Balance Due</span>
                <span className="text-[#F7931A] font-mono font-bold print:text-orange-600">₹{balance.toLocaleString("en-IN")}</span>
              </div>
            )}
            {rec.payment_mode && (
              <div className="flex justify-between items-center">
                <span className="text-[#94A3B8] text-sm print:text-gray-600">Payment Mode</span>
                <span className="text-white font-mono text-sm print:text-black capitalize">{rec.payment_mode.replace("_", " ")}</span>
              </div>
            )}
            {rec.paid_on && (
              <div className="flex justify-between items-center">
                <span className="text-[#94A3B8] text-sm print:text-gray-600">Paid On</span>
                <span className="text-white font-mono text-sm print:text-black">
                  {new Date(rec.paid_on).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })}
                </span>
              </div>
            )}
          </div>

          <p className="text-center text-[#94A3B8] text-xs font-mono mt-6 print:text-gray-400">
            This is a computer-generated receipt. — RentTracker
          </p>
        </div>

        {/* Print styles */}
        <style>{`
          @media print {
            body { background: white !important; }
            .print\\:hidden { display: none !important; }
            nav, aside, footer, header { display: none !important; }
            #receipt {
              box-shadow: none !important;
              border: 1px solid #e5e7eb !important;
              margin: 0 !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}

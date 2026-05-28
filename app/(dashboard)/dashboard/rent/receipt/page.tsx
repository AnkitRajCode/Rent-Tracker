import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { notFound } from "next/navigation";
import PrintButton from "@/components/PrintButton";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default async function RentReceiptPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ house_id: string; month: string; year: string }>;
}>) {
  const params = await searchParams;
  const { house_id, month, year } = params;

  if (!house_id || !month || !year) notFound();

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const { data: record } = await supabase
    .from("rent_records")
    .select("*")
    .eq("house_id", house_id)
    .eq("month", Number.parseInt(month))
    .eq("year", Number.parseInt(year))
    .eq("owner_id", user!.id)
    .maybeSingle();

  if (!record) notFound();

  const { data: house } = await supabase
    .from("houses")
    .select("house_number, properties(name)")
    .eq("id", house_id)
    .single();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("name, phone, email, move_in_date")
    .eq("house_id", house_id)
    .eq("owner_id", user!.id)
    .maybeSingle();

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, phone")
    .eq("id", user!.id)
    .maybeSingle();

  const property = house?.properties as unknown as { name: string } | null;
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

  const receiptNo = `REC-${year}-${String(month).padStart(2, "0")}-${house_id.slice(-6).toUpperCase()}`;
  const generatedOn = new Date().toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });

  let statusClass: string;
  if (rec.status === "paid") {
    statusClass = "text-[#22c55e] bg-[#22c55e]/10 border-[#22c55e]/30 print:text-green-600 print:bg-green-50 print:border-green-200";
  } else if (rec.status === "partial") {
    statusClass = "text-[#FFD600] bg-[#FFD600]/10 border-[#FFD600]/30 print:text-yellow-600 print:bg-yellow-50 print:border-yellow-200";
  } else {
    statusClass = "text-[#F7931A] bg-[#F7931A]/10 border-[#F7931A]/30 print:text-orange-600 print:bg-orange-50 print:border-orange-200";
  }

  return (
    <div className="max-w-2xl space-y-4">
      {/* Top bar – hidden on print */}
      <div className="flex items-center justify-between print:hidden">
        <Link
          href="/dashboard/rent"
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
              {profile?.full_name ?? "Property Owner"}
              {profile?.phone ? ` · ${profile.phone}` : ""}
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
              {MONTHS[Number.parseInt(month) - 1]} {year}
            </p>
          </div>
          <span
            className={`flex items-center gap-1.5 text-sm font-mono px-3 py-1 rounded-full border ${statusClass}`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            {rec.status.charAt(0).toUpperCase() + rec.status.slice(1)}
          </span>
        </div>

        {/* Property + Tenant */}
        <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-white/5 rounded-xl print:bg-gray-50 print:border print:border-gray-200">
          <div>
            <p className="text-xs font-mono tracking-wider uppercase text-[#94A3B8] print:text-gray-500 mb-1">Property</p>
            <p className="text-white text-sm font-medium print:text-black">{property?.name ?? "—"}</p>
            <p className="text-[#94A3B8] text-xs font-mono print:text-gray-500">Unit {house?.house_number}</p>
          </div>
          <div>
            <p className="text-xs font-mono tracking-wider uppercase text-[#94A3B8] print:text-gray-500 mb-1">Tenant</p>
            <p className="text-white text-sm font-medium print:text-black">{tenant?.name ?? "—"}</p>
            {tenant?.phone && <p className="text-[#94A3B8] text-xs font-mono print:text-gray-500">{tenant.phone}</p>}
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
          {rec.notes && (
            <div className="pt-2 border-t border-white/5 print:border-gray-200">
              <p className="text-[#94A3B8] text-xs print:text-gray-500">Note: {rec.notes}</p>
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
          main { padding: 0 !important; margin: 0 !important; }
          main > div { padding: 0 !important; }
          body > div > div { padding-left: 0 !important; padding-top: 0 !important; }
          #receipt { 
            box-shadow: none !important; 
            border: 1px solid #e5e7eb !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}

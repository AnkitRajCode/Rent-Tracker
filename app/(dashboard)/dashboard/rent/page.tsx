import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { IndianRupee, Plus, CheckCircle2, Clock, AlertCircle, Receipt } from "lucide-react";
import ExportCSVButton from "@/components/ExportCSVButton";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const STATUS_CONFIG = {
  paid: { label: "Paid", icon: CheckCircle2, color: "#22c55e", bg: "#22c55e10", border: "#22c55e30" },
  partial: { label: "Partial", icon: Clock, color: "#FFD600", bg: "#FFD60010", border: "#FFD60030" },
  pending: { label: "Pending", icon: AlertCircle, color: "#F7931A", bg: "#F7931A10", border: "#F7931A30" },
};

export default async function RentPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string; year?: string; house_id?: string }>;
}) {
  const params = await searchParams;
  const now = new Date();
  const month = parseInt(params.month ?? String(now.getMonth() + 1));
  const year = parseInt(params.year ?? String(now.getFullYear()));

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch all occupied houses with their current tenant
  const { data: occupiedHouses } = await supabase
    .from("houses")
    .select("id, house_number, rent_amount, property_id, properties(name), tenants(id, name, phone, rent_due_day)")
    .eq("owner_id", user!.id)
    .eq("status", "occupied");

  // Fetch rent records for the selected month/year
  const { data: rentRecords } = await supabase
    .from("rent_records")
    .select("*")
    .eq("owner_id", user!.id)
    .eq("month", month)
    .eq("year", year);

  const recordsByHouse = new Map(rentRecords?.map((r) => [r.house_id, r]) ?? []);

  const totalExpected = occupiedHouses?.reduce((s, h) => s + h.rent_amount, 0) ?? 0;
  const totalCollected = rentRecords?.reduce((s, r) => s + r.amount_paid, 0) ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white">Rent Tracker</h1>
          <p className="text-[#94A3B8] text-sm mt-1 font-mono">
            Track monthly rent collection
          </p>
        </div>
        <ExportCSVButton
          filename={`rent-${MONTHS[month - 1].toLowerCase()}-${year}.csv`}
          headers={["Unit", "Property", "Tenant", "Phone", "Rent Due", "Amount Paid", "Status", "Payment Mode", "Paid On", "Notes"]}
          rows={(occupiedHouses ?? []).map((house) => {
            const tenant = (house.tenants as unknown as { id: string; name: string; phone: string; rent_due_day: number }[])?.[0];
            const record = recordsByHouse.get(house.id);
            const property = house.properties as unknown as { name: string } | null;
            return [
              `Unit ${house.house_number}`,
              property?.name ?? "",
              tenant?.name ?? "",
              tenant?.phone ?? "",
              house.rent_amount,
              record?.amount_paid ?? 0,
              record?.status ?? "pending",
              record?.payment_mode ?? "",
              record?.paid_on ?? "",
              record?.notes ?? "",
            ];
          })}
        />
      </div>

      {/* Month/Year selector */}
      <form className="flex flex-wrap items-center gap-3">
        <select
          name="month"
          defaultValue={month}
          className="bg-[#0F1115] border border-white/10 rounded-xl h-10 px-3 text-white text-sm font-mono outline-none focus:border-[#F7931A] transition-all cursor-pointer"
        >
          {MONTHS.map((m, i) => (
            <option key={m} value={i + 1}>{m}</option>
          ))}
        </select>
        <select
          name="year"
          defaultValue={year}
          className="bg-[#0F1115] border border-white/10 rounded-xl h-10 px-3 text-white text-sm font-mono outline-none focus:border-[#F7931A] transition-all cursor-pointer"
        >
          {Array.from({ length: 8 }, (_, i) => year - 5 + i).map((y) => (
            <option key={y} value={y}>{y}</option>
          ))}
        </select>
        <button
          type="submit"
          className="h-10 px-4 rounded-xl bg-[#EA580C]/20 border border-[#EA580C]/40 text-[#F7931A] text-sm font-mono hover:bg-[#EA580C]/30 transition-all cursor-pointer"
        >
          Filter
        </button>
      </form>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Expected", value: `₹${totalExpected.toLocaleString("en-IN")}`, color: "#fff" },
          { label: "Collected", value: `₹${totalCollected.toLocaleString("en-IN")}`, color: "#22c55e" },
          { label: "Pending", value: `₹${(totalExpected - totalCollected).toLocaleString("en-IN")}`, color: "#F7931A" },
          {
            label: "Paid",
            value: `${rentRecords?.filter((r) => r.status === "paid").length ?? 0}/${occupiedHouses?.length ?? 0}`,
            color: "#FFD600",
          },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-[#0F1115] border border-white/10 rounded-2xl p-4">
            <p className="text-[#94A3B8] text-xs font-mono tracking-wider uppercase mb-1">{label}</p>
            <p className="font-heading text-xl font-bold" style={{ color }}>{value}</p>
          </div>
        ))}
      </div>

      {/* House rent cards */}
      {!occupiedHouses || occupiedHouses.length === 0 ? (
        <div className="bg-[#0F1115] border border-white/10 rounded-2xl p-12 text-center">
          <IndianRupee className="w-10 h-10 text-[#94A3B8] mx-auto mb-3" />
          <p className="text-[#94A3B8] text-sm">No occupied houses to track.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {occupiedHouses.map((house) => {
            const tenant = (house.tenants as unknown as { id: string; name: string; phone: string; rent_due_day: number }[])?.[0];
            const record = recordsByHouse.get(house.id);
            const property = house.properties as unknown as { name: string } | null;
            const status = record?.status ?? "pending";
            const cfg = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG] ?? STATUS_CONFIG.pending;
            const StatusIcon = cfg.icon;

            return (
              <div
                key={house.id}
                className="bg-[#0F1115] border border-white/10 rounded-2xl p-5 hover:border-[#F7931A]/30 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-heading font-semibold text-white">
                      Unit {house.house_number}
                    </h3>
                    <p className="text-[#94A3B8] text-xs font-mono">{property?.name}</p>
                  </div>
                  <span
                    className="flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-full border"
                    style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}
                  >
                    <StatusIcon className="w-3 h-3" />
                    {cfg.label}
                  </span>
                </div>

                <div className="space-y-1 mb-4">
                  {tenant && (
                    <p className="text-white text-xs">👤 {tenant.name}</p>
                  )}
                  <p className="text-[#F7931A] font-mono text-sm font-semibold">
                    ₹{house.rent_amount.toLocaleString("en-IN")}/mo
                  </p>
                  {record && (
                    <div className="text-xs font-mono text-[#94A3B8] space-y-0.5">
                      <p>Paid: ₹{record.amount_paid.toLocaleString("en-IN")}</p>
                      {record.payment_mode && <p>Via: {record.payment_mode.replace("_", " ")}</p>}
                      {record.paid_on && (
                        <p>On: {new Date(record.paid_on).toLocaleDateString("en-IN")}</p>
                      )}
                    </div>
                  )}
                </div>

                {tenant && (
                  <div className="pt-3 border-t border-white/5 flex gap-2">
                    <Link
                      href={`/dashboard/rent/record?house_id=${house.id}&tenant_id=${tenant.id}&month=${month}&year=${year}&amount_due=${house.rent_amount}`}
                      className="flex-1 flex items-center justify-center gap-1.5 h-9 rounded-xl text-xs font-mono font-semibold tracking-wider uppercase transition-all bg-gradient-to-r from-[#EA580C] to-[#F7931A] text-white shadow-[0_0_15px_-5px_rgba(234,88,12,0.5)] hover:scale-[1.02]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      {record ? "Update" : "Record"}
                    </Link>
                    {record && (
                      <Link
                        href={`/dashboard/rent/receipt?house_id=${house.id}&month=${month}&year=${year}`}
                        className="flex items-center justify-center gap-1 h-9 px-3 rounded-xl text-xs font-mono text-[#94A3B8] hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all"
                        title="View Receipt"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

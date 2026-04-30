import { upsertRentRecord } from "@/lib/actions/rent";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default async function RecordPaymentPage({
  searchParams,
}: {
  searchParams: Promise<{
    house_id: string;
    tenant_id: string;
    month: string;
    year: string;
    amount_due: string;
  }>;
}) {
  const params = await searchParams;
  const { house_id, tenant_id, month, year, amount_due } = params;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Fetch existing record if any
  const { data: existing } = await supabase
    .from("rent_records")
    .select("*")
    .eq("house_id", house_id)
    .eq("month", parseInt(month))
    .eq("year", parseInt(year))
    .eq("owner_id", user!.id)
    .maybeSingle();

  // House info
  const { data: house } = await supabase
    .from("houses")
    .select("house_number, properties(name)")
    .eq("id", house_id)
    .single();

  const property = house?.properties as unknown as { name: string } | null;

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/rent"
          className="w-9 h-9 flex items-center justify-center rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/10 border border-transparent transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">
            {existing ? "Update Payment" : "Record Payment"}
          </h1>
          <p className="text-[#94A3B8] text-sm font-mono">
            {property?.name} · Unit {house?.house_number} · {MONTHS[parseInt(month) - 1]} {year}
          </p>
        </div>
      </div>

      <form action={upsertRentRecord} className="bg-[#0F1115] border border-white/10 rounded-2xl p-6 space-y-5">
        {/* Hidden fields */}
        <input type="hidden" name="house_id" value={house_id} />
        <input type="hidden" name="tenant_id" value={tenant_id} />
        <input type="hidden" name="month" value={month} />
        <input type="hidden" name="year" value={year} />

        <div>
          <label className="block text-xs font-mono tracking-wider uppercase text-[#94A3B8] mb-1.5">
            Rent Due (₹)
          </label>
          <input
            type="number"
            name="amount_due"
            defaultValue={existing?.amount_due ?? amount_due}
            required
            min="0"
            step="100"
            className="w-full bg-black/50 border-b-2 border-white/20 focus:border-[#F7931A] transition-all rounded-t-lg h-11 px-4 text-white text-sm outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-mono tracking-wider uppercase text-[#94A3B8] mb-1.5">
            Amount Paid (₹)
          </label>
          <input
            type="number"
            name="amount_paid"
            defaultValue={existing?.amount_paid ?? 0}
            min="0"
            step="100"
            className="w-full bg-black/50 border-b-2 border-white/20 focus:border-[#F7931A] transition-all rounded-t-lg h-11 px-4 text-white text-sm outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-mono tracking-wider uppercase text-[#94A3B8] mb-1.5">
            Payment Mode
          </label>
          <select
            name="payment_mode"
            defaultValue={existing?.payment_mode ?? ""}
            className="w-full bg-black/50 border-b-2 border-white/20 focus:border-[#F7931A] transition-all rounded-t-lg h-11 px-4 text-white text-sm outline-none"
          >
            <option value="">Select mode</option>
            <option value="cash">Cash</option>
            <option value="upi">UPI</option>
            <option value="bank_transfer">Bank Transfer</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-mono tracking-wider uppercase text-[#94A3B8] mb-1.5">
            Payment Date
          </label>
          <input
            type="date"
            name="paid_on"
            defaultValue={existing?.paid_on ?? new Date().toISOString().split("T")[0]}
            className="w-full bg-black/50 border-b-2 border-white/20 focus:border-[#F7931A] transition-all rounded-t-lg h-11 px-4 text-white text-sm outline-none"
          />
        </div>

        <div>
          <label className="block text-xs font-mono tracking-wider uppercase text-[#94A3B8] mb-1.5">
            Notes (optional)
          </label>
          <textarea
            name="notes"
            defaultValue={existing?.notes ?? ""}
            rows={2}
            placeholder="e.g. paid in two installments"
            className="w-full bg-black/50 border-b-2 border-white/20 focus:border-[#F7931A] transition-all rounded-t-lg px-4 py-3 text-white text-sm placeholder:text-white/30 outline-none resize-none"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="w-full h-11 rounded-full bg-gradient-to-r from-[#EA580C] to-[#F7931A] text-white text-sm font-semibold uppercase tracking-wider shadow-[0_0_20px_-5px_rgba(234,88,12,0.5)] hover:scale-[1.02] transition-all"
          >
            {existing ? "Update Record" : "Save Payment"}
          </button>
        </div>
      </form>
    </div>
  );
}

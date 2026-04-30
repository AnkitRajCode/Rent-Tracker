import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { createHouse } from "@/lib/actions/houses";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const HOUSE_TYPES = ["1BHK", "2BHK", "3BHK", "Studio", "Shop", "Godown", "Other"];

export default async function NewHousePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: property } = await supabase
    .from("properties")
    .select("name")
    .eq("id", id)
    .eq("owner_id", user!.id)
    .single();

  if (!property) notFound();

  const action = createHouse.bind(null, id);

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/dashboard/properties/${id}`}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/10 border border-transparent transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Add House</h1>
          <p className="text-[#94A3B8] text-sm font-mono">{property.name}</p>
        </div>
      </div>

      <form action={action} className="bg-[#0F1115] border border-white/10 rounded-2xl p-6 space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono tracking-wider uppercase text-[#94A3B8] mb-1.5">
              House / Unit Number *
            </label>
            <input
              type="text"
              name="house_number"
              placeholder="e.g. 101"
              required
              className="w-full bg-black/50 border-b-2 border-white/20 focus:border-[#F7931A] transition-all rounded-t-lg h-11 px-4 text-white text-sm placeholder:text-white/30 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-mono tracking-wider uppercase text-[#94A3B8] mb-1.5">
              Floor
            </label>
            <input
              type="text"
              name="floor"
              placeholder="e.g. 1st"
              className="w-full bg-black/50 border-b-2 border-white/20 focus:border-[#F7931A] transition-all rounded-t-lg h-11 px-4 text-white text-sm placeholder:text-white/30 outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono tracking-wider uppercase text-[#94A3B8] mb-1.5">
            Type
          </label>
          <select
            name="type"
            className="w-full bg-black/50 border-b-2 border-white/20 focus:border-[#F7931A] transition-all rounded-t-lg h-11 px-4 text-white text-sm outline-none"
          >
            <option value="">Select type</option>
            {HOUSE_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono tracking-wider uppercase text-[#94A3B8] mb-1.5">
              Rent Amount (₹) *
            </label>
            <input
              type="number"
              name="rent_amount"
              placeholder="e.g. 12000"
              required
              min="0"
              step="100"
              className="w-full bg-black/50 border-b-2 border-white/20 focus:border-[#F7931A] transition-all rounded-t-lg h-11 px-4 text-white text-sm placeholder:text-white/30 outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-mono tracking-wider uppercase text-[#94A3B8] mb-1.5">
              Security Deposit (₹)
            </label>
            <input
              type="number"
              name="security_deposit"
              placeholder="e.g. 24000"
              min="0"
              step="100"
              className="w-full bg-black/50 border-b-2 border-white/20 focus:border-[#F7931A] transition-all rounded-t-lg h-11 px-4 text-white text-sm placeholder:text-white/30 outline-none"
            />
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            className="w-full h-11 rounded-full bg-gradient-to-r from-[#EA580C] to-[#F7931A] text-white text-sm font-semibold uppercase tracking-wider shadow-[0_0_20px_-5px_rgba(234,88,12,0.5)] hover:scale-[1.02] transition-all"
          >
            Add House
          </button>
        </div>
      </form>
    </div>
  );
}

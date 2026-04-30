import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import Image from "next/image";
import { MapPin, Plus, ChevronRight } from "lucide-react";

export default async function PropertiesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: properties, error: propError } = await supabase
    .from("properties")
    .select("*, houses!houses_property_id_fkey(count)")
    .eq("owner_id", user!.id)
    .order("created_at", { ascending: false });

  if (propError) console.error("[PropertiesPage] query error:", propError.code, propError.message, propError.details, propError.hint);
  console.log("[PropertiesPage] user.id:", user?.id, "| count:", properties?.length);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white">
            Properties
          </h1>
          <p className="text-[#94A3B8] text-sm mt-1 font-mono">
            {properties?.length ?? 0} properties registered
          </p>
        </div>
        <Link
          href="/dashboard/properties/new"
          className="flex items-center gap-2 h-10 px-4 rounded-full bg-gradient-to-r from-[#EA580C] to-[#F7931A] text-white text-sm font-semibold uppercase tracking-wider shadow-[0_0_20px_-5px_rgba(234,88,12,0.5)] hover:shadow-[0_0_30px_-5px_rgba(247,147,26,0.6)] hover:scale-105 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Property
        </Link>
      </div>

      {!properties || properties.length === 0 ? (
        <div className="bg-[#0F1115] border border-white/10 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl border border-[#EA580C]/30 flex items-center justify-center mx-auto mb-4">
            <Image src="/rent_logo.png" alt="Properties" width={32} height={32} className="text-[#F7931A]" />
          </div>
          <h3 className="font-heading text-xl font-semibold text-white mb-2">
            No properties yet
          </h3>
          <p className="text-[#94A3B8] text-sm mb-6">
            Add your first property to get started.
          </p>
          <Link
            href="/dashboard/properties/new"
            className="inline-flex items-center gap-2 h-10 px-6 rounded-full bg-gradient-to-r from-[#EA580C] to-[#F7931A] text-white text-sm font-semibold uppercase tracking-wider shadow-[0_0_20px_-5px_rgba(234,88,12,0.5)] hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Property
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {properties.map((p) => {
            const houseCount = (p.houses as unknown as { count: number }[])?.[0]?.count ?? 0;
            const addressParts = [p.city, p.state].filter(Boolean);
            return (
              <Link
                key={p.id}
                href={`/dashboard/properties/${p.id}`}
                className="bg-[#0F1115] border border-white/10 rounded-2xl p-6 hover:-translate-y-1 hover:border-[#F7931A]/40 hover:shadow-[0_0_30px_-10px_rgba(247,147,26,0.15)] transition-all duration-300 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl border border-[#EA580C]/40 flex items-center justify-center">
                    <Image src="/rent_logo.png" alt="Property" width={20} height={20} />
                  </div>
                  <ChevronRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#F7931A] transition-colors" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-white mb-1">
                  {p.name}
                </h3>
                {p.house_no && (
                  <p className="text-[#94A3B8] text-xs font-mono mb-1">
                    #{p.house_no}
                  </p>
                )}
                {addressParts.length > 0 && (
                  <div className="flex items-center gap-1 text-[#94A3B8] text-xs mb-4">
                    <MapPin className="w-3 h-3" />
                    {addressParts.join(", ")}
                    {p.pin_code && ` – ${p.pin_code}`}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-1 rounded-full bg-[#F7931A]/10 border border-[#F7931A]/20 text-[#F7931A] text-xs font-mono">
                    {houseCount} house{houseCount !== 1 ? "s" : ""}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}

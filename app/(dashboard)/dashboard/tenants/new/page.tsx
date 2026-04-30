import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import TenantGroupForm from "@/components/tenants/TenantGroupForm";

export default async function NewTenantPage({
  searchParams,
}: {
  searchParams: Promise<{ house_id?: string }>;
}) {
  const { house_id } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // All houses - if pre-selected show info, else show only vacant for selection
  const { data: rawHouses } = await supabase
    .from("houses")
    .select("id, house_number, rent_amount, status, properties(name)")
    .eq("owner_id", user!.id)
    .order("house_number");

  const houses = (rawHouses ?? [])
    .filter((h) => house_id ? h.id === house_id : h.status === "vacant")
    .map((h) => ({
      id: h.id,
      house_number: h.house_number,
      rent_amount: h.rent_amount,
      property_name:
        (h.properties as unknown as { name: string } | null)?.name ?? "Unknown",
    }));

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/tenants"
          className="w-9 h-9 flex items-center justify-center rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/10 border border-transparent transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">
            Add Tenant
          </h1>
          <p className="text-[#94A3B8] text-sm font-mono">
            Primary tenant + all household members
          </p>
        </div>
      </div>

      <TenantGroupForm houses={houses} preselectedHouseId={house_id} />
    </div>
  );
}

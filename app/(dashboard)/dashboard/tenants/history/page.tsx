import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { ArrowLeft, History } from "lucide-react";

export default async function TenantHistoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: history } = await supabase
    .from("tenant_history")
    .select("*, houses(house_number, properties(name))")
    .eq("owner_id", user!.id)
    .order("move_out_date", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/tenants"
          className="w-9 h-9 flex items-center justify-center rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/10 border border-transparent transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Tenant History</h1>
          <p className="text-[#94A3B8] text-sm font-mono">
            {history?.length ?? 0} past tenants
          </p>
        </div>
      </div>

      {!history || history.length === 0 ? (
        <div className="bg-[#0F1115] border border-white/10 rounded-2xl p-12 text-center">
          <History className="w-10 h-10 text-[#94A3B8] mx-auto mb-3" />
          <p className="text-[#94A3B8] text-sm">No vacated tenants yet.</p>
        </div>
      ) : (
        <div className="bg-[#0F1115] border border-white/10 rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10">
                  {["Name", "Phone", "Property / Unit", "Move In", "Move Out"].map((h) => (
                    <th key={h} className="text-left text-xs font-mono tracking-wider uppercase text-[#94A3B8] px-5 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.map((h) => {
                  const house = h.houses as unknown as {
                    house_number: string;
                    properties: { name: string } | null;
                  } | null;
                  return (
                    <tr key={h.id} className="border-b border-white/5 hover:bg-white/3 transition-colors">
                      <td className="px-5 py-3 text-white font-medium">{h.name}</td>
                      <td className="px-5 py-3 text-[#94A3B8] font-mono">{h.phone}</td>
                      <td className="px-5 py-3 text-[#94A3B8]">
                        {house?.properties?.name} · Unit {house?.house_number}
                      </td>
                      <td className="px-5 py-3 text-[#94A3B8] font-mono text-xs">
                        {new Date(h.move_in_date).toLocaleDateString("en-IN")}
                      </td>
                      <td className="px-5 py-3 text-[#94A3B8] font-mono text-xs">
                        {h.move_out_date
                          ? new Date(h.move_out_date).toLocaleDateString("en-IN")
                          : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Home,
  Plus,
  MapPin,
  CheckCircle2,
  Circle,
  Pencil,
  Trash2,
} from "lucide-react";
import { deleteProperty } from "@/lib/actions/properties";
import { deleteHouse } from "@/lib/actions/houses";

const HOUSE_TYPES = ["1BHK", "2BHK", "3BHK", "Studio", "Shop", "Godown", "Other"];

export default async function PropertyDetailPage({
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
    .select("*")
    .eq("id", id)
    .eq("owner_id", user!.id)
    .single();

  if (!property) notFound();

  const { data: houses } = await supabase
    .from("houses")
    .select("*, tenants(name, phone)")
    .eq("property_id", id)
    .order("house_number");

  const occupied = houses?.filter((h) => h.status === "occupied").length ?? 0;
  const vacant = houses?.filter((h) => h.status === "vacant").length ?? 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link
          href="/dashboard/properties"
          className="mt-1 w-9 h-9 flex items-center justify-center rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/10 border border-transparent transition-all flex-shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1">
          <h1 className="font-heading text-2xl font-bold text-white">
            {property.name}
          </h1>
          {(property.city || property.state) && (
            <p className="text-[#94A3B8] text-sm flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3" />
              {[property.address_line, property.city, property.state, property.pin_code]
                .filter(Boolean)
                .join(", ")}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/dashboard/properties/${id}/edit`}
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/10 border border-white/10 text-sm font-mono transition-all"
          >
            <Pencil className="w-3.5 h-3.5" />
            Edit
          </Link>
          <form
            action={deleteProperty.bind(null, id)}
          >
            <button
              type="submit"
              className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-red-400 hover:text-white hover:bg-red-500/20 border border-red-500/20 text-sm font-mono transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete
            </button>
          </form>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Total", value: houses?.length ?? 0, color: "#F7931A" },
          { label: "Occupied", value: occupied, color: "#22c55e" },
          { label: "Vacant", value: vacant, color: "#94A3B8" },
        ].map(({ label, value, color }) => (
          <div
            key={label}
            className="bg-[#0F1115] border border-white/10 rounded-xl p-4 text-center"
          >
            <p
              className="font-heading text-2xl font-bold"
              style={{ color }}
            >
              {value}
            </p>
            <p className="text-[#94A3B8] text-xs font-mono tracking-wider uppercase mt-0.5">
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* Houses list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading text-lg font-semibold text-white">
            Houses / Units
          </h2>
          <Link
            href={`/dashboard/properties/${id}/houses/new`}
            className="flex items-center gap-1.5 h-9 px-4 rounded-full bg-gradient-to-r from-[#EA580C] to-[#F7931A] text-white text-xs font-semibold uppercase tracking-wider shadow-[0_0_15px_-5px_rgba(234,88,12,0.5)] hover:scale-105 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add House
          </Link>
        </div>

        {!houses || houses.length === 0 ? (
          <div className="bg-[#0F1115] border border-white/10 rounded-2xl p-10 text-center">
            <Home className="w-10 h-10 text-[#94A3B8] mx-auto mb-3" />
            <p className="text-[#94A3B8] text-sm">
              No houses added yet. Add your first unit.
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {houses.map((house) => {
              const tenant = (house.tenants as unknown as { name: string; phone: string }[])?.[0];
              return (
                <div
                  key={house.id}
                  className="bg-[#0F1115] border border-white/10 rounded-2xl p-5 hover:border-[#F7931A]/30 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="font-heading font-semibold text-white">
                        Unit {house.house_number}
                      </h3>
                      {house.type && (
                        <span className="text-[#94A3B8] text-xs font-mono">
                          {house.type}
                          {house.floor ? ` · Floor ${house.floor}` : ""}
                        </span>
                      )}
                    </div>
                    <span
                      className={`flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-full border ${
                        house.status === "occupied"
                          ? "text-[#22c55e] bg-[#22c55e]/10 border-[#22c55e]/30"
                          : "text-[#94A3B8] bg-white/5 border-white/10"
                      }`}
                    >
                      {house.status === "occupied" ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <Circle className="w-3 h-3" />
                      )}
                      {house.status}
                    </span>
                  </div>

                  <div className="space-y-1.5 mb-4">
                    <p className="text-[#F7931A] font-mono text-sm font-semibold">
                      ₹{house.rent_amount.toLocaleString("en-IN")}/mo
                    </p>
                    {house.security_deposit > 0 && (
                      <p className="text-[#94A3B8] text-xs font-mono">
                        Deposit: ₹{house.security_deposit.toLocaleString("en-IN")}
                      </p>
                    )}
                    {tenant && (
                      <p className="text-white text-xs">
                        👤 {tenant.name}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 pt-3 border-t border-white/5">
                    {house.status === "vacant" ? (
                      <Link
                        href={`/dashboard/tenants/new?house_id=${house.id}&property_id=${id}`}
                        className="flex-1 text-center text-xs font-mono text-[#F7931A] hover:text-white py-1 px-2 rounded-lg hover:bg-[#F7931A]/10 transition-all"
                      >
                        + Add Tenant
                      </Link>
                    ) : (
                      <Link
                        href={`/dashboard/tenants?house_id=${house.id}`}
                        className="flex-1 text-center text-xs font-mono text-[#94A3B8] hover:text-white py-1 px-2 rounded-lg hover:bg-white/10 transition-all"
                      >
                        View Tenant
                      </Link>
                    )}
                    <Link
                      href={`/dashboard/properties/${id}/houses/${house.id}/edit`}
                      className="text-xs font-mono text-[#94A3B8] hover:text-white py-1 px-2 rounded-lg hover:bg-white/10 transition-all"
                    >
                      Edit
                    </Link>
                    <form action={deleteHouse.bind(null, house.id, id)}>
                      <button
                        type="submit"
                        className="text-xs font-mono text-red-400/60 hover:text-red-400 py-1 px-2 rounded-lg hover:bg-red-400/10 transition-all"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

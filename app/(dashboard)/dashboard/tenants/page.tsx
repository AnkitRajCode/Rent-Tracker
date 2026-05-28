import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import {
  Users,
  Plus,
  Phone,
  Calendar,
  CheckCircle2,
  History,
  Mail,
  FileText,
  UserCheck,
} from "lucide-react";
import { vacateTenant } from "@/lib/actions/tenants";
import ToggleLoginAccess from "@/components/tenants/ToggleLoginAccess";
import ExportButton from "@/components/ExportButton";

export default async function TenantsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: tenants } = await supabase
    .from("tenants")
    .select(
      "*, tenant_members(id, name, phone, email, is_primary), houses(house_number, rent_amount, properties(name))"
    )
    .eq("owner_id", user!.id)
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-3xl font-bold text-white">
            Tenants
          </h1>
          <p className="text-[#94A3B8] text-sm mt-1 font-mono">
            {tenants?.length ?? 0} active{" "}
            {(tenants?.length ?? 0) === 1 ? "tenancy" : "tenancies"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton type="tenant" />
          <Link
            href="/dashboard/tenants/history"
            className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/10 border border-white/10 text-xs font-mono transition-all"
          >
            <History className="w-3.5 h-3.5" />
            History
          </Link>
          <Link
            href="/dashboard/tenants/new"
            className="flex items-center gap-2 h-10 px-4 rounded-full bg-gradient-to-r from-[#EA580C] to-[#F7931A] text-white text-sm font-semibold uppercase tracking-wider shadow-[0_0_20px_-5px_rgba(234,88,12,0.5)] hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Tenant
          </Link>
        </div>
      </div>

      {!tenants || tenants.length === 0 ? (
        <div className="bg-[#0F1115] border border-white/10 rounded-2xl p-12 text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#EA580C]/20 border border-[#EA580C]/30 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-[#F7931A]" />
          </div>
          <h3 className="font-heading text-xl font-semibold text-white mb-2">
            No tenants yet
          </h3>
          <p className="text-[#94A3B8] text-sm mb-6">
            Assign a tenant group to an occupied house.
          </p>
          <Link
            href="/dashboard/tenants/new"
            className="inline-flex items-center gap-2 h-10 px-6 rounded-full bg-gradient-to-r from-[#EA580C] to-[#F7931A] text-white text-sm font-semibold uppercase tracking-wider shadow-[0_0_20px_-5px_rgba(234,88,12,0.5)] hover:scale-105 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add Tenant
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {tenants.map((tenant) => {
            const house = tenant.houses as unknown as {
              house_number: string;
              rent_amount: number;
              properties: { name: string } | null;
            } | null;

            const members = (
              tenant.tenant_members as unknown as Array<{
                id: string;
                name: string;
                phone: string | null;
                email: string | null;
                is_primary: boolean;
              }>
            ) ?? [];

            const primary = members.find((m) => m.is_primary) ?? members[0];
            // Fallback for old-model tenants that haven't been migrated yet
            const displayName = primary?.name ?? tenant.name;
            const displayPhone = primary?.phone ?? tenant.phone;
            const displayEmail = primary?.email ?? tenant.email;
            const hasEmail = !!displayEmail;

            return (
              <div
                key={tenant.id}
                className="bg-[#0F1115] border border-white/10 rounded-2xl p-5 hover:border-[#F7931A]/20 transition-all flex flex-col"
              >
                {/* Top row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <UserCheck className="w-3.5 h-3.5 text-[#F7931A] flex-shrink-0" />
                      <h3 className="font-heading font-semibold text-white truncate">
                        {displayName}
                      </h3>
                    </div>
                    {house && (
                      <p className="text-[#94A3B8] text-xs font-mono mt-0.5">
                        {house.properties?.name} &middot; Unit {house.house_number}
                      </p>
                    )}
                  </div>
                  <span className="ml-2 flex items-center gap-1 text-xs font-mono px-2 py-0.5 rounded-full border text-[#22c55e] bg-[#22c55e]/10 border-[#22c55e]/30 flex-shrink-0">
                    <CheckCircle2 className="w-3 h-3" />
                    Active
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-1.5 mb-3 flex-1">
                  {displayPhone && (
                    <p className="flex items-center gap-1.5 text-[#94A3B8] text-xs">
                      <Phone className="w-3 h-3" />
                      {displayPhone}
                    </p>
                  )}
                  {displayEmail && (
                    <p className="flex items-center gap-1.5 text-[#94A3B8] text-xs truncate">
                      <Mail className="w-3 h-3 flex-shrink-0" />
                      {displayEmail}
                    </p>
                  )}
                  <p className="flex items-center gap-1.5 text-[#94A3B8] text-xs">
                    <Calendar className="w-3 h-3" />
                    Move-in:{" "}
                    {new Date(tenant.move_in_date).toLocaleDateString("en-IN")}
                  </p>
                  <p className="text-[#F7931A] font-mono text-sm font-semibold">
                    &#8377;{house?.rent_amount.toLocaleString("en-IN")}/mo
                    <span className="text-[#94A3B8] text-xs font-normal ml-1">
                      &middot; Due {tenant.rent_due_day}th
                    </span>
                  </p>

                  {/* Member badges */}
                  {members.length > 1 && (
                    <div className="flex flex-wrap gap-1 pt-0.5">
                      {members
                        .filter((m) => !m.is_primary)
                        .map((m) => (
                          <span
                            key={m.id}
                            className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[#94A3B8]"
                          >
                            {m.name}
                          </span>
                        ))}
                    </div>
                  )}

                  {/* Agreement indicator */}
                  {tenant.agreement_url && (
                    <a
                      href={tenant.agreement_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[10px] font-mono text-[#94A3B8] hover:text-[#F7931A] transition-colors"
                    >
                      <FileText className="w-3 h-3" />
                      View agreement
                    </a>
                  )}
                </div>

                {/* Portal access toggle */}
                <div className="flex items-center gap-2 py-2.5 border-t border-b border-white/5 mb-3">
                  <span className="text-xs font-mono text-[#94A3B8] flex-1">
                    Portal access
                  </span>
                  {tenant.can_login && (
                    <span className="text-[10px] font-mono text-[#FFD600] bg-[#FFD600]/10 border border-[#FFD600]/20 px-2 py-0.5 rounded-full">
                      enabled
                    </span>
                  )}
                  <ToggleLoginAccess
                    tenantId={tenant.id}
                    canLogin={tenant.can_login}
                    hasEmail={hasEmail}
                  />
                </div>

                {/* Actions */}
                <div className="flex items-center gap-1">
                  <Link
                    href={`/dashboard/rent?house_id=${tenant.house_id}`}
                    className="flex-1 text-center text-xs font-mono text-[#F7931A] hover:text-white py-1.5 px-2 rounded-lg hover:bg-[#F7931A]/10 transition-all"
                  >
                    Rent Records
                  </Link>
                  <Link
                    href={`/dashboard/tenants/${tenant.id}/edit`}
                    className="text-xs font-mono text-[#94A3B8] hover:text-white py-1.5 px-2 rounded-lg hover:bg-white/10 transition-all"
                  >
                    Edit
                  </Link>
                  <form action={vacateTenant.bind(null, tenant.id, tenant.house_id)}>
                    <button
                      type="submit"
                      className="text-xs font-mono text-red-400/60 hover:text-red-400 py-1.5 px-2 rounded-lg hover:bg-red-400/10 transition-all cursor-pointer"
                    >
                      Vacate
                    </button>
                  </form>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

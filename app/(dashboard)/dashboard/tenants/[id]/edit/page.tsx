import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserCheck, Users } from "lucide-react";
import { revalidatePath } from "next/cache";
import { updateTenant } from "@/lib/actions/tenants";

async function updateTenantRefund(formData: FormData) {
  "use server";
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = formData.get("id") as string;
  const refundAmount = formData.get("deposit_refund_amount");
  const published = formData.get("deposit_refund_published") === "on";

  const { error } = await supabase
    .from("tenants")
    .update({
      deposit_refund_amount: refundAmount ? Number.parseFloat(refundAmount as string) : null,
      deposit_refund_published: published,
    } as never)
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/tenants");
  redirect("/dashboard/tenants");
}

async function handleUpdateTenant(formData: FormData) {
  "use server";
  const id = formData.get("tenant_id") as string;
  const moveInDate = formData.get("move_in_date") as string;
  const rentDueDay = Number.parseInt(formData.get("rent_due_day") as string);
  const agreementUrl = (formData.get("agreement_url") as string) ?? "";

  // Parse members from indexed form fields
  const members: Array<{ id: string; name: string; phone: string; email: string; aadhaarNumber: string }> = [];
  let i = 0;
  while (formData.get(`members[${i}][id]`)) {
    members.push({
      id: formData.get(`members[${i}][id]`) as string,
      name: formData.get(`members[${i}][name]`) as string,
      phone: (formData.get(`members[${i}][phone]`) as string) ?? "",
      email: (formData.get(`members[${i}][email]`) as string) ?? "",
      aadhaarNumber: (formData.get(`members[${i}][aadhaar]`) as string) ?? "",
    });
    i++;
  }

  await updateTenant({ id, moveInDate, rentDueDay, agreementUrl, members });
}

export default async function EditTenantPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: tenant } = await supabase
    .from("tenants")
    .select("*, houses(house_number, rent_amount, security_deposit, properties(name))")
    .eq("id", id)
    .eq("owner_id", user.id)
    .single();

  if (!tenant) notFound();

  const { data: members } = await supabase
    .from("tenant_members")
    .select("*")
    .eq("tenant_id", id)
    .order("is_primary", { ascending: false });

  const house = tenant.houses as unknown as {
    house_number: string;
    rent_amount: number;
    security_deposit: number;
    properties: { name: string } | null;
  } | null;

  const t = tenant as unknown as {
    deposit_refund_amount: number | null;
    deposit_refund_published: boolean;
    move_in_date: string;
    rent_due_day: number;
    agreement_url: string | null;
  } & typeof tenant;

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
          <h1 className="font-heading text-2xl font-bold text-white">{tenant.name}</h1>
          <p className="text-[#94A3B8] text-sm font-mono">
            {house?.properties?.name} &middot; Unit {house?.house_number}
          </p>
        </div>
      </div>

      {/* ── Tenancy Details Form ─────────────────── */}
      <form action={handleUpdateTenant} className="bg-[#0F1115] border border-white/10 rounded-2xl p-6 space-y-5">
        <h2 className="font-heading text-base font-semibold text-white flex items-center gap-2">
          <UserCheck className="w-4 h-4 text-[#F7931A]" /> Tenancy Details
        </h2>

        <input type="hidden" name="tenant_id" value={id} />

        <div className="p-3 bg-white/5 rounded-xl text-xs font-mono text-[#94A3B8] space-y-0.5">
          <p>Monthly rent: <span className="text-[#F7931A] font-bold">&#8377;{(house?.rent_amount ?? 0).toLocaleString("en-IN")}</span></p>
          <p>Security deposit: <span className="text-[#FFD600] font-bold">&#8377;{(house?.security_deposit ?? 0).toLocaleString("en-IN")}</span></p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono tracking-wider uppercase text-[#94A3B8] mb-1.5">
              Move-in Date
            </label>
            <input
              type="date"
              name="move_in_date"
              defaultValue={t.move_in_date}
              required
              className="w-full bg-black/50 border-b-2 border-white/20 focus:border-[#F7931A] transition-all rounded-t-lg h-11 px-4 text-white text-sm outline-none"
            />
          </div>
          <div>
            <label className="block text-xs font-mono tracking-wider uppercase text-[#94A3B8] mb-1.5">
              Rent Due Day
            </label>
            <input
              type="number"
              name="rent_due_day"
              defaultValue={t.rent_due_day}
              min={1}
              max={31}
              required
              className="w-full bg-black/50 border-b-2 border-white/20 focus:border-[#F7931A] transition-all rounded-t-lg h-11 px-4 text-white text-sm outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono tracking-wider uppercase text-[#94A3B8] mb-1.5">
            Agreement URL (optional)
          </label>
          <input
            type="url"
            name="agreement_url"
            defaultValue={t.agreement_url ?? ""}
            placeholder="https://..."
            className="w-full bg-black/50 border-b-2 border-white/20 focus:border-[#F7931A] transition-all rounded-t-lg h-11 px-4 text-white text-sm placeholder:text-white/30 outline-none"
          />
        </div>

        {/* Members */}
        {(members ?? []).length > 0 && (
          <div className="space-y-4 pt-2">
            <h3 className="text-xs font-mono tracking-wider uppercase text-[#94A3B8] flex items-center gap-2">
              <Users className="w-3.5 h-3.5" /> Members
            </h3>
            {(members ?? []).map((member, idx) => {
              const m = member as unknown as { id: string; name: string; phone: string | null; email: string | null; aadhaar_number: string | null; is_primary: boolean };
              return (
                <div key={m.id} className="p-4 bg-white/5 rounded-xl space-y-3 border border-white/10">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-[#94A3B8]">
                      {m.is_primary ? "Primary member" : `Member ${idx + 1}`}
                    </span>
                    {m.is_primary && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F7931A]/20 border border-[#F7931A]/40 text-[#F7931A] font-mono">
                        Primary
                      </span>
                    )}
                  </div>
                  <input type="hidden" name={`members[${idx}][id]`} value={m.id} />
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-mono text-[#94A3B8] mb-1">Name *</label>
                      <input
                        type="text"
                        name={`members[${idx}][name]`}
                        defaultValue={m.name}
                        required
                        className="w-full bg-black/50 border-b-2 border-white/20 focus:border-[#F7931A] transition-all rounded-t-lg h-9 px-3 text-white text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-[#94A3B8] mb-1">Phone</label>
                      <input
                        type="tel"
                        name={`members[${idx}][phone]`}
                        defaultValue={m.phone ?? ""}
                        className="w-full bg-black/50 border-b-2 border-white/20 focus:border-[#F7931A] transition-all rounded-t-lg h-9 px-3 text-white text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-[#94A3B8] mb-1">Email</label>
                      <input
                        type="email"
                        name={`members[${idx}][email]`}
                        defaultValue={m.email ?? ""}
                        className="w-full bg-black/50 border-b-2 border-white/20 focus:border-[#F7931A] transition-all rounded-t-lg h-9 px-3 text-white text-sm outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-mono text-[#94A3B8] mb-1">Aadhaar No.</label>
                      <input
                        type="text"
                        name={`members[${idx}][aadhaar]`}
                        defaultValue={m.aadhaar_number ?? ""}
                        placeholder="XXXX XXXX XXXX"
                        className="w-full bg-black/50 border-b-2 border-white/20 focus:border-[#F7931A] transition-all rounded-t-lg h-9 px-3 text-white text-sm placeholder:text-white/30 outline-none"
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <button
          type="submit"
          className="w-full h-11 rounded-full bg-gradient-to-r from-[#EA580C] to-[#F7931A] text-white text-sm font-semibold uppercase tracking-wider shadow-[0_0_20px_-5px_rgba(234,88,12,0.5)] hover:scale-[1.02] transition-all"
        >
          Save Tenant Details
        </button>
      </form>

      {/* ── Deposit Refund ──────────────────────── */}
      <form action={updateTenantRefund} className="bg-[#0F1115] border border-white/10 rounded-2xl p-6 space-y-5">
        <h2 className="font-heading text-base font-semibold text-white">Deposit Refund</h2>
        <input type="hidden" name="id" value={id} />

        <div className="p-3 bg-white/5 rounded-xl text-xs font-mono text-[#94A3B8] space-y-0.5">
          <p>Security deposit collected: <span className="text-[#FFD600] font-bold">&#8377;{(house?.security_deposit ?? 0).toLocaleString("en-IN")}</span></p>
        </div>

        <div>
          <label className="block text-xs font-mono tracking-wider uppercase text-[#94A3B8] mb-1.5">
            Deposit Refund Amount
          </label>
          <div className="flex items-center gap-2 bg-black/50 border-b-2 border-white/20 focus-within:border-[#F7931A] transition-all rounded-t-lg px-4 h-11">
            <span className="text-[#94A3B8] text-sm font-mono">&#8377;</span>
            <input
              type="number"
              name="deposit_refund_amount"
              min="0"
              step="0.01"
              defaultValue={t.deposit_refund_amount ?? ""}
              placeholder="Enter refund amount"
              className="flex-1 bg-transparent text-white text-sm placeholder:text-white/30 outline-none font-mono"
            />
          </div>
          <p className="text-[#94A3B8] text-xs font-mono mt-1.5">Leave empty if refund not yet decided.</p>
        </div>

        <div className="flex items-start gap-3 p-4 bg-white/5 rounded-xl">
          <input
            type="checkbox"
            id="deposit_refund_published"
            name="deposit_refund_published"
            defaultChecked={t.deposit_refund_published}
            className="mt-0.5 w-4 h-4 rounded accent-[#F7931A] flex-shrink-0 cursor-pointer"
          />
          <div>
            <label htmlFor="deposit_refund_published" className="text-white text-sm font-medium cursor-pointer">
              Publish refund amount to tenant
            </label>
            <p className="text-[#94A3B8] text-xs mt-0.5">
              When checked, the tenant can see this amount in their portal. Keep unchecked until confirmed.
            </p>
          </div>
        </div>

        <button
          type="submit"
          className="w-full h-11 rounded-full bg-gradient-to-r from-[#EA580C] to-[#F7931A] text-white text-sm font-semibold uppercase tracking-wider shadow-[0_0_20px_-5px_rgba(234,88,12,0.5)] hover:scale-[1.02] transition-all"
        >
          Save Deposit Info
        </button>
      </form>
    </div>
  );
}
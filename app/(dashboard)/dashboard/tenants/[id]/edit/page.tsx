import { createClient } from "@/lib/supabase/server";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { revalidatePath } from "next/cache";
import EditTenantForm from "@/components/tenants/EditTenantForm";

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

  const memberData = (members ?? []).map((m) => {
    const mm = m as unknown as { id: string; name: string; phone: string | null; email: string | null; aadhaar_number: string | null; aadhaar_doc_url: string | null; is_primary: boolean };
    return {
      id: mm.id,
      name: mm.name,
      phone: mm.phone ?? "",
      email: mm.email ?? "",
      aadhaarNumber: mm.aadhaar_number ?? "",
      aadhaarDocUrl: mm.aadhaar_doc_url ?? "",
      isPrimary: mm.is_primary,
    };
  });

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

      {/* ── Tenancy Details + Members ─────────── */}
      <EditTenantForm
        tenantId={id}
        moveInDate={t.move_in_date}
        rentDueDay={t.rent_due_day}
        agreementUrl={t.agreement_url ?? ""}
        rentAmount={house?.rent_amount ?? 0}
        securityDeposit={house?.security_deposit ?? 0}
        initialMembers={memberData}
      />

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
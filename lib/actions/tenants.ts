"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export type MemberInput = {
  name: string;
  phone: string;
  email: string;
  aadhaarNumber: string;
  aadhaarDocUrl: string;
  isPrimary: boolean;
};

export async function createTenantGroup(input: {
  houseId: string;
  moveInDate: string;
  rentDueDay: number;
  agreementUrl: string;
  members: MemberInput[];
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const primary = input.members.find((m) => m.isPrimary) ?? input.members[0];

  // Create the tenant group record (name/phone kept for backward-compat with rent page)
  const { data: tenant, error: tenantError } = await supabase
    .from("tenants")
    .insert({
      house_id: input.houseId,
      owner_id: user.id,
      name: primary.name,
      phone: primary.phone || "",
      email: primary.email || null,
      move_in_date: input.moveInDate,
      rent_due_day: input.rentDueDay,
      agreement_url: input.agreementUrl || null,
    })
    .select("id")
    .single();

  if (tenantError) throw new Error(tenantError.message);

  // Create all members
  const { error: membersError } = await supabase.from("tenant_members").insert(
    input.members.map((m) => ({
      tenant_id: tenant.id,
      owner_id: user.id,
      name: m.name,
      phone: m.phone || null,
      email: m.email || null,
      aadhaar_number: m.aadhaarNumber || null,
      aadhaar_doc_url: m.aadhaarDocUrl || null,
      is_primary: m.isPrimary,
    }))
  );

  if (membersError) throw new Error(membersError.message);

  revalidatePath("/dashboard/tenants");
  revalidatePath("/dashboard");
  redirect("/dashboard/tenants");
}

export async function vacateTenant(tenantId: string, houseId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Get primary member (new model)
  const { data: primaryMember } = await supabase
    .from("tenant_members")
    .select("*")
    .eq("tenant_id", tenantId)
    .eq("is_primary", true)
    .maybeSingle();

  // Get tenant record
  const { data: tenant } = await supabase
    .from("tenants")
    .select("*")
    .eq("id", tenantId)
    .eq("owner_id", user.id)
    .single();

  if (!tenant) throw new Error("Tenant not found");

  // Use primary member data if available, else fall back to tenants.name/phone
  const name = primaryMember?.name ?? tenant.name;
  const phone = primaryMember?.phone ?? tenant.phone;
  const aadhaar = primaryMember?.aadhaar_number ?? tenant.aadhaar;

  await supabase.from("tenant_history").insert({
    house_id: houseId,
    owner_id: user.id,
    name,
    phone,
    aadhaar,
    move_in_date: tenant.move_in_date,
    move_out_date: new Date().toISOString().split("T")[0],
  });

  const { error } = await supabase
    .from("tenants")
    .delete()
    .eq("id", tenantId)
    .eq("owner_id", user.id);

  if (error) throw new Error(error.message);

  revalidatePath("/dashboard/tenants");
  revalidatePath("/dashboard");
  redirect("/dashboard/tenants");
}

export async function updateTenantLoginAccess(
  tenantId: string,
  canLogin: boolean
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("tenants")
    .update({ can_login: canLogin })
    .eq("id", tenantId)
    .eq("owner_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/tenants");
}

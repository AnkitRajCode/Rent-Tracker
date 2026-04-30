"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function upsertRentRecord(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const houseId = formData.get("house_id") as string;
  const tenantId = formData.get("tenant_id") as string;
  const month = parseInt(formData.get("month") as string);
  const year = parseInt(formData.get("year") as string);
  const amountDue = parseFloat(formData.get("amount_due") as string);
  const amountPaid = parseFloat(formData.get("amount_paid") as string) || 0;
  const paymentMode = (formData.get("payment_mode") as string) || null;
  const paidOn = (formData.get("paid_on") as string) || null;
  const notes = (formData.get("notes") as string) || null;

  const status =
    amountPaid === 0
      ? "pending"
      : amountPaid >= amountDue
        ? "paid"
        : "partial";

  const { error } = await supabase.from("rent_records").upsert(
    {
      house_id: houseId,
      tenant_id: tenantId,
      owner_id: user.id,
      month,
      year,
      amount_due: amountDue,
      amount_paid: amountPaid,
      status,
      payment_mode: paymentMode as "cash" | "upi" | "bank_transfer" | null,
      paid_on: paidOn,
      notes,
    },
    { onConflict: "house_id,month,year" }
  );

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/rent");
  revalidatePath("/dashboard");
  redirect("/dashboard/rent");
}

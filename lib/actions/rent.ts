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
  const month = Number.parseInt(formData.get("month") as string);
  const year = Number.parseInt(formData.get("year") as string);
  const amountDue = Number.parseFloat(formData.get("amount_due") as string);
  const electricityBill = Number.parseFloat(formData.get("electricity_bill") as string) || 0;
  const maintenance = Number.parseFloat(formData.get("maintenance") as string) || 0;
  const amountPaid = Number.parseFloat(formData.get("amount_paid") as string) || 0;
  const paymentMode = (formData.get("payment_mode") as string) || null;
  const paidOn = (formData.get("paid_on") as string) || null;
  const notes = (formData.get("notes") as string) || null;

  const totalDue = amountDue + electricityBill + maintenance;
  let status: "pending" | "paid" | "partial";
  if (amountPaid === 0) {
    status = "pending";
  } else if (amountPaid >= totalDue) {
    status = "paid";
  } else {
    status = "partial";
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase.from("rent_records") as any).upsert(
    {
      house_id: houseId,
      tenant_id: tenantId,
      owner_id: user.id,
      month,
      year,
      amount_due: amountDue,
      electricity_bill: electricityBill,
      maintenance,
      amount_paid: amountPaid,
      status,
      payment_mode: paymentMode,
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

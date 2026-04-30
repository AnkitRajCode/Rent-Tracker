"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createHouse(propertyId: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("houses").insert({
    property_id: propertyId,
    owner_id: user.id,
    house_number: formData.get("house_number") as string,
    floor: (formData.get("floor") as string) || null,
    type: (formData.get("type") as string) || null,
    rent_amount: parseFloat(formData.get("rent_amount") as string) || 0,
    security_deposit:
      parseFloat(formData.get("security_deposit") as string) || 0,
    status: "vacant",
  });

  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/properties/${propertyId}`);
  redirect(`/dashboard/properties/${propertyId}`);
}

export async function updateHouse(
  id: string,
  propertyId: string,
  formData: FormData
) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("houses")
    .update({
      house_number: formData.get("house_number") as string,
      floor: (formData.get("floor") as string) || null,
      type: (formData.get("type") as string) || null,
      rent_amount: parseFloat(formData.get("rent_amount") as string) || 0,
      security_deposit:
        parseFloat(formData.get("security_deposit") as string) || 0,
    })
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/properties/${propertyId}`);
  redirect(`/dashboard/properties/${propertyId}`);
}

export async function deleteHouse(id: string, propertyId: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("houses")
    .delete()
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath(`/dashboard/properties/${propertyId}`);
  redirect(`/dashboard/properties/${propertyId}`);
}

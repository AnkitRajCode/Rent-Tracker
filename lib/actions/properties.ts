"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createProperty(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase.from("properties").insert({
    owner_id: user.id,
    name: formData.get("name") as string,
    house_no: (formData.get("house_no") as string) || null,
    address_line: (formData.get("address_line") as string) || null,
    city: (formData.get("city") as string) || null,
    state: (formData.get("state") as string) || null,
    pin_code: (formData.get("pin_code") as string) || null,
    landmark: (formData.get("landmark") as string) || null,
  });

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/properties");
  redirect("/dashboard/properties");
}

export async function updateProperty(id: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("properties")
    .update({
      name: formData.get("name") as string,
      house_no: (formData.get("house_no") as string) || null,
      address_line: (formData.get("address_line") as string) || null,
      city: (formData.get("city") as string) || null,
      state: (formData.get("state") as string) || null,
      pin_code: (formData.get("pin_code") as string) || null,
      landmark: (formData.get("landmark") as string) || null,
    })
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/properties");
  redirect(`/dashboard/properties/${id}`);
}

export async function deleteProperty(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("properties")
    .delete()
    .eq("id", id)
    .eq("owner_id", user.id);

  if (error) throw new Error(error.message);
  revalidatePath("/dashboard/properties");
  redirect("/dashboard/properties");
}

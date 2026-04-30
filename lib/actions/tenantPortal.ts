"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

const COOKIE_NAME = "rt_tenant_id";

export async function tenantLogin(
  prevState: { error: string },
  formData: FormData
): Promise<{ error: string }> {
  const raw = formData.get("email");
  const email = typeof raw === "string" ? raw.trim().toLowerCase() : "";

  if (!email) return { error: "Please enter your email address." };

  const supabase = createAdminClient();

  const { data: tenant } = await supabase
    .from("tenants")
    .select("id, name, can_login")
    .ilike("email", email)
    .eq("can_login", true)
    .maybeSingle();

  if (!tenant) {
    // Check if this email belongs to an owner account (helpful hint)
    const adminCheck = createAdminClient();
    const { data: profile } = await adminCheck
      .from("profiles")
      .select("id")
      .ilike("email", email)
      .maybeSingle();

    if (profile) {
      return {
        error:
          "This email belongs to an owner account. Please sign in as a tenant using your registered tenant email, or go to the owner portal at /login.",
      };
    }

    return {
      error:
        "No tenant portal access found for this email. Please contact your property owner to ensure your email is registered and portal access is enabled.",
    };
  }

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, tenant.id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });

  redirect("/tenant/dashboard");
}

export async function tenantLogout(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
  redirect("/tenant/login");
}

export async function getTenantIdFromCookie(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(COOKIE_NAME)?.value ?? null;
}

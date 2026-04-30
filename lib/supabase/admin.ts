import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/types";

/**
 * Server-only Supabase client with the service role key.
 * Bypasses RLS — always filter by tenant_id / owner_id manually.
 * NEVER import this in client components or expose it to the browser.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !key) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY environment variable."
    );
  }

  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

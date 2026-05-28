import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "RentTracker - Smart Rent Management for Property Owners",
  description:
    "RentTracker helps property owners manage houses, tenants, and monthly rent payments effortlessly. Track collections, generate receipts, and give tenants secure portal access to their payment history.",
  keywords: [
    "rent tracker",
    "rent management app",
    "property management India",
    "tenant management",
    "rent collection tracker",
    "house rent receipt",
    "landlord software India",
    "rental property management",
    "monthly rent tracker",
    "NextGenUI",
  ],
  openGraph: {
    title: "RentTracker - Smart Rent Management for Property Owners",
    description:
      "Manage properties, tenants, and rent payments. Track collections, generate receipts, and provide tenants secure portal access.",
  },
};

export default async function RootPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  } else {
    redirect("/login");
  }
}

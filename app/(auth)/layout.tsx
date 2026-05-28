import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Owner Login - RentTracker",
  description:
    "Sign in to RentTracker to manage your properties, tenants, and rent payments. Property owners can track collections, generate receipts, and more.",
  keywords: [
    "rent tracker login",
    "property owner login",
    "landlord portal",
    "rent management login",
    "RentTracker sign in",
  ],
  openGraph: {
    title: "Owner Login - RentTracker",
    description: "Sign in to manage your properties, tenants, and rent payments.",
  },
};

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

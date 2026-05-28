import type { Metadata } from "next";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Tenant Portal - RentTracker",
  description:
    "Access your tenant portal to view rent payment history, download receipts, and check deposit details. Secure read-only access for tenants.",
  keywords: [
    "tenant portal",
    "tenant login",
    "rent payment history",
    "rent receipt download",
    "tenant dashboard",
    "RentTracker tenant",
  ],
  openGraph: {
    title: "Tenant Portal - RentTracker",
    description: "View your rent payment history, download receipts, and check deposit details.",
  },
};

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#030304] flex flex-col">
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}

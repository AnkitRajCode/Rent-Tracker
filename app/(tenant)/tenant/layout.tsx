import Footer from "@/components/layout/Footer";

export default function TenantLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#030304] flex flex-col">
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  );
}

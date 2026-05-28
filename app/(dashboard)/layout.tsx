import Sidebar from "@/components/layout/sidebar";
import Footer from "@/components/layout/Footer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#030304] flex flex-col">
      <div className="print:hidden">
        <Sidebar />
      </div>
      {/* Main content - offset for desktop sidebar and mobile top bar */}
      <main className="lg:pl-60 pt-14 lg:pt-0 flex-1 flex flex-col print:pl-0 print:pt-0">
        <div className="p-6 lg:p-8 flex-1 print:p-0">{children}</div>
        <div className="lg:px-8 print:hidden">
          <Footer />
        </div>
      </main>
    </div>
  );
}

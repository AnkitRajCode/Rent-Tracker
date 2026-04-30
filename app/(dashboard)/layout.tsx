import Sidebar from "@/components/layout/sidebar";
import Footer from "@/components/layout/Footer";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#030304] flex flex-col">
      <Sidebar />
      {/* Main content - offset for desktop sidebar and mobile top bar */}
      <main className="lg:pl-60 pt-14 lg:pt-0 flex-1 flex flex-col">
        <div className="p-6 lg:p-8 flex-1">{children}</div>
        <div className="lg:px-8">
          <Footer />
        </div>
      </main>
    </div>
  );
}

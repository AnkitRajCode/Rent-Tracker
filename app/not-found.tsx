import Link from "next/link";
import { Home, Users } from "lucide-react";

export default function NotFound() {
  return (
    <div className="relative min-h-screen bg-[#030304] flex items-center justify-center overflow-hidden px-4">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundSize: "50px 50px",
          backgroundImage:
            "linear-gradient(to right, rgba(30,41,59,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(30,41,59,0.5) 1px, transparent 1px)",
          maskImage: "radial-gradient(circle at center, black 40%, transparent 100%)",
        }}
      />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#F7931A] opacity-5 blur-[120px] rounded-full pointer-events-none" />

      <div className="relative z-10 w-full max-w-md text-center">
        <p className="font-mono text-[#F7931A] text-sm tracking-widest uppercase mb-2">
          404 — Page Not Found
        </p>
        <h1 className="font-heading text-4xl font-bold text-white mb-3">
          Oops! Wrong turn.
        </h1>
        <p className="text-[#94A3B8] text-sm mb-10">
          The page you&apos;re looking for doesn&apos;t exist. Where would you like to go?
        </p>

        <div className="grid grid-cols-2 gap-4">
          <Link
            href="/login"
            className="flex flex-col items-center gap-3 bg-[#0F1115] border border-white/10 hover:border-[#F7931A]/40 rounded-2xl p-6 transition-all hover:-translate-y-1 group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#EA580C]/20 border border-[#EA580C]/40 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Home className="w-5 h-5 text-[#F7931A]" />
            </div>
            <div>
              <p className="font-heading font-semibold text-white text-sm">Owner</p>
              <p className="text-[#94A3B8] text-xs font-mono mt-0.5">Property owner login</p>
            </div>
          </Link>

          <Link
            href="/tenant/login"
            className="flex flex-col items-center gap-3 bg-[#0F1115] border border-white/10 hover:border-[#22c55e]/40 rounded-2xl p-6 transition-all hover:-translate-y-1 group"
          >
            <div className="w-12 h-12 rounded-xl bg-[#22c55e]/20 border border-[#22c55e]/40 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5 text-[#22c55e]" />
            </div>
            <div>
              <p className="font-heading font-semibold text-white text-sm">Tenant</p>
              <p className="text-[#94A3B8] text-xs font-mono mt-0.5">Tenant portal login</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}

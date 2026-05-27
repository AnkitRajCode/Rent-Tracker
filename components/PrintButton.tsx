"use client";

import { Printer } from "lucide-react";

export default function PrintButton() {
  return (
    <button
      onClick={() => globalThis.window?.print()}
      className="flex items-center gap-2 h-9 px-4 rounded-full bg-gradient-to-r from-[#EA580C] to-[#F7931A] text-white text-xs font-semibold uppercase tracking-wider hover:scale-105 transition-all"
    >
      <Printer className="w-3.5 h-3.5" />
      Print Receipt
    </button>
  );
}

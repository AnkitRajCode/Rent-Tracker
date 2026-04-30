"use client";

import { Download } from "lucide-react";

export default function ExportCSVButton({
  filename,
  headers,
  rows,
}: {
  filename: string;
  headers: string[];
  rows: (string | number | null | undefined)[][];
}) {
  function download() {
    const escape = (v: string | number | null | undefined) => {
      const s = String(v ?? "").replace(/"/g, '""');
      return /[",\n\r]/.test(s) ? `"${s}"` : s;
    };
    const csv = [headers, ...rows].map((r) => r.map(escape).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      type="button"
      onClick={download}
      className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/10 border border-white/10 text-xs font-mono transition-all cursor-pointer"
    >
      <Download className="w-3.5 h-3.5" />
      Export CSV
    </button>
  );
}

"use client";

import { useFormStatus } from "react-dom";
import { Loader2 } from "lucide-react";

export default function SubmitButton({ label = "Save" }: { label?: string }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="w-full h-11 rounded-full bg-gradient-to-r from-[#EA580C] to-[#F7931A] text-white text-sm font-semibold uppercase tracking-wider shadow-[0_0_20px_-5px_rgba(234,88,12,0.5)] hover:scale-[1.02] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
    >
      {pending ? (
        <Loader2 className="w-4 h-4 animate-spin mx-auto" />
      ) : (
        label
      )}
    </button>
  );
}

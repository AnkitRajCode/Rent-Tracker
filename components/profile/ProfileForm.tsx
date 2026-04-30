"use client";

import { useRef, useState, useTransition } from "react";
import { updateProfile } from "@/lib/actions/profile";
import { Save, CheckCircle2 } from "lucide-react";

interface Props {
  fullName: string | null;
  phone: string | null;
}

export default function ProfileForm({ fullName, phone }: Props) {
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const formRef = useRef<HTMLFormElement>(null);

  function handleSubmit(e: React.SyntheticEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await updateProfile(formData);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to save");
      }
    });
  }

  return (
    <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <label htmlFor="full_name" className="text-xs font-mono tracking-widest uppercase text-[#94A3B8]">
          Full Name
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          defaultValue={fullName ?? ""}
          placeholder="Your full name"
          className="w-full bg-[#0F1115] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-[#4A5568] focus:outline-none focus:border-[#EA580C]/60 focus:shadow-[0_0_0_3px_rgba(234,88,12,0.15)] transition-all"
        />
      </div>

      <div className="space-y-1.5">
        <label htmlFor="phone" className="text-xs font-mono tracking-widest uppercase text-[#94A3B8]">
          Phone
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          defaultValue={phone ?? ""}
          placeholder="+91 98765 43210"
          className="w-full bg-[#0F1115] border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-[#4A5568] focus:outline-none focus:border-[#EA580C]/60 focus:shadow-[0_0_0_3px_rgba(234,88,12,0.15)] transition-all"
        />
      </div>

      {error && (
        <p className="text-red-400 text-sm font-mono">{error}</p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="flex items-center gap-2 h-10 px-6 rounded-full bg-gradient-to-r from-[#EA580C] to-[#F7931A] text-white text-sm font-semibold uppercase tracking-wider shadow-[0_0_20px_-5px_rgba(234,88,12,0.5)] hover:shadow-[0_0_30px_-5px_rgba(247,147,26,0.6)] hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {saved ? (
          <>
            <CheckCircle2 className="w-4 h-4" />
            Saved
          </>
        ) : (
          <>
            <Save className="w-4 h-4" />
            {isPending ? "Saving…" : "Save Changes"}
          </>
        )}
      </button>
    </form>
  );
}

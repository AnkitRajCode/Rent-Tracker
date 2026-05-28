"use client";

import { useState } from "react";
import { Plus, Trash2, Users, UserCheck, Loader2, ExternalLink } from "lucide-react";
import { updateTenant } from "@/lib/actions/tenants";

type ExistingMember = {
  id: string;
  name: string;
  phone: string;
  email: string;
  aadhaarNumber: string;
  aadhaarDocUrl: string;
  isPrimary: boolean;
};

type NewMember = {
  tempId: string;
  name: string;
  phone: string;
  email: string;
  aadhaarNumber: string;
};

type Props = {
  tenantId: string;
  moveInDate: string;
  rentDueDay: number;
  agreementUrl: string;
  rentAmount: number;
  securityDeposit: number;
  initialMembers: ExistingMember[];
};

export default function EditTenantForm({
  tenantId,
  moveInDate: initMoveIn,
  rentDueDay: initDueDay,
  agreementUrl: initAgreement,
  rentAmount,
  securityDeposit,
  initialMembers,
}: Props) {
  const [moveInDate, setMoveInDate] = useState(initMoveIn);
  const [rentDueDay, setRentDueDay] = useState(initDueDay);
  const [agreementUrl, setAgreementUrl] = useState(initAgreement);
  const [members, setMembers] = useState<ExistingMember[]>(initialMembers);
  const [newMembers, setNewMembers] = useState<NewMember[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function addNewMember() {
    setNewMembers((prev) => [
      ...prev,
      { tempId: crypto.randomUUID(), name: "", phone: "", email: "", aadhaarNumber: "" },
    ]);
  }

  function removeNewMember(tempId: string) {
    setNewMembers((prev) => prev.filter((m) => m.tempId !== tempId));
  }

  function updateExistingMember(idx: number, field: keyof Omit<ExistingMember, "id" | "isPrimary">, value: string) {
    setMembers((prev) => prev.map((m, i) => i === idx ? { ...m, [field]: value } : m));
  }

  function updateNewMember(tempId: string, field: keyof Omit<NewMember, "tempId">, value: string) {
    setNewMembers((prev) => prev.map((m) => m.tempId === tempId ? { ...m, [field]: value } : m));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await updateTenant({
        id: tenantId,
        moveInDate,
        rentDueDay,
        agreementUrl,
        members: members.map((m) => ({
          id: m.id,
          name: m.name,
          phone: m.phone,
          email: m.email,
          aadhaarNumber: m.aadhaarNumber,
          isPrimary: m.isPrimary,
        })),
        newMembers: newMembers
          .filter((m) => m.name.trim() !== "")
          .map((m) => ({
            name: m.name,
            phone: m.phone,
            email: m.email,
            aadhaarNumber: m.aadhaarNumber,
          })),
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save");
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#0F1115] border border-white/10 rounded-2xl p-6 space-y-5">
      <h2 className="font-heading text-base font-semibold text-white flex items-center gap-2">
        <UserCheck className="w-4 h-4 text-[#F7931A]" /> Tenancy Details
      </h2>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="p-3 bg-white/5 rounded-xl text-xs font-mono text-[#94A3B8] space-y-0.5">
        <p>Monthly rent: <span className="text-[#F7931A] font-bold">₹{rentAmount.toLocaleString("en-IN")}</span></p>
        <p>Security deposit: <span className="text-[#FFD600] font-bold">₹{securityDeposit.toLocaleString("en-IN")}</span></p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-mono tracking-wider uppercase text-[#94A3B8] mb-1.5">
            Move-in Date
          </label>
          <input
            type="date"
            value={moveInDate}
            onChange={(e) => setMoveInDate(e.target.value)}
            required
            className="w-full bg-black/50 border-b-2 border-white/20 focus:border-[#F7931A] transition-all rounded-t-lg h-11 px-4 text-white text-sm outline-none"
          />
        </div>
        <div>
          <label className="block text-xs font-mono tracking-wider uppercase text-[#94A3B8] mb-1.5">
            Rent Due Day
          </label>
          <input
            type="number"
            value={rentDueDay}
            onChange={(e) => setRentDueDay(Number.parseInt(e.target.value) || 5)}
            min={1}
            max={31}
            required
            className="w-full bg-black/50 border-b-2 border-white/20 focus:border-[#F7931A] transition-all rounded-t-lg h-11 px-4 text-white text-sm outline-none"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-mono tracking-wider uppercase text-[#94A3B8] mb-1.5">
          Agreement URL (optional)
        </label>
        <input
          type="url"
          value={agreementUrl}
          onChange={(e) => setAgreementUrl(e.target.value)}
          placeholder="https://..."
          className="w-full bg-black/50 border-b-2 border-white/20 focus:border-[#F7931A] transition-all rounded-t-lg h-11 px-4 text-white text-sm placeholder:text-white/30 outline-none"
        />
        {agreementUrl && (
          <a
            href={agreementUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 mt-2 text-xs font-mono text-[#F7931A] hover:text-[#FFD600] transition-colors"
          >
            <ExternalLink className="w-3 h-3" />
            View Agreement
          </a>
        )}
      </div>

      {/* Existing Members */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-mono tracking-wider uppercase text-[#94A3B8] flex items-center gap-2">
            <Users className="w-3.5 h-3.5" /> Members ({members.length + newMembers.length})
          </h3>
          <button
            type="button"
            onClick={addNewMember}
            className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-mono text-[#F7931A] bg-[#F7931A]/10 border border-[#F7931A]/30 hover:bg-[#F7931A]/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Member
          </button>
        </div>

        {members.map((member, idx) => (
          <div key={member.id} className="p-4 bg-white/5 rounded-xl space-y-3 border border-white/10">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-mono text-[#94A3B8]">
                {member.isPrimary ? "Primary member" : `Member ${idx + 1}`}
              </span>
              {member.isPrimary && (
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F7931A]/20 border border-[#F7931A]/40 text-[#F7931A] font-mono">
                  Primary
                </span>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-[#94A3B8] mb-1">Name *</label>
                <input
                  type="text"
                  value={member.name}
                  onChange={(e) => updateExistingMember(idx, "name", e.target.value)}
                  required
                  className="w-full bg-black/50 border-b-2 border-white/20 focus:border-[#F7931A] transition-all rounded-t-lg h-9 px-3 text-white text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-[#94A3B8] mb-1">Phone</label>
                <input
                  type="tel"
                  value={member.phone}
                  onChange={(e) => updateExistingMember(idx, "phone", e.target.value)}
                  className="w-full bg-black/50 border-b-2 border-white/20 focus:border-[#F7931A] transition-all rounded-t-lg h-9 px-3 text-white text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-[#94A3B8] mb-1">Email</label>
                <input
                  type="email"
                  value={member.email}
                  onChange={(e) => updateExistingMember(idx, "email", e.target.value)}
                  className="w-full bg-black/50 border-b-2 border-white/20 focus:border-[#F7931A] transition-all rounded-t-lg h-9 px-3 text-white text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-[#94A3B8] mb-1">Aadhaar No.</label>
                <input
                  type="text"
                  value={member.aadhaarNumber}
                  onChange={(e) => updateExistingMember(idx, "aadhaarNumber", e.target.value)}
                  placeholder="XXXX XXXX XXXX"
                  className="w-full bg-black/50 border-b-2 border-white/20 focus:border-[#F7931A] transition-all rounded-t-lg h-9 px-3 text-white text-sm placeholder:text-white/30 outline-none"
                />
              </div>
            </div>
            {member.aadhaarDocUrl && (
              <a
                href={member.aadhaarDocUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 mt-2 text-xs font-mono text-[#F7931A] hover:text-[#FFD600] transition-colors"
              >
                <ExternalLink className="w-3 h-3" />
                View Aadhaar Document
              </a>
            )}
          </div>
        ))}

        {/* New Members */}
        {newMembers.map((member, idx) => (
          <div key={member.tempId} className="p-4 bg-[#F7931A]/5 rounded-xl space-y-3 border border-[#F7931A]/20">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-mono text-[#F7931A]">
                New member {members.length + idx + 1}
              </span>
              <button
                type="button"
                onClick={() => removeNewMember(member.tempId)}
                className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Remove
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono text-[#94A3B8] mb-1">Name *</label>
                <input
                  type="text"
                  value={member.name}
                  onChange={(e) => updateNewMember(member.tempId, "name", e.target.value)}
                  required
                  className="w-full bg-black/50 border-b-2 border-white/20 focus:border-[#F7931A] transition-all rounded-t-lg h-9 px-3 text-white text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-[#94A3B8] mb-1">Phone</label>
                <input
                  type="tel"
                  value={member.phone}
                  onChange={(e) => updateNewMember(member.tempId, "phone", e.target.value)}
                  className="w-full bg-black/50 border-b-2 border-white/20 focus:border-[#F7931A] transition-all rounded-t-lg h-9 px-3 text-white text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-[#94A3B8] mb-1">Email</label>
                <input
                  type="email"
                  value={member.email}
                  onChange={(e) => updateNewMember(member.tempId, "email", e.target.value)}
                  className="w-full bg-black/50 border-b-2 border-white/20 focus:border-[#F7931A] transition-all rounded-t-lg h-9 px-3 text-white text-sm outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-mono text-[#94A3B8] mb-1">Aadhaar No.</label>
                <input
                  type="text"
                  value={member.aadhaarNumber}
                  onChange={(e) => updateNewMember(member.tempId, "aadhaarNumber", e.target.value)}
                  placeholder="XXXX XXXX XXXX"
                  className="w-full bg-black/50 border-b-2 border-white/20 focus:border-[#F7931A] transition-all rounded-t-lg h-9 px-3 text-white text-sm placeholder:text-white/30 outline-none"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={saving}
        className="w-full h-11 rounded-full bg-gradient-to-r from-[#EA580C] to-[#F7931A] text-white text-sm font-semibold uppercase tracking-wider shadow-[0_0_20px_-5px_rgba(234,88,12,0.5)] hover:scale-[1.02] transition-all disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
      >
        {saving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Save Tenant Details"}
      </button>
    </form>
  );
}

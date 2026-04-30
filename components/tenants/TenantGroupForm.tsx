"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import {
  Plus,
  Trash2,
  Loader2,
  Upload,
  UserCheck,
  Users,
  FileText,
  X,
} from "lucide-react";
import { createTenantGroup, type MemberInput } from "@/lib/actions/tenants";

export type HouseOption = {
  id: string;
  house_number: string;
  rent_amount: number;
  property_name: string;
};

type MemberState = {
  name: string;
  phone: string;
  email: string;
  aadhaarNumber: string;
  aadhaarFile: File | null;
};

const emptyMember = (): MemberState => ({
  name: "",
  phone: "",
  email: "",
  aadhaarNumber: "",
  aadhaarFile: null,
});

const inputCls =
  "w-full bg-black/50 border-b-2 border-white/20 focus:border-[#F7931A] transition-all rounded-t-lg h-11 px-4 text-white text-sm placeholder:text-white/30 outline-none";

function FilePickerField({
  label,
  file,
  accept,
  onChange,
}: {
  label: string;
  file: File | null;
  accept: string;
  onChange: (f: File | null) => void;
}) {
  return (
    <div>
      <label className="block text-xs font-mono tracking-wider uppercase text-[#94A3B8] mb-1.5">
        {label}
      </label>
      <label className="flex items-center gap-3 cursor-pointer bg-black/30 border border-white/10 hover:border-[#F7931A]/50 rounded-xl px-4 h-11 transition-all group">
        <Upload className="w-4 h-4 text-[#94A3B8] flex-shrink-0" />
        <span className="text-sm text-[#94A3B8] group-hover:text-white truncate flex-1">
          {file ? file.name : "Click to upload"}
        </span>
        {file && (
          <span
            role="button"
            className="text-[#94A3B8] hover:text-red-400 transition-colors"
            onClick={(e) => {
              e.preventDefault();
              onChange(null);
            }}
          >
            <X className="w-3.5 h-3.5" />
          </span>
        )}
        <input
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
      </label>
    </div>
  );
}

function MemberFields({
  member,
  onChange,
  label,
  accent,
}: {
  member: MemberState;
  onChange: (field: keyof MemberState, value: string | File | null) => void;
  label: string;
  accent?: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-mono tracking-wider uppercase text-[#94A3B8] mb-1.5">
            Full Name *
          </label>
          <input
            type="text"
            value={member.name}
            onChange={(e) => onChange("name", e.target.value)}
            placeholder="Full name"
            required={accent}
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs font-mono tracking-wider uppercase text-[#94A3B8] mb-1.5">
            Phone
          </label>
          <input
            type="tel"
            value={member.phone}
            onChange={(e) => onChange("phone", e.target.value)}
            placeholder="98765 43210"
            className={inputCls}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-mono tracking-wider uppercase text-[#94A3B8] mb-1.5">
            Email{accent ? " (used for portal)" : ""}
          </label>
          <input
            type="email"
            value={member.email}
            onChange={(e) => onChange("email", e.target.value)}
            placeholder="member@example.com"
            className={inputCls}
          />
        </div>
        <div>
          <label className="block text-xs font-mono tracking-wider uppercase text-[#94A3B8] mb-1.5">
            Aadhaar Number
          </label>
          <input
            type="text"
            value={member.aadhaarNumber}
            onChange={(e) => onChange("aadhaarNumber", e.target.value)}
            placeholder="XXXX XXXX XXXX"
            maxLength={14}
            className={inputCls}
          />
        </div>
      </div>
      <FilePickerField
        label="Aadhaar Card (PDF / Image)"
        file={member.aadhaarFile}
        accept=".pdf,image/*"
        onChange={(f) => onChange("aadhaarFile", f)}
      />
    </div>
  );
}

export default function TenantGroupForm({
  houses,
  preselectedHouseId,
}: {
  houses: HouseOption[];
  preselectedHouseId?: string;
}) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const [houseId, setHouseId] = useState(preselectedHouseId ?? "");
  const [moveInDate, setMoveInDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [rentDueDay, setRentDueDay] = useState(5);
  const [agreementFile, setAgreementFile] = useState<File | null>(null);
  const [primary, setPrimary] = useState<MemberState>(emptyMember());
  const [extraMembers, setExtraMembers] = useState<MemberState[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function uploadFile(file: File, path: string): Promise<string> {
    const { data, error } = await supabase.storage
      .from("documents")
      .upload(path, file, { upsert: true });
    if (error) throw new Error(`Upload failed: ${error.message}`);
    const {
      data: { publicUrl },
    } = supabase.storage.from("documents").getPublicUrl(data.path);
    return publicUrl;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!houseId) {
      setError("Please select a house");
      return;
    }
    if (!primary.name.trim()) {
      setError("Primary tenant name is required");
      return;
    }
    setLoading(true);
    try {
      const stamp = Date.now();

      let agreementUrl = "";
      if (agreementFile) {
        agreementUrl = await uploadFile(
          agreementFile,
          `agreements/${houseId}-${stamp}`
        );
      }

      const allMembers = [primary, ...extraMembers];
      const membersWithUrls: MemberInput[] = await Promise.all(
        allMembers.map(async (m, i) => {
          let aadhaarDocUrl = "";
          if (m.aadhaarFile) {
            aadhaarDocUrl = await uploadFile(
              m.aadhaarFile,
              `aadhaar/${houseId}-m${i}-${stamp}`
            );
          }
          return {
            name: m.name,
            phone: m.phone,
            email: m.email,
            aadhaarNumber: m.aadhaarNumber,
            aadhaarDocUrl,
            isPrimary: i === 0,
          };
        })
      );

      await createTenantGroup({
        houseId,
        moveInDate,
        rentDueDay,
        agreementUrl,
        members: membersWithUrls,
      });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to add tenant");
      setLoading(false);
    }
  }

  function updatePrimary(field: keyof MemberState, value: string | File | null) {
    setPrimary((prev) => ({ ...prev, [field]: value }));
  }

  function updateExtra(
    index: number,
    field: keyof MemberState,
    value: string | File | null
  ) {
    setExtraMembers((prev) =>
      prev.map((m, i) => (i === index ? { ...m, [field]: value } : m))
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Tenancy Details */}
      <div className="bg-[#0F1115] border border-white/10 rounded-2xl p-6 space-y-4">
        <h3 className="flex items-center gap-2 text-xs font-mono tracking-wider uppercase text-[#F7931A] font-semibold">
          <FileText className="w-3.5 h-3.5" />
          Tenancy Details
        </h3>

        {!preselectedHouseId && (
          <div>
            <label className="block text-xs font-mono tracking-wider uppercase text-[#94A3B8] mb-1.5">
              Select House *
            </label>
            <select
              value={houseId}
              onChange={(e) => setHouseId(e.target.value)}
              required
              className={inputCls}
            >
              <option value="">Choose a vacant house</option>
              {houses.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.property_name} · Unit {h.house_number} (
                  {h.rent_amount.toLocaleString("en-IN")}/mo)
                </option>
              ))}
            </select>
          </div>
        )}

        {preselectedHouseId && (
          <div className="bg-black/30 rounded-xl px-4 py-3 text-sm text-[#94A3B8] font-mono">
            House pre-selected ·{" "}
            {houses.find((h) => h.id === preselectedHouseId)?.property_name} ·
            Unit{" "}
            {houses.find((h) => h.id === preselectedHouseId)?.house_number}
          </div>
        )}

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-mono tracking-wider uppercase text-[#94A3B8] mb-1.5">
              Move-in Date *
            </label>
            <input
              type="date"
              value={moveInDate}
              onChange={(e) => setMoveInDate(e.target.value)}
              required
              className={inputCls}
            />
          </div>
          <div>
            <label className="block text-xs font-mono tracking-wider uppercase text-[#94A3B8] mb-1.5">
              Rent Due Day
            </label>
            <input
              type="number"
              min={1}
              max={31}
              value={rentDueDay}
              onChange={(e) => setRentDueDay(parseInt(e.target.value) || 5)}
              className={inputCls}
            />
          </div>
        </div>

        <FilePickerField
          label="Rental Agreement (PDF / Image)"
          file={agreementFile}
          accept=".pdf,image/*"
          onChange={setAgreementFile}
        />
      </div>

      {/* Primary Tenant */}
      <div className="bg-[#0F1115] border border-[#F7931A]/30 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-[#F7931A]/20 flex items-center justify-center">
            <UserCheck className="w-3.5 h-3.5 text-[#F7931A]" />
          </div>
          <h3 className="text-xs font-mono tracking-wider uppercase text-[#F7931A] font-semibold">
            Primary Tenant
          </h3>
          <span className="ml-auto text-[10px] font-mono text-[#94A3B8] bg-white/5 rounded-full px-2 py-0.5">
            Head of household
          </span>
        </div>
        <MemberFields
          member={primary}
          onChange={updatePrimary}
          label="Primary"
          accent
        />
      </div>

      {/* Extra Members */}
      {extraMembers.map((member, i) => (
        <div
          key={i}
          className="bg-[#0F1115] border border-white/10 rounded-2xl p-6 space-y-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center">
                <Users className="w-3.5 h-3.5 text-[#94A3B8]" />
              </div>
              <h3 className="text-xs font-mono tracking-wider uppercase text-white font-semibold">
                Member {i + 2}
              </h3>
            </div>
            <button
              type="button"
              onClick={() =>
                setExtraMembers((prev) => prev.filter((_, idx) => idx !== i))
              }
              className="w-7 h-7 flex items-center justify-center rounded-lg text-red-400/50 hover:text-red-400 hover:bg-red-400/10 transition-all cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
          <MemberFields
            member={member}
            onChange={(field, val) => updateExtra(i, field, val)}
            label={`Member ${i + 2}`}
          />
        </div>
      ))}

      {/* Add member button */}
      <button
        type="button"
        onClick={() => setExtraMembers((prev) => [...prev, emptyMember()])}
        className="w-full h-10 rounded-xl border border-dashed border-white/20 text-[#94A3B8] hover:text-white hover:border-[#F7931A]/40 text-sm font-mono flex items-center justify-center gap-2 transition-all cursor-pointer"
      >
        <Plus className="w-4 h-4" />
        Add Another Member
      </button>

      {error && (
        <p className="text-red-400 text-xs bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full h-12 rounded-full bg-gradient-to-r from-[#EA580C] to-[#F7931A] text-white text-sm font-semibold uppercase tracking-wider shadow-[0_0_20px_-5px_rgba(234,88,12,0.5)] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center gap-2 cursor-pointer"
      >
        {loading && <Loader2 className="w-4 h-4 animate-spin" />}
        {loading ? "Saving..." : "Add Tenant Group"}
      </button>
    </form>
  );
}

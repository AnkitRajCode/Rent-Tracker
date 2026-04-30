import { createClient } from "@/lib/supabase/server";
import { notFound } from "next/navigation";
import { updateProperty } from "@/lib/actions/properties";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function EditPropertyPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: property } = await supabase
    .from("properties")
    .select("*")
    .eq("id", id)
    .eq("owner_id", user!.id)
    .single();

  if (!property) notFound();

  const action = updateProperty.bind(null, id);

  return (
    <div className="max-w-xl space-y-6">
      <div className="flex items-center gap-3">
        <Link
          href={`/dashboard/properties/${id}`}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/10 border border-transparent transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="font-heading text-2xl font-bold text-white">Edit Property</h1>
          <p className="text-[#94A3B8] text-sm font-mono">{property.name}</p>
        </div>
      </div>

      <form action={action} className="bg-[#0F1115] border border-white/10 rounded-2xl p-6 space-y-5">
        <Field label="Property Name *" name="name" defaultValue={property.name ?? ""} required />
        <Field label="House / Plot Number" name="house_no" defaultValue={property.house_no ?? ""} />
        <Field label="Address Line" name="address_line" defaultValue={property.address_line ?? ""} />
        <div className="grid grid-cols-2 gap-4">
          <Field label="City" name="city" defaultValue={property.city ?? ""} />
          <Field label="State" name="state" defaultValue={property.state ?? ""} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Pin Code" name="pin_code" defaultValue={property.pin_code ?? ""} />
          <Field label="Landmark" name="landmark" defaultValue={property.landmark ?? ""} />
        </div>
        <div className="pt-2">
          <button
            type="submit"
            className="w-full h-11 rounded-full bg-gradient-to-r from-[#EA580C] to-[#F7931A] text-white text-sm font-semibold uppercase tracking-wider shadow-[0_0_20px_-5px_rgba(234,88,12,0.5)] hover:scale-[1.02] transition-all"
          >
            Update Property
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  name,
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label className="block text-xs font-mono tracking-wider uppercase text-[#94A3B8] mb-1.5">
        {label}
      </label>
      <input
        type="text"
        name={name}
        defaultValue={defaultValue}
        required={required}
        className="w-full bg-black/50 border-b-2 border-white/20 focus:border-[#F7931A] focus:shadow-[0_10px_20px_-10px_rgba(247,147,26,0.3)] transition-all rounded-t-lg h-11 px-4 text-white text-sm placeholder:text-white/30 outline-none"
      />
    </div>
  );
}

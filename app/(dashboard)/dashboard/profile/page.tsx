import { createClient } from "@/lib/supabase/server";
import { User, Mail, Phone, CalendarDays, Lock } from "lucide-react";
import ProfileForm from "@/components/profile/ProfileForm";
import ChangePasswordForm from "@/components/profile/ChangePasswordForm";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user!.id)
    .single();

  const joinedAt = profile?.created_at
    ? new Date(profile.created_at).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })
    : "—";

  return (
    <div className="max-w-2xl space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-heading text-3xl font-bold text-white">Profile</h1>
        <p className="text-[#94A3B8] text-sm mt-1 font-mono">
          Manage your account details
        </p>
      </div>

      {/* Avatar + read-only info */}
      <div className="bg-[#0F1115] border border-white/10 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#EA580C] to-[#F7931A] flex items-center justify-center shadow-[0_0_20px_-5px_rgba(234,88,12,0.5)] flex-shrink-0">
          <User className="w-8 h-8 text-white" />
        </div>
        <div className="space-y-2 flex-1 min-w-0">
          <p className="text-white font-semibold text-lg truncate">
            {profile?.full_name ?? "—"}
          </p>
          <div className="flex flex-wrap gap-x-6 gap-y-1.5 text-sm text-[#94A3B8] font-mono">
            <span className="flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 flex-shrink-0" />
              {user?.email}
            </span>
            {profile?.phone && (
              <span className="flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                {profile.phone}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <CalendarDays className="w-3.5 h-3.5 flex-shrink-0" />
              Joined {joinedAt}
            </span>
          </div>
        </div>
      </div>

      {/* Edit form */}
      <div className="bg-[#0F1115] border border-white/10 rounded-2xl p-6">
        <h2 className="font-heading text-lg font-semibold text-white mb-6">
          Edit Details
        </h2>
        <ProfileForm
          fullName={profile?.full_name ?? null}
          phone={profile?.phone ?? null}
        />
      </div>

      {/* Email note */}
      <div className="bg-[#0F1115] border border-white/10 rounded-2xl p-6">
        <h2 className="font-heading text-lg font-semibold text-white mb-2">
          Email Address
        </h2>
        <p className="text-[#94A3B8] text-sm font-mono mb-3">{user?.email}</p>
        <p className="text-[#4A5568] text-xs">
          Email is managed by your auth provider and cannot be changed here.
        </p>
      </div>

      {/* Change Password */}
      <div className="bg-[#0F1115] border border-white/10 rounded-2xl p-6">
        <div className="flex items-center gap-2 mb-6">
          <Lock className="w-4 h-4 text-[#F7931A]" />
          <h2 className="font-heading text-lg font-semibold text-white">
            Change Password
          </h2>
        </div>
        <ChangePasswordForm />
      </div>
    </div>
  );
}

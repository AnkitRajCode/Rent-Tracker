"use client";

import { useState, useTransition } from "react";
import { updateTenantLoginAccess } from "@/lib/actions/tenants";

export default function ToggleLoginAccess({
  tenantId,
  canLogin,
  hasEmail,
}: {
  tenantId: string;
  canLogin: boolean;
  hasEmail: boolean;
}) {
  const [enabled, setEnabled] = useState(canLogin);
  const [isPending, startTransition] = useTransition();

  function toggle() {
    if (!hasEmail && !enabled) return; // need email to enable
    const next = !enabled;
    setEnabled(next);
    startTransition(async () => {
      try {
        await updateTenantLoginAccess(tenantId, next);
      } catch {
        setEnabled(!next); // revert on error
      }
    });
  }

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={isPending || (!hasEmail && !enabled)}
      title={
        !hasEmail && !enabled
          ? "Add primary tenant email to enable portal access"
          : enabled
          ? "Portal access ON - click to disable"
          : "Portal access OFF - click to enable"
      }
      className={`cursor-pointer relative inline-flex h-5 w-9 flex-shrink-0 items-center rounded-full transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        enabled ? "bg-[#F7931A]" : "bg-white/20"
      }`}
    >
      <span
        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform ${
          enabled ? "translate-x-[18px]" : "translate-x-[2px]"
        }`}
      />
    </button>
  );
}

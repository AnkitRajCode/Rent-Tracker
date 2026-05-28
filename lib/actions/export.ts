"use server";

import { createClient } from "@/lib/supabase/server";

export type ExportFilters = {
  dataType: "current" | "historical";
  propertyId?: string;
  houseId?: string;
  dateFrom?: string;
  dateTo?: string;
  monthFrom?: number;
  yearFrom?: number;
  monthTo?: number;
  yearTo?: number;
};

export type TenantExportFilters = ExportFilters & {
  includePastTenants?: boolean;
  tenantName?: string;
  status?: "active" | "vacated" | "all";
};

export type RentExportFilters = ExportFilters & {
  paymentStatus?: "paid" | "partial" | "pending" | "all";
  tenantId?: string;
};

export type PropertyOption = { id: string; name: string };
export type HouseOption = { id: string; label: string; property_id: string };

export async function getExportOptions(): Promise<{
  properties: PropertyOption[];
  houses: HouseOption[];
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { properties: [], houses: [] };

  const [{ data: properties }, { data: houses }] = await Promise.all([
    supabase.from("properties").select("id, name").eq("owner_id", user.id).order("name"),
    supabase.from("houses").select("id, house_number, property_id, properties(name)").eq("owner_id", user.id).order("house_number"),
  ]);

  return {
    properties: (properties ?? []).map((p) => ({ id: p.id, name: p.name })),
    houses: (houses ?? []).map((h) => ({
      id: h.id,
      label: `Unit ${h.house_number} - ${(h.properties as unknown as { name: string } | null)?.name ?? ""}`,
      property_id: h.property_id,
    })),
  };
}

export async function exportTenantData(filters: TenantExportFilters): Promise<{
  headers: string[];
  rows: (string | number)[][];
  filename: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { headers: [], rows: [], filename: "tenants.csv" };

  const headers = ["Name", "Phone", "Email", "House", "Property", "Move-in Date", "Rent Due Day", "Rent Amount", "Status"];
  const rows: (string | number)[][] = [];

  // Current tenants
  if (filters.dataType === "current" || filters.status === "all" || filters.status === "active") {
    let query = supabase
      .from("tenants")
      .select("*, tenant_members(name, phone, email, is_primary), houses(house_number, rent_amount, property_id, properties(name))")
      .eq("owner_id", user.id);

    if (filters.houseId) {
      query = query.eq("house_id", filters.houseId);
    }

    if (filters.tenantName) {
      query = query.ilike("name", `%${filters.tenantName}%`);
    }

    if (filters.dateFrom) {
      query = query.gte("move_in_date", filters.dateFrom);
    }
    if (filters.dateTo) {
      query = query.lte("move_in_date", filters.dateTo);
    }

    const { data: tenants } = await query.order("created_at", { ascending: false });

    for (const tenant of tenants ?? []) {
      const house = tenant.houses as unknown as { house_number: string; rent_amount: number; property_id: string; properties: { name: string } | null } | null;

      // Filter by property
      if (filters.propertyId && house?.property_id !== filters.propertyId) continue;

      const members = (tenant.tenant_members as unknown as Array<{ name: string; phone: string | null; email: string | null; is_primary: boolean }>) ?? [];
      const primary = members.find((m) => m.is_primary) ?? members[0];

      rows.push([
        primary?.name ?? tenant.name,
        primary?.phone ?? tenant.phone ?? "",
        primary?.email ?? tenant.email ?? "",
        house ? `Unit ${house.house_number}` : "",
        house?.properties?.name ?? "",
        tenant.move_in_date,
        tenant.rent_due_day,
        house?.rent_amount ?? 0,
        "Active",
      ]);
    }
  }

  // Historical tenants
  if (filters.dataType === "historical" || filters.includePastTenants || filters.status === "all" || filters.status === "vacated") {
    let query = supabase
      .from("tenant_history")
      .select("*, houses(house_number, property_id, properties(name))")
      .eq("owner_id", user.id);

    if (filters.houseId) {
      query = query.eq("house_id", filters.houseId);
    }
    if (filters.tenantName) {
      query = query.ilike("name", `%${filters.tenantName}%`);
    }
    if (filters.dateFrom) {
      query = query.gte("move_out_date", filters.dateFrom);
    }
    if (filters.dateTo) {
      query = query.lte("move_out_date", filters.dateTo);
    }

    const { data: history } = await query.order("move_out_date", { ascending: false });

    for (const h of history ?? []) {
      const house = h.houses as unknown as { house_number: string; property_id: string; properties: { name: string } | null } | null;
      if (filters.propertyId && house?.property_id !== filters.propertyId) continue;

      rows.push([
        h.name ?? "",
        h.phone ?? "",
        "",
        house ? `Unit ${house.house_number}` : "",
        house?.properties?.name ?? "",
        h.move_in_date ?? "",
        "",
        "",
        `Vacated (${h.move_out_date ?? ""})`,
      ]);
    }
  }

  const suffix = filters.dataType === "historical" ? "history" : filters.status === "all" ? "all" : "active";
  return { headers, rows, filename: `tenants-${suffix}.csv` };
}

export async function exportRentData(filters: RentExportFilters): Promise<{
  headers: string[];
  rows: (string | number)[][];
  filename: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { headers: [], rows: [], filename: "rent.csv" };

  const headers = ["Month", "Year", "Unit", "Property", "Tenant", "Base Rent", "Electricity", "Maintenance", "Total Due", "Amount Paid", "Pending", "Status", "Payment Mode", "Paid On", "Notes"];

  let query = supabase
    .from("rent_records")
    .select("*, houses(house_number, property_id, properties(name)), tenants(name)")
    .eq("owner_id", user.id);

  if (filters.paymentStatus && filters.paymentStatus !== "all") {
    query = query.eq("status", filters.paymentStatus);
  }

  if (filters.houseId) {
    query = query.eq("house_id", filters.houseId);
  }

  if (filters.tenantId) {
    query = query.eq("tenant_id", filters.tenantId);
  }

  // Time filters
  if (filters.monthFrom && filters.yearFrom) {
    query = query.or(`year.gt.${filters.yearFrom},and(year.eq.${filters.yearFrom},month.gte.${filters.monthFrom})`);
  }
  if (filters.monthTo && filters.yearTo) {
    query = query.or(`year.lt.${filters.yearTo},and(year.eq.${filters.yearTo},month.lte.${filters.monthTo})`);
  }

  const { data: records } = await query.order("year", { ascending: false }).order("month", { ascending: false });

  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const rows: (string | number)[][] = [];
  for (const r of records ?? []) {
    const house = r.houses as unknown as { house_number: string; property_id: string; properties: { name: string } | null } | null;
    const tenant = r.tenants as unknown as { name: string } | null;

    if (filters.propertyId && house?.property_id !== filters.propertyId) continue;

    const baseRent = r.amount_due ?? 0;
    const electricity = r.electricity_bill ?? 0;
    const maintenance = r.maintenance ?? 0;
    const totalDue = baseRent + electricity + maintenance;
    const amountPaid = r.amount_paid ?? 0;
    const pending = totalDue - amountPaid;

    rows.push([
      MONTHS[r.month - 1] ?? "",
      r.year,
      house ? `Unit ${house.house_number}` : "",
      house?.properties?.name ?? "",
      tenant?.name ?? "",
      baseRent,
      electricity,
      maintenance,
      totalDue,
      amountPaid,
      pending > 0 ? pending : 0,
      r.status ?? "",
      r.payment_mode ?? "",
      r.paid_on ?? "",
      r.notes ?? "",
    ]);
  }

  const filename = `rent-export${filters.paymentStatus && filters.paymentStatus !== "all" ? `-${filters.paymentStatus}` : ""}.csv`;
  return { headers, rows, filename };
}

"use client";

import { useState, useEffect, useCallback } from "react";
import { Download, X, Loader2, Filter } from "lucide-react";
import {
  getExportOptions,
  exportTenantData,
  exportRentData,
  type PropertyOption,
  type HouseOption,
  type TenantExportFilters,
  type RentExportFilters,
} from "@/lib/actions/export";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const inputCls =
  "w-full bg-black/50 border border-white/10 focus:border-[#F7931A] rounded-lg h-9 px-3 text-white text-sm outline-none transition-all";
const selectCls =
  "w-full bg-black/50 border border-white/10 focus:border-[#F7931A] rounded-lg h-9 px-3 text-white text-sm outline-none transition-all cursor-pointer";
const labelCls = "block text-xs font-mono tracking-wider uppercase text-[#94A3B8] mb-1";

function downloadCSV(headers: string[], rows: (string | number)[][], filename: string) {
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

type ExportType = "tenant" | "rent";

export default function ExportButton({ type }: { type: ExportType }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 h-9 px-3 rounded-xl text-[#94A3B8] hover:text-white hover:bg-white/10 border border-white/10 text-xs font-mono transition-all cursor-pointer"
      >
        <Download className="w-3.5 h-3.5" />
        Export CSV
      </button>
      {open && <ExportModal type={type} onClose={() => setOpen(false)} />}
    </>
  );
}

function ExportModal({ type, onClose }: { type: ExportType; onClose: () => void }) {
  const [properties, setProperties] = useState<PropertyOption[]>([]);
  const [houses, setHouses] = useState<HouseOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);

  // Common filters
  const [dataType, setDataType] = useState<"current" | "historical">("current");
  const [propertyId, setPropertyId] = useState("");
  const [houseId, setHouseId] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [monthFrom, setMonthFrom] = useState(0);
  const [yearFrom, setYearFrom] = useState(0);
  const [monthTo, setMonthTo] = useState(0);
  const [yearTo, setYearTo] = useState(0);

  // Tenant-specific
  const [tenantName, setTenantName] = useState("");
  const [tenantStatus, setTenantStatus] = useState<"active" | "vacated" | "all">("active");
  const [includePastTenants, setIncludePastTenants] = useState(false);

  // Rent-specific
  const [paymentStatus, setPaymentStatus] = useState<"paid" | "partial" | "pending" | "all">("all");

  useEffect(() => {
    getExportOptions().then(({ properties: p, houses: h }) => {
      setProperties(p);
      setHouses(h);
      setLoading(false);
    });
  }, []);

  const filteredHouses = propertyId
    ? houses.filter((h) => h.property_id === propertyId)
    : houses;

  const handleExport = useCallback(async () => {
    setExporting(true);
    try {
      const baseFilters = {
        dataType,
        propertyId: propertyId || undefined,
        houseId: houseId || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        monthFrom: monthFrom || undefined,
        yearFrom: yearFrom || undefined,
        monthTo: monthTo || undefined,
        yearTo: yearTo || undefined,
      };

      let result: { headers: string[]; rows: (string | number)[][]; filename: string };

      if (type === "tenant") {
        const filters: TenantExportFilters = {
          ...baseFilters,
          tenantName: tenantName || undefined,
          status: tenantStatus,
          includePastTenants,
        };
        result = await exportTenantData(filters);
      } else {
        const filters: RentExportFilters = {
          ...baseFilters,
          paymentStatus,
        };
        result = await exportRentData(filters);
      }

      if (result.rows.length === 0) {
        alert("No data found for the selected filters.");
      } else {
        downloadCSV(result.headers, result.rows, result.filename);
        onClose();
      }
    } finally {
      setExporting(false);
    }
  }, [type, dataType, propertyId, houseId, dateFrom, dateTo, monthFrom, yearFrom, monthTo, yearTo, tenantName, tenantStatus, includePastTenants, paymentStatus, onClose]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 8 }, (_, i) => currentYear - 5 + i);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-[#0F1115] border border-white/10 rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-[0_0_60px_-15px_rgba(247,147,26,0.2)]">
        {/* Header */}
        <div className="sticky top-0 bg-[#0F1115] border-b border-white/10 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-[#F7931A]" />
            <h2 className="font-heading text-lg font-semibold text-white">
              Export {type === "tenant" ? "Tenants" : "Rent"} Data
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-[#94A3B8] hover:text-white hover:bg-white/10 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {loading ? (
          <div className="p-10 flex items-center justify-center">
            <Loader2 className="w-6 h-6 text-[#F7931A] animate-spin" />
          </div>
        ) : (
          <div className="p-6 space-y-5">
            {/* Data Type */}
            <div>
              <label className={labelCls}>Data Type</label>
              <div className="flex gap-2">
                {(["current", "historical"] as const).map((dt) => (
                  <button
                    key={dt}
                    type="button"
                    onClick={() => setDataType(dt)}
                    className={`flex-1 h-9 rounded-lg text-xs font-mono uppercase tracking-wider border transition-all ${
                      dataType === dt
                        ? "bg-[#F7931A]/20 border-[#F7931A]/50 text-[#F7931A]"
                        : "bg-black/30 border-white/10 text-[#94A3B8] hover:border-white/20"
                    }`}
                  >
                    {dt}
                  </button>
                ))}
              </div>
            </div>

            {/* Scope Filters */}
            <div className="space-y-3">
              <p className="text-xs font-mono tracking-wider uppercase text-[#F7931A]">Scope Filters</p>
              <div>
                <label className={labelCls}>Property</label>
                <select
                  value={propertyId}
                  onChange={(e) => { setPropertyId(e.target.value); setHouseId(""); }}
                  className={selectCls}
                >
                  <option value="">All Properties</option>
                  {properties.map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>Unit</label>
                <select value={houseId} onChange={(e) => setHouseId(e.target.value)} className={selectCls}>
                  <option value="">All Units</option>
                  {filteredHouses.map((h) => (
                    <option key={h.id} value={h.id}>{h.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Time Filters */}
            <div className="space-y-3">
              <p className="text-xs font-mono tracking-wider uppercase text-[#F7931A]">Time Filters</p>

              {type === "tenant" ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>Date From</label>
                    <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className={inputCls} />
                  </div>
                  <div>
                    <label className={labelCls}>Date To</label>
                    <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className={inputCls} />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelCls}>From Month</label>
                    <div className="flex gap-1">
                      <select value={monthFrom} onChange={(e) => setMonthFrom(Number(e.target.value))} className={selectCls}>
                        <option value={0}>Any</option>
                        {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                      </select>
                      <select value={yearFrom} onChange={(e) => setYearFrom(Number(e.target.value))} className={selectCls}>
                        <option value={0}>Year</option>
                        {years.map((y) => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className={labelCls}>To Month</label>
                    <div className="flex gap-1">
                      <select value={monthTo} onChange={(e) => setMonthTo(Number(e.target.value))} className={selectCls}>
                        <option value={0}>Any</option>
                        {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                      </select>
                      <select value={yearTo} onChange={(e) => setYearTo(Number(e.target.value))} className={selectCls}>
                        <option value={0}>Year</option>
                        {years.map((y) => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Context-specific filters */}
            <div className="space-y-3">
              <p className="text-xs font-mono tracking-wider uppercase text-[#F7931A]">
                {type === "tenant" ? "Tenant Filters" : "Rent Filters"}
              </p>

              {type === "tenant" ? (
                <>
                  <div>
                    <label className={labelCls}>Tenant Name</label>
                    <input
                      type="text"
                      value={tenantName}
                      onChange={(e) => setTenantName(e.target.value)}
                      placeholder="Search by name..."
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>Status</label>
                    <select value={tenantStatus} onChange={(e) => setTenantStatus(e.target.value as typeof tenantStatus)} className={selectCls}>
                      <option value="active">Active Only</option>
                      <option value="vacated">Vacated Only</option>
                      <option value="all">All (Active + Vacated)</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="includePast"
                      checked={includePastTenants}
                      onChange={(e) => setIncludePastTenants(e.target.checked)}
                      className="w-4 h-4 rounded accent-[#F7931A] cursor-pointer"
                    />
                    <label htmlFor="includePast" className="text-sm text-[#94A3B8] cursor-pointer">
                      Include past tenants in current export
                    </label>
                  </div>
                </>
              ) : (
                <div>
                  <label className={labelCls}>Payment Status</label>
                  <select value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as typeof paymentStatus)} className={selectCls}>
                    <option value="all">All Statuses</option>
                    <option value="paid">Paid</option>
                    <option value="partial">Partial</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              )}
            </div>

            {/* Export button */}
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="w-full h-11 rounded-full bg-gradient-to-r from-[#EA580C] to-[#F7931A] text-white text-sm font-semibold uppercase tracking-wider shadow-[0_0_20px_-5px_rgba(234,88,12,0.5)] hover:scale-[1.02] transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {exporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              {exporting ? "Exporting..." : "Export CSV"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

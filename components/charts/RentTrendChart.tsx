"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

export type RentMonthData = {
  month: string; // "Jan", "Feb", etc.
  expected: number;
  collected: number;
};

function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0F1115] border border-white/10 rounded-xl px-4 py-3 shadow-xl">
      <p className="text-white text-xs font-mono font-bold mb-2">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-xs font-mono" style={{ color: p.color }}>
          {p.name}: ₹{p.value.toLocaleString("en-IN")}
        </p>
      ))}
    </div>
  );
}

export default function RentTrendChart({ data }: { data: RentMonthData[] }) {
  if (!data.length) return null;
  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} barCategoryGap="30%" barGap={4}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis
          dataKey="month"
          tick={{ fill: "#94A3B8", fontSize: 11, fontFamily: "monospace" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#94A3B8", fontSize: 10, fontFamily: "monospace" }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) =>
            v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : `₹${v}`
          }
          width={48}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
        <Legend
          wrapperStyle={{ fontSize: 11, fontFamily: "monospace", color: "#94A3B8" }}
          iconType="circle"
          iconSize={8}
        />
        <Bar dataKey="expected" name="Expected" fill="#1e293b" radius={[4, 4, 0, 0]} />
        <Bar
          dataKey="collected"
          name="Collected"
          fill="url(#rentGradient)"
          radius={[4, 4, 0, 0]}
        />
        <defs>
          <linearGradient id="rentGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#F7931A" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  );
}

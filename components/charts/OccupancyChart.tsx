"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export type OccupancyData = {
  occupied: number;
  vacant: number;
};

function CustomTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number }>;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#0F1115] border border-white/10 rounded-xl px-3 py-2 shadow-xl">
      <p className="text-xs font-mono">
        <span style={{ color: payload[0].name === "Occupied" ? "#22c55e" : "#94A3B8" }}>
          {payload[0].name}
        </span>
        <span className="text-white ml-2 font-bold">{payload[0].value}</span>
      </p>
    </div>
  );
}

const RADIAN = Math.PI / 180;
function RenderLabel({
  cx,
  cy,
  midAngle,
  innerRadius,
  outerRadius,
  percent,
  name,
}: {
  cx: number;
  cy: number;
  midAngle: number;
  innerRadius: number;
  outerRadius: number;
  percent: number;
  name: string;
}) {
  if (percent < 0.05) return null;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RADIAN);
  const y = cy + r * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      style={{ fontSize: 11, fontFamily: "monospace" }}
    >
      {Math.round(percent * 100)}%
    </text>
  );
}

export default function OccupancyChart({ data }: { data: OccupancyData }) {
  const chartData = [
    { name: "Occupied", value: data.occupied },
    { name: "Vacant", value: data.vacant },
  ].filter((d) => d.value > 0);

  const total = data.occupied + data.vacant;
  if (total === 0) return (
    <div className="flex items-center justify-center h-[180px] text-[#94A3B8] text-xs font-mono">
      No houses added yet
    </div>
  );

  return (
    <div className="flex items-center gap-6">
      <div className="flex-shrink-0">
        <ResponsiveContainer width={160} height={160}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={48}
              outerRadius={72}
              dataKey="value"
              paddingAngle={3}
              labelLine={false}
              label={RenderLabel as never}
            >
              <Cell fill="#22c55e" stroke="transparent" />
              <Cell fill="#1e293b" stroke="transparent" />
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-3">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#22c55e] flex-shrink-0" />
            <span className="text-[#94A3B8] text-xs font-mono uppercase tracking-wider">Occupied</span>
          </div>
          <p className="text-2xl font-heading font-bold text-white pl-4">
            {data.occupied}
            <span className="text-xs font-mono text-[#94A3B8] ml-1">/ {total}</span>
          </p>
        </div>
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#1e293b] border border-white/20 flex-shrink-0" />
            <span className="text-[#94A3B8] text-xs font-mono uppercase tracking-wider">Vacant</span>
          </div>
          <p className="text-2xl font-heading font-bold text-white pl-4">
            {data.vacant}
            <span className="text-xs font-mono text-[#94A3B8] ml-1">/ {total}</span>
          </p>
        </div>
      </div>
    </div>
  );
}

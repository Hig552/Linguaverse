"use client";

import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell, PieChart, Pie, Legend } from "recharts";

function renderPieLabel(props: { payload?: { label?: string }; percent?: number }) {
  const label = props.payload?.label ?? '';
  const pct = ((props.percent ?? 0) * 100).toFixed(0);
  return `${label}: ${pct}%`;
}

interface Props {
  byMacroarea: Array<{ macroarea: string; count: number }>;
  byEndangerment: Array<{ aes: number; label: string; count: number }>;
}

const AES_COLORS: Record<number, string> = {
  1: "#10b981",
  2: "#eab308",
  3: "#f97316",
  4: "#ef4444",
  5: "#b91c1c",
  6: "#52525b",
};

export default function StatsCharts({ byMacroarea, byEndangerment }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
        <h2 className="font-semibold mb-3">Languages per world region</h2>
        <ResponsiveContainer width="100%" height={320}>
          <BarChart data={byMacroarea} margin={{ left: 10, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" opacity={0.4} />
            <XAxis dataKey="macroarea" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip cursor={{ fill: 'rgba(14,165,233,0.05)' }} />
            <Bar dataKey="count" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4">
        <h2 className="font-semibold mb-3">Endangerment breakdown</h2>
        <ResponsiveContainer width="100%" height={320}>
          <PieChart>
            <Pie data={byEndangerment} dataKey="count" nameKey="label" outerRadius={110} label={renderPieLabel}>
              {byEndangerment.map((e) => (
                <Cell key={e.aes} fill={AES_COLORS[e.aes] ?? '#a1a1aa'} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

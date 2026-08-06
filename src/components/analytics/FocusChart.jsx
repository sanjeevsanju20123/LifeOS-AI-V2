import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { useFocus } from "../../context/FocusContext";

function MinutesTooltip({ active, payload, label }) {
  if (!active || !payload || !payload.length) return null;
  const data = payload[0].payload;
  const mins = data.minutes || 0;
  const sessions = data.sessions || 0;
  const hrs = Math.floor(mins / 60);
  const rem = Math.round(mins % 60);
  return (
    <div style={{
      background: "var(--card)",
      color: "var(--text)",
      padding: 10,
      borderRadius: 8,
      boxShadow: "var(--shadow)",
      fontSize: 13,
    }}>
      <div style={{ fontWeight: 700 }}>{label}</div>
      <div style={{ color: "var(--text-muted)", marginTop: 6 }}>
        Focus Time: {hrs}h {rem}m
      </div>
      <div style={{ color: "var(--text-muted)", marginTop: 4 }}>
        Sessions: {sessions}
      </div>
    </div>
  );
}

function FocusChart() {
  const { weeklyHistory = [] } = useFocus();

  const data = weeklyHistory.map((d) => {
    const date = new Date(d.date);
    const weekday = date.toLocaleDateString(undefined, { weekday: "short" });
    return {
      name: weekday,
      minutes: d.minutes || 0,
      sessions: d.sessions || 0,
    };
  });

  const maxMinutes = Math.max(...data.map((d) => d.minutes), 60);

  return (
    <div className="glass-card" style={{ padding: 16, minHeight: 220 }}>
      <h3 style={{ margin: "0 0 8px 0" }}>🧠 Focus Time</h3>

      <div style={{ width: "100%", height: 160 }}>
        <ResponsiveContainer>
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="focusGradient" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#7C4DFF" stopOpacity={0.95} />
                <stop offset="100%" stopColor="#4DD0E1" stopOpacity={0.95} />
              </linearGradient>
            </defs>

            <XAxis dataKey="name" tick={{ fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
            <YAxis
              tickFormatter={(v) => `${Math.round(v / 60)}h`}
              tick={{ fill: "var(--text-muted)" }}
              axisLine={false}
              tickLine={false}
              domain={[0, Math.max(maxMinutes, 60)]}
            />
            <Tooltip content={<MinutesTooltip />} />

            <Bar dataKey="minutes" radius={[8, 8, 8, 8]} fill="url(#focusGradient)">
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default FocusChart;
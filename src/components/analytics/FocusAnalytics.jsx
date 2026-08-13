// src/components/analytics/FocusAnalytics.jsx

import React, { useMemo } from "react";
import { useFocus } from "../../context/FocusContext";

import {
  weeklySeries,
  sumMinutes,
  sumSessions,
  bestDay,
  focusScore,
} from "../../services/focusAnalytics";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LabelList,
  CartesianGrid,
} from "recharts";

export default function FocusAnalytics({ dailyTarget = 30 }) {
  const {
  weeklyHistory = [],
  currentStreak = 0,
} = useFocus()

  // Prepare Monday-Sunday chart data
  const series = useMemo(
    () => weeklySeries(weeklyHistory),
    [weeklyHistory]
  );

  // Total focus minutes this week
  const totalMinutes = useMemo(
    () => sumMinutes(weeklyHistory),
    [weeklyHistory]
  );

  // Total sessions this week
  const totalSessions = useMemo(
    () => sumSessions(weeklyHistory),
    [weeklyHistory]
  );

  // Focus score based on daily target
  const score = useMemo(
    () => focusScore(weeklyHistory, dailyTarget),
    [weeklyHistory, dailyTarget]
  );

  // Best day of the available history
  const best = useMemo(
    () => bestDay(weeklyHistory),
    [weeklyHistory]
  );

  // Convert minutes into a readable format
  const focusTime = useMemo(() => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (hours === 0) {
      return `${minutes}m`;
    }

    return `${hours}h ${minutes}m`;
  }, [totalMinutes]);

  const aresInsight = useMemo(() => {
  if (totalSessions === 0) {
    return "Complete your first focus session to unlock productivity insights.";
  }

  const avgSession = Math.round(totalMinutes / totalSessions);

  if (avgSession >= 50) {
    return `Excellent deep work! Your average session is ${avgSession} minutes. You are maintaining strong focus consistency.`;
  }

  if (currentStreak >= 3) {
    return `Great consistency! You have a ${currentStreak} day focus streak. Keep building the habit.`;
  }

  return `Your average focus session is ${avgSession} minutes. Try Deep Mode to increase your productivity.`;
}, [
  totalSessions,
  totalMinutes,
  currentStreak
]);

  return (
    <section className="focus-analytics glass-card">

      {/* Header */}
      <div className="focus-analytics-header">
        <div>
          <h2>Focus Analytics</h2>
          <p>Track your focus performance this week</p>
        </div>
      </div>

      {/* Metrics */}
      <div className="metrics-grid">
        <div className="card metric">
          <div className="label">Focus Score</div>
          <div className="value">{score}%</div>
        </div>

        <div className="card metric">
          <div className="label">Sessions</div>
          <div className="value">{totalSessions}</div>
        </div>

        <div className="card metric">
          <div className="label">Focus Time</div>
          <div className="value">{focusTime}</div>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="focus-chart">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={series}
            margin={{
              top: 20,
              right: 8,
              left: 0,
              bottom: 8,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="rgba(255,255,255,0.06)"
              vertical={false}
            />

            <XAxis
              dataKey="label"
              axisLine={false}
              tickLine={false}
            />

            <YAxis
              axisLine={false}
              tickLine={false}
              width={35}
              allowDecimals={false}
            />

            <Tooltip
              formatter={(value, name) => {
                if (name === "minutes") {
                  return [`${value} min`, "Focus Time"];
                }

                return [value, name];
              }}
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                color: "var(--text)",
              }}
            />

            <Bar
              dataKey="minutes"
              fill="#3b82f6"
              radius={[6, 6, 0, 0]}
              maxBarSize={42}
            >
              <LabelList
                dataKey="sessions"
                position="top"
                formatter={(value) =>
                  value ? `${value} ${value === 1 ? "session" : "sessions"}` : ""
                }
                fill="var(--text-muted)"
                fontSize={11}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Focus Progress */}
<div className="focus-progress">
  <div className="progress-header">
    <span>Focus Progress</span>
    <strong>{score}%</strong>
  </div>

  <div className="progress-track">
    <div
      className="progress-fill"
      style={{ width: `${score}%` }}
    />
  </div>

  <div className="progress-info">
    {totalMinutes} min completed this week
  </div>
</div>

{/* ARES Insight */}
<div className="ares-insight">
  <div className="ares-title">
    🧠 ARES Insight
  </div>

  <p>{aresInsight}</p>
</div>

      {/* Summary */}
      <div className="focus-analytics-summary">
        <div>
          🔥 <strong>{currentStreak}</strong>{" "}
          {currentStreak === 1 ? "Day" : "Days"} Streak
        </div>

        <div>
          🧠 Best Day:{" "}
          <strong>{best ? best.label : "—"}</strong>
        </div>

        {best && (
          <div className="summary-muted">
            Best day: {best.minutes} min
          </div>
        )}
      </div>
    </section>
  );
}

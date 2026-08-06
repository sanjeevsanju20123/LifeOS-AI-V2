import React from "react";
import "./StatsGrid.css";
import { useFocus } from "../../context/FocusContext";

function StatsGrid() {
  const { stats } = useFocus();

  const totalMinutes = (stats?.totalMinutes ?? 0);
  const totalSessions = (stats?.sessions ?? 0);
  const streak = (stats?.streak ?? 0);

  // Weekly goal in minutes (5 hours by default). Adjust as you like.
  const weeklyGoalMinutes = 5 * 60;
  const focusScore = Math.min(
    100,
    Math.round((totalMinutes / weeklyGoalMinutes) * 100)
  );

  // Format as "4.5h" similar to original
  const focusHours = (totalMinutes / 60).toFixed(1) + "h";

  const statsData = [
    {
      icon: "🎯",
      title: "Focus Score",
      value: `${focusScore}%`,
    },
    {
      icon: "✅",
      title: "Sessions",
      value: `${totalSessions}`,
    },
    {
      icon: "🔥",
      title: "Day Streak",
      value: `${streak} Day${streak !== 1 ? "s" : ""}`,
    },
    {
      icon: "⏱️",
      title: "Focus Time",
      value: focusHours,
    },
  ];

  return (
    <section className="stats-grid">
      {statsData.map((stat, index) => (
        <div className="stat-card" key={index}>
          <div className="stat-icon">{stat.icon}</div>

          <div>
            <p>{stat.title}</p>
            <h2>{stat.value}</h2>
          </div>
        </div>
      ))}
    </section>
  );
}

export default StatsGrid;
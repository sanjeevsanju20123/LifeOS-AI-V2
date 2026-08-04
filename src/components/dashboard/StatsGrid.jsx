import "./StatsGrid.css";

function StatsGrid() {
  const stats = [
    {
      icon: "🎯",
      title: "Focus Score",
      value: "86%",
    },
    {
      icon: "✅",
      title: "Tasks Done",
      value: "12",
    },
    {
      icon: "🔥",
      title: "Day Streak",
      value: "7 Days",
    },
    {
      icon: "⏱️",
      title: "Focus Time",
      value: "4.5h",
    },
  ];

  return (
    <section className="stats-grid">
      {stats.map((stat, index) => (
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
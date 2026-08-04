import "./QuickActions.css";

function QuickActions() {
  const actions = [
    {
      icon: "⏱️",
      title: "Start Focus",
    },
    {
      icon: "➕",
      title: "Add Task",
    },
    {
      icon: "📅",
      title: "Plan Day",
    },
    {
      icon: "🎯",
      title: "View Goals",
    },
  ];

  return (
    <section className="quick-actions">
      <div className="section-header">
        <h2>⚡ Quick Actions</h2>
      </div>

      <div className="action-grid">
        {actions.map((action, index) => (
          <button className="action-card" key={index}>
            <span>{action.icon}</span>
            <p>{action.title}</p>
          </button>
        ))}
      </div>
    </section>
  );
}

export default QuickActions;
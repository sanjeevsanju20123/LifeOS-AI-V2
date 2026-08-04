import "./ARESPanel.css";
import { useProductivity } from "../../hooks/useProductivity";
import { useTasks } from "../../context/TaskContext";
import { useFocus } from "../../context/FocusContext";
import { getRecommendation } from "../../services/recommendationEngine";

function ARESPanel() {
 const {
  productivityScore,
  completedTasks,
  pendingTasks,
  totalTasks,
  plannerEvents,
  focusMinutes,
  streak,
} = useProductivity();

  const { stats } = useTasks();
  const { stats: focusStats, startTimer, setFocusMode } = useFocus();

  const hour = new Date().getHours();

  let greeting = "Good Evening";

  if (hour < 12) greeting = "Good Morning";
  else if (hour < 18) greeting = "Good Afternoon";

  const recommendation = getRecommendation({
  productivityScore,
  completedTasks,
  pendingTasks,
  plannerEvents,
  focusMinutes,
});

  return (
    <section className="ares-panel">

      <div className="ares-header">
        <div>
          <div className="ares-title">
  <h2>🤖 ARES Neural Core</h2>

  <div className="ai-status">
    <span className="status-dot"></span>
    Online
  </div>
</div>
          <p>{greeting}, Sanjeev 👋</p>
        </div>

        <span className="ares-grade">
  {productivityScore}%
</span>
      </div>

      <div className="ares-summary">

        <div className="summary-card">
          <h3>Tasks</h3>
          <span>
            {completedTasks}/{totalTasks}
          </span>
        </div>

        <div className="summary-card">
          <h3>Focus</h3>
          <span>
            {focusMinutes} min
          </span>
        </div>

        <div className="summary-card">
          <h3>Productivity</h3>
          <span>{productivityScore}%</span>
        </div>

      </div>

      <div className="ares-mission">
        <h3>🎯 Today's Mission</h3>

        <h4>{recommendation.title}</h4>
        <p>{recommendation.message}</p>
      </div>

      <div className="ares-buttons">

        <button
          onClick={() => {
            setFocusMode("quick");
            startTimer();
          }}
        >
          Start Focus
        </button>

      </div>

    </section>
  );
}

export default ARESPanel;
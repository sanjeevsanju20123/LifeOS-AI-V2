import "./ARESPanel.css";
import { useProductivity } from "../../hooks/useProductivity";
import { useFocus } from "../../context/FocusContext";
import { getRecommendation } from "../../services/ai/recommendationEngine";
import { getDailyBrief } from "../../services/ai/briefingEngine";
import ProductivityRing from "./ProductivityRing";

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

  const { startTimer, setFocusMode, } = useFocus();

  const recommendation = getRecommendation({
  productivityScore,
  completedTasks,
  pendingTasks,
  plannerEvents,
  focusMinutes,
});

    const briefing = getDailyBrief({
  completedTasks,
  pendingTasks,
  plannerEvents,
  focusMinutes,
  productivityScore,
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
          <div className="ares-brief">
  <p>🤖 DAILY BRIEF</p>

  <h3>
    {briefing.greeting}, Sanjeev 👋
  </h3>

  <p>{briefing.headline}</p>

  <p>{briefing.overview}</p>
</div>
        </div>

        <ProductivityRing
  score={productivityScore}
/>
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

      <div className="ares-insight">

  <h3>🧠 AI Insight</h3>

  <p>
    Your productivity improves when you finish existing tasks before creating new ones.
  </p>

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
         <div className="ares-buttons">

  <button
    onClick={() => {
      setFocusMode("quick");
      startTimer();
    }}
  >
    ⚡ Start Focus
  </button>

  <button>
    📅 Planner
  </button>

  <button>
    ✅ Tasks
  </button>

</div>
</button>

</div>

    </section>
  );
}

export default ARESPanel;
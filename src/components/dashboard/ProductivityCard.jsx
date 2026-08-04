import "./ProductivityCard.css";
import { useProductivity } from "../../hooks/useProductivity";

function ProductivityCard() {
  const {
  productivityScore,
  completedTasks,
  pendingTasks,
  totalTasks,
  plannerEvents,
  focusMinutes,
  streak,
} = useProductivity();

  return (
    <div className="productivity-card">

      <div className="productivity-header">
        <h2>🚀 Productivity</h2>
        <span>Live</span>
      </div>

      <div className="progress-ring">

        <svg width="180" height="180">

          <circle
            className="ring-bg"
            cx="90"
            cy="90"
            r="70"
          />

          <circle
            className="ring-progress"
            cx="90"
            cy="90"
            r="70"
            style={{
              strokeDasharray: 440,
              strokeDashoffset:
  440 - (440 * productivityScore) / 100,
            }}
          />

        </svg>

        <div className="ring-text">
          <h1>{productivityScore}%</h1>
          <p>Today's Score</p>
        </div>

      </div>

      <div className="score-breakdown">

  <div>
    <span>Tasks</span>
    <strong>
      {completedTasks}/{totalTasks}
    </strong>
  </div>

  <div>
    <span>Focus</span>
    <strong>
      {Math.floor(focusMinutes / 60)}h {focusMinutes % 60}m
    </strong>
  </div>

  <div>
    <span>Planner</span>
    <strong>{plannerEvents}</strong>
  </div>

  <div>
    <span>Streak</span>
    <strong>{streak} 🔥</strong>
  </div>

</div>

    </div>
  );
}

export default ProductivityCard;
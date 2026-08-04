import { useFocus } from "../../context/FocusContext";
import FocusModal from "./FocusModal";
import "./FocusWidget.css";

function FocusWidget() {
  const {
  timeLeft,
  selectedTime,
  stats,
  isRunning,
  startTimer,
  pauseTimer,
  resetTimer,
  setFocusMode,
  showModal,
  setShowModal,
} = useFocus();

  const totalTime = selectedTime;// 25 minute focus session
  const progress = ((totalTime - timeLeft) / totalTime) * 100;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  return (
    <>
      <div className="focus-widget">

        <div className="focus-header">
          <h2>🧠 Mindfulness Focus</h2>

          <span
            className={`focus-status ${
              isRunning ? "running" : "paused"
            }`}
          >
            {isRunning ? "Deep Focus Active" : "Ready"}
          </span>
        </div>


        <div
          className="focus-circle"
          style={{
            background: `conic-gradient(
              #3b82f6 ${progress}%,
              rgba(255,255,255,0.08) ${progress}%
            )`,
          }}
        >
          <div className="focus-inner">
            <h1 className="focus-time">
              {String(minutes).padStart(2, "0")}:
              {String(seconds).padStart(2, "0")}
            </h1>

            <p>
              {isRunning
                ? "Stay focused..."
                : "Ready to start"}
            </p>
          </div>
        </div>
        <div className="focus-modes">
  <button onClick={() => setFocusMode("quick")}>
    ⚡ 25 Min
  </button>

  <button onClick={() => setFocusMode("deep")}>
    🧠 50 Min
  </button>

  <button onClick={() => setFocusMode("flow")}>
    🚀 90 Min
  </button>
</div>  

        <div className="focus-buttons">
          <button onClick={startTimer}>
            Start
          </button>

          <button onClick={pauseTimer}>
            Pause
          </button>

          <button onClick={resetTimer}>
            Reset
          </button>
        </div>
        <div className="focus-stats">

  <div className="focus-stat-card">
    <h3>🧠 Sessions</h3>
    <span>{stats.sessions}</span>
  </div>

  <div className="focus-stat-card">
    <h3>⏱ Focus Time</h3>
    <span>{Math.floor(stats.totalMinutes / 60)}h {stats.totalMinutes % 60}m</span>
  </div>

  <div className="focus-stat-card">
    <h3>🔥 Streak</h3>
    <span>{stats.streak} Day{stats.streak !== 1 ? "s" : ""}</span>
  </div>

</div>
      </div>


      <FocusModal
        open={showModal}
        onClose={() => setShowModal(false)}
      />

    </>
  );
}

export default FocusWidget;
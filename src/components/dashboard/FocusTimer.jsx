import "./FocusTimer.css";

import { useEffect, useState } from "react";

function FocusTimer() {
  const [seconds, setSeconds] = useState(25 * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    if (!running) return;

    const timer = setInterval(() => {
      setSeconds((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          setRunning(false);
          return 25 * 60;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [running]);

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;

  const resetTimer = () => {
    setRunning(false);
    setSeconds(25 * 60);
  };

  return (
    <section className="focus-timer">
      <div className="section-header">
        <h2>⏱️ Focus Mode</h2>
      </div>

      <div className="timer-display">
        {String(minutes).padStart(2, "0")}:
        {String(remainingSeconds).padStart(2, "0")}
      </div>

      <div className="timer-buttons">
        <button onClick={() => setRunning(true)}>
          Start
        </button>

        <button onClick={() => setRunning(false)}>
          Pause
        </button>

        <button onClick={resetTimer}>
          Reset
        </button>
      </div>

      <p className="focus-status">
        Deep Work Session
      </p>
    </section>
  );
}

export default FocusTimer;
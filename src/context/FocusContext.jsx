// src/context/FocusContext.jsx
import { createContext, useContext, useEffect, useRef, useState } from "react";

const FocusContext = createContext();
const STORAGE_KEY = "lifeos-focus";

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    // ignore quota / write errors
  }
}

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    return null;
  }
}

function getDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
}

function calculateStreak(history = {}) {
  // Count consecutive days (including today) that have sessions > 0
  let streak = 0;
  const day = new Date();
  while (true) {
    const key = getDateKey(day);
    if (history[key] && (history[key].sessions ?? 0) > 0) {
      streak += 1;
      day.setDate(day.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
}

function formatMinutes(totalMinutes = 0) {
  const hrs = Math.floor(totalMinutes / 60);
  const mins = Math.round(totalMinutes % 60);
  return `${hrs}h ${mins}m`;
}

export function FocusProvider({ children }) {
  const FOCUS_MODES = {
    quick: 25 * 60,
    deep: 50 * 60,
    flow: 90 * 60,
  };

  const saved = loadState();

  const [selectedTime, setSelectedTime] = useState(
    saved?.selectedTime ?? FOCUS_MODES.quick
  );

  const [timeLeft, setTimeLeft] = useState(saved?.timeLeft ?? selectedTime);

  const [isRunning, setIsRunning] = useState(saved?.isRunning ?? false);

  const [showModal, setShowModal] = useState(false);

  const [stats, setStats] = useState(
    saved?.stats ?? {
      sessions: 0,
      totalMinutes: 0,
      history: {}, // { "2026-08-05": { sessions: 2, minutes: 50 } }
      streak: 0,
    }
  );

  const bell = useRef(typeof Audio !== "undefined" ? new Audio("/sounds/bell.mp3") : { play: () => {} });

  // Timer effect
  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);

          // Play bell if possible
          try {
            bell.current.currentTime = 0;
            bell.current.play();
          } catch (e) {
            // ignore autoplay errors
          }

          setIsRunning(false);
          setShowModal(true);

          // Save completed session (use minutes from selectedTime)
          const durationMinutes = Math.round(selectedTime / 60);

          setStats((prevStats) => {
            const todayKey = getDateKey();
            const prevEntry = prevStats.history?.[todayKey] ?? { sessions: 0, minutes: 0 };

            const newHistory = {
              ...prevStats.history,
              [todayKey]: {
                sessions: prevEntry.sessions + 1,
                minutes: prevEntry.minutes + durationMinutes,
              },
            };

            const newTotalMinutes = (prevStats.totalMinutes || 0) + durationMinutes;
            const newSessions = (prevStats.sessions || 0) + 1;
            const newStreak = calculateStreak(newHistory);

            return {
              ...prevStats,
              sessions: newSessions,
              totalMinutes: newTotalMinutes,
              history: newHistory,
              streak: newStreak,
            };
          });

          // Reset displayed time to selectedTime (so UI shows full duration after completion)
          return selectedTime;
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, selectedTime]);

  // Persist state whenever key pieces change
  useEffect(() => {
    saveState({
      timeLeft,
      isRunning,
      selectedTime,
      stats,
    });
  }, [timeLeft, isRunning, selectedTime, stats]);

  // Derived values
  const todayKey = getDateKey();
  const yesterdayDate = new Date();
  yesterdayDate.setDate(yesterdayDate.getDate() - 1);
  const yesterdayKey = getDateKey(yesterdayDate);

  const todaySessions = stats.history?.[todayKey]?.sessions ?? 0;
  const yesterdaySessions = stats.history?.[yesterdayKey]?.sessions ?? 0;
  const totalFocusMinutes = stats.totalMinutes ?? 0;
  const totalFocusFormatted = formatMinutes(totalFocusMinutes);
  const currentStreak = stats.streak ?? calculateStreak(stats.history ?? {});

  // weeklyHistory: array of last 7 days (oldest first)
  const weeklyHistory = (() => {
    const arr = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = getDateKey(d);
      const entry = stats.history?.[key] ?? { sessions: 0, minutes: 0 };
      arr.push({
        date: key,
        sessions: entry.sessions,
        minutes: entry.minutes,
      });
    }
    return arr;
  })();

  // Controls
  function startTimer() {
    setIsRunning(true);
  }

  function pauseTimer() {
    setIsRunning(false);
  }

  function resetTimer() {
    setIsRunning(false);
    setTimeLeft(selectedTime);
  }

  function setFocusMode(mode) {
    const duration = FOCUS_MODES[mode];
    if (!duration) return;
    setIsRunning(false);
    setSelectedTime(duration);
    setTimeLeft(duration);
  }

  // Optional helper to manually add a session (useful for testing)
  function addManualSession({ date = new Date(), minutes = Math.round(selectedTime / 60) } = {}) {
    const key = getDateKey(date);
    setStats((prevStats) => {
      const prevEntry = prevStats.history?.[key] ?? { sessions: 0, minutes: 0 };
      const newHistory = {
        ...prevStats.history,
        [key]: {
          sessions: prevEntry.sessions + 1,
          minutes: prevEntry.minutes + minutes,
        },
      };
      const newTotalMinutes = (prevStats.totalMinutes || 0) + minutes;
      const newSessions = (prevStats.sessions || 0) + 1;
      const newStreak = calculateStreak(newHistory);
      return {
        ...prevStats,
        history: newHistory,
        totalMinutes: newTotalMinutes,
        sessions: newSessions,
        streak: newStreak,
      };
    });
  }

  return (
    <FocusContext.Provider
      value={{
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
        // derived
        todaySessions,
        yesterdaySessions,
        totalFocusMinutes,
        totalFocusFormatted,
        currentStreak,
        weeklyHistory,
        // helper
        addManualSession,
      }}
    >
      {children}
    </FocusContext.Provider>
  );
}

export function useFocus() {
  return useContext(FocusContext);
}
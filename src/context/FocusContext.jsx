import { createContext, useContext, useEffect, useRef, useState } from "react";

const FocusContext = createContext();

const STORAGE_KEY = "lifeos-focus";

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function loadState() {
  const saved = localStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : null;
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

  const [timeLeft, setTimeLeft] = useState(
    saved?.timeLeft ?? FOCUS_MODES.quick
  );

  const [isRunning, setIsRunning] = useState(
    saved?.isRunning ?? false
  );

  const [showModal, setShowModal] = useState(false);

  const [stats, setStats] = useState(
  saved?.stats ?? {
    sessions: 0,
    totalMinutes: 0,
    streak: 1,
  }
);

  const bell = useRef(new Audio("/sounds/bell.mp3"));

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
  clearInterval(timer);

  bell.current.currentTime = 0;
  bell.current.play();

  setIsRunning(false);
  setShowModal(true);

  setStats((prevStats) => ({
    ...prevStats,
    sessions: prevStats.sessions + 1,
    totalMinutes:
      prevStats.totalMinutes + selectedTime / 60,
  }));

  return selectedTime;
}

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isRunning, selectedTime]);

  useEffect(() => {
    saveState({
  timeLeft,
  isRunning,
  selectedTime,
  stats,
});
  }, [timeLeft, isRunning, selectedTime]);

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
      }}
    >
      {children}
    </FocusContext.Provider>
  );
}

export function useFocus() {
  return useContext(FocusContext);
}
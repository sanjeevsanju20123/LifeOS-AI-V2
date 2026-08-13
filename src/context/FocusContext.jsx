import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  recordFocusSession,
} from "../services/ai/learningEngine";

import {
  completeARESAction,
} from "../services/ares/aresActionLearning";

const FocusContext = createContext();

const STORAGE_KEY = "lifeos-focus";

// ==========================================
// SAVE STATE
// ==========================================

function saveState(state) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(state)
    );
  } catch (e) {
    // Ignore quota / write errors
  }
}

// ==========================================
// LOAD STATE
// ==========================================

function loadState() {
  try {
    const saved =
      localStorage.getItem(STORAGE_KEY);

    return saved
      ? JSON.parse(saved)
      : null;
  } catch (e) {
    return null;
  }
}

// ==========================================
// DATE KEY
// ==========================================

function getDateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

// ==========================================
// CALCULATE STREAK
// ==========================================

function calculateStreak(history = {}) {
  // Count consecutive days including today
  // that have sessions > 0

  let streak = 0;

  const day = new Date();

  while (true) {
    const key = getDateKey(day);

    if (
      history[key] &&
      (history[key].sessions ?? 0) > 0
    ) {
      streak += 1;

      day.setDate(
        day.getDate() - 1
      );
    } else {
      break;
    }
  }

  return streak;
}

// ==========================================
// FORMAT MINUTES
// ==========================================

function formatMinutes(
  totalMinutes = 0
) {
  const hrs =
    Math.floor(totalMinutes / 60);

  const mins =
    Math.round(totalMinutes % 60);

  return `${hrs}h ${mins}m`;
}

// ==========================================
// FOCUS PROVIDER
// ==========================================

export function FocusProvider({
  children,
}) {

  const FOCUS_MODES = {
    quick: 25 * 60,
    deep: 50 * 60,
    flow: 90 * 60,
  };

  const saved = loadState();

  const [selectedTime, setSelectedTime] =
    useState(
      saved?.selectedTime ??
      FOCUS_MODES.quick
    );

  const [timeLeft, setTimeLeft] =
    useState(
      saved?.timeLeft ??
      selectedTime
    );

  const [isRunning, setIsRunning] =
    useState(
      saved?.isRunning ?? false
    );

  const [showModal, setShowModal] =
    useState(false);

  const [stats, setStats] =
    useState(
      saved?.stats ?? {
        sessions: 0,
        totalMinutes: 0,
        history: {},
        streak: 0,
      }
    );

  // =========================================
  // ARES ACTIVE ACTION
  // =========================================

  const aresActionIdRef =
    useRef(null);

  // =========================================
  // AUDIO
  // =========================================

  const bell = useRef(
    typeof Audio !== "undefined"
      ? new Audio(
          "/sounds/bell.mp3"
        )
      : {
          play: () => {},
        }
  );

  // =========================================
  // LISTEN FOR ARES ACTION START
  // =========================================

  useEffect(() => {

    function handleARESActionStarted(
      event
    ) {
      const actionId =
        event?.detail?.actionId;

      if (!actionId) {
        return;
      }

      aresActionIdRef.current =
        actionId;

      console.log(
        "🧠 ARES ACTION LINKED TO FOCUS:",
        actionId
      );
    }

    window.addEventListener(
      "ares-action-started",
      handleARESActionStarted
    );

    return () => {
      window.removeEventListener(
        "ares-action-started",
        handleARESActionStarted
      );
    };

  }, []);

  // =========================================
  // TIMER EFFECT
  // =========================================

  useEffect(() => {

    if (!isRunning) {
      return;
    }

    const timer =
      setInterval(() => {

        setTimeLeft((prev) => {

          // =========================================
          // SESSION COMPLETED
          // =========================================

          if (prev <= 1) {

            clearInterval(timer);

            // =========================================
            // PLAY BELL
            // =========================================

            try {
              bell.current.currentTime = 0;

              bell.current.play();
            } catch (e) {
              // Ignore autoplay errors
            }

            // =========================================
            // STOP TIMER
            // =========================================

            setIsRunning(false);

            setShowModal(true);

            // =========================================
            // SESSION DURATION
            // =========================================

            const durationMinutes =
              Math.round(
                selectedTime / 60
              );

            // =========================================
            // ARES LEARNING
            // =========================================

            recordFocusSession({
              minutes:
                durationMinutes,
            });

            // =========================================
            // COMPLETE ARES ACTION
            // =========================================

const aresActionId =
  aresActionIdRef.current;

if (aresActionId) {

  const completedAction =
    completeARESAction(
      aresActionId
    );

  console.log(
    "✅ ARES ACTION COMPLETED FROM FOCUS:",
    completedAction
  );

  // Clear the linked action
  aresActionIdRef.current =
    null;

  // Tell ARES learning systems that
  // new behavioral data is available.
  window.dispatchEvent(
    new Event(
      "ares-learning-updated"
    )
  );
}

            // =========================================
            // SAVE FOCUS STATS
            // =========================================

            setStats((prevStats) => {

              const todayKey =
                getDateKey();

              const prevEntry =
                prevStats.history?.[
                  todayKey
                ] ?? {
                  sessions: 0,
                  minutes: 0,
                };

              const newHistory = {
                ...prevStats.history,

                [todayKey]: {
                  sessions:
                    prevEntry.sessions + 1,

                  minutes:
                    prevEntry.minutes +
                    durationMinutes,
                },
              };

              const newTotalMinutes =
                (prevStats.totalMinutes ||
                  0) +
                durationMinutes;

              const newSessions =
                (prevStats.sessions || 0) +
                1;

              const newStreak =
                calculateStreak(
                  newHistory
                );

              return {
                ...prevStats,

                sessions:
                  newSessions,

                totalMinutes:
                  newTotalMinutes,

                history:
                  newHistory,

                streak:
                  newStreak,
              };
            });

            // =========================================
            // RESET TIMER DISPLAY
            // =========================================

            return selectedTime;
          }

          return prev - 1;
        });

      }, 1000);

    return () =>
      clearInterval(timer);

  }, [
    isRunning,
    selectedTime,
  ]);

  // =========================================
  // PERSIST STATE
  // =========================================

  useEffect(() => {

    saveState({
      timeLeft,
      isRunning,
      selectedTime,
      stats,
    });

  }, [
    timeLeft,
    isRunning,
    selectedTime,
    stats,
  ]);

  // =========================================
  // DERIVED VALUES
  // =========================================

  const todayKey =
    getDateKey();

  const yesterdayDate =
    new Date();

  yesterdayDate.setDate(
    yesterdayDate.getDate() - 1
  );

  const yesterdayKey =
    getDateKey(
      yesterdayDate
    );

  const todaySessions =
    stats.history?.[
      todayKey
    ]?.sessions ?? 0;

  const yesterdaySessions =
    stats.history?.[
      yesterdayKey
    ]?.sessions ?? 0;

  const totalFocusMinutes =
    stats.totalMinutes ?? 0;

  const totalFocusFormatted =
    formatMinutes(
      totalFocusMinutes
    );

  const currentStreak =
    stats.streak ??
    calculateStreak(
      stats.history ?? {}
    );

  // =========================================
  // WEEKLY HISTORY
  // =========================================

  const weeklyHistory =
    (() => {

      const arr = [];

      for (
        let i = 6;
        i >= 0;
        i--
      ) {

        const d =
          new Date();

        d.setDate(
          d.getDate() - i
        );

        const key =
          getDateKey(d);

        const entry =
          stats.history?.[
            key
          ] ?? {
            sessions: 0,
            minutes: 0,
          };

        arr.push({
          date: key,

          sessions:
            entry.sessions,

          minutes:
            entry.minutes,
        });
      }

      return arr;

    })();

  // =========================================
  // CONTROLS
  // =========================================

  function startTimer() {
    setIsRunning(true);
  }

  function pauseTimer() {
    setIsRunning(false);
  }

  function resetTimer() {
    setIsRunning(false);

    setTimeLeft(
      selectedTime
    );

    // If the user resets before
    // completing an ARES action,
    // keep the action linked.
    //
    // This allows them to resume
    // the same recommended focus.
  }

  function setFocusMode(mode) {

    const duration =
      FOCUS_MODES[mode];

    if (!duration) {
      return;
    }

    setIsRunning(false);

    setSelectedTime(
      duration
    );

    setTimeLeft(
      duration
    );
  }

  // =========================================
  // MANUAL SESSION
  // =========================================

  function addManualSession({
    date = new Date(),

    minutes =
      Math.round(
        selectedTime / 60
      ),

  } = {}) {

    // Record manual session
    recordFocusSession({
      minutes,
      date,
    });

    const key =
      getDateKey(date);

    setStats((prevStats) => {

      const prevEntry =
        prevStats.history?.[
          key
        ] ?? {
          sessions: 0,
          minutes: 0,
        };

      const newHistory = {
        ...prevStats.history,

        [key]: {
          sessions:
            prevEntry.sessions + 1,

          minutes:
            prevEntry.minutes +
            minutes,
        },
      };

      const newTotalMinutes =
        (prevStats.totalMinutes || 0) +
        minutes;

      const newSessions =
        (prevStats.sessions || 0) +
        1;

      const newStreak =
        calculateStreak(
          newHistory
        );

      return {
        ...prevStats,

        history:
          newHistory,

        totalMinutes:
          newTotalMinutes,

        sessions:
          newSessions,

        streak:
          newStreak,
      };

    });
  }

  // =========================================
  // PROVIDER
  // =========================================

  return (

    <FocusContext.Provider
      value={{

        // Timer
        timeLeft,
        selectedTime,
        isRunning,

        startTimer,
        pauseTimer,
        resetTimer,
        setFocusMode,

        // Modal
        showModal,
        setShowModal,

        // Stats
        stats,

        // Derived
        todaySessions,
        yesterdaySessions,

        totalFocusMinutes,
        totalFocusFormatted,

        currentStreak,

        weeklyHistory,

        // Helper
        addManualSession,

      }}
    >

      {children}

    </FocusContext.Provider>
  );
}

// ==========================================
// USE FOCUS
// ==========================================

export function useFocus() {
  return useContext(
    FocusContext
  );
}
import {
  useEffect,
  useMemo,
  useState,
} from "react";
import "./ARESPanel.css";

import { useProductivity } from "../../hooks/useProductivity";
import useGoals from "../../hooks/useGoals";
import { useFocus } from "../../context/FocusContext";
import { useTasks } from "../../context/TaskContext";
import { useSettings } from "../../context/SettingsContext";
import useARESLearning from "../../hooks/useARESLearning";

import { getARESResponse } from "../../services/ares/aresCore";
import { getDailyBrief } from "../../services/ai/briefingEngine";
import { getARESPatternReport } from "../../services/aresPatternIntelligence";

import {
  recordARESAction,
} from "../../services/ares/aresActionLearning";

import ProductivityRing from "./ProductivityRing";

function ARESPanel() {
  const {
    productivityScore,
    plannerEvents,
    focusMinutes,
  } = useProductivity();

  const { tasks } = useTasks();

  const { aurora } = useSettings();

  const {
    totalGoals,
    completedGoals,
    activeGoals,
    averageProgress,
  } = useGoals();

  const {
    startTimer,
    setFocusMode,
  } = useFocus();

  // =========================================
  // ARES ACTION STATE
  // =========================================

  const [
    activeARESActionId,
    setActiveARESActionId,
  ] = useState(null);

  // =========================================
  // ARES DECISION REFRESH
  // =========================================

  const [
    decisionRefresh,
    setDecisionRefresh,
  ] = useState(0);

  // =========================================
  // TASK STATS
  // =========================================

  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.completed
  ).length;

  const pendingTasks =
    totalTasks - completedTasks;

  // =========================================
  // ARES LEARNING
  // =========================================

  const {
    insight: learningInsight,
  } = useARESLearning();

  // =========================================
  // ARES PATTERN INTELLIGENCE
  // =========================================

  const [
    patternReport,
    setPatternReport,
  ] = useState(() =>
    getARESPatternReport()
  );

  useEffect(() => {
    function refreshPatterns() {
      setPatternReport(
        getARESPatternReport()
      );
    }

    window.addEventListener(
      "ares-learning-updated",
      refreshPatterns
    );

    return () => {
      window.removeEventListener(
        "ares-learning-updated",
        refreshPatterns
      );
    };
  }, []);

  const patterns =
    patternReport?.patterns;

  // =========================================
// ARES CORE
// =========================================
// Memoized so ARES does not recalculate
// on every ordinary React render.
// =========================================

console.log("ARES DEPENDENCIES", {
  tasks,
  activeGoals,
  focusMinutes,
  plannerEvents,
  aurora,
  decisionRefresh,
});

const aresResponse = useMemo(
  () =>
    getARESResponse({
      tasks,

      goals: activeGoals,

      focus: {
        totalMinutes: focusMinutes,
      },

      plannerEvents,

      settings: {
        aurora,
      },

      // Forces the component to recalculate
      // after ARES learning changes.
      decisionRefresh,
    }),
  [
    tasks,
    activeGoals,
    focusMinutes,
    plannerEvents,
    aurora,
    decisionRefresh,
  ]
);

const recommendation = aresResponse;

  // =========================================
  // ARES DAILY BRIEF
  // =========================================

  const briefing =
    getDailyBrief({
      completedTasks,
      pendingTasks,
      plannerEvents,
      focusMinutes,
      productivityScore,
      activeGoals,
    });

  // =========================================
  // ARES LEARNING UPDATE LISTENER
  // =========================================

  useEffect(() => {
    function handleLearningUpdate() {
      // Refresh ARES pattern intelligence.
      setPatternReport(
        getARESPatternReport()
      );

      // The FocusContext may have just
      // completed an ARES action.
      setActiveARESActionId(null);

      // Recalculate ARES decision.
      setDecisionRefresh(
        (value) => value + 1
      );
    }

    window.addEventListener(
      "ares-learning-updated",
      handleLearningUpdate
    );

    return () => {
      window.removeEventListener(
        "ares-learning-updated",
        handleLearningUpdate
      );
    };
  }, []);

  // =========================================
  // START ARES RECOMMENDED ACTION
  // =========================================

  function handleARESAction() {
    const action =
      recommendation?.action;

    if (!action) {
      return;
    }

    // -----------------------------------------
    // START FOCUS ACTION
    // -----------------------------------------

    if (
      action.type === "start-focus"
    ) {
      // Prevent duplicate recommendations
      // while another ARES action is active.
      if (activeARESActionId) {
        return;
      }

      const recordedAction =
        recordARESAction({
          type: action.type,

          mode:
            action.mode,

          duration:
            action.duration,

          source:
            recommendation?.source ||
            recommendation?.state
              ?.decision
              ?.source ||
            "local-ares",
        });

      if (recordedAction?.id) {
        setActiveARESActionId(
          recordedAction.id
        );

        // Link this ARES recommendation
        // to the actual Focus session.
        window.dispatchEvent(
          new CustomEvent(
            "ares-action-started",
            {
              detail: {
                actionId:
                  recordedAction.id,
              },
            }
          )
        );

        console.log(
          "🧠 ARES ACTION STARTED:",
          recordedAction
        );
      }

      // Set the recommended focus mode.
      setFocusMode(
        action.mode
      );

      // Start actual LifeOS focus timer.
      startTimer();
    }
  }

  // =========================================
  // PATTERN DISPLAY HELPERS
  // =========================================

  const focusPeriod =
    patterns?.focusTime?.period;

  const focusStyle =
    patterns?.focusStyle?.style;

  const averageSession =
    patterns?.focusStyle
      ?.averageMinutes;

  const strongestPriority =
    patterns?.taskBehavior
      ?.strongestPriority;

  const progressTrend =
    patterns?.progressTrend
      ?.trend;

  const focusPeriodLabel =
    focusPeriod
      ? focusPeriod
          .charAt(0)
          .toUpperCase() +
        focusPeriod.slice(1)
      : "Learning";

  const focusStyleLabel =
    focusStyle === "deep"
      ? "Deep"
      : focusStyle === "short"
      ? "Short"
      : focusStyle === "balanced"
      ? "Balanced"
      : "Learning";

  const progressTrendLabel =
    progressTrend === "improving"
      ? "Improving"
      : progressTrend === "slowing"
      ? "Slowing"
      : progressTrend === "stable"
      ? "Stable"
      : "Learning";

  // =========================================
  // ADAPTIVE RECOMMENDATION
  // =========================================

  const isAdaptive =
    recommendation?.adaptive ===
    true;

  const adaptiveReason =
    recommendation?.adaptiveReason;

  const adaptiveMode =
    recommendation?.adaptiveMode;

  const actionLearning =
    recommendation?.learning;

  const learnedSuccessRate =
    actionLearning?.bestActionSuccessRate;

  // =========================================
  // FORMAT LEARNED MODE
  // =========================================

  function formatLearnedMode(
    mode
  ) {
    if (mode === "quick") {
      return "25-minute Quick Focus";
    }

    if (mode === "deep") {
      return "50-minute Deep Focus";
    }

    if (mode === "flow") {
      return "90-minute Flow Focus";
    }

    return null;
  }

  const learnedModeLabel =
    formatLearnedMode(
      adaptiveMode
    );

  // =========================================
  // RENDER
  // =========================================

  return (
    <section
      className={`ares-panel ${
        aurora ? "" : "no-aurora"
      }`}
    >
      {/* =========================================
          HEADER
      ========================================= */}

      <div className="ares-header">
        <div className="ares-title">
          <div className="ares-heading-row">
            <span className="ares-brain">
              🧠
            </span>

            <div>
              <h2>
                ARES Intelligence
              </h2>

              <div className="ai-status">
                <span className="status-dot" />

                AI System Active
              </div>
            </div>
          </div>
        </div>

        <ProductivityRing
          score={
            productivityScore
          }
        />
      </div>

      {/* =========================================
          LIVE SUMMARY
      ========================================= */}

      <div className="ares-summary">

        {/* TASKS */}

        <div className="summary-card">
          <span className="summary-icon">
            🎯
          </span>

          <div>
            <h3>
              Tasks
            </h3>

            <span>
              {completedTasks}/
              {totalTasks}
            </span>
          </div>
        </div>

        {/* FOCUS */}

        <div className="summary-card">
          <span className="summary-icon">
            ⏱️
          </span>

          <div>
            <h3>
              Focus
            </h3>

            <span>
              {focusMinutes} min
            </span>
          </div>
        </div>

        {/* PRODUCTIVITY */}

        <div className="summary-card">
          <span className="summary-icon">
            📊
          </span>

          <div>
            <h3>
              Productivity
            </h3>

            <span>
              {productivityScore}%
            </span>
          </div>
        </div>

        {/* GOALS */}

        <div className="summary-card">
          <span className="summary-icon">
            🏆
          </span>

          <div>
            <h3>
              Goals
            </h3>

            <span>
              {completedGoals}/
              {totalGoals}
            </span>
          </div>
        </div>
      </div>

      {/* =========================================
          ARES INSIGHT
      ========================================= */}

      <div className="ares-insight">
        <div className="ares-section-title">
          <span>
            💡
          </span>

          <h3>
            ARES Insight
          </h3>
        </div>

        <h4>
          {briefing.headline}
        </h4>

        <p>
          {briefing.overview}
        </p>

        {/* GOAL INTELLIGENCE */}

        <p className="ares-goal-insight">
          {totalGoals === 0
            ? "You haven't created any goals yet. Add one to give ARES a long-term objective."
            : `You have ${
                activeGoals.length
              } active ${
                activeGoals.length === 1
                  ? "goal"
                  : "goals"
              }, with an average progress of ${
                averageProgress
              }%.`}
        </p>
      </div>

      {/* =========================================
          ARES LEARNING
      ========================================= */}

      <div
        className={`ares-learning ${
          aurora ? "" : "no-aurora"
        }`}
      >
        <div className="ares-section-title">
          <span>
            🧠
          </span>

          <h3>
            ARES Learning
          </h3>
        </div>

        <h4>
          {learningInsight?.title ||
            "ARES Is Learning 🧠"}
        </h4>

        <p className="ares-learning-message">
          {learningInsight?.message ||
            "Keep using LifeOS. ARES is learning your productivity patterns."}
        </p>

        {/* =====================================
            ACTION LEARNING
        ===================================== */}

        {learnedSuccessRate !==
          null &&
          learnedSuccessRate !==
            undefined && (
            <p className="ares-learning-message">
              ARES currently sees a{" "}
              <strong>
                {learnedSuccessRate}%
              </strong>{" "}
              success rate for its strongest
              learned action.
            </p>
          )}
      </div>

      {/* =========================================
          ARES PATTERN INTELLIGENCE
      ========================================= */}

      <div className="ares-patterns">
        <div className="ares-section-title">
          <span>
            🔬
          </span>

          <h3>
            Pattern Intelligence
          </h3>
        </div>

        {/* PATTERN GRID */}

        <div className="ares-pattern-grid">

          {/* BEST FOCUS TIME */}

          <div className="ares-pattern-card">
            <span className="pattern-icon">
              ⏰
            </span>

            <div>
              <span className="pattern-label">
                Best Focus
              </span>

              <strong>
                {focusPeriodLabel}
              </strong>
            </div>
          </div>

          {/* FOCUS STYLE */}

          <div className="ares-pattern-card">
            <span className="pattern-icon">
              ⚡
            </span>

            <div>
              <span className="pattern-label">
                Focus Style
              </span>

              <strong>
                {focusStyleLabel}
              </strong>

              {averageSession >
                0 && (
                <small>
                  {averageSession} min
                  average
                </small>
              )}
            </div>
          </div>

          {/* TASK BEHAVIOR */}

          <div className="ares-pattern-card">
            <span className="pattern-icon">
              🎯
            </span>

            <div>
              <span className="pattern-label">
                Task Pattern
              </span>

              <strong>
                {strongestPriority
                  ? `${strongestPriority} priority`
                  : "Learning"}
              </strong>
            </div>
          </div>

          {/* PROGRESS TREND */}

          <div className="ares-pattern-card">
            <span className="pattern-icon">
              📈
            </span>

            <div>
              <span className="pattern-label">
                Progress
              </span>

              <strong>
                {progressTrendLabel}
              </strong>
            </div>
          </div>
        </div>

        {/* PATTERN INSIGHT */}

        {patternReport?.messages
          ?.length > 0 && (
          <div className="ares-pattern-message">
            <span>
              🧠
            </span>

            <p>
              {
                patternReport
                  .messages[0]
              }
            </p>
          </div>
        )}
      </div>

      {/* =========================================
          TODAY'S MISSION
      ========================================= */}

      <div className="ares-mission">
        <div className="ares-section-title">
          <span>
            🎯
          </span>

          <h3>
            Today's Mission
          </h3>
        </div>

        <h4>
          {recommendation?.title ||
            "ARES"}
        </h4>

        <p>
          {recommendation?.message ||
            "ARES is analyzing your current state."}
        </p>

        {/* =====================================
            ADAPTIVE LEARNING MESSAGE
        ===================================== */}

        {isAdaptive &&
          adaptiveReason && (
            <div className="ares-pattern-message">
              <span>
                🧠
              </span>

              <p>
                {adaptiveReason}
              </p>
            </div>
          )}

        {/* =====================================
            LEARNED MODE
        ===================================== */}

        {isAdaptive &&
          learnedModeLabel && (
            <p className="ares-learning-message">
              ARES learned that{" "}
              <strong>
                {learnedModeLabel}
              </strong>{" "}
              is currently your strongest
              performing focus approach.
            </p>
          )}
      </div>

      {/* =========================================
          ACTION
      ========================================= */}

      <div className="ares-buttons">
        <button
          type="button"
          onClick={
            handleARESAction
          }
          disabled={
            Boolean(
              activeARESActionId
            )
          }
        >
          {activeARESActionId
            ? "🧠 ARES Focus Active"
            : recommendation?.action
                ?.type ===
              "start-focus"
            ? `⚡ Start ${
                recommendation
                  ?.action
                  ?.mode ===
                "quick"
                  ? "Quick"
                  : recommendation
                      ?.action
                      ?.mode ===
                    "deep"
                  ? "Deep"
                  : recommendation
                      ?.action
                      ?.mode ===
                    "flow"
                  ? "Flow"
                  : "Focus"
              } Focus`
            : "⚡ Start Focus"}
        </button>
      </div>
    </section>
  );
}

export default ARESPanel;
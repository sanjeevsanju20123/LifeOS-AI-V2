import { getARESPatternReport } from "../aresPatternIntelligence";

// ==========================================
// ARES RECOMMENDATION ENGINE
// ==========================================

export function getRecommendation({
  productivityScore,
  completedTasks,
  pendingTasks,
  plannerEvents,
  focusMinutes,
  activeGoals = [],
  averageProgress = 0,
  learningInsight = null,
}) {
  // =========================================
  // ARES PATTERN INTELLIGENCE
  // =========================================

  const patternReport =
    getARESPatternReport();

  const patterns =
    patternReport?.patterns;

  const focusStyle =
    patterns?.focusStyle?.style;

  const focusPeriod =
    patterns?.focusTime?.period;

  const progressTrend =
    patterns?.progressTrend?.trend;

  // =========================================
  // PATTERN CONFIDENCE
  // =========================================

  const focusStyleConfidence =
    patterns?.focusStyle?.confidence?.score || 0;

  const focusTimeConfidence =
    patterns?.focusTime?.confidence?.score || 0;

  const progressTrendConfidence =
    patterns?.progressTrend?.confidence?.score || 0;

  // ARES only strongly trusts a learned
  // pattern when enough evidence exists.
  const hasReliableFocusStyle =
    focusStyleConfidence >= 50;

  const hasReliableFocusTime =
    focusTimeConfidence >= 50;

  const hasReliableProgressTrend =
    progressTrendConfidence >= 50;

  // =========================================
  // FIND IMPORTANT GOALS
  // =========================================

  const priorityWeight = {
    high: 3,
    medium: 2,
    low: 1,
  };

  const sortedGoals = [...activeGoals].sort(
    (a, b) => {
      const aPriority =
        priorityWeight[
          a.priority || "medium"
        ];

      const bPriority =
        priorityWeight[
          b.priority || "medium"
        ];

      // Higher priority first
      if (aPriority !== bPriority) {
        return bPriority - aPriority;
      }

      // If same priority,
      // prioritize the goal closest to completion
      return (
        (b.progress || 0) -
        (a.progress || 0)
      );
    }
  );

  const priorityGoal =
    sortedGoals[0];

  const highPriorityGoals =
    activeGoals.filter(
      (goal) =>
        !goal.completed &&
        (goal.priority || "medium") ===
          "high"
    );

  const highPriorityGoal =
    [...highPriorityGoals].sort(
      (a, b) =>
        (b.progress || 0) -
        (a.progress || 0)
    )[0];

  // =========================================
  // ARES PATTERN MISSION
  // HIGH PRIORITY GOAL + RELIABLE DEEP FOCUS
  // =========================================

  if (
    highPriorityGoal &&
    highPriorityGoal.progress < 70 &&
    focusStyle === "deep" &&
    hasReliableFocusStyle
  ) {
    return {
      type: "pattern-goal",
      title: "Deep Focus Mission 🎯",
      message:
        `Your high-priority goal "${highPriorityGoal.title}" is at ${highPriorityGoal.progress}% progress. ARES has learned that you work well with longer sessions. Start a 50-minute Deep Focus session and move it forward.`,
      focusMode: "deep",
    };
  }

  // =========================================
  // ARES PATTERN MISSION
  // HIGH PRIORITY GOAL + RELIABLE SHORT FOCUS
  // =========================================

  if (
    highPriorityGoal &&
    highPriorityGoal.progress < 70 &&
    focusStyle === "short" &&
    hasReliableFocusStyle
  ) {
    return {
      type: "pattern-goal",
      title: "Quick Progress Mission ⚡",
      message:
        `Your high-priority goal "${highPriorityGoal.title}" is at ${highPriorityGoal.progress}% progress. ARES has learned that shorter sessions work well for you. Start a 25-minute focus session and make progress.`,
      focusMode: "quick",
    };
  }

  // =========================================
  // BEST FOCUS PERIOD
  // ONLY USE WHEN RELIABLE
  // =========================================

  if (
    focusPeriod &&
    focusMinutes < 25 &&
    hasReliableFocusTime
  ) {
    return {
      type: "pattern-focus",
      title: "Use Your Strongest Focus Period 🧠",
      message:
        `ARES has learned that your strongest focus period is usually the ${focusPeriod}. Start a 25-minute session and use that pattern to your advantage.`,
      focusMode: "quick",
    };
  }

  // =========================================
  // HIGH PRIORITY GOAL — ALMOST COMPLETE
  // =========================================

  if (
    highPriorityGoal &&
    highPriorityGoal.progress >= 70 &&
    highPriorityGoal.progress < 100
  ) {
    return {
      type: "goal",
      title: "Finish What You Started 🎯",
      message:
        `"${highPriorityGoal.title}" is ${highPriorityGoal.progress}% complete. You're close to finishing it — make this one of today's priorities.`,
      focusMode: "quick",
    };
  }

  // =========================================
  // ARES LEARNING — DEEP FOCUS
  // =========================================

  if (
    learningInsight?.type ===
      "deep-focus" &&
    focusMinutes < 45
  ) {
    return {
      type: "learning-focus",
      title: "Use Your Deep Focus 🧠",
      message:
        "ARES has learned that you work well with longer focus sessions. Try a 50-minute Deep Focus session today.",
      focusMode: "deep",
    };
  }

  // =========================================
  // ARES LEARNING — SHORT FOCUS
  // =========================================

  if (
    learningInsight?.type ===
      "quick-focus" &&
    focusMinutes < 25
  ) {
    return {
      type: "learning-focus",
      title: "Use Your Quick Focus ⚡",
      message:
        "ARES has learned that shorter focused sessions work well for you. Start a 25-minute focus session.",
      focusMode: "quick",
    };
  }

  // =========================================
  // HIGH PRIORITY GOAL — NEEDS ATTENTION
  // =========================================

  if (
    highPriorityGoal &&
    highPriorityGoal.progress < 70
  ) {
    return {
      type: "goal",
      title: "Priority Goal 🎯",
      message:
        `Your high-priority goal "${highPriorityGoal.title}" is at ${highPriorityGoal.progress}% progress. Spend some focused time moving it forward today.`,
      focusMode: "quick",
    };
  }

  // =========================================
  // PROGRESS TREND — SLOWING
  // ONLY USE WHEN RELIABLE
  // =========================================

  if (
    progressTrend === "slowing" &&
    priorityGoal &&
    hasReliableProgressTrend
  ) {
    return {
      type: "trend-warning",
      title: "Restore Your Momentum 📈",
      message:
        `Your recent goal progress is slowing down. Focus on "${priorityGoal.title}" and make one meaningful step forward today.`,
      focusMode: "quick",
    };
  }

  // =========================================
  // LOW PRODUCTIVITY
  // =========================================

  if (productivityScore < 50) {
    return {
      type: "warning",
      title: "Boost Your Productivity",
      message:
        "Complete a high-priority task and start a 25-minute focus session.",
      focusMode: "quick",
    };
  }

  // =========================================
  // NO FOCUS TODAY
  // =========================================

  if (focusMinutes < 25) {
    return {
      type: "focus",
      title: "Time to Focus",
      message:
        "You haven't focused much today. Start a 25-minute session.",
      focusMode: "quick",
    };
  }

  // =========================================
  // TASKS REMAINING
  // =========================================

  if (pendingTasks > 0) {
    return {
      type: "task",
      title: "Finish Strong",
      message:
        `You have ${pendingTasks} task${
          pendingTasks > 1
            ? "s"
            : ""
        } remaining. Try completing them before adding new work.`,
      focusMode: "quick",
    };
  }

  // =========================================
  // GOAL INTELLIGENCE
  // =========================================

  if (priorityGoal) {
    // Almost complete

    if (
      priorityGoal.progress >= 80 &&
      priorityGoal.progress < 100
    ) {
      return {
        type: "goal",
        title: "Finish a Goal 🎯",
        message:
          `"${priorityGoal.title}" is ${priorityGoal.progress}% complete. You're close — give it one more focused push.`,
        focusMode: "quick",
      };
    }

    // General goal progress

    return {
      type: "goal",
      title: "Make Goal Progress",
      message:
        `Your ${
          priorityGoal.priority ||
          "medium"
        }-priority goal "${priorityGoal.title}" is at ${priorityGoal.progress}%. Spend some focused time moving it forward.`,
      focusMode: "quick",
    };
  }

  // =========================================
  // EMPTY PLANNER
  // =========================================

  if (plannerEvents === 0) {
    return {
      type: "planner",
      title: "Plan Your Day",
      message:
        "Your planner is empty. Add important events to stay organized.",
      focusMode: null,
    };
  }

  // =========================================
  // GREAT DAY
  // =========================================

  return {
    type: "success",
    title: "Excellent Work 🎉",
    message:
      "You're having a productive day. Keep your momentum going!",
    focusMode: null,
  };
}
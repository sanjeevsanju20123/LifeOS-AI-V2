// ==========================================
// ARES ACTION INTELLIGENCE
// Learns which ARES recommendations
// the user actually follows.
// ==========================================

import {
  getARESActionHistory,
  getARESActionStatsByType,
} from "./aresActionLearning";

// ==========================================
// MODE STATISTICS
// ==========================================

function getModeStats(actions) {
  const modes = {};

  actions.forEach((action) => {
    const mode = action.mode || "unknown";

    if (!modes[mode]) {
      modes[mode] = {
        total: 0,
        completed: 0,
        abandoned: 0,
        pending: 0,
        resolved: 0,
        successRate: 0,
      };
    }

    // ======================================
    // TOTAL RECOMMENDATIONS
    // ======================================

    modes[mode].total += 1;

    // ======================================
    // COMPLETED
    // ======================================

    if (action.status === "completed") {
      modes[mode].completed += 1;
    }

    // ======================================
    // ABANDONED
    // ======================================

    if (action.status === "abandoned") {
      modes[mode].abandoned += 1;
    }

    // ======================================
    // CURRENTLY ACTIVE / PENDING
    // ======================================

    if (action.status === "recommended") {
      modes[mode].pending += 1;
    }
  });

  // ========================================
  // CALCULATE RESOLVED SUCCESS RATE
  //
  // IMPORTANT:
  // Pending actions are NOT failures.
  //
  // completed + abandoned = resolved
  // ========================================

  Object.values(modes).forEach((mode) => {
    mode.resolved =
      mode.completed +
      mode.abandoned;

    mode.successRate =
      mode.resolved > 0
        ? Math.round(
            (mode.completed /
              mode.resolved) *
              100
          )
        : 0;
  });

  return modes;
}

// ==========================================
// BEST MODE
// ==========================================

function getBestMode(modeStats) {
  const entries =
    Object.entries(modeStats);

  if (entries.length === 0) {
    return null;
  }

  // ========================================
  // ONLY CONSIDER MODES WITH
  // RESOLVED ACTIONS
  // ========================================

  const resolvedModes =
    entries.filter(
      ([, stats]) =>
        stats.resolved > 0
    );

  if (
    resolvedModes.length === 0
  ) {
    return null;
  }

  // ========================================
  // SORT
  //
  // 1. Success rate
  // 2. Completed count
  // 3. Resolved evidence
  // ========================================

  resolvedModes.sort(
    (a, b) => {
      const successDifference =
        b[1].successRate -
        a[1].successRate;

      if (
        successDifference !== 0
      ) {
        return successDifference;
      }

      const completedDifference =
        b[1].completed -
        a[1].completed;

      if (
        completedDifference !== 0
      ) {
        return completedDifference;
      }

      return (
        b[1].resolved -
        a[1].resolved
      );
    }
  );

  return (
    resolvedModes[0]?.[0] ||
    null
  );
}

// ==========================================
// GET ACTION INTELLIGENCE
// ==========================================

export function getARESActionIntelligence() {
  const actions =
    getARESActionHistory();

  const stats =
    getARESActionStatsByType();

  const modeStats =
    getModeStats(actions);

  const bestMode =
    getBestMode(modeStats);

  // ========================================
  // OVERALL COUNTS
  // ========================================

  const total =
    actions.length;

  const completed =
    actions.filter(
      (action) =>
        action.status ===
        "completed"
    ).length;

  const abandoned =
    actions.filter(
      (action) =>
        action.status ===
        "abandoned"
    ).length;

  const pending =
    actions.filter(
      (action) =>
        action.status ===
        "recommended"
    ).length;

  // ========================================
  // ONLY RESOLVED ACTIONS COUNT
  // TOWARD SUCCESS RATE
  // ========================================

  const resolved =
    completed +
    abandoned;

  const successRate =
    resolved > 0
      ? Math.round(
          (completed /
            resolved) *
            100
        )
      : 0;

  return {
    total,

    completed,

    abandoned,

    pending,

    resolved,

    successRate,

    bestMode,

    modeStats,

    actionTypes:
      stats,
  };
}

// ==========================================
// GENERATE HUMAN-READABLE INSIGHT
// ==========================================

export function getARESActionLearningInsight() {
  const intelligence =
    getARESActionIntelligence();

  // ========================================
  // NO DATA
  // ========================================

  if (
    intelligence.total === 0
  ) {
    return {
      title:
        "ARES Is Learning 🧠",

      message:
        "ARES has not collected enough action history yet.",

      confidence:
        "none",
    };
  }

  // ========================================
  // NO RESOLVED ACTIONS
  // ========================================

  if (
    intelligence.resolved === 0
  ) {
    return {
      title:
        "ARES Is Learning 🧠",

      message:
        "ARES is waiting for your first recommendation to be completed or abandoned.",

      confidence:
        "early",
    };
  }

  // ========================================
  // NO BEST MODE YET
  // ========================================

  if (
    !intelligence.bestMode
  ) {
    return {
      title:
        "ARES Is Learning 🧠",

      message:
        "ARES is still learning which recommendations work best for you.",

      confidence:
        "emerging",
    };
  }

  // ========================================
  // BEST MODE
  // ========================================

  const bestMode =
    intelligence.bestMode;

  const mode =
    intelligence.modeStats[
      bestMode
    ];

  const modeLabel =
    bestMode === "quick"
      ? "25-minute Quick"
      : bestMode === "deep"
      ? "50-minute Deep"
      : bestMode === "flow"
      ? "90-minute Flow"
      : bestMode;

  // ========================================
  // CONFIDENCE
  // ========================================

  let confidence =
    "emerging";

  if (
    mode.resolved >= 10
  ) {
    confidence =
      "strong";
  } else if (
    mode.resolved >= 5
  ) {
    confidence =
      "strong";
  } else if (
    mode.resolved >= 3
  ) {
    confidence =
      "moderate";
  }

  // ========================================
  // HUMAN ARES MESSAGE
  // ========================================

  return {
    title:
      "ARES Learned Something 🧠",

    message:
      `You complete ${modeLabel} Focus recommendations ${mode.successRate}% of the time. ARES will prioritize this approach when appropriate.`,

    confidence,

    bestMode,

    successRate:
      mode.successRate,

    completed:
      mode.completed,

    abandoned:
      mode.abandoned,

    pending:
      mode.pending,

    resolved:
      mode.resolved,
  };
}

// ==========================================
// EXPORT
// ==========================================

export default getARESActionIntelligence;
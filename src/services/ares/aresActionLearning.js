// ==========================================
// ARES ACTION LEARNING
// Learns from the actions ARES recommends
// ==========================================

const STORAGE_KEY =
  "lifeos-ares-action-learning";

// ==========================================
// DEFAULT DATA
// ==========================================

function createDefaultData() {
  return {
    actions: [],
  };
}

// ==========================================
// LOAD DATA
// ==========================================

function loadData() {
  try {
    const saved =
      localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return createDefaultData();
    }

    const parsed =
      JSON.parse(saved);

    return {
      actions:
        Array.isArray(parsed.actions)
          ? parsed.actions
          : [],
    };
  } catch (error) {
    return createDefaultData();
  }
}

// ==========================================
// SAVE DATA
// ==========================================

function saveData(data) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify(data)
    );
  } catch (error) {
    // Ignore storage errors
  }
}

// ==========================================
// RECORD RECOMMENDED ACTION
// ==========================================

export function recordARESAction({
  type,
  mode = null,
  duration = null,
  source = "local-ares",
} = {}) {
  if (!type) {
    return null;
  }

  const data = loadData();

  const action = {
    id:
      `${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`,

    type,

    mode,

    duration,

    source,

    status: "recommended",

    recommendedAt:
      new Date().toISOString(),

    completedAt: null,
  };

  data.actions.push(action);

  saveData(data);

  return action;
}

// ==========================================
// RECORD ACTION COMPLETION
// ==========================================

export function completeARESAction(
  actionId
) {
  if (!actionId) {
    return null;
  }

  const data = loadData();

  const action =
    data.actions.find(
      (item) =>
        item.id === actionId
    );

  if (!action) {
    return null;
  }

  // Prevent changing an already
  // completed or abandoned action.
  if (
    action.status !== "recommended"
  ) {
    return action;
  }

  action.status = "completed";

  action.completedAt =
    new Date().toISOString();

  saveData(data);

  return action;
}

// ==========================================
// RECORD ACTION ABANDONMENT
// ==========================================

export function abandonARESAction(
  actionId
) {
  if (!actionId) {
    return null;
  }

  const data = loadData();

  const action =
    data.actions.find(
      (item) =>
        item.id === actionId
    );

  if (!action) {
    return null;
  }

  // Prevent changing an already
  // completed or abandoned action.
  if (
    action.status !== "recommended"
  ) {
    return action;
  }

  action.status = "abandoned";

  saveData(data);

  return action;
}

// ==========================================
// GET ACTION HISTORY
// ==========================================

export function getARESActionHistory() {
  const data = loadData();

  return data.actions;
}

// ==========================================
// GET ACTION STATISTICS
// ==========================================

export function getARESActionStats() {
  const actions =
    getARESActionHistory();

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

  // Only completed + abandoned actions
  // are real outcomes.
  const resolved =
    completed + abandoned;

  const successRate =
    resolved > 0
      ? Math.round(
          (completed / resolved) *
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
  };
}

// ==========================================
// GET ACTIONS BY TYPE
// ==========================================

export function getARESActionStatsByType() {
  const actions =
    getARESActionHistory();

  const stats = {};

  actions.forEach(
    (action) => {
      const type =
        action.type;

      if (!type) {
        return;
      }

      if (!stats[type]) {
        stats[type] = {
          total: 0,
          completed: 0,
          abandoned: 0,
          pending: 0,
          resolved: 0,
          successRate: 0,
          modes: {},
        };
      }

      // ====================================
      // TYPE TOTALS
      // ====================================

      stats[type].total += 1;

      if (
        action.status ===
        "completed"
      ) {
        stats[type].completed += 1;
      }

      if (
        action.status ===
        "abandoned"
      ) {
        stats[type].abandoned += 1;
      }

      if (
        action.status ===
        "recommended"
      ) {
        stats[type].pending += 1;
      }

      // ====================================
      // MODE LEARNING
      // ====================================

      if (!action.mode) {
        return;
      }

      const mode =
        action.mode;

      if (
        !stats[type].modes[mode]
      ) {
        stats[type].modes[mode] = {
          total: 0,
          completed: 0,
          abandoned: 0,
          pending: 0,
          resolved: 0,
          successRate: 0,
        };
      }

      const modeStats =
        stats[type].modes[mode];

      modeStats.total += 1;

      if (
        action.status ===
        "completed"
      ) {
        modeStats.completed += 1;
      }

      if (
        action.status ===
        "abandoned"
      ) {
        modeStats.abandoned += 1;
      }

      if (
        action.status ===
        "recommended"
      ) {
        modeStats.pending += 1;
      }
    }
  );

  // ========================================
  // CALCULATE SUCCESS RATES
  // ========================================

  Object.values(stats).forEach(
    (typeStats) => {
      typeStats.resolved =
        typeStats.completed +
        typeStats.abandoned;

      typeStats.successRate =
        typeStats.resolved > 0
          ? Math.round(
              (typeStats.completed /
                typeStats.resolved) *
                100
            )
          : 0;

      Object.values(
        typeStats.modes
      ).forEach(
        (modeStats) => {
          modeStats.resolved =
            modeStats.completed +
            modeStats.abandoned;

          modeStats.successRate =
            modeStats.resolved > 0
              ? Math.round(
                  (modeStats.completed /
                    modeStats.resolved) *
                    100
                )
              : 0;
        }
      );
    }
  );

  return stats;
}

// ==========================================
// GET BEST FOCUS MODE
// ==========================================
//
// ARES does NOT immediately trust a mode
// with only one successful attempt.
//
// Minimum evidence:
// - at least 3 resolved attempts
// - at least 70% success rate
//
// This prevents one lucky session from
// overriding stronger historical behavior.
// ==========================================

export function getARESBestFocusMode() {
  const stats =
    getARESActionStatsByType();

  const focusStats =
    stats["start-focus"];

  if (!focusStats) {
    return null;
  }

  const candidates = [];

  Object.entries(
    focusStats.modes || {}
  ).forEach(
    ([mode, data]) => {
      if (!data) {
        return;
      }

      const resolved =
        data.resolved || 0;

      if (
        resolved < 3
      ) {
        return;
      }

      if (
        data.successRate < 70
      ) {
        return;
      }

      candidates.push({
        mode,

        total:
          data.total,

        completed:
          data.completed,

        abandoned:
          data.abandoned,

        pending:
          data.pending,

        resolved,

        successRate:
          data.successRate,

        confidence:
          getModeConfidence(
            resolved,
            data.successRate
          ),
      });
    }
  );

  if (
    candidates.length === 0
  ) {
    return null;
  }

  // ========================================
  // SORT BEST MODE
  // ========================================

  candidates.sort(
    (a, b) => {
      // First: success rate
      if (
        b.successRate !==
        a.successRate
      ) {
        return (
          b.successRate -
          a.successRate
        );
      }

      // Second: completed count
      if (
        b.completed !==
        a.completed
      ) {
        return (
          b.completed -
          a.completed
        );
      }

      // Third: resolved evidence
      return (
        b.resolved -
        a.resolved
      );
    }
  );

  return candidates[0];
}

// ==========================================
// MODE CONFIDENCE
// ==========================================

function getModeConfidence(
  resolved,
  successRate
) {
  if (
    resolved >= 10 &&
    successRate >= 80
  ) {
    return "strong";
  }

  if (
    resolved >= 5 &&
    successRate >= 75
  ) {
    return "emerging";
  }

  return "early";
}

// ==========================================
// GET FOCUS MODE INTELLIGENCE
// ==========================================
//
// Useful for ARES debugging and UI.
// Returns every learned focus mode.
// ==========================================

export function getARESFocusModeIntelligence() {
  const stats =
    getARESActionStatsByType();

  const focusStats =
    stats["start-focus"];

  if (!focusStats) {
    return {
      total: 0,
      modes: {},
      bestMode: null,
    };
  }

  const modes =
    focusStats.modes || {};

  const bestMode =
    getARESBestFocusMode();

  return {
    total:
      focusStats.total || 0,

    completed:
      focusStats.completed || 0,

    abandoned:
      focusStats.abandoned || 0,

    pending:
      focusStats.pending || 0,

    resolved:
      focusStats.resolved || 0,

    successRate:
      focusStats.successRate || 0,

    modes,

    bestMode:
      bestMode?.mode || null,

    bestModeDetails:
      bestMode || null,
  };
}

// ==========================================
// CLEAR ACTION LEARNING
// ==========================================

export function clearARESActionLearning() {
  try {
    localStorage.removeItem(
      STORAGE_KEY
    );
  } catch (error) {
    // Ignore storage errors
  }
}
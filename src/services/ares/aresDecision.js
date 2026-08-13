// ==========================================
// ARES DECISION ENGINE
// Turns LifeOS context + ARES memory +
// action learning into a recommended next step.
// ==========================================

import {
  getRecommendation,
} from "../ai/recommendationEngine";

// ==========================================
// GET ARES DECISION
// ==========================================

export function getARESDecision(context) {
  if (!context) {
    return {
      type: "none",
      title: "ARES",
      message:
        "I don't have enough context yet.",
      action: null,
      focusMode: null,
    };
  }

  // ========================================
  // ACTION LEARNING
  // ========================================

  const actionLearning =
    context.actionLearning || {};

  const actionStats =
    actionLearning.stats || {
      total: 0,
      completed: 0,
      abandoned: 0,
      pending: 0,
      successRate: 0,
    };

  const actionStatsByType =
    actionLearning.byType || {};

  // ========================================
  // LEARNING INSIGHT
  // ========================================

  const learningInsight =
    buildActionLearningInsight(
      actionStats,
      actionStatsByType
    );

  // ========================================
  // BASE RECOMMENDATION
  // ========================================

  const recommendation =
    getRecommendation({
      productivityScore:
        calculateProductivityScore(
          context
        ),

      completedTasks:
        context.tasks?.completed || 0,

      pendingTasks:
        context.tasks?.pending || 0,

      plannerEvents:
        context.planner?.events?.length || 0,

      focusMinutes:
        context.focus?.totalMinutes || 0,

      activeGoals:
        context.goals?.items?.filter(
          (goal) =>
            !goal.completed
        ) || [],

      averageProgress:
        context.patterns?.goalBehavior
          ?.averageProgress || 0,

      learningInsight,
    });

  // ========================================
  // DEBUG: BASE ARES DECISION
  // ========================================

  console.log(
    "🧠 ARES DECISION DEBUG",
    {
      baseFocusMode:
        recommendation?.focusMode,

      baseRecommendation:
        recommendation,

      bestLearnedMode:
        findBestFocusAction(
          actionLearning?.byType
        ),

      actionStats:
        actionLearning?.stats,

      actionModes:
        actionLearning?.byType?.[
          "start-focus"
        ]?.modes,
    }
  );

  // ========================================
  // ADAPT RECOMMENDATION USING LEARNING
  // ========================================

  const adaptiveRecommendation =
    applyActionLearning(
      recommendation,
      actionLearning
    );

  // ========================================
  // DEBUG: ADAPTIVE RESULT
  // ========================================

  console.log(
    "🧠 ARES ADAPTIVE RESULT",
    {
      focusMode:
        adaptiveRecommendation?.focusMode,

      adaptive:
        adaptiveRecommendation?.adaptive,

      adaptiveMode:
        adaptiveRecommendation?.adaptiveMode,

      adaptiveReason:
        adaptiveRecommendation?.adaptiveReason,

      finalRecommendation:
        adaptiveRecommendation,
    }
  );

  // ========================================
  // BUILD ARES ACTION
  // ========================================

  const action =
    buildARESAction(
      adaptiveRecommendation
    );

  // ========================================
  // FINAL ARES DECISION
  // ========================================

  return {
    ...adaptiveRecommendation,

    action,

    learning:
      learningInsight,

    source:
      "local-ares",

    generatedAt:
      new Date().toISOString(),
  };
}

// ==========================================
// APPLY ACTION LEARNING
// ARES uses previous behavior to improve
// future focus recommendations.
// ==========================================

function applyActionLearning(
  recommendation,
  actionLearning
) {
  if (!recommendation) {
    return recommendation;
  }

  const stats =
    actionLearning?.stats || {};

  const byType =
    actionLearning?.byType || {};

  const total =
    stats.total || 0;

  // ========================================
  // NOT ENOUGH DATA
  // ========================================

  if (total < 3) {
    return recommendation;
  }

  // ========================================
  // FIND BEST FOCUS ACTION
  // ========================================

  const bestFocus =
    findBestFocusAction(
      byType
    );

  if (!bestFocus) {
    return recommendation;
  }

  // ========================================
  // REQUIRE MEANINGFUL CONFIDENCE
  // ========================================

  if (
    bestFocus.resolved < 3 ||
    bestFocus.successRate < 70 ||
    !bestFocus.mode
  ) {
    return recommendation;
  }

  // ========================================
  // ONLY ADAPT FOCUS RECOMMENDATIONS
  // ========================================

  if (
    recommendation.focusMode !==
      "quick" &&
    recommendation.focusMode !==
      "deep" &&
    recommendation.focusMode !==
      "flow"
  ) {
    return recommendation;
  }

  // ========================================
  // ALREADY USING BEST LEARNED MODE
  // ========================================

  if (
    recommendation.focusMode ===
    bestFocus.mode
  ) {
    return {
      ...recommendation,

      adaptive: true,

      adaptiveMode:
        bestFocus.mode,

      adaptiveReason:
        `ARES kept ${formatFocusMode(
          bestFocus.mode
        )} because you complete this approach ${bestFocus.successRate}% of the time.`,
    };
  }

  // ========================================
  // ADAPT RECOMMENDATION
  // ========================================

  return {
    ...recommendation,

    focusMode:
      bestFocus.mode,

    adaptive: true,

    adaptiveMode:
      bestFocus.mode,

    adaptiveReason:
      `ARES adapted this recommendation to ${formatFocusMode(
        bestFocus.mode
      )} because you complete this approach ${bestFocus.successRate}% of the time.`,

    title:
      recommendation.title ||
      "ARES Adaptive Focus",

    message:
      `${recommendation.message} ARES is adapting this session based on your past behavior.`,
  };
}

// ==========================================
// FIND BEST FOCUS ACTION
// ==========================================

function findBestFocusAction(
  statsByType
) {
  const candidates = [];

  const startFocus =
    statsByType?.[
      "start-focus"
    ];

  if (!startFocus) {
    return null;
  }

  // ========================================
  // MODE-SPECIFIC LEARNING
  // ========================================

  if (
    startFocus.modes &&
    typeof startFocus.modes ===
      "object"
  ) {
    Object.entries(
      startFocus.modes
    ).forEach(
      ([mode, modeData]) => {
        const completed =
          modeData?.completed || 0;

        const abandoned =
          modeData?.abandoned || 0;

        const pending =
          modeData?.pending || 0;

        // Only completed + abandoned
        // are real outcomes.
        const resolved =
          completed + abandoned;

        if (
          resolved === 0
        ) {
          return;
        }

        const successRate =
          Math.round(
            (completed /
              resolved) *
              100
          );

        candidates.push({
          mode,

          total:
            modeData?.total || 0,

          completed,

          abandoned,

          pending,

          resolved,

          successRate,
        });
      }
    );
  }

  // ========================================
  // NO VALID CANDIDATES
  // ========================================

  if (
    candidates.length === 0
  ) {
    return null;
  }

  // ========================================
  // SORT BEST MODE
  //
  // 1. Success rate
  // 2. Completed actions
  // 3. Resolved evidence
  // ========================================

  candidates.sort(
    (a, b) => {
      if (
        b.successRate !==
        a.successRate
      ) {
        return (
          b.successRate -
          a.successRate
        );
      }

      if (
        b.completed !==
        a.completed
      ) {
        return (
          b.completed -
          a.completed
        );
      }

      return (
        b.resolved -
        a.resolved
      );
    }
  );

  return (
    candidates[0] ||
    null
  );
}

// ==========================================
// FORMAT FOCUS MODE
// ==========================================

function formatFocusMode(
  mode
) {
  if (
    mode === "quick"
  ) {
    return "25-minute Quick Focus";
  }

  if (
    mode === "deep"
  ) {
    return "50-minute Deep Focus";
  }

  if (
    mode === "flow"
  ) {
    return "90-minute Flow Focus";
  }

  return "this focus approach";
}

// ==========================================
// BUILD ACTION LEARNING INSIGHT
// ==========================================

function buildActionLearningInsight(
  stats,
  statsByType
) {
  const total =
    stats?.total || 0;

  const completed =
    stats?.completed || 0;

  const abandoned =
    stats?.abandoned || 0;

  const successRate =
    stats?.successRate || 0;

  // ========================================
  // NO LEARNING YET
  // ========================================

  if (
    total === 0
  ) {
    return null;
  }

  // ========================================
  // FIND BEST ACTION TYPE
  // ========================================

  let bestType =
    null;

  let bestSuccessRate =
    -1;

  let bestCompleted =
    0;

  Object.entries(
    statsByType || {}
  ).forEach(
    ([type, data]) => {
      const completed =
        data?.completed || 0;

      const abandoned =
        data?.abandoned || 0;

      const resolved =
        completed + abandoned;

      if (
        resolved === 0
      ) {
        return;
      }

      const typeSuccessRate =
        Math.round(
          (completed /
            resolved) *
            100
        );

      if (
        typeSuccessRate >
          bestSuccessRate ||
        (
          typeSuccessRate ===
            bestSuccessRate &&
          completed >
            bestCompleted
        )
      ) {
        bestType =
          type;

        bestSuccessRate =
          typeSuccessRate;

        bestCompleted =
          completed;
      }
    }
  );

  // ========================================
  // STRONG LEARNING
  // ========================================

  if (
    total >= 5 &&
    successRate >= 80
  ) {
    return {
      type:
        "action-learning",

      message:
        `ARES has learned that you usually follow through with its recommendations. Your current action success rate is ${successRate}%.`,

      successRate,

      totalActions:
        total,

      completedActions:
        completed,

      abandonedActions:
        abandoned,

      bestActionType:
        bestType,

      bestActionSuccessRate:
        bestSuccessRate >= 0
          ? bestSuccessRate
          : null,

      confidence:
        total >= 10
          ? "strong"
          : "emerging",
    };
  }

  // ========================================
  // MODERATE LEARNING
  // ========================================

  if (
    total >= 3
  ) {
    return {
      type:
        "action-learning",

      message:
        `ARES is learning from your actions. You have completed ${completed} of ${total} recommendations.`,

      successRate,

      totalActions:
        total,

      completedActions:
        completed,

      abandonedActions:
        abandoned,

      bestActionType:
        bestType,

      bestActionSuccessRate:
        bestSuccessRate >= 0
          ? bestSuccessRate
          : null,

      confidence:
        total >= 5
          ? "emerging"
          : "early",
    };
  }

  // ========================================
  // EARLY LEARNING
  // ========================================

  return {
    type:
      "action-learning",

    message:
      `ARES has started learning from your actions. ${completed} recommendation${
        completed === 1
          ? ""
          : "s"
      } completed so far.`,

    successRate,

    totalActions:
      total,

    completedActions:
      completed,

    abandonedActions:
      abandoned,

    bestActionType:
      bestType,

    bestActionSuccessRate:
      bestSuccessRate >= 0
        ? bestSuccessRate
        : null,

    confidence:
      "early",
  };
}

// ==========================================
// BUILD ARES ACTION
// ==========================================

function buildARESAction(
  recommendation
) {
  if (!recommendation) {
    return null;
  }

  // ========================================
  // QUICK
  // ========================================

  if (
    recommendation.focusMode ===
    "quick"
  ) {
    return {
      type:
        "start-focus",

      mode:
        "quick",

      duration:
        25,
    };
  }

  // ========================================
  // DEEP
  // ========================================

  if (
    recommendation.focusMode ===
    "deep"
  ) {
    return {
      type:
        "start-focus",

      mode:
        "deep",

      duration:
        50,
    };
  }

  // ========================================
  // FLOW
  // ========================================

  if (
    recommendation.focusMode ===
    "flow"
  ) {
    return {
      type:
        "start-focus",

      mode:
        "flow",

      duration:
        90,
    };
  }

  // ========================================
  // NO ACTION
  // ========================================

  return null;
}

// ==========================================
// PRODUCTIVITY SCORE
// ==========================================

function calculateProductivityScore(
  context
) {
  const tasks =
    context.tasks || {};

  const total =
    tasks.total || 0;

  const completed =
    tasks.completed || 0;

  if (
    total === 0
  ) {
    return 0;
  }

  return Math.min(
    100,
    Math.round(
      (completed /
        total) *
        100
    )
  );
}

// ==========================================
// EXPORT
// ==========================================

export default getARESDecision;
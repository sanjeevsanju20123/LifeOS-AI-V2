import { getLearningData } from "./ai/learningEngine";

// ==========================================
// HELPERS
// ==========================================

function getTimePeriod(hour) {
  if (hour >= 5 && hour < 12) {
    return "morning";
  }

  if (hour >= 12 && hour < 18) {
    return "afternoon";
  }

  if (hour >= 18 && hour < 24) {
    return "evening";
  }

  return "night";
}

// ==========================================
// PATTERN CONFIDENCE
// ==========================================

function getPatternConfidence(sampleSize) {
  if (sampleSize <= 0) {
    return {
      level: "none",
      score: 0,
    };
  }

  if (sampleSize < 3) {
    return {
      level: "emerging",
      score: 25,
    };
  }

  if (sampleSize < 6) {
    return {
      level: "moderate",
      score: 50,
    };
  }

  if (sampleSize < 10) {
    return {
      level: "strong",
      score: 75,
    };
  }

  return {
    level: "high",
    score: 100,
  };
}

// ==========================================
// FOCUS TIME PATTERN
// ==========================================

export function analyzeFocusTime(data) {
  const sessions = data?.focusSessions || [];

  if (sessions.length === 0) {
    return {
      period: null,
      bestHour: null,
      sessions: 0,
      confidence: getPatternConfidence(0),
    };
  }

  const hourCounts = {};

  sessions.forEach((session) => {
    const hour = Number(session.hour);

    if (!Number.isFinite(hour)) return;

    hourCounts[hour] =
      (hourCounts[hour] || 0) + 1;
  });

  const best = Object.entries(hourCounts).sort(
    (a, b) => b[1] - a[1]
  )[0];

  if (!best) {
    return {
      period: null,
      bestHour: null,
      sessions: 0,
      confidence: getPatternConfidence(0),
    };
  }

  const bestHour = Number(best[0]);

  const confidence =
    getPatternConfidence(sessions.length);

  return {
    period: getTimePeriod(bestHour),
    bestHour,
    sessions: best[1],
    confidence,
  };
}

// ==========================================
// FOCUS STYLE
// ==========================================

export function analyzeFocusStyle(data) {
  const sessions = data?.focusSessions || [];

  if (sessions.length === 0) {
    return {
      style: null,
      averageMinutes: 0,
      shortSessions: 0,
      deepSessions: 0,
      confidence: getPatternConfidence(0),
    };
  }

  let totalMinutes = 0;
  let shortSessions = 0;
  let deepSessions = 0;

  sessions.forEach((session) => {
    const minutes = Number(session.minutes);

    if (!Number.isFinite(minutes)) return;

    totalMinutes += minutes;

    if (minutes < 40) {
      shortSessions += 1;
    } else {
      deepSessions += 1;
    }
  });

  const averageMinutes =
    totalMinutes / sessions.length;

  let style = "balanced";

  if (deepSessions > shortSessions) {
    style = "deep";
  } else if (shortSessions > deepSessions) {
    style = "short";
  }

  const confidence =
    getPatternConfidence(sessions.length);

  return {
    style,
    averageMinutes: Math.round(
      averageMinutes
    ),
    shortSessions,
    deepSessions,
    confidence,
  };
}

// ==========================================
// TASK BEHAVIOR
// ==========================================

export function analyzeTaskBehavior(data) {
  const tasks = data?.taskCompletions || [];

  if (tasks.length === 0) {
    return {
      strongestPriority: null,
      priorities: {},
      confidence: getPatternConfidence(0),
    };
  }

  const priorities = {};

  tasks.forEach((task) => {
    const priority =
      task.priority || "medium";

    priorities[priority] =
      (priorities[priority] || 0) + 1;
  });

  const strongest =
    Object.entries(priorities).sort(
      (a, b) => b[1] - a[1]
    )[0];

  const confidence =
    getPatternConfidence(tasks.length);

  return {
    strongestPriority:
      strongest?.[0] || null,

    priorities,

    confidence,
  };
}

// ==========================================
// GOAL BEHAVIOR
// ==========================================

export function analyzeGoalBehavior(data) {
  const updates = data?.goalUpdates || [];

  const completions =
    data?.goalCompletions || [];

  if (
    updates.length === 0 &&
    completions.length === 0
  ) {
    return {
      strongestGoal: null,
      averageProgress: 0,
      completedGoals: 0,
      confidence: getPatternConfidence(0),
    };
  }

  const goalProgress = {};

  updates.forEach((goal) => {
    if (!goal.title) return;

    goalProgress[goal.title] =
      Number(goal.progress) || 0;
  });

  let strongestGoal = null;
  let strongestProgress = -1;

  Object.entries(goalProgress).forEach(
    ([title, progress]) => {
      if (progress > strongestProgress) {
        strongestProgress = progress;
        strongestGoal = title;
      }
    }
  );

  const sampleSize =
    updates.length +
    completions.length;

  const confidence =
    getPatternConfidence(sampleSize);

  return {
    strongestGoal,

    averageProgress:
      Object.values(goalProgress).length > 0
        ? Math.round(
            Object.values(
              goalProgress
            ).reduce(
              (sum, value) =>
                sum + value,
              0
            ) /
              Object.values(
                goalProgress
              ).length
          )
        : 0,

    completedGoals:
      completions.length,

    confidence,
  };
}

// ==========================================
// PROGRESS TREND
// ==========================================

export function analyzeProgressTrend(data) {
  const updates = data?.goalUpdates || [];

  if (updates.length < 2) {
    return {
      trend: "insufficient-data",
      change: 0,
      confidence: getPatternConfidence(
        updates.length
      ),
    };
  }

  const values = updates
    .map((goal) =>
      Number(goal.progress)
    )
    .filter((value) =>
      Number.isFinite(value)
    );

  if (values.length < 2) {
    return {
      trend: "insufficient-data",
      change: 0,
      confidence: getPatternConfidence(
        values.length
      ),
    };
  }

  const midpoint =
    Math.floor(values.length / 2);

  const firstHalf =
    values.slice(0, midpoint);

  const secondHalf =
    values.slice(midpoint);

  const firstAverage =
    firstHalf.reduce(
      (sum, value) =>
        sum + value,
      0
    ) /
    firstHalf.length;

  const secondAverage =
    secondHalf.reduce(
      (sum, value) =>
        sum + value,
      0
    ) /
    secondHalf.length;

  const change =
    secondAverage -
    firstAverage;

  let trend = "stable";

  if (change > 5) {
    trend = "improving";
  } else if (change < -5) {
    trend = "slowing";
  }

  const confidence =
    getPatternConfidence(
      values.length
    );

  return {
    trend,
    change: Math.round(change),
    confidence,
  };
}

// ==========================================
// COMPLETE ARES PATTERN ANALYSIS
// ==========================================

export function analyzeARESPatterns() {
  const data =
    getLearningData();

  return {
    focusTime:
      analyzeFocusTime(data),

    focusStyle:
      analyzeFocusStyle(data),

    taskBehavior:
      analyzeTaskBehavior(data),

    goalBehavior:
      analyzeGoalBehavior(data),

    progressTrend:
      analyzeProgressTrend(data),

    generatedAt:
      new Date().toISOString(),
  };
}

// ==========================================
// HUMAN-READABLE ARES INSIGHTS
// ==========================================

export function generateARESPatternMessages(
  patterns
) {
  if (!patterns) return [];

  const messages = [];

  const {
    focusTime,
    focusStyle,
    taskBehavior,
    goalBehavior,
    progressTrend,
  } = patterns;

  // ========================================
  // FOCUS TIME
  // ========================================

  if (focusTime?.period) {
    messages.push(
      `You tend to complete focus sessions most often in the ${focusTime.period}.`
    );
  }

  // ========================================
  // FOCUS STYLE
  // ========================================

  if (
    focusStyle?.style === "deep"
  ) {
    messages.push(
      `You appear to perform well with longer, deeper focus sessions. Your average session is ${focusStyle.averageMinutes} minutes.`
    );
  }

  if (
    focusStyle?.style === "short"
  ) {
    messages.push(
      `You appear to work well with shorter focus sessions. Your average session is ${focusStyle.averageMinutes} minutes.`
    );
  }

  // ========================================
  // TASK BEHAVIOR
  // ========================================

  if (
    taskBehavior?.strongestPriority
  ) {
    messages.push(
      `You most frequently complete ${taskBehavior.strongestPriority}-priority tasks.`
    );
  }

  // ========================================
  // GOAL BEHAVIOR
  // ========================================

  if (
    goalBehavior?.strongestGoal
  ) {
    messages.push(
      `Your strongest tracked goal is "${goalBehavior.strongestGoal}".`
    );
  }

  // ========================================
  // PROGRESS TREND
  // ========================================

  if (
    progressTrend?.trend ===
    "improving"
  ) {
    messages.push(
      "Your recent goal progress is trending upward. Keep the momentum going."
    );
  }

  if (
    progressTrend?.trend ===
    "slowing"
  ) {
    messages.push(
      "Your recent goal progress is slowing down. A focused session could help restore momentum."
    );
  }

  return messages;
}

// ==========================================
// GET ARES PATTERN REPORT
// ==========================================

export function getARESPatternReport() {
  const patterns =
    analyzeARESPatterns();

  const messages =
    generateARESPatternMessages(
      patterns
    );

  return {
    patterns,
    messages,
  };
}
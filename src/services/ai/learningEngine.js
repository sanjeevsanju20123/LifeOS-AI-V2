const LEARNING_STORAGE_KEY = "lifeos-ares-learning";

function createDefaultLearningData() {
  return {
    focusSessions: [],
    taskCompletions: [],
    goalUpdates: [],
    goalCompletions: [],
  };
}

function loadLearningData() {
  try {
    const saved = localStorage.getItem(LEARNING_STORAGE_KEY);

    if (!saved) {
      return createDefaultLearningData();
    }

    const data = JSON.parse(saved);

    return {
      ...createDefaultLearningData(),
      ...data,
      focusSessions: data.focusSessions || [],
      taskCompletions: data.taskCompletions || [],
      goalUpdates: data.goalUpdates || [],
      goalCompletions: data.goalCompletions || [],
    };
  } catch {
    return createDefaultLearningData();
  }
}

function saveLearningData(data) {
  try {
    localStorage.setItem(
      LEARNING_STORAGE_KEY,
      JSON.stringify(data)
    );

    window.dispatchEvent(
      new Event("ares-learning-updated")
    );
  } catch {
    // Ignore storage errors
  }
}
export function recordFocusSession({
  minutes,
  date = new Date(),
}) {
  const data = loadLearningData();

  data.focusSessions.push({
    minutes,
    hour: date.getHours(),
    day: date.getDay(),
    timestamp: date.toISOString(),
  });

  data.focusSessions =
    data.focusSessions.slice(-100);

  saveLearningData(data);
}


export function recordTaskCompletion({
  title = "",
  category = "",
  priority = "medium",
  date = new Date(),
}) {
  const data = loadLearningData();

  data.taskCompletions.push({
    title,
    category,
    priority,
    hour: date.getHours(),
    day: date.getDay(),
    timestamp: date.toISOString(),
  });

  data.taskCompletions =
    data.taskCompletions.slice(-100);

  saveLearningData(data);
}


export function recordGoalProgress({
  title,
  priority = "medium",
  previousProgress = 0,
  progress = 0,
  completed = false,
  date = new Date(),
}) {
  const data = loadLearningData();

  data.goalUpdates.push({
    title,
    priority,
    previousProgress,
    progress,
    completed,
    timestamp: date.toISOString(),
  });

  data.goalUpdates =
    data.goalUpdates.slice(-100);

  saveLearningData(data);
}


export function recordGoalCompletion({
  title,
  priority = "medium",
  date = new Date(),
}) {
  const data = loadLearningData();

  data.goalCompletions.push({
    title,
    priority,
    timestamp: date.toISOString(),
  });

  data.goalCompletions =
    data.goalCompletions.slice(-100);

  saveLearningData(data);
}


export function recordGoalUpdate({
  title,
  progress,
  priority = "medium",
  date = new Date(),
}) {
  return recordGoalProgress({
    title,
    priority,
    previousProgress: 0,
    progress,
    completed: progress >= 100,
    date,
  });
}


export function getLearningData() {
  return loadLearningData();
}

export function analyzePatterns() {
  const data = loadLearningData();

  const insights = [];

  if (data.focusSessions.length >= 3) {
    const hourCounts = {};

    data.focusSessions.forEach((session) => {
      hourCounts[session.hour] =
        (hourCounts[session.hour] || 0) + 1;
    });

    const bestHour =
      Object.entries(hourCounts).sort(
        (a, b) => b[1] - a[1]
      )[0];

    if (bestHour) {
      const hour = Number(bestHour[0]);

      const displayHour =
        hour === 0
          ? 12
          : hour > 12
          ? hour - 12
          : hour;

      const period =
        hour >= 12 ? "PM" : "AM";

      insights.push({
        type: "focus-time",
        title: "Your Focus Pattern ⏰",
        message:
          `You frequently start focus sessions around ${displayHour} ${period}. This may be one of your strongest focus periods.`,
      });
    }
  }


  if (data.focusSessions.length >= 3) {
    const averageFocus =
      data.focusSessions.reduce(
        (sum, session) =>
          sum + session.minutes,
        0
      ) / data.focusSessions.length;

    if (averageFocus >= 45) {
      insights.push({
        type: "deep-focus",
        title: "Deep Focus Detected 🧠",
        message:
          `Your average focus session is ${Math.round(
            averageFocus
          )} minutes. You appear comfortable with longer focus sessions.`,
      });
    } else if (averageFocus <= 25) {
      insights.push({
        type: "quick-focus",
        title: "Short Focus Works For You ⚡",
        message:
          `Your average focus session is around ${Math.round(
            averageFocus
          )} minutes. Short focused sessions may work well for you.`,
      });
    }
  }


  if (data.taskCompletions.length >= 3) {
    const priorityCounts = {};

    data.taskCompletions.forEach((task) => {
      const priority =
        task.priority || "medium";

      priorityCounts[priority] =
        (priorityCounts[priority] || 0) + 1;
    });

    const strongestPriority =
      Object.entries(priorityCounts).sort(
        (a, b) => b[1] - a[1]
      )[0];

    if (strongestPriority) {
      insights.push({
        type: "task-pattern",
        title: "Task Completion Pattern 🎯",
        message:
          `You most frequently complete ${strongestPriority[0]}-priority tasks. ARES can use this pattern when planning your next action.`,
      });
    }
  }

    // =========================================
    // GOAL PATTERN
    // =========================================

if (data.goalUpdates.length >= 2) {
  const highPriorityUpdates =
    data.goalUpdates.filter(
      (goal) =>
        goal.priority === "high" &&
        !goal.completed
    );

  if (highPriorityUpdates.length > 0) {
    const latest =
      highPriorityUpdates[
        highPriorityUpdates.length - 1
      ];

    insights.push({
      type: "goal",
      title: "Priority Goal Pattern 🎯",
      message:
        `"${latest.title}" is marked as a high-priority goal. ARES will keep this goal in focus when suggesting your next action.`,
    });
  }
}


  if (data.goalCompletions.length > 0) {
    const latest =
      data.goalCompletions[
        data.goalCompletions.length - 1
      ];

    insights.push({
      type: "goal-completion",
      title: "Goal Completed 🏆",
      message:
        `You recently completed "${latest.title}". ARES has recorded this achievement and can use it to understand your progress.`,
    });
  }


  if (insights.length === 0) {
    insights.push({
      type: "learning",
      title: "ARES Is Learning 🧠",
      message:
        "Keep using LifeOS. ARES needs a little more activity before it can identify your personal productivity patterns.",
    });
  }

  return insights;
}


export function getBestInsight() {
  const data = loadLearningData();

  // =========================================
  // RECENT GOAL COMPLETION
  // =========================================

  if (data.goalCompletions.length > 0) {
    const latest =
      data.goalCompletions[
        data.goalCompletions.length - 1
      ];

    return {
      type: "goal-completion",
      title: "Goal Completed 🏆",
      message:
        `You recently completed "${latest.title}". ARES has recorded this achievement and can use it to understand your progress.`,
    };
  }

  // =========================================
  // RECENT HIGH-PRIORITY GOAL
  // =========================================

  const highPriorityGoals =
    data.goalUpdates.filter(
      (goal) =>
        goal.priority === "high" &&
        !goal.completed
    );

  if (highPriorityGoals.length > 0) {
    const latest =
      highPriorityGoals[
        highPriorityGoals.length - 1
      ];

    return {
      type: "goal",
      title: "Priority Goal Pattern 🎯",
      message:
        `"${latest.title}" is marked as a high-priority goal. ARES will keep this goal in focus when suggesting your next action.`,
    };
  }

  // =========================================
  // OTHER LEARNING PATTERNS
  // =========================================

  const insights = analyzePatterns();

  return (
    insights[0] || {
      type: "learning",
      title: "ARES Is Learning 🧠",
      message:
        "Keep using LifeOS. ARES is learning your productivity patterns.",
    }
  );
}
export function getDailyBrief({
  completedTasks,
  pendingTasks,
  plannerEvents,
  focusMinutes,
  productivityScore,
  activeGoals = [],
}) {
  const hour = new Date().getHours();

  const greeting =
    hour < 12
      ? "Good Morning"
      : hour < 18
      ? "Good Afternoon"
      : "Good Evening";


  // =========================================
  // PRODUCTIVITY SUMMARY
  // =========================================

  let summary = "";

  if (productivityScore >= 80) {
    summary =
      "You're having a highly productive day. Keep your momentum going.";
  } else if (productivityScore >= 60) {
    summary =
      "You're making steady progress. Focus on completing your remaining work.";
  } else {
    summary =
      "Let's build some momentum. Completing one important task is a great place to start.";
  }


  // =========================================
  // GOAL INTELLIGENCE
  // =========================================

  const completedGoals = activeGoals.filter(
    (goal) => goal.completed || goal.progress >= 100
  );

  const remainingGoals = activeGoals.filter(
    (goal) => !goal.completed && goal.progress < 100
  );

  const highPriorityGoals = remainingGoals.filter(
    (goal) =>
      (goal.priority || "medium") === "high"
  );


  // =========================================
  // GOAL SUMMARY
  // =========================================

  let goalSummary = "";

  if (remainingGoals.length === 0 && activeGoals.length > 0) {
    goalSummary =
      "All your goals are complete. Excellent work!";
  } else if (highPriorityGoals.length > 0) {
    const goal = highPriorityGoals[0];

    goalSummary =
      `Your high-priority goal "${goal.title}" is at ${goal.progress}% progress.`;
  } else if (remainingGoals.length > 0) {
    const goal = [...remainingGoals].sort(
      (a, b) => a.progress - b.progress
    )[0];

    goalSummary =
      `Your next goal to focus on is "${goal.title}" at ${goal.progress}% progress.`;
  }


  // =========================================
  // COMBINED OVERVIEW
  // =========================================

  const overview =
    goalSummary
      ? `${summary} ${goalSummary}`
      : summary;


  return {
    greeting,

    headline:
      `${completedTasks} completed • ${pendingTasks} remaining`,

    overview,

    stats: [
      {
        label: "Tasks",
        value:
          `${completedTasks}/${completedTasks + pendingTasks}`,
      },

      {
        label: "Planner",
        value: plannerEvents,
      },

      {
        label: "Focus",
        value:
          `${focusMinutes} min`,
      },

      {
        label: "Goals",
        value:
          `${completedGoals.length}/${activeGoals.length}`,
      },
    ],
  };
}
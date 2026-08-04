export function getDailyBrief({
  completedTasks,
  pendingTasks,
  plannerEvents,
  focusMinutes,
  productivityScore,
}) {
  const greeting =
    new Date().getHours() < 12
      ? "Good Morning"
      : new Date().getHours() < 18
      ? "Good Afternoon"
      : "Good Evening";

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

  return {
    greeting,
    headline: `${completedTasks} completed • ${pendingTasks} remaining`,
    overview: summary,
    stats: [
      {
        label: "Tasks",
        value: `${completedTasks}/${completedTasks + pendingTasks}`,
      },
      {
        label: "Planner",
        value: plannerEvents,
      },
      {
        label: "Focus",
        value: `${focusMinutes} min`,
      },
    ],
  };
}
export function getRecommendation({
  productivityScore,
  completedTasks,
  pendingTasks,
  plannerEvents,
  focusMinutes,
}) {
  // Low productivity
  if (productivityScore < 50) {
    return {
      type: "warning",
      title: "Boost Your Productivity",
      message:
        "Complete a high-priority task and start a 25-minute focus session.",
    };
  }

  // No focus today
  if (focusMinutes < 25) {
    return {
      type: "focus",
      title: "Time to Focus",
      message:
        "You haven't focused much today. Start a 25-minute session.",
    };
  }

  // Tasks remaining
  if (pendingTasks > 0) {
    return {
      type: "task",
      title: "Finish Strong",
      message:
        `You have ${pendingTasks} task${pendingTasks > 1 ? "s" : ""} remaining. Try completing them before adding new work.`,
    };
  }

  // Empty planner
  if (plannerEvents === 0) {
    return {
      type: "planner",
      title: "Plan Your Day",
      message:
        "Your planner is empty. Add important events to stay organized.",
    };
  }

  // Great day
  return {
    type: "success",
    title: "Excellent Work 🎉",
    message:
      "You're having a productive day. Keep your momentum going!",
  };
}
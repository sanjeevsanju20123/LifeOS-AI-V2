export function calculateProductivity({
  tasks = [],
  plannerEvents = [],
  focusStats = {},
}) {
  const totalTasks = tasks.length;

  const completedTasks = tasks.filter(
    (task) => task.done
  ).length;

  const pendingTasks = totalTasks - completedTasks;

  const completionRate =
    totalTasks === 0
      ? 100
      : Math.round((completedTasks / totalTasks) * 100);

  const focusMinutes =
    focusStats.totalMinutes || 0;

  const focusScore = Math.min(
    100,
    Math.round((focusMinutes / 180) * 100)
  );

  const plannerScore = Math.min(
    100,
    plannerEvents.length * 20
  );

  const productivityScore = Math.round(
    completionRate * 0.5 +
      focusScore * 0.3 +
      plannerScore * 0.2
  );

  return {
    productivityScore,
    completedTasks,
    pendingTasks,
    totalTasks,
    plannerEvents: plannerEvents.length,
    focusMinutes,
    streak: focusStats.streak || 0,
  };
}
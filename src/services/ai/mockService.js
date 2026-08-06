// src/services/ai/mockService.js
export default {
  summarize({ tasks = [], weeklyHistory = [] } = {}) {
    // simple deterministic heuristics for mock responses
    const totalTasks = tasks.length;
    const pending = tasks.filter((t) => !t.completed);
    const highPriority = tasks.filter((t) => t.priority === 'High' || t.priority === 'high');

    // compute recent focus trend (last 7 days minutes sum and avg)
    const minutes = weeklyHistory.map((d) => d.minutes || 0);
    const totalMinutes = minutes.reduce((a,b) => a+b, 0);
    const avg = Math.round((totalMinutes / Math.max(minutes.length,1)) || 0);

    const summary = `In the past ${minutes.length} days you focused a total of ${totalMinutes} minutes (avg ${avg}m/day). You have ${pending.length} pending tasks.`;

    const actions = [];
    if (pending.length > 0) actions.push('Pick the top 1 high-priority task and start a focused session (25/50/90 mins).');
    if (avg < 30) actions.push('Aim for at least 30 minutes/day for the next 3 days to build momentum.');
    if (highPriority.length === 0) actions.push('No high-priority tasks found — consider setting one to guide today.');

    const priorities = highPriority.slice(0,3).map((t) => ({ id: t.id, title: t.title, due: t.due }));
    // fallback to upcoming pending tasks
    if (priorities.length === 0) {
      priorities.push(...pending.slice(0,3).map((t) => ({ id: t.id, title: t.title, due: t.due })));
    }

    return { summary, actions, priorities };
  }
};

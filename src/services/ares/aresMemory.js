// ==========================================
// ARES MEMORY
// Interface to ARES learning history
// ==========================================

import {
  getLearningData,
} from "../ai/learningEngine";

// ==========================================
// GET ALL ARES MEMORY
// ==========================================

export function getARESMemory() {
  const data = getLearningData();

  return {
    focusSessions:
      data.focusSessions || [],

    taskCompletions:
      data.taskCompletions || [],

    goalUpdates:
      data.goalUpdates || [],

    goalCompletions:
      data.goalCompletions || [],
  };
}

// ==========================================
// GET RECENT MEMORY
// ==========================================

export function getRecentARESMemory(
  limit = 10
) {
  const memory = getARESMemory();

  return {
    focusSessions:
      memory.focusSessions.slice(-limit),

    taskCompletions:
      memory.taskCompletions.slice(-limit),

    goalUpdates:
      memory.goalUpdates.slice(-limit),

    goalCompletions:
      memory.goalCompletions.slice(-limit),
  };
}

// ==========================================
// MEMORY SUMMARY
// ==========================================

export function getARESMemorySummary() {
  const memory = getARESMemory();

  return {
    totalFocusSessions:
      memory.focusSessions.length,

    totalTaskCompletions:
      memory.taskCompletions.length,

    totalGoalUpdates:
      memory.goalUpdates.length,

    totalGoalCompletions:
      memory.goalCompletions.length,

    lastFocusSession:
      memory.focusSessions.at(-1) || null,

    lastTaskCompletion:
      memory.taskCompletions.at(-1) || null,

    lastGoalUpdate:
      memory.goalUpdates.at(-1) || null,

    lastGoalCompletion:
      memory.goalCompletions.at(-1) || null,
  };
}

export default getARESMemory;
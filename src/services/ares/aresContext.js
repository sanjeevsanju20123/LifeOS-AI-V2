// ==========================================
// ARES CONTEXT
// Central source of current LifeOS information
// ==========================================

import { getLearningData } from "../ai/learningEngine";

import {
  analyzeARESPatterns,
} from "../aresPatternIntelligence";

import {
  getARESActionHistory,
  getARESActionStats,
  getARESActionStatsByType,
} from "./aresActionLearning";

// ==========================================
// BUILD ARES CONTEXT
// ==========================================

export function buildARESContext({
  tasks = [],
  goals = [],
  focus = {},
  plannerEvents = [],
  settings = {},
} = {}) {

  // ========================================
  // ARES MEMORY
  // ========================================

  const learningData =
    getLearningData();

  // ========================================
  // ARES PATTERN INTELLIGENCE
  // ========================================

  const patterns =
    analyzeARESPatterns();

  // ========================================
  // ARES ACTION LEARNING
  // ========================================

  const actionHistory =
    getARESActionHistory();

  const actionStats =
    getARESActionStats();

  const actionStatsByType =
    getARESActionStatsByType();

  // ========================================
  // COMPLETE ARES CONTEXT
  // ========================================

  return {
    timestamp:
      new Date().toISOString(),

    // ======================================
    // CURRENT LIFEOS STATE
    // ======================================

    tasks: {
      total:
        tasks.length,

      completed:
        tasks.filter(
          (task) =>
            task.completed
        ).length,

      pending:
        tasks.filter(
          (task) =>
            !task.completed
        ).length,

      items:
        tasks,
    },

    goals: {
      total:
        goals.length,

      active:
        goals.filter(
          (goal) =>
            !goal.completed
        ).length,

      completed:
        goals.filter(
          (goal) =>
            goal.completed
        ).length,

      items:
        goals,
    },

    focus: {
      ...focus,
    },

    planner: {
      events:
        Array.isArray(
          plannerEvents
        )
          ? plannerEvents
          : [],

      count:
        Array.isArray(
          plannerEvents
        )
          ? plannerEvents.length
          : Number(
              plannerEvents
            ) || 0,
    },

    settings: {
      ...settings,
    },

    // ======================================
    // ARES MEMORY
    // ======================================

    memory: {
      focusSessions:
        learningData.focusSessions ||
        [],

      taskCompletions:
        learningData.taskCompletions ||
        [],

      goalUpdates:
        learningData.goalUpdates ||
        [],

      goalCompletions:
        learningData.goalCompletions ||
        [],
    },

    // ======================================
    // ARES PATTERNS
    // ======================================

    patterns: {
      focusTime:
        patterns?.focusTime,

      focusStyle:
        patterns?.focusStyle,

      taskBehavior:
        patterns?.taskBehavior,

      goalBehavior:
        patterns?.goalBehavior,

      progressTrend:
        patterns?.progressTrend,
    },

    // ======================================
    // ARES ACTION LEARNING
    // ======================================

    actionLearning: {
      stats: {
        total:
          actionStats?.total || 0,

        completed:
          actionStats?.completed || 0,

        abandoned:
          actionStats?.abandoned || 0,

        pending:
          actionStats?.pending || 0,

        successRate:
          actionStats?.successRate || 0,
      },

      // Contains type-level AND
      // mode-level learning.
      byType:
        actionStatsByType,

      // Full action history
      history:
        actionHistory,
    },
  };
}

// ==========================================
// EXPORT
// ==========================================

export default buildARESContext;
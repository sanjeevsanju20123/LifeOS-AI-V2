// ==========================================
// ARES CORE
// Central entry point for ARES intelligence
// ==========================================

import {
  buildARESContext,
} from "./aresContext";

import {
  getARESMemory,
} from "./aresMemory";

import {
  getARESDecision,
} from "./aresDecision";

import {
  getARESActionHistory,
  getARESActionStats,
  getARESActionStatsByType,
} from "./aresActionLearning";

// ==========================================
// BUILD ARES BRAIN STATE
// ==========================================

export function buildARESState({
  tasks = [],
  goals = [],
  focus = {},
  plannerEvents = [],
  settings = {},
} = {}) {
  // ----------------------------------------
  // CURRENT CONTEXT
  // ----------------------------------------

  const context =
    buildARESContext({
      tasks,
      goals,
      focus,
      plannerEvents,
      settings,
    });

  // ----------------------------------------
  // ARES MEMORY
  // ----------------------------------------

  const memory =
    getARESMemory();

  // ----------------------------------------
  // ARES ACTION LEARNING
  // ----------------------------------------

  const actionHistory =
    getARESActionHistory();

  const actionStats =
    getARESActionStats();

  const actionStatsByType =
    getARESActionStatsByType();

  const actionLearning = {
    history: actionHistory,
    stats: actionStats,
    byType: actionStatsByType,
  };

  // ----------------------------------------
  // ARES DECISION
  // ----------------------------------------

  const decision =
    getARESDecision({
      ...context,
      actionLearning,
    });

  // ----------------------------------------
  // COMPLETE ARES STATE
  // ----------------------------------------

  return {
    context,

    memory,

    actionLearning,

    decision,

    generatedAt:
      new Date().toISOString(),
  };
}

// ==========================================
// GET ARES RESPONSE
// ==========================================

export function getARESResponse(
  options = {}
) {
  const state =
    buildARESState(options);

  return {
    message:
      state.decision?.message ||
      "ARES is ready.",

    type:
      state.decision?.type ||
      "general",

    title:
      state.decision?.title ||
      "ARES",

    focusMode:
      state.decision?.focusMode ||
      null,

    action:
      state.decision?.action ||
      null,

    state,

    generatedAt:
      new Date().toISOString(),
  };
}

export default getARESResponse;
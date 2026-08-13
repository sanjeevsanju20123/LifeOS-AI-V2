import { getARESResponse } from "./ares/aresCore";

import {
  getARESActionHistory,
  getARESActionStats,
} from "./ares/aresActionLearning";

import {
  getARESActionIntelligence,
  getARESActionLearningInsight,
} from "./ares/aresActionIntelligence";

// ==========================================
// ARES CORE TEST
// ==========================================

export function testARESCore() {
  const result = getARESResponse({
    tasks: [
      {
        title: "Build LifeOS ARES Brain",
        completed: false,
        priority: "high",
      },
    ],

    goals: [
      {
        title: "Build LifeOS AI",
        progress: 40,
        priority: "high",
        completed: false,
      },
    ],

    focus: {
      totalMinutes: 20,
    },

    plannerEvents: [],

    settings: {},
  });

  console.log(
    "🧠 ARES CORE TEST RESULT:",
    JSON.stringify(result, null, 2)
  );

  return result;
}

// ==========================================
// ARES ACTION LEARNING HISTORY TEST
// ==========================================

export function testARESActionLearning() {
  console.log(
    "=========================================="
  );

  console.log(
    "🧠 ARES ACTION LEARNING HISTORY TEST"
  );

  console.log(
    "=========================================="
  );

  // ========================================
  // ACTION HISTORY
  // ========================================

  const history =
    getARESActionHistory();

  console.log(
    "📚 ARES ACTION HISTORY:",
    history
  );

  // ========================================
  // ACTION STATISTICS
  // ========================================

  const stats =
    getARESActionStats();

  console.log(
    "📊 ARES ACTION STATS:",
    stats
  );

  return {
    history,
    stats,
  };
}

// ==========================================
// ARES ACTION INTELLIGENCE TEST
// ==========================================

export function testARESActionIntelligence() {
  console.log(
    "=========================================="
  );

  console.log(
    "🧠 ARES ACTION INTELLIGENCE TEST"
  );

  console.log(
    "=========================================="
  );

  // ========================================
  // GET ACTION INTELLIGENCE
  // ========================================

  const intelligence =
    getARESActionIntelligence();

  console.log(
    "📊 ARES ACTION INTELLIGENCE:",
    intelligence
  );

  // ========================================
  // GET LEARNING INSIGHT
  // ========================================

  const insight =
    getARESActionLearningInsight();

  console.log(
    "💡 ARES ACTION LEARNING INSIGHT:",
    insight
  );

  return {
    intelligence,
    insight,
  };
}

// ==========================================
// RUN TESTS
// ==========================================

testARESCore();

testARESActionLearning();

testARESActionIntelligence();
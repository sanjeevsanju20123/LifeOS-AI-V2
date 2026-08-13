// =========================================
// ARES VOICE PERSONALITY
// Converts ARES responses into natural speech
// =========================================

export function makeARESConversational(
  text,
  context = "general"
) {
  if (!text || !text.trim()) {
    return "";
  }

  let speech = text.trim();

  // -----------------------------------------
  // Clean formatting
  // -----------------------------------------

  speech = speech
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\_\_(.*?)\_\_/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/^[•-]\s*/gm, "");

  // -----------------------------------------
  // Context-specific delivery
  // -----------------------------------------

  switch (context) {
    case "greeting":
      speech = makeGreeting(speech);
      break;

    case "achievement":
      speech = makeAchievement(speech);
      break;

    case "focus":
      speech = makeFocus(speech);
      break;

    case "warning":
      speech = makeWarning(speech);
      break;

    case "insight":
      speech = makeInsight(speech);
      break;

    default:
      speech = makeGeneral(speech);
      break;
  }

  return speech.trim();
}

// =========================================
// GREETING
// =========================================

function makeGreeting(text) {
  // Do NOT add another greeting if one
  // already exists.

  if (
    /^hello\b/i.test(text) ||
    /^hi\b/i.test(text) ||
    /^hey\b/i.test(text) ||
    /^good morning\b/i.test(text) ||
    /^good afternoon\b/i.test(text) ||
    /^good evening\b/i.test(text)
  ) {
    return text;
  }

  // Hindi text should remain Hindi.
  if (/[\u0900-\u097F]/.test(text)) {
    return text;
  }

  return `Hello. ${text}`;
}

// =========================================
// ACHIEVEMENT
// =========================================

function makeAchievement(text) {
  const starters = [
    "Nice work.",
    "Great job.",
    "Well done.",
  ];

  // Don't add another starter if one
  // already exists.

  if (
    /^(Nice work|Great job|Well done)\b/i.test(text)
  ) {
    return text;
  }

  const starter =
    starters[
      Math.floor(
        Math.random() * starters.length
      )
    ];

  return `${starter} ${text}`;
}

// =========================================
// FOCUS
// =========================================

function makeFocus(text) {
  if (
    /^let's stay focused\b/i.test(text) ||
    /focus session/i.test(text)
  ) {
    return text;
  }

  return `Let's stay focused. ${text}`;
}

// =========================================
// WARNING
// =========================================

function makeWarning(text) {
  if (
    /^just a heads-up\b/i.test(text)
  ) {
    return text;
  }

  return `Just a heads-up. ${text}`;
}

// =========================================
// INSIGHT
// =========================================

function makeInsight(text) {
  if (
    /^I've noticed something\b/i.test(text)
  ) {
    return text;
  }

  return `I've noticed something. ${text}`;
}

// =========================================
// GENERAL
// =========================================

function makeGeneral(text) {
  return text;
}
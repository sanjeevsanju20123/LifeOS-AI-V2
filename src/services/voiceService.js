// =========================================
// ARES LOCAL AI VOICE SERVICE
// Natural Conversational Speech
// =========================================

import { makeARESConversational } from "./aresVoicePersonality";

const VOICE_STORAGE_KEY = "lifeos-ares-voice";

const VOICE_SERVER = "http://localhost:3001";

// =========================================
// GET AVAILABLE VOICES
// =========================================

export function getVoices() {
  return [
    {
      name: "ARES English",
      voiceName: "en_US-bryce-medium",
      lang: "en-US",
      localService: true,
    },
    {
      name: "ARES Hindi",
      voiceName: "hi_IN-pratham-medium",
      lang: "hi-IN",
      localService: true,
    },
  ];
}

// =========================================
// SAVE VOICE PREFERENCE
// =========================================

export function saveVoicePreference(voiceName) {
  try {
    localStorage.setItem(
      VOICE_STORAGE_KEY,
      voiceName
    );
  } catch (error) {
    console.warn(
      "Could not save ARES voice preference.",
      error
    );
  }
}

// =========================================
// GET SAVED VOICE
// =========================================

export function getSavedVoice() {
  try {
    return (
      localStorage.getItem(
        VOICE_STORAGE_KEY
      ) || "en_US-bryce-medium"
    );
  } catch (error) {
    return "en_US-bryce-medium";
  }
}

// =========================================
// CURRENT AUDIO
// =========================================

let currentAudio = null;

// =========================================
// NATURAL SPEECH PREPROCESSING
// =========================================

function prepareARESForSpeech(text) {
  if (!text || !text.trim()) {
    return "";
  }

  let speech = text.trim();

  // ---------------------------------------
  // Remove Markdown / UI formatting
  // ---------------------------------------

  speech = speech
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/__(.*?)__/g, "$1")
    .replace(/`(.*?)`/g, "$1")
    .replace(/[*_#]/g, "");

  // ---------------------------------------
  // Convert percentages
  // ---------------------------------------

  speech = speech.replace(
    /(\d+(?:\.\d+)?)%/g,
    "$1 percent"
  );

  // ---------------------------------------
  // Common abbreviations
  // ---------------------------------------

  speech = speech
    .replace(/\bmins?\b/gi, "minutes")
    .replace(/\bhrs?\b/gi, "hours")
    .replace(/\bsecs?\b/gi, "seconds");

  // ---------------------------------------
  // Common AI abbreviation
  // ---------------------------------------

  speech = speech.replace(
    /\bAI\b/g,
    "A I"
  );

  // ---------------------------------------
  // Improve symbols
  // ---------------------------------------

  speech = speech
    .replace(/\+/g, " plus ")
    .replace(/&/g, " and ");

  // ---------------------------------------
  // Natural sentence pauses
  // ---------------------------------------

  speech = speech.replace(
    /([.!?])\s+/g,
    "$1  "
  );

  // ---------------------------------------
  // Comma pauses
  // ---------------------------------------

  speech = speech.replace(
    /,\s+/g,
    ",  "
  );

  // ---------------------------------------
  // Colon pauses
  // ---------------------------------------

  speech = speech.replace(
    /:\s+/g,
    ":  "
  );

  // ---------------------------------------
  // Semicolon pauses
  // ---------------------------------------

  speech = speech.replace(
    /;\s+/g,
    ";  "
  );

  // ---------------------------------------
  // New lines become pauses
  // ---------------------------------------

  speech = speech.replace(
    /\n+/g,
    ".  "
  );

  // ---------------------------------------
  // Clean excessive whitespace
  // ---------------------------------------

  speech = speech
    .replace(/[ \t]{3,}/g, "  ")
    .trim();

  return speech;
}

// =========================================
// ARES SPEAK
// =========================================

export async function speakARES(
  text,
  options = {}
) {
  if (!text || !text.trim()) {
    return;
  }

  try {
    // ---------------------------------------
    // Stop previous audio
    // ---------------------------------------

    stopARES();

    // ---------------------------------------
    // ARES PERSONALITY
    // ---------------------------------------

    const conversationalText =
      makeARESConversational(
        text,
        options.context || "general"
      );

    // ---------------------------------------
    // NATURAL SPEECH PROCESSING
    // ---------------------------------------

    const speechText =
      prepareARESForSpeech(
        conversationalText
      );

    console.log(
      "🧠 ARES generating natural local voice..."
    );

    console.log(
      "🗣️ Speech:",
      speechText
    );

    console.log(
      "🎙️ Voice:",
      options.voiceName ||
        getSavedVoice()
    );

    // ---------------------------------------
    // REQUEST PIPER AUDIO
    // ---------------------------------------

    const response = await fetch(
      `${VOICE_SERVER}/api/voice`,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify({
          text: speechText,

          voice:
            options.voiceName ||
            getSavedVoice(),
        }),
      }
    );

    // ---------------------------------------
    // HANDLE SERVER ERRORS
    // ---------------------------------------

    if (!response.ok) {
      let errorMessage =
        "ARES voice generation failed.";

      try {
        const errorData =
          await response.json();

        if (errorData.error) {
          errorMessage =
            errorData.error;
        }

        if (errorData.details) {
          console.error(
            "ARES server details:",
            errorData.details
          );
        }
      } catch {
        // Ignore JSON parsing errors
      }

      throw new Error(
        errorMessage
      );
    }

    // ---------------------------------------
    // CONVERT RESPONSE TO AUDIO
    // ---------------------------------------

    const audioBlob =
      await response.blob();

    if (!audioBlob.size) {
      throw new Error(
        "ARES received an empty audio file."
      );
    }

    console.log(
      "🔊 Audio received:",
      audioBlob.size,
      "bytes"
    );

    const audioURL =
      URL.createObjectURL(
        audioBlob
      );

    const audio =
      new Audio(audioURL);

    currentAudio = audio;

    // ---------------------------------------
    // AUDIO SETTINGS
    // ---------------------------------------

    audio.volume =
      options.volume ?? 1;

    audio.playbackRate =
      options.rate ?? 0.97;

    // ---------------------------------------
    // CLEANUP
    // ---------------------------------------

    audio.onended = () => {
      URL.revokeObjectURL(
        audioURL
      );

      if (
        currentAudio === audio
      ) {
        currentAudio = null;
      }
    };

    audio.onerror = () => {
      console.error(
        "❌ ARES audio playback error."
      );

      URL.revokeObjectURL(
        audioURL
      );

      if (
        currentAudio === audio
      ) {
        currentAudio = null;
      }
    };

    // ---------------------------------------
    // PLAY
    // ---------------------------------------

    await audio.play();

    console.log(
      "🔊 ARES natural voice playing"
    );

    return audio;

  } catch (error) {
    console.error(
      "ARES voice error:",
      error
    );

    throw error;
  }
}

// =========================================
// STOP ARES
// =========================================

export function stopARES() {
  if (currentAudio) {
    currentAudio.pause();

    currentAudio.currentTime = 0;

    currentAudio = null;
  }
}

// =========================================
// CHECK IF ARES IS SPEAKING
// =========================================

export function isARESSpeaking() {
  return (
    currentAudio !== null &&
    !currentAudio.paused &&
    !currentAudio.ended
  );
}
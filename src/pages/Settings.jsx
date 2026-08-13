import { useEffect, useState } from "react";
import { useSettings } from "../context/SettingsContext";
import "./Settings.css";

import {
  getVoices,
  getSavedVoice,
  saveVoicePreference,
  speakARES,
  stopARES,
} from "../services/voiceService";

function Settings() {
  const { aurora, setAurora } = useSettings();

  const [theme, setTheme] = useState("Dark");
  const [animations, setAnimations] = useState(true);

  // =========================================
  // VOICE STATE
  // =========================================

  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(
    getSavedVoice() || ""
  );

  // =========================================
  // LOAD VOICES
  // =========================================

  useEffect(() => {
    function loadVoices() {
      const availableVoices = getVoices();

      setVoices(availableVoices);

      if (!selectedVoice && availableVoices.length > 0) {
        const englishVoice = availableVoices.find((voice) =>
          voice.lang?.toLowerCase().startsWith("en")
        );

        const defaultVoice =
          englishVoice || availableVoices[0];

        setSelectedVoice(defaultVoice.voiceName);
        saveVoicePreference(defaultVoice.voiceName);
      }
    }

    loadVoices();

    if ("speechSynthesis" in window) {
      window.speechSynthesis.addEventListener(
        "voiceschanged",
        loadVoices
      );
    }

    return () => {
      if ("speechSynthesis" in window) {
        window.speechSynthesis.removeEventListener(
          "voiceschanged",
          loadVoices
        );
      }
    };
  }, [selectedVoice]);

  // =========================================
  // VOICE CHANGE
  // =========================================

  function handleVoiceChange(event) {
    const voiceName = event.target.value;

    setSelectedVoice(voiceName);
    saveVoicePreference(voiceName);
  }

  // =========================================
  // TEST ARES VOICE
  // =========================================

function handleTestVoice() {
  console.log("🔊 TEST VOICE SELECTED:", selectedVoice);

  if (selectedVoice === "hi_IN-pratham-medium") {
    speakARES(
      "नमस्ते। मैं एरेस हूँ। आपका स्वागत है।",
      {
        voiceName: selectedVoice,
        rate: 0.97,
        volume: 1,
        context: "greeting",
      }
    );
  } else {
    speakARES(
      "Hello. I am ARES. Welcome back. I am your personal LifeOS intelligence.",
      {
        voiceName: selectedVoice,
        rate: 0.97,
        volume: 1,
        context: "greeting",
      }
    );
  }
}

  return (
    <main className="settings-page">

      {/* ================================= */}
      {/* HEADER */}
      {/* ================================= */}

      <div className="settings-header">
        <div>
          <h1>⚙️ Settings</h1>

          <p>
            Customize your LifeOS AI experience.
          </p>
        </div>
      </div>

      {/* ================================= */}
      {/* APPEARANCE */}
      {/* ================================= */}

      <section className="settings-section">

        <div className="settings-section-header">

          <div className="settings-section-icon">
            🎨
          </div>

          <div>
            <h2>Appearance</h2>

            <p>
              Customize how LifeOS looks.
            </p>
          </div>

        </div>

        {/* THEME */}

        <div className="setting-row">

          <div className="setting-info">

            <strong>
              Theme
            </strong>

            <span>
              Choose your preferred theme.
            </span>

          </div>

          <select
            className="settings-select"
            value={theme}
            onChange={(event) =>
              setTheme(event.target.value)
            }
          >
            <option value="Dark">
              Dark
            </option>

            <option value="Light">
              Light
            </option>

            <option value="System">
              System
            </option>
          </select>

        </div>

        {/* AURORA */}

        <div className="setting-row">

          <div className="setting-info">

            <strong>
              Aurora Background
            </strong>

            <span>
              Show the animated Aurora background.
            </span>

          </div>

          <button
            type="button"
            className={`settings-toggle ${
              aurora ? "on" : ""
            }`}
            onClick={() =>
              setAurora(!aurora)
            }
          >
            <span></span>
          </button>

        </div>

        {/* ANIMATIONS */}

        <div className="setting-row">

          <div className="setting-info">

            <strong>
              Animations
            </strong>

            <span>
              Enable LifeOS interface animations.
            </span>

          </div>

          <button
            type="button"
            className={`settings-toggle ${
              animations ? "on" : ""
            }`}
            onClick={() =>
              setAnimations(!animations)
            }
          >
            <span></span>
          </button>

        </div>

      </section>

      {/* ================================= */}
      {/* ARES VOICE */}
      {/* ================================= */}

      <section className="settings-section">

        <div className="settings-section-header">

          <div className="settings-section-icon">
            🧠
          </div>

          <div>
            <h2>
              ARES Voice
            </h2>

            <p>
              Choose the voice ARES uses when speaking.
            </p>
          </div>

        </div>

        {/* VOICE SELECT */}

        <div className="setting-row">

          <div className="setting-info">

            <strong>
              Voice
            </strong>

            <span>
              Select your preferred ARES voice.
            </span>

          </div>

          <select
            className="settings-select"
            value={selectedVoice}
            onChange={handleVoiceChange}
            disabled={voices.length === 0}
          >

            {voices.length === 0 ? (

              <option value="">
                Loading voices...
              </option>

            ) : (

              voices.map((voice) => (

                <option
                  key={`${voice.name}-${voice.lang}`}
                  value={voice.voiceName}
                >
                  {voice.name} — {voice.lang}
                </option>

              ))

            )}

          </select>

        </div>

        {/* TEST VOICE */}

        <div className="setting-row">

          <div className="setting-info">

            <strong>
              Test ARES Voice
            </strong>

            <span>
              Hear how ARES sounds with your selected voice.
            </span>

          </div>

          <div className="voice-actions">

            <button
              type="button"
              className="voice-test-button"
              onClick={handleTestVoice}
              disabled={voices.length === 0}
            >
              🔊 Test Voice
            </button>

            <button
              type="button"
              className="voice-stop-button"
              onClick={stopARES}
            >
              ⏹ Stop
            </button>

          </div>

        </div>

      </section>

      {/* ================================= */}
      {/* MUSIC */}
      {/* ================================= */}

      <section className="settings-section">

        <div className="settings-section-header">

          <div className="settings-section-icon">
            🎵
          </div>

          <div>
            <h2>
              Music
            </h2>

            <p>
              Control your LifeOS music experience.
            </p>
          </div>

        </div>

        {/* MINI MUSIC */}

        <div className="setting-row">

          <div className="setting-info">

            <strong>
              Mini Music Player
            </strong>

            <span>
              Show music controls in BottomDock.
            </span>

          </div>

          <button
            type="button"
            className="settings-toggle on"
          >
            <span></span>
          </button>

        </div>

        {/* DEFAULT MUSIC MODE */}

        <div className="setting-row">

          <div className="setting-info">

            <strong>
              Default Music Mode
            </strong>

            <span>
              Music used when starting LifeOS.
            </span>

          </div>

          <select className="settings-select">

            <option>
              🧠 Focus
            </option>

            <option>
              ☕ Lo-Fi
            </option>

            <option>
              🌙 Ambient
            </option>

            <option>
              🌧️ Nature
            </option>

          </select>

        </div>

      </section>

      {/* ================================= */}
      {/* ABOUT */}
      {/* ================================= */}

      <section className="settings-section">

        <div className="settings-section-header">

          <div className="settings-section-icon">
            ℹ️
          </div>

          <div>
            <h2>
              About LifeOS
            </h2>

            <p>
              Your personal productivity operating system.
            </p>
          </div>

        </div>

        <div className="about-lifeos">

          <strong>
            LifeOS AI
          </strong>

          <span>
            Personal Productivity System
          </span>

          <small>
            Version 1.0
          </small>

        </div>

      </section>

    </main>
  );
}

export default Settings;
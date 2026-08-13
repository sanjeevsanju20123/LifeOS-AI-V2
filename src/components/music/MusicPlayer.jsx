import "./MusicPlayer.css";

import { useMusic } from "../../context/MusicContext";

function MusicPlayer() {
  const {
    MODES,
    mode,
    station,
    isPlaying,
    volume,
    loading,
    error,
    togglePlay,
    changeMode,
    nextStation,
    previousStation,
    handleVolume,
  } = useMusic();

  return (
    <section className="music-player">

      {/* =========================================
          HEADER
      ========================================= */}

      <div className="music-header">

        <div>

          <span className="music-label">
            🎵 LIFEOS MUSIC
          </span>

          <h2>
            {loading
              ? "Finding Music..."
              : station?.name || "LifeOS Radio"}
          </h2>

          <p>
            {loading
              ? "Connecting to internet radio"
              : station?.country || "Live Internet Radio"}
          </p>

        </div>

        <div className="music-icon">
          🎧
        </div>

      </div>


      {/* =========================================
          MODES
      ========================================= */}

      <div className="music-modes">

        {Object.entries(MODES).map(
          ([key, item]) => (
            <button
              key={key}
              type="button"
              className={
                mode === key
                  ? "music-mode active"
                  : "music-mode"
              }
              onClick={() => changeMode(key)}
            >
              {item.label}
            </button>
          )
        )}

      </div>


      {/* =========================================
          ERROR
      ========================================= */}

      {error && (
        <p className="music-error">
          {error}
        </p>
      )}


      {/* =========================================
          CONTROLS
      ========================================= */}

      <div className="music-controls">

        <button
          type="button"
          onClick={previousStation}
          disabled={
            loading ||
            !station
          }
          aria-label="Previous station"
        >
          ⏮
        </button>


        <button
          type="button"
          className="music-play"
          onClick={togglePlay}
          disabled={
            loading ||
            !station
          }
          aria-label={
            isPlaying
              ? "Pause"
              : "Play"
          }
        >
          {isPlaying
            ? "❚❚"
            : "▶"}
        </button>


        <button
          type="button"
          onClick={nextStation}
          disabled={
            loading ||
            !station
          }
          aria-label="Next station"
        >
          ⏭
        </button>

      </div>


      {/* =========================================
          LIVE STATUS
      ========================================= */}

      <div className="music-live-status">

        <span
          className={
            isPlaying
              ? "live-dot active"
              : "live-dot"
          }
        />

        {isPlaying
          ? `LIVE • ${MODES[mode].label}`
          : "Ready to play"}

      </div>


      {/* =========================================
          VOLUME
      ========================================= */}

      <div className="music-volume">

        <span>
          🔊
        </span>

        <input
          type="range"
          min="0"
          max="1"
          step="0.01"
          value={volume}
          onChange={(event) =>
            handleVolume(
              event.target.value
            )
          }
        />

      </div>

    </section>
  );
}

export default MusicPlayer;
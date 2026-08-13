import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

const MusicContext = createContext(null);

const MODES = {
  focus: {
    label: "🧠 Focus",
    tags: ["focus", "study", "concentration"],
  },

  lofi: {
    label: "☕ Lo-Fi",
    tags: ["lofi", "lo-fi", "chillout"],
  },

  ambient: {
    label: "🌙 Ambient",
    tags: ["ambient", "relax", "chillout"],
  },

  nature: {
    label: "🌧️ Nature",
    tags: ["nature", "nature sounds", "relax"],
  },
};

const API_BASE =
  "https://de1.api.radio-browser.info/json/stations/bytag";

const STORAGE_KEY = "lifeos-music";

function getDefaultMusic() {
  return {
    mode: "focus",
    volume: 0.7,
    station: null,
  };
}

function loadSavedMusic() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return getDefaultMusic();
    }

    return {
      ...getDefaultMusic(),
      ...JSON.parse(saved),
    };
  } catch {
    return getDefaultMusic();
  }
}

export function MusicProvider({ children }) {
  const initialMusicRef = useRef(null);

  if (!initialMusicRef.current) {
    initialMusicRef.current = loadSavedMusic();
  }

  const saved = initialMusicRef.current;

  const audioRef = useRef(null);
  const recoveryTimerRef = useRef(null);
  const recoveryAttemptsRef = useRef(0);

  const [mode, setMode] = useState(
    saved.mode || "focus"
  );

  const [stations, setStations] = useState([]);

  const [currentIndex, setCurrentIndex] =
    useState(0);

  const [station, setStation] =
    useState(saved.station || null);

  const [isPlaying, setIsPlaying] =
    useState(false);

  const [volume, setVolume] =
    useState(saved.volume ?? 0.7);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  // =========================================
  // CREATE AUDIO ONCE
  // =========================================

  useEffect(() => {
    const audio = new Audio();

    audio.preload = "none";
    audio.volume = saved.volume ?? 0.7;

    audioRef.current = audio;

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleError = () => {
      setIsPlaying(false);

      setError(
        "Station disconnected. Finding another..."
      );

      recoverStation();
    };

    audio.addEventListener(
      "play",
      handlePlay
    );

    audio.addEventListener(
      "pause",
      handlePause
    );

    audio.addEventListener(
      "error",
      handleError
    );

    return () => {
      audio.removeEventListener(
        "play",
        handlePlay
      );

      audio.removeEventListener(
        "pause",
        handlePause
      );

      audio.removeEventListener(
        "error",
        handleError
      );

      if (recoveryTimerRef.current) {
        clearTimeout(
          recoveryTimerRef.current
        );
      }

      /*
        We intentionally do not call:
        audio.pause();

        The MusicProvider should stay mounted
        while navigating between pages.
      */
    };
  }, []);

  // =========================================
  // LOAD STATIONS
  // =========================================

  const loadStations = async (
    selectedMode
  ) => {
    try {
      setLoading(true);
      setError("");

      const tags =
        MODES[selectedMode].tags;

      const requests = tags.map(
        async (tag) => {
          try {
            const response =
              await fetch(
                `${API_BASE}/${encodeURIComponent(
                  tag
                )}?limit=20&hidebroken=true`
              );

            if (!response.ok) {
              return [];
            }

            return await response.json();
          } catch (err) {
            console.error(
              "Radio request failed:",
              err
            );

            return [];
          }
        }
      );

      const results =
        await Promise.all(requests);

      const allStations =
        results.flat();

      const uniqueStations =
        Array.from(
          new Map(
            allStations
              .filter(
                (item) =>
                  item.url_resolved
              )
              .map((item) => [
                item.stationuuid,
                item,
              ])
          ).values()
        );

      if (
        uniqueStations.length === 0
      ) {
        throw new Error(
          "No stations found"
        );
      }

      setStations(
        uniqueStations
      );

      let selectedIndex = 0;

      if (saved.station) {
        const savedIndex =
          uniqueStations.findIndex(
            (item) =>
              item.stationuuid ===
              saved.station.stationuuid
          );

        if (savedIndex >= 0) {
          selectedIndex =
            savedIndex;
        }
      }

      setCurrentIndex(
        selectedIndex
      );

      setStation(
        uniqueStations[
          selectedIndex
        ]
      );

      recoveryAttemptsRef.current = 0;
    } catch (err) {
      console.error(
        "Station loading failed:",
        err
      );

      setStations([]);
      setStation(null);

      setError(
        "Unable to find radio stations."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================
  // INITIAL LOAD
  // =========================================

  useEffect(() => {
    loadStations(mode);
  }, []);

  // =========================================
  // CHANGE AUDIO WHEN STATION CHANGES
  // =========================================

  useEffect(() => {
    const audio =
      audioRef.current;

    if (!audio || !station) {
      return;
    }

    const wasPlaying =
      !audio.paused &&
      !audio.ended;

    audio.pause();

    audio.src =
      station.url_resolved;

    audio.load();

    if (wasPlaying) {
      setTimeout(() => {
        audio
          .play()
          .then(() => {
            setIsPlaying(true);
            setError("");

            recoveryAttemptsRef.current = 0;
          })
          .catch(() => {
            setIsPlaying(false);
            recoverStation();
          });
      }, 100);
    }
  }, [station]);

  // =========================================
  // SAVE SETTINGS
  // =========================================

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          mode,
          volume,
          station,
        })
      );
    } catch {
      // Ignore storage errors
    }
  }, [
    mode,
    volume,
    station,
  ]);

  // =========================================
  // VOLUME
  // =========================================

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume =
        volume;
    }
  }, [volume]);

  // =========================================
  // AUTOMATIC RECOVERY
  // =========================================

  const recoverStation = () => {
    if (!stations.length) {
      return;
    }

    if (
      recoveryTimerRef.current
    ) {
      clearTimeout(
        recoveryTimerRef.current
      );
    }

    setIsPlaying(false);

    recoveryAttemptsRef.current += 1;

    const nextIndex =
      (currentIndex + 1) %
      stations.length;

    /*
      Try another station after
      a short delay.
    */

    recoveryTimerRef.current =
      setTimeout(() => {
        if (
          recoveryAttemptsRef.current >
          stations.length
        ) {
          recoveryAttemptsRef.current = 0;

          setError(
            "Radio connection lost. Refreshing stations..."
          );

          loadStations(mode);

          return;
        }

        setError(
          "Station disconnected. Trying another..."
        );

        setCurrentIndex(
          nextIndex
        );

        setStation(
          stations[nextIndex]
        );

        setTimeout(() => {
          const audio =
            audioRef.current;

          if (!audio) {
            return;
          }

          audio
            .play()
            .then(() => {
              setIsPlaying(true);
              setError("");

              recoveryAttemptsRef.current = 0;
            })
            .catch(() => {
              recoverStation();
            });
        }, 300);
      }, 1500);
  };

  // =========================================
  // PLAY / PAUSE
  // =========================================

  const togglePlay = async () => {
    const audio =
      audioRef.current;

    if (!audio || !station) {
      return;
    }

    if (!audio.paused) {
      audio.pause();

      setIsPlaying(false);

      return;
    }

    try {
      setError("");

      await audio.play();

      setIsPlaying(true);

      recoveryAttemptsRef.current = 0;
    } catch (err) {
      console.error(
        "Radio playback failed:",
        err
      );

      setIsPlaying(false);

      setError(
        "Unable to start this station."
      );
    }
  };

  // =========================================
  // CHANGE MODE
  // =========================================

  const changeMode = async (
    newMode
  ) => {
    if (newMode === mode) {
      return;
    }

    const wasPlaying =
      audioRef.current &&
      !audioRef.current.paused;

    if (audioRef.current) {
      audioRef.current.pause();
    }

    setIsPlaying(false);

    recoveryAttemptsRef.current = 0;

    setMode(newMode);

    await loadStations(
      newMode
    );

    if (wasPlaying) {
      setTimeout(() => {
        const audio =
          audioRef.current;

        if (!audio) {
          return;
        }

        audio
          .play()
          .then(() => {
            setIsPlaying(true);
            setError("");
          })
          .catch(() => {
            recoverStation();
          });
      }, 300);
    }
  };

  // =========================================
  // NEXT STATION
  // =========================================

  const nextStation = () => {
    if (!stations.length) {
      return;
    }

    const nextIndex =
      (currentIndex + 1) %
      stations.length;

    const wasPlaying =
      audioRef.current &&
      !audioRef.current.paused;

    setCurrentIndex(
      nextIndex
    );

    setStation(
      stations[nextIndex]
    );

    if (wasPlaying) {
      setTimeout(() => {
        audioRef.current
          ?.play()
          .then(() => {
            setIsPlaying(true);
            setError("");
          })
          .catch(() => {
            recoverStation();
          });
      }, 300);
    }
  };

  // =========================================
  // PREVIOUS STATION
  // =========================================

  const previousStation = () => {
    if (!stations.length) {
      return;
    }

    const previousIndex =
      (
        currentIndex -
        1 +
        stations.length
      ) % stations.length;

    const wasPlaying =
      audioRef.current &&
      !audioRef.current.paused;

    setCurrentIndex(
      previousIndex
    );

    setStation(
      stations[previousIndex]
    );

    if (wasPlaying) {
      setTimeout(() => {
        audioRef.current
          ?.play()
          .then(() => {
            setIsPlaying(true);
            setError("");
          })
          .catch(() => {
            recoverStation();
          });
      }, 300);
    }
  };

  // =========================================
  // VOLUME
  // =========================================

  const handleVolume = (
    value
  ) => {
    const newVolume =
      Number(value);

    setVolume(newVolume);

    if (audioRef.current) {
      audioRef.current.volume =
        newVolume;
    }
  };

  // =========================================
  // CONTEXT
  // =========================================

  return (
    <MusicContext.Provider
      value={{
        MODES,

        mode,
        stations,
        currentIndex,
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
      }}
    >
      {children}
    </MusicContext.Provider>
  );
}

// =========================================
// USE MUSIC
// =========================================

export function useMusic() {
  const context =
    useContext(
      MusicContext
    );

  if (!context) {
    throw new Error(
      "useMusic must be used inside MusicProvider"
    );
  }

  return context;
}
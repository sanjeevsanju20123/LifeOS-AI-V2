import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const SettingsContext = createContext(null);

const STORAGE_KEY = "lifeos-settings";

const DEFAULT_SETTINGS = {
  aurora: true,
  animations: true,
};

function loadSettings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return DEFAULT_SETTINGS;
    }

    return {
      ...DEFAULT_SETTINGS,
      ...JSON.parse(saved),
    };
  } catch (error) {
    console.error(
      "Settings load error:",
      error
    );

    return DEFAULT_SETTINGS;
  }
}

export function SettingsProvider({ children }) {
  const [settings, setSettings] = useState(
    loadSettings
  );

  // =========================================
  // SAVE SETTINGS
  // =========================================

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(settings)
      );
    } catch (error) {
      console.error(
        "Settings save error:",
        error
      );
    }
  }, [settings]);

  // =========================================
  // AURORA
  // =========================================

  function setAurora(value) {
    setSettings((previous) => ({
      ...previous,
      aurora: value,
    }));
  }

  // =========================================
  // ANIMATIONS
  // =========================================

  function setAnimations(value) {
    setSettings((previous) => ({
      ...previous,
      animations: value,
    }));
  }

  // =========================================
  // CONTEXT
  // =========================================

  return (
    <SettingsContext.Provider
      value={{
        settings,

        aurora: settings.aurora,
        animations: settings.animations,

        setAurora,
        setAnimations,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

// =========================================
// USE SETTINGS
// =========================================

export function useSettings() {
  const context = useContext(
    SettingsContext
  );

  if (!context) {
    throw new Error(
      "useSettings must be used inside SettingsProvider"
    );
  }

  return context;
}
import { NavLink } from "react-router-dom";
import { useMusic } from "../../context/MusicContext";
import "./BottomDock.css";

function BottomDock() {
  const {
    station,
    isPlaying,
    togglePlay,
    loading,
  } = useMusic();

  const links = [
    {
      path: "/",
      icon: "🏠",
      name: "Home",
    },
    {
      path: "/tasks",
      icon: "✅",
      name: "Tasks",
    },
    {
      path: "/planner",
      icon: "📅",
      name: "Planner",
    },
    {
      path: "/goals",
      icon: "🎯",
      name: "Goals",
    },
    {
      path: "/finance",
      icon: "$",
      name: "Finance",
    },
    {
      path: "/settings",
      icon: "⚙️",
      name: "Settings",
    },
  ];

  return (
    <nav>
      {links.map((link) => (
        <NavLink
          key={link.path}
          to={link.path}
          className="dock-btn"
        >
          <span>{link.icon}</span>
          {link.name}
        </NavLink>
      ))}

      {/* MINI MUSIC PLAYER */}
      {station && (
        <div
  className={`mini-music ${
    isPlaying ? "playing" : ""
  }`}
>

          <div className="mini-music-icon">
            🎵
          </div>

          <div className="mini-music-text">
            {station.name}
          </div>

          <button
            type="button"
            className="mini-music-play"
            onClick={togglePlay}
            disabled={loading}
            aria-label={
              isPlaying
                ? "Pause music"
                : "Play music"
            }
          >
            {isPlaying ? "❚❚" : "▶"}
          </button>

          {isPlaying && (
            <div className="music-bars">
              <i />
              <i />
              <i />
            </div>
          )}

        </div>
      )}
    </nav>
  );
}

export default BottomDock;
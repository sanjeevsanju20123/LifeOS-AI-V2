import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CommandPalette.css";

function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  const navigate = useNavigate();

  const commands = [
    { title: "Dashboard", action: () => navigate("/") },
    { title: "Tasks", action: () => navigate("/tasks") },
    { title: "Focus", action: () => navigate("/focus") },
    { title: "Planner", action: () => navigate("/planner") },
    { title: "Habits", action: () => navigate("/habits") },
    { title: "Goals", action: () => navigate("/goals") },
    { title: "Settings", action: () => navigate("/settings") },
  ];

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.ctrlKey && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }

      if (e.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () =>
      window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const filtered = commands.filter((command) =>
    command.title.toLowerCase().includes(query.toLowerCase())
  );

  if (!open) return null;

  return (
    <div className="command-overlay">
      <div className="command-modal">
        <input
          autoFocus
          placeholder="Ask ARES or search..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <div className="command-results">
          {filtered.map((command) => (
            <button
              key={command.title}
              onClick={() => {
                command.action();
                setOpen(false);
                setQuery("");
              }}
            >
              {command.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CommandPalette;
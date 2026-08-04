import { useEffect, useState } from "react";
import { usePlanner } from "../../context/PlannerContext";
import "./Planner.css";

function AddEventModal({
  open,
  onClose,
  editingEvent,
}) {
  const { addEvent, updateEvent } = usePlanner();

  const [time, setTime] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState("Work");

  useEffect(() => {
  if (editingEvent) {
    setTime(editingEvent.time);
    setTitle(editingEvent.title);
    setType(editingEvent.type);
  } else {
    setTime("");
    setTitle("");
    setType("Work");
  }
}, [editingEvent]);

  if (!open) return null;

  function handleSave() {
    if (!time || !title) return;

    if (editingEvent) {
    updateEvent({
      ...editingEvent,
      time,
      title,
      type,
    });
  } else {
    addEvent({
      time,
      title,
      type,
    });
  }

  setTime("");
  setTitle("");
  setType("Work");

  onClose();
}

  return (
    <div className="planner-modal-overlay">
      <div className="planner-modal">

        <h2>
  {editingEvent
    ? "✏️ Edit Event"
    : "✨ Create New Event"}
</h2>

        <label>Time</label>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />

        <label>Event</label>
        <input
          type="text"
          placeholder="Enter event..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        <label>Category</label>
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option>Work</option>
          <option>Focus</option>
          <option>Health</option>
          <option>Study</option>
          <option>Personal</option>
        </select>

        <div className="planner-modal-buttons">
          <button onClick={onClose}>
            Cancel
          </button>

          <button onClick={handleSave}>
            Save Event
          </button>
        </div>

      </div>
    </div>
  );
}

export default AddEventModal;
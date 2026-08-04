import { usePlanner } from "../../context/PlannerContext";

function PlannerEvent({ event, onEdit }) {
  const { deleteEvent } = usePlanner();
  return (
    <div className="planner-event">

      <div className="planner-time">
        {event.time}
      </div>

      <div className="planner-card">

        <div className="planner-card-header">
          <h3>{event.title}</h3>

          <div className="planner-actions">

            <button
               className="edit-btn"
                onClick={() => onEdit(event)}
            >
                ✏️
            </button>

            <button
               className="delete-btn"
                onClick={() => deleteEvent(event.id)}
            >
               🗑️
            </button>

          </div>

        </div>

        <span>{event.type}</span>

      </div>

    </div>
  );
}

export default PlannerEvent;

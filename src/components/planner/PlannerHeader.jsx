function PlannerHeader({ onAdd }) {
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

  return (
    <div className="planner-header">

      <div>
        <h1>📅 Smart Planner</h1>
        <p>{today}</p>
      </div>

      <button
        className="planner-add-btn"
        onClick={onAdd}
      >
        + Add Event
      </button>

    </div>
  );
}

export default PlannerHeader;
import { useState } from "react";

import PlannerHeader from "../components/planner/PlannerHeader";
import PlannerTimeline from "../components/planner/PlannerTimeline";
import AddEventModal from "../components/planner/AddEventModal";

import "../components/planner/Planner.css";

function Planner() {
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);

  function handleAdd() {
    setEditingEvent(null);
    setShowModal(true);
  }

  function handleEdit(event) {
    setEditingEvent(event);
    setShowModal(true);
  }

  return (
    <main className="container fade-up">

      <PlannerHeader onAdd={handleAdd} />

      <PlannerTimeline onEdit={handleEdit} />

      <AddEventModal
        open={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingEvent(null);
        }}
        editingEvent={editingEvent}
      />

    </main>
  );
}

export default Planner;
import { usePlanner } from "../../context/PlannerContext";
import PlannerEvent from "./PlannerEvent";

function PlannerTimeline({ onEdit }) {
const { events } = usePlanner();

  return (
    <div className="planner-timeline">
     {events.map((event) => (
  <PlannerEvent
    key={event.id}
    event={event}
    onEdit={onEdit}
  />
))}
    </div>
  );
}

export default PlannerTimeline;
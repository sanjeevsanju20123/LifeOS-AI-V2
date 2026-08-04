import { useMemo } from "react";

import { useTasks } from "../context/TaskContext";
import { usePlanner } from "../context/PlannerContext";
import { useFocus } from "../context/FocusContext";

import { calculateProductivity } from "../services/productivityEngine";

export function useProductivity() {
  const { tasks } = useTasks();
  const { events } = usePlanner();
  const { stats } = useFocus();

  return useMemo(() => {
    return calculateProductivity({
      tasks,
      plannerEvents: events,
      focusStats: stats,
    });
  }, [tasks, events, stats]);
}
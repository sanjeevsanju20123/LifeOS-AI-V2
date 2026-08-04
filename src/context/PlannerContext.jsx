import { createContext, useContext, useEffect, useState } from "react";

const PlannerContext = createContext();

const STORAGE_KEY = "lifeos-planner";

const DEFAULT_EVENTS = [
  {
    id: 1,
    time: "09:00",
    title: "LifeOS Development",
    type: "Work",
  },
  {
    id: 2,
    time: "11:00",
    title: "Deep Focus Session",
    type: "Focus",
  },
  {
    id: 3,
    time: "18:00",
    title: "Workout",
    type: "Health",
  },
];

export function PlannerProvider({ children }) {
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : DEFAULT_EVENTS;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  }, [events]);

  function addEvent(event) {
    setEvents((prev) =>
      [...prev, { ...event, id: Date.now() }].sort((a, b) =>
        a.time.localeCompare(b.time)
      )
    );
  }

  function deleteEvent(id) {
    setEvents((prev) => prev.filter((event) => event.id !== id));
  }

  function updateEvent(updatedEvent) {
    setEvents((prev) =>
      prev
        .map((event) =>
          event.id === updatedEvent.id ? updatedEvent : event
        )
        .sort((a, b) => a.time.localeCompare(b.time))
    );
  }

  return (
    <PlannerContext.Provider
      value={{
        events,
        addEvent,
        deleteEvent,
        updateEvent,
      }}
    >
      {children}
    </PlannerContext.Provider>
  );
}

export function usePlanner() {
  return useContext(PlannerContext);
}
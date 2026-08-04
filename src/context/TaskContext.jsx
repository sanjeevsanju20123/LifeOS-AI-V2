import { createContext, useContext, useEffect, useState } from "react";

const TaskContext = createContext();

const STORAGE_KEY = "lifeos-tasks";

const defaultTasks = [
  {
    id: 1,
    title: "Complete LifeOS Dashboard",
    category: "Work",
    priority: "High",
    due: "Today",
    completed: false,
  },
  {
    id: 2,
    title: "Read 20 Pages",
    category: "Personal",
    priority: "Medium",
    due: "Today",
    completed: false,
  },
];

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : defaultTasks;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }, [tasks]);

  function addTask(task) {
    setTasks((prev) => [
      ...prev,
      {
        id: Date.now(),
        completed: false,
        ...task,
      },
    ]);
  }

  function toggleTask(id) {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  }

  function deleteTask(id) {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  }

  function updateTask(id, updates) {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, ...updates } : task
      )
    );
  }

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.completed).length,
    pending: tasks.filter((t) => !t.completed).length,
  };

  return (
    <TaskContext.Provider
      value={{
        tasks,
        stats,
        addTask,
        toggleTask,
        deleteTask,
        updateTask,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  return useContext(TaskContext);
}
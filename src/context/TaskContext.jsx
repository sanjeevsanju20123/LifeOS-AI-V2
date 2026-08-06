import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";
import * as taskService from "../services/tasks";

const TaskContext = createContext();

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState(() => {
    try {
      const loaded = taskService.loadTasks();
      return loaded.length ? loaded : [
        { id: 1, title: "Complete LifeOS Dashboard", category: "Work", priority: "High", due: "Today", completed: false },
        { id: 2, title: "Read 20 Pages", category: "Personal", priority: "Medium", due: "Today", completed: false },
      ];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      taskService.saveTasks(tasks);
    } catch (e) {
      console.error("TaskProvider save error", e);
    }
  }, [tasks]);

  function addTask(task) {
    const newTask = taskService.addTask(task);
    setTasks(taskService.loadTasks());
    return newTask;
  }

  function toggleTask(id) {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    taskService.updateTask(id, { completed: !task.completed });
    setTasks(taskService.loadTasks());
  }

  function deleteTaskById(id) {
    taskService.deleteTask(id);
    setTasks(taskService.loadTasks());
  }

  function updateTask(id, updates) {
    taskService.updateTask(id, updates);
    setTasks(taskService.loadTasks());
  }

  function clearAllTasks() {
    taskService.clearTasks();
    setTasks([]);
  }

  const stats = {
    total: tasks.length,
    completed: tasks.filter((t) => t.completed).length,
    pending: tasks.filter((t) => !t.completed).length,
  };

  return (
    <TaskContext.Provider value={{ tasks, stats, addTask, toggleTask, deleteTask: deleteTaskById, updateTask, clearAllTasks }}>
      {children}
    </TaskContext.Provider>
  );
}

export function useTasks() {
  return useContext(TaskContext);
}

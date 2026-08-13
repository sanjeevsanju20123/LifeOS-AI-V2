import React, {
  createContext,
  useContext,
  useState,
  useEffect,
} from "react";

import * as taskService from "../services/tasks";

import {
  recordTaskCompletion,
} from "../services/ai/learningEngine";

const TaskContext = createContext(null);

export function TaskProvider({ children }) {
  // =========================================
  // LOAD TASKS
  // =========================================

  const [tasks, setTasks] = useState(() => {
    try {
      // IMPORTANT:
      // If localStorage is empty, return [].
      // Do NOT recreate default tasks.
      return taskService.loadTasks();
    } catch (error) {
      console.error(
        "TaskProvider load error:",
        error
      );

      return [];
    }
  });

  // =========================================
  // SAVE TASKS
  // =========================================

  useEffect(() => {
    try {
      taskService.saveTasks(tasks);
    } catch (error) {
      console.error(
        "TaskProvider save error:",
        error
      );
    }
  }, [tasks]);

  // =========================================
  // ADD TASK
  // =========================================

  function addTask(task) {
    const newTask = {
      id: Date.now(),
      title: task.title || "New Task",
      category: task.category || "General",
      priority: task.priority || "Medium",
      due: task.due || "Today",
      completed: false,
      ...task,
    };

    setTasks((currentTasks) => [
      ...currentTasks,
      newTask,
    ]);

    return newTask;
  }

  // =========================================
  // TOGGLE TASK
  // =========================================

  function toggleTask(id) {
    const task = tasks.find(
      (item) => item.id === id
    );

    if (!task) {
      return;
    }

    const willComplete = !task.completed;

    setTasks((currentTasks) =>
      currentTasks.map((item) =>
        item.id === id
          ? {
              ...item,
              completed: willComplete,
            }
          : item
      )
    );

    // =========================================
    // ARES LEARNING
    // Record only when task becomes completed
    // =========================================

    if (willComplete) {
      try {
        recordTaskCompletion({
          title: task.title,
          category: task.category,
          priority: task.priority,
        });
      } catch (error) {
        console.error(
          "ARES task learning error:",
          error
        );
      }
    }
  }

  // =========================================
  // DELETE TASK
  // =========================================

  function deleteTaskById(id) {
    setTasks((currentTasks) =>
      currentTasks.filter(
        (task) => task.id !== id
      )
    );
  }

  // =========================================
  // UPDATE TASK
  // =========================================

  function updateTask(id, updates) {
    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === id
          ? {
              ...task,
              ...updates,
            }
          : task
      )
    );
  }

  // =========================================
  // CLEAR ALL TASKS
  // =========================================

  function clearAllTasks() {
    setTasks([]);
  }

  // =========================================
  // TASK STATS
  // =========================================

  const stats = {
    total: tasks.length,

    completed: tasks.filter(
      (task) => task.completed
    ).length,

    pending: tasks.filter(
      (task) => !task.completed
    ).length,
  };

  // =========================================
  // PROVIDER
  // =========================================

  return (
    <TaskContext.Provider
      value={{
        tasks,
        stats,

        addTask,
        toggleTask,

        deleteTask:
          deleteTaskById,

        updateTask,
        clearAllTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  );
}

// =========================================
// USE TASKS
// =========================================

export function useTasks() {
  const context =
    useContext(TaskContext);

  if (!context) {
    throw new Error(
      "useTasks must be used inside TaskProvider"
    );
  }

  return context;
}
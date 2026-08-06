// src/services/tasks.js
const STORAGE_KEY = "lifeos-tasks";

export function loadTasks() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error("loadTasks error", e);
    return [];
  }
}

export function saveTasks(tasks) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.error("saveTasks error", e);
  }
}

export function addTask(task) {
  const tasks = loadTasks();
  const newTask = { id: Date.now(), completed: false, ...task };
  const next = [...tasks, newTask];
  saveTasks(next);
  return newTask;
}

export function updateTask(id, updates) {
  const tasks = loadTasks();
  const next = tasks.map((t) => (t.id === id ? { ...t, ...updates } : t));
  saveTasks(next);
  return next.find((t) => t.id === id);
}

export function deleteTask(id) {
  const tasks = loadTasks();
  const next = tasks.filter((t) => t.id !== id);
  saveTasks(next);
}

export function clearTasks() {
  saveTasks([]);
}

export function exportTasks() {
  return loadTasks();
}

export function importTasks(tasksArray) {
  if (!Array.isArray(tasksArray)) return false;
  saveTasks(tasksArray);
  return true;
}

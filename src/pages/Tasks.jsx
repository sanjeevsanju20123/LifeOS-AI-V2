import { useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import "./Tasks.css";

function Tasks() {
  const [tasks, setTasks] = useLocalStorage("lifeos-tasks", [
  {
    id: 1,
    title: "Complete workout",
    priority: "High",
    done: false,
  },
  {
    id: 2,
    title: "Read 20 pages",
    priority: "Medium",
    done: false,
  },
]);

  const [newTask, setNewTask] = useState("");

  function addTask() {
    if (!newTask.trim()) return;

    const task = {
      id: Date.now(),
      title: newTask,
      priority: "Low",
      done: false,
    };

    setTasks([...tasks, task]);
    setNewTask("");
  }

  function toggleTask(id) {
    setTasks(
      tasks.map((task) =>
        task.id === id
          ? { ...task, done: !task.done }
          : task
      )
    );
  }

  function deleteTask(id) {
    setTasks(
      tasks.filter((task) => task.id !== id)
    );
  }

  return (
  <main className="container fade-up tasks-page">

    <h1>✅ Tasks</h1>

    <div className="task-input">
      <input
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        placeholder="Add a new task..."
      />

      <button onClick={addTask}>
        Add
      </button>
    </div>


    <div className="task-list">

      {tasks.map((task) => (
        <div className="task-card" key={task.id}>

          <input
            type="checkbox"
            checked={task.done}
            onChange={() => toggleTask(task.id)}
          />

          <span
            className={`task-title ${
              task.done ? "completed" : ""
            }`}
          >
            {task.title}
          </span>


          <span className="priority">
            {task.priority}
          </span>


          <button
            className="delete-btn"
            onClick={() => deleteTask(task.id)}
          >
            🗑️
          </button>

        </div>
      ))}

    </div>

  </main>
);
}

export default Tasks;
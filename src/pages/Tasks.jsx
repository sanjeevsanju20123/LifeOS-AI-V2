import { useState } from "react";
import { useTasks } from "../context/TaskContext";
import "./Tasks.css";

function Tasks() {
  const {
    tasks,
    stats,
    addTask,
    toggleTask,
    deleteTask,
  } = useTasks();

  const [newTask, setNewTask] = useState("");
  const [priority, setPriority] = useState("Medium");

  function handleAddTask() {
    if (!newTask.trim()) return;

    addTask({
      title: newTask.trim(),
      category: "General",
      priority: priority,
      due: "Today",
    });

    setNewTask("");
    setPriority("Medium");
  }

  function handleKeyDown(event) {
    if (event.key === "Enter") {
      handleAddTask();
    }
  }

  return (
    <main className="tasks-page">

      {/* HEADER */}
<div className="tasks-header">
  <div>
    <h1>✅ Tasks</h1>
  </div>

  <div className="task-stats">

    <div className="stat-card pending-card">
      <div className="stat-icon">⏳</div>

      <div className="stat-content">
        <span className="stat-value">
          {stats.pending}
        </span>

        <span className="stat-label">
          Pending
        </span>
      </div>
    </div>

    <div className="stat-card completed-card">
      <div className="stat-icon">✓</div>

      <div className="stat-content">
        <span className="stat-value">
          {stats.completed}
        </span>

        <span className="stat-label">
          Completed
        </span>
      </div>
    </div>

    <div className="stat-card total-card">
      <div className="stat-icon">📋</div>

      <div className="stat-content">
        <span className="stat-value">
          {stats.total}
        </span>

        <span className="stat-label">
          Tasks
        </span>
      </div>
    </div>

  </div>
</div>

      {/* ADD TASK */}
      <div className="task-input">

        <input
          type="text"
          value={newTask}
          onChange={(event) =>
            setNewTask(event.target.value)
          }
          onKeyDown={handleKeyDown}
          placeholder="Add a new task..."
        />

        {/* PRIORITY DROPDOWN */}
        <select
          value={priority}
          onChange={(event) =>
            setPriority(event.target.value)
          }
          className="priority-select"
        >
          <option value="High">High</option>
          <option value="Medium">Medium</option>
          <option value="Low">Low</option>
        </select>

        <button
          type="button"
          onClick={handleAddTask}
        >
          + Add Task
        </button>

      </div>

      {/* TASK LIST */}
      <div className="task-list">

        {tasks.length === 0 ? (
          <div className="no-tasks">

            <div className="no-tasks-icon">
              📝
            </div>

            <h3>No tasks yet</h3>

            <p>
              Add your first task above.
            </p>

          </div>
        ) : (
          tasks.map((task) => (
            <div
              className={`task-card ${
                task.completed
                  ? "completed"
                  : ""
              }`}
              key={task.id}
            >

              {/* CHECKBOX */}
              <button
                type="button"
                className={`task-check ${
                  task.completed
                    ? "checked"
                    : ""
                }`}
                onClick={() =>
                  toggleTask(task.id)
                }
                aria-label={
                  task.completed
                    ? "Mark task incomplete"
                    : "Mark task complete"
                }
              >
                {task.completed ? "✓" : ""}
              </button>

              {/* TASK INFO */}
              <div className="task-info">

                <span
                  className={`task-title ${
                    task.completed
                      ? "completed"
                      : ""
                  }`}
                >
                  {task.title}
                </span>

                <span className="task-meta">
                  {task.category || "General"}
                  {" • "}
                  {task.due || "Today"}
                </span>

              </div>

              {/* PRIORITY */}
              <span
                className={`priority ${
                  (
                    task.priority ||
                    "Medium"
                  ).toLowerCase()
                }`}
              >
                {task.priority || "Medium"}
              </span>

              {/* DELETE */}
              <button
                type="button"
                className="delete-btn"
                onClick={() =>
                  deleteTask(task.id)
                }
                aria-label="Delete task"
              >
                🗑️
              </button>

            </div>
          ))
        )}

      </div>

    </main>
  );
}

export default Tasks;
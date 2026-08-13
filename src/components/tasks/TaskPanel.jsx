import { useState } from "react";
import "./TaskPanel.css";
import { useTasks } from "../../context/TaskContext";

function TaskPanel() {
  const {
    tasks,
    stats,
    addTask,
    toggleTask,
  } = useTasks();

  const [newTask, setNewTask] = useState("");
  const [priority, setPriority] = useState("Medium");

  function handleAddTask() {
    if (!newTask.trim()) return;

    addTask({
      title: newTask.trim(),
      category: "General",
      priority,
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
    <section className="task-panel">

      {/* HEADER */}
      <div className="section-header">

        <h2>📋 Smart Tasks</h2>

        <div className="task-stats">

          <div className="task-stat pending">
            <strong>{stats.pending}</strong>
            <span>Pending</span>
          </div>

          <div className="task-stat completed">
            <strong>{stats.completed}</strong>
            <span>Completed</span>
          </div>

          <div className="task-stat total">
            <strong>{stats.total}</strong>
            <span>Tasks</span>
          </div>

        </div>

      </div>


      {/* ADD TASK */}
      <div className="task-input">

        <input
          type="text"
          value={newTask}
          onChange={(e) =>
            setNewTask(e.target.value)
          }
          onKeyDown={handleKeyDown}
          placeholder="Add a new task..."
        />

        <select
          value={priority}
          onChange={(e) =>
            setPriority(e.target.value)
          }
          className={`priority-select ${priority.toLowerCase()}`}
        >
          <option value="High">
            High
          </option>

          <option value="Medium">
            Medium
          </option>

          <option value="Low">
            Low
          </option>
        </select>

        <button
          type="button"
          onClick={handleAddTask}
        >
          + Add Task
        </button>

      </div>


      {/* TASK LIST */}
      <div className="tasks-list">

        {tasks.length === 0 ? (
          <div className="empty-tasks">
            📝 No tasks yet
          </div>
        ) : (
          tasks.map((task) => (

            <div
              className={`task-item ${
                task.completed
                  ? "completed"
                  : ""
              }`}
              key={task.id}
            >

              {/* CHECK */}
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
              >
                {task.completed
                  ? "✓"
                  : ""}
              </button>


              {/* INFO */}
              <div className="task-info">

                <h3>
                  {task.title}
                </h3>

                <p>
                  {task.category ||
                    "General"}
                  {" • "}
                  {task.due ||
                    "Today"}
                </p>

              </div>


              {/* PRIORITY */}
              <div
                className={`priority ${
                  (
                    task.priority ||
                    "Medium"
                  ).toLowerCase()
                }`}
              >
                {task.priority ||
                  "Medium"}
              </div>

            </div>

          ))
        )}

      </div>

    </section>
  );
}

export default TaskPanel;
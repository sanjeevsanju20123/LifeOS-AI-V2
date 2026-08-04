import { useState } from "react";
import "./TaskPanel.css";

function TaskPanel() {
  const [tasks, setTasks] = useState([
    {
      id: 1,
      title: "Complete LifeOS AI Dashboard",
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
    {
      id: 3,
      title: "Workout Session",
      category: "Health",
      priority: "Low",
      due: "6:00 PM",
      completed: false,
    },
  ]);

  const [newTask, setNewTask] = useState("");

  function addTask() {
    if (!newTask.trim()) return;

    const task = {
      id: Date.now(),
      title: newTask,
      category: "General",
      priority: "Medium",
      due: "Today",
      completed: false,
    };

    setTasks([...tasks, task]);
    setNewTask("");
  }

  function toggleTask(id) {
    setTasks(
      tasks.map((task) =>
        task.id === id
          ? { ...task, completed: !task.completed }
          : task
      )
    );
  }

  return (
    <section className="task-panel">
      <div className="section-header">
        <h2>📋 Smart Tasks</h2>
        <span>{tasks.length} Tasks</span>
      </div>

      <div className="task-input">
        <input
          type="text"
          placeholder="Add a new task..."
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
        />

        <button onClick={addTask}>
          + Add
        </button>
      </div>

      <div className="tasks-list">
        {tasks.map((task) => (
          <div className="task-item" key={task.id}>

            <div
              className="task-check"
              onClick={() => toggleTask(task.id)}
            >
              {task.completed ? "✓" : ""}
            </div>

            <div className="task-info">
              <h3>{task.title}</h3>

              <p>
                {task.category} • {task.due}
              </p>
            </div>

            <div
              className={`priority ${task.priority.toLowerCase()}`}
            >
              {task.priority}
            </div>

          </div>
        ))}
      </div>
    </section>
  );
}

export default TaskPanel;
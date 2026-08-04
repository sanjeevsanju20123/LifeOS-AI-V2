import { useState } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import "./Goals.css";

function Goals() {

  const [goals, setGoals] = useLocalStorage("lifeos-goals", [
    {
      id: 1,
      title: "Learn AI Development",
      progress: 30,
      completed: false,
    },
  ]);

  const [newGoal, setNewGoal] = useState("");


  function addGoal() {
    if (!newGoal.trim()) return;

    const goal = {
      id: Date.now(),
      title: newGoal,
      progress: 0,
      completed: false,
    };

    setGoals([...goals, goal]);
    setNewGoal("");
  }


  function updateProgress(id) {
    setGoals(
      goals.map((goal) =>
        goal.id === id
          ? {
              ...goal,
              progress:
                goal.progress >= 100
                  ? 0
                  : goal.progress + 10,
              completed:
                goal.progress + 10 >= 100,
            }
          : goal
      )
    );
  }


  function deleteGoal(id) {
    setGoals(
      goals.filter((goal) => goal.id !== id)
    );
  }


  return (
  <main className="container fade-up goals-page">
    <h1>🎯 Goals</h1>

    <div className="goal-input">
      <input
        value={newGoal}
        onChange={(e) => setNewGoal(e.target.value)}
        placeholder="Add a new goal..."
      />

      <button onClick={addGoal}>
        Add Goal
      </button>
    </div>

    <div className="goal-list">
      {goals.map((goal) => (
        <div
          key={goal.id}
          className={`goal-card ${
            goal.completed ? "completed-goal" : ""
          }`}
        >
          <h2>{goal.title}</h2>

          <p>Progress: {goal.progress}%</p>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${goal.progress}%` }}
            ></div>
          </div>

          <div className="goal-actions">
            <button onClick={() => updateProgress(goal.id)}>
              +10%
            </button>

            <button onClick={() => deleteGoal(goal.id)}>
              🗑 Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  </main>
);
}

export default Goals;
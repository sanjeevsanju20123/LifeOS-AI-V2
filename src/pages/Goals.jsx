import { useState } from "react";
import useGoals from "../hooks/useGoals";
import "./Goals.css";


function Goals() {

  const {
    goals,
    setGoals,
    totalGoals,
    completedGoals,
    averageProgress,
    updateGoalProgress,
  } = useGoals();


  const [
    newGoal,
    setNewGoal,
  ] = useState("");


  // =========================================
  // ADD GOAL
  // =========================================

  function addGoal() {

    if (!newGoal.trim()) return;


    const goal = {
      id: Date.now(),

      title:
        newGoal.trim(),

      progress: 0,

      completed: false,

      priority: "medium",
    };


    setGoals([
      ...goals,
      goal,
    ]);


    setNewGoal("");

  }


  // =========================================
  // UPDATE PRIORITY
  // =========================================

  function updatePriority(
    id,
    priority
  ) {

    setGoals(

      goals.map((goal) =>

        goal.id === id

          ? {
              ...goal,
              priority,
            }

          : goal

      )

    );

  }


  // =========================================
  // DELETE GOAL
  // =========================================

  function deleteGoal(id) {

    setGoals(

      goals.filter(
        (goal) =>
          goal.id !== id
      )

    );

  }


  return (

    <main className="goals-page">

      {/* =========================================
          HEADER
      ========================================= */}

      <div className="goals-header">

        <div>

          <span className="goals-label">
            🎯 LIFEOS GOALS
          </span>


          <h1>
            Goals & Progress
          </h1>


          <p>
            Turn your long-term ambitions
            into measurable progress.
          </p>

        </div>

      </div>


      {/* =========================================
          STATS
      ========================================= */}

      <div className="goals-stats">

        <div className="goal-stat-card">

          <span>
            🎯
          </span>


          <div>

            <p>
              Total Goals
            </p>

            <strong>
              {totalGoals}
            </strong>

          </div>

        </div>


        <div className="goal-stat-card">

          <span>
            ✅
          </span>


          <div>

            <p>
              Completed
            </p>

            <strong>
              {completedGoals}
            </strong>

          </div>

        </div>


        <div className="goal-stat-card">

          <span>
            📊
          </span>


          <div>

            <p>
              Average Progress
            </p>

            <strong>
              {averageProgress}%
            </strong>

          </div>

        </div>

      </div>


      {/* =========================================
          CREATE GOAL
      ========================================= */}

      <section className="goal-create">

        <div>

          <h2>
            Create a Goal
          </h2>


          <p>
            What do you want to accomplish?
          </p>

        </div>


        <div className="goal-input">

          <input
            value={newGoal}

            onChange={(e) =>
              setNewGoal(
                e.target.value
              )
            }

            onKeyDown={(e) => {

              if (
                e.key === "Enter"
              ) {
                addGoal();
              }

            }}

            placeholder="e.g. Build my AI project..."
          />


          <button
            type="button"
            onClick={addGoal}
          >
            + Add Goal
          </button>

        </div>

      </section>


      {/* =========================================
          GOALS
      ========================================= */}

      <section className="goals-section">

        <div className="goals-section-header">

          <h2>
            Your Goals
          </h2>


          <span>

            {totalGoals}{" "}

            {totalGoals === 1
              ? "goal"
              : "goals"}

          </span>

        </div>


        {goals.length === 0 ? (

          <div className="empty-goals">

            <div>
              🎯
            </div>


            <h3>
              No goals yet
            </h3>


            <p>
              Add your first goal above
              and start building momentum.
            </p>

          </div>

        ) : (

          <div className="goal-list">

            {goals.map((goal) => (

              <article
                key={goal.id}

                className={`goal-card ${
                  goal.completed
                    ? "completed-goal"
                    : ""
                }`}
              >

                {/* =========================================
                    TOP
                ========================================= */}

                <div className="goal-card-top">

                  <div>

                    <span className="goal-icon">

                      {goal.completed
                        ? "✅"
                        : "🎯"}

                    </span>


                    <h2>
                      {goal.title}
                    </h2>

                  </div>


                  <strong>
                    {goal.progress}%
                  </strong>

                </div>


                {/* =========================================
                    PRIORITY
                ========================================= */}

                <div className="goal-priority">

                  <span>
                    Priority
                  </span>


                  <select
                    value={
                      goal.priority ||
                      "medium"
                    }

                    onChange={(e) =>
                      updatePriority(
                        goal.id,
                        e.target.value
                      )
                    }

                    aria-label={`Priority for ${goal.title}`}
                  >

                    <option value="high">
                      🔴 High
                    </option>

                    <option value="medium">
                      🟡 Medium
                    </option>

                    <option value="low">
                      🟢 Low
                    </option>

                  </select>

                </div>


                {/* =========================================
                    PROGRESS INFO
                ========================================= */}

                <div className="goal-progress-info">

                  <span>
                    Progress
                  </span>


                  <span>

                    {goal.completed

                      ? "Completed"

                      : `${100 -
                          goal.progress}% remaining`}

                  </span>

                </div>


                {/* =========================================
                    PROGRESS BAR
                ========================================= */}

                <div className="progress-bar">

                  <div
                    className="progress-fill"

                    style={{
                      width:
                        `${goal.progress}%`,
                    }}
                  />

                </div>


                {/* =========================================
                    ACTIONS
                ========================================= */}

                <div className="goal-actions">

                  <button
                    type="button"

                    onClick={() =>
                      updateGoalProgress(
                        goal.id
                      )
                    }

                    disabled={
                      goal.completed
                    }
                  >

                    {goal.completed
                      ? "✓ Completed"
                      : "+10% Progress"}

                  </button>


                  <button
                    type="button"

                    className="delete-goal"

                    onClick={() =>
                      deleteGoal(
                        goal.id
                      )
                    }
                  >
                    🗑 Delete
                  </button>

                </div>

              </article>

            ))}

          </div>

        )}

      </section>

    </main>

  );

}


export default Goals;
import useLocalStorage from "./useLocalStorage";

import {
  recordGoalProgress,
  recordGoalCompletion,
} from "../services/ai/learningEngine";


function useGoals() {

  const [
    goals,
    setGoals,
  ] = useLocalStorage(
    "lifeos-goals",
    []
  );


  // =========================================
  // GOAL STATS
  // =========================================

  const totalGoals =
    goals.length;


  const completedGoals =
    goals.filter(
      (goal) =>
        goal.completed
    ).length;


  const activeGoals =
    goals.filter(
      (goal) =>
        !goal.completed
    );


  const averageProgress =
    totalGoals > 0

      ? Math.round(
          goals.reduce(
            (sum, goal) =>
              sum +
              (goal.progress || 0),

            0
          ) / totalGoals
        )

      : 0;


  // =========================================
  // UPDATE GOAL PROGRESS
  // =========================================

  function updateGoalProgress(
    id,
    amount = 10
  ) {

    setGoals(
      goals.map((goal) => {

        if (goal.id !== id) {
          return goal;
        }


        const oldProgress =
          goal.progress || 0;


        const newProgress =
          Math.min(
            100,
            oldProgress +
              amount
          );


        const completed =
          newProgress >= 100;


        // =========================================
        // ARES LEARNING
        // =========================================

        recordGoalProgress({
          title: goal.title,

          priority:
            goal.priority ||
            "medium",

          previousProgress:
            oldProgress,

          progress:
            newProgress,

          completed,
        });


        if (
          completed &&
          !goal.completed
        ) {

          recordGoalCompletion({
            title:
              goal.title,

            priority:
              goal.priority ||
              "medium",
          });

        }


        return {
          ...goal,

          progress:
            newProgress,

          completed,
        };

      })
    );

  }


  // =========================================
  // RETURN
  // =========================================

  return {

    goals,

    setGoals,

    totalGoals,

    completedGoals,

    activeGoals,

    averageProgress,

    updateGoalProgress,

  };

}


export default useGoals;
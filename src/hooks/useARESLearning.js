import { useEffect, useState } from "react";
import {
  getBestInsight,
  getLearningData,
} from "../services/ai/learningEngine";

function useARESLearning() {
  const [learningData, setLearningData] = useState(() =>
    getLearningData()
  );

  const [insight, setInsight] = useState(() =>
    getBestInsight()
  );

  useEffect(() => {
    function refreshLearning() {
      setLearningData(getLearningData());
      setInsight(getBestInsight());
    }

    window.addEventListener(
      "ares-learning-updated",
      refreshLearning
    );

    return () => {
      window.removeEventListener(
        "ares-learning-updated",
        refreshLearning
      );
    };
  }, []);

  return {
    learningData,
    insight,
  };
}

export default useARESLearning;
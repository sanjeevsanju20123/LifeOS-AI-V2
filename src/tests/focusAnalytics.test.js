import { describe, it, expect } from "vitest";

import {
  sumMinutes,
  sumSessions,
  focusScore,
  bestDay,
} from "../services/focusAnalytics";


describe("Focus Analytics calculations", () => {

  const history = [
    {
      date: "2026-08-01",
      sessions: 2,
      minutes: 50,
    },
    {
      date: "2026-08-02",
      sessions: 1,
      minutes: 25,
    },
  ];


  it("calculates total focus minutes", () => {
    expect(sumMinutes(history)).toBe(75);
  });


  it("calculates total focus sessions", () => {
    expect(sumSessions(history)).toBe(3);
  });


  it("calculates focus score", () => {
    expect(focusScore(history, 30)).toBe(36);
  });


  it("finds best focus day", () => {
    const result = bestDay(history);

    expect(result.minutes).toBe(50);
    expect(result.date).toBe("2026-08-01");
  });

});
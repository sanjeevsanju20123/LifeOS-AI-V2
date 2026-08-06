import React from 'react';
import { test, expect } from "vitest";
import { render, screen } from '@testing-library/react';
import StatsGrid from '../components/dashboard/StatsGrid';
import { FocusProvider } from '../context/FocusContext';
import { TaskProvider } from '../context/TaskContext';

test('StatsGrid renders inside providers', () => {
  render(
    <FocusProvider>
      <TaskProvider>
        <StatsGrid />
      </TaskProvider>
    </FocusProvider>
  );
  // check that at least one stat label exists (adjust selector if your StatsGrid uses specific text)
  expect(screen.getByText("Sessions")).toBeInTheDocument();
expect(screen.getByText("Day Streak")).toBeInTheDocument();
});
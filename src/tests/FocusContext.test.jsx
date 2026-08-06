import React from 'react';
import { test, expect } from "vitest";
import { render, screen } from '@testing-library/react';
import { FocusProvider, useFocus } from '../context/FocusContext';

function Consumer() {
  const { weeklyHistory } = useFocus();
  return <div data-testid="wh">{Array.isArray(weeklyHistory) ? weeklyHistory.length : 0}</div>;
}

test('FocusProvider provides weeklyHistory array', () => {
  render(
    <FocusProvider>
      <Consumer />
    </FocusProvider>
  );
  expect(screen.getByTestId('wh')).toBeInTheDocument();
});
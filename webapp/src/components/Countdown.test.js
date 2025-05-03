import React, { createRef } from 'react';
import { render, screen, act } from '@testing-library/react';
import Countdown from './Countdown';
import { loadConfig } from '../utils/config';

// Mock explícito del config
jest.mock('../utils/config', () => ({
  loadConfig: jest.fn(),
  defaultConfig: {
    timerSettings: {
      easy: 120,
      medium: 30,
      hard: 8,
    },
  }
}));

jest.useFakeTimers();

describe('Countdown Component', () => {
  beforeEach(() => {
    loadConfig.mockReturnValue({
      timerSettings: {
        easy: 120,
        medium: 30,
        hard: 8,
      },
    });
  });

  test('renders with correct initial time for "facil"', () => {
    render(<Countdown timerLevel="facil" onCountdownFinish={() => {}} />);
    expect(screen.getByText('120')).toBeInTheDocument();
  });

  test('calls onCountdownFinish when countdown ends', () => {
    const mockFinish = jest.fn();

    render(<Countdown timerLevel={3} onCountdownFinish={mockFinish} />);

    // Avanza 3 segundos
    act(() => {
      jest.advanceTimersByTime(3000);
    });

    expect(mockFinish).toHaveBeenCalledTimes(1);
  });

  test('exposes getCurrentTime and getTimeLeft via ref', () => {
    const ref = createRef();
    render(<Countdown ref={ref} timerLevel={10} onCountdownFinish={() => {}} />);

    act(() => {
      jest.advanceTimersByTime(4000);
    });

    expect(ref.current.getCurrentTime()).toBe(4);
    expect(ref.current.getTimeLeft()).toBe(6);
  });

  test('changes circle color to red when time is critical (<=10)', () => {
    render(<Countdown timerLevel={10} onCountdownFinish={() => {}} />);
  
    act(() => {
      jest.advanceTimersByTime(5000);
    });
  
    const circles = document.querySelectorAll('circle');
    expect(circles.length).toBeGreaterThan(1);
  
    const animatedCircle = circles[1]; // segundo círculo (el que cambia de color)
  
    expect(animatedCircle.getAttribute('stroke')).toBe('red');
  });
  

  test('defaults to "medio" config if unknown level is passed', () => {
    render(<Countdown timerLevel="inexistente" onCountdownFinish={() => {}} />);
    expect(screen.getByText('30')).toBeInTheDocument(); // Medio por defecto
  });
});

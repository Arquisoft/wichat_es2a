import React, { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import { act } from 'react';
import Score from './Score';

describe('Score Component', () => {
  let scoreRef;

  beforeEach(() => {
    scoreRef = createRef();
    render(
      <Score
        currentQuestion={3}
        scoreLevel="medio"
        answered={2}
        trues={1}
        falses={1}
        ref={scoreRef}
      />
    );
  });

  test('renders labels and score values', () => {
    expect(screen.getByText(/Marcador/i)).toBeInTheDocument();
    expect(screen.getByText(/Pregunta: 3\/10/i)).toBeInTheDocument();
    expect(screen.getByText(/Respondidas: 2/i)).toBeInTheDocument();
    expect(screen.getByText(/Aciertos: 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Fallos: 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Puntos: 0/i)).toBeInTheDocument();
  });

  test('calculateNewScore adds correct points for correct answer (medio)', () => {
    let prevScore;
    act(() => {
      prevScore = scoreRef.current.getTotalScore();
      scoreRef.current.calculateNewScore(2, true, true); // 500 - 20 = 480
    });
    expect(scoreRef.current.getTotalScore()).toBeGreaterThan(prevScore);
  });

  test('calculateNewScore adds correct penalty for incorrect answer (medio)', () => {
    act(() => {
      scoreRef.current.calculateNewScore(5, true, false); // -200
    });
    expect(scoreRef.current.getTotalScore()).toBeLessThan(0);
  });

  test('no score added if isAnswer is false', () => {
    let prevScore;
    act(() => {
      prevScore = scoreRef.current.getTotalScore();
      scoreRef.current.calculateNewScore(5, false, true);
    });
    expect(scoreRef.current.getTotalScore()).toBe(prevScore);
  });

  test.each([
    ['facil', 300, -100],
    ['medio', 500, -200],
    ['dificil', 700, -300]
  ])('handles scoreLevel %s correctly', (level, truePts, falsePts) => {
    const localRef = createRef();

    render(
      <Score
        currentQuestion={1}
        scoreLevel={level}
        answered={0}
        trues={0}
        falses={0}
        ref={localRef}
      />
    );

    act(() => {
      localRef.current.calculateNewScore(0, true, true);   // +truePts
      localRef.current.calculateNewScore(0, true, false);  // +falsePts
    });

    const total = localRef.current.getTotalScore();
    expect(total).toBe(truePts + falsePts);
  });
});


import React from 'react';
import { render, screen } from '@testing-library/react';
import GameHistoryTable from './GameHistoryTable';
import { createTheme } from '@mui/material/styles';

const mockTheme = createTheme({
  palette: {
    primary: { main: '#123456' },
  },
});

const data = [
  {
    category: 'Arte',
    level: 'Fácil',
    totalQuestions: 10,
    answered: 10,
    correct: 7,
    wrong: 3,
    points: 70,
    duration: 60,
    createdAt: '01/05/2025 12:00:00',
  },
  {
    category: 'Ciencia',
    level: 'Difícil',
    totalQuestions: 10,
    answered: 8,
    correct: 5,
    wrong: 3,
    points: 50,
    duration: 80,
    createdAt: '02/05/2025 13:00:00',
  },
];

describe('GameHistoryTable', () => {
  it('renders all columns and values', () => {
    render(<GameHistoryTable gameHistory={data} theme={mockTheme} />);
    [
      'Preguntas totales',
      'Preguntas respondidas',
      'Categoria',
      'Nivel',
      'Correctas',
      'Erróneas',
      'Puntuacion',
      'Duración (segundos)',
      'Fecha',
    ].forEach(label => {
      expect(screen.getByText(label)).toBeInTheDocument();
    });
    data.forEach(row => {
      Object.values(row).forEach(val => {
        expect(screen.getAllByText(String(val)).length).toBeGreaterThan(0);
      });
    });
  });

  it('renders empty state if no data', () => {
    render(<GameHistoryTable gameHistory={[]} theme={mockTheme} />);
    expect(screen.getByText(/No hay partidas registradas/i)).toBeInTheDocument();
  });

  it('handles null/undefined values gracefully', () => {
    const incomplete = [{ ...data[0], correct: null, wrong: undefined }];
    render(<GameHistoryTable gameHistory={incomplete} theme={mockTheme} />);
    expect(screen.getAllByText('Arte').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Fácil').length).toBeGreaterThan(0);
    expect(screen.getAllByText('10').length).toBeGreaterThan(0);
    // Should render empty cell for null/undefined
    const cells = screen.getAllByRole('cell');
    expect(cells.some(cell => cell.textContent === '')).toBe(true);
  });
});


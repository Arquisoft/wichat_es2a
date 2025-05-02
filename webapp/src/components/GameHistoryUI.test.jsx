import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import GameHistoryUI from './GameHistoryUI';

jest.mock('axios');

const mockGameHistory = [
  {
    totalQuestions: 10,
    answered: 10,
    category: 'Arte',
    level: 'Fácil',
    correct: 7,
    wrong: 3,
    points: 70,
    duration: 60,
    createdAt: '01/05/2025 12:00:00',
  },
  {
    totalQuestions: 10,
    answered: 8,
    category: 'Ciencia',
    level: 'Difícil',
    correct: 5,
    wrong: 3,
    points: 50,
    duration: 80,
    createdAt: '02/05/2025 13:00:00',
  },
];

describe('GameHistoryUI', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    window.localStorage.setItem('user', JSON.stringify({ token: btoa(JSON.stringify({ userId: '507f1f77bcf86cd799439011' })) }));
  });

  it('renders loading state', () => {
    render(<GameHistoryUI />);
    expect(screen.getByText(/Cargando historial de partidas/i)).toBeInTheDocument();
  });

  it('renders game history table with data', async () => {
    axios.get.mockResolvedValueOnce({ data: mockGameHistory });
    render(<GameHistoryUI />);
    await waitFor(() => {
      expect(screen.getByText('Historial de Partidas')).toBeInTheDocument();
      expect(screen.getByText('Arte')).toBeInTheDocument();
      expect(screen.getByText('Ciencia')).toBeInTheDocument();
      expect(screen.getAllByText('10').length).toBeGreaterThan(0); 
      expect(screen.getByText('Fácil')).toBeInTheDocument();
      expect(screen.getByText('Difícil')).toBeInTheDocument();
      expect(screen.getByText('70')).toBeInTheDocument(); 
      expect(screen.getByText('50')).toBeInTheDocument(); 
      expect(screen.getByText('01/05/2025 12:00:00')).toBeInTheDocument();
      expect(screen.getByText('02/05/2025 13:00:00')).toBeInTheDocument();
    });
  });

  it('renders empty state if no games', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    render(<GameHistoryUI />);
    await waitFor(() => {
      expect(screen.getByText('No hay partidas registradas aún.')).toBeInTheDocument();
    });
  });

  it('renders error state', async () => {
    axios.get.mockRejectedValueOnce(new Error('fail'));
    render(<GameHistoryUI />);
    await waitFor(() => {
      expect(screen.getByText(/No se pudo cargar el historial/i)).toBeInTheDocument();
    });
  });

  it('renders all columns and values for each game', async () => {
    axios.get.mockResolvedValueOnce({ data: mockGameHistory });
    render(<GameHistoryUI />);
    await waitFor(() => {
      expect(screen.getByText('Preguntas totales')).toBeInTheDocument();
      expect(screen.getByText('Preguntas respondidas')).toBeInTheDocument();
      expect(screen.getByText('Categoria')).toBeInTheDocument();
      expect(screen.getByText('Nivel')).toBeInTheDocument();
      expect(screen.getByText('Correctas')).toBeInTheDocument();
      expect(screen.getByText('Erróneas')).toBeInTheDocument();
      expect(screen.getByText('Puntuacion')).toBeInTheDocument();
      expect(screen.getByText('Duración (segundos)')).toBeInTheDocument();
      expect(screen.getByText('Fecha')).toBeInTheDocument();

      expect(screen.getAllByText('10').length).toBeGreaterThan(1); 
      expect(screen.getByText('Arte')).toBeInTheDocument();
      expect(screen.getByText('Fácil')).toBeInTheDocument();
      expect(screen.getByText('7')).toBeInTheDocument();
      expect(screen.getAllByText('3').length).toBeGreaterThan(1); 
      expect(screen.getByText('70')).toBeInTheDocument();
      expect(screen.getByText('60')).toBeInTheDocument();
      expect(screen.getByText('01/05/2025 12:00:00')).toBeInTheDocument();

      expect(screen.getByText('Ciencia')).toBeInTheDocument();
      expect(screen.getByText('Difícil')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('50')).toBeInTheDocument();
      expect(screen.getByText('80')).toBeInTheDocument();
      expect(screen.getByText('02/05/2025 13:00:00')).toBeInTheDocument();
    });
  });

  it('renders alternating row colors', async () => {
    axios.get.mockResolvedValueOnce({ data: mockGameHistory });
    const { container } = render(<GameHistoryUI />);
    await waitFor(() => {
      const rows = container.querySelectorAll('tbody tr');
      expect(rows.length).toBe(2);
      expect(rows[0]).toHaveStyle('background-color: #e3f2fd');
      expect(rows[1]).toHaveStyle('background-color: #bbdefb');
    });
  });

  it('does not fetch if userId is null', async () => {
    window.localStorage.setItem('user', JSON.stringify({ token: btoa(JSON.stringify({})) }));
    render(<GameHistoryUI />);
    expect(screen.getByText(/Cargando historial de partidas/i)).toBeInTheDocument();
  });

  it('handles incomplete or corrupt data gracefully', async () => {
    const corruptData = [
      { }, 
      { totalQuestions: 5, correct: 2 }, 
    ];
    axios.get.mockResolvedValueOnce({ data: corruptData });
    render(<GameHistoryUI />);
    await waitFor(() => {
      
      expect(screen.getAllByRole('row').length).toBeGreaterThan(1);
    });
  });
});

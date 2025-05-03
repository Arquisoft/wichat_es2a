import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import GlobalRanking from './GlobalRanking';

jest.mock('axios');

describe('GlobalRanking Component', () => {
  const mockData = [
    {
      username: 'usuario1',
      totalQuestions: 10,
      answered: 8,
      category: 'Matemáticas',
      level: 'fácil',
      correct: 6,
      wrong: 2,
      points: 400,
      duration: 120,
      createdAt: '2024-01-01'
    },
    {
      username: 'usuario2',
      totalQuestions: 15,
      answered: 15,
      category: 'Historia',
      level: 'medio',
      correct: 10,
      wrong: 5,
      points: 600,
      duration: 200,
      createdAt: '2024-02-01'
    }
  ];

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('renders loading state initially', async () => {
    axios.get.mockImplementation(() => new Promise(() => {})); // No resuelve aún

    render(<GlobalRanking />);
    expect(screen.getByText(/Cargando el ranking/i)).toBeInTheDocument();
  });

  test('renders error message on API failure', async () => {
    axios.get.mockRejectedValue(new Error('API down'));

    render(<GlobalRanking />);
    await waitFor(() => {
      expect(screen.getByText(/No se pudo cargar el ranking/i)).toBeInTheDocument();
    });
  });

  test('renders empty state message if no data', async () => {
    axios.get.mockResolvedValue({ data: [] });

    render(<GlobalRanking />);
    await waitFor(() => {
      expect(screen.getByText(/No hay partidas registradas aún/i)).toBeInTheDocument();
    });
  });

  test('renders ranking table with data', async () => {
    axios.get.mockResolvedValue({ data: mockData });

    render(<GlobalRanking />);
    await waitFor(() => {
      expect(screen.getByText('usuario1')).toBeInTheDocument();
      expect(screen.getByText('usuario2')).toBeInTheDocument();
      expect(screen.getByText('Matemáticas')).toBeInTheDocument();
      expect(screen.getByText('Historia')).toBeInTheDocument();
      expect(screen.getByText('400')).toBeInTheDocument();
      expect(screen.getByText('600')).toBeInTheDocument();
    });
  });
});

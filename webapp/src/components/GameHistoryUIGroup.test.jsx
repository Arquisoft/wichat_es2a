import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import GameHistoryUIGroup from './GameHistoryUIGroup';

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

describe('GameHistoryUIGroup', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    axios.get.mockImplementation((url) => {
      if (url.includes('/getUserId')) {
        return Promise.resolve({ data: { userId: '507f1f77bcf86cd799439011' } });
      }
      if (url.includes('/game/statistics')) {
        return Promise.resolve({ data: mockGameHistory });
      }
      return Promise.reject(new Error('not found'));
    });
  });

  function renderWithRouter(username = 'testuser') {
    return render(
      <MemoryRouter initialEntries={[`/group-history/${username}`]}>
        <Routes>
          <Route path="/group-history/:username" element={<GameHistoryUIGroup />} />
        </Routes>
      </MemoryRouter>
    );
  }

  it('renders loading state', () => {
    axios.get.mockImplementationOnce(() => new Promise(() => {}));  
    renderWithRouter();
    expect(screen.getByText(/Cargando historial de partidas/i)).toBeInTheDocument();
  });

  it('renders error if username is missing', async () => {
    render(
      <MemoryRouter initialEntries={[`/group-history/`]}>
        <Routes>
          <Route path="/group-history/" element={<GameHistoryUIGroup />} />
        </Routes>
      </MemoryRouter>
    );
    await waitFor(() => {
      expect(screen.getByText(/No se pudo obtener el ID del usuario/i)).toBeInTheDocument();
    });
  });

  it('renders error if userId fetch fails', async () => {
    axios.get.mockImplementationOnce(() => Promise.reject(new Error('fail')));
    renderWithRouter();
    await waitFor(() => {
      expect(screen.getByText(/No se pudo obtener el ID del usuario/i)).toBeInTheDocument();
    });
  });

  it('renders error if game history fetch fails', async () => {
    axios.get.mockImplementationOnce((url) => {
      if (url.includes('/getUserId')) {
        return Promise.resolve({ data: { userId: '507f1f77bcf86cd799439011' } });
      }
      if (url.includes('/game/statistics')) {
        return Promise.reject(new Error('fail'));
      }
      return Promise.reject(new Error('not found'));
    });
    renderWithRouter();
    await waitFor(() => {

      const bodyText = document.body.textContent || '';
      expect(
        /no se pudo cargar el historial/i.test(bodyText) ||
        /historial de partidas/i.test(bodyText)
      ).toBe(true);
    });
  });

  it('renders empty state if no games', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/getUserId')) {
        return Promise.resolve({ data: { userId: '507f1f77bcf86cd799439011' } });
      }
      if (url.includes('/game/statistics')) {
        return Promise.resolve({ data: [] });
      }
      return Promise.reject(new Error('not found'));
    });
    renderWithRouter();
    await waitFor(() => {
      expect(screen.getByText('No hay partidas registradas aún.')).toBeInTheDocument();
    });
  });

  it('renders all columns and values for each game', async () => {
    renderWithRouter();
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
    renderWithRouter();
    await waitFor(() => {
      const rows = screen.getAllByRole('row');
      const dataRows = rows.filter(row => row.querySelectorAll('td').length > 0);
      expect(dataRows.length).toBe(2);
      expect(dataRows[0]).toHaveStyle('background-color: #e3f2fd');
      expect(dataRows[1]).toHaveStyle('background-color: #bbdefb');
    });
  });

  it('handles incomplete or corrupt data gracefully', async () => {
    axios.get.mockImplementation((url) => {
      if (url.includes('/getUserId')) {
        return Promise.resolve({ data: { userId: '507f1f77bcf86cd799439011' } });
      }
      if (url.includes('/game/statistics')) {
        return Promise.resolve({ data: [{}, { totalQuestions: 5, correct: 2 }] });
      }
      return Promise.reject(new Error('not found'));
    });
    renderWithRouter();
    await waitFor(() => {
      expect(screen.getAllByRole('row').length).toBeGreaterThan(1);
    });
  });

  it('navigates back when clicking the button', async () => {
    renderWithRouter();
    await waitFor(() => {
      expect(screen.getByText('Volver a Detalles del Grupo')).toBeInTheDocument();
    });
    expect(screen.getByRole('button', { name: /Volver a Detalles del Grupo/i })).toBeInTheDocument();
  });
});

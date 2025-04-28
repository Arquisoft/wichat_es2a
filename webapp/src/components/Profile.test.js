import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Profile from './Profile';

// Mock Pie chart to avoid canvas errors in jsdom
jest.mock('react-chartjs-2', () => ({ Pie: () => <div>MockPieChart</div> }));

describe('Profile component', () => {
  beforeEach(() => {
    jest.spyOn(window, 'fetch').mockImplementation((url) => {
      if (url.includes('/users/')) {
        return Promise.resolve({ json: () => Promise.resolve({ username: 'testuser', avatarOptions: {} }) });
      }
      if (url.includes('/game/statistics')) {
        return Promise.resolve({ json: () => Promise.resolve([{ correct: 2, wrong: 1 }]) });
      }
      return Promise.resolve({ json: () => Promise.resolve({}) });
    });
    window.localStorage.setItem('user', JSON.stringify({ token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0ZXN0aWQifQ.fake' }));
  });
  afterEach(() => {
    jest.restoreAllMocks();
    window.localStorage.clear();
  });

  it('renders loading and then user info', async () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );
    expect(screen.getByText(/Bienvenido\/a/i)).toBeInTheDocument();
    await waitFor(() => expect(screen.getByText('testuser', { exact: false })).toBeInTheDocument());
    expect(screen.getByText('Aquí puedes ver y editar tu perfil.')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Editar Perfil/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Cerrar Sesión/i })).toBeInTheDocument();
  });

  it('shows stats chart or fallback', async () => {
    render(
      <MemoryRouter>
        <Profile />
      </MemoryRouter>
    );
    await waitFor(() => expect(screen.getByText('MockPieChart')).toBeInTheDocument());
  });
});

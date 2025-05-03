import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, BrowserRouter } from 'react-router-dom';
import GamePanel from './GamePanel';

jest.mock('./ChatPanel', () => () => <div>MockChatPanel</div>);
jest.mock('./Score', () => () => <div>MockScore</div>);
jest.mock('./Countdown', () => () => <div>MockCountdown</div>);

// Mock useLocation to provide query params
jest.mock('react-router-dom', () => {
  const original = jest.requireActual('react-router-dom');
  return {
    ...original,
    useLocation: () => ({ search: '?category=Futbolistas&level=facil' }),
    useNavigate: () => jest.fn(),
  };
});

jest.mock('axios');

describe('GamePanel component', () => {
  it('renders loading state', () => {
    render(
      <MemoryRouter>
        <GamePanel />
      </MemoryRouter>
    );
    // Renderiza el loading
    expect(screen.getByText(/Cargando preguntas/i)).toBeInTheDocument();
  });
});


// Test: debe mostrar un mensaje de carga mientras se obtienen las preguntas
test('debe mostrar un mensaje de carga mientras se obtienen las preguntas', async () => {
  render(
    <BrowserRouter>
      <GamePanel />
    </BrowserRouter>
  );

  // Simulamos que la carga está en progreso
  expect(screen.getByText(/cargando/i)).toBeInTheDocument();  // Ajusta según lo que muestra tu app

  // Esperar un tiempo hasta que se carguen las preguntas
  await waitFor(() => expect(screen.getByText(/pregunta/i)).toBeInTheDocument());  // Ajusta este texto según lo que se muestra al cargar las preguntas
});

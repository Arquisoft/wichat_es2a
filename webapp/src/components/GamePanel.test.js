import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
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

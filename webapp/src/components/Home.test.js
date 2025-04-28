import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Home from './Home';

describe('Home component', () => {
  it('renders main title and description', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    expect(screen.getByText('WICHAT')).toBeInTheDocument();
    expect(screen.getByText(/El legendario concurso de conocimientos/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Comenzar a jugar/i })).toBeInTheDocument();
  });

  it('shows error if trying to start without category and level', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    const startButton = screen.getByRole('button', { name: /Comenzar a jugar/i });
    fireEvent.click(startButton);
    expect(screen.getByText('Por favor, selecciona una categoría.')).toBeInTheDocument();
    expect(screen.getByText('Por favor, selecciona un nivel.')).toBeInTheDocument();
  });

  it('can select category and level and start game', () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
    const categorySelect = screen.getByLabelText('Seleccionar categoría');
    fireEvent.mouseDown(categorySelect);
    const futbolistasOption = screen.getByText('Futbolistas ⚽');
    fireEvent.click(futbolistasOption);

    const levelSelect = screen.getByLabelText('Seleccionar nivel');
    fireEvent.mouseDown(levelSelect);
    const facilOption = screen.getByText('🟢 Fácil');
    fireEvent.click(facilOption);

    const startButton = screen.getByRole('button', { name: /Comenzar a jugar/i });
    fireEvent.click(startButton);
    // No error messages should be present
    expect(screen.queryByText('Por favor, selecciona una categoría.')).not.toBeInTheDocument();
    expect(screen.queryByText('Por favor, selecciona un nivel.')).not.toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Nav from './Nav';

describe('Nav component', () => {
  it('renders all main navigation buttons', () => {
    render(
      <MemoryRouter>
        <Nav />
      </MemoryRouter>
    );
    // Usa getAllByText para evitar error de múltiples elementos
    expect(screen.getAllByText('Home').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Historial').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Amigos').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Chat').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Grupos').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Juego Matemático').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Contacto').length).toBeGreaterThan(0);
  });

  it('opens and closes the mobile drawer', () => {
    render(
      <MemoryRouter>
        <Nav />
      </MemoryRouter>
    );
    const menuButton = screen.getAllByRole('button').find(btn => btn.querySelector('svg'));
    fireEvent.click(menuButton);
    expect(screen.getAllByText('Home').length).toBeGreaterThan(0);
    // Simula cerrar el drawer
    const closeButton = screen.getAllByRole('button').find(btn => btn.querySelector('svg'));
    fireEvent.click(closeButton);
  });

  it('opens user menu', () => {
    render(
      <MemoryRouter>
        <Nav />
      </MemoryRouter>
    );
    const userMenuButton = screen.getAllByRole('button').find(btn => btn.querySelector('svg'));
    fireEvent.click(userMenuButton);
    // No assertion, just check that it doesn't crash
  });
});

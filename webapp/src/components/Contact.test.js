import React from 'react';
import { render, screen } from '@testing-library/react';
import Contact from './Contact';
import '@testing-library/jest-dom';

describe('Contact Component', () => {
  test('renders main headings', () => {
    render(<Contact />);
    expect(screen.getByText(/Sobre Nosotros/i)).toBeInTheDocument();
    expect(screen.getByText(/Nuestro Equipo/i)).toBeInTheDocument();
  });

  test('renders all team members with name and role', () => {
    render(<Contact />);
    const teamNames = [
        'Natalia Blanco Agudín', 
        'David Covián Gómez', 
        'Marcos Llanos Vega', 
        'Darío Cristóbal González', 
        'Hugo Fernández Rodríguez', 
        'Hugo Prendes Menéndez'
    ];
    const roles = [
      'Desarrolladora Frontend',
      'Desarrollador Backend',
      'Desarrollador Frontend',
      'Diseñador Backend',
      'Diseñador LLM y despliegue',
      'Diseñador LLM',
    ];

    teamNames.forEach(name => {
      expect(screen.getByText(name)).toBeInTheDocument();
    });

    roles.forEach(role => {
      expect(screen.getByText(role)).toBeInTheDocument();
    });
  });

  test('renders email and github links for team members', () => {
    render(<Contact />);
    expect(screen.getAllByRole('link', { name: /@uniovi\.com/i }).length).toBe(6);
    expect(screen.getAllByRole('link', { name: /GitHub/i }).length).toBe(6);
  });

  test('renders avatar images', () => {
    render(<Contact />);
    const avatars = screen.getAllByRole('img');
    expect(avatars.length).toBe(6);
    avatars.forEach(img => {
      expect(img).toHaveAttribute('src');
    });
  });
});

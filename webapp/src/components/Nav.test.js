import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Nav from './Nav';
import { MemoryRouter, BrowserRouter } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';


// Mock navigate
const mockedUsedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockedUsedNavigate,
    Link: ({ to, children }) => <a href={to}>{children}</a>,
}));

// Mock logo SVG
jest.mock('../media/logoS.svg', () => ({
    ReactComponent: () => <div data-testid="logo" />,
}));

// Mock theme
jest.mock('@mui/material/styles', () => ({
    ...jest.requireActual('@mui/material/styles'),
    useTheme: () => ({
        palette: {
            primary: {
                main: '#000',
                contrastText: '#fff',
            },
        },
    }),
}));

const setup = () => {
    render(
        <BrowserRouter>
            <Nav />
        </BrowserRouter>
    );
};

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
      
    });
  });
  

test('opens and interacts with user menu', () => {
    setup();
    const userMenuButton = screen.getAllByRole('button').find(btn =>
        btn.querySelector('svg')
    );
    fireEvent.click(userMenuButton);
    const options = ['Perfil', 'Configuración', 'Cerrar Sesión'];
    options.forEach(option => {
        expect(screen.getByText(option)).toBeInTheDocument();
    });
});

test('navigates to profile and configuration, logs out', () => {
    setup();
    const userMenuButton = screen.getAllByRole('button').find(btn => btn.querySelector('svg'));
    fireEvent.click(userMenuButton);

    fireEvent.click(screen.getByText('Perfil'));
    expect(mockedUsedNavigate).toHaveBeenCalledWith('/profile');

    fireEvent.click(userMenuButton);
    fireEvent.click(screen.getByText('Configuración'));
    expect(mockedUsedNavigate).toHaveBeenCalledWith('/configuration');

    localStorage.setItem('user', 'dummy');
    fireEvent.click(userMenuButton);
    fireEvent.click(screen.getByText('Cerrar Sesión'));
    expect(localStorage.getItem('user')).toBeNull();
    expect(mockedUsedNavigate).toHaveBeenCalledWith('/login');
});

describe('Nav component', () => {
    test('renders logo and all page buttons', () => {
        setup();
        expect(screen.getAllByTestId('logo')[0]).toBeInTheDocument();

        const pageButtons = ['Home', 'Ranking', 'Historial', 'Amigos', 'Chat', 'Grupos', 'Juego Matemático', 'Contacto'];
        pageButtons.forEach(label => {
            expect(screen.getAllByText(label).length).toBeGreaterThan(0);
        });
    });

    test('opens mobile menu drawer on mobile menu button click', () => {
        setup();
        const menuButtons = screen.getAllByRole('button');
        const menuIconButton = menuButtons.find(btn =>
            btn.querySelector('svg')?.getAttribute('data-testid') === 'MenuIcon'
        );

        fireEvent.click(menuIconButton);
        expect(screen.getAllByText('Home').length).toBeGreaterThan(0);
    });
});

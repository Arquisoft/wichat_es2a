import { render, screen } from '@testing-library/react';
import App from './App';

beforeEach(() => {
  // Reset localStorage mock antes de cada test
  Storage.prototype.getItem = jest.fn();
});

test('muestra la pantalla de login en /login', () => {
  window.history.pushState({}, 'Login page', '/login');
  render(<App />);
  expect(screen.getByText(/Log in to your account/i)).toBeInTheDocument();
});

test('redirige al login si se accede a una ruta desconocida', () => {
  window.history.pushState({}, 'Ruta desconocida', '/ruta-inexistente');
  render(<App />);
  expect(screen.getByText(/Log in to your account/i)).toBeInTheDocument();
});

test('muestra AddUser en la ruta /adduser', () => {
  window.history.pushState({}, 'Add User page', '/adduser');
  render(<App />);
  expect(screen.getByText(/Create your account/i)).toBeInTheDocument(); // Ajusta el texto real
});

test('muestra Contact en la ruta /contact', () => {
  window.history.pushState({}, 'Contact page', '/contact');
  render(<App />);
  expect(screen.getByText(/Sobre Nosotros/i)).toBeInTheDocument(); // Ajusta el texto real
});

test('redirige a login si accedo a /home sin estar autenticado', () => {
  window.history.pushState({}, 'Home', '/home');
  localStorage.getItem.mockReturnValue(null); // No autenticado
  render(<App />);
  expect(screen.getByText(/Log in to your account/i)).toBeInTheDocument();
});

test('muestra Home si el usuario está autenticado', () => {
  window.history.pushState({}, 'Home', '/home');
  localStorage.getItem.mockReturnValue(JSON.stringify({ token: '1234' }));
  render(<App />);
  expect(screen.getByText(/WICHAT/i)).toBeInTheDocument();
});

test('muestra ranking si el usuario está autenticado', () => {
  window.history.pushState({}, 'Global Ranking', '/ranking');
  localStorage.getItem.mockReturnValue(JSON.stringify({ token: '1234' }));
  render(<App />);
  expect(screen.getByRole('heading', { name: /ranking/i })).toBeInTheDocument();
});

test('muestra el historial si el usuario está autenticado', () => {
  window.history.pushState({}, 'Historial', '/history');
  localStorage.getItem.mockReturnValue(JSON.stringify({ token: '1234' }));
  render(<App />);
  expect(screen.getByRole('heading', { name: /Historial de Partidas/i })).toBeInTheDocument();

});

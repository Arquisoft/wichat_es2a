import React from 'react';
import { render, fireEvent, screen, waitFor, act } from '@testing-library/react';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { MemoryRouter } from 'react-router-dom';

// Mock global de useNavigate antes de importar el componente
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

import Login from './Login';
import { red } from '@mui/material/colors';

const mockAxios = new MockAdapter(axios);

// Funcion para utilidad para renderizar el login
const renderLoginComponent = () => {
  return render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  );
};

// Función de utilidad para simular el login
const simulateLogin = async (username, password) => {
  const usernameInput = screen.getByLabelText(/Username/i);
  const passwordInput = screen.getByLabelText(/Password/i);
  const loginButton = screen.getByRole('button', { name: /Login/i });

  fireEvent.change(usernameInput, { target: { value: username } });
  fireEvent.change(passwordInput, { target: { value: password } });
  fireEvent.click(loginButton);

  await waitFor(() => {
    expect(localStorage.getItem('user')).not.toBeNull();
  });
};

describe('Login component', () => {
  beforeEach(() => {
    mockAxios.reset();
    mockNavigate.mockReset();
  });

  // Prueba 1: Verifica el login exitoso
  it('Test 1: should log in successfully', async () => {
    renderLoginComponent();

    // Mock the axios.post request to simulate a successful response
    mockAxios.onPost('http://localhost:8000/login').reply(200, { createdAt: '2024-01-01T12:34:56Z' });
    mockAxios.onPost('http://localhost:8000/askllm').reply(200, { answer: 'Hello test user' });

    await simulateLogin('testUser', 'testPassword');

  });

  // Prueba 2: Verifica el login fallido
  it('Test 2: should handle error when logging in', async () => {
    renderLoginComponent();

    // Mock the axios.post request to simulate an error response
    mockAxios.onPost('http://localhost:8000/login').reply(401, { error: 'Por favor, proporciona una dirección de correo electrónico y una contraseña válidas.' });

    await simulateLogin('testUser', 'wrongPassword');

    // Wait for the error Snackbar to be open
    await waitFor(() => {
      const errorAlert = screen.queryAllByRole('alert').find((el) =>
        el.textContent?.includes('revisa tu usuario y contraseña') ||
        el.textContent?.includes('correo electrónico y una contraseña válidas')
      );
      expect(errorAlert).toBeTruthy();
    });

    // Verify that the user information is not displayed
    expect(screen.queryByText(/Hello testUser!/i)).toBeNull();
    expect(screen.queryByText(/Your account was created on/i)).toBeNull();
  });

  // Prueba 3: Validación de renderizado general y estados iniciales
  it('Test 3: should render all input fields and login button', () => {
    renderLoginComponent();

    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  // Prueba 4: Validación de mostrar/ocultar contraseña
  it('Test 4: should toggle password visibility', () => {
    renderLoginComponent();

    const passwordInput = screen.getByLabelText(/Password/i);
    const toggleButton = screen.getByRole('button', { name: '' });

    // Verifica que la contraseña esté oculta inicialmente
    expect(passwordInput).toHaveAttribute('type', 'password');

    // Simula el clic en el botón de mostrar/ocultar contraseña
    fireEvent.click(toggleButton);

    // Verifica que la contraseña se muestre
    expect(passwordInput).toHaveAttribute('type', 'text');
  });

  // Prueba 5: Verifica el deshabilitado del botón de login durante la carga
  it('Test 5: should disable login button when loading', () => {
    mockAxios.onPost('http://localhost:8000/login').reply(() => {
      return new Promise(resolve => {
        setTimeout(() => resolve([200, { createdAt: '2024-01-01T12:34:56Z' }]), 1000);
      });
    });

    renderLoginComponent();

    const usernameInput = screen.getByLabelText(/Username/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const loginButton = screen.getByRole('button', { name: /Login/i });

    fireEvent.change(usernameInput, { target: { value: 'testUser' } });
    fireEvent.change(passwordInput, { target: { value: 'testPassword' } });
    fireEvent.click(loginButton);

    // Verifica que el botón esté deshabilitado
    expect(loginButton).toBeDisabled();
  });

  // Prueba 6: Verifica la cobertura de navegacion
  it('Test 6: should navigate to home after successful login', async () => {
    renderLoginComponent();

    mockAxios.onPost('http://localhost:8000/login').reply(200, { createdAt: '2024-01-01T12:34:56Z' });

    await simulateLogin('testUser', 'testPassword');

    await waitFor(() => {
      // Verifica que el usuario haya sido guardado en localStorage
      expect(mockNavigate).toHaveBeenCalledTimes(1);
      // Verifica que la navegación se haya realizado a la ruta correcta
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });
  });

  // Prueba 7: Verifica el manejo de campos vacíos
  it('Test 7: should not allow login with empty fields', async () => {
    renderLoginComponent();

    const loginButton = screen.getByRole('button', { name: /Login/i });

    fireEvent.click(loginButton);

    // Espera que el mensaje de error aparezca en el DOM
    await waitFor(() => {
      const errorAlert = screen.queryAllByRole('alert').find((el) =>
        el.textContent?.includes('Por favor completa todos los campos')
      );
      expect(errorAlert).toBeTruthy();
    });

    // Asegura que axios.post no fue llamado
    expect(mockAxios.history.post.length).toBe(0);
  });

  // Prueba 8: Limpieza de errores previos
  it('Test 8: should clear error after successful login', async () => {
    renderLoginComponent();
    
    const usernameInput = screen.getByLabelText(/Username/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const loginButton = screen.getByRole('button', { name: /Login/i });

    // Simula un error de login
    mockAxios.onPost('http://localhost:8000/login').reply(401, { error: 'Por favor, revisa tu usuario y contraseña.' });

    fireEvent.change(usernameInput, { target: { value: 'testUser' } });
    fireEvent.change(passwordInput, { target: { value: 'wrong pass' } });
    fireEvent.click(loginButton);

    // Espera que el mensaje de error aparezca en el DOM
    await waitFor(() => {
      const errorAlert = screen.queryAllByRole('alert').find((el) =>
        el.textContent?.includes('revisa tu usuario y contraseña')
      );
      expect(errorAlert).toBeTruthy();
    });

    // Simula un login exitoso
    mockAxios.onPost('http://localhost:8000/login').reply(200, { createdAt: '2024-01-01T12:34:56Z' });

    fireEvent.change(usernameInput, { target: { value: 'testUser' } });
    fireEvent.change(passwordInput, { target: { value: 'correctPass' } });
    fireEvent.click(loginButton);

    // Espera que el mensaje de error no esté presente en el DOM
    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledTimes(1);
      expect(mockNavigate).toHaveBeenCalledWith('/home');
    });

    // Verifica que el error haya sido limpiado
    expect(screen.queryByText(/revisa tu usuario y contraseña/i)).toBeNull();
  });



});

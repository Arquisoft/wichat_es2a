import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import EditProfile from './EditProfile';
import axios from 'axios';
import { MemoryRouter } from 'react-router-dom';

// Mocks
jest.mock('axios');
jest.mock('jwt-decode', () => ({
  jwtDecode: () => ({ userId: '123' }),
}));
jest.mock('./AvatarEditor', () => () => <div data-testid="avatar-editor">Avatar Editor</div>);

// Mock de navigate
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('EditProfile', () => {
  beforeEach(() => {
    // Simula usuario logueado
    localStorage.setItem('user', JSON.stringify({ token: 'fake.jwt.token' }));

    axios.get.mockResolvedValue({
      data: {
        username: 'nati',
        avatarOptions: {
          hairColor: '000000',
          eyes: 'cheery',
          hair: 'shortHair',
          mouth: 'teethSmile',
          skinColor: 'efcc9f'
        }
      }
    });

    axios.put.mockResolvedValue({});
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('carga el perfil, permite editar y guardar', async () => {
    render(
      <MemoryRouter>
        <EditProfile />
      </MemoryRouter>
    );

    // Espera a que cargue el nombre
    expect(await screen.findByDisplayValue('nati')).toBeInTheDocument();
    expect(screen.getByTestId('avatar-editor')).toBeInTheDocument();

    // Cambia el nombre
    fireEvent.change(screen.getByLabelText(/nombre de usuario/i), {
      target: { value: 'natalia' }
    });

    // Click en guardar
    fireEvent.click(screen.getByRole('button', { name: /guardar cambios/i }));

    await waitFor(() => {
      expect(axios.put).toHaveBeenCalledWith(
        expect.stringContaining('/users/123'),
        expect.objectContaining({ username: 'natalia' })
      );
    });
  });
});

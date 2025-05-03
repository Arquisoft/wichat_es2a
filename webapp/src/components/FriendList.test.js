import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FriendList from './FriendList';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';

// Mockear axios y navigate
jest.mock('axios');
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockedNavigate,
}));

const mockUser = {
  username: 'testuser',
};

const mockFriends = [
  {
    _id: '1',
    username: 'amigo1',
    avatarOptions: {
      hair: 'short',
      eyes: 'happy',
      mouth: 'smile',
      hairColor: 'black',
      skinColor: 'light',
    },
  },
];

const mockGameStats = [
  { createdAt: '2024-04-01T12:00:00Z' },
  { createdAt: '2024-03-15T10:00:00Z' },
];

describe('FriendList component', () => {
  beforeEach(() => {
    axios.get.mockResolvedValue({ data: mockGameStats });
  });

  const renderComponent = () =>
    render(
      <BrowserRouter>
        <FriendList friends={mockFriends} user={mockUser} />
      </BrowserRouter>
    );

  test('renderiza correctamente los amigos', async () => {
    renderComponent();
    expect(screen.getByText(/Lista de Amigos/i)).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.getByText(/amigo1/i)).toBeInTheDocument();
      expect(screen.getByText(/Última partida/i)).toBeInTheDocument();
    });
  });

  test('navega al historial al hacer click en el botón de historial', async () => {
    renderComponent();
    const historyButton = await screen.findByLabelText(/Historial de amigo1/i);
    fireEvent.click(historyButton);
    expect(mockedNavigate).toHaveBeenCalledWith('/gamehistory/amigo1');
  });

  test('navega al chat al hacer click en el botón de chat', async () => {
    renderComponent();
    const chatButton = await screen.findByLabelText(/Chat con amigo1/i);
    fireEvent.click(chatButton);
    expect(mockedNavigate).toHaveBeenCalledWith('/chat/amigo1');
  });

  test('abre y cierra el diálogo de confirmación de eliminación', async () => {
    renderComponent();
    const deleteButton = await screen.findByLabelText(/Eliminar amigo/i);
    fireEvent.click(deleteButton);
    expect(screen.getByText(/¿Estás seguro de que deseas eliminar a amigo1/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Cancelar/i));
    await waitFor(() => {
      expect(screen.queryByText(/¿Estás seguro de que deseas eliminar/i)).not.toBeInTheDocument();
    });
  });

  test('confirma eliminación de amigo y hace la petición', async () => {
    axios.post.mockResolvedValue({ data: { message: 'Eliminado' } });
    renderComponent();
  
    const deleteButton = await screen.findByLabelText(/Eliminar amigo/i);
    fireEvent.click(deleteButton);
  
    const confirmButton = screen.getByRole('button', { name: /Eliminar/i });
    fireEvent.click(confirmButton);
  
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(expect.stringContaining('/removeFriend'), {
        username: 'testuser',
        friendUsername: 'amigo1',
      });
    });
  });
  
});

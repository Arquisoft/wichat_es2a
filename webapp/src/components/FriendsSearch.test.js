import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import FriendSearch from './FriendSearch';
import axios from 'axios';

jest.mock('axios');

describe('FriendSearch Component', () => {
  const mockOnAddFriend = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renderiza correctamente los elementos básicos', () => {
    render(<FriendSearch onAddFriend={mockOnAddFriend} />);
    expect(screen.getByText(/Añadir Amigo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Nombre de usuario del amigo/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Añadir/i })).toBeInTheDocument();
  });

  test('actualiza el campo de texto y realiza búsqueda', async () => {
    const mockResults = [{ _id: '1', username: 'amigo1' }];
    axios.get.mockResolvedValueOnce({ data: mockResults });

    render(<FriendSearch onAddFriend={mockOnAddFriend} />);

    const input = screen.getByLabelText(/Nombre de usuario del amigo/i);
    fireEvent.change(input, { target: { value: 'amigo' } });

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining('/searchUsers?query=amigo'));
      expect(screen.getByText('amigo1')).toBeInTheDocument();
    });
  });

  test('limpia resultados cuando el campo queda vacío', async () => {
    axios.get.mockResolvedValueOnce({ data: [{ _id: '1', username: 'amigo1' }] });

    render(<FriendSearch onAddFriend={mockOnAddFriend} />);
    const input = screen.getByLabelText(/Nombre de usuario del amigo/i);

    fireEvent.change(input, { target: { value: 'amigo' } });
    await waitFor(() => expect(screen.getByText('amigo1')).toBeInTheDocument());

    fireEvent.change(input, { target: { value: '' } });
    await waitFor(() => expect(screen.queryByText('amigo1')).not.toBeInTheDocument());
  });

  test('selecciona un usuario de los resultados y lo pone en el campo', async () => {
    const mockResults = [{ _id: '1', username: 'amigo1' }];
    axios.get.mockResolvedValueOnce({ data: mockResults });

    render(<FriendSearch onAddFriend={mockOnAddFriend} />);
    const input = screen.getByLabelText(/Nombre de usuario del amigo/i);
    fireEvent.change(input, { target: { value: 'amigo' } });

    await waitFor(() => {
      const resultItem = screen.getByText('amigo1');
      fireEvent.click(resultItem);
      expect(input.value).toBe('amigo1');
    });
  });

  test('hace llamada a onAddFriend al pulsar Añadir', () => {
    render(<FriendSearch onAddFriend={mockOnAddFriend} />);
    const input = screen.getByLabelText(/Nombre de usuario del amigo/i);
    const addButton = screen.getByRole('button', { name: /Añadir/i });

    fireEvent.change(input, { target: { value: 'nuevoamigo' } });
    fireEvent.click(addButton);

    expect(mockOnAddFriend).toHaveBeenCalledWith('nuevoamigo');
    expect(input.value).toBe('');
  });
});

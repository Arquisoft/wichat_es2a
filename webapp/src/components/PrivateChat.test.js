import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import PrivateChat from './PrivateChat';
import axios from 'axios';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import '@testing-library/jest-dom';

jest.mock('axios');
window.HTMLElement.prototype.scrollIntoView = jest.fn();

describe('PrivateChat', () => {
  const mockUser = { username: 'testuser' };
  const mockFriend = { username: 'friend' };
  const mockMessages = [
    { _id: '1', sender: { username: 'testuser' }, content: 'Hola' },
    { _id: '2', sender: { username: 'friend' }, content: 'Hola testuser' },
  ];

  beforeEach(() => {
    localStorage.setItem('user', JSON.stringify(mockUser));
    jest.clearAllMocks();
  });

  test('Test 1: renderiza el componente correctamente', async () => {
    // Mocks para IDs y mensajes
    axios.get
      .mockResolvedValueOnce({ data: { userId: '1' } }) // user ID
      .mockResolvedValueOnce({ data: { userId: '2' } }) // friend ID
      .mockResolvedValueOnce({ data: mockMessages });   // mensajes

    render(
      <MemoryRouter initialEntries={['/chat/friend']}>
        <Routes>
          <Route path="/chat/:friendUsername" element={<PrivateChat />} />
        </Routes>
      </MemoryRouter>
    );

    expect(await screen.findByText('Chat con friend')).toBeInTheDocument();
    expect(await screen.findByText('Hola')).toBeInTheDocument();
    expect(await screen.findByText('Hola testuser')).toBeInTheDocument();
  });

  test('Test 2: muestra los mensajes en orden correcto', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { userId: '1' } }) // user ID
      .mockResolvedValueOnce({ data: { userId: '2' } }) // friend ID
      .mockResolvedValueOnce({
        data: [
          { _id: '1', sender: { username: 'testuser' }, content: 'Mensaje 1' },
          { _id: '2', sender: { username: 'friend' }, content: 'Mensaje 2' },
        ],
      });
  
    render(
      <MemoryRouter initialEntries={['/chat/friend']}>
        <Routes>
          <Route path="/chat/:friendUsername" element={<PrivateChat />} />
        </Routes>
      </MemoryRouter>
    );
  
    const msg1 = await screen.findByText('Mensaje 1');
    const msg2 = await screen.findByText('Mensaje 2');
  
    expect(msg1).toBeInTheDocument();
    expect(msg2).toBeInTheDocument();
  });

  test('Test 3: permite enviar un mensaje', async () => {
    // Mock de mensajes iniciales
    axios.get
      .mockResolvedValueOnce({ data: { userId: '1' } }) // user ID
      .mockResolvedValueOnce({ data: { userId: '2' } }) // friend ID
      .mockResolvedValueOnce({ data: [] }); // mensajes vacíos
  
    axios.post.mockResolvedValueOnce({}); // mock del POST
    axios.get.mockResolvedValueOnce({ data: [] }); // fetchMessages después de enviar
  
    render(
      <MemoryRouter initialEntries={['/chat/friend']}>
        <Routes>
          <Route path="/chat/:friendUsername" element={<PrivateChat />} />
        </Routes>
      </MemoryRouter>
    );
  
    const input = screen.getByLabelText('Mensaje');
    const sendButton = screen.getByRole('button', { name: /Enviar/i });
  
    fireEvent.change(input, { target: { value: 'Hola amigo' } });
    fireEvent.click(sendButton);
  
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/sendPrivateMessage'),
        {
          senderUsername: 'testuser',
          receiverUsername: 'friend',
          content: 'Hola amigo',
        }
      );
    });
  });

  test('Test 4: no permite enviar mensaje vacío', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { userId: '1' } }) // user ID
      .mockResolvedValueOnce({ data: { userId: '2' } }) // friend ID
      .mockResolvedValueOnce({ data: [] });
  
    render(
      <MemoryRouter initialEntries={['/chat/friend']}>
        <Routes>
          <Route path="/chat/:friendUsername" element={<PrivateChat />} />
        </Routes>
      </MemoryRouter>
    );
  
    const sendButton = screen.getByRole('button', { name: /enviar/i });
  
    fireEvent.click(sendButton);
  
    await waitFor(() => {
      expect(axios.post).not.toHaveBeenCalled();
    });
  });
  
  test('Test 5: permite enviar mensaje con tecla Enter', async () => {
    axios.get
      .mockResolvedValueOnce({ data: { userId: '1' } })
      .mockResolvedValueOnce({ data: { userId: '2' } })
      .mockResolvedValueOnce({ data: [] });
  
    axios.post.mockResolvedValueOnce({});
    axios.get.mockResolvedValueOnce({ data: [] });
  
    render(
      <MemoryRouter initialEntries={['/chat/friend']}>
        <Routes>
          <Route path="/chat/:friendUsername" element={<PrivateChat />} />
        </Routes>
      </MemoryRouter>
    );
  
    const input = screen.getByLabelText('Mensaje');
  
    fireEvent.change(input, { target: { value: 'Desde Enter' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });
  
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({ content: 'Desde Enter' })
      );
    });
  });
  
  test('Test 6: muestra error en consola si falla fetchMessages', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    axios.get.mockRejectedValueOnce(new Error('Error de red')); // primer fetch de userId
    render(
      <MemoryRouter initialEntries={['/chat/friend']}>
        <Routes>
          <Route path="/chat/:friendUsername" element={<PrivateChat />} />
        </Routes>
      </MemoryRouter>
    );
  
    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining('Error al obtener mensajes privados:'),
        expect.any(Error)
      );
    });
  
    consoleErrorSpy.mockRestore();
  });
  
  
  
});

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import axios from 'axios';
import GroupChat from './GroupChat';

jest.mock('axios');

const mockMessages = [
  {
    _id: '1',
    username: 'alice',
    message: 'Hola grupo',
    createdAt: new Date('2025-05-01T12:00:00Z').toISOString(),
  },
  {
    _id: '2',
    username: 'bob',
    message: '¡Hola Alice!',
    createdAt: new Date('2025-05-01T12:01:00Z').toISOString(),
  },
];

describe('GroupChat', () => {
  let originalScrollIntoView;
  beforeAll(() => {
    originalScrollIntoView = Object.getOwnPropertyDescriptor(window.HTMLElement.prototype, 'scrollIntoView');
    Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
      configurable: true,
      writable: true,
      value: jest.fn(),
    });
  });
  afterAll(() => {
    if (originalScrollIntoView) {
      Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', originalScrollIntoView);
    } else {
      delete window.HTMLElement.prototype.scrollIntoView;
    }
  });
  beforeEach(() => {
    jest.clearAllMocks();
    const userObj = {
      userId: '507f1f77bcf86cd799439011',
      username: 'alice',
    };
    const payload = {
      userId: '507f1f77bcf86cd799439011',
      username: 'alice',
    };
    const fakeToken = [
      btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' })),
      btoa(JSON.stringify(payload)),
      'signature'
    ].join('.');
    window.localStorage.setItem('user', JSON.stringify({
      token: fakeToken,
      username: 'alice',
    }));
  });

  it('renders loading state if no groupName', () => {
    render(<GroupChat groupName={null} />);
    expect(screen.getByText(/Cargando chat del grupo/i)).toBeInTheDocument();
  });

  it('fetches and displays messages', async () => {
    axios.get.mockResolvedValueOnce({ data: mockMessages });
    render(<GroupChat groupName="TestGroup" />);
    await waitFor(() => {
      expect(screen.getByText('Hola grupo')).toBeInTheDocument();
      expect(screen.getByText('¡Hola Alice!')).toBeInTheDocument();
      expect(screen.getByText('alice')).toBeInTheDocument();
      expect(screen.getByText('bob')).toBeInTheDocument();
    });
  });

  it('shows error if messages cannot be loaded', async () => {
    axios.get.mockRejectedValueOnce(new Error('fail'));
    render(<GroupChat groupName="TestGroup" />);
    await waitFor(() => {
      expect(screen.getByText(/No se pudieron cargar los mensajes/i)).toBeInTheDocument();
    });
  });

  it('sends a message and clears input', async () => {
    axios.get.mockResolvedValueOnce({ data: mockMessages });
    axios.post.mockResolvedValueOnce({});
    render(<GroupChat groupName="TestGroup" />);
    await waitFor(() => expect(screen.getByText('Hola grupo')).toBeInTheDocument());
    const input = screen.getByPlaceholderText(/Escribe un mensaje/i);
    fireEvent.change(input, { target: { value: 'Nuevo mensaje' } });
    const sendBtn = screen.getByRole('button', { name: /Enviar mensaje/i });
    fireEvent.click(sendBtn);
    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/group/sendMessage'),
        expect.objectContaining({ groupName: 'TestGroup', username: 'alice', message: 'Nuevo mensaje' })
      );
      expect(screen.getByPlaceholderText(/Escribe un mensaje/i).value).toBe('');
    });
  });

  it('does not send empty messages', async () => {
    axios.get.mockResolvedValueOnce({ data: mockMessages });
    render(<GroupChat groupName="TestGroup" />);
    await waitFor(() => expect(screen.getByText('Hola grupo')).toBeInTheDocument());
    const input = screen.getByPlaceholderText(/Escribe un mensaje/i);
    fireEvent.change(input, { target: { value: '   ' } });
    const sendBtn = screen.getByRole('button', { name: /Enviar mensaje/i });
    fireEvent.click(sendBtn);
    expect(axios.post).not.toHaveBeenCalled();
  });

  it('shows error if sending message fails', async () => {
    axios.get.mockResolvedValueOnce({ data: mockMessages });
    axios.post.mockRejectedValueOnce(new Error('fail'));
    render(<GroupChat groupName="TestGroup" />);
    await waitFor(() => expect(screen.getByText('Hola grupo')).toBeInTheDocument());
    const input = screen.getByPlaceholderText(/Escribe un mensaje/i);
    fireEvent.change(input, { target: { value: 'Fallo' } });
    const sendBtn = screen.getByRole('button', { name: /Enviar mensaje/i });
    fireEvent.click(sendBtn);
    await waitFor(() => {
      expect(screen.getByText(/No se pudo enviar el mensaje/i)).toBeInTheDocument();
    });
  });

  it('calls onClose when close button is clicked', async () => {
    axios.get.mockResolvedValueOnce({ data: mockMessages });
    const onClose = jest.fn();
    render(<GroupChat groupName="TestGroup" onClose={onClose} />);
    await waitFor(() => expect(screen.getByText('Hola grupo')).toBeInTheDocument());
    const closeBtn = screen.getByLabelText(/Cerrar chat/i);
    fireEvent.click(closeBtn);
    expect(onClose).toHaveBeenCalled();
  });

  it('scrolls to bottom when new messages arrive', async () => {
    axios.get.mockResolvedValueOnce({ data: mockMessages });
    render(<GroupChat groupName="TestGroup" />);
    await waitFor(() => expect(screen.getByText('Hola grupo')).toBeInTheDocument());
    expect(window.HTMLElement.prototype.scrollIntoView).toHaveBeenCalled();
  });
});

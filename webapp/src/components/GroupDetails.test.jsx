import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import GroupDetails from './GroupDetails';
import axios from 'axios';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

jest.mock('axios');

jest.mock('./GroupChat', () => ({ groupName, onClose }) => (
  <div data-testid="group-chat">
    Chat de grupo: {groupName}
    <button onClick={onClose}>Cerrar chat</button>
  </div>
));

const mockUsers = [
  { username: 'alice', role: 'admin' },
  { username: 'bob', role: 'user' },
];

const renderWithRouter = (groupName = 'testgroup') => {
  return render(
    <MemoryRouter initialEntries={[`/group/${groupName}`]}>
      <Routes>
        <Route path="/group/:groupName" element={<GroupDetails />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('GroupDetails', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows loading state', () => {
    axios.get.mockReturnValue(new Promise(() => {}));
    renderWithRouter();
    expect(screen.getByText(/Cargando usuarios/i)).toBeInTheDocument();
    expect(screen.getByRole('progressbar')).toBeInTheDocument();
  });

  it('shows error if request fails', async () => {
    axios.get.mockRejectedValueOnce(new Error('fail'));
    renderWithRouter();
    await waitFor(() => {
      expect(screen.getByText(/Error al cargar los usuarios del grupo/i)).toBeInTheDocument();
    });
  });

  it('shows the list of users and roles', async () => {
    axios.get.mockResolvedValueOnce({ data: { users: mockUsers } });
    renderWithRouter();
    await waitFor(() => {
      expect(screen.getByText('alice')).toBeInTheDocument();
      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByText('bob')).toBeInTheDocument();
      expect(screen.getByText('User')).toBeInTheDocument();
    });
  });

  it('navigates to user history when clicking a user', async () => {
    axios.get.mockResolvedValueOnce({ data: { users: mockUsers } });
    renderWithRouter();
    await waitFor(() => {
      expect(screen.getByText('alice')).toBeInTheDocument();
    });
    const firstUser = screen.getByText('alice');
    fireEvent.click(firstUser);
  });

  it('shows the group name in the header', async () => {
    axios.get.mockResolvedValueOnce({ data: { users: mockUsers } });
    renderWithRouter('grupoPrueba');
    await waitFor(() => {
      expect(screen.getByText(/Grupo: grupoPrueba/i)).toBeInTheDocument();
    });
  });

  it('shows and hides the group chat when clicking the button', async () => {
    axios.get.mockResolvedValueOnce({ data: { users: mockUsers } });
    renderWithRouter();
    await waitFor(() => {
      expect(screen.getByText('Abrir chat')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Abrir chat'));
    expect(screen.getByTestId('group-chat')).toBeInTheDocument();
    expect(screen.getByText(/Chat de grupo/i)).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('group-chat').querySelector('button'));
    await waitFor(() => {
      expect(screen.queryByTestId('group-chat')).not.toBeInTheDocument();
    });
  });

  it('chat button changes text according to state', async () => {
    axios.get.mockResolvedValueOnce({ data: { users: mockUsers } });
    renderWithRouter();
    await waitFor(() => {
      expect(screen.getByText('Abrir chat')).toBeInTheDocument();
    });
    fireEvent.click(screen.getByText('Abrir chat'));
    expect(screen.getAllByText('Cerrar chat').length).toBeGreaterThan(0);
  });

  it('renders correctly with an empty user list', async () => {
    axios.get.mockResolvedValueOnce({ data: { users: [] } });
    renderWithRouter();
    await waitFor(() => {
      expect(screen.queryAllByRole('listitem').length).toBe(0);
    });
  });
});

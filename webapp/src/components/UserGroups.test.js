import React from 'react';
import { render, screen, fireEvent, waitFor, waitForElementToBeRemoved } from '@testing-library/react';
import UserGroups from './UserGroups';
import { MemoryRouter } from 'react-router-dom';
import axios from 'axios';

jest.mock('axios');

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

const mockUser = {
  token: btoa(JSON.stringify({})) + '.' + btoa(JSON.stringify({ userId: '123' })) + '.signature',
  username: 'testuser'
};

describe('UserGroups Component', () => {
  beforeEach(() => {
    localStorage.setItem('user', JSON.stringify(mockUser));
  });

  afterEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('renders loading state initially', () => {
    render(<UserGroups />, { wrapper: MemoryRouter });
    expect(screen.getByText(/Cargando grupos/i)).toBeInTheDocument();
  });

  test('renders empty group state if no groups found', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });

    render(<UserGroups />, { wrapper: MemoryRouter });

    await waitForElementToBeRemoved(() => screen.getByText(/Cargando grupos/i));

    expect(screen.getByText(/No perteneces a ningún grupo/i)).toBeInTheDocument();
  });

  test('renders groups correctly when fetched', async () => {
    axios.get.mockResolvedValueOnce({
      data: [
        { _id: '1', groupName: 'Grupo A', role: 'admin' },
        { _id: '2', groupName: 'Grupo B', role: 'member' }
      ]
    });

    render(<UserGroups />, { wrapper: MemoryRouter });

    await waitForElementToBeRemoved(() => screen.getByText(/Cargando grupos/i));

    expect(screen.getByText('Grupo A')).toBeInTheDocument();
    expect(screen.getByText('Grupo B')).toBeInTheDocument();
    expect(screen.getAllByText(/Admin|Member/i)).toHaveLength(2);
  });

  test('opens and closes create dialog', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });

    render(<UserGroups />, { wrapper: MemoryRouter });

    await waitForElementToBeRemoved(() => screen.getByText(/Cargando grupos/i));

    fireEvent.click(screen.getByText(/Crear Grupo/i));
    expect(screen.getByText(/Crear Nuevo Grupo/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Cancelar/i));
    await waitForElementToBeRemoved(() => screen.queryByText(/Crear Nuevo Grupo/i));

  });

  test('opens and closes join dialog', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });

    render(<UserGroups />, { wrapper: MemoryRouter });

    await waitForElementToBeRemoved(() => screen.getByText(/Cargando grupos/i));

    fireEvent.click(screen.getByText(/Unirse a Grupo/i));
    expect(screen.getByText(/Unirse a un Grupo/i)).toBeInTheDocument();

    fireEvent.click(screen.getByText(/Cancelar/i));
    await waitForElementToBeRemoved(() => screen.queryByText(/Unirse a un Grupo/i));

  });

  test('creates group successfully', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    axios.post.mockResolvedValueOnce({});

    render(<UserGroups />, { wrapper: MemoryRouter });

    await waitForElementToBeRemoved(() => screen.getByText(/Cargando grupos/i));

    fireEvent.click(screen.getByText(/Crear Grupo/i));
    fireEvent.change(screen.getByLabelText(/Nombre del Grupo/i), {
      target: { value: 'NuevoGrupo' }
    });

    fireEvent.click(screen.getByText(/^Crear$/));

    await waitFor(() =>
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/group/createGroup'),
        expect.objectContaining({ groupName: 'NuevoGrupo' })
      )
    );
  });

  test('joins group successfully', async () => {
    axios.get.mockResolvedValueOnce({ data: [] });
    axios.post.mockResolvedValueOnce({});

    render(<UserGroups />, { wrapper: MemoryRouter });

    await waitForElementToBeRemoved(() => screen.getByText(/Cargando grupos/i));

    fireEvent.click(screen.getByText(/Unirse a Grupo/i));
    fireEvent.change(screen.getByLabelText(/Nombre del Grupo/i), {
      target: { value: 'GrupoX' }
    });

    fireEvent.click(screen.getByText(/^Unirse$/));

    await waitFor(() =>
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('/group/addUserToGroup'),
        expect.objectContaining({ groupName: 'GrupoX' })
      )
    );
  });

  test('navigates to group on click', async () => {
    axios.get.mockResolvedValueOnce({
      data: [{ _id: '1', groupName: 'GrupoTest', role: 'member' }]
    });

    render(<UserGroups />, { wrapper: MemoryRouter });

    await waitForElementToBeRemoved(() => screen.getByText(/Cargando grupos/i));

    fireEvent.click(screen.getByText('GrupoTest'));

    expect(mockNavigate).toHaveBeenCalledWith('/groups/GrupoTest');
  });
});

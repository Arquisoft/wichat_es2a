const React = require('react');
const { render, screen, waitFor, fireEvent } = require('@testing-library/react');
const { MemoryRouter, Route, Routes } = require('react-router-dom');
const axios = require('axios');
const GameHistoryUIGroup = require('./GameHistoryUIGroup').default;

jest.mock('axios');

const axiosInstance = axios.default || axios;

function renderWithRouter(username) {
    return render(
        React.createElement(MemoryRouter, { initialEntries: [`/gamehistorygroup/${username}`] },
            React.createElement(Routes, {},
                React.createElement(Route, { path: '/gamehistorygroup/:username', element: React.createElement(GameHistoryUIGroup) })
            )
        )
    );
}

describe('GameHistoryUIGroup', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('shows loading state correctly', async () => {
        axiosInstance.get.mockReturnValue(new Promise(() => {}));
        renderWithRouter('testuser');
        expect(screen.getByText(/Cargando historial de partidas/i)).toBeTruthy();
        expect(screen.getByRole('progressbar')).toBeTruthy();
    });

    it('shows error if username is missing', async () => {
        renderWithRouter(undefined);
        await waitFor(() => {
            expect(screen.getByText(/No se pudo obtener el ID del usuario/i)).toBeTruthy();
        });
    });

    it('shows error if userId API fails', async () => {
        axiosInstance.get.mockRejectedValueOnce(new Error('fail'));
        renderWithRouter('testuser');
        await waitFor(() => {
            expect(screen.getByText(/No se pudo obtener el ID del usuario/i)).toBeTruthy();
        });
    });

    it('shows error if gameHistory API fails', async () => {
        axiosInstance.get
            .mockResolvedValueOnce({ data: { userId: '123' } })
            .mockRejectedValueOnce(new Error('fail'));
        renderWithRouter('testuser');
        await waitFor(() => {
            expect(screen.getByText(/No se pudo cargar el historial de partidas/i)).toBeTruthy();
        });
    });

    it('shows message if there are no games', async () => {
        axiosInstance.get
            .mockResolvedValueOnce({ data: { userId: '123' } })
            .mockResolvedValueOnce({ data: [] });
        renderWithRouter('testuser');
        await waitFor(() => {
            expect(screen.getByText(/No hay partidas registradas/i)).toBeTruthy();
        });
    });

    it('renders table if there are games', async () => {
        axiosInstance.get
            .mockResolvedValueOnce({ data: { userId: '123' } })
            .mockResolvedValueOnce({ data: [{ id: 1, winner: 'A', date: '2024-01-01' }] });
        renderWithRouter('testuser');
        await waitFor(() => {
            expect(screen.getByText(/Volver a Detalles del Grupo/i)).toBeTruthy();
        });
        expect(screen.queryByText(/No hay partidas registradas/i)).toBeNull();
    });

    it('back button triggers navigation', async () => {
        axiosInstance.get
            .mockResolvedValueOnce({ data: { userId: '123' } })
            .mockResolvedValueOnce({ data: [] });
        renderWithRouter('testuser');
        await waitFor(() => {
            expect(screen.getByText(/Volver a Detalles del Grupo/i)).toBeTruthy();
        });
        fireEvent.click(screen.getByText(/Volver a Detalles del Grupo/i));
    });
});

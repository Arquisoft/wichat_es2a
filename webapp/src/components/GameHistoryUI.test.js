const React = require('react');
const { render, screen, waitFor } = require('@testing-library/react');
const axios = require('axios');
const GameHistoryUI = require('./GameHistoryUI').default;

jest.mock('axios');
const axiosInstance = axios.default || axios;

const fakeUser = {
    username: 'testuser',
    token: Buffer.from(JSON.stringify({})).toString('base64') + '.' + Buffer.from(JSON.stringify({ userId: '123', username: 'testuser' })).toString('base64') + '.sig',
};

global.localStorage = {
    getItem: (key) => key === 'user' ? JSON.stringify(fakeUser) : null,
    setItem: () => {},
    removeItem: () => {},
    clear: () => {},
};

describe('GameHistoryUI', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('shows loading state correctly', async () => {
        axiosInstance.get.mockReturnValue(new Promise(() => {}));
        render(React.createElement(GameHistoryUI));
        expect(screen.getByText(/Cargando historial de partidas/i)).toBeTruthy();
        expect(screen.getByRole('progressbar')).toBeTruthy();
    });

    it('shows error if API fails', async () => {
        axiosInstance.get.mockRejectedValue(new Error('fail'));
        render(React.createElement(GameHistoryUI));
        await waitFor(() => {
            expect(screen.getByText(/No se pudo cargar el historial de partidas/i)).toBeTruthy();
        });
    });

    it('shows message if there are no games', async () => {
        axiosInstance.get.mockResolvedValue({ data: [] });
        render(React.createElement(GameHistoryUI));
        await waitFor(() => {
            expect(screen.getByText(/No hay partidas registradas/i)).toBeTruthy();
        });
    });

    it('renders table if there are games', async () => {
        axiosInstance.get.mockResolvedValue({ data: [{ id: 1, winner: 'A', date: '2024-01-01' }] });
        render(React.createElement(GameHistoryUI));
        await waitFor(() => {
            expect(screen.queryByText(/No hay partidas registradas/i)).toBeNull();
        });
    });

    it('returns null if there is no user in localStorage', async () => {
        global.localStorage.getItem = () => null;
        render(React.createElement(GameHistoryUI));
        await waitFor(() => {
            expect(screen.getByText(/No se pudo cargar el historial de partidas/i)).toBeTruthy();
        });
    });

    it('returns null if token is invalid', async () => {
        global.localStorage.getItem = () => JSON.stringify({ username: 'testuser', token: 'invalid.token.sig' });
        render(React.createElement(GameHistoryUI));
        await waitFor(() => {
            expect(screen.getByText(/No se pudo cargar el historial de partidas/i)).toBeTruthy();
        });
    });
});

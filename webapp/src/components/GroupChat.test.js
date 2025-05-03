
const React = require('react');
const { render, screen, fireEvent, waitFor, act } = require('@testing-library/react');
const axios = require('axios');
const axiosInstance = axios.default || axios;
const GroupChat = require('./GroupChat').default;

jest.mock('axios');

beforeAll(() => {
    window.HTMLElement.prototype.scrollIntoView = function() {};
});

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

// --- Helpers ---
function mockAxiosGet(data, reject) {
    if (reject) {
        axiosInstance.get.mockRejectedValueOnce(reject instanceof Error ? reject : new Error(reject));
    } else {
        axiosInstance.get.mockResolvedValueOnce({ data });
    }
}

function mockAxiosPost(data, reject) {
    if (reject) {
        axiosInstance.post.mockRejectedValueOnce(reject instanceof Error ? reject : new Error(reject));
    } else {
        axiosInstance.post.mockResolvedValueOnce({ data });
    }
}

function renderGroupChat(props = {}) {
    return render(React.createElement(GroupChat, { groupName: 'grupo', onClose: jest.fn(), ...props }));
}

function changeInputAndSend(value) {
    fireEvent.change(screen.getByPlaceholderText(/Escribe un mensaje/i), { target: { value } });
    fireEvent.click(screen.getByLabelText(/Enviar mensaje/i));
}

describe('GroupChat', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('renders correctly if no user in localStorage', () => {
        const original = global.localStorage.getItem;
        global.localStorage.getItem = () => null;
        renderGroupChat();
        expect(screen.getByText(/Chat grupal/i)).toBeTruthy();
        global.localStorage.getItem = original;
    });

    it('does not send message if input is only spaces', async () => {
        mockAxiosGet([]);
        mockAxiosPost({});
        renderGroupChat();
        await waitFor(() => {
            expect(screen.getByPlaceholderText(/Escribe un mensaje/i)).toBeTruthy();
        });
        changeInputAndSend('   ');
        expect(axiosInstance.post).not.toHaveBeenCalled();
    });

    it('sends message with Enter key', async () => {
        mockAxiosGet([]);
        mockAxiosPost({});
        renderGroupChat();
        await waitFor(() => {
            expect(screen.getByPlaceholderText(/Escribe un mensaje/i)).toBeTruthy();
        });
        fireEvent.change(screen.getByPlaceholderText(/Escribe un mensaje/i), { target: { value: 'Hola Enter' } });
        fireEvent.keyDown(screen.getByPlaceholderText(/Escribe un mensaje/i), { key: 'Enter', code: 'Enter' });
        await waitFor(() => {
            expect(axiosInstance.post).toHaveBeenCalledWith(expect.stringContaining('/group/sendMessage'), expect.objectContaining({ message: 'Hola Enter' }));
        });
    });

    it('stops polling on unmount', async () => {
        jest.useFakeTimers();
        mockAxiosGet([]);
        const { unmount } = renderGroupChat();
        await waitFor(() => {
            expect(axiosInstance.get).toHaveBeenCalledTimes(1);
        });
        unmount();
        act(() => {
            jest.advanceTimersByTime(2000);
        });
        expect(axiosInstance.get).toHaveBeenCalledTimes(1);
        jest.useRealTimers();
    });

    it('does not poll if no groupName', async () => {
        jest.useFakeTimers();
        renderGroupChat({ groupName: '' });
        act(() => {
            jest.advanceTimersByTime(2000);
        });
        expect(axiosInstance.get).not.toHaveBeenCalled();
        jest.useRealTimers();
    });

    it('reloads messages when groupName changes', async () => {
        mockAxiosGet([{ _id: '1', username: 'testuser', message: 'Hola', createdAt: new Date().toISOString() }]);
        const { rerender } = renderGroupChat({ groupName: 'grupo1' });
        await waitFor(() => {
            expect(screen.getByText('Hola')).toBeTruthy();
        });
        mockAxiosGet([{ _id: '2', username: 'other', message: 'Cambio', createdAt: new Date().toISOString() }]);
        rerender(React.createElement(GroupChat, { groupName: 'grupo2', onClose: jest.fn() }));
        await waitFor(() => {
            expect(screen.getByText('Cambio')).toBeTruthy();
        });
    });


    it('renders correctly without groupName', () => {
        renderGroupChat({ groupName: '' });
        expect(screen.getByText(/Chat grupal/i)).toBeTruthy();
        expect(screen.getByText(/Cargando chat del grupo/i)).toBeTruthy();
    });


    it('renders messages correctly', async () => {
        mockAxiosGet([
            { _id: '1', username: 'testuser', message: 'Hola', createdAt: new Date().toISOString() },
            { _id: '2', username: 'other', message: 'Hey', createdAt: new Date().toISOString() }
        ]);
        renderGroupChat();
        await waitFor(() => {
            expect(screen.getByText('Hola')).toBeTruthy();
            expect(screen.getByText('Hey')).toBeTruthy();
            expect(screen.getAllByText('testuser').length).toBeGreaterThan(0);
        });
    });


    it('shows error if loading messages fails', async () => {
        mockAxiosGet(null, 'fail');
        renderGroupChat();
        await waitFor(() => {
            expect(screen.getByText(/No se pudieron cargar los mensajes/i)).toBeTruthy();
        });
    });


    it('sends message correctly', async () => {
        mockAxiosGet([]);
        mockAxiosPost({});
        renderGroupChat();
        await waitFor(() => {
            expect(screen.getByPlaceholderText(/Escribe un mensaje/i)).toBeTruthy();
        });
        changeInputAndSend('Nuevo mensaje');
        await waitFor(() => {
            expect(axiosInstance.post).toHaveBeenCalledWith(expect.stringContaining('/group/sendMessage'), expect.objectContaining({ message: 'Nuevo mensaje' }));
        });
    });


    it('shows error if sending message fails', async () => {
        mockAxiosGet([]);
        mockAxiosPost(null, 'fail');
        renderGroupChat();
        await waitFor(() => {
            expect(screen.getByPlaceholderText(/Escribe un mensaje/i)).toBeTruthy();
        });
        changeInputAndSend('fallo');
        await waitFor(() => {
            expect(screen.getByText(/No se pudo enviar el mensaje/i)).toBeTruthy();
        });
    });


    it('disables send button if input is empty or loading', async () => {
        mockAxiosGet([]);
        renderGroupChat();
        await waitFor(() => {
            expect(screen.getByLabelText(/Enviar mensaje/i)).toBeDisabled();
        });
        fireEvent.change(screen.getByPlaceholderText(/Escribe un mensaje/i), { target: { value: 'x' } });
        expect(screen.getByLabelText(/Enviar mensaje/i)).not.toBeDisabled();
    });


    it('calls onClose when close button is clicked', async () => {
        mockAxiosGet([]);
        const onClose = jest.fn();
        renderGroupChat({ onClose });
        await waitFor(() => {
            expect(screen.getByLabelText(/Cerrar chat/i)).toBeTruthy();
        });
        fireEvent.click(screen.getByLabelText(/Cerrar chat/i));
        expect(onClose).toHaveBeenCalled();
    });

    it('polls messages periodically', async () => {
        jest.useFakeTimers();
        mockAxiosGet([]);
        renderGroupChat();
        await waitFor(() => {
            expect(axiosInstance.get).toHaveBeenCalledTimes(1);
        });
        act(() => {
            jest.advanceTimersByTime(1000);
        });
        expect(axiosInstance.get).toHaveBeenCalledTimes(2);
        jest.useRealTimers();
    });
});
